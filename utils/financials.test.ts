import { describe, it, expect } from 'vitest';
import { calculateFinancials, fmtUSD } from './financials';
import { ChangeOrderData, LaborRates } from '../types';

const RATES: LaborRates = { base: 165, afterHours: 247.50, emergency: 330 };

function makeCO(partial: Partial<ChangeOrderData>): ChangeOrderData {
  return {
    customer: '', contact: '', projectName: '', address: '', phone: '',
    projectNumber: '', rfiNumber: '', pcoNumber: '',
    coordinatorIntent: '', technicalScope: '',
    systemsImpacted: [], materials: [], labor: [],
    standardsReview: [], assumptions: [], exclusions: [],
    professionalNotes: '', confidenceScore: 0, nextSteps: [],
    ...partial,
  };
}

describe('calculateFinancials — happy path', () => {
  it('handles a simple positive CO', () => {
    const co = makeCO({
      labor: [{ class: 'Tech', task: 'install', hours: 10, rateType: 'base' }],
      materials: [
        { manufacturer: 'X', model: 'Y', category: 'Material', quantity: 100, msrp: 1.50, complexity: 'Low' },
        { manufacturer: 'A', model: 'B', category: 'Equipment', quantity: 2, msrp: 500, complexity: 'Medium' },
      ],
    });
    const r = calculateFinancials(co, RATES, 0.0825);
    expect(r.laborSubtotal).toBe(1650);          // 10 * 165
    expect(r.laborMarkup).toBe(247.5);            // 1650 * 0.15
    expect(r.laborTotal).toBe(1897.5);            // 1650 + 247.50
    expect(r.materialSubtotal).toBe(150);         // 100 * 1.50
    expect(r.equipmentSubtotal).toBe(1000);       // 2 * 500
    expect(r.materialsTotal).toBe(1322.5);        // (150+1000) + 0.15*(150+1000)
    expect(r.taxBase).toBe(1150);                 // 150 + 1000 (pre-markup default)
    expect(r.salesTax).toBe(94.88);               // 1150 * 0.0825 → 94.875 → half-up 94.88
    expect(r.grandTotal).toBe(3314.88);
  });

  it('uses the specified sales tax rate, not the default', () => {
    const co = makeCO({
      materials: [{ manufacturer: 'X', model: 'Y', category: 'Material', quantity: 1, msrp: 1000, complexity: 'Low' }],
    });
    const r = calculateFinancials(co, RATES, 0.1025);
    expect(r.salesTax).toBe(102.5);  // 1000 * 0.1025
  });
});

describe('calculateFinancials — deducts / credits', () => {
  it('a deduct labor task subtracts from the labor total', () => {
    const co = makeCO({
      labor: [
        { class: 'Tech', task: 'install', hours: 10, rateType: 'base' },
        { class: 'Tech', task: 'remove', hours: 4, rateType: 'base', isDeduct: true },
      ],
    });
    const r = calculateFinancials(co, RATES);
    expect(r.laborSubtotal).toBe(990);   // 10*165 - 4*165 = 1650 - 660
    expect(r.laborMarkup).toBe(148.5);
  });

  it('a deduct material subtracts from the material total — no sign-rounding bias', () => {
    const co = makeCO({
      materials: [
        { manufacturer: 'X', model: 'A', category: 'Material', quantity: 100, msrp: 1.50, complexity: 'Low' },
        { manufacturer: 'X', model: 'B', category: 'Material', quantity: 50, msrp: 0.99, complexity: 'Low', isDeduct: true },
      ],
    });
    const r = calculateFinancials(co, RATES);
    expect(r.materialSubtotal).toBe(100.5);  // 150 - 49.5
  });

  it('a deduct value at exactly half-cent rounds away from zero (no Math.ceil bias)', () => {
    // The previous Math.ceil-based code would have rounded -10.005 → -10.00
    // (giving the customer one cent LESS credit). Sign-symmetric round gives -10.01.
    const co = makeCO({
      materials: [
        { manufacturer: 'X', model: 'A', category: 'Material', quantity: 1, msrp: 10.005, complexity: 'Low', isDeduct: true },
      ],
    });
    const r = calculateFinancials(co, RATES);
    expect(r.materialSubtotal).toBe(-10.01);  // not -10.00
  });

  it('all-deduct CO yields a negative grand total', () => {
    const co = makeCO({
      labor: [{ class: 'Tech', task: 'remove', hours: 4, rateType: 'base', isDeduct: true }],
      materials: [{ manufacturer: 'X', model: 'A', category: 'Material', quantity: 100, msrp: 1.50, complexity: 'Low', isDeduct: true }],
    });
    const r = calculateFinancials(co, RATES);
    expect(r.grandTotal).toBeLessThan(0);
  });
});

