import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveDraft, loadDraft, clearDraft,
  saveRates, loadRates,
  rememberCustomer, loadRecentCustomers, findCustomerByName,
  saveToHistory, loadHistory, updateHistoryStatus, deleteFromHistory, getWinRateStats,
} from './persistence';
import type { ChangeOrderData, LaborRates, AdminData } from '../types';

// Minimal in-memory localStorage shim. The persistence module now checks for
// `typeof localStorage !== 'undefined'` so we can run these tests in plain
// Node without jsdom — install a fresh store on globalThis before each test.
class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string) { return this.store.get(key) ?? null; }
  setItem(key: string, value: string) { this.store.set(key, value); }
  removeItem(key: string) { this.store.delete(key); }
  clear() { this.store.clear(); }
  get length() { return this.store.size; }
  key(i: number) { return Array.from(this.store.keys())[i] ?? null; }
}

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: new MemoryStorage(),
    writable: true,
    configurable: true,
  });
});

const sampleCo: ChangeOrderData = {
  customer: 'Acme', contact: 'John', projectName: 'Warehouse', address: '1 Main St',
  phone: '555-0100', projectNumber: '100', rfiNumber: '', pcoNumber: '',
  coordinatorIntent: 'Add cameras', technicalScope: 'Install',
  systemsImpacted: ['CCTV'], materials: [], labor: [],
  standardsReview: [], assumptions: [], exclusions: [],
  professionalNotes: '', confidenceScore: 90, nextSteps: [],
};

// =============================================================================
// Drafts
// =============================================================================
describe('persistence — draft', () => {
  it('round-trips a draft', () => {
    saveDraft({ coData: sampleCo, stage: 'review' });
    const loaded = loadDraft();
    expect(loaded?.coData.customer).toBe('Acme');
    expect(loaded?.stage).toBe('review');
    expect(loaded?.savedAt).toBeGreaterThan(0);
  });

  it('returns null when no draft exists', () => {
    expect(loadDraft()).toBeNull();
  });

  it('clearDraft removes the saved draft', () => {
    saveDraft({ coData: sampleCo, stage: 'review' });
    clearDraft();
    expect(loadDraft()).toBeNull();
  });

  it('drops drafts older than 7 days', () => {
    // Manually write a stale draft
    const stale = { coData: sampleCo, stage: 'review', savedAt: Date.now() - 8 * 24 * 60 * 60 * 1000 };
    localStorage.setItem('co_draft_v1', JSON.stringify(stale));
    expect(loadDraft()).toBeNull();
    // Should also have cleaned up the stale entry
    expect(localStorage.getItem('co_draft_v1')).toBeNull();
  });

  it('survives malformed JSON in storage', () => {
    localStorage.setItem('co_draft_v1', '{not valid json');
    expect(loadDraft()).toBeNull();
  });
});

// =============================================================================
// Labor rates
// =============================================================================
describe('persistence — labor rates', () => {
  it('round-trips rates', () => {
    const rates: LaborRates = { base: 175, afterHours: 262.5, emergency: 350 };
    saveRates(rates);
    expect(loadRates()).toEqual(rates);
  });

  it('returns null when no rates saved', () => {
    expect(loadRates()).toBeNull();
  });

  it('rejects invalid stored rates (zero or non-numeric base)', () => {
    localStorage.setItem('co_labor_rates_v1', JSON.stringify({ base: 0, afterHours: 0, emergency: 0 }));
    expect(loadRates()).toBeNull();

    localStorage.setItem('co_labor_rates_v1', JSON.stringify({ base: 'oops' }));
    expect(loadRates()).toBeNull();
  });
});

// =============================================================================
// Customer history
// =============================================================================
describe('persistence — customer history', () => {
  const admin = (over: Partial<AdminData>): AdminData => ({
    customer: 'Acme', contact: 'John', address: '1 Main', phone: '555',
    projectName: '', projectNumber: '', rfiNumber: '', pcoNumber: '',
    ...over,
  });

  it('saves and finds a customer by name', () => {
    rememberCustomer(admin({}));
    const c = findCustomerByName('Acme');
    expect(c?.contact).toBe('John');
    expect(c?.useCount).toBe(1);
  });

  it('skips empty customer names', () => {
    rememberCustomer(admin({ customer: '' }));
    expect(loadRecentCustomers()).toHaveLength(0);
  });

  it('lookup is case-insensitive', () => {
    rememberCustomer(admin({ customer: 'AcMe Corp' }));
    expect(findCustomerByName('acme corp')?.customer).toBe('AcMe Corp');
  });

  it('updates existing customer and increments useCount', () => {
    rememberCustomer(admin({ customer: 'Acme', contact: 'John' }));
    rememberCustomer(admin({ customer: 'Acme', contact: 'Jane' }));
    const c = findCustomerByName('Acme');
    expect(c?.contact).toBe('Jane'); // last wins
    expect(c?.useCount).toBe(2);
  });

  it('returns recent customers sorted by lastUsed desc', () => {
    rememberCustomer(admin({ customer: 'First' }));
    // Force a tiny delay so timestamps differ
    const before = Date.now();
    while (Date.now() === before) { /* spin */ }
    rememberCustomer(admin({ customer: 'Second' }));
    const recent = loadRecentCustomers();
    expect(recent[0].customer).toBe('Second');
    expect(recent[1].customer).toBe('First');
  });
});

// =============================================================================
// CO history & win-rate stats
// =============================================================================
describe('persistence — CO history & win-rate', () => {
  it('saves and loads history with most-recent first', () => {
    saveToHistory(sampleCo, 5000);
    const before = Date.now();
    while (Date.now() === before) { /* spin */ }
    saveToHistory({ ...sampleCo, customer: 'Beta' }, 8000);
    const all = loadHistory();
    expect(all).toHaveLength(2);
    expect(all[0].coData.customer).toBe('Beta'); // newest first
  });

  it('updates status', () => {
    const entry = saveToHistory(sampleCo, 5000);
    updateHistoryStatus(entry.id, 'accepted');
    const reloaded = loadHistory().find(c => c.id === entry.id);
    expect(reloaded?.status).toBe('accepted');
  });

  it('removes from history', () => {
    const entry = saveToHistory(sampleCo, 5000);
    deleteFromHistory(entry.id);
    expect(loadHistory()).toHaveLength(0);
  });

  it('calculates win rate correctly', () => {
    // 4 accepted + 1 rejected + 1 pending = 80% win rate (4/5 closed)
    for (let i = 0; i < 4; i++) {
      const e = saveToHistory(sampleCo, 1000);
      updateHistoryStatus(e.id, 'accepted');
    }
    const r = saveToHistory(sampleCo, 2000);
    updateHistoryStatus(r.id, 'rejected');
    saveToHistory(sampleCo, 5000); // pending

    const stats = getWinRateStats();
    expect(stats.total).toBe(6);
    expect(stats.accepted).toBe(4);
    expect(stats.rejected).toBe(1);
    expect(stats.pending).toBe(1);
    expect(stats.winRatePercent).toBe(80); // 4/5 closed
    expect(stats.totalAcceptedRevenue).toBe(4000);
  });

  it('returns 0 win rate when no closed deals', () => {
    saveToHistory(sampleCo, 1000); // pending
    const stats = getWinRateStats();
    expect(stats.winRatePercent).toBe(0);
    expect(stats.accepted).toBe(0);
  });
});
