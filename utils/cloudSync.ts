/**
 * Cloud sync — keeps the localStorage cache aligned with the D1 backend.
 *
 * Strategy: hybrid.
 *   - localStorage is read by all components synchronously (no React refactor).
 *   - On boot, we pull all scopes from /api/data and write them into localStorage.
 *   - After every persistence write, we mark the scope dirty and a debounced
 *     pusher uploads it to /api/data/:scope.
 *   - If the network is unavailable, writes still hit localStorage; dirty flags
 *     remain set; the next online push catches up.
 *
 * Auth: relies on Cloudflare Access in front of /api/data*. If Access is not
 * configured, the endpoint will 401 and sync stays disabled — the app continues
 * to work in single-device mode.
 *
 * If you want to disable cloud sync temporarily (e.g., during a migration):
 *   localStorage.setItem('co_cloud_sync_disabled', '1');
 */

export type SyncStatus = 'idle' | 'pulling' | 'pushing' | 'offline' | 'error' | 'disabled';

interface SyncState {
  status: SyncStatus;
  lastPullAt: number | null;
  lastPushAt: number | null;
  lastError: string | null;
  pendingScopes: Set<string>;
}

const state: SyncState = {
  status: 'idle',
  lastPullAt: null,
  lastPushAt: null,
  lastError: null,
  pendingScopes: new Set(),
};

const listeners = new Set<(s: SyncState) => void>();
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function subscribe(fn: (s: SyncState) => void): () => void {
  listeners.add(fn);
  fn(state);
  return () => { listeners.delete(fn); };
}

function notify() {
  for (const fn of listeners) fn({ ...state, pendingScopes: new Set(state.pendingScopes) });
}

function setStatus(status: SyncStatus, error?: string) {
  state.status = status;
  state.lastError = error ?? null;
  notify();
}

// localStorage scope ↔ key mapping ────────────────────────────────────────────
// Persistence module uses these keys; cloud uses the short scope name.

const LS_KEY_BY_SCOPE: Record<string, string> = {
  history: 'co_history_v1',
  customers: 'co_customers_v1',
  templates: 'co_templates_v1',
  rates: 'co_labor_rates_v1',
};

// Per-user draft scope is computed at runtime from the authenticated email.
let draftScope: string | null = null;

function emailKey(email: string): string {
  let h = 0;
  for (let i = 0; i < email.length; i++) {
    h = ((h << 5) - h + email.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36).padStart(6, '0');
}

function lsKeyForScope(scope: string): string | null {
  if (LS_KEY_BY_SCOPE[scope]) return LS_KEY_BY_SCOPE[scope];
  if (scope.startsWith('draft_')) return 'co_draft_v1';
  return null;
}

function scopeForLsKey(key: string): string | null {
  for (const [scope, k] of Object.entries(LS_KEY_BY_SCOPE)) {
    if (k === key) return scope;
  }
  if (key === 'co_draft_v1' && draftScope) return draftScope;
  return null;
}

// Pull / push primitives ──────────────────────────────────────────────────────

async function pullAll(): Promise<void> {
  if (typeof localStorage === 'undefined') return;
  if (localStorage.getItem('co_cloud_sync_disabled') === '1') {
    setStatus('disabled');
    return;
  }
  // If a previous attempt set status='disabled' due to transient 503/401, allow
  // re-attempt (this function is the only path back to 'idle' anyway). The
  // ultimate gate stays the response itself.
  setStatus('pulling');
  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    const res = await fetch('/api/data', { method: 'GET', credentials: 'same-origin', headers });
    if (res.status === 503) {
      // Backend not provisioned — fall back silently to local-only mode.
      // We DO retry on the next interval; if the backend comes back, the next
      // pullAll() will succeed and the status will clear to 'idle'.
      setStatus('disabled', 'Cloud sync not provisioned on server');
      return;
    }
    if (res.status === 401) {
      setStatus('disabled', 'Not authenticated (Cloudflare Access required)');
      return;
    }
    if (!res.ok) {
      setStatus('error', `Pull failed: HTTP ${res.status}`);
      return;
    }
    const data = await res.json() as {
      orgId: string;
      email: string;
      blobs: Record<string, { content: unknown; updatedAt: number }>;
    };
    if (data.email) draftScope = `draft_${emailKey(data.email)}`;

    // Merge: check for conflicts (server newer + local unsaved edits).
    // Per-scope updated_at is checked against the last local push timestamp
    // so we don't clobber pending local writes that haven't been pushed yet.
    for (const [scope, payload] of Object.entries(data.blobs)) {
      const lsKey = lsKeyForScope(scope);
      if (!lsKey) continue;
      const localPushedAt = Number(localStorage.getItem(`${lsKey}__pushed_at`) || '0');
      const localDirtyAt = Number(localStorage.getItem(`${lsKey}__dirty_at`) || '0');

      // ── CONFLICT DETECTION ─────────────────────────────────────────────────
      // If server version is newer AND we have local unsaved changes, conflict.
      // Keep local version (operator's in-progress work takes precedence).
      const hasConflict = payload.updatedAt > localPushedAt && localDirtyAt > localPushedAt;
      if (hasConflict) {
        console.warn(
          `Cloud sync: conflict on ${scope} — server updated after our last push, ` +
          `but we have unsaved changes. Keeping local version.`
        );
        localStorage.setItem(`${lsKey}__conflict_at`, String(Date.now()));
        state.lastError = `Sync conflict on ${scope} — your local changes were kept. ` +
          `If the other tab's version is important, copy it and re-save manually.`;
        notify();
        continue;
      }

      // No conflict: server wins if it's newer.
      if (payload.updatedAt > localPushedAt) {
        try {
          localStorage.setItem(lsKey, JSON.stringify(payload.content));
          localStorage.setItem(`${lsKey}__pushed_at`, String(payload.updatedAt));
        } catch (e) {
          console.warn(`Cloud sync: could not write ${lsKey}`, e);
        }
      }
    }
    state.lastPullAt = Date.now();
    setStatus('idle');
  } catch (e) {
    setStatus('offline', e instanceof Error ? e.message : String(e));
  }
}

