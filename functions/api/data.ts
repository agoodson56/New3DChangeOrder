/**
 * Cloud sync endpoint backed by Cloudflare D1.
 *
 *   GET  /api/data         → returns all scopes for caller as a single JSON blob
 *   PUT  /api/data/:scope  → upserts the named scope's blob
 *
 * Auth: requires valid JWT token in Authorization header (Bearer <token>).
 * Token issued by /api/auth/login or /api/auth/register.
 *
 * Required Pages binding:  DB  → D1 database "co-storage" (see db/schema.sql)
 *
 * If DB is not bound, the endpoint returns 503 and the client falls back
 * to localStorage-only mode — the app still works on a single device.
 */

import { verifyToken } from '../lib/jwt';

interface Env {
  DB?: D1Database;
  JWT_SECRET?: string;
}

// Minimal D1 typings — declared inline so we don't depend on
// @cloudflare/workers-types just for two function signatures.
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

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...NO_STORE_HEADERS, ...headers },
  });

/** Generate a short opaque request id for correlating client errors with server logs. */
function requestId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

async function authContext(request: Request, secret: string): Promise<{ userId: number; email: string } | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  const payload = await verifyToken(token, secret);
  if (!payload) return null;

  return { userId: payload.userId, email: payload.email };
}

function emailKey(email: string): string {
  // Stable short identifier per email — good enough for scope keys.
  let h = 0;
  for (let i = 0; i < email.length; i++) {
    h = ((h << 5) - h + email.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36).padStart(6, '0');
}

// =============================================================================
// GET /api/data — return all scopes for the caller's org
// =============================================================================

export const onRequestGet = async ({ request, env }: PagesContext<Env>): Promise<Response> => {
  if (!env.DB || !env.JWT_SECRET) {
    return json({ error: 'Server not configured.' }, 503);
  }

  const auth = await authContext(request, env.JWT_SECRET);
  if (!auth) {
    return json({ error: 'Unauthenticated.' }, 401);
  }

  try {
    const { results } = await env.DB
      .prepare('SELECT scope, content, updated_at FROM blobs WHERE user_id = ? ORDER BY updated_at DESC')
      .bind(auth.userId)
      .all<{ scope: string; content: string; updated_at: number }>();

    const blobs: Record<string, { content: unknown; updatedAt: number }> = {};
    for (const row of results) {
      try {
        blobs[row.scope] = { content: JSON.parse(row.content), updatedAt: row.updated_at };
      } catch {
        // Corrupted row — skip
      }
    }
    return json({ userId: auth.userId, email: auth.email, blobs });
  } catch (e) {
    const rid = requestId();
    console.error(`[data:GET ${rid}] db read failed:`, e instanceof Error ? e.message : String(e));
    return json({ error: 'Database read failed.', requestId: rid }, 500);
  }
};

// PUT /api/data/:scope handler lives in functions/api/data/[scope].ts
