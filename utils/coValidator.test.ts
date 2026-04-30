import { describe, it, expect } from 'vitest';
import { validateChangeOrder } from './coValidator';
import { ChangeOrderData, MaterialItem, LaborTask } from '../types';

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

const item = (overrides: Partial<MaterialItem>): MaterialItem => ({
  manufacturer: 'X',
  model: 'Y',
  category: 'Material',
  quantity: 1,
  msrp: 10,
  unitOfMeasure: 'ea',
  complexity: 'Low',
  ...overrides,
});

const labor = (overrides: Partial<LaborTask>): LaborTask => ({
  class: 'Tech',
  task: 'Install',
  hours: 1,
  rateType: 'base',
  ...overrides,
});

// =============================================================================
// RULE 0 — Empty CO
// =============================================================================
describe('coValidator — RULE 0 (empty CO)', () => {
  it('flags as error when both materials and labor are empty', () => {
    const result = validateChangeOrder(makeCO({}));
    expect(result.warnings.some(w => w.severity === 'error' && /no materials and no labor/i.test(w.message))).toBe(true);
  });

  it('warns (not errors) for labor-only CO', () => {
    const result = validateChangeOrder(makeCO({
      labor: [labor({ task: 'Diagnostic visit', hours: 2 })],
    }));
    const noMaterialsWarn = result.warnings.find(w => /no materials/i.test(w.message));
    expect(noMaterialsWarn?.severity).toBe('warning');
  });
});

// =============================================================================
// RULE 1b — Cable per-foot price sanity
// =============================================================================
describe('coValidator — cable price sanity', () => {
  it('flags cable priced > $5/ft (likely per-box typo)', () => {
    const result = validateChangeOrder(makeCO({
      materials: [item({ unitOfMeasure: 'ft', model: 'Cat6A bulk', msrp: 45, quantity: 100 })],
    }));
    expect(result.warnings.some(w => /unrealistically high/i.test(w.message))).toBe(true);
  });

  it('flags cable priced < $0.10/ft', () => {
    const result = validateChangeOrder(makeCO({
      materials: [item({ unitOfMeasure: 'ft', model: 'Cat6A', msrp: 0.05, quantity: 100 })],
    }));
    expect(result.warnings.some(w => /unrealistically low/i.test(w.message))).toBe(true);
  });

  it('does not flag cable in normal range ($0.30-$2.00/ft)', () => {
    const result = validateChangeOrder(makeCO({
      materials: [item({ unitOfMeasure: 'ft', model: 'Cat6A', msrp: 0.85, quantity: 100 })],
    }));
    expect(result.warnings.some(w => /unrealistically (high|low)/i.test(w.message))).toBe(false);
  });
});

// =============================================================================
// RULE 1c — Category price-band sanity (added in this session)
// =============================================================================
describe('coValidator — price-band sanity (RULE 1c)', () => {
  it('flags an inflated PTZ camera (over $4,500 ceiling)', () => {
    const result = validateChangeOrder(makeCO({
      materials: [item({
        manufacturer: 'Axis',
        model: 'Q6135-LE PTZ',
        category: 'Equipment',
        msrp: 5899,
      })],
    }));
    expect(result.warnings.some(w => /PTZ camera/i.test(w.message) && /above the typical/i.test(w.message))).toBe(true);
  });

  it('accepts a PTZ camera at the corrected street price', () => {
    const result = validateChangeOrder(makeCO({
      materials: [item({
        manufacturer: 'Axis',
        model: 'Q6135-LE PTZ',
        category: 'Equipment',
        msrp: 2950,
      })],
    }));
    expect(result.warnings.some(w => /above the typical PTZ camera/i.test(w.message))).toBe(false);
  });

  it('flags an inflated 24-port patch panel', () => {
    const result = validateChangeOrder(makeCO({
      materials: [item({
        manufacturer: 'Leviton',
        model: '24-port patch panel Cat6A',
        msrp: 1500,
      })],
    }));
    expect(result.warnings.some(w => /24-port patch panel/i.test(w.message))).toBe(true);
  });

  it('flags a suspiciously cheap IP camera (likely typo)', () => {
    const result = validateChangeOrder(makeCO({
      materials: [item({
        manufacturer: 'Axis',
        model: 'IP camera dome',
        category: 'Equipment',
        msrp: 25, // way below the $100 floor
      })],
    }));
    expect(result.warnings.some(w => /below the typical/i.test(w.message))).toBe(true);
  });

  it('does not flag items in the normal range', () => {
    const result = validateChangeOrder(makeCO({
      materials: [
        item({ manufacturer: 'Axis', model: 'P3245-V IP camera dome', category: 'Equipment', msrp: 529 }),
        item({ manufacturer: 'Cisco', model: 'CBS350-24 PoE managed switch', category: 'Equipment', msrp: 895 }),
      ],
    }));
    expect(result.warnings.some(w => /above the typical|below the typical/i.test(w.message))).toBe(false);
  });

  it('skips price-band check on cable items (handled by RULE 1b)', () => {
    // A cable line at $1.20/ft shouldn't trigger non-cable bands even if
    // the keyword "camera" sneaks into the model
    const result = validateChangeOrder(makeCO({
      materials: [item({ unitOfMeasure: 'ft', manufacturer: 'Berk-Tek', model: 'LANmark-10G2 plenum cable', msrp: 1.20, quantity: 500 })],
    }));
    expect(result.warnings.some(w => /above the typical/i.test(w.message))).toBe(false);
  });
});

