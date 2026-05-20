/**
 * Client for /api/co/* — cloud-backed change order CRUD.
 *
 * All calls require a JWT bearer token (obtained from AuthContext).
 * Throws ChangeOrderApiError on non-2xx responses with a parseable error body.
 */

import type { ChangeOrderData } from '../types';

export type CoStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type CloseReason =
  | 'price_too_high'
  | 'too_slow'
  | 'scope_wrong'
  | 'competitor_won'
  | 'customer_postponed'
  | 'no_budget'
  | 'duplicate_or_obsolete'
  | 'other';

/** Server's per-row shape. `data` is the full ChangeOrderData (parsed) on get/save;
 *  on list responses, `data` is null since the server omits the JSON body. */
export interface SavedCO {
  id: string;
  pcoNumber: string | null;
  revision: number;
  parentId: string | null;
  customer: string | null;
  projectName: string | null;
  data: ChangeOrderData | null;
  grandTotal: number;
  status: CoStatus;
  notes: string | null;
  closeReason: CloseReason | string | null;
  savedAt: number;
  updatedAt: number;
  updatedBy: string | null;
}

export class ChangeOrderApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ChangeOrderApiError';
    this.status = status;
  }
}

function authHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

async function handle<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { msg = (JSON.parse(text) as { error?: string }).error ?? msg; }
    catch { /* keep default */ }
    throw new ChangeOrderApiError(res.status, msg);
  }
  return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
}

export async function listChangeOrders(token: string): Promise<SavedCO[]> {
  const res = await fetch('/api/co', { method: 'GET', headers: authHeaders(token) });
  const body = await handle<{ items: SavedCO[] }>(res);
  return body.items;
}

export async function getChangeOrder(token: string, id: string): Promise<SavedCO> {
  const res = await fetch(`/api/co/${encodeURIComponent(id)}`, {
    method: 'GET', headers: authHeaders(token),
  });
  const body = await handle<{ item: SavedCO }>(res);
  return body.item;
}

export async function createChangeOrder(
  token: string,
  data: ChangeOrderData,
  grandTotal: number,
): Promise<SavedCO> {
  const res = await fetch('/api/co', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ data, grandTotal }),
  });
  const body = await handle<{ item: SavedCO }>(res);
  return body.item;
}

export async function updateChangeOrder(
  token: string,
  id: string,
  data: ChangeOrderData,
  grandTotal: number,
): Promise<SavedCO> {
  const res = await fetch(`/api/co/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ data, grandTotal }),
  });
  const body = await handle<{ item: SavedCO }>(res);
  return body.item;
}

/** Create a new revision linked to :id via parent_id. PCO number gets -R{n}. */
export async function reviseChangeOrder(
  token: string,
  id: string,
  data: ChangeOrderData,
  grandTotal: number,
): Promise<SavedCO> {
  const res = await fetch(`/api/co/${encodeURIComponent(id)}/revise`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ data, grandTotal }),
  });
  const body = await handle<{ item: SavedCO }>(res);
  return body.item;
}

export async function updateChangeOrderStatus(
  token: string,
  id: string,
  status: CoStatus,
  notes?: string,
  closeReason?: string,
): Promise<SavedCO> {
  const res = await fetch(`/api/co/${encodeURIComponent(id)}/status`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ status, notes, closeReason }),
  });
  const body = await handle<{ item: SavedCO }>(res);
  return body.item;
}

export async function deleteChangeOrder(token: string, id: string): Promise<void> {
  const res = await fetch(`/api/co/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  await handle<{ ok: boolean }>(res);
}
