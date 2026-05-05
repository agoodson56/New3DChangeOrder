/**
 * Brain 2: Pricing Validator
 * 
 * Uses Gemini with Google Search grounding to validate MSRPs
 * for all materials on a change order. Compares AI-generated prices
 * against real distributor pricing from the web.
 */

import { ChangeOrderData, PricingValidation } from '../types';
import { generateContent, ApiKeyError, RateLimitError } from './geminiClient';
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

    // ── PRIORITY 1: FULL_CATALOG (authoritative) ────────────────────────────────
    // FULL_CATALOG is the canonical price source. When the same product exists in
    // both FULL_CATALOG and ALL_DB_PRODUCTS, FULL_CATALOG wins so we don't quote
    // stale list MSRPs from the legacy productDatabase.

    // 1. FULL_CATALOG exact match by part number or model
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

    // 2. FULL_CATALOG fuzzy: STRICT manufacturer match + meaningful keyword.
    // Previously, mfrLower === 'generic' or pMfr === 'generic' was a free pass,
    // and `keyMatch` accepted ANY substring overlap (incl. 1-char) between
    // model/subcategory/description. That let the AI's "Cat6 patch cord" fuzzy-
    // match a "Cat6 cable bulk" entry — wrong product family, wrong unit price.
    // Now: require an exact manufacturer match (case-insensitive) AND the
    // model token must be ≥4 chars and present in the catalog model name.
    const catalogFuzzy = mfrLower && modelLower.length >= 4 ? FULL_CATALOG.find(p => {
        const pMfr = p[0].toLowerCase();
        const pModel = p[1].toLowerCase();
        if (pMfr !== mfrLower) return false;
        // Model match: catalog model contains the queried token, OR vice versa
        // (so "P3245-V" matches catalog entry "P3245-V (02326-001)").
        return pModel.includes(modelLower) || modelLower.includes(pModel);
    }) : undefined;
    if (catalogFuzzy) {
        return {
            found: true, dbProduct: {
                manufacturer: catalogFuzzy[0], model: catalogFuzzy[1],
                partNumber: catalogFuzzy[2], category: catalogFuzzy[3] as 'Material' | 'Equipment',
                subcategory: catalogFuzzy[4], msrp: catalogFuzzy[5],
                unitOfMeasure: catalogFuzzy[6], description: catalogFuzzy[7],
                installationRequirements: [], accessories: [],
                laborHours: catalogFuzzy[8], complexity: 'Low' as const
            }
        };
    }

    // ── PRIORITY 2: ALL_DB_PRODUCTS (legacy productDatabase, fallback) ──────────

    // 3. ALL_DB_PRODUCTS exact part-number match
    if (partLower) {
        const byPart = ALL_DB_PRODUCTS.find(p =>
            p.partNumber.toLowerCase() === partLower
        );
        if (byPart) return { found: true, dbProduct: byPart };
    }

    // 4. ALL_DB_PRODUCTS exact manufacturer + model match
    const exact = ALL_DB_PRODUCTS.find(p =>
        p.manufacturer.toLowerCase() === mfrLower &&
        p.model.toLowerCase() === modelLower
    );
    if (exact) return { found: true, dbProduct: exact };

    // 5. ALL_DB_PRODUCTS fuzzy: manufacturer match + model substring
    const fuzzy = ALL_DB_PRODUCTS.find(p =>
        p.manufacturer.toLowerCase() === mfrLower && (
            p.model.toLowerCase().includes(modelLower) ||
            modelLower.includes(p.model.toLowerCase())
        )
    );
    if (fuzzy) return { found: true, dbProduct: fuzzy };

    // 6. STANDARD_CONSUMABLES by name substring (AI may generate slightly different names)
    const consumableMatch = STANDARD_CONSUMABLES.find(c => {
        const cName = c.name.toLowerCase();
        return cName.includes(modelLower) || modelLower.includes(cName) ||
            c.partNumber.toLowerCase() === partLower;
    });
    if (consumableMatch) {
        const dbConsumable = CONSUMABLE_PRODUCTS.find(p =>
            p.partNumber.toLowerCase() === consumableMatch.partNumber.toLowerCase() ||
            p.model.toLowerCase().includes(consumableMatch.name.toLowerCase().slice(0, 15))
        );
        if (dbConsumable) return { found: true, dbProduct: dbConsumable };
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

    return { found: false };
}

