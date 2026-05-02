/**
 * Cloud sync endpoint backed by Cloudflare D1.
 *
 *   GET  /api/data         → returns all scopes for caller's org as a single JSON blob
 *   PUT  /api/data/:scope  → upserts the named scope's blob
 *
 * Auth: relies on Cloudflare Access in front of /api/data/*. The
 * `Cf-Access-Authenticated-User-Email` header is forwarded by Access on
 * every authenticated request. If the header is missing, the endpoint
 * refuses to serve. Setup:
 *   - Cloudflare Zero Trust → Access → Applications → Add Application
 *   - Self-hosted, app domain = your-domain/api/data*
 *   - Identity provider: Google Workspace, OTP-email, or whatever you prefer
 *   - Group: 3DTSI staff
 *
 * Org id derives from email domain (3dtsi.com → 3dtsi). All employees in
 * the same org share customers/templates/history. Drafts are per-user.
 *
 * Required Pages binding:  DB  → D1 database "co-storage" (see db/schema.sql)
 *
 * If DB is not bound, the endpoint returns 503 and the client falls back
 * to localStorage-only mode — the app still works on a single device.
 */

interface Env {
  DB?: D1Database;
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

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

function authContext(request: Request): { email: string; orgId: string } | null {
  const email = request.headers.get('Cf-Access-Authenticated-User-Email');
  if (!email) return null;
  // Derive org id from email domain — keeps multi-tenant simple without
  // requiring an explicit org table.
  const domain = email.split('@')[1] || 'default';
  const orgId = domain.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'default';
  return { email, orgId };
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
  if (!env.DB) {
    return json({ error: 'Cloud sync not configured (DB binding missing). App will fall back to local storage.' }, 503);
  }
  const auth = authContext(request);
  if (!auth) {
    return json({ error: 'Unauthenticated. Cloudflare Access must be enabled in front of /api/data.' }, 401);
  }

  try {
    const { results } = await env.DB
      .prepare('SELECT scope, content, updated_at FROM blobs WHERE org_id = ?')
      .bind(auth.orgId)
      .all<{ scope: string; content: string; updated_at: number }>();

    const myDraftScope = `draft_${emailKey(auth.email)}`;
    const blobs: Record<string, { content: unknown; updatedAt: number }> = {};
    for (const row of results) {
      // Filter out other users' drafts — they're scoped to a specific user.
      if (row.scope.startsWith('draft_') && row.scope !== myDraftScope) continue;
      try {
        blobs[row.scope] = { content: JSON.parse(row.content), updatedAt: row.updated_at };
      } catch {
        // Corrupted row — skip rather than fail the whole sync.
      }
    }
    return json({ orgId: auth.orgId, email: auth.email, blobs });
  } catch (e) {
    return json({ error: `Database read failed: ${e instanceof Error ? e.message : String(e)}` }, 500);
  }
};

// PUT /api/data/:scope handler lives in functions/api/data/[scope].ts
