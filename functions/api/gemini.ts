/**
 * Cloudflare Pages Function — Gemini API proxy.
 *
 * The browser POSTs { model, contents, config } to /api/gemini.
 * This function injects the secret key (server-side env var) and forwards
 * to Google. The key is never exposed to the client.
 *
 * Required Pages env var: GEMINI_API_KEY (no VITE_ prefix — server-only).
 */

// Cloudflare Pages Function context type — declared inline to avoid pulling in
// @cloudflare/workers-types as a dependency just for one type.
type PagesContext<EnvT> = {
  request: Request;
  env: EnvT;
};

interface Env {
  GEMINI_API_KEY?: string;
}

interface GeminiProxyBody {
  model?: string;
  contents?: unknown;
  config?: Record<string, unknown> | null;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const onRequestPost = async ({ request, env }: PagesContext<Env>): Promise<Response> => {
  if (!env.GEMINI_API_KEY) {
    return json({ error: { code: 500, status: 'CONFIG_ERROR', message: 'GEMINI_API_KEY not configured on server' } }, 500);
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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${env.GEMINI_API_KEY}`;

  const upstream = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(upstreamBody),
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json' },
  });
};
