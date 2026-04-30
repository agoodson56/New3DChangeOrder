
import { Type } from "@google/genai";
import { MaterialItem } from "../types";
import { generateContent } from "./geminiClient";

// Product search result interface
export interface ProductSearchResult {
  manufacturer: string;
  model: string;
  partNumber: string;
  msrp: number;
  description: string;
  category: 'Material' | 'Equipment';
  unitOfMeasure: string;
  sourceUrl?: string;
  confidence: 'high' | 'medium' | 'low';
}

const PRODUCT_SEARCH_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    products: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          manufacturer: { type: Type.STRING, description: "Product manufacturer/brand name" },
          model: { type: Type.STRING, description: "Complete model number or product name" },
          partNumber: { type: Type.STRING, description: "Official manufacturer part number or SKU" },
          msrp: { type: Type.NUMBER, description: "Conservative competitive-bid unit price in USD — lower-quartile current street price, NOT inflated list MSRP." },
          description: { type: Type.STRING, description: "Brief product description" },
          category: { type: Type.STRING, enum: ['Material', 'Equipment'], description: "Material for passive items (cables, jacks), Equipment for active devices (cameras, switches)" },
          unitOfMeasure: { type: Type.STRING, description: "Unit of measure: 'ft' for cables, 'ea' for individual items" },
          confidence: { type: Type.STRING, enum: ['high', 'medium', 'low'], description: "Confidence level in the pricing accuracy" }
        },
        required: ['manufacturer', 'model', 'partNumber', 'msrp', 'description', 'category', 'unitOfMeasure', 'confidence']
      }
    }
  },
  required: ['products']
};

/**
 * Search for products using Gemini with Google Search grounding
 * Returns real product data including part numbers and MSRP pricing
 */
