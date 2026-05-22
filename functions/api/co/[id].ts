/**
 *   GET    /api/co/:id  → fetch one change order (full data)
 *   PUT    /api/co/:id  → update the data of an existing change order in-place
 *   DELETE /api/co/:id  → delete one change order
 *
 * Auth: JWT Bearer token required. Caller must own the row (user_id match).
 */

import {
  authContext, json, requestId, extractMeta, rowToResponse, MAX_CO_BYTES,
  type CoEnv, type CoRow, type PagesContext,
} from '../../lib/coShared';

export const onRequestGet = async ({ request, env, params }: PagesContext<CoEnv, { id?: string }>): Promise<Response> => {
  if (!env.DB || !env.JWT_SECRET) return json({ error: 'Server not configured.' }, 503);

  const auth = await authContext(request, env.JWT_SECRET);
  if (!auth) return json({ error: 'Unauthenticated.' }, 401);

  const id = params.id || '';
  if (!id) return json({ error: 'Missing id.' }, 400);

  try {
    const row = await env.DB
      .prepare('SELECT * FROM change_orders WHERE id = ? AND user_id = ?')
      .bind(id, auth.userId)
      .first<CoRow>();
    if (!row) return json({ error: 'Not found.' }, 404);
    return json({ item: rowToResponse(row) });
  } catch (e) {
    const rid = requestId();
    console.error(`[co:GET/${id} ${rid}] db read failed:`, e instanceof Error ? e.message : String(e));
    return json({ error: 'Database read failed.', requestId: rid }, 500);
  }
};

export const onRequestPut = async ({ request, env, params }: PagesContext<CoEnv, { id?: string }>): Promise<Response> => {
  if (!env.DB || !env.JWT_SECRET) return json({ error: 'Server not configured.' }, 503);

  const auth = await authContext(request, env.JWT_SECRET);
  if (!auth) return json({ error: 'Unauthenticated.' }, 401);

  const id = params.id || '';
  if (!id) return json({ error: 'Missing id.' }, 400);

  let bodyText: string;
  try { bodyText = await request.text(); }
  catch { return json({ error: 'Could not read request body.' }, 400); }
  if (bodyText.length > MAX_CO_BYTES) {
    return json({ error: `Payload too large (max ${MAX_CO_BYTES} bytes).` }, 413);
  }

  let body: { data?: unknown; grandTotal?: number };
  try { body = JSON.parse(bodyText); }
  catch { return json({ error: 'Body must be valid JSON.' }, 400); }

  if (!body.data || typeof body.data !== 'object') {
    return json({ error: '`data` is required (object).' }, 400);
  }
  const grandTotal = Number(body.grandTotal ?? 0);
  if (!Number.isFinite(grandTotal)) {
    return json({ error: '`grandTotal` must be a number.' }, 400);
  }

  const dataJson = JSON.stringify(body.data);
  const meta = extractMeta(body.data);
  const now = Date.now();

  try {
    // Batch the update + re-read into one atomic round-trip. D1 doesn't expose
    // rowsAffected uniformly, so we re-select to confirm the caller owns the row.
    const batchResults = await env.DB.batch<CoRow>([
      env.DB
        .prepare(
          `UPDATE change_orders
           SET data = ?, grand_total = ?, pco_number = ?, customer = ?, project_name = ?,
               updated_at = ?, updated_by = ?
           WHERE id = ? AND user_id = ?`,
        )
        .bind(dataJson, grandTotal, meta.pcoNumber, meta.customer, meta.projectName, now, auth.email, id, auth.userId),
      env.DB.prepare('SELECT * FROM change_orders WHERE id = ? AND user_id = ?').bind(id, auth.userId),
    ]);
    const row = batchResults[1]?.results?.[0];
    if (!row) return json({ error: 'Not found.' }, 404);
    return json({ item: rowToResponse(row) });
  } catch (e) {
    const rid = requestId();
    console.error(`[co:PUT/${id} ${rid}] db write failed:`, e instanceof Error ? e.message : String(e));
    return json({ error: 'Database write failed.', requestId: rid }, 500);
  }
};

export const onRequestDelete = async ({ request, env, params }: PagesContext<CoEnv, { id?: string }>): Promise<Response> => {
  if (!env.DB || !env.JWT_SECRET) return json({ error: 'Server not configured.' }, 503);

  const auth = await authContext(request, env.JWT_SECRET);
  if (!auth) return json({ error: 'Unauthenticated.' }, 401);

  const id = params.id || '';
  if (!id) return json({ error: 'Missing id.' }, 400);

  try {
    await env.DB
      .prepare('DELETE FROM change_orders WHERE id = ? AND user_id = ?')
      .bind(id, auth.userId)
      .run();
    return json({ ok: true });
  } catch (e) {
    const rid = requestId();
    console.error(`[co:DELETE/${id} ${rid}] db write failed:`, e instanceof Error ? e.message : String(e));
    return json({ error: 'Database write failed.', requestId: rid }, 500);
  }
};
