/**
 * Brain 2: Pricing Validator
 * 
 * Uses Gemini with Google Search grounding to validate MSRPs
 * for all materials on a change order. Compares AI-generated prices
 * against real distributor pricing from the web.
 */

import { GoogleGenAI } from '@google/genai';
import { ChangeOrderData, PricingValidation } from '../types';
import {
    CCTV_CAMERAS, NVR_SYSTEMS, ACCESS_READERS, DOOR_HARDWARE, ACCESS_PANELS,
    CABLING_PRODUCTS, PATHWAY_PRODUCTS, AV_PRODUCTS, INTRUSION_PANELS, INTRUSION_SENSORS,
    FIRE_ALARM_PRODUCTS, FIRE_ALARM_CABLE, VERKADA_CAMERAS, BERKTEK_CABLE,
    POE_SWITCHES, CONSUMABLE_PRODUCTS, CAMERA_MOUNT_PRODUCTS,
    STANDARD_CONSUMABLES, type ProductDefinition
} from '../data/productDatabase';
import { FULL_CATALOG, lookupProduct } from '../data/products';

// Build master lookup
const ALL_DB_PRODUCTS: ProductDefinition[] = [
    ...CCTV_CAMERAS, ...NVR_SYSTEMS, ...ACCESS_READERS, ...DOOR_HARDWARE,
    ...ACCESS_PANELS, ...CABLING_PRODUCTS, ...PATHWAY_PRODUCTS, ...AV_PRODUCTS,
    ...INTRUSION_PANELS, ...INTRUSION_SENSORS, ...FIRE_ALARM_PRODUCTS,
    ...FIRE_ALARM_CABLE, ...VERKADA_CAMERAS, ...BERKTEK_CABLE, ...POE_SWITCHES,
    ...CONSUMABLE_PRODUCTS, ...CAMERA_MOUNT_PRODUCTS,
];

function isInDatabase(manufacturer: string, model: string, partNumber?: string): { found: boolean; dbProduct?: ProductDefinition } {
    const mfrLower = manufacturer.toLowerCase();
    const modelLower = model.toLowerCase();
    const partLower = (partNumber || '').toLowerCase();

    // 1. Exact part-number match (most reliable)
    if (partLower) {
        const byPart = ALL_DB_PRODUCTS.find(p =>
            p.partNumber.toLowerCase() === partLower
        );
        if (byPart) return { found: true, dbProduct: byPart };
    }

    // 2. Exact manufacturer + model match
    const exact = ALL_DB_PRODUCTS.find(p =>
        p.manufacturer.toLowerCase() === mfrLower &&
        p.model.toLowerCase() === modelLower
    );
    if (exact) return { found: true, dbProduct: exact };

    // 3. Fuzzy: manufacturer match + model substring
    const fuzzy = ALL_DB_PRODUCTS.find(p =>
        p.manufacturer.toLowerCase() === mfrLower && (
            p.model.toLowerCase().includes(modelLower) ||
            modelLower.includes(p.model.toLowerCase())
        )
    );
    if (fuzzy) return { found: true, dbProduct: fuzzy };

    // 4. Match consumables by name substring (AI may generate slightly different names)
    const consumableMatch = STANDARD_CONSUMABLES.find(c => {
        const cName = c.name.toLowerCase();
        return cName.includes(modelLower) || modelLower.includes(cName) ||
            c.partNumber.toLowerCase() === partLower;
    });
    if (consumableMatch) {
        // Find the corresponding CONSUMABLE_PRODUCTS entry
        const dbConsumable = CONSUMABLE_PRODUCTS.find(p =>
            p.partNumber.toLowerCase() === consumableMatch.partNumber.toLowerCase() ||
            p.model.toLowerCase().includes(consumableMatch.name.toLowerCase().slice(0, 15))
        );
        if (dbConsumable) return { found: true, dbProduct: dbConsumable };
        // Still match even without full ProductDefinition
        return {
            found: true, dbProduct: {
                manufacturer: mfrLower, model: consumableMatch.name,
                partNumber: consumableMatch.partNumber, category: 'Material',
                subcategory: 'Consumable', msrp: consumableMatch.msrp,
                unitOfMeasure: 'ea', description: '', installationRequirements: [],
                accessories: [], laborHours: 0, complexity: 'Low' as const
            }
        };
    }

    // 5. Check FULL_CATALOG (5000+ compact products)
    const catalogHit = lookupProduct(partLower || modelLower);
    if (catalogHit) {
        return {
            found: true, dbProduct: {
                manufacturer: catalogHit[0], model: catalogHit[1],
                partNumber: catalogHit[2], category: catalogHit[3] as 'Material' | 'Equipment',
                subcategory: catalogHit[4], msrp: catalogHit[5],
                unitOfMeasure: catalogHit[6], description: catalogHit[7],
                installationRequirements: [], accessories: [],
                laborHours: catalogHit[8], complexity: 'Low' as const
            }
        };
    }

    return { found: false };
}

