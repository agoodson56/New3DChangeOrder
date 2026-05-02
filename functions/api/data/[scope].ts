/**
 * Cloud sync per-scope endpoint.
 *
 *   PUT /api/data/:scope     — upsert blob for one scope
 *
 * See ../data.ts for the GET-all endpoint and full docs on auth / setup.
 */

interface Env {
  DB?: D1Database;
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

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const KNOWN_SCOPES = ['history', 'customers', 'templates', 'rates'] as const;
const MAX_BLOB_BYTES = 5_000_000;

function authContext(request: Request): { email: string; orgId: string } | null {
  const email = request.headers.get('Cf-Access-Authenticated-User-Email');
  if (!email) return null;
  const domain = email.split('@')[1] || 'default';
  const orgId = domain.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'default';
  return { email, orgId };
}

function emailKey(email: string): string {
  let h = 0;
  for (let i = 0; i < email.length; i++) {
    h = ((h << 5) - h + email.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36).padStart(6, '0');
}

function isValidScope(scope: string, email: string): boolean {
  if ((KNOWN_SCOPES as readonly string[]).includes(scope)) return true;
  if (scope === `draft_${emailKey(email)}`) return true;
  return false;
}

export const onRequestPut = async ({ request, env, params }: PagesContext<Env, { scope?: string }>): Promise<Response> => {
  if (!env.DB) return json({ error: 'Cloud sync not configured (DB binding missing).' }, 503);
  const auth = authContext(request);
  if (!auth) return json({ error: 'Unauthenticated.' }, 401);

  const scope = params.scope || '';
  if (!isValidScope(scope, auth.email)) return json({ error: `Unknown scope: ${scope}` }, 400);

  let bodyText: string;
  try { bodyText = await request.text(); }
  catch { return json({ error: 'Could not read request body' }, 400); }

  if (bodyText.length > MAX_BLOB_BYTES) return json({ error: `Blob too large (max ${MAX_BLOB_BYTES} bytes)` }, 413);
  try { JSON.parse(bodyText); } catch { return json({ error: 'Body must be valid JSON' }, 400); }

  try {
    await env.DB
      .prepare(
        `INSERT INTO blobs (org_id, scope, content, updated_at, updated_by)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (org_id, scope) DO UPDATE SET
           content = excluded.content,
           updated_at = excluded.updated_at,
           updated_by = excluded.updated_by`
      )
      .bind(auth.orgId, scope, bodyText, Date.now(), auth.email)
      .run();
    return json({ ok: true, scope, updatedAt: Date.now() });
  } catch (e) {
    return json({ error: `Database write failed: ${e instanceof Error ? e.message : String(e)}` }, 500);
  }
};
