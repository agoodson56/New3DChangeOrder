/**
 * Cloud sync per-scope endpoint.
 *
 *   PUT /api/data/:scope     — upsert blob for one scope
 *
 * See ../data.ts for the GET-all endpoint and full docs on auth / setup.
 */

import { verifyToken } from '../../lib/jwt';

interface Env {
  DB?: D1Database;
  JWT_SECRET?: string;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[] }>;
  run(): Promise<{ success: boolean; meta?: unknown }>;
}

type PagesContext<EnvT, Params extends Record<string, string> = Record<string, string>> = {
  request: Request;
  env: EnvT;
  params: Params;
};

// Sensitive multi-tenant data: never cached at edge or in shared corporate
// proxies. Without these headers, an intermediate cache could replay one
// coordinator's data to another.
const NO_STORE_HEADERS = {
  'Cache-Control': 'private, no-store, no-cache, max-age=0',
  'Pragma': 'no-cache',
  'X-Content-Type-Options': 'nosniff',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...NO_STORE_HEADERS },
  });

/** Generate a short opaque request id for correlating client errors with server logs. */
function requestId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

const KNOWN_SCOPES = ['history', 'customers', 'templates', 'rates'] as const;
const MAX_BLOB_BYTES = 5_000_000;

async function authContext(request: Request, secret: string): Promise<{ userId: number; email: string } | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  const payload = await verifyToken(token, secret);
  if (!payload) return null;

  return { userId: payload.userId, email: payload.email };
}

function isValidScope(scope: string): boolean {
  return (KNOWN_SCOPES as readonly string[]).includes(scope) || scope.startsWith('draft_');
}

export const onRequestPut = async ({ request, env, params }: PagesContext<Env, { scope?: string }>): Promise<Response> => {
  if (!env.DB || !env.JWT_SECRET) return json({ error: 'Server not configured.' }, 503);

  const auth = await authContext(request, env.JWT_SECRET);
  if (!auth) return json({ error: 'Unauthenticated.' }, 401);

  const scope = params.scope || '';
  if (!isValidScope(scope)) return json({ error: 'Unknown scope.' }, 400);

  let bodyText: string;
  try { bodyText = await request.text(); }
  catch { return json({ error: 'Could not read request body' }, 400); }

  if (bodyText.length > MAX_BLOB_BYTES) return json({ error: `Blob too large (max ${MAX_BLOB_BYTES} bytes)` }, 413);
  try { JSON.parse(bodyText); } catch { return json({ error: 'Body must be valid JSON' }, 400); }

  try {
    await env.DB
      .prepare(
        `INSERT INTO blobs (user_id, scope, content, updated_at, updated_by, org_id)
         VALUES (?, ?, ?, ?, ?, 'user')
         ON CONFLICT (org_id, scope) DO UPDATE SET
           content = excluded.content,
           updated_at = excluded.updated_at,
           updated_by = excluded.updated_by`
      )
      .bind(auth.userId, scope, bodyText, Date.now(), auth.email)
      .run();
    return json({ ok: true, scope, updatedAt: Date.now() });
  } catch (e) {
    const rid = requestId();
    console.error(`[data:PUT ${rid}] db write failed:`, e instanceof Error ? e.message : String(e));
    return json({ error: 'Database write failed.', requestId: rid }, 500);
  }
};
