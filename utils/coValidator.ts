/**
 * Code-side Change Order Validator — Deterministic validation engine.
 * NO AI involved. Pure math-based validation of generated COs.
 * 
 * Validates: cable quantities, J-hooks, labels, labor minimums,
 * manufacturer consistency, material completeness, and schema integrity.
 */

import { ChangeOrderData, MaterialItem, ValidationWarning } from '../types';
import {
    CCTV_CAMERAS,
    NVR_SYSTEMS,
    ACCESS_READERS,
    DOOR_HARDWARE,
    ACCESS_PANELS,
    CABLING_PRODUCTS,
    AV_PRODUCTS,
    INTRUSION_PANELS,
    INTRUSION_SENSORS,
    FIRE_ALARM_PRODUCTS,
    FIRE_ALARM_CABLE,
    VERKADA_CAMERAS,
    BERKTEK_CABLE,
    POE_SWITCHES,
    LABOR_STANDARDS,
    CABLE_STANDARDS,
    type ProductDefinition
} from '../data/productDatabase';

// Build a master lookup of all products by model name
const ALL_PRODUCTS: ProductDefinition[] = [
    ...CCTV_CAMERAS,
    ...NVR_SYSTEMS,
    ...ACCESS_READERS,
    ...DOOR_HARDWARE,
    ...ACCESS_PANELS,
    ...CABLING_PRODUCTS,
    ...AV_PRODUCTS,
    ...INTRUSION_PANELS,
    ...INTRUSION_SENSORS,
    ...FIRE_ALARM_PRODUCTS,
    ...FIRE_ALARM_CABLE,
    ...VERKADA_CAMERAS,
    ...BERKTEK_CABLE,
    ...POE_SWITCHES,
];

function findDbProduct(item: MaterialItem): ProductDefinition | undefined {
    const modelLower = item.model.toLowerCase();
    const mfrLower = item.manufacturer.toLowerCase();
    return ALL_PRODUCTS.find(p =>
        p.model.toLowerCase() === modelLower ||
        (p.manufacturer.toLowerCase() === mfrLower && p.model.toLowerCase().includes(modelLower))
    );
}

export interface ValidationOutput {
    valid: boolean;
    score: number; // 0-100
    warnings: ValidationWarning[];
    autoCorrections: string[];
}

/**
 * Run all validation rules against a generated Change Order.
 * Returns warnings and auto-corrections.
 */
