/**
 * Cloudflare Pages Function — Gemini API proxy.
 *
 * The browser POSTs { model, contents, config } to /api/gemini.
 * This function injects the secret key (server-side env var) and forwards
 * to Google. The key is never exposed to the client.
 *
 * Required Pages env var: GEMINI_API_KEY (no VITE_ prefix — server-only).
 *
 * Optional Pages env vars:
 *  - ALLOWED_ORIGINS: comma-separated list of origins permitted to call /api/gemini.
 *    If unset, defaults to the current host. Set to "*" to disable origin checking
 *    (NOT recommended in production — anyone can drain your Gemini quota).
 *  - MAX_REQUEST_BYTES: max request body size in bytes (default 1_000_000 = 1 MB).
 *  - RATE_LIMIT_PER_MINUTE: per-IP requests/minute (default 30). Best-effort
 *    in-memory limiter that resets on each worker restart — defense in depth,
 *    not a hard guarantee.
 */

type PagesContext<EnvT> = {
  request: Request;
  env: EnvT;
};

interface Env {
  GEMINI_API_KEY?: string;
  ALLOWED_ORIGINS?: string;
  MAX_REQUEST_BYTES?: string;
  RATE_LIMIT_PER_MINUTE?: string;
}

interface GeminiProxyBody {
  model?: string;
  contents?: unknown;
  config?: Record<string, unknown> | null;
}

const DEFAULT_MAX_BYTES = 1_000_000;
// 200 req/min/IP — generous enough for an office of 10 coordinators sharing one
// external IP via NAT (each generating ~15 req/min for a CO + a few lookups),
// while still blocking automated abuse (a scraper hammering /api/gemini at this
// rate would still burn meaningful prepaid quota and warrant edge throttling).
const DEFAULT_RATE_LIMIT = 200;

const json = (body: unknown, status = 200, extraHeaders: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });

// In-memory per-IP request log. Resets on worker cold-start. Each worker
// instance has its own map, so a determined attacker behind multiple Cloudflare
// edge POPs could exceed the limit — but it stops casual abuse. Pair with
// Cloudflare's edge rate-limiting rules if you need a hard cap.
const requestLog = new Map<string, number[]>();

function rateLimitOk(ip: string, perMinute: number): boolean {
  const now = Date.now();
  const windowStart = now - 60_000;
  const log = (requestLog.get(ip) || []).filter(t => t > windowStart);
  if (log.length >= perMinute) {
    return false;
  }
  log.push(now);
  requestLog.set(ip, log);
  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (requestLog.size > 5000) {
    for (const [key, times] of requestLog.entries()) {
      const fresh = times.filter(t => t > windowStart);
      if (fresh.length === 0) requestLog.delete(key);
      else requestLog.set(key, fresh);
    }
  }
  return true;
}

function isAllowedOrigin(request: Request, env: Env): boolean {
  const allowedRaw = env.ALLOWED_ORIGINS?.trim();
  if (allowedRaw === '*') return true;

  const origin = request.headers.get('Origin') || '';
  const referer = request.headers.get('Referer') || '';
  const secFetchSite = request.headers.get('Sec-Fetch-Site') || '';
  const requestUrl = new URL(request.url);

  // Modern browsers send Sec-Fetch-Site=same-origin for fetches initiated by
  // the page itself. This is a strong signal the request came from our own
  // app and bypasses the need for Origin/Referer (which some privacy browsers
  // strip). If the browser explicitly says same-origin, trust it.
  if (secFetchSite === 'same-origin') return true;

  // Default allowlist: same host that served the function. Custom domains
  // (e.g., co.3dtsi.com) work automatically because the page is served from
  // that host and the function lives at that host's /api/gemini.
  if (!allowedRaw) {
    if (origin && origin === requestUrl.origin) return true;
    if (referer) {
      try {
        if (new URL(referer).origin === requestUrl.origin) return true;
      } catch { /* malformed referer */ }
    }
    return false;
  }

  const allowedList = allowedRaw.split(',').map(s => s.trim()).filter(Boolean);
  if (allowedList.includes(origin)) return true;
  if (referer) {
    try {
      const refOrigin = new URL(referer).origin;
      if (allowedList.includes(refOrigin)) return true;
    } catch { /* malformed referer */ }
  }
  return false;
}

