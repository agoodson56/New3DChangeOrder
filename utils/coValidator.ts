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
    PATHWAY_PRODUCTS,
    CONSUMABLE_PRODUCTS,
    CAMERA_MOUNT_PRODUCTS,
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
    ...PATHWAY_PRODUCTS,
    ...CONSUMABLE_PRODUCTS,
    ...CAMERA_MOUNT_PRODUCTS,
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
    /** A defensively-cloned copy of the input with auto-corrections applied
     *  (e.g. complexity defaulted to 'Medium', unitOfMeasure 'ft' inferred
     *  for bulk cable). The input object is NEVER mutated. */
    correctedData: ChangeOrderData;
}

/**
 * Run all validation rules against a generated Change Order.
 * Returns warnings, auto-corrections, and a corrected copy of the data.
 *
 * **Pure**: input is treated as readonly. Auto-corrections are applied to
 * a deep-enough clone (materials & labor arrays are re-built; other fields
 * are shallow-copied). Callers who want the corrected version should read
 * `result.correctedData`.
 */
export function validateChangeOrder(input: ChangeOrderData): ValidationOutput {
    // Clone enough to safely apply auto-corrections without touching input.
    // Materials & labor are the only arrays we mutate items inside of, so
    // those need item-level clones; the rest can be a shallow spread.
    const data: ChangeOrderData = {
        ...input,
        materials: (input.materials || []).map(m => ({ ...m })),
        labor: (input.labor || []).map(l => ({ ...l })),
    };
    const warnings: ValidationWarning[] = [];
    const autoCorrections: string[] = [];
    let deductions = 0;

    // =========================================================================
    // RULE 0: Empty CO sanity — no materials AND no labor is suspicious
    // =========================================================================
    if ((!data.materials || data.materials.length === 0) && (!data.labor || data.labor.length === 0)) {
        warnings.push({
            type: 'schema',
            severity: 'error',
            message: 'Change order has no materials and no labor — AI may have failed to parse the request.'
        });
        deductions += 30;
    } else if (!data.materials || data.materials.length === 0) {
        warnings.push({
            type: 'material',
            severity: 'warning',
            message: 'Change order has no materials. Verify this is intentional (labor-only CO).'
        });
        deductions += 5;
    } else if (!data.labor || data.labor.length === 0) {
        warnings.push({
            type: 'labor',
            severity: 'warning',
            message: 'Change order has no labor. Verify this is intentional (materials-only credit/deduct CO).'
        });
        deductions += 5;
    }

    // =========================================================================
    // RULE 1: All materials must have valid quantity, msrp, category, and identifying info
    // — with isDeduct branching: credits may legitimately have negative subtotals,
    // but quantity and msrp themselves should remain positive (the sign is applied
    // by the isDeduct flag, not by negative inputs).
    // =========================================================================
    data.materials.forEach((item, idx) => {
        const isDeduct = item.isDeduct === true;
        if (item.quantity < 0) {
            // Negative quantity is always wrong — credits use isDeduct=true.
            warnings.push({
                type: 'schema',
                severity: 'error',
                message: `${item.manufacturer} ${item.model}: quantity is ${item.quantity} (must be ≥ 0; use isDeduct=true for credits, not negative qty)`,
                itemIndex: idx
            });
            deductions += 3;
        } else if (item.quantity === 0) {
            // Zero quantity is suspicious but might be a placeholder during
            // in-progress edits (operator added a row, hasn't filled qty yet).
            // Flag as info, no score deduction. The UI shows the row visually,
            // and the financial calc treats it as $0 contribution — no harm done.
            warnings.push({
                type: 'schema',
                severity: 'info',
                message: `${item.manufacturer || 'Item'} ${item.model || `[${idx}]`}: quantity is 0 — fill in before issuing`,
                itemIndex: idx
            });
        }
        if (item.msrp <= 0) {
            warnings.push({
                type: 'pricing',
                severity: isDeduct ? 'info' : 'warning',
                message: `${item.manufacturer} ${item.model}: MSRP is $${item.msrp} (may be missing)`,
                itemIndex: idx
            });
            if (!isDeduct) deductions += 2;
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
        if (!item.manufacturer || item.manufacturer.trim() === '') {
            warnings.push({
                type: 'schema',
                severity: 'warning',
                message: `Item [${idx}] has no manufacturer`,
                itemIndex: idx
            });
            deductions += 1;
        }
        if (!item.model || item.model.trim() === '') {
            warnings.push({
                type: 'schema',
                severity: 'error',
                message: `Item [${idx}] (${item.manufacturer}) has no model number`,
                itemIndex: idx
            });
            deductions += 2;
        }
        if (!item.complexity || !['Low', 'Medium', 'High'].includes(item.complexity)) {
            warnings.push({
                type: 'schema',
                severity: 'info',
                message: `${item.model}: missing/invalid complexity "${item.complexity}" — defaulting to Medium`,
                itemIndex: idx,
                autoCorrection: 'Auto-set to Medium'
            });
            item.complexity = 'Medium';
            autoCorrections.push(`Set ${item.model} complexity to 'Medium'`);
        }
    });

    // =========================================================================
    // RULE 1b: Cable per-foot price sanity. A typo entering box price as
    // per-foot ($45/ft instead of $0.45/ft) silently inflates the bid by 100x.
    // Conversely, $0.05/ft is below floor for any commercial cable.
    // =========================================================================
    data.materials.forEach((item, idx) => {
        if (item.unitOfMeasure !== 'ft') return;
        if (item.msrp > 0 && item.msrp < 0.10) {
            warnings.push({
                type: 'pricing',
                severity: 'warning',
                message: `${item.model}: $${item.msrp.toFixed(2)}/ft seems unrealistically low for commercial cable (typical floor: $0.10/ft)`,
                itemIndex: idx
            });
            deductions += 2;
        }
        if (item.msrp > 5) {
            warnings.push({
                type: 'pricing',
                severity: 'warning',
                message: `${item.model}: $${item.msrp.toFixed(2)}/ft seems unrealistically high — verify this isn't a per-box price (typical ceiling: $5/ft)`,
                itemIndex: idx
            });
            deductions += 2;
        }
    });

    // =========================================================================
    // RULE 1c: Category price-band sanity. Catches outliers regardless of
    // source (AI hallucination, stale DB entry, user typo). Bands reflect
    // current contractor street pricing (lower-quartile to upper bound).
    // Only flags items SIGNIFICANTLY outside expected ranges — minor variance
    // is fine. Goal: catch a $5,899 PTZ when street is $3K, not nitpick a $30
    // difference.
    // =========================================================================
    type PriceBand = { floor: number; ceiling: number; description: string; matchers: RegExp[] };
    const PRICE_BANDS: PriceBand[] = [
        // CCTV
        { floor: 100, ceiling: 1500, description: 'IP fixed/dome camera', matchers: [/\b(dome|bullet|fixed)\b.*\b(camera|ip)\b/i, /\b(ip|network)\s+camera\b/i] },
        { floor: 1500, ceiling: 4500, description: 'PTZ camera (top tier)', matchers: [/\bPTZ\b/i] },
        { floor: 400, ceiling: 6000, description: 'NVR / video recorder', matchers: [/\bNVR\b/i, /\bvideo recorder\b/i, /\bDVR\b/i] },
        // Network
        { floor: 200, ceiling: 3000, description: 'PoE / managed switch', matchers: [/\bPoE\b.*\bswitch\b/i, /\bmanaged switch\b/i] },
        // Access control
        { floor: 100, ceiling: 800, description: 'Access reader', matchers: [/\b(card |access )?reader\b/i] },
        { floor: 200, ceiling: 1500, description: 'Access controller / panel', matchers: [/\baccess (controller|panel)\b/i, /\bdoor (controller|panel)\b/i] },
        { floor: 100, ceiling: 600, description: 'Electric strike / maglock', matchers: [/\belectric strike\b/i, /\bmaglock\b/i, /\bmagnetic lock\b/i] },
        // AV
        { floor: 1500, ceiling: 5000, description: 'AV control processor', matchers: [/\bcontrol processor\b/i, /\bcrestron.*CP\d/i] },
        // Structured cabling
        { floor: 100, ceiling: 800, description: '24-port patch panel', matchers: [/\b24[- ]?port.*patch panel\b/i, /\bpatch panel.*24[- ]?port\b/i] },
        { floor: 200, ceiling: 1200, description: '48-port patch panel', matchers: [/\b48[- ]?port.*patch panel\b/i, /\bpatch panel.*48[- ]?port\b/i] },
        // Fire alarm
        { floor: 1500, ceiling: 12000, description: 'Fire alarm control panel (FACP)', matchers: [/\b(FACP|fire alarm panel|fire alarm control)\b/i] },
    ];

    data.materials.forEach((item, idx) => {
        if (item.unitOfMeasure === 'ft') return; // cable already handled in 1b
        if (item.msrp <= 0) return;
        const haystack = `${item.manufacturer} ${item.model} ${(item as any).subcategory || ''}`;
        for (const band of PRICE_BANDS) {
            const matched = band.matchers.some(rx => rx.test(haystack));
            if (!matched) continue;
            if (item.msrp > band.ceiling * 1.10) {
                // 10% grace above ceiling before flagging
                warnings.push({
                    type: 'pricing',
                    severity: 'warning',
                    message: `${item.manufacturer} ${item.model}: $${item.msrp.toFixed(2)} is above the typical ${band.description} band ($${band.floor}–$${band.ceiling}). Verify against current distributor pricing — may be inflated list MSRP.`,
                    itemIndex: idx
                });
                deductions += 2;
            } else if (item.msrp < band.floor * 0.50) {
                // 50% below floor = likely typo
                warnings.push({
                    type: 'pricing',
                    severity: 'warning',
                    message: `${item.manufacturer} ${item.model}: $${item.msrp.toFixed(2)} is below the typical ${band.description} floor ($${band.floor}). Verify this isn't a typo or wrong unit.`,
                    itemIndex: idx
                });
                deductions += 2;
            }
            break; // first matching band wins
        }
    });

    // =========================================================================
    // RULE 1d: Duplicate detection — same manufacturer+model appearing twice
    // is almost always a data-entry mistake.
    // =========================================================================
    const seen = new Map<string, number>();
    data.materials.forEach((item, idx) => {
        const key = `${item.manufacturer.toLowerCase()}|${item.model.toLowerCase()}`;
        if (seen.has(key)) {
            const prevIdx = seen.get(key)!;
            warnings.push({
                type: 'material',
                severity: 'warning',
                message: `Duplicate material: "${item.manufacturer} ${item.model}" appears at rows ${prevIdx + 1} and ${idx + 1}. Likely a duplicate entry — verify quantities aren't being double-counted.`,
                itemIndex: idx
            });
            deductions += 2;
        } else {
            seen.set(key, idx);
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
            combined.includes('firestop') ||
            combined.includes('tubing') ||
            combined.includes('loom') ||
            combined.includes('shrink') ||
            combined.includes('tape') ||
            combined.includes('nut') ||
            combined.includes('kit') ||
            combined.includes('assort');

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
    // RULE 4: J-hooks — 1 per 10ft of cable run (3DTSI install standard)
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

    // Tightened thresholds (was 70%/85%): bidding 20% under NECA is enough
    // to lose a job's margin — flag aggressively. Operators can override
    // with explicit acknowledgment or a reduced complexity rating.
    if (expectedMinLabor > 0 && totalLaborHours < expectedMinLabor * 0.80) {
        warnings.push({
            type: 'labor',
            severity: 'error',
            message: `Labor hours (${totalLaborHours.toFixed(1)}hrs) are significantly below NECA minimum (${expectedMinLabor.toFixed(1)}hrs expected). Under-estimated by ${((1 - totalLaborHours / expectedMinLabor) * 100).toFixed(0)}%`
        });
        deductions += 5;
    } else if (expectedMinLabor > 0 && totalLaborHours < expectedMinLabor * 0.95) {
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
        correctedData: data,
    };
}
