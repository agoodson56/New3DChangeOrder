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

  const docusignFields = {
    integrationKey: !!env.DOCUSIGN_INTEGRATION_KEY,
    userId: !!env.DOCUSIGN_USER_ID,
    accountId: !!env.DOCUSIGN_ACCOUNT_ID,
    privateKey: !!env.DOCUSIGN_RSA_PRIVATE_KEY,
  };
  const docusignConfigured = Object.values(docusignFields).every(Boolean);

  // Unauthenticated callers get only the booleans the SetupBanner needs — no
  // user email, no environment string, no notes. Reduces reconnaissance value
  // while preserving first-time setup UX. Once Cloudflare Access is in front
  // (see SETUP.md), the response below is upgraded with full diagnostics.
  if (!accessEmail) {
    return json({
      ok: true,
      timestamp: new Date().toISOString(),
      authenticated: false,
      integrations: {
        gemini: {
          configured: !!env.GEMINI_API_KEY,
          note: env.GEMINI_API_KEY ? 'AI service ready' : 'Set GEMINI_API_KEY in Cloudflare Pages env vars',
        },
        cloudSync: {
          d1Bound: !!env.DB,
          accessEnabled: false,
          ready: false,
          note: 'Cloudflare Access not in front of /api/health — sign in to see full diagnostics.',
        },
        docusign: {
          configured: docusignConfigured,
          // No environment string when unauthenticated.
          note: docusignConfigured ? 'DocuSign ready' : 'DocuSign not configured',
        },
      },
    });
  }

  return json({
    ok: true,
    authenticated: true,
    timestamp: new Date().toISOString(),
    integrations: {
      gemini: {
        configured: !!env.GEMINI_API_KEY,
        note: env.GEMINI_API_KEY
          ? 'AI service ready'
          : 'Set GEMINI_API_KEY in Cloudflare Pages env vars',
      },
      cloudSync: {
        d1Bound: !!env.DB,
        accessEnabled: !!accessEmail,
        userEmail: accessEmail,
        ready: !!env.DB && !!accessEmail,
        note: !env.DB
          ? 'Bind D1 database "co-storage" to "DB" in Pages → Settings → Functions'
          : !accessEmail
            ? 'Cloudflare Access is not in front of /api/health. Configure Zero Trust → Access for /api/data* and /api/health'
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
