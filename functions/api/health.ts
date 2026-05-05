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
  DOCUSIGN_INTEGRATION_KEY?: string;
  DOCUSIGN_USER_ID?: string;
  DOCUSIGN_ACCOUNT_ID?: string;
  DOCUSIGN_RSA_PRIVATE_KEY?: string;
  DOCUSIGN_BASE_URL?: string;
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

  const docusignFields = {
    integrationKey: !!env.DOCUSIGN_INTEGRATION_KEY,
    userId: !!env.DOCUSIGN_USER_ID,
    accountId: !!env.DOCUSIGN_ACCOUNT_ID,
    privateKey: !!env.DOCUSIGN_RSA_PRIVATE_KEY,
  };
  const docusignConfigured = Object.values(docusignFields).every(Boolean);

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
      docusign: {
        configured: docusignConfigured,
        fields: docusignFields,
        environment: env.DOCUSIGN_BASE_URL
          ? (/demo/i.test(env.DOCUSIGN_BASE_URL) ? 'demo' : 'production')
          : 'not-set',
        note: docusignConfigured
          ? 'DocuSign ready — test with a small envelope first'
          : 'Set DOCUSIGN_INTEGRATION_KEY, DOCUSIGN_USER_ID, DOCUSIGN_ACCOUNT_ID, DOCUSIGN_RSA_PRIVATE_KEY in Pages env vars. See functions/api/docusign.ts for the JWT consent step.',
      },
      security: {
        allowedOrigins: env.ALLOWED_ORIGINS || '(default: same-origin)',
      },
    },
  });
};