/** Extract part number from model string if present in parentheses, e.g. 'P3245-V (02326-001)' → '02326-001' */
function extractPartNumber(model: string): string {
    const m = model.match(/\(([^)]+)\)/);
    return m ? m[1] : '';
}

const PRICING_SCHEMA = {
    type: 'OBJECT' as const,
    properties: {
        validations: {
            type: 'ARRAY' as const,
            items: {
                type: 'OBJECT' as const,
                properties: {
                    itemIndex: { type: 'INTEGER' as const },
                    manufacturer: { type: 'STRING' as const },
                    model: { type: 'STRING' as const },
                    validatedMsrp: { type: 'NUMBER' as const },
                    source: { type: 'STRING' as const },
                    confidence: { type: 'INTEGER' as const },
                },
                required: ['itemIndex', 'manufacturer', 'model', 'validatedMsrp', 'source', 'confidence']
            }
        }
    },
    required: ['validations']
};

/**
 * Validates pricing for materials NOT in the product database.
 * Products IN the database are trusted (they're our verified source of truth).
 * Only non-DB products get checked via Google Search.
 */
export async function validatePricing(data: ChangeOrderData): Promise<PricingValidation[]> {
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;

    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
        console.warn('Pricing validation skipped: API key not available');
        return [];
    }

    // Find items not in our database that need price verification
    const itemsToVerify = data.materials
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => !isInDatabase(item.manufacturer, item.model, extractPartNumber(item.model)).found);

    // If all items are in DB, they're already verified
    if (itemsToVerify.length === 0) {
        return data.materials.map((item, index) => ({
            itemIndex: index,
            manufacturer: item.manufacturer,
            model: item.model,
            originalMsrp: item.msrp,
            validatedMsrp: item.msrp,
            source: 'Verified Product Database',
            confidence: 100,
            delta: 0,
        }));
    }

    const ai = new GoogleGenAI({ apiKey });

    const itemList = itemsToVerify.map(({ item, index }) =>
        `[${index}] ${item.manufacturer} ${item.model} — listed MSRP: $${item.msrp.toFixed(2)}`
    ).join('\n');

    const prompt = `You are a professional low-voltage pricing analyst. Your task is to find the MANUFACTURER'S SUGGESTED RETAIL PRICE (MSRP) for these products.

PRICING PRIORITY ORDER (use only ONE source per product — highest priority wins):
1. MANUFACTURER WEBSITE — Official MSRP / list price from the manufacturer's own site
2. AUTHORIZED DISTRIBUTOR — Price from Anixter, Graybar, ADI Global, Wesco, TEC
3. PROFESSIONAL RESELLER — Price from B&H Photo, CDW, SHI, or other authorized resellers
4. NEVER use eBay, Amazon consumer listings, Walmart, or auction sites — these are NOT MSRP

For each product, return the MSRP (not street price, not sale price, not auction price).

Products to verify:
${itemList}

RULES:
- Return the per-unit MSRP in USD
- If the product is sold in bulk (e.g., box of 100), return the PRICE PER BOX, not per individual unit
- If you cannot find an exact match, find the closest comparable product from the same manufacturer
- Set confidence 80-95 if you found MSRP on an authoritative source
- Set confidence 50-70 if you're using a comparable product or secondary source
- Set confidence below 50 ONLY if you cannot find any reliable pricing

You MUST respond with ONLY a JSON object in this exact format (no markdown, no backticks):
{"validations":[{"itemIndex":0,"manufacturer":"Brand","model":"Model","validatedMsrp":123.45,"source":"Where found","confidence":85}]}`;
    const MAX_RETRIES = 3;
    const BASE_DELAY_MS = 2000;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: { parts: [{ text: prompt }] },
                config: {
                    temperature: 0,
                    tools: [{ googleSearch: {} }]
                }
            });

            const rawText = response.text || '';
            // Extract JSON from the response (it may be wrapped in markdown code blocks)
            const jsonMatch = rawText.match(/\{[\s\S]*"validations"[\s\S]*\}/);
            const text = jsonMatch ? jsonMatch[0] : '{"validations":[]}';
            const result = JSON.parse(text);

            // Combine DB-verified items with search-verified items
            const allValidations: PricingValidation[] = [];

            data.materials.forEach((item, index) => {
                const dbResult = isInDatabase(item.manufacturer, item.model, extractPartNumber(item.model));
                if (dbResult.found) {
                    // Use the DB price if the AI-generated price differs
                    const dbPrice = dbResult.dbProduct?.msrp ?? item.msrp;
                    allValidations.push({
                        itemIndex: index,
                        manufacturer: item.manufacturer,
                        model: item.model,
                        originalMsrp: item.msrp,
                        validatedMsrp: dbPrice,
                        source: 'Verified Product Database',
                        confidence: 100,
                        delta: item.msrp > 0 ? Math.abs(dbPrice - item.msrp) / item.msrp * 100 : 0,
                    });
                } else {
                    const found = result.validations?.find((v: any) => v.itemIndex === index);
                    if (found) {
                        const delta = item.msrp > 0
                            ? Math.abs(found.validatedMsrp - item.msrp) / item.msrp * 100
                            : 100;
                        allValidations.push({
                            itemIndex: index,
                            manufacturer: item.manufacturer,
                            model: item.model,
                            originalMsrp: item.msrp,
                            validatedMsrp: found.validatedMsrp,
                            source: found.source || 'Google Search',
                            confidence: found.confidence || 50,
                            delta: Math.round(delta * 10) / 10,
                        });
                    } else {
                        allValidations.push({
                            itemIndex: index,
                            manufacturer: item.manufacturer,
                            model: item.model,
                            originalMsrp: item.msrp,
                            validatedMsrp: item.msrp,
                            source: 'Not Verified',
                            confidence: 30,
                            delta: 0,
                        });
                    }
                }
            });

            return allValidations;

        } catch (error: any) {
            const is429 = error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');

            if (is429 && attempt < MAX_RETRIES - 1) {
                const delay = BASE_DELAY_MS * Math.pow(2, attempt);
                console.warn(`Pricing validation rate limited (429). Retrying in ${delay / 1000}s... (attempt ${attempt + 1}/${MAX_RETRIES})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            console.error('Pricing validation error:', error);
            // Return items with low confidence if search fails
            return data.materials.map((item, index) => ({
                itemIndex: index,
                manufacturer: item.manufacturer,
                model: item.model,
                originalMsrp: item.msrp,
                validatedMsrp: item.msrp,
                source: isInDatabase(item.manufacturer, item.model, extractPartNumber(item.model)).found ? 'Verified Product Database' : 'Validation Failed',
                confidence: isInDatabase(item.manufacturer, item.model, extractPartNumber(item.model)).found ? 100 : 20,
                delta: 0,
            }));
        }
    }

    // Fallback
    return data.materials.map((item, index) => ({
        itemIndex: index,
        manufacturer: item.manufacturer,
        model: item.model,
        originalMsrp: item.msrp,
        validatedMsrp: item.msrp,
        source: 'Validation Incomplete',
        confidence: 20,
        delta: 0,
    }));
}
