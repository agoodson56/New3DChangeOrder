/**
 *   PUT /api/co/:id/status  → update status + optional notes + closeReason
 *
 * Body: { status: 'pending'|'accepted'|'rejected'|'withdrawn', notes?: string, closeReason?: string }
 */

import {
  authContext, json, requestId, rowToResponse, isValidStatus,
  type CoEnv, type CoRow, type PagesContext,
} from '../../../lib/coShared';

export const onRequestPut = async ({ request, env, params }: PagesContext<CoEnv, { id?: string }>): Promise<Response> => {
  if (!env.DB || !env.JWT_SECRET) return json({ error: 'Server not configured.' }, 503);

  const auth = await authContext(request, env.JWT_SECRET);
  if (!auth) return json({ error: 'Unauthenticated.' }, 401);

  const id = params.id || '';
  if (!id) return json({ error: 'Missing id.' }, 400);

  let body: { status?: string; notes?: string; closeReason?: string };
  try { body = await request.json(); }
  catch { return json({ error: 'Body must be valid JSON.' }, 400); }

  if (!body.status || !isValidStatus(body.status)) {
    return json({ error: 'Invalid status. Use pending|accepted|rejected|withdrawn.' }, 400);
  }
  const status = body.status;
  const notes = typeof body.notes === 'string' ? body.notes : null;
  const closeReason = typeof body.closeReason === 'string' ? body.closeReason : null;
  const now = Date.now();

  try {
    await env.DB
      .prepare(
        `UPDATE change_orders
         SET status = ?, notes = ?, close_reason = ?, updated_at = ?, updated_by = ?
         WHERE id = ? AND user_id = ?`,
      )
      .bind(status, notes, closeReason, now, auth.email, id, auth.userId)
      .run();
    const row = await env.DB
      .prepare('SELECT * FROM change_orders WHERE id = ? AND user_id = ?')
      .bind(id, auth.userId)
      .first<CoRow>();
    if (!row) return json({ error: 'Not found.' }, 404);
    return json({ item: rowToResponse(row) });
  } catch (e) {
    const rid = requestId();
    console.error(`[co:status/${id} ${rid}] db write failed:`, e instanceof Error ? e.message : String(e));
    return json({ error: 'Database write failed.', requestId: rid }, 500);
  }
};
