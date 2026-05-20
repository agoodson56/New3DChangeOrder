/**
 * Shared types, helpers, and auth for /api/co/* endpoints.
 */

import { verifyToken } from './jwt';

export interface CoEnv {
  DB?: D1Database;
  JWT_SECRET?: string;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch?(statements: D1PreparedStatement[]): Promise<unknown>;
}
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[] }>;
  run(): Promise<{ success: boolean; meta?: unknown }>;
}

export type PagesContext<EnvT, Params extends Record<string, string> = Record<string, string>> = {
  request: Request;
  env: EnvT;
  params: Params;
};

const NO_STORE_HEADERS = {
  'Cache-Control': 'private, no-store, no-cache, max-age=0',
  'Pragma': 'no-cache',
  'X-Content-Type-Options': 'nosniff',
};

export const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...NO_STORE_HEADERS },
  });

export function requestId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export async function authContext(
  request: Request,
  secret: string,
): Promise<{ userId: number; email: string } | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const payload = await verifyToken(authHeader.slice(7), secret);
  if (!payload) return null;
  return { userId: payload.userId, email: payload.email };
}

export function newCoId(): string {
  return `co_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// The DB row shape — matches change_orders columns.
export interface CoRow {
  id: string;
  user_id: number;
  org_id: string;
  pco_number: string | null;
  revision: number;
  parent_id: string | null;
  customer: string | null;
  project_name: string | null;
  data: string;             // JSON-encoded ChangeOrderData
  grand_total: number;
  status: string;
  notes: string | null;
  close_reason: string | null;
  saved_at: number;
  updated_at: number;
  updated_by: string | null;
}

export type CoStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
const VALID_STATUSES: CoStatus[] = ['pending', 'accepted', 'rejected', 'withdrawn'];
export function isValidStatus(s: string): s is CoStatus {
  return (VALID_STATUSES as string[]).includes(s);
}

// What the client gets back. Same shape as a row but `data` is parsed JSON,
// not the raw string.
export interface CoResponse {
  id: string;
  pcoNumber: string | null;
  revision: number;
  parentId: string | null;
  customer: string | null;
  projectName: string | null;
  data: unknown;
  grandTotal: number;
  status: CoStatus;
  notes: string | null;
  closeReason: string | null;
  savedAt: number;
  updatedAt: number;
  updatedBy: string | null;
}

export function rowToResponse(row: CoRow, parseData = true): CoResponse {
  let data: unknown = null;
  if (parseData) {
    try { data = JSON.parse(row.data); }
    catch { data = null; }
  }
  return {
    id: row.id,
    pcoNumber: row.pco_number,
    revision: row.revision,
    parentId: row.parent_id,
    customer: row.customer,
    projectName: row.project_name,
    data,
    grandTotal: row.grand_total,
    status: (isValidStatus(row.status) ? row.status : 'pending'),
    notes: row.notes,
    closeReason: row.close_reason,
    savedAt: row.saved_at,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

/**
 * Best-effort PCO-number extraction from CO data. Used to set the column we
 * filter/sort by without parsing JSON on every list query.
 */
export function extractMeta(data: unknown): { pcoNumber: string | null; customer: string | null; projectName: string | null } {
  if (!data || typeof data !== 'object') {
    return { pcoNumber: null, customer: null, projectName: null };
  }
  const d = data as Record<string, unknown>;
  const toStr = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);
  return {
    pcoNumber: toStr(d.pcoNumber),
    customer: toStr(d.customer),
    projectName: toStr(d.projectName),
  };
}

/**
 * Maximum size of a single CO blob. Generous because COs include attachments
 * occasionally, but caps the worst case so a runaway client can't fill D1.
 */
export const MAX_CO_BYTES = 5_000_000;
