/**
 * Brain 3: QA Auditor
 * 
 * Final quality audit of the complete change order.
 * Reviews for omissions, errors, code violations, and professional standards.
 * Uses Gemini to apply expert-level review that code validation can't do.
 */

import { GoogleGenAI } from '@google/genai';
import { ChangeOrderData } from '../types';

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
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;

    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
        console.warn('QA audit skipped: API key not available');
        return {
            overallScore: 70,
            issues: ['QA audit could not run: API key not configured'],
            recommendations: [],
            missingItems: [],
            brandingIssues: [],
            complianceNotes: []
        };
    }

    const ai = new GoogleGenAI({ apiKey });

    const materialSummary = data.materials.map((m, i) =>
        `[${i}] ${m.manufacturer} ${m.model} — Qty: ${m.quantity} — $${m.msrp} ${m.unitOfMeasure || 'ea'} — ${m.category}`
    ).join('\n');

    const laborSummary = data.labor.map((l, i) =>
        `[${i}] ${l.class}: ${l.task} — ${l.hours}hrs — ${l.rateType}`
    ).join('\n');

    const prompt = `You are an elite low-voltage industry Quality Assurance auditor with 25 years of experience reviewing change orders for commercial low-voltage systems (CCTV, Access Control, Structured Cabling, AV, Intrusion Detection, Fire Alarm).

Review this Change Order for customer-presentability. Score it 0-100.

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

    const MAX_RETRIES = 3;
    const BASE_DELAY_MS = 2000;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
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
            const is429 = error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');

            if (is429 && attempt < MAX_RETRIES - 1) {
                const delay = BASE_DELAY_MS * Math.pow(2, attempt); // 2s, 4s, 8s
                console.warn(`QA audit rate limited (429). Retrying in ${delay / 1000}s... (attempt ${attempt + 1}/${MAX_RETRIES})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            console.error('QA audit error:', error);
            return {
                overallScore: 60,
                issues: [is429 ? 'QA audit skipped — API rate limit reached. Try again in a moment.' : 'QA audit failed — please review manually'],
                recommendations: [],
                missingItems: [],
                brandingIssues: [],
                complianceNotes: []
            };
        }
    }

    // Fallback (shouldn't reach here)
    return {
        overallScore: 60,
        issues: ['QA audit did not complete'],
        recommendations: [],
        missingItems: [],
        brandingIssues: [],
        complianceNotes: []
    };
}
