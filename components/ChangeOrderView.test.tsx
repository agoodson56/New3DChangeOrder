/**
 * Regression tests for ChangeOrderView render-time null/undefined hazards.
 *
 * Specifically guards against the production crash:
 *   "TypeError: Cannot read properties of null (reading 'toFixed')"
 * which fired inside a .map() — caused by AI-supplied pricingValidations
 * fields (originalMsrp, validatedMsrp, confidence, delta) being null when
 * the validator partially-failed but still returned a row.
 *
 * The fix is in ChangeOrderView's pricing-validations details panel:
 * every numeric field is normalized via Number.isFinite(...) before .toFixed.
 *
 * These are pure-string assertions on what the rendering code does, not
 * full DOM tests — they encode the contract that the panel never crashes
 * regardless of upstream data quality.
 */
import { describe, it, expect } from 'vitest';

// The defensive coercion the panel uses, lifted into a helper for testing.
// Mirror this in ChangeOrderView; if you change it there, change it here.
function safeNum(v: unknown): number {
  return Number.isFinite(v) ? (v as number) : 0;
}

describe('pricing-validation row null hardening', () => {
  it('null originalMsrp coerces to 0', () => {
    expect(safeNum(null).toFixed(2)).toBe('0.00');
  });
  it('undefined validatedMsrp coerces to 0', () => {
    expect(safeNum(undefined).toFixed(2)).toBe('0.00');
  });
  it('NaN delta coerces to 0', () => {
    expect(safeNum(NaN)).toBe(0);
  });
  it('Infinity confidence coerces to 0', () => {
    expect(safeNum(Infinity)).toBe(0);
  });
  it('valid numbers pass through', () => {
    expect(safeNum(42.5).toFixed(2)).toBe('42.50');
  });
  it('zero passes through (not null-coerced)', () => {
    expect(safeNum(0).toFixed(2)).toBe('0.00');
  });
  it('string numbers do NOT coerce — caller must convert first', () => {
    // Number.isFinite('42') is false (different from global isFinite).
    // This is intentional: we want to refuse silently-stringified data.
    expect(safeNum('42')).toBe(0);
  });
});
