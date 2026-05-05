/**
 * DocuSign envelope creation endpoint.
 *
 * The browser POSTs:
 *   {
 *     pdfBase64: string,        // the rendered CO/proposal PDF
 *     filename: string,         // for the envelope
 *     subject: string,          // email subject
 *     message?: string,         // email body
 *     signer: { email, name },  // customer to sign
 *     ccs?: Array<{email, name}>,
 *     poNumber?: string,        // CO/PCO reference for receipt tracking
 *   }
 *
 * Returns:
 *   { envelopeId, status, signingUrl?, sentAt }
 *
 * Required Pages env vars (set in Cloudflare → Pages → Settings → env vars):
 *   DOCUSIGN_INTEGRATION_KEY    — your DocuSign integration (client) ID
 *   DOCUSIGN_USER_ID            — DocuSign user GUID (impersonated sender)
 *   DOCUSIGN_ACCOUNT_ID         — DocuSign account API ID
 *   DOCUSIGN_RSA_PRIVATE_KEY    — RSA private key (PEM format) for JWT auth
 *   DOCUSIGN_BASE_URL           — https://demo.docusign.net for testing,
 *                                 https://www.docusign.net for production
 *   DOCUSIGN_OAUTH_HOST         — https://account-d.docusign.com (demo) or
 *                                 https://account.docusign.com (production)
 *
 * Setup (one-time, ~30 minutes):
 *   1. Create a DocuSign developer account at https://developers.docusign.com
 *   2. Create an "Integration" (App) in the developer portal
 *   3. Generate an RSA keypair, save the private key as the env var above
 *   4. In DocuSign settings → API and Keys, enable "JWT Grant"
 *   5. Visit the consent URL ONCE per impersonated user:
 *      https://account-d.docusign.com/oauth/auth
 *        ?response_type=code
 *        &scope=signature%20impersonation
 *        &client_id=YOUR_INTEGRATION_KEY
 *        &redirect_uri=YOUR_CALLBACK
 *      (Click "Allow" on the consent screen — required for JWT auth to work.)
 *   6. Push and test against demo first.
 *
 * If env vars are missing, the endpoint returns 503 and the client shows a
 * graceful "DocuSign not configured" message.
 */

interface Env {
  DOCUSIGN_INTEGRATION_KEY?: string;
  DOCUSIGN_USER_ID?: string;
  DOCUSIGN_ACCOUNT_ID?: string;
  DOCUSIGN_RSA_PRIVATE_KEY?: string;
  DOCUSIGN_BASE_URL?: string;
  DOCUSIGN_OAUTH_HOST?: string;
}

type PagesContext<EnvT> = { request: Request; env: EnvT };

// Sensitive: never cache envelope responses or error details.
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

/** Basic email shape validation — rejects obvious garbage, not RFC-perfect. */
function looksLikeEmail(s: unknown): s is string {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 320;
}

interface RequestBody {
  pdfBase64?: string;
  filename?: string;
  subject?: string;
  message?: string;
  signer?: { email: string; name: string };
  ccs?: Array<{ email: string; name: string }>;
  poNumber?: string;
}

// ─── JWT signing ──────────────────────────────────────────────────────────────
// Uses Web Crypto (available in Cloudflare Workers). RSA-SHA256.

function b64urlEncode(input: ArrayBuffer | string): string {
  const bytes = typeof input === 'string'
    ? new TextEncoder().encode(input)
    : new Uint8Array(input);
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]!);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToPkcs8(pem: string): ArrayBuffer {
  if (!pem || typeof pem !== 'string') {
    throw new Error('DOCUSIGN_RSA_PRIVATE_KEY is empty or invalid type');
  }
  const trimmed = pem
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s+/g, '');
  if (!trimmed || !/^[A-Za-z0-9+/=]+$/.test(trimmed)) {
    throw new Error('DOCUSIGN_RSA_PRIVATE_KEY does not look like a valid PEM-encoded RSA key (expected base64 between BEGIN/END markers)');
  }
  let bin: string;
  try {
    bin = atob(trimmed);
  } catch {
    throw new Error('DOCUSIGN_RSA_PRIVATE_KEY base64 decode failed — check the env var value');
  }
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

async function signJwt(env: Env): Promise<string> {
  const { DOCUSIGN_INTEGRATION_KEY, DOCUSIGN_USER_ID, DOCUSIGN_RSA_PRIVATE_KEY, DOCUSIGN_OAUTH_HOST } = env;
  if (!DOCUSIGN_INTEGRATION_KEY || !DOCUSIGN_USER_ID || !DOCUSIGN_RSA_PRIVATE_KEY) {
    throw new Error('DocuSign env vars missing');
  }
  const oauthHost = (DOCUSIGN_OAUTH_HOST || 'https://account-d.docusign.com').replace(/^https?:\/\//, '');
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: DOCUSIGN_INTEGRATION_KEY,
    sub: DOCUSIGN_USER_ID,
    aud: oauthHost,
    iat: now,
    exp: now + 3600,
    scope: 'signature impersonation',
  };
  const headerB64 = b64urlEncode(JSON.stringify(header));
  const payloadB64 = b64urlEncode(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToPkcs8(DOCUSIGN_RSA_PRIVATE_KEY),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(signingInput)
  );
  return `${signingInput}.${b64urlEncode(sig)}`;
}

