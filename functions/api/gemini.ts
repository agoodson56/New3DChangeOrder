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
  DB?: D1Database;
}

interface D1Database {
  prepare(sql: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...params: unknown[]): D1PreparedStatement;
  first(): Promise<unknown>;
  all(): Promise<{ results?: unknown[] }>;
  run(): Promise<D1Result>;
}

interface D1Result {
  success: boolean;
  errors?: string[];
}

interface GeminiProxyBody {
  model?: string;
  contents?: unknown;
  config?: Record<string, unknown> | null;
  /** When true and the systemInstruction is large enough, the proxy will
   *  create (or reuse) a Gemini cachedContent so the system prompt is billed
   *  at ~25% the input rate after the first call. Best-effort — silently
   *  falls back to inline systemInstruction on any cache failure. */
  useCache?: boolean;
}

// 30 MB request body cap — generous enough for a CO with several PDF plan
// sheets + images attached as base64 inlineData (every 1 MB of file becomes
// ~1.34 MB of base64 JSON). Override with env var MAX_REQUEST_BYTES if your
// team uploads larger plan sets. The check is enforced AFTER reading the
// body so a lying Content-Length header can't sneak past.
const DEFAULT_MAX_BYTES = 30_000_000;
// 200 req/min/IP — generous enough for an office of 10 coordinators sharing one
// external IP via NAT (each generating ~15 req/min for a CO + a few lookups),
// while still blocking automated abuse (a scraper hammering /api/gemini at this
// rate would still burn meaningful prepaid quota and warrant edge throttling).
const DEFAULT_RATE_LIMIT = 200;

// Shared no-store directive for sensitive/personalized responses. Prevents
// Cloudflare or any intermediate corporate proxy from caching one user's AI
// output and serving it to another.
const NO_STORE_HEADERS = {
  'Cache-Control': 'private, no-store, no-cache, max-age=0',
  'Pragma': 'no-cache',
  'X-Content-Type-Options': 'nosniff',
};

const json = (body: unknown, status = 200, extraHeaders: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...NO_STORE_HEADERS, ...extraHeaders },
  });

// In-memory per-IP request log. Resets on worker cold-start. Each worker
// instance has its own map, so a determined attacker behind multiple Cloudflare
// edge POPs could exceed the limit — but it stops casual abuse. Pair with
// Cloudflare's edge rate-limiting rules if you need a hard cap.
const requestLog = new Map<string, number[]>();

// In-memory cache registry: hash(model+systemInstruction) → { cacheName, expiresAt }.
// Per-isolate; new isolates rebuild caches but Gemini's implicit caching also
// kicks in for the same prefix, so the cost of a cold isolate is bounded.
const cacheRegistry = new Map<string, { name: string; expiresAt: number }>();
// Gemini's documented minimum for explicit caching is ~4096 tokens.
// Conservative char threshold (~4 chars/token) below which we don't bother.
const CACHE_MIN_CHARS = 16384;
const CACHE_TTL_SECONDS = 3600;

async function sha256Short(s: string): Promise<string> {
  const enc = new TextEncoder().encode(s);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('').slice(0, 32);
}

/** Get-or-create a Gemini cachedContent for the given systemInstruction.
 *  Returns the cache resource name (e.g. "cachedContents/abc...") on success,
 *  or null on any failure / when the prompt is too small to be cached. */
async function getOrCreateSystemCache(
  apiKey: string,
  model: string,
  systemInstructionRaw: unknown
): Promise<string | null> {
  if (!systemInstructionRaw) return null;
  const sysObj = typeof systemInstructionRaw === 'string'
    ? { parts: [{ text: systemInstructionRaw }] }
    : systemInstructionRaw;
  const sysJson = JSON.stringify(sysObj);
  if (sysJson.length < CACHE_MIN_CHARS) return null;

  const hash = await sha256Short(`${model}|${sysJson}`);
  const now = Date.now();
  const existing = cacheRegistry.get(hash);
  // Reuse if it has at least 60s left — caches near expiry can race with the
  // generateContent call and yield a NOT_FOUND error.
  if (existing && existing.expiresAt > now + 60_000) return existing.name;

  try {
    const r = await fetch(
      'https://generativelanguage.googleapis.com/v1/cachedContents',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          model: `models/${model}`,
          systemInstruction: sysObj,
          ttl: `${CACHE_TTL_SECONDS}s`,
        }),
      }
    );
    if (!r.ok) {
      console.warn('cachedContents create failed:', r.status, (await r.text()).slice(0, 200));
      return null;
    }
    const data = await r.json() as { name?: string };
    if (!data?.name) return null;
    cacheRegistry.set(hash, { name: data.name, expiresAt: now + CACHE_TTL_SECONDS * 1000 });
    // Bound the registry size — typical office uses 1-3 distinct prompts.
    if (cacheRegistry.size > 64) {
      for (const [k, v] of cacheRegistry.entries()) {
        if (v.expiresAt < now) cacheRegistry.delete(k);
      }
    }
    return data.name;
  } catch (e) {
    console.warn('cachedContents create errored:', e);
    return null;
  }
}

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

/** Check and enforce per-user monthly quota for Gemini API calls.
 *  Returns { ok: true } on success (quota within limit), or quota-exceeded response.
 *  Rough cost estimate: Gemini 2.5-flash ~$0.025/CO generation (150K input + 50K output tokens).
 *  Monthly cap per user: $500 (allows ~20,000 CO generations/month).
 */