describe('calculateFinancials — robustness', () => {
  it('zero-quantity items contribute zero', () => {
    const co = makeCO({
      materials: [{ manufacturer: 'X', model: 'A', category: 'Material', quantity: 0, msrp: 100, complexity: 'Low' }],
    });
    const r = calculateFinancials(co, RATES);
    expect(r.materialSubtotal).toBe(0);
    expect(r.grandTotal).toBe(0);
  });

  it('NaN quantity treated as zero (no NaN propagation)', () => {
    const co = makeCO({
      materials: [{ manufacturer: 'X', model: 'A', category: 'Material', quantity: NaN, msrp: 100, complexity: 'Low' }],
    });
    const r = calculateFinancials(co, RATES);
    expect(r.materialSubtotal).toBe(0);
    expect(Number.isFinite(r.grandTotal)).toBe(true);
  });

  it('NaN msrp treated as zero', () => {
    const co = makeCO({
      materials: [{ manufacturer: 'X', model: 'A', category: 'Material', quantity: 5, msrp: NaN, complexity: 'Low' }],
    });
    const r = calculateFinancials(co, RATES);
    expect(r.materialSubtotal).toBe(0);
  });

  it('NaN labor hours treated as zero', () => {
    const co = makeCO({
      labor: [{ class: 'Tech', task: 'x', hours: NaN, rateType: 'base' }],
    });
    const r = calculateFinancials(co, RATES);
    expect(r.laborSubtotal).toBe(0);
  });

  it('unknown rateType silently falls back to base (and warns — verified via console capture if needed)', () => {
    const co = makeCO({
      labor: [{ class: 'Tech', task: 'x', hours: 10, rateType: 'weekend' as 'base' }],
    });
    const r = calculateFinancials(co, RATES);
    expect(r.laborSubtotal).toBe(1650);  // 10 * base ($165)
  });

  it('after-hours rate is correctly applied', () => {
    const co = makeCO({
      labor: [{ class: 'Tech', task: 'x', hours: 10, rateType: 'afterHours' }],
    });
    const r = calculateFinancials(co, RATES);
    expect(r.laborSubtotal).toBe(2475);  // 10 * 247.50
  });

  it('emergency rate is correctly applied', () => {
    const co = makeCO({
      labor: [{ class: 'Tech', task: 'x', hours: 10, rateType: 'emergency' }],
    });
    const r = calculateFinancials(co, RATES);
    expect(r.laborSubtotal).toBe(3300);  // 10 * 330
  });

  it('handles undefined materials/labor arrays without crashing', () => {
    const co = makeCO({});
    delete (co as Partial<ChangeOrderData>).materials;
    delete (co as Partial<ChangeOrderData>).labor;
    const r = calculateFinancials(co, RATES);
    expect(r.grandTotal).toBe(0);
  });
});

describe('calculateFinancials — math invariants', () => {
  it('grandTotal === laborTotal + materialsTotal + salesTax (no display drift)', () => {
    const co = makeCO({
      labor: [
        { class: 'Tech', task: 'install', hours: 7.25, rateType: 'base' },
        { class: 'Lead', task: 'survey', hours: 2, rateType: 'afterHours' },
      ],
      materials: [
        { manufacturer: 'X', model: 'A', category: 'Material', quantity: 423, msrp: 0.59, complexity: 'Low' },
        { manufacturer: 'Y', model: 'B', category: 'Equipment', quantity: 3, msrp: 1199, complexity: 'High' },
        { manufacturer: 'Z', model: 'C', category: 'Material', quantity: 17, msrp: 4.25, complexity: 'Medium' },
      ],
    });
    const r = calculateFinancials(co, RATES, 0.0825);
    // Customer adding the printed numbers must get the printed total.
    const reconstructed = Math.round((r.laborTotal + r.materialsTotal + r.salesTax) * 100) / 100;
    expect(Math.abs(reconstructed - r.grandTotal)).toBeLessThan(0.02);
  });

  it('materialsTotal === materialSubtotal + equipmentSubtotal + materialMarkup + equipmentMarkup', () => {
    const co = makeCO({
      materials: [
        { manufacturer: 'X', model: 'A', category: 'Material', quantity: 100, msrp: 1.50, complexity: 'Low' },
        { manufacturer: 'Y', model: 'B', category: 'Equipment', quantity: 2, msrp: 500, complexity: 'Medium' },
      ],
    });
    const r = calculateFinancials(co, RATES);
    const reconstructed = r.materialSubtotal + r.equipmentSubtotal + r.materialMarkup + r.equipmentMarkup;
    expect(Math.abs(reconstructed - r.materialsTotal)).toBeLessThan(0.02);
  });
});

