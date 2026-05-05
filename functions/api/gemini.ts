/**
 * Cloudflare Pages Function — Claude API proxy using official Anthropic SDK.
 *
 * The browser POSTs { model, contents, config } to /api/gemini.
 * This function injects the secret key (server-side env var) and forwards
 * to Anthropic using the official SDK. The key is never exposed to the client.
 *
 * Required Pages env var: ANTHROPIC_API_KEY (no VITE_ prefix — server-only).
 */

import Anthropic from '@anthropic-ai/sdk';

type PagesContext<EnvT> = {
  request: Request;
  env: EnvT;
};

interface Env {
  ANTHROPIC_API_KEY?: string;
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
  useCache?: boolean;
}

const DEFAULT_MAX_BYTES = 30_000_000;
const DEFAULT_RATE_LIMIT = 200;

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

  if (secFetchSite === 'same-origin') return true;

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

async function checkUserQuotaAndIncrement(
  db: D1Database | undefined,
  email: string | null
): Promise<{ ok: true } | Response> {
  if (!db || !email) {
    return { ok: true };
  }

  const monthKey = new Date().toISOString().slice(0, 7);
  const monthlyLimitUsd = 500;
  const estimatedCostPerCall = 0.025;

  try {
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
            message: `Monthly quota exceeded for ${email}. Monthly limit: $${monthlyLimitUsd}. Current spend: $${currentSpend.toFixed(2)}.`,
          }
        },
        429,
        { 'Retry-After': '86400' }
      );
    }

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
    console.warn(`Quota check failed (error: ${e instanceof Error ? e.message : String(e)}); allowing call.`);
    return { ok: true };
  }
}

export const onRequestPost = async ({ request, env }: PagesContext<Env>): Promise<Response> => {
  if (!env.ANTHROPIC_API_KEY) {
    console.warn('ANTHROPIC_API_KEY not configured on server');
    return json({ error: { code: 503, status: 'UNAVAILABLE', message: 'AI service is not currently available.' } }, 503);
  }

  if (!isAllowedOrigin(request, env)) {
    const origin = request.headers.get('Origin') || '(none)';
    return json({
      error: {
        code: 403,
        status: 'FORBIDDEN',
        message: `Origin not allowed. Origin=${origin}. If you're using a custom domain, set ALLOWED_ORIGINS in Cloudflare Pages env vars.`
      }
    }, 403);
  }

  const maxBytes = Number(env.MAX_REQUEST_BYTES) || DEFAULT_MAX_BYTES;
  const contentLength = Number(request.headers.get('Content-Length') || '0');
  if (contentLength > maxBytes) {
    return json({ error: { code: 413, status: 'PAYLOAD_TOO_LARGE', message: `Request exceeds ${maxBytes} bytes` } }, 413);
  }

  const perMinute = Number(env.RATE_LIMIT_PER_MINUTE) || DEFAULT_RATE_LIMIT;
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (!rateLimitOk(ip, perMinute)) {
    return json(
      { error: { code: 429, status: 'RATE_LIMITED', message: `Too many requests (limit: ${perMinute}/min)` } },
      429,
      { 'Retry-After': '60' }
    );
  }

  const email = request.headers.get('Cf-Access-Authenticated-User-Email') || null;
  const quotaCheck = await checkUserQuotaAndIncrement(env.DB, email);
  if (!('ok' in quotaCheck)) {
    return quotaCheck;
  }

  let bodyText: string;
  try {
    bodyText = await request.text();
  } catch {
    return json({ error: { code: 400, status: 'INVALID_JSON', message: 'Request body could not be read' } }, 400);
  }
  if (bodyText.length > maxBytes) {
    return json({ error: { code: 413, status: 'PAYLOAD_TOO_LARGE', message: `Request exceeds ${maxBytes} bytes` } }, 413);
  }

  let body: GeminiProxyBody;
  try {
    body = JSON.parse(bodyText);
  } catch {
    return json({ error: { code: 400, status: 'INVALID_JSON', message: 'Invalid JSON in request body' } }, 400);
  }

  const { model, contents, config } = body;
  if (!model || typeof model !== 'string') {
    return json({ error: { code: 400, status: 'INVALID_REQUEST', message: 'model is required' } }, 400);
  }
  if (!contents) {
    return json({ error: { code: 400, status: 'INVALID_REQUEST', message: 'contents is required' } }, 400);
  }
  if (!/^(claude|gemini)-[a-z0-9.\-]+$/i.test(model)) {
    return json({ error: { code: 400, status: 'INVALID_REQUEST', message: 'Unsupported model identifier' } }, 400);
  }

  try {
    if (!env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is empty or undefined');
      return json({ error: { code: 503, status: 'UNAVAILABLE', message: 'API key not configured' } }, 503);
    }

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    // Convert contents to Claude message format
    // Contents from frontend comes in Gemini format, need to convert to Claude format
    let messages: any[] = Array.isArray(contents) ? contents : [contents];

    // If messages are in Gemini format { role, parts }, convert to Claude format { role, content }
    messages = messages.map((msg: any) => {
      if (msg.parts && Array.isArray(msg.parts)) {
        const content = msg.parts.map((part: any) => part.text || '').join('');
        return { role: msg.role || 'user', content };
      }
      return msg;
    });

    // Extract system instruction from config if present
    let systemInstruction = '';
    if (config && typeof config === 'object') {
      const cfg = config as Record<string, unknown>;
      if (cfg.systemInstruction) {
        systemInstruction = typeof cfg.systemInstruction === 'string'
          ? cfg.systemInstruction
          : JSON.stringify(cfg.systemInstruction);
      }
    }

    // Read max_tokens from config if provided (frontend passes maxOutputTokens),
    // otherwise default to a high value to avoid truncating large change orders.
    const cfg = (config && typeof config === 'object') ? config as Record<string, unknown> : {};
    const maxTokensFromConfig = typeof cfg.maxOutputTokens === 'number' ? cfg.maxOutputTokens : null;
    const maxTokens = maxTokensFromConfig && maxTokensFromConfig > 0
      ? Math.min(maxTokensFromConfig, 16384)
      : 16384;

    console.log('Calling Claude API with model:', model, 'max_tokens:', maxTokens);
    const response = await client.messages.create({
      model: model || 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system: systemInstruction || undefined,
      messages: messages,
    });

    const text = response.content
      .filter((block: any) => block.type === 'text')
      .map((block: any) => block.text)
      .join('');

    return json({ candidates: [{ content: { parts: [{ text }] } }] });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Claude error:', message);

    if (message.includes('API key') || message.includes('authentication')) {
      return json({ error: { code: 401, status: 'UNAUTHENTICATED', message: 'API key is invalid or not authorized' } }, 401);
    }
    if (message.includes('not found') || message.includes('not supported')) {
      return json({ error: { code: 404, status: 'NOT_FOUND', message: `Model or endpoint not found: ${message}` } }, 404);
    }
    if (message.includes('quota') || message.includes('rate limit') || message.includes('overloaded')) {
      return json({ error: { code: 429, status: 'RATE_LIMITED', message: message } }, 429);
    }

    return json({ error: { code: 500, status: 'INTERNAL_ERROR', message: `AI service error: ${message.slice(0, 200)}` } }, 500);
  }
};
