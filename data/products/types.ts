/**
 * Compact Product Format — Enables 5000+ product database
 * without overwhelming file sizes.
 * 
 * Each product is a tuple array for maximum density.
 * The converter function expands to full ProductDefinition.
 */

import { type ProductDefinition } from '../productDatabase';

/**
 * Compact product tuple format:
 * [manufacturer, model, partNumber, category, subcategory, msrp, uom, description, laborHours, complexity]
 */
export type CompactProduct = [
    string,        // 0: manufacturer
    string,        // 1: model
    string,        // 2: partNumber
    'M' | 'E',    // 3: category (Material | Equipment)
    string,        // 4: subcategory
    number,        // 5: msrp
    string,        // 6: unitOfMeasure
    string,        // 7: description
    number,        // 8: laborHours
    'L' | 'M' | 'H' // 9: complexity
];

/**
 * Convert a compact product entry to a full ProductDefinition.
 * Installation requirements and accessories are left empty —
 * the AI infers them from product type, and the code validator
 * checks via the common-items rules.
 */
export function toProductDefinition(cp: CompactProduct): ProductDefinition {
    return {
        manufacturer: cp[0],
        model: cp[1],
        partNumber: cp[2],
        category: cp[3] === 'M' ? 'Material' : 'Equipment',
        subcategory: cp[4],
        msrp: cp[5],
        unitOfMeasure: cp[6],
        description: cp[7],
        installationRequirements: [],
        accessories: [],
        laborHours: cp[8],
        complexity: cp[9] === 'L' ? 'Low' : cp[9] === 'M' ? 'Medium' : 'High',
    };
}

/**
 * Batch convert compact products to full ProductDefinitions.
 */
export function toProductDefinitions(products: CompactProduct[]): ProductDefinition[] {
    return products.map(toProductDefinition);
}
