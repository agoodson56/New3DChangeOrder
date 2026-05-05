
import { ChangeOrderData, LaborRates, Financials } from '../types';
import {
  LABOR_MARKUP_RATE,
  MATERIAL_MARKUP_RATE,
  EQUIPMENT_MARKUP_RATE,
  TAX_ON_MARKED_UP_PRICE,
  DEFAULT_MATERIAL_COST_FACTOR,
  DEFAULT_EQUIPMENT_COST_FACTOR,
  DEFAULT_LABOR_COST_FACTOR,
} from '../constants';

const DEFAULT_SALES_TAX_RATE = 0.0825; // 8.25% Rancho Cordova fallback

/**
 * Round to nearest cent. Sign-symmetric: positive values round half-away-from-zero,
 * negative values also round half-away-from-zero, so credits/deducts get the
 * customer the cent they're owed. Replaces the previous Math.ceil-based rounding
 * which biased every cent toward the company on positive values AND on credits.
 */
const round2 = (n: number): number => {
  if (!Number.isFinite(n)) return 0;
  return Math.sign(n) * Math.round(Math.abs(n) * 100) / 100;
};

const validRateTypes = ['base', 'afterHours', 'emergency'] as const;
type RateKey = typeof validRateTypes[number];

function rateLookup(rates: LaborRates, rateType: string): number {
  if ((validRateTypes as readonly string[]).includes(rateType)) {
    return rates[rateType as RateKey];
  }
  if (rateType) {
    console.warn(`Unknown rateType "${rateType}" — defaulted to base. Possible AI/data drift.`);
  }
  return rates.base;
}

/**
 * Single source of truth for all financial calculations.
 * Used by both ChangeOrderView (display) and App (proposal generation).
 *
 * Markup rates and tax-base policy come from constants.tsx so business
 * decisions don't require touching this file.
 */
export function calculateFinancials(
    data: ChangeOrderData,
    rates: LaborRates,
    salesTaxRate: number = DEFAULT_SALES_TAX_RATE
): Financials & {
    laborSubtotal: number;
    laborMarkup: number;
    materialSubtotal: number;
    materialMarkup: number;
    equipmentSubtotal: number;
    equipmentMarkup: number;
    salesTax: number;
    taxBase: number;
    /** Sum of labor hours (deducts subtract). Single source of truth — display
     *  surfaces should read this rather than reducing data.labor inline. */
    totalLaborHours: number;
} {
    // Labor (deducts contribute negative values)
    const totalLaborHours = round2((data.labor || []).reduce((acc, task) => {
        const sign = task.isDeduct === true ? -1 : 1;
        const hours = Number.isFinite(task.hours) ? task.hours : 0;
        return acc + (sign * hours);
    }, 0));
    const laborSubtotal = round2((data.labor || []).reduce((acc, task) => {
        const rate = rateLookup(rates, task.rateType);
        const sign = task.isDeduct === true ? -1 : 1;
        const hours = Number.isFinite(task.hours) ? task.hours : 0;
        return acc + (sign * hours * rate);
    }, 0));
    const laborMarkup = round2(laborSubtotal * LABOR_MARKUP_RATE);
    const laborTotal = round2(laborSubtotal + laborMarkup);

    // Materials (passive infrastructure — deducts contribute negative values)
    const materialSubtotal = round2((data.materials || [])
        .filter(m => m.category === 'Material')
        .reduce((acc, item) => {
            const sign = item.isDeduct === true ? -1 : 1;
            const qty = Number.isFinite(item.quantity) ? item.quantity : 0;
            const msrp = Number.isFinite(item.msrp) ? item.msrp : 0;
            return acc + (sign * msrp * qty);
        }, 0));
    const materialMarkup = round2(materialSubtotal * MATERIAL_MARKUP_RATE);

    // Equipment (active devices — deducts contribute negative values)
    const equipmentSubtotal = round2((data.materials || [])
        .filter(m => m.category === 'Equipment')
        .reduce((acc, item) => {
            const sign = item.isDeduct === true ? -1 : 1;
            const qty = Number.isFinite(item.quantity) ? item.quantity : 0;
            const msrp = Number.isFinite(item.msrp) ? item.msrp : 0;
            return acc + (sign * msrp * qty);
        }, 0));
    const equipmentMarkup = round2(equipmentSubtotal * EQUIPMENT_MARKUP_RATE);

    const materialsTotal = round2(materialSubtotal + equipmentSubtotal + materialMarkup + equipmentMarkup);

    // Tax base — pre or post markup depending on policy flag.
    const taxBase = round2(
      TAX_ON_MARKED_UP_PRICE
        ? materialSubtotal + materialMarkup + equipmentSubtotal + equipmentMarkup
        : materialSubtotal + equipmentSubtotal
    );
    const salesTax = round2(taxBase * salesTaxRate);

    const grandTotal = round2(laborTotal + materialsTotal + salesTax);

    // ── Cost-side estimate (margin protection) ───────────────────────────
    // Estimates 3DTSI's true delivered cost, so the UI can show margin and
    // refuse loss-making bids. Tax is pass-through (collected and remitted
    // to the state) — not part of contractor cost or revenue.
    const laborCost = round2(laborSubtotal * DEFAULT_LABOR_COST_FACTOR);
    const materialCost = round2(materialSubtotal * DEFAULT_MATERIAL_COST_FACTOR);
    const equipmentCost = round2(equipmentSubtotal * DEFAULT_EQUIPMENT_COST_FACTOR);
    const estimatedCost = round2(laborCost + materialCost + equipmentCost);
    const revenueExTax = round2(grandTotal - salesTax);
    const grossProfit = round2(revenueExTax - estimatedCost);
    const marginPct = revenueExTax !== 0
        ? grossProfit / revenueExTax
        : 0;

    return {
        laborSubtotal,
        laborMarkup,
        laborTotal,
        totalLaborHours,
        materialSubtotal,
        materialMarkup,
        equipmentSubtotal,
        equipmentMarkup,
        materialsTotal,
        salesTax,
        taxBase,
        taxTotal: salesTax,
        grandTotal,
        estimatedCost,
        grossProfit,
        marginPct,
    };
}

/** Format USD with locale pinned to en-US so the printed CO is jurisdiction-neutral. */
export function fmtUSD(n: number): string {
  if (!Number.isFinite(n)) return '$ 0.00';
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n < 0 ? `- $ ${formatted}` : `$ ${formatted}`;
}
