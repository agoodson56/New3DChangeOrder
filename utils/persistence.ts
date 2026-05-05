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
  templates: 'co_templates_v1',
} as const;

const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_CUSTOMERS = 100;
const MAX_HISTORY = 200;
const MAX_TEMPLATES = 50;

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

/** Subscribers to write failures (e.g., the UI quota banner). */
type WriteFailureListener = (info: { key: string; error: unknown; quotaExceeded: boolean }) => void;
const writeFailureListeners = new Set<WriteFailureListener>();
export function onWriteFailure(fn: WriteFailureListener): () => void {
  writeFailureListeners.add(fn);
  return () => { writeFailureListeners.delete(fn); };
}

/** Heuristic: most browsers raise QuotaExceededError or DOMException(22) on quota. */
function isQuotaError(e: unknown): boolean {
  if (e instanceof DOMException) {
    return e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014 /* Firefox NS_ERROR_DOM_QUOTA_REACHED */;
  }
  if (e instanceof Error) {
    return /quota|exceeded|storage/i.test(e.message);
  }
  return false;
}

function writeJson(key: string, value: unknown): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Tell cloud sync this key changed; it'll debounce-push to the server.
    // Imported lazily so the persistence layer keeps working even if cloudSync
    // is not initialized (e.g., in tests).
    void notifyCloudSync(key);
  } catch (e) {
    // Surface the failure (especially quota errors) so the UI can warn the
    // operator their work isn't being saved. Previously this was a silent
    // console.warn that left coordinators unaware their draft wouldn't survive
    // a refresh.
    const quotaExceeded = isQuotaError(e);
    console.warn(`localStorage write failed for ${key}${quotaExceeded ? ' (quota exceeded)' : ''}:`, e);
    for (const fn of writeFailureListeners) {
      try { fn({ key, error: e, quotaExceeded }); } catch { /* never let a listener error mask the original */ }
    }
  }
}

/**
 * Estimate localStorage usage as a fraction of the browser's typical 5MB cap.
 * Best-effort — exact quota varies by browser and origin. Used to surface a
 * "running low on space" warning before writes start failing.
 */
export function estimateStorageUsage(): { usedBytes: number; estimatedFraction: number } {
  if (typeof localStorage === 'undefined') return { usedBytes: 0, estimatedFraction: 0 };
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      const v = localStorage.getItem(k) ?? '';
      total += k.length + v.length;
    }
  } catch { /* storage disabled — return 0 */ }
  // Most browsers cap at ~5MB. Treat 4MB as 80% to leave headroom.
  return { usedBytes: total * 2 /* UTF-16 */, estimatedFraction: total * 2 / (5 * 1024 * 1024) };
}