export async function searchProducts(query: string): Promise<ProductSearchResult[]> {
  const safeQuery = (query || '').replace(/[\x00-\x1f\x7f<>{}]/g, '').slice(0, 500);
  const model = 'gemini-2.5-flash';

  const systemInstruction = `
    You are a professional low-voltage systems product research specialist working for a contractor that MUST WIN COMPETITIVE BIDS.
    Your job is to find accurate product information, part numbers, and CONSERVATIVE STREET PRICING (NOT inflated list MSRP) for:
    - CCTV cameras and video surveillance equipment
    - Access control systems (readers, panels, credentials)
    - Structured cabling components (Cat6/6A cable, jacks, patch panels, faceplates)
    - Fire alarm and intrusion detection devices
    - Audio/Visual equipment
    - Network infrastructure (switches, PoE injectors)

    CRITICAL PRICING PHILOSOPHY — WE BID TO WIN:
    - Return the LOWER QUARTILE of current new-sealed selling prices, NOT manufacturer list MSRP.
    - Manufacturer list MSRP is typically 30-60% above what contractors actually pay. Quoting list will lose bids.
    - If you see prices like $2,849 / $2,849 / $3,139 / $3,520, return ~$2,900 (low end), never the highest.

    PREFERRED PRICE SOURCES (use LOWEST among new-sealed listings):
    1. Pro distributors: Anixter, Graybar, ADI Global, Wesco, TEC, B&H Photo, CDW, SHI, Provantage
    2. Authorized resellers with new/sealed stock: NetworkCameraStore, Southern Electronics, Newegg Business
    3. Amazon Business / Amazon (new from verified business seller only)
    DO NOT USE: eBay used/auction, refurbished, "open box", gray-market sources.

    REASONABLE STREET-PRICE RANGES (use as sanity check):
    - Entry IP cameras: $150-$500
    - Pro fixed/dome IP cameras: $400-$1,500
    - PTZ cameras: $1,500-$3,500 (top-tier outdoor PTZ rarely exceeds $4,000 contractor price)
    - Cat6 cable: $0.15-0.40/ft, Cat6A: $0.30-1.20/ft (premium brands like Berk-Tek 10G2 can hit $1.20)
    - Quality keystone jacks: $3-15
    - 24-port patch panels: $50-150
    - PoE switches (24-port managed): $400-$1,200

    SEARCH STRATEGY:
    - Major brands: Axis, Hanwha, Verkada, Panduit, Leviton, Berk-Tek, CommScope, HID, Lenel
    - Include the official manufacturer part number
    - Cross-reference 2-3 sources and return the LOWER-QUARTILE price
    - NEVER use placeholder or rounded prices like $0, $100, $1000

    Return structured JSON with conservative competitive-bid pricing.
  `;

  const prompt = `
    Search for the following product(s) and provide CONSERVATIVE COMPETITIVE-BID pricing:

    "${safeQuery}"

    Return up to 5 relevant products matching this search. Include:
    - Official manufacturer name
    - Complete model/product name
    - Manufacturer part number or SKU
    - LOWER-QUARTILE current street price in USD (what a contractor actually pays — NOT list MSRP)
    - Brief product description
    - Category (Material for passive components, Equipment for active devices)
    - Unit of measure ('ft' for cables, 'ea' for individual items)
    - Confidence ('high', 'medium', or 'low')

    Cross-reference 2-3 distributor/reseller listings and return the lower-quartile price.

    You MUST respond with ONLY a JSON object in this exact format (no markdown fences, no commentary):
    {"products":[{"manufacturer":"Brand","model":"Model","partNumber":"PN123","msrp":123.45,"description":"Brief","category":"Equipment","unitOfMeasure":"ea","confidence":"high"}]}
  `;

  console.log('[ProductSearch] Sending lookup query:', safeQuery);
  try {
    // NOTE: Gemini API rejects responseMimeType/responseSchema combined with
    // Google Search grounding. We keep grounding (more valuable for live
    // pricing) and parse JSON manually from the text response.
    // Hard timeout so a hung Cloudflare Function or upstream stall surfaces
    // as a real error instead of an indefinite spinner.
    const TIMEOUT_MS = 25_000;
    const response = await Promise.race([
      generateContent({
        model,
        fallbackModels: ['gemini-2.0-flash', 'gemini-2.5-flash-lite'],
        contents: { parts: [{ text: prompt }] },
        config: {
          systemInstruction,
          temperature: 0,
          tools: [{ googleSearch: {} }]
        }
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Lookup timed out after ${TIMEOUT_MS / 1000}s — the AI service didn't respond in time.`)), TIMEOUT_MS)
      ),
    ]);
    console.log('[ProductSearch] AI response received, length:', response?.text?.length || 0);

    const rawText = response.text;
    if (!rawText) throw new Error("No response from AI");

    // Extract JSON from a possibly-wrapped response (markdown fences, prose, etc.)
    const jsonMatch = rawText.match(/\{[\s\S]*"products"[\s\S]*\}/);
    const text = jsonMatch ? jsonMatch[0] : '{"products":[]}';
    const data = JSON.parse(text);
    const products: ProductSearchResult[] = (data.products || []).filter((p: any) =>
      p && typeof p.msrp === 'number' && p.msrp > 0 && p.msrp < 1_000_000 &&
      typeof p.partNumber === 'string' && p.partNumber.length > 0 &&
      typeof p.manufacturer === 'string' && p.manufacturer.length > 0
    );
    return products;
  } catch (error) {
    console.error('Product search error:', error);
    throw error;
  }
}

/**
 * Look up MSRP for a specific product by manufacturer and model
 */
export async function lookupMSRP(manufacturer: string, model: string): Promise<ProductSearchResult | null> {
  const results = await searchProducts(`${manufacturer} ${model} price MSRP`);
  return results.length > 0 ? results[0] : null;
}

/**
 * Batch search for multiple products
 */
export async function batchSearchProducts(items: { manufacturer: string; model: string }[]): Promise<Map<string, ProductSearchResult>> {
  const results = new Map<string, ProductSearchResult>();

  // Process in parallel with a limit
  const searchPromises = items.map(async (item) => {
    try {
      const result = await lookupMSRP(item.manufacturer, item.model);
      if (result) {
        results.set(`${item.manufacturer}-${item.model}`, result);
      }
    } catch (error) {
      console.error(`Error searching for ${item.manufacturer} ${item.model}:`, error);
    }
  });

  await Promise.all(searchPromises);
  return results;
}

/**
 * Convert a ProductSearchResult to a MaterialItem for the change order
 */
export function toMaterialItem(product: ProductSearchResult, quantity: number = 1): MaterialItem {
  return {
    manufacturer: product.manufacturer,
    model: `${product.model} (${product.partNumber})`,
    category: product.category,
    quantity,
    msrp: product.msrp,
    unitOfMeasure: product.unitOfMeasure,
    complexity: 'Medium',
    notes: product.description
  };
}
