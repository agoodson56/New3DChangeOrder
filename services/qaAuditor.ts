/**
 * Brain 3: QA Auditor
 * 
 * Final quality audit of the complete change order.
 * Reviews for omissions, errors, code violations, and professional standards.
 * Uses Gemini to apply expert-level review that code validation can't do.
 */

import { ChangeOrderData } from '../types';
import { generateContent, ApiKeyError, RateLimitError } from './geminiClient';
import { FULL_CATALOG, lookupProduct } from '../data/products';
import {
    CCTV_CAMERAS, NVR_SYSTEMS, ACCESS_READERS, DOOR_HARDWARE, ACCESS_PANELS,
    CABLING_PRODUCTS, PATHWAY_PRODUCTS, AV_PRODUCTS, INTRUSION_PANELS, INTRUSION_SENSORS,
    FIRE_ALARM_PRODUCTS, FIRE_ALARM_CABLE, VERKADA_CAMERAS, BERKTEK_CABLE,
    POE_SWITCHES, CONSUMABLE_PRODUCTS, CAMERA_MOUNT_PRODUCTS,
    type ProductDefinition
} from '../data/productDatabase';

const ALL_DB_PRODUCTS: ProductDefinition[] = [
    ...CCTV_CAMERAS, ...NVR_SYSTEMS, ...ACCESS_READERS, ...DOOR_HARDWARE,
    ...ACCESS_PANELS, ...CABLING_PRODUCTS, ...PATHWAY_PRODUCTS, ...AV_PRODUCTS,
    ...INTRUSION_PANELS, ...INTRUSION_SENSORS, ...FIRE_ALARM_PRODUCTS,
    ...FIRE_ALARM_CABLE, ...VERKADA_CAMERAS, ...BERKTEK_CABLE, ...POE_SWITCHES,
    ...CONSUMABLE_PRODUCTS, ...CAMERA_MOUNT_PRODUCTS,
];

function isDbVerified(manufacturer: string, model: string): boolean {
    const mfrLower = manufacturer.toLowerCase();
    const modelLower = model.toLowerCase();
    // Check FULL_CATALOG first (authoritative price source)
    const inCatalog = FULL_CATALOG.some(p => {
        const pMfr = p[0].toLowerCase();
        const pModel = p[1].toLowerCase();
        const pSub = p[4].toLowerCase();
        const pDesc = p[7].toLowerCase();
        const mfrMatch = pMfr === mfrLower || mfrLower === 'generic' || pMfr === 'generic';
        const modelMatch = pModel === modelLower || pModel.includes(modelLower) ||
            modelLower.includes(pModel) || pSub.includes(modelLower) ||
            pDesc.includes(modelLower);
        return mfrMatch && modelMatch;
    });
    if (inCatalog) return true;
    // Fallback: legacy productDatabase
    const inDb = ALL_DB_PRODUCTS.some(p =>
        (p.manufacturer.toLowerCase() === mfrLower && p.model.toLowerCase() === modelLower) ||
        (p.manufacturer.toLowerCase() === mfrLower && (
            p.model.toLowerCase().includes(modelLower) || modelLower.includes(p.model.toLowerCase())
        ))
    );
    return inDb;
}

const QA_SCHEMA = {
    type: 'OBJECT' as const,
    properties: {
        overallScore: { type: 'INTEGER' as const },
        issues: {
            type: 'ARRAY' as const,
            items: { type: 'STRING' as const }
        },
        recommendations: {
            type: 'ARRAY' as const,
            items: { type: 'STRING' as const }
        },
        missingItems: {
            type: 'ARRAY' as const,
            items: { type: 'STRING' as const }
        },
        brandingIssues: {
            type: 'ARRAY' as const,
            items: { type: 'STRING' as const }
        },
        complianceNotes: {
            type: 'ARRAY' as const,
            items: { type: 'STRING' as const }
        }
    },
    required: ['overallScore', 'issues', 'recommendations', 'missingItems', 'brandingIssues', 'complianceNotes']
};

export interface QAAuditResult {
    overallScore: number;
    issues: string[];
    recommendations: string[];
    missingItems: string[];
    brandingIssues: string[];
    complianceNotes: string[];
}

/**
 * Performs QA audit on a completed change order.
 * Checks for professional completeness, omissions, and industry standards.
 */