/** Best-effort cloud sync notification. Imports lazily so tests / SSR don't break. */
async function notifyCloudSync(key: string): Promise<void> {
  try {
    const mod = await import('./cloudSync');
    mod.markDirty(key);
  } catch {
    // cloudSync not available — fine, we're in local-only mode.
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

/** BroadcastChannel for cross-tab draft awareness. Each tab posts after a
 *  draft write so other tabs can warn the operator if they're editing stale
 *  data. Lazy-initialized; tests / SSR are unaffected. */
type DraftBroadcastMessage = { type: 'draft-saved'; tabId: string; savedAt: number };
let _draftChannel: BroadcastChannel | null = null;
const TAB_ID = typeof crypto !== 'undefined' && 'randomUUID' in crypto
  ? crypto.randomUUID()
  : Math.random().toString(36).slice(2);
function getDraftChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null;
  if (_draftChannel === null) {
    try { _draftChannel = new BroadcastChannel('co_draft_v1'); } catch { return null; }
  }
  return _draftChannel;
}

/** Subscribe to "another tab saved a draft" notifications. Returns unsubscribe. */
export function onDraftFromOtherTab(fn: (msg: DraftBroadcastMessage) => void): () => void {
  const ch = getDraftChannel();
  if (!ch) return () => {};
  const handler = (ev: MessageEvent<DraftBroadcastMessage>) => {
    // Ignore our own broadcasts.
    if (ev.data?.tabId === TAB_ID) return;
    if (ev.data?.type === 'draft-saved') fn(ev.data);
  };
  ch.addEventListener('message', handler);
  return () => ch.removeEventListener('message', handler);
}

export function saveDraft(draft: Omit<SavedDraft, 'savedAt'>): void {
  const savedAt = Date.now();
  writeJson(KEYS.draft, { ...draft, savedAt } satisfies SavedDraft);
  // Notify other tabs they're now editing a stale view of the draft.
  const ch = getDraftChannel();
  if (ch) {
    try { ch.postMessage({ type: 'draft-saved', tabId: TAB_ID, savedAt } satisfies DraftBroadcastMessage); }
    catch { /* channel closed — ignore */ }
  }
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

/**
 * Structured reason codes for closing a CO. Coupled with `notes` (free text)
 * for context, these power the "why are we losing bids" feedback loop.
 */
export type CloseReason =
  | 'price_too_high'
  | 'too_slow'
  | 'scope_wrong'
  | 'competitor_won'
  | 'customer_postponed'
  | 'no_budget'
  | 'duplicate_or_obsolete'
  | 'other';

export const CLOSE_REASON_LABELS: Record<CloseReason, string> = {
  price_too_high: 'Price too high',
  too_slow: 'We took too long',
  scope_wrong: 'Scope didn\'t match the need',
  competitor_won: 'Customer chose a competitor',
  customer_postponed: 'Customer postponed the project',
  no_budget: 'No budget',
  duplicate_or_obsolete: 'Duplicate / obsolete',
  other: 'Other',
};

export interface SavedCO {
  id: string;
  coData: ChangeOrderData;
  grandTotal: number;
  status: COStatus;
  savedAt: number;
  updatedAt: number;
  notes?: string;
  /** Structured reason for closing this CO (rejected/withdrawn). Powers
   *  win/loss aggregate analysis. Optional — older saved COs may not have it. */
  closeReason?: CloseReason;
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

export function updateHistoryStatus(
  id: string,
  status: COStatus,
  notes?: string,
  closeReason?: CloseReason
): void {
  const all = readJson<SavedCO[]>(KEYS.history, []);
  const idx = all.findIndex(c => c.id === id);
  if (idx === -1) return;
  const prev = all[idx];
  if (!prev) return; // index guarded by findIndex above, but keeps strict mode happy
  all[idx] = {
    ...prev,
    status,
    notes: notes ?? prev.notes,
    closeReason: closeReason ?? prev.closeReason,
    updatedAt: Date.now(),
  };
  writeJson(KEYS.history, all);
}

// =============================================================================
// Templates — saved CO scopes for fast re-use on repetitive jobs.
//
// Templates strip customer-specific fields (name/contact/address/phone/PCO etc)
// when saved, but keep materials, labor, scope, systems, assumptions, exclusions.
// Loading a template into the intake bypasses the AI's Brain 1 (estimator) for
// the matching scope — coordinator just fills in the new customer and submits.
// Pricing freshness is the trade-off: re-run a per-line MSRP lookup on any
// material that's been a while since update.
// =============================================================================

export interface SavedTemplate {
  id: string;
  name: string;
  /** Optional one-line description of when to use this template. */
  description?: string;
  /** The CO data with customer-specific fields blanked. */
  coData: ChangeOrderData;
  savedAt: number;
  /** Tracks how often the template has been applied — surface popular ones. */
  useCount: number;
  /** Last time it was applied. */
  lastUsed?: number;
}

function templateId(): string {
  return `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Strip customer-specific fields so a template can be safely reused. */
function stripCustomerFields(co: ChangeOrderData): ChangeOrderData {
  return {
    ...co,
    customer: '',
    contact: '',
    projectName: '',
    address: '',
    phone: '',
    projectNumber: '',
    rfiNumber: '',
    pcoNumber: '',
    coordinatorIntent: '',
    // Drop validation snapshot — it's about a specific historical CO, not the template.
    validationResult: undefined,
  };
}

export function saveTemplate(name: string, coData: ChangeOrderData, description?: string): SavedTemplate {
  const all = readJson<SavedTemplate[]>(KEYS.templates, []);
  const entry: SavedTemplate = {
    id: templateId(),
    name: name.trim() || 'Untitled template',
    description: description?.trim() || undefined,
    coData: stripCustomerFields(coData),
    savedAt: Date.now(),
    useCount: 0,
  };
  all.unshift(entry);
  if (all.length > MAX_TEMPLATES) all.length = MAX_TEMPLATES;
  writeJson(KEYS.templates, all);
  return entry;
}

export function loadTemplates(): SavedTemplate[] {
  return readJson<SavedTemplate[]>(KEYS.templates, []);
}

export function deleteTemplate(id: string): void {
  const all = readJson<SavedTemplate[]>(KEYS.templates, []);
  writeJson(KEYS.templates, all.filter(t => t.id !== id));
}

/** Mark a template as used — increments useCount and bumps lastUsed. */
export function touchTemplate(id: string): void {
  const all = readJson<SavedTemplate[]>(KEYS.templates, []);
  const idx = all.findIndex(t => t.id === id);
  if (idx === -1) return;
  const prev = all[idx];
  if (!prev) return;
  all[idx] = { ...prev, useCount: prev.useCount + 1, lastUsed: Date.now() };
  writeJson(KEYS.templates, all);
}

/**
 * Aggregate close reasons across all closed COs. The feedback loop:
 * "we keep losing because X" becomes data the team can act on.
 */
export function getCloseReasonStats(): Array<{ reason: CloseReason; label: string; count: number; lostRevenue: number }> {
  const all = loadHistory();
  const closed = all.filter(c => c.status === 'rejected' || c.status === 'withdrawn');
  const buckets = new Map<CloseReason, { count: number; lostRevenue: number }>();
  for (const co of closed) {
    const reason = co.closeReason ?? 'other';
    const cur = buckets.get(reason) ?? { count: 0, lostRevenue: 0 };
    cur.count += 1;
    cur.lostRevenue += co.grandTotal;
    buckets.set(reason, cur);
  }
  return Array.from(buckets.entries())
    .map(([reason, v]) => ({
      reason,
      label: CLOSE_REASON_LABELS[reason],
      count: v.count,
      lostRevenue: v.lostRevenue,
    }))
    .sort((a, b) => b.count - a.count);
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
  /** "Strict" win rate: accepted / (accepted + rejected). Excludes withdrawn.
   *  Most flattering — answers "of bids the customer made a decision on, how
   *  many did we win?" */
  winRatePercent: number;
  /** "Inclusive" win rate: accepted / (accepted + rejected + withdrawn).
   *  Treats withdrawn as a loss (we walked away or the customer ghosted).
   *  More conservative — answers "of all bids that left pending, how many
   *  did we win?" */
  inclusiveWinRatePercent: number;
  totalAcceptedRevenue: number;
  averageCoSize: number;
}

export function getWinRateStats(): WinRateStats {
  const all = loadHistory();
  const accepted = all.filter(c => c.status === 'accepted');
  const rejected = all.filter(c => c.status === 'rejected');
  const pending = all.filter(c => c.status === 'pending');
  const withdrawn = all.filter(c => c.status === 'withdrawn');
  const closedStrict = accepted.length + rejected.length;
  const closedInclusive = accepted.length + rejected.length + withdrawn.length;
  return {
    total: all.length,
    pending: pending.length,
    accepted: accepted.length,
    rejected: rejected.length,
    withdrawn: withdrawn.length,
    winRatePercent: closedStrict === 0 ? 0 : Math.round((accepted.length / closedStrict) * 100),
    inclusiveWinRatePercent: closedInclusive === 0 ? 0 : Math.round((accepted.length / closedInclusive) * 100),
    totalAcceptedRevenue: accepted.reduce((sum, c) => sum + c.grandTotal, 0),
    averageCoSize: all.length === 0 ? 0 : all.reduce((sum, c) => sum + c.grandTotal, 0) / all.length,
  };
}
