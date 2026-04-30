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

export async function generateContent(req: GenerateRequest): Promise<GenerateResponse> {
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
    throw new Error(`AI service error ${res.status}: ${bodyText.slice(0, 500)}`);
  }

  let data: any;
  try { data = JSON.parse(bodyText); }
  catch { throw new Error('AI service returned non-JSON response'); }

  // Some upstream errors are returned with status 200 and an error envelope
  if (data?.error) {
    const code = data.error.code;
    const msg = data.error.message || 'Unknown AI error';
    if (code === 401 || code === 403 || data.error.status === 'PERMISSION_DENIED' || /suspended/i.test(msg)) {
      throw new ApiKeyError(msg);
    }
    if (code === 429) throw new RateLimitError(msg);
    throw new Error(`AI service error: ${msg}`);
  }

  // Standard Gemini response shape
  const text: string = data?.candidates?.[0]?.content?.parts
    ?.map((p: any) => p?.text || '')
    .join('') || '';

  return { text };
}

/** Translate any error from generateContent into a user-friendly message. */
export function describeAiError(err: unknown): string {
  if (err instanceof ApiKeyError) return 'AI service key is missing, invalid, or suspended. Contact your administrator.';
  if (err instanceof RateLimitError) return 'AI service is rate-limited. Wait a minute and try again.';
  if (err instanceof NetworkError) return 'Network error. Check your connection and try again.';
  if (err instanceof Error) return err.message;
  return 'Unknown error generating change order.';
}
