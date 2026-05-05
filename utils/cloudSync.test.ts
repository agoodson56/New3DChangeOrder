/**
 * Tests for the flushQueue retry semantics and pushScope failure handling.
 *
 * These are NOT integration tests — we don't spin up a real fetch. We just
 * verify the public surface (markDirty + getState) does the right thing
 * when network operations fail.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('cloudSync', () => {
  let originalFetch: typeof globalThis.fetch;
  let originalLocalStorage: Storage | undefined;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    originalLocalStorage = globalThis.localStorage;
    // Mock localStorage with a real Map-backed implementation.
    const store = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => { store.set(k, v); },
        removeItem: (k: string) => { store.delete(k); },
        clear: () => store.clear(),
        key: (i: number) => Array.from(store.keys())[i] ?? null,
        get length() { return store.size; },
      } as Storage,
    });
    // Reset module cache so each test re-imports fresh state.
    vi.resetModules();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalLocalStorage === undefined) {
      delete (globalThis as { localStorage?: Storage }).localStorage;
    } else {
      Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        value: originalLocalStorage,
      });
    }
  });

  it('on push failure, scope stays in pendingScopes for retry', async () => {
    // Simulate a network error on PUT /api/data/:scope.
    globalThis.fetch = vi.fn(async () => { throw new TypeError('network down'); }) as unknown as typeof fetch;

    const cloudSync = await import('./cloudSync');
    // Seed local data so pushScope has something to push.
    localStorage.setItem('co_history_v1', JSON.stringify([{ id: 'co_1' }]));
    cloudSync.markDirty('co_history_v1');
    // Wait for the debounce + push to fire.
    await new Promise(r => setTimeout(r, 1700));
    // History scope should be re-queued because the push failed.
    const state = cloudSync.getState();
    expect(state.pendingScopes.has('history')).toBe(true);
  });

  it('on success, pendingScopes drains', async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ updatedAt: Date.now() }), { status: 200 })
    ) as unknown as typeof fetch;

    const cloudSync = await import('./cloudSync');
    localStorage.setItem('co_history_v1', JSON.stringify([{ id: 'co_1' }]));
    cloudSync.markDirty('co_history_v1');
    await new Promise(r => setTimeout(r, 1700));
    const state = cloudSync.getState();
    expect(state.pendingScopes.has('history')).toBe(false);
  });
});
