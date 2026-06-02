/**
 * Health-check / wiring-status endpoint.
 *
 *   GET /api/health
 *
 * Returns full diagnostics for operators (configuration state, integrations status).
 * Authentication is handled by Cloudflare Access at the edge — no manual auth needed here.
 * The Cf-Access-Authenticated-User-Email header is optionally injected by Access.
 *
 * No secrets are EVER returned. The booleans (configured/d1Bound/etc.) only
 * reveal configuration STATE, never values.
 */

interface Env {
  GEMINI_API_KEY?: string;
  DB?: unknown;
  ALLOWED_ORIGINS?: string;
}

type PagesContext<EnvT> = { request: Request; env: EnvT };

// Sensitive operational data must not be cached at the edge.
const NO_STORE_HEADERS = {
  'Cache-Control': 'private, no-store, no-cache, max-age=0',
  'Pragma': 'no-cache',
  'X-Content-Type-Options': 'nosniff',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', ...NO_STORE_HEADERS },
  });

export const onRequestGet = async ({ request, env }: PagesContext<Env>): Promise<Response> => {
  const accessEmail = request.headers.get('Cf-Access-Authenticated-User-Email') || null;

  // Full diagnostics response (Cloudflare Access handles authentication at the edge).
  return json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    authenticated: !!accessEmail,
    userEmail: accessEmail || '(not authenticated)',
    integrations: {
      gemini: {
        configured: !!env.GEMINI_API_KEY,
        note: env.GEMINI_API_KEY
          ? 'AI service ready'
          : 'Set GEMINI_API_KEY in Cloudflare Pages env vars',
      },
      cloudSync: {
        d1Bound: !!env.DB,
        ready: !!env.DB,
        note: !env.DB
          ? 'Bind D1 database "co-storage" to "DB" in Pages → Settings → Functions'
          : 'Cloud sync ready',
      },
      security: {
        allowedOrigins: env.ALLOWED_ORIGINS || '(default: same-origin)',
      },
    },
  });
};
