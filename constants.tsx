
import React from 'react';

export const COLORS = {
  black: '#000000',
  gold: '#f2bc1c',
  teal: '#008a8a',
  goldDark: '#008b8b'
};

export const Icons = {
  Logo: ({ className = "" }: { className?: string }) => (
    <img
      src="/logo.png"
      alt="3D Technology Services"
      className={className}
      style={{ objectFit: 'contain' }}
    />
  ),
  Check: () => (
    <svg className="w-5 h-5 text-[#f2bc1c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Alert: () => (
    <svg className="w-5 h-5 text-[#f2bc1c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
};

export const SYSTEMS = [
  'AV Systems',
  'Structured Cabling',
  'CCTV',
  'Access Control',
  'Fire Alarm',
  'Intrusion'
];

export interface Office {
  id: string;
  name: string;
  address: string;
  cityState: string;
  salesTaxRate: number;
  taxJurisdictionLabel: string;
}

export const OFFICES: Office[] = [
  {
    id: 'rancho-cordova',
    name: '3D Rancho Cordova, California',
    address: '11365 Sunrise Gold Circle',
    cityState: 'Rancho Cordova, CA 95742',
    salesTaxRate: 0.0825,
    taxJurisdictionLabel: 'Rancho Cordova',
  },
  {
    id: 'livermore',
    name: '3D Livermore, California',
    address: '7616 Las Positas Road',
    cityState: 'Livermore, CA 94551',
    salesTaxRate: 0.1025,
    taxJurisdictionLabel: 'Livermore',
  },
  {
    id: 'sparks',
    name: '3D Sparks, Nevada',
    address: '1430 Greg Street, Suite 511',
    cityState: 'Sparks, NV 89431',
    salesTaxRate: 0.08265,
    taxJurisdictionLabel: 'Sparks',
  },
];

export const DEFAULT_OFFICE_ID = 'rancho-cordova';

export const getOffice = (id?: string): Office => {
  const found = OFFICES.find(o => o.id === id);
  if (found) return found;
  // OFFICES is non-empty by construction (it's a const array literal above).
  // The bang is safe here; only triggers if someone empties OFFICES, which
  // is itself a bug we'd want to surface.
  return OFFICES[0]!;
};

export const COMPANY_PHONE = '(916) 853-9111';
export const COMPANY_FAX = '(916) 853-9118';
export const COMPANY_LICENSE = 'CSLB# 757157 – NV# 0049045 – AZ# 332533';

// =============================================================================
// FINANCIAL POLICY — change these without touching the math.
// =============================================================================

/**
 * Markup applied to billable labor hours. 0.15 = 15%.
 *
 * Held at 15% intentionally — labor is the most price-sensitive line in any
 * negotiation and bumping it quietly is the fastest way to lose competitive
 * bids. If you need more margin from labor, raise the BILLING RATE in the
 * LaborRateModal instead.
 */
export const LABOR_MARKUP_RATE = 0.15;

/**
 * Markup applied to passive materials (cabling, jacks, conduit, etc.).
 *
 * Set to 0.25 (25%) — the LOW END of the industry norm (25–35%) for
 * passive materials. The previous 15% was below industry standard and
 * left meaningful margin on the table on cabling-heavy jobs (the
 * comment in the original code explicitly flagged this). 25% keeps us
 * competitive with peer integrators while restoring a healthy margin.
 *
 * If you need to flex this for a price-sensitive bid, override at the
 * line level rather than dropping the global rate.
 */
export const MATERIAL_MARKUP_RATE = 0.25;

/**
 * Markup applied to active equipment (cameras, switches, panels).
 *
 * Set to 0.20 (20%) — the upper end of the industry norm (15–20%).
 * Higher than the previous 15% because active equipment carries
 * warranty/support obligations that should be priced into the bid
 * rather than absorbed as overhead.
 */
export const EQUIPMENT_MARKUP_RATE = 0.20;

/**
 * Sales tax base policy.
 *  - false (default): tax on PRE-markup material+equipment cost.
 *    Matches the legacy behavior. Lower tax billed to customer.
 *  - true: tax on POST-markup material+equipment price.
 *    Matches CDTFA Reg. 1521 for many CA contractor situations.
 *    On a $50K materials job at 8.25%, post-markup adds ~$619.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * 🚨 ACTION REQUIRED — accountant decision
 *
 * For a CA low-voltage contractor that sells & installs fixtures (most of
 * 3DTSI's scope), CDTFA Reg. 1521 generally requires sales tax on the
 * MARKED-UP retail price, not the cost. Setting this to `false` means the
 * company is potentially UNDER-collecting tax — which becomes a back-tax
 * liability + penalties on audit, not a competitive advantage.
 *
 * Held at `false` here because flipping it changes what every customer
 * sees on their invoice. Take this to your accountant within 30 days; if
 * they confirm 1521 applies, change to `true` and verify against a known
 * past CO. Keep this comment updated with their answer + date.
 *
 * Last reviewed: NOT YET REVIEWED — flip me when verified.
 * ─────────────────────────────────────────────────────────────────────────
 */
export const TAX_ON_MARKED_UP_PRICE = false;

// =============================================================================
// COST & MARGIN POLICY — protects against underbidding (existential risk).
//
// MSRP is what 3DTSI bills. Cost is what 3DTSI pays. Margin = (bill - cost) / bill.
// The factors below estimate cost as a fraction of MSRP — a sensible default
// when you don't have hard wholesale data per item. Refine as you collect
// distributor invoices.
// =============================================================================

/**
 * Estimated wholesale cost of passive materials as a fraction of MSRP.
 * 0.65 = $100 MSRP item costs ~$65 from your distributor.
 * Industry typical: 0.55–0.70 (Cat6 cable, jacks, conduit, J-hooks).
 */
export const DEFAULT_MATERIAL_COST_FACTOR = 0.65;

/**
 * Estimated wholesale cost of active equipment as a fraction of MSRP.
 * 0.70 = $1000 MSRP camera costs ~$700 from your distributor.
 * Industry typical: 0.65–0.80 (cameras, NVRs, switches, panels).
 */
export const DEFAULT_EQUIPMENT_COST_FACTOR = 0.70;

/**
 * True loaded labor cost as a fraction of the BILLING rate.
 * 0.55 = $165 billing rate corresponds to ~$91/hr loaded cost
 *   (wage + payroll burden + tools + truck + overhead allocation).
 * Adjust to your actual all-in labor cost. This is the most consequential
 * lever in the margin calculation.
 */
export const DEFAULT_LABOR_COST_FACTOR = 0.55;

/**
 * Margin floor (gross profit / revenue ex-tax). Bids below this trigger a
 * red banner and require explicit acknowledgment before print/proposal.
 *
 * Industry sustainable minimum is typically 18–25%. Going below 15% on a
 * recurring basis is how contractors die — one bad job consumes margin
 * from many good ones.
 *
 * Set to 0.22 (22%) — comfortably above the bare industry minimum (18%)
 * and below the warn threshold (25%). With the new 25%/20% material/
 * equipment markups, a properly-bid CO should clear this with room to
 * spare; if a bid is below 22% the operator must consciously acknowledge.
 *
 * Set to 0 to disable the guardrail.
 */
export const MARGIN_FLOOR_PCT = 0.22; // 22%

/** Margin warning threshold — amber zone above the red floor. */
export const MARGIN_WARN_PCT = 0.28; // 28%

// =============================================================================
// COMPLIANCE CHECKLIST — pre-submit acknowledgment of jurisdiction-specific
// and scope-specific requirements. Required items must be checked before
// the coordinator can print or generate a proposal. Catches "we forgot to
// reference NFPA 72" before it becomes a failed inspection.
// =============================================================================

export interface ComplianceItem {
  id: string;
  label: string;
  /** Code citation or doc reference shown beneath the label. */
  reference?: string;
  /** When true, this item must be checked before submit. */
  required: boolean;
  /** Limit visibility to these state codes (CA, NV, AZ). Empty = all states. */
  states?: string[];
  /** Limit visibility to scopes touching these systems. Empty = all scopes. */
  systems?: string[];
}

/** Map office id to the state code used for compliance routing. */
export const OFFICE_STATE: Record<string, string> = {
  'rancho-cordova': 'CA',
  'livermore': 'CA',
  'sparks': 'NV',
};

export const COMPLIANCE_ITEMS: ComplianceItem[] = [
  // California-specific
  {
    id: 'ca_t24',
    label: 'Title 24 energy code reviewed',
    reference: 'CA Energy Code (Title 24, Part 6) — applies to new construction & major retrofits affecting lighting/HVAC/AV',
    required: true,
    states: ['CA'],
  },
  {
    id: 'ca_prevailing_wage',
    label: 'Prevailing wage status determined (public works yes/no)',
    reference: 'CA Labor Code §1771–§1815; required documentation if public works',
    required: true,
    states: ['CA'],
  },
  {
    id: 'ca_calosha',
    label: 'Cal/OSHA fall-protection plan in scope (if working at heights)',
    reference: 'Cal/OSHA §1670 — fall arrest required at >7.5ft',
    required: false,
    states: ['CA'],
  },
  // Nevada-specific
  {
    id: 'nv_contractor_license',
    label: 'Nevada State Contractors Board license in scope',
    reference: 'NV NRS Chapter 624 — required for any contracting work in NV',
    required: true,
    states: ['NV'],
  },
  // System-specific (any state)
  {
    id: 'fire_nfpa72',
    label: 'NFPA 72 compliance for fire alarm devices',
    reference: 'AHJ permit + acceptance test required before energizing',
    required: true,
    systems: ['Fire Alarm'],
  },
  {
    id: 'access_nfpa101',
    label: 'NFPA 101 egress requirements for access-controlled doors',
    reference: 'Maglocks must release on fire alarm + REX + power loss',
    required: true,
    systems: ['Access Control'],
  },
  {
    id: 'access_ada',
    label: 'ADA hardware compliance for access-controlled doors',
    reference: 'Operating force ≤5 lbf, lever-style hardware, height 34–48"',
    required: true,
    systems: ['Access Control'],
  },
  {
    id: 'cable_tia568',
    label: 'TIA-568 cable terminations & Fluke certification in scope',
    reference: 'Required for warranty on Berk-Tek/Panduit/Leviton structured cabling',
    required: false,
    systems: ['Structured Cabling'],
  },
  {
    id: 'cctv_privacy',
    label: 'Privacy notice/signage requirements reviewed for CCTV install',
    reference: 'Some jurisdictions require posted notice; check local rules',
    required: false,
    systems: ['CCTV'],
  },
  // Universal
  {
    id: 'permits_pulled',
    label: 'Permits identified and either pulled or quoted as separate line',
    reference: 'Low-voltage permits vary by AHJ; not pulling = stop-work risk',
    required: true,
  },
  {
    id: 'documentation',
    label: 'As-builts / labels / closeout documentation included in labor',
    reference: 'Customer-required deliverable on most commercial jobs',
    required: false,
  },
];

/** Filter compliance items to those relevant for the current office + scope. */
export function relevantComplianceItems(officeId: string | undefined, systems: string[]): ComplianceItem[] {
  const state = OFFICE_STATE[officeId ?? ''] ?? 'CA';
  return COMPLIANCE_ITEMS.filter(item => {
    if (item.states && !item.states.includes(state)) return false;
    if (item.systems && !item.systems.some(s => systems.includes(s))) return false;
    return true;
  });
}
