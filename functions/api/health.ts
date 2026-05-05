/**
 * Health-check / wiring-status endpoint.
 *
 *   GET /api/health
 *
 * Two response modes:
 *  - **Authenticated** (Cloudflare Access in front, Cf-Access-Authenticated-User-Email
 *    header present): full diagnostic — env strings, configuration notes, signed-in
 *    email. Drives the SetupBanner and on-call diagnostics.
 *  - **Unauthenticated**: a minimal "is the backend reachable" response with no
 *    configuration enumeration. Lets a brand-new operator see "the page works"
 *    without leaking which integrations are wired before Access is configured.
 *
 * Why split the modes: an unauthenticated /api/health was previously enumerating
 * which integrations were enabled, which environment (demo vs production) DocuSign
 * was pointing at, and other operational details — reconnaissance value to a
 * would-be attacker. Now this is gated behind Access.
 *
 * No secrets are EVER returned. The booleans (configured/d1Bound/etc.) only
 * reveal configuration STATE, never the value.
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

  // ── SECURITY: Require Cloudflare Access authentication ───────────────────
  // Health check endpoint leaks infrastructure details (which services are configured).
  // Gate it behind Cloudflare Access to prevent unauthorized reconnaissance.
  // Unauthenticated callers get a generic 401 with no state information.
  if (!accessEmail) {
    return json(
      {
        error: {
          code: 401,
          status: 'UNAUTHORIZED',
          message: 'This endpoint requires Cloudflare Access authentication. Sign in via your Cloudflare Access portal.'
        }
      },
      401
    );
  }

  const docusignFields = {
    integrationKey: !!env.DOCUSIGN_INTEGRATION_KEY,
    userId: !!env.DOCUSIGN_USER_ID,
    accountId: !!env.DOCUSIGN_ACCOUNT_ID,
    privateKey: !!env.DOCUSIGN_RSA_PRIVATE_KEY,
  };
  const docusignConfigured = Object.values(docusignFields).every(Boolean);

  // Authenticated response: full diagnostics for operators.
  return json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    authenticated: true,
    userEmail: accessEmail,
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