// =============================================================================
// RULE 1d — Duplicate detection
// =============================================================================
describe('coValidator — duplicate detection', () => {
  it('flags duplicate manufacturer+model entries', () => {
    const result = validateChangeOrder(makeCO({
      materials: [
        item({ manufacturer: 'Axis', model: 'P3245-V', quantity: 5, msrp: 529 }),
        item({ manufacturer: 'Axis', model: 'P3245-V', quantity: 3, msrp: 529 }),
      ],
    }));
    expect(result.warnings.some(w => /duplicate material/i.test(w.message))).toBe(true);
  });

  it('does not flag distinct items with shared manufacturer', () => {
    const result = validateChangeOrder(makeCO({
      materials: [
        item({ manufacturer: 'Axis', model: 'P3245-V', quantity: 5 }),
        item({ manufacturer: 'Axis', model: 'P3265-V', quantity: 2 }),
      ],
    }));
    expect(result.warnings.some(w => /duplicate material/i.test(w.message))).toBe(false);
  });
});

// =============================================================================
// RULE 4 — J-hooks at 10ft spacing (3DTSI standard)
// =============================================================================
describe('coValidator — J-hook coverage', () => {
  it('does not flag missing J-hooks for tiny cable runs (<= 100ft)', () => {
    const result = validateChangeOrder(makeCO({
      materials: [item({
        unitOfMeasure: 'ft',
        manufacturer: 'Berk-Tek',
        model: 'LANmark-10G2',
        quantity: 50,
        msrp: 0.85,
      })],
    }));
    expect(result.warnings.some(w => /missing j-hooks/i.test(w.message))).toBe(false);
  });

  it('warns when no J-hooks accompany a 500ft cable run', () => {
    const result = validateChangeOrder(makeCO({
      materials: [item({
        unitOfMeasure: 'ft',
        manufacturer: 'Berk-Tek',
        model: 'LANmark-10G2',
        quantity: 500,
        msrp: 0.85,
      })],
    }));
    expect(result.warnings.some(w => /missing j-hooks/i.test(w.message))).toBe(true);
  });

  it('does not flag when J-hooks at 1-per-10ft are included', () => {
    // 500ft / 10ft spacing = 50 J-hooks expected
    const result = validateChangeOrder(makeCO({
      materials: [
        item({ unitOfMeasure: 'ft', manufacturer: 'Berk-Tek', model: 'LANmark-10G2', quantity: 500, msrp: 0.85 }),
        item({ manufacturer: 'nVent CADDY', model: 'CAT HP J-Hook 2"', quantity: 50, msrp: 3.50 }),
      ],
    }));
    expect(result.warnings.some(w => /missing j-hooks/i.test(w.message))).toBe(false);
    expect(result.warnings.some(w => /low j-hook count/i.test(w.message))).toBe(false);
  });

  it('flags low J-hook count when significantly under-supplied', () => {
    // 500ft expects 50, only 10 included
    const result = validateChangeOrder(makeCO({
      materials: [
        item({ unitOfMeasure: 'ft', model: 'Cat6A LANmark', quantity: 500, msrp: 0.85 }),
        item({ model: 'J-Hook 2"', quantity: 10, msrp: 3.50 }),
      ],
    }));
    expect(result.warnings.some(w => /low j-hook count/i.test(w.message))).toBe(true);
  });
});