async function checkUserQuotaAndIncrement(
  db: D1Database | undefined,
  email: string | null
): Promise<{ ok: true } | Response> {
  if (!db || !email) {
    // No DB or no authenticated email — allow (fail open, but log it).
    return { ok: true };
  }

  const monthKey = new Date().toISOString().slice(0, 7); // "2026-05"
  const monthlyLimitUsd = 500;
  const estimatedCostPerCall = 0.025; // Rough estimate for CO generation.

  try {
    // Check current spend for this user/month.
    const row = await db
      .prepare('SELECT current_spend_usd FROM monthly_quotas WHERE email = ? AND month = ?')
      .bind(email, monthKey)
      .first() as { current_spend_usd?: number } | null;

    const currentSpend = row?.current_spend_usd ?? 0;

    if (currentSpend + estimatedCostPerCall > monthlyLimitUsd) {
      return json(
        {
          error: {
            code: 429,
            status: 'QUOTA_EXCEEDED',
            message: `Monthly quota exceeded for ${email}. Monthly limit: $${monthlyLimitUsd}. Current spend: $${currentSpend.toFixed(2)}. Contact admin to reset quota.`
          }
        },
        429,
        { 'Retry-After': '86400' }
      );
    }

    // Increment quota (insert or update).
    await db
      .prepare(
        `INSERT INTO monthly_quotas (email, month, current_spend_usd, updated_at)
         VALUES (?, ?, ?, datetime('now'))
         ON CONFLICT(email, month) DO UPDATE SET
           current_spend_usd = current_spend_usd + ?,
           updated_at = datetime('now')`
      )
      .bind(email, monthKey, estimatedCostPerCall, estimatedCostPerCall)
      .run();

    return { ok: true };
  } catch (e) {
    // Quota check DB error — fail open but log it.
    console.warn(`Quota check failed (error: ${e instanceof Error ? e.message : String(e)}); allowing call.`);
    return { ok: true };
  }
}

export const onRequestPost = async ({ request, env }: PagesContext<Env>): Promise<Response> => {
  if (!env.GEMINI_API_KEY) {
    // Don't reveal which env var is missing — that's reconnaissance value.
    // Operators see the truth on /api/health (which is now auth-gated).
    console.warn('GEMINI_API_KEY not configured on server');
    return json({ error: { code: 503, status: 'UNAVAILABLE', message: 'AI service is not currently available. Contact your administrator.' } }, 503);
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
  // Header check is a fast reject for honest clients. We re-check the actual
  // body length below in case Content-Length was missing or lied.
  const maxBytes = Number(env.MAX_REQUEST_BYTES) || DEFAULT_MAX_BYTES;
  const contentLength = Number(request.headers.get('Content-Length') || '0');
  if (contentLength > maxBytes) {
    return json({ error: { code: 413, status: 'PAYLOAD_TOO_LARGE', message: `Request body exceeds ${maxBytes} bytes` } }, 413);
  }

  // ── Security: Per-IP rate limit (best-effort, in-memory) ───────────────────
  const perMinute = Number(env.RATE_LIMIT_PER_MINUTE) || DEFAULT_RATE_LIMIT;
  // Use ONLY CF-Connecting-IP (Cloudflare-trusted, set by their edge and not
  // reachable by clients). X-Forwarded-For is client-mutable and previously
  // allowed an attacker to rotate the header to bypass per-IP limits.
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
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

  // ── Security: Per-user monthly quota (prevent runaway costs) ────────────────
  const email = request.headers.get('Cf-Access-Authenticated-User-Email') || null;
  const quotaCheck = await checkUserQuotaAndIncrement(env.DB, email);
  if (!('ok' in quotaCheck)) {
    return quotaCheck; // Return error response if quota exceeded.
  }

  // Read the body as text first so we can enforce the actual size against
  // maxBytes — Content-Length headers can be omitted or spoofed.
  let bodyText: string;
  try {
    bodyText = await request.text();
  } catch {
    return json({ error: { code: 400, status: 'INVALID_JSON', message: 'Request body could not be read' } }, 400);
  }
  if (bodyText.length > maxBytes) {
    return json({ error: { code: 413, status: 'PAYLOAD_TOO_LARGE', message: `Request body exceeds ${maxBytes} bytes` } }, 413);
  }

  let body: GeminiProxyBody;
  try {
    body = JSON.parse(bodyText);
  } catch {
    return json({ error: { code: 400, status: 'INVALID_JSON', message: 'Request body is not valid JSON' } }, 400);
  }

  const { model, contents, config, useCache } = body;
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

    // Try to swap a large systemInstruction for a cachedContent reference.
    // Falls back silently to inline if caching fails (best-effort).
    let cacheName: string | null = null;
    if (useCache && sysInstruction && !tools /* cached + tools combo isn't supported */) {
      cacheName = await getOrCreateSystemCache(env.GEMINI_API_KEY, model, sysInstruction);
    }

    if (cacheName) {
      upstreamBody.cachedContent = cacheName;
      // Don't send systemInstruction inline when using cache — it's redundant
      // and may error.
    } else if (sysInstruction) {
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
  const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:generateContent`;

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
    headers: {
      'Content-Type': 'application/json',
      // Sensitive AI output: never cache at edge or in shared proxies.
      ...NO_STORE_HEADERS,
    },
  });
};