/**
 * Push one scope. Returns true on success, false on failure.
 * Caller is expected to re-queue the scope on failure (see flushQueue).
 */
async function pushScope(scope: string): Promise<boolean> {
  if (typeof localStorage === 'undefined') return false;
  if (localStorage.getItem('co_cloud_sync_disabled') === '1') return false;
  const lsKey = lsKeyForScope(scope);
  if (!lsKey) return false;
  const content = localStorage.getItem(lsKey);
  if (content === null) return false;
  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    const res = await fetch(`/api/data/${encodeURIComponent(scope)}`, {
      method: 'PUT',
      credentials: 'same-origin',
      headers,
      body: content,
    });
    if (res.status === 503 || res.status === 401) {
      setStatus('disabled');
      return false;
    }
    if (!res.ok) {
      setStatus('error', `Push ${scope} failed: HTTP ${res.status}`);
      return false;
    }
    const data = await res.json() as { updatedAt: number };
    localStorage.setItem(`${lsKey}__pushed_at`, String(data.updatedAt));
    state.lastPushAt = Date.now();
    return true;
  } catch (e) {
    setStatus('offline', e instanceof Error ? e.message : String(e));
    return false;
  }
}

// Debounced push queue ────────────────────────────────────────────────────────

let pushTimer: ReturnType<typeof setTimeout> | null = null;
const PUSH_DEBOUNCE_MS = 1500;

async function flushQueue() {
  pushTimer = null;
  if (state.pendingScopes.size === 0) return;
  setStatus('pushing');
  const scopes = Array.from(state.pendingScopes);
  state.pendingScopes.clear();
  notify();
  // Re-queue any scope whose push failed so it gets another shot on the next
  // online/focus event. Without this, a network blip during a push silently
  // dropped the dirty flag and the next remote pull would clobber unsynced
  // local edits.
  const failed: string[] = [];
  for (const scope of scopes) {
    const ok = await pushScope(scope);
    if (!ok) failed.push(scope);
  }
  for (const s of failed) state.pendingScopes.add(s);
  if (failed.length > 0) {
    notify();
    // Status was set by pushScope (offline/error/disabled). Don't override.
  } else if (state.status === 'pushing') {
    setStatus('idle');
  }
}

/**
 * Persistence layer calls this after each write. Mark the affected localStorage
 * key as needing a push to the server. Idempotent and cheap.
 */
export function markDirty(lsKey: string): void {
  const scope = scopeForLsKey(lsKey);
  if (!scope) return;
  state.pendingScopes.add(scope);
  notify();
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => { void flushQueue(); }, PUSH_DEBOUNCE_MS);
}

/**
 * Boot the sync: pull from server once, then keep watching for dirty scopes.
 * Call once on app mount.
 */
export async function init(): Promise<void> {
  if (typeof window === 'undefined') return;
  await pullAll();
  // Periodic re-pull to catch updates from other devices. 60s is a sensible
  // cadence for an internal team app, but back off when the backend is
  // disabled (503/401) — keep checking but at a slower pace so a recovered
  // backend is detected without burning bandwidth on every cycle when down.
  let pullsSinceLastSuccess = 0;
  setInterval(() => {
    // If permanently disabled by user, stop polling entirely.
    if (typeof localStorage !== 'undefined' && localStorage.getItem('co_cloud_sync_disabled') === '1') return;
    // Backoff: when status is 'disabled', poll every 5 minutes instead of 1.
    if (state.status === 'disabled') {
      pullsSinceLastSuccess++;
      if (pullsSinceLastSuccess < 5) return;
      pullsSinceLastSuccess = 0;
    } else {
      pullsSinceLastSuccess = 0;
    }
    void pullAll();
  }, 60_000);
  // Push any pending writes when the window regains focus / network.
  window.addEventListener('online', () => { void flushQueue(); });
  window.addEventListener('focus', () => { void pullAll(); });
}

export function getState(): Readonly<SyncState> {
  return { ...state, pendingScopes: new Set(state.pendingScopes) };
}
