import { describe, it, expect } from 'vitest';
import { relevantComplianceItems, COMPLIANCE_ITEMS, OFFICE_STATE } from '../constants';

describe('relevantComplianceItems — state and system filtering', () => {
  it('returns CA-specific items for a Sacramento office', () => {
    const items = relevantComplianceItems('rancho-cordova', []);
    const ids = items.map(i => i.id);
    expect(ids).toContain('ca_t24');
    expect(ids).toContain('ca_prevailing_wage');
    expect(ids).not.toContain('nv_contractor_license');
  });

  it('returns NV-specific items for the Sparks office', () => {
    const items = relevantComplianceItems('sparks', []);
    const ids = items.map(i => i.id);
    expect(ids).toContain('nv_contractor_license');
    expect(ids).not.toContain('ca_t24');
  });

  it('Livermore (also CA) gets CA items, not NV items', () => {
    const items = relevantComplianceItems('livermore', []);
    const ids = items.map(i => i.id);
    expect(ids).toContain('ca_t24');
    expect(ids).not.toContain('nv_contractor_license');
  });

  it('surfaces fire-alarm-specific items only when scope includes Fire Alarm', () => {
    const without = relevantComplianceItems('rancho-cordova', ['CCTV']).map(i => i.id);
    expect(without).not.toContain('fire_nfpa72');
    const withFire = relevantComplianceItems('rancho-cordova', ['Fire Alarm', 'CCTV']).map(i => i.id);
    expect(withFire).toContain('fire_nfpa72');
  });

  it('surfaces access-control items only when scope includes Access Control', () => {
    const items = relevantComplianceItems('rancho-cordova', ['Access Control']).map(i => i.id);
    expect(items).toContain('access_nfpa101');
    expect(items).toContain('access_ada');
  });

  it('always shows universal items regardless of state/system', () => {
    const a = relevantComplianceItems('rancho-cordova', []).map(i => i.id);
    const b = relevantComplianceItems('sparks', ['Fire Alarm']).map(i => i.id);
    expect(a).toContain('permits_pulled');
    expect(b).toContain('permits_pulled');
  });

  it('every required item appears in the filtered output for its scope', () => {
    // CA office, Fire Alarm + Access Control scope: should yield CA + universal
    // + fire + access required items
    const items = relevantComplianceItems('rancho-cordova', ['Fire Alarm', 'Access Control']);
    const requiredIds = items.filter(i => i.required).map(i => i.id);
    expect(requiredIds).toContain('ca_t24');
    expect(requiredIds).toContain('fire_nfpa72');
    expect(requiredIds).toContain('access_nfpa101');
    expect(requiredIds).toContain('access_ada');
    expect(requiredIds).toContain('permits_pulled');
  });

  it('unknown officeId falls back to CA (the HQ default)', () => {
    const items = relevantComplianceItems('mars-base', []);
    const ids = items.map(i => i.id);
    expect(ids).toContain('ca_t24');
    expect(ids).not.toContain('nv_contractor_license');
  });

  it('OFFICE_STATE covers every office id present in OFFICES', () => {
    expect(OFFICE_STATE['rancho-cordova']).toBe('CA');
    expect(OFFICE_STATE['livermore']).toBe('CA');
    expect(OFFICE_STATE['sparks']).toBe('NV');
  });

  it('all compliance items have a stable id and label', () => {
    const ids = new Set<string>();
    for (const item of COMPLIANCE_ITEMS) {
      expect(item.id).toBeTruthy();
      expect(item.label).toBeTruthy();
      expect(ids.has(item.id)).toBe(false); // no duplicate ids
      ids.add(item.id);
    }
  });
});
