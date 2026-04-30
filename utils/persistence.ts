/**
 * localStorage persistence for the change order app.
 *
 * Features wired through this module:
 *  - Auto-saved draft (current in-progress CO survives browser refresh)
 *  - Saved labor rates (no re-entry per session)
 *  - Customer history (auto-fill admin fields from past COs)
 *  - CO history with status tracking (win/loss tracking)
 *
 * All data lives in the browser only. If you need cross-device sync, layer a
 * server backend on top — schemas here are forward-compatible.
 */

import type { ChangeOrderData, LaborRates, AdminData } from '../types';

// =============================================================================
// Storage keys — bumped on schema-breaking changes only
// =============================================================================

const KEYS = {
  draft: 'co_draft_v1',
  rates: 'co_labor_rates_v1',
  customers: 'co_customers_v1',
  history: 'co_history_v1',
} as const;

const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_CUSTOMERS = 100;
const MAX_HISTORY = 200;

// Defensive read — never throws, always returns a safe default.
function readJson<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Quota exceeded or storage disabled — best effort, drop silently.
    console.warn(`localStorage write failed for ${key}:`, e);
  }
}

function removeKey(key: string): void {
  if (typeof localStorage === 'undefined') return;
  try { localStorage.removeItem(key); } catch { /* noop */ }
}

// =============================================================================
// Draft auto-save
// =============================================================================

export interface SavedDraft {
  coData: ChangeOrderData;
  adminData?: AdminData;
  savedAt: number;
  stage: 'intake' | 'review' | 'proposal';
}

export function saveDraft(draft: Omit<SavedDraft, 'savedAt'>): void {
  writeJson(KEYS.draft, { ...draft, savedAt: Date.now() } satisfies SavedDraft);
}

export function loadDraft(): SavedDraft | null {
  const draft = readJson<SavedDraft | null>(KEYS.draft, null);
  if (!draft) return null;
  // Drop drafts older than the TTL — coordinator probably moved on.
  if (Date.now() - draft.savedAt > DRAFT_TTL_MS) {
    clearDraft();
    return null;
  }
  return draft;
}

export function clearDraft(): void {
  removeKey(KEYS.draft);
}

// =============================================================================
// Labor rates
// =============================================================================

export function saveRates(rates: LaborRates): void {
  writeJson(KEYS.rates, rates);
}

export function loadRates(): LaborRates | null {
  const rates = readJson<LaborRates | null>(KEYS.rates, null);
  if (!rates) return null;
  // Validate shape — schema may have changed
  if (typeof rates.base !== 'number' || rates.base <= 0) return null;
  return rates;
}

// =============================================================================
// Customer history (for auto-fill)
// =============================================================================

export interface SavedCustomer {
  customer: string;
  contact: string;
  address: string;
  phone: string;
  projectName?: string;
  officeId?: string;
  lastUsed: number;
  useCount: number;
}

function customerKey(customer: string): string {
  return customer.trim().toLowerCase();
}

export function rememberCustomer(admin: AdminData): void {
  if (!admin.customer || !admin.customer.trim()) return;
  const all = readJson<SavedCustomer[]>(KEYS.customers, []);
  const key = customerKey(admin.customer);
  const existing = all.find(c => customerKey(c.customer) === key);
  const now = Date.now();
  if (existing) {
    existing.contact = admin.contact || existing.contact;
    existing.address = admin.address || existing.address;
    existing.phone = admin.phone || existing.phone;
    existing.projectName = admin.projectName || existing.projectName;
    existing.officeId = admin.officeId || existing.officeId;
    existing.lastUsed = now;
    existing.useCount += 1;
  } else {
    all.push({
      customer: admin.customer,
      contact: admin.contact,
      address: admin.address,
      phone: admin.phone,
      projectName: admin.projectName,
      officeId: admin.officeId,
      lastUsed: now,
      useCount: 1,
    });
  }
  // Trim oldest if we exceed the cap
  all.sort((a, b) => b.lastUsed - a.lastUsed);
  if (all.length > MAX_CUSTOMERS) all.length = MAX_CUSTOMERS;
  writeJson(KEYS.customers, all);
}

export function loadRecentCustomers(limit = 20): SavedCustomer[] {
  const all = readJson<SavedCustomer[]>(KEYS.customers, []);
  return all
    .slice()
    .sort((a, b) => b.lastUsed - a.lastUsed)
    .slice(0, limit);
}

export function findCustomerByName(name: string): SavedCustomer | null {
  if (!name || !name.trim()) return null;
  const all = readJson<SavedCustomer[]>(KEYS.customers, []);
  const key = customerKey(name);
  return all.find(c => customerKey(c.customer) === key) || null;
}

export function deleteCustomer(name: string): void {
  const all = readJson<SavedCustomer[]>(KEYS.customers, []);
  const key = customerKey(name);
  const filtered = all.filter(c => customerKey(c.customer) !== key);
  writeJson(KEYS.customers, filtered);
}

// =============================================================================
// Change-order history (for win-rate tracking)
// =============================================================================

export type COStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export interface SavedCO {
  id: string;
  coData: ChangeOrderData;
  grandTotal: number;
  status: COStatus;
  savedAt: number;
  updatedAt: number;
  notes?: string;
}

function makeId(): string {
  return `co_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function saveToHistory(coData: ChangeOrderData, grandTotal: number): SavedCO {
  const all = readJson<SavedCO[]>(KEYS.history, []);
  const now = Date.now();
  const entry: SavedCO = {
    id: makeId(),
    coData,
    grandTotal,
    status: 'pending',
    savedAt: now,
    updatedAt: now,
  };
  all.unshift(entry); // Most recent first
  if (all.length > MAX_HISTORY) all.length = MAX_HISTORY;
  writeJson(KEYS.history, all);
  return entry;
}

export function loadHistory(): SavedCO[] {
  return readJson<SavedCO[]>(KEYS.history, []);
}

export function updateHistoryStatus(id: string, status: COStatus, notes?: string): void {
  const all = readJson<SavedCO[]>(KEYS.history, []);
  const idx = all.findIndex(c => c.id === id);
  if (idx === -1) return;
  all[idx] = {
    ...all[idx],
    status,
    notes: notes ?? all[idx].notes,
    updatedAt: Date.now(),
  };
  writeJson(KEYS.history, all);
}

export function deleteFromHistory(id: string): void {
  const all = readJson<SavedCO[]>(KEYS.history, []);
  writeJson(KEYS.history, all.filter(c => c.id !== id));
}

export interface WinRateStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  withdrawn: number;
  winRatePercent: number; // accepted / (accepted + rejected), 0-100
  totalAcceptedRevenue: number;
  averageCoSize: number;
}

export function getWinRateStats(): WinRateStats {
  const all = loadHistory();
  const accepted = all.filter(c => c.status === 'accepted');
  const rejected = all.filter(c => c.status === 'rejected');
  const pending = all.filter(c => c.status === 'pending');
  const withdrawn = all.filter(c => c.status === 'withdrawn');
  const closed = accepted.length + rejected.length;
  return {
    total: all.length,
    pending: pending.length,
    accepted: accepted.length,
    rejected: rejected.length,
    withdrawn: withdrawn.length,
    winRatePercent: closed === 0 ? 0 : Math.round((accepted.length / closed) * 100),
    totalAcceptedRevenue: accepted.reduce((sum, c) => sum + c.grandTotal, 0),
    averageCoSize: all.length === 0 ? 0 : all.reduce((sum, c) => sum + c.grandTotal, 0) / all.length,
  };
}