export function validateChangeOrder(data: ChangeOrderData): ValidationOutput {
    const warnings: ValidationWarning[] = [];
    const autoCorrections: string[] = [];
    let deductions = 0;

    // =========================================================================
    // RULE 1: All materials must have quantity > 0, msrp > 0, valid category
    // =========================================================================
    data.materials.forEach((item, idx) => {
        if (item.quantity <= 0) {
            warnings.push({
                type: 'schema',
                severity: 'error',
                message: `${item.manufacturer} ${item.model}: quantity is ${item.quantity} (must be > 0)`,
                itemIndex: idx
            });
            deductions += 3;
        }
        if (item.msrp <= 0) {
            warnings.push({
                type: 'pricing',
                severity: 'warning',
                message: `${item.manufacturer} ${item.model}: MSRP is $${item.msrp} (may be missing)`,
                itemIndex: idx
            });
            deductions += 2;
        }
        if (!['Material', 'Equipment'].includes(item.category)) {
            warnings.push({
                type: 'schema',
                severity: 'error',
                message: `${item.manufacturer} ${item.model}: invalid category "${item.category}"`,
                itemIndex: idx
            });
            deductions += 2;
        }
    });

    // =========================================================================
    // RULE 2: Unit of measure — 'ft' for bulk cable, 'ea' for everything else.
    // Accessory items (jacks, panels, patch cables, connectors, ties, labels,
    // velcro, etc.) are sold per-each even though their names may contain
    // cable-related keywords like "cat6" or "cable".
    // =========================================================================
    data.materials.forEach((item, idx) => {
        const modelLower = item.model.toLowerCase();
        const descLower = (item.notes || '').toLowerCase();
        const combined = modelLower + ' ' + descLower;

        // Items that are sold per-each, NOT per-foot (exclude from cable check)
        const isAccessory =
            combined.includes('jack') ||
            combined.includes('panel') ||
            combined.includes('patch') ||
            combined.includes('connector') ||
            combined.includes('label') ||
            combined.includes('velcro') ||
            combined.includes('strap') ||
            combined.includes('tie') ||
            combined.includes('plug') ||
            combined.includes('keystone') ||
            combined.includes('faceplate') ||
            combined.includes('surface box') ||
            combined.includes('coupler') ||
            combined.includes('adapter') ||
            combined.includes('crimper') ||
            combined.includes('tester') ||
            combined.includes('tool') ||
            combined.includes('bag of') ||
            combined.includes('pack') ||
            combined.includes('roll of') ||
            combined.includes('box of') ||
            combined.includes('j-hook') ||
            combined.includes('jhook') ||
            combined.includes('hook') ||
            combined.includes('hanger') ||
            combined.includes('clamp') ||
            combined.includes('anchor') ||
            combined.includes('bracket') ||
            combined.includes('mount') ||
            combined.includes('sealant') ||
            combined.includes('firestop');

        // True bulk cable: sold by the foot
        const isBulkCable = !isAccessory && (
            combined.includes('cable') ||
            combined.includes('cat6a') ||
            combined.includes('cat6') ||
            combined.includes('cat5e') ||
            combined.includes('cat5') ||
            combined.includes('fplp') ||
            combined.includes('fplr') ||
            combined.includes('wire') ||
            combined.includes('fiber') ||
            combined.includes('coax') ||
            combined.includes('speaker wire')
        );

        if (isBulkCable && item.unitOfMeasure !== 'ft') {
            warnings.push({
                type: 'schema',
                severity: 'warning',
                message: `${item.model}: bulk cable should have unitOfMeasure 'ft', got '${item.unitOfMeasure}'`,
                itemIndex: idx,
                autoCorrection: 'Auto-set to ft'
            });
            item.unitOfMeasure = 'ft';
            autoCorrections.push(`Set ${item.model} unitOfMeasure to 'ft'`);
        }
    });

    // =========================================================================
    // RULE 3: Cable quantity should include overhead
    // =========================================================================
    const cableItems = data.materials.filter(m =>
        m.unitOfMeasure === 'ft' && m.category === 'Material'
    );
    // Just flag if cable runs seem suspiciously round (no overhead applied)
    cableItems.forEach((item, _) => {
        const qty = item.quantity;
        if (qty > 50 && qty % 100 === 0) {
            const idx = data.materials.indexOf(item);
            warnings.push({
                type: 'cable',
                severity: 'info',
                message: `${item.model}: ${qty}ft is exactly round — verify ${CABLE_STANDARDS.wasteFactorPercent}% overhead was included`,
                itemIndex: idx
            });
        }
    });

    // =========================================================================
    // RULE 4: J-hooks — 1 per 5ft of cable run
    // =========================================================================
    const totalCableFeet = cableItems.reduce((sum, item) => sum + item.quantity, 0);
    if (totalCableFeet > 0) {
        const expectedJHooks = Math.ceil(totalCableFeet / CABLE_STANDARDS.jHookSpacingFeet);
        const jHookItems = data.materials.filter(m =>
            m.model.toLowerCase().includes('j-hook') || m.model.toLowerCase().includes('jhook')
        );
        const actualJHooks = jHookItems.reduce((sum, item) => sum + item.quantity, 0);

        if (actualJHooks === 0 && totalCableFeet > 100) {
            warnings.push({
                type: 'material',
                severity: 'warning',
                message: `Missing J-hooks: ${totalCableFeet}ft of cable requires ~${expectedJHooks} J-hooks (1 per ${CABLE_STANDARDS.jHookSpacingFeet}ft)`
            });
            deductions += 3;
        } else if (actualJHooks > 0 && actualJHooks < expectedJHooks * 0.5) {
            warnings.push({
                type: 'material',
                severity: 'warning',
                message: `Low J-hook count: have ${actualJHooks}, expected ~${expectedJHooks} for ${totalCableFeet}ft of cable`
            });
            deductions += 1;
        }
    }

    // =========================================================================
    // RULE 5: Labels — 2 per cable run
    // =========================================================================
    const cableRunCount = cableItems.length;
    if (cableRunCount > 0) {
        const labelItems = data.materials.filter(m =>
            m.model.toLowerCase().includes('label')
        );
        const actualLabels = labelItems.reduce((sum, item) => sum + item.quantity, 0);
        const expectedLabels = cableRunCount * 2;

        if (actualLabels === 0) {
            warnings.push({
                type: 'material',
                severity: 'warning',
                message: `Missing cable labels: ${cableRunCount} cable runs should have ~${expectedLabels} labels`
            });
            deductions += 1;
        }
    }

    // =========================================================================
    // RULE 6: Labor hours minimum based on NECA standards
    // =========================================================================
    const totalLaborHours = data.labor.reduce((sum, task) => sum + task.hours, 0);

    // Count devices and calculate expected minimum
    let expectedMinLabor = 0;
    data.materials.forEach(item => {
        const dbProduct = findDbProduct(item);
        if (dbProduct) {
            expectedMinLabor += dbProduct.laborHours * item.quantity;
        }
    });

    if (expectedMinLabor > 0 && totalLaborHours < expectedMinLabor * 0.7) {
        warnings.push({
            type: 'labor',
            severity: 'error',
            message: `Labor hours (${totalLaborHours.toFixed(1)}hrs) are significantly below NECA minimum (${expectedMinLabor.toFixed(1)}hrs expected). Under-estimated by ${((1 - totalLaborHours / expectedMinLabor) * 100).toFixed(0)}%`
        });
        deductions += 5;
    } else if (expectedMinLabor > 0 && totalLaborHours < expectedMinLabor * 0.85) {
        warnings.push({
            type: 'labor',
            severity: 'warning',
            message: `Labor hours (${totalLaborHours.toFixed(1)}hrs) are below NECA baseline (${expectedMinLabor.toFixed(1)}hrs). Consider reviewing`
        });
        deductions += 2;
    }

    // =========================================================================
    // RULE 7: Manufacturer consistency within system type
    // =========================================================================
    const cameraItems = data.materials.filter(m =>
        m.model.toLowerCase().includes('camera') ||
        m.model.toLowerCase().includes('dome') ||
        m.model.toLowerCase().includes('ptz') ||
        m.model.toLowerCase().includes('bullet')
    );

    if (cameraItems.length > 1) {
        const cameraMfrs = [...new Set(cameraItems.map(m => m.manufacturer))];
        if (cameraMfrs.length > 1) {
            warnings.push({
                type: 'manufacturer',
                severity: 'warning',
                message: `Camera manufacturer mixing detected: ${cameraMfrs.join(', ')}. Should use single brand per system.`
            });
            deductions += 2;
        }
    }

    // =========================================================================
    // RULE 8: Required accessories from database are present
    // =========================================================================
    data.materials.forEach((item, idx) => {
        const dbProduct = findDbProduct(item);
        if (dbProduct) {
            const requiredAccessories = dbProduct.accessories.filter(a => a.type === 'required');
            requiredAccessories.forEach(req => {
                const found = data.materials.some(m =>
                    m.model.toLowerCase().includes(req.name.toLowerCase()) ||
                    m.manufacturer.toLowerCase().includes(req.manufacturer.toLowerCase())
                );
                if (!found) {
                    warnings.push({
                        type: 'material',
                        severity: 'warning',
                        message: `${item.manufacturer} ${item.model} requires "${req.name}" (${req.reason}) — not found on CO`,
                        itemIndex: idx
                    });
                    deductions += 1;
                }
            });
        }
    });

    // =========================================================================
    // RULE 9: All labor tasks have valid hours and rate types
    // =========================================================================
    data.labor.forEach((task, idx) => {
        if (task.hours <= 0) {
            warnings.push({
                type: 'schema',
                severity: 'error',
                message: `Labor task "${task.task}": hours is ${task.hours} (must be > 0)`,
                itemIndex: idx
            });
            deductions += 2;
        }
        if (!['base', 'afterHours', 'emergency'].includes(task.rateType)) {
            warnings.push({
                type: 'schema',
                severity: 'error',
                message: `Labor task "${task.task}": invalid rateType "${task.rateType}"`,
                itemIndex: idx
            });
            deductions += 2;
        }
    });

    // Calculate final score
    const score = Math.max(0, Math.min(100, 100 - deductions));

    return {
        valid: warnings.filter(w => w.severity === 'error').length === 0,
        score,
        warnings,
        autoCorrections,
    };
}