export const onRequestPost = async ({ request, env }: PagesContext<Env>): Promise<Response> => {
  if (!env.GEMINI_API_KEY) {
    return json({ error: { code: 500, status: 'CONFIG_ERROR', message: 'GEMINI_API_KEY not configured on server' } }, 500);
  }

  // ── Security: Origin allowlist ─────────────────────────────────────────────
  if (!isAllowedOrigin(request, env)) {
    const origin = request.headers.get('Origin') || '(none)';
    const referer = request.headers.get('Referer') || '(none)';
    return json({
      error: {
        code: 403,
        status: 'FORBIDDEN',
        message: `Origin not allowed. Origin=${origin}, Referer=${referer}. If you're using a custom domain, set ALLOWED_ORIGINS in Cloudflare Pages env vars.`
      }
    }, 403);
  }

  // ── Security: Request size cap ─────────────────────────────────────────────
  const maxBytes = Number(env.MAX_REQUEST_BYTES) || DEFAULT_MAX_BYTES;
  const contentLength = Number(request.headers.get('Content-Length') || '0');
  if (contentLength > maxBytes) {
    return json({ error: { code: 413, status: 'PAYLOAD_TOO_LARGE', message: `Request body exceeds ${maxBytes} bytes` } }, 413);
  }

  // ── Security: Per-IP rate limit (best-effort, in-memory) ───────────────────
  const perMinute = Number(env.RATE_LIMIT_PER_MINUTE) || DEFAULT_RATE_LIMIT;
  const ip = request.headers.get('CF-Connecting-IP')
    || request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim()
    || 'unknown';
  if (!rateLimitOk(ip, perMinute)) {
    return json(
      {
        error: {
          code: 429,
          status: 'RATE_LIMITED',
          message: `Too many requests from this network in the past minute (limit: ${perMinute}). If your office shares an external IP, raise RATE_LIMIT_PER_MINUTE in Cloudflare Pages env vars. Retry in 60 seconds.`
        }
      },
      429,
      { 'Retry-After': '60' }
    );
  }

  let body: GeminiProxyBody;
  try {
    body = await request.json();
  } catch {
    return json({ error: { code: 400, status: 'INVALID_JSON', message: 'Request body is not valid JSON' } }, 400);
  }

  const { model, contents, config } = body;
  if (!model || typeof model !== 'string') {
    return json({ error: { code: 400, status: 'INVALID_REQUEST', message: 'model is required' } }, 400);
  }
  if (!contents) {
    return json({ error: { code: 400, status: 'INVALID_REQUEST', message: 'contents is required' } }, 400);
  }
  // Light guard against arbitrary model strings — accept only known Gemini patterns.
  if (!/^gemini-[a-z0-9.\-]+$/i.test(model)) {
    return json({ error: { code: 400, status: 'INVALID_REQUEST', message: 'Unsupported model identifier' } }, 400);
  }

  const upstreamBody: Record<string, unknown> = {
    contents: Array.isArray(contents) ? contents : [contents],
  };

  if (config && typeof config === 'object') {
    const cfg = { ...config } as Record<string, unknown>;
    const sysInstruction = cfg.systemInstruction;
    delete cfg.systemInstruction;
    const tools = cfg.tools;
    delete cfg.tools;
    if (sysInstruction) {
      upstreamBody.systemInstruction = typeof sysInstruction === 'string'
        ? { parts: [{ text: sysInstruction }] }
        : sysInstruction;
    }
    if (tools) {
      upstreamBody.tools = tools;
    }
    upstreamBody.generationConfig = cfg;
  }

  // Send the API key in the header rather than the URL so it doesn't show up
  // in any intermediate logs.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const upstream = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': env.GEMINI_API_KEY,
    },
    body: JSON.stringify(upstreamBody),
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json' },
  });
};
