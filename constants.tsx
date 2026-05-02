
import React from 'react';

export const COLORS = {
  black: '#000000',
  gold: '#f2bc1c',
  teal: '#008a8a',
  goldDark: '#B8860B'
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
 */
export const LABOR_MARKUP_RATE = 0.15;

/**
 * Markup applied to passive materials (cabling, jacks, conduit, etc.).
 * Industry norm is 25–35%; using 15% leaves money on the table on
 * cabling-heavy jobs. Confirm with sales/management before changing.
 */
export const MATERIAL_MARKUP_RATE = 0.15;

/**
 * Markup applied to active equipment (cameras, switches, panels).
 * Industry norm is 15–20%.
 */
export const EQUIPMENT_MARKUP_RATE = 0.15;

/**
 * Sales tax base policy.
 *  - false (default): tax on PRE-markup material+equipment cost.
 *    Matches the legacy behavior. Lower tax billed to customer.
 *  - true: tax on POST-markup material+equipment price.
 *    Matches CDTFA Reg. 1521 for many CA contractor situations.
 *    On a $50K materials job at 8.25%, post-markup adds ~$619.
 *
 * **VERIFY WITH YOUR ACCOUNTANT** before flipping this.
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
 * Set to 0 to disable the guardrail.
 */
export const MARGIN_FLOOR_PCT = 0.20; // 20%

/** Margin warning threshold — amber zone above the red floor. */
export const MARGIN_WARN_PCT = 0.25; // 25%
