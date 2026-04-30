/**
 * Thin client for the /api/gemini Cloudflare Pages Function.
 *
 * Drop-in replacement for `ai.models.generateContent(...)` from @google/genai
 * for the call shapes used by this app: returns `{ text }` so existing
 * `response.text` consumers don't change.
 *
 * The API key never touches the browser — the proxy injects it server-side.
 */

export interface GenerateRequest {
  model: string;
  contents: unknown;
  config?: Record<string, unknown>;
  /** Comma-or-space-separated list of fallback models to try if the primary model
   *  is exhausted by UnavailableError after all retries. Lives on a different
   *  Google compute pool, so its load is uncorrelated with the primary. */
  fallbackModels?: string[];
  /** Mark this call as non-essential (validation/audit pass). When true, the
   *  client makes ONE attempt against the primary model and throws on any
   *  failure — no retries, no fallback chain. The caller's try/catch handles
   *  graceful degradation. Saves quota and latency on calls where producing
   *  no result is acceptable. */
  nonEssential?: boolean;
}

export interface GenerateResponse {
  text: string;
}

export class ApiKeyError extends Error {
  constructor(message: string) { super(message); this.name = 'ApiKeyError'; }
}
export class RateLimitError extends Error {
  constructor(message: string) { super(message); this.name = 'RateLimitError'; }
}
export class NetworkError extends Error {
  constructor(message: string) { super(message); this.name = 'NetworkError'; }
}
export class UnavailableError extends Error {
  constructor(message: string) { super(message); this.name = 'UnavailableError'; }
}

const MAX_RETRIES = 3;
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

async function attemptOnce(req: GenerateRequest): Promise<GenerateResponse> {
  let res: Response;
  try {
    res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
  } catch (e: any) {
    throw new NetworkError(`Network error contacting AI service: ${e?.message || e}`);
  }

  const bodyText = await res.text();

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new ApiKeyError(`API key invalid, suspended, or unauthorized (HTTP ${res.status}).`);
    }
    if (res.status === 429) {
      throw new RateLimitError(`Rate limited (HTTP 429). Try again in a moment.`);
    }
    if (res.status === 503 || res.status === 502 || res.status === 504) {
      throw new UnavailableError(`AI service temporarily unavailable (HTTP ${res.status}).`);
    }
    throw new Error(`AI service error ${res.status}: ${bodyText.slice(0, 500)}`);
  }

  let data: any;
  try { data = JSON.parse(bodyText); }
  catch { throw new Error('AI service returned non-JSON response'); }

  if (data?.error) {
    const code = data.error.code;
    const msg = data.error.message || 'Unknown AI error';
    if (code === 401 || code === 403 || data.error.status === 'PERMISSION_DENIED' || /suspended/i.test(msg)) {
      throw new ApiKeyError(msg);
    }
    if (code === 429) throw new RateLimitError(msg);
    if (code === 503 || code === 502 || code === 504 || data.error.status === 'UNAVAILABLE') {
      throw new UnavailableError(msg);
    }
    throw new Error(`AI service error: ${msg}`);
  }

  const text: string = data?.candidates?.[0]?.content?.parts
    ?.map((p: any) => p?.text || '')
    .join('') || '';

  return { text };
}

async function tryModel(req: GenerateRequest, model: string): Promise<GenerateResponse> {
  const reqWithModel = { ...req, model };
  let lastErr: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await attemptOnce(reqWithModel);
    } catch (e) {
      lastErr = e;
      // 429 (rate limit) is per-model-quota and won't clear in seconds — don't burn
      // more quota on this model. Throw immediately so generateContent falls through
      // to the next model (different quota pool).
      if (e instanceof RateLimitError) throw e;
      const retryable = e instanceof UnavailableError || e instanceof NetworkError;
      if (!retryable || attempt === MAX_RETRIES) throw e;
      const backoffMs = Math.round((2 ** attempt) * 1000 * (0.7 + Math.random() * 0.6));
      await sleep(backoffMs);
    }
  }
  throw lastErr;
}

export async function generateContent(req: GenerateRequest): Promise<GenerateResponse> {
  // Non-essential calls (validation/audit): one attempt, primary model only,
  // throw immediately on any failure. Saves quota and latency.
  if (req.nonEssential) {
    return await attemptOnce({ ...req, model: req.model });
  }
  // Essential calls: try primary model with retries; on persistent UnavailableError
  // or RateLimitError, fall through to fallback models (different quota pools).
  const models = [req.model, ...(req.fallbackModels ?? [])];
  let lastErr: unknown;
  for (let i = 0; i < models.length; i++) {
    try {
      return await tryModel(req, models[i]);
    } catch (e) {
      lastErr = e;
      const fallthroughable = e instanceof UnavailableError || e instanceof RateLimitError;
      if (!fallthroughable || i === models.length - 1) throw e;
      console.warn(`Model ${models[i]} unavailable; falling back to ${models[i + 1]}`);
    }
  }
  throw lastErr;
}

/** Translate any error from generateContent into a user-friendly message. */
export function describeAiError(err: unknown): string {
  if (err instanceof ApiKeyError) return 'AI service key is missing, invalid, or suspended. Contact your administrator.';
  if (err instanceof RateLimitError) return 'AI service is rate-limited. Wait a minute and try again.';
  if (err instanceof UnavailableError) return 'Google\'s AI service is overloaded right now. We retried 3 times. Please try again in a minute or two.';
  if (err instanceof NetworkError) return 'Network error. Check your connection and try again.';
  if (err instanceof Error) return err.message;
  return 'Unknown error generating change order.';
}