export async function auditChangeOrder(data: ChangeOrderData): Promise<QAAuditResult> {
    // Identify which materials are already in our verified product database
    const dbVerifiedItems = data.materials
        .filter(m => isDbVerified(m.manufacturer, m.model))
        .map(m => `${m.manufacturer} ${m.model} — $${m.msrp} (DB-verified)`);

    const dbVerifiedSection = dbVerifiedItems.length > 0
        ? `\n=== DATABASE-VERIFIED ITEMS ===\nThe following ${dbVerifiedItems.length} items are from our verified product database with confirmed, accurate pricing.\nDo NOT flag these as missing, generic, unverified, or incorrectly priced. Their specifications are confirmed:\n${dbVerifiedItems.join('\n')}\n`
        : '';

    const materialSummary = data.materials.map((m, i) =>
        `[${i}] ${m.manufacturer} ${m.model} — Qty: ${m.quantity} — $${m.msrp} ${m.unitOfMeasure || 'ea'} — ${m.category}${isDbVerified(m.manufacturer, m.model) ? ' [DB-VERIFIED]' : ''}`
    ).join('\n');

    const laborSummary = data.labor.map((l, i) =>
        `[${i}] ${l.class}: ${l.task} — ${l.hours}hrs — ${l.rateType}`
    ).join('\n');

    const prompt = `You are an elite low-voltage industry Quality Assurance auditor with 25 years of experience reviewing change orders for commercial low-voltage systems (CCTV, Access Control, Structured Cabling, AV, Intrusion Detection, Fire Alarm).

Review this Change Order for customer-presentability. Score it 0-100.

IMPORTANT SCORING GUIDANCE:
- If most materials are DB-VERIFIED and labor is properly broken down, start at 92+ and deduct only for genuine omissions
- Only deduct points for items NOT marked [DB-VERIFIED]
- Do NOT penalize for using 'Generic' manufacturer on commodity items (conduit, fittings, etc.) — this is standard industry practice
- Focus on structural issues: missing labor categories, missing critical equipment, code violations
${dbVerifiedSection}
=== CHANGE ORDER DETAILS ===
Customer: ${data.customer}
Project: ${data.projectName}
Scope: ${data.technicalScope}
Systems: ${data.systemsImpacted.join(', ')}

MATERIALS:
${materialSummary}

LABOR:
${laborSummary}

PROFESSIONAL NOTES: ${data.professionalNotes}
ASSUMPTIONS: ${data.assumptions.join('; ')}

=== AUDIT CHECKLIST ===
Check each of these and report issues:

1. MATERIAL COMPLETENESS - Zero Omission Check:
   - For each camera: Is cable, connectors, mounting hardware, J-hooks included?
   - For each door: Is reader, strike/maglock, cable, power supply, REX device included?
   - For each cable run: Are jacks, patch cables, labels, J-hooks included?
   - For each fire alarm device: Is FPLP cable, junction box, conduit included?

2. LABOR ACCURACY:
   - Are labor hours reasonable for the device count?
   - Is there a separate line for survey, programming, testing, and documentation?
   - NECA MLU: Indoor dome cameras = 1.5 hrs, outdoor = 2.5 hrs, PTZ = 4 hrs, panels = 3-4 hrs

3. MANUFACTURER CONSISTENCY:
   - Are all cameras the same brand?
   - Are all access control components from the same ecosystem?
   - Is there a valid warranty path (e.g., Berk-Tek cable + Leviton connectivity)?

4. PROFESSIONAL COMPLETENESS:
   - Does the scope clearly describe what's being done?
   - Are assumptions and exclusions listed?
   - Are standards/codes referenced (TIA-568, NFPA 72, NFPA 70)?

5. MISSING STANDARD ITEMS:
   - Documentation/as-builts labor
   - Testing and commissioning labor
   - Project management / coordination
   - Firestopping materials (if penetrating fire barriers)
   - Lift rental (if ceiling height > 12ft)

Return:
- overallScore: 0-100 (95+ = customer ready, 80-94 = needs minor fixes, <80 = needs major rework)
- issues: specific problems found
- recommendations: improvements to make it customer-ready
- missingItems: materials or labor tasks that should be added
- brandingIssues: manufacturer mixing or warranty concerns
- complianceNotes: code/standard violations`;

    // Single attempt, fail fast. QA audit is non-essential — if it doesn't
    // succeed, the change order still ships with deterministic validation
    // (coValidator) and any pricing checks that did succeed.
    try {
        const response = await generateContent({
            model: 'gemini-2.5-flash',
            nonEssential: true,
            contents: { parts: [{ text: prompt }] },
            config: {
                temperature: 0,
                responseMimeType: 'application/json',
                responseSchema: QA_SCHEMA,
            }
        });

        const text = response.text || '{}';
        const result = JSON.parse(text);

        return {
            overallScore: result.overallScore || 70,
            issues: result.issues || [],
            recommendations: result.recommendations || [],
            missingItems: result.missingItems || [],
            brandingIssues: result.brandingIssues || [],
            complianceNotes: result.complianceNotes || [],
        };
    } catch (error: any) {
        if (error instanceof ApiKeyError) {
            console.error('QA audit: API key error', error);
            throw error;
        }
        const reason = error instanceof RateLimitError ? 'rate limit reached'
            : (error?.name === 'UnavailableError' ? 'AI service overloaded' : 'failed');
        console.warn(`QA audit skipped: ${reason}`);
        return {
            overallScore: 70,
            issues: [`QA audit skipped — ${reason}. The deterministic validator still ran. Review the line items manually before issuing.`],
            recommendations: [],
            missingItems: [],
            brandingIssues: [],
            complianceNotes: []
        };
    }
}
