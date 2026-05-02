/**
 * Health-check / wiring-status endpoint.
 *
 *   GET /api/health
 *
 * Returns a JSON snapshot of which integrations are configured. Useful for:
 *   - Verifying setup after dashboard changes ("did my D1 binding take effect?")
 *   - Driving the in-app setup wizard (utils/setupStatus.ts polls this)
 *   - On-call diagnostics ("is DocuSign configured in production?")
 *
 * No secrets or sensitive identifiers are returned — only booleans and
 * non-sensitive metadata.
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

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json' },
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

  return json({
    ok: true,
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
        userEmail: accessEmail, // null if Access not enabled
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
