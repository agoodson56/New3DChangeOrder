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
    CABLING_PRODUCTS, AV_PRODUCTS, INTRUSION_PANELS, INTRUSION_SENSORS,
    FIRE_ALARM_PRODUCTS, FIRE_ALARM_CABLE, VERKADA_CAMERAS, BERKTEK_CABLE,
    POE_SWITCHES, type ProductDefinition
} from '../data/productDatabase';

// Build master lookup
const ALL_DB_PRODUCTS: ProductDefinition[] = [
    ...CCTV_CAMERAS, ...NVR_SYSTEMS, ...ACCESS_READERS, ...DOOR_HARDWARE,
    ...ACCESS_PANELS, ...CABLING_PRODUCTS, ...AV_PRODUCTS, ...INTRUSION_PANELS,
    ...INTRUSION_SENSORS, ...FIRE_ALARM_PRODUCTS, ...FIRE_ALARM_CABLE,
    ...VERKADA_CAMERAS, ...BERKTEK_CABLE, ...POE_SWITCHES,
];

function isInDatabase(manufacturer: string, model: string): boolean {
    const mfrLower = manufacturer.toLowerCase();
    const modelLower = model.toLowerCase();
    return ALL_DB_PRODUCTS.some(p =>
        p.manufacturer.toLowerCase() === mfrLower &&
        p.model.toLowerCase() === modelLower
    );
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
        .filter(({ item }) => !isInDatabase(item.manufacturer, item.model));

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

    const prompt = `You are a professional low-voltage pricing analyst. Verify the MSRP pricing for these products by searching distributor websites, manufacturer sites, and authorized dealer listings.

For each product, find the current MSRP or list price.

Products to verify:
${itemList}

IMPORTANT:
- Search real distributor sites like eBay, Amazon Business, Anixter, Graybar, ADI, Wesco
- If you cannot find an exact match, estimate based on the closest comparable product
- Set confidence lower (40-60) if you're estimating
- Return validatedMsrp in USD, just the number

You MUST respond with ONLY a JSON object in this exact format (no markdown, no backticks):
{"validations":[{"itemIndex":0,"manufacturer":"Brand","model":"Model","validatedMsrp":123.45,"source":"Where found","confidence":85}]}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
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
            if (isInDatabase(item.manufacturer, item.model)) {
                allValidations.push({
                    itemIndex: index,
                    manufacturer: item.manufacturer,
                    model: item.model,
                    originalMsrp: item.msrp,
                    validatedMsrp: item.msrp,
                    source: 'Verified Product Database',
                    confidence: 100,
                    delta: 0,
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

    } catch (error) {
        console.error('Pricing validation error:', error);
        // Return items with low confidence if search fails
        return data.materials.map((item, index) => ({
            itemIndex: index,
            manufacturer: item.manufacturer,
            model: item.model,
            originalMsrp: item.msrp,
            validatedMsrp: item.msrp,
            source: isInDatabase(item.manufacturer, item.model) ? 'Verified Product Database' : 'Validation Failed',
            confidence: isInDatabase(item.manufacturer, item.model) ? 100 : 20,
            delta: 0,
        }));
    }
}