async function getAccessToken(env: Env): Promise<string> {
  const oauthHost = env.DOCUSIGN_OAUTH_HOST || 'https://account-d.docusign.com';
  const jwt = await signJwt(env);
  const r = await fetch(`${oauthHost}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${encodeURIComponent(jwt)}`,
  });
  if (!r.ok) {
    // Log detail server-side; opaque message to client (caller will log a
    // request id below for correlation).
    const text = await r.text();
    console.error(`[docusign] OAuth ${r.status}:`, text.slice(0, 500));
    throw new Error(`DocuSign OAuth failed (HTTP ${r.status})`);
  }
  const data = await r.json() as { access_token: string };
  return data.access_token;
}

// ─── Envelope creation ────────────────────────────────────────────────────────

export const onRequestPost = async ({ request, env }: PagesContext<Env>): Promise<Response> => {
  // Configuration check — return a friendly 503 if not set up so the client UI
  // can show "DocuSign not configured — contact admin" instead of breaking.
  if (
    !env.DOCUSIGN_INTEGRATION_KEY ||
    !env.DOCUSIGN_USER_ID ||
    !env.DOCUSIGN_ACCOUNT_ID ||
    !env.DOCUSIGN_RSA_PRIVATE_KEY
  ) {
    return json({
      error: 'DocuSign is not configured on the server. See functions/api/docusign.ts for setup instructions.',
      configured: false,
    }, 503);
  }

  let body: RequestBody;
  try { body = await request.json(); }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  if (!body.pdfBase64 || !body.signer?.email || !body.signer?.name) {
    return json({ error: 'pdfBase64, signer.email, signer.name are required' }, 400);
  }
  // Validate signer + cc emails so we don't ask DocuSign to send an envelope
  // to "admin@google.com" because someone fat-fingered. DocuSign will accept
  // it; the legitimate recipient won't get an audit.
  if (!looksLikeEmail(body.signer.email)) {
    return json({ error: 'signer.email is not a valid email address' }, 400);
  }
  if (Array.isArray(body.ccs)) {
    for (const cc of body.ccs) {
      if (!looksLikeEmail(cc?.email) || typeof cc?.name !== 'string' || cc.name.trim() === '') {
        return json({ error: 'each cc must have a valid email and non-empty name' }, 400);
      }
    }
  }

  let accessToken: string;
  try {
    accessToken = await getAccessToken(env);
  } catch (e) {
    const rid = requestId();
    console.error(`[docusign:OAuth ${rid}]`, e instanceof Error ? e.message : String(e));
    return json({
      error: 'DocuSign authentication failed.',
      requestId: rid,
      hint: 'Check DocuSign env vars and that the user has consented to the integration (visit consent URL once).',
    }, 500);
  }

  const baseUrl = env.DOCUSIGN_BASE_URL || 'https://demo.docusign.net';
  const accountId = env.DOCUSIGN_ACCOUNT_ID;

  const envelopeDef = {
    emailSubject: body.subject || `Signature Required: ${body.filename || 'Change Order'}`,
    emailBlurb: body.message || 'Please review and sign the attached change order.',
    documents: [
      {
        documentBase64: body.pdfBase64,
        name: body.filename || 'change-order.pdf',
        fileExtension: 'pdf',
        documentId: '1',
      },
    ],
    recipients: {
      signers: [
        {
          email: body.signer.email,
          name: body.signer.name,
          recipientId: '1',
          routingOrder: '1',
          tabs: {
            signHereTabs: [
              {
                anchorString: 'Signature:',
                anchorXOffset: '1',
                anchorYOffset: '0',
                anchorUnits: 'inches',
              },
            ],
            dateSignedTabs: [
              {
                anchorString: 'Date:',
                anchorXOffset: '1',
                anchorYOffset: '0',
                anchorUnits: 'inches',
              },
            ],
          },
        },
      ],
      carbonCopies: (body.ccs || []).map((cc, i) => ({
        email: cc.email,
        name: cc.name,
        recipientId: String(i + 2),
        routingOrder: '2',
      })),
    },
    customFields: body.poNumber
      ? { textCustomFields: [{ name: 'PO Number', value: body.poNumber, required: 'false', show: 'true' }] }
      : undefined,
    status: 'sent',
  };

  const r = await fetch(
    `${baseUrl}/restapi/v2.1/accounts/${accountId}/envelopes`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(envelopeDef),
    }
  );
  if (!r.ok) {
    const text = await r.text();
    const rid = requestId();
    console.error(`[docusign:envelope ${rid}] ${r.status}:`, text.slice(0, 500));
    return json({
      error: 'DocuSign envelope creation failed.',
      requestId: rid,
    }, 500);
  }
  const result = await r.json() as { envelopeId?: string; status?: string };
  return json({
    envelopeId: result.envelopeId,
    status: result.status,
    sentAt: Date.now(),
    configured: true,
  });
};