/** Extract part number from model string if present in parentheses, e.g. 'P3245-V (02326-001)' → '02326-001' */
function extractPartNumber(model: string): string {
    const m = model.match(/\(([^)]+)\)/);
    return (m && m[1]) ? m[1] : '';
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

    const sanitize = (s: string) => (s || '').replace(/[\x00-\x1f\x7f<>{}]/g, '').slice(0, 200);
    const itemList = itemsToVerify.map(({ item, index }) =>
        `[${index}] ${sanitize(item.manufacturer)} ${sanitize(item.model)} — listed MSRP: $${item.msrp.toFixed(2)}`
    ).join('\n');

    const prompt = `You are a professional low-voltage pricing analyst working for a contractor that MUST WIN COMPETITIVE BIDS. Your task is to find the COMPETITIVE STREET PRICE — what a contractor actually pays a distributor today, NOT inflated list MSRP.

PRICING PHILOSOPHY:
- We are bidding to win. Use CONSERVATIVE (low-end) market pricing.
- Find the LOWER QUARTILE of current selling prices for new, sealed, US-stock product.
- Manufacturer list MSRP is usually 30-60% above what contractors actually pay. NEVER quote raw list MSRP for active equipment (cameras, panels, switches) — it will lose us the bid.

PREFERRED SOURCES (use the LOWEST verifiable price among new-sealed listings):
1. Authorized professional distributors: Anixter, Graybar, ADI Global, Wesco, TEC, B&H Photo, CDW, SHI
2. Authorized resellers with new/sealed stock: NetworkCameraStore, Southern Electronics, Provantage, Newegg Business
3. Amazon Business / Amazon (only if listing is "new" from a verified business seller)
4. Manufacturer direct e-commerce if available

DO NOT USE: eBay used/auction listings, refurbished, "open box", or international gray-market sources.

For each product, return the LOWER-QUARTILE STREET PRICE — if you see prices ranging $2,849, $2,849, $3,139, $3,520 — return ~$2,900 (lower quartile), not the average and never the highest.

Products to verify:
${itemList}

RULES:
- Return the per-unit price in USD
- If sold in bulk (e.g., box of 100), return PRICE PER BOX
- If you cannot find an exact match, find the closest comparable from the same manufacturer
- For commodity items (cable, jacks, screws, anchors, ties) the listed price is likely already street — trust it unless it's clearly off
- Set confidence 92-99 if you found multiple corroborating distributor/reseller prices
- Set confidence 85-91 if you found a single reliable distributor price
- Set confidence 70-84 if using a comparable product or single secondary source
- Set confidence below 70 ONLY if no reliable pricing exists

You MUST respond with ONLY a JSON object in this exact format (no markdown, no backticks):
{"validations":[{"itemIndex":0,"manufacturer":"Brand","model":"Model","validatedMsrp":123.45,"source":"Where found","confidence":95}]}`;

    // Single attempt, fail fast. Pricing validation is non-essential — if it
    // doesn't succeed, the change order still ships with DB-verified prices
    // for known items and the AI's quoted prices for unknown items.
    let result: { validations?: any[] };
    try {
        const response = await generateContent({
            model: 'gemini-1.5-flash',
            nonEssential: true,
            contents: { parts: [{ text: prompt }] },
            config: {
                temperature: 0,
                tools: [{ googleSearch: {} }]
            }
        });

        const rawText = response.text || '';
        const jsonMatch = rawText.match(/\{[\s\S]*"validations"[\s\S]*\}/);
        const text = jsonMatch ? jsonMatch[0] : '{"validations":[]}';
        result = JSON.parse(text);
    } catch (error) {
        // Type-safe error handling: guard against unknown error shapes.
        if (error instanceof ApiKeyError) {
            console.error('Pricing validation: API key error', error);
            throw error;
        }
        // Any other failure (429, 503, parse error): degrade gracefully. Return DB-only validations.
        const isRateLimit = error instanceof RateLimitError;
        const isUnavailable = error instanceof Error && error.name === 'UnavailableError';
        const reason = isRateLimit ? 'rate-limited'
            : isUnavailable ? 'unavailable'
            : 'failed';
        console.warn(`Pricing validation skipped (${reason}); using DB-only validations.`);
        return data.materials.map((item, index) => {
            const dbResult = isInDatabase(item.manufacturer, item.model, extractPartNumber(item.model));
            return {
                itemIndex: index,
                manufacturer: item.manufacturer,
                model: item.model,
                originalMsrp: item.msrp,
                validatedMsrp: item.msrp,
                source: dbResult.found ? 'Verified Product Database' : `Validation skipped (${reason})`,
                confidence: dbResult.found ? 100 : 50,
                delta: 0,
            };
        });
    }

    // Combine DB-verified items with search-verified items
    const allValidations: PricingValidation[] = [];

    data.materials.forEach((item, index) => {
        const dbResult = isInDatabase(item.manufacturer, item.model, extractPartNumber(item.model));
        if (dbResult.found) {
            const dbPrice = dbResult.dbProduct?.msrp ?? item.msrp;
            const delta = item.msrp > 0 ? Math.abs(dbPrice - item.msrp) / item.msrp * 100 : 0;

            // If the DB price diverges from the AI's quoted price by >15%, the DB
            // entry may be stale list MSRP, OR the AI is inflating to safe levels.
            // Prefer the LOWER price as the validated value (we bid to win — never
            // quote above what the market shows) and lower confidence so coordinators
            // inspect the line. Threshold tightened from 25% → 15%; on a $1,000 item
            // a 20% delta is $200 — that's worth a human eyeball, not auto-trust.
            const isLargeDelta = delta > 15;
            const validatedPrice = isLargeDelta ? Math.min(dbPrice, item.msrp) : dbPrice;
            const source = isLargeDelta
                ? 'Database (flagged: >15% delta from AI quote — verify)'
                : 'Verified Product Database';
            const confidence = isLargeDelta ? 75 : 100;

            allValidations.push({
                itemIndex: index,
                manufacturer: item.manufacturer,
                model: item.model,
                originalMsrp: item.msrp,
                validatedMsrp: validatedPrice,
                source,
                confidence,
                delta: Math.round(delta * 10) / 10,
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
}

/**
 * Second-opinion pass for any line item priced below 95% confidence.
 * Re-asks Gemini with a different framing (median across distributors with
 * citations) at non-zero temperature. If both passes agree within 10%, the
 * confidence is raised to 95. If they disagree by more than 25%, confidence
 * drops to 50 and the item is flagged. Items already at ≥95% are skipped.
 *
 * Graceful degrade: if the second call fails for any reason, the initial
 * validations are returned unchanged.
 */
export async function selfConsistencyCheck(
    data: ChangeOrderData,
    initialValidations: PricingValidation[]
): Promise<PricingValidation[]> {
    void data; // reserved for future per-item context lookup
    const targets = initialValidations.filter(v => v.confidence < 95);
    if (targets.length === 0) return initialValidations;

    const sanitize = (s: string) => (s || '').replace(/[\x00-\x1f\x7f<>{}]/g, '').slice(0, 200);
    const itemList = targets.map(v =>
        `[${v.itemIndex}] ${sanitize(v.manufacturer)} ${sanitize(v.model)}`
    ).join('\n');

    const prompt = `Independent pricing verification for a competitive bid on low-voltage equipment. For each product below, look up the typical contractor purchase price from authorized distributors (Anixter, Graybar, ADI Global, Wesco, B&H, CDW, SHI). Report the MEDIAN price across at least 2 corroborating sources.

Products to verify:
${itemList}

Return JSON only — no markdown, no backticks:
{"verifications":[{"itemIndex":0,"medianPrice":123.45,"sourcesFound":3}]}

If fewer than 2 corroborating sources exist for an item, return sourcesFound:0 and medianPrice:0. DO NOT guess.`;

    let result: { verifications?: Array<{ itemIndex: number; medianPrice: number; sourcesFound: number }> };
    try {
        const response = await generateContent({
            model: 'gemini-1.5-flash',
            nonEssential: true,
            contents: { parts: [{ text: prompt }] },
            config: {
                temperature: 0.3,
                tools: [{ googleSearch: {} }]
            }
        });
        const rawText = response.text || '';
        const jsonMatch = rawText.match(/\{[\s\S]*"verifications"[\s\S]*\}/);
        const text = jsonMatch ? jsonMatch[0] : '{"verifications":[]}';
        result = JSON.parse(text);
    } catch (error: any) {
        if (error instanceof ApiKeyError) throw error;
        console.warn('Self-consistency pass failed; using initial validations.');
        return initialValidations;
    }

    return initialValidations.map(v => {
        if (v.confidence >= 95) return v;
        const verification = result.verifications?.find(x => x.itemIndex === v.itemIndex);
        if (!verification || verification.sourcesFound === 0 || verification.medianPrice <= 0) {
            return v;
        }
        if (v.validatedMsrp <= 0) return v;

        const divergence = Math.abs(v.validatedMsrp - verification.medianPrice) /
            Math.max(v.validatedMsrp, verification.medianPrice) * 100;

        if (divergence <= 10) {
            return {
                ...v,
                confidence: Math.max(v.confidence, 95),
                source: `${v.source} · 2-pass verified`
            };
        }
        if (divergence > 25) {
            return {
                ...v,
                confidence: Math.min(v.confidence, 50),
                source: `${v.source} · ⚠ 2-pass mismatch ${Math.round(divergence)}%`
            };
        }
        return v;
    });
}
