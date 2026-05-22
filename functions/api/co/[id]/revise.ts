/**
 *   POST /api/co/:id/revise  → create a revision of an existing change order.
 *
 * Creates a NEW row linked to :id via parent_id. revision = parent.revision + 1.
 * The new row's pco_number gets a "-R{revision}" suffix unless the body's data
 * already provides a pcoNumber (the client can override).
 *
 * Body: { data: ChangeOrderData, grandTotal: number }
 * Returns: { item: CoResponse } of the new row.
 */

import {
  authContext, json, requestId, newCoId, extractMeta, rowToResponse, MAX_CO_BYTES,
  type CoEnv, type CoRow, type PagesContext,
} from '../../../lib/coShared';

export const onRequestPost = async ({ request, env, params }: PagesContext<CoEnv, { id?: string }>): Promise<Response> => {
  if (!env.DB || !env.JWT_SECRET) return json({ error: 'Server not configured.' }, 503);

  const auth = await authContext(request, env.JWT_SECRET);
  if (!auth) return json({ error: 'Unauthenticated.' }, 401);

  const parentId = params.id || '';
  if (!parentId) return json({ error: 'Missing id.' }, 400);

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

  try {
    // Walk up to the original (root) so revision numbers stay stable across
    // chains: R1, R2, R3... regardless of which revision the caller revised.
    const parent = await env.DB
      .prepare('SELECT * FROM change_orders WHERE id = ? AND user_id = ?')
      .bind(parentId, auth.userId)
      .first<CoRow>();
    if (!parent) return json({ error: 'Parent CO not found.' }, 404);

    const rootId = parent.parent_id ?? parent.id;
    // Find the highest revision in this chain (root + all children).
    const highest = await env.DB
      .prepare(
        `SELECT MAX(revision) as max_rev FROM change_orders
         WHERE user_id = ? AND (id = ? OR parent_id = ?)`,
      )
      .bind(auth.userId, rootId, rootId)
      .first<{ max_rev: number | null }>();
    const nextRev = (highest?.max_rev ?? 0) + 1;

    const meta = extractMeta(body.data);
    // Use the original CO's PCO number stem; append -R{n}. If the caller's data
    // already supplies a pcoNumber, prefer that — they explicitly overrode.
    const rootPco = parent.pco_number ?? meta.pcoNumber ?? null;
    const stem = rootPco ? rootPco.replace(/-R\d+$/i, '') : null;
    const newPcoNumber = meta.pcoNumber && meta.pcoNumber !== rootPco
      ? meta.pcoNumber
      : (stem ? `${stem}-R${nextRev}` : null);

    // Also mirror the pcoNumber into the stored data so downstream PDFs / UI see the suffix.
    const stampedData: Record<string, unknown> = { ...(body.data as Record<string, unknown>) };
    if (newPcoNumber) stampedData.pcoNumber = newPcoNumber;
    const dataJson = JSON.stringify(stampedData);

    const id = newCoId();
    const now = Date.now();

    // Batch the insert + re-read into one atomic round-trip (batches run as a
    // single sequential SQL transaction in D1), instead of two network calls.
    const batchResults = await env.DB.batch([
      env.DB
        .prepare(
          `INSERT INTO change_orders
           (id, user_id, org_id, pco_number, revision, parent_id, customer, project_name,
            data, grand_total, status, saved_at, updated_at, updated_by)
           VALUES (?, ?, 'default', ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
        )
        .bind(
          id, auth.userId, newPcoNumber, nextRev, rootId,
          meta.customer ?? parent.customer, meta.projectName ?? parent.project_name,
          dataJson, grandTotal, now, now, auth.email,
        ),
      env.DB.prepare('SELECT * FROM change_orders WHERE id = ?').bind(id),
    ]);
    const row = (batchResults[1] as { results?: CoRow[] })?.results?.[0];
    if (!row) return json({ error: 'Created but could not re-read row.' }, 500);
    return json({ item: rowToResponse(row) }, 201);
  } catch (e) {
    const rid = requestId();
    console.error(`[co:revise/${parentId} ${rid}] db write failed:`, e instanceof Error ? e.message : String(e));
    return json({ error: 'Database write failed.', requestId: rid }, 500);
  }
};