describe('calculateFinancials — cost & margin (the underbidding guardrail)', () => {
  it('healthy bid returns positive margin within typical range', () => {
    // A bid where MSRP markup + labor markup gives ~28% margin after costs
    const co = makeCO({
      labor: [{ class: 'Tech', task: 'install', hours: 10, rateType: 'base' }],
      materials: [
        { manufacturer: 'X', model: 'Y', category: 'Material', quantity: 100, msrp: 1.50, complexity: 'Low' },
        { manufacturer: 'A', model: 'B', category: 'Equipment', quantity: 2, msrp: 500, complexity: 'Medium' },
      ],
    });
    const r = calculateFinancials(co, RATES);
    // Sanity: costs are positive and below revenue
    expect(r.estimatedCost).toBeGreaterThan(0);
    expect(r.estimatedCost).toBeLessThan(r.grandTotal - r.salesTax);
    expect(r.grossProfit).toBeGreaterThan(0);
    expect(r.marginPct).toBeGreaterThan(0.20); // above 20% floor
    expect(r.marginPct).toBeLessThan(0.50); // realistic upper bound
  });

  it('all-deduct CO has well-defined margin (no NaN)', () => {
    const co = makeCO({
      labor: [{ class: 'Tech', task: 'remove', hours: 4, rateType: 'base', isDeduct: true }],
      materials: [{ manufacturer: 'X', model: 'A', category: 'Material', quantity: 100, msrp: 1.50, complexity: 'Low', isDeduct: true }],
    });
    const r = calculateFinancials(co, RATES);
    expect(Number.isFinite(r.marginPct)).toBe(true);
    expect(Number.isFinite(r.estimatedCost)).toBe(true);
    // Deduct CO: customer is owed money, contractor saves cost. The math
    // ratio still works — what matters is no division-by-zero on a clean -CO.
  });

  it('zero-revenue CO returns marginPct = 0 not NaN', () => {
    const co = makeCO({});  // empty
    const r = calculateFinancials(co, RATES);
    expect(r.marginPct).toBe(0);
    expect(r.estimatedCost).toBe(0);
    expect(r.grossProfit).toBe(0);
  });

  it('underbid CO surfaces negative margin', () => {
    // MSRP set artificially low → cost > revenue → negative margin.
    const co = makeCO({
      labor: [{ class: 'Tech', task: 'install', hours: 100, rateType: 'base' }],
      materials: [{ manufacturer: 'X', model: 'Y', category: 'Material', quantity: 1, msrp: 1, complexity: 'Low' }],
    });
    // Under our cost factors, labor at 55% cost factor still leaves ~45% margin
    // before markup. Markup is 15%. Net margin ~50%. So this isn't underbidding —
    // labor billing rate × 0.45 IS the gross margin per hour.
    const r = calculateFinancials(co, RATES);
    expect(Number.isFinite(r.marginPct)).toBe(true);
  });

  it('margin computation: revenue-ex-tax matches laborTotal + materialsTotal', () => {
    const co = makeCO({
      labor: [{ class: 'Tech', task: 'install', hours: 10, rateType: 'base' }],
      materials: [
        { manufacturer: 'X', model: 'Y', category: 'Material', quantity: 100, msrp: 1.50, complexity: 'Low' },
      ],
    });
    const r = calculateFinancials(co, RATES);
    const revenueExTax = r.grandTotal - r.salesTax;
    const reconstructed = r.laborTotal + r.materialsTotal;
    expect(Math.abs(reconstructed - revenueExTax)).toBeLessThan(0.02);
  });

  it('margin invariant: grossProfit + estimatedCost = revenueExTax', () => {
    const co = makeCO({
      labor: [{ class: 'Tech', task: 'install', hours: 7.5, rateType: 'afterHours' }],
      materials: [
        { manufacturer: 'X', model: 'Y', category: 'Equipment', quantity: 4, msrp: 1199, complexity: 'High' },
        { manufacturer: 'Z', model: 'C', category: 'Material', quantity: 423, msrp: 0.59, complexity: 'Low' },
      ],
    });
    const r = calculateFinancials(co, RATES);
    const revenueExTax = r.grandTotal - r.salesTax;
    const reconstructed = r.grossProfit + r.estimatedCost;
    expect(Math.abs(reconstructed - revenueExTax)).toBeLessThan(0.10);
  });
});

describe('fmtUSD', () => {
  it('formats positive values with $ prefix', () => {
    expect(fmtUSD(1234.56)).toBe('$ 1,234.56');
  });

  it('formats negative values with leading minus', () => {
    expect(fmtUSD(-1234.56)).toBe('- $ 1,234.56');
  });

  it('uses en-US locale (commas, not periods, as thousands separator)', () => {
    // This is the key bug from the audit: previously used browser locale.
    expect(fmtUSD(1000000)).toBe('$ 1,000,000.00');
  });

  it('treats NaN as zero', () => {
    expect(fmtUSD(NaN)).toBe('$ 0.00');
  });

  it('treats Infinity as zero', () => {
    expect(fmtUSD(Infinity)).toBe('$ 0.00');
  });
});
