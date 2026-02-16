
import { ChangeOrderData, LaborRates, Financials } from '../types';

const LABOR_MARKUP_RATE = 0.15;
const ASSET_MARKUP_RATE = 0.15;
const SALES_TAX_RATE = 0.0825; // 8.25% Rancho Cordova

/** Round UP to nearest cent — prevents 3-digit values and never underbills */
const round2 = (n: number) => Math.ceil(n * 100) / 100;

/**
 * Single source of truth for all financial calculations.
 * Used by both ChangeOrderView (display) and App (proposal generation).
 */
export function calculateFinancials(data: ChangeOrderData, rates: LaborRates): Financials & {
    laborSubtotal: number;
    laborMarkup: number;
    materialSubtotal: number;
    materialMarkup: number;
    equipmentSubtotal: number;
    equipmentMarkup: number;
    salesTax: number;
    taxBase: number;
} {
    // Labor
    const laborSubtotal = round2(data.labor.reduce((acc, task) => {
        const rate = rates[task.rateType as keyof LaborRates] || rates.base;
        return acc + (task.hours * rate);
    }, 0));
    const laborMarkup = round2(laborSubtotal * LABOR_MARKUP_RATE);
    const laborTotal = round2(laborSubtotal + laborMarkup);

    // Materials (passive infrastructure)
    const materialSubtotal = round2(data.materials
        .filter(m => m.category === 'Material')
        .reduce((acc, item) => acc + (item.msrp * item.quantity), 0));
    const materialMarkup = round2(materialSubtotal * ASSET_MARKUP_RATE);

    // Equipment (active devices)
    const equipmentSubtotal = round2(data.materials
        .filter(m => m.category === 'Equipment')
        .reduce((acc, item) => acc + (item.msrp * item.quantity), 0));
    const equipmentMarkup = round2(equipmentSubtotal * ASSET_MARKUP_RATE);

    const materialsTotal = round2(materialSubtotal + equipmentSubtotal + materialMarkup + equipmentMarkup);

    // Tax on raw material + equipment cost (before markup)
    const taxBase = round2(materialSubtotal + equipmentSubtotal);
    const salesTax = round2(taxBase * SALES_TAX_RATE);

    const grandTotal = round2(laborTotal + materialsTotal + salesTax);

    return {
        laborSubtotal,
        laborMarkup,
        laborTotal,
        materialSubtotal,
        materialMarkup,
        equipmentSubtotal,
        equipmentMarkup,
        materialsTotal,
        salesTax,
        taxBase,
        taxTotal: salesTax,
        grandTotal,
    };
}
