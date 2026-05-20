/**
 *   GET  /api/co  → list user's change orders (no `data` body — lightweight summaries)
 *   POST /api/co  → create a new change order
 *
 * Auth: JWT Bearer token required.
 */

import {
  authContext, json, requestId, newCoId, extractMeta, rowToResponse, MAX_CO_BYTES,
  type CoEnv, type CoRow, type PagesContext,
} from '../lib/coShared';

export const onRequestGet = async ({ request, env }: PagesContext<CoEnv>): Promise<Response> => {
  if (!env.DB || !env.JWT_SECRET) return json({ error: 'Server not configured.' }, 503);

  const auth = await authContext(request, env.JWT_SECRET);
  if (!auth) return json({ error: 'Unauthenticated.' }, 401);

  try {
    const { results } = await env.DB
      .prepare(
        `SELECT id, user_id, org_id, pco_number, revision, parent_id, customer, project_name,
                '' as data, grand_total, status, notes, close_reason, saved_at, updated_at, updated_by
         FROM change_orders
         WHERE user_id = ?
         ORDER BY updated_at DESC`,
      )
      .bind(auth.userId)
      .all<CoRow>();

    const items = results.map(r => rowToResponse(r, /* parseData */ false));
    return json({ items });
  } catch (e) {
    const rid = requestId();
    console.error(`[co:GET ${rid}] db read failed:`, e instanceof Error ? e.message : String(e));
    return json({ error: 'Database read failed.', requestId: rid }, 500);
  }
};

export const onRequestPost = async ({ request, env }: PagesContext<CoEnv>): Promise<Response> => {
  if (!env.DB || !env.JWT_SECRET) return json({ error: 'Server not configured.' }, 503);

  const auth = await authContext(request, env.JWT_SECRET);
  if (!auth) return json({ error: 'Unauthenticated.' }, 401);

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

  const id = newCoId();
  const now = Date.now();
  const dataJson = JSON.stringify(body.data);
  const meta = extractMeta(body.data);

  try {
    await env.DB
      .prepare(
        `INSERT INTO change_orders
         (id, user_id, org_id, pco_number, revision, parent_id, customer, project_name,
          data, grand_total, status, saved_at, updated_at, updated_by)
         VALUES (?, ?, 'default', ?, 0, NULL, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
      )
      .bind(id, auth.userId, meta.pcoNumber, meta.customer, meta.projectName, dataJson, grandTotal, now, now, auth.email)
      .run();

    const row = await env.DB
      .prepare('SELECT * FROM change_orders WHERE id = ?')
      .bind(id)
      .first<CoRow>();
    if (!row) return json({ error: 'Created but could not re-read row.' }, 500);
    return json({ item: rowToResponse(row) }, 201);
  } catch (e) {
    const rid = requestId();
    console.error(`[co:POST ${rid}] db write failed:`, e instanceof Error ? e.message : String(e));
    return json({ error: 'Database write failed.', requestId: rid }, 500);
  }
};
