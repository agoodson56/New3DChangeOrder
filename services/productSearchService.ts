
import { GoogleGenAI, Type } from "@google/genai";
import { MaterialItem } from "../types";

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
          msrp: { type: Type.NUMBER, description: "Manufacturer's Suggested Retail Price in USD. Use realistic market pricing." },
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
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Please set the GEMINI_API_KEY environment variable in your Cloudflare Pages project settings (Settings → Environment Variables) and redeploy.');
  }
  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.0-flash';

  const systemInstruction = `
    You are a professional low-voltage systems product research specialist.
    Your job is to find accurate product information, part numbers, and MSRP pricing for:
    - CCTV cameras and video surveillance equipment
    - Access control systems (readers, panels, credentials)
    - Structured cabling components (Cat6/6A cable, jacks, patch panels, faceplates)
    - Fire alarm and intrusion detection devices
    - Audio/Visual equipment
    - Network infrastructure (switches, PoE injectors)
    
    CRITICAL PRICING RULES:
    1. Use REAL, CURRENT market prices from authorized distributors
    2. For cameras: Professional IP cameras typically range $200-$2000+ depending on features
    3. For cabling: Cat6 is typically $0.15-0.40/ft, Cat6A is $0.30-0.60/ft
    4. For jacks: Quality keystones are typically $3-15 each
    5. For patch panels: 24-port panels typically $50-150
    6. NEVER use placeholder or rounded prices like $0, $100, $1000
    7. Use prices accurate to the cent when possible
    
    SEARCH STRATEGY:
    - Search for products from major professional brands: Axis, Hanwha, Verkada, Panduit, Leviton, Berk-Tek, CommScope, HID, Lenel
    - Include the official manufacturer part number
    - Provide pricing from distributor sites like ADI, Anixter, Graybar, or manufacturer MSRP sheets
    
    Return structured JSON with accurate product data.
  `;

  const prompt = `
    Search for the following product(s) and provide accurate pricing information:
    
    "${query}"
    
    Return up to 5 relevant products matching this search. Include:
    - Official manufacturer name
    - Complete model/product name
    - Manufacturer part number or SKU
    - Current MSRP or typical distributor pricing in USD
    - Brief product description
    - Category (Material for passive components, Equipment for active devices)
    - Unit of measure (ft for cables, ea for individual items)
    
    Use your knowledge grounded in real product data from manufacturer websites, distributor catalogs, and industry pricing guides.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: prompt }] },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: PRODUCT_SEARCH_SCHEMA,
        // Enable Google Search grounding for real-time product data
        tools: [{ googleSearch: {} }]
      }
    });

    const rawText = response.text;
    if (!rawText) throw new Error("No response from AI");

    const data = JSON.parse(rawText);
    return data.products || [];
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
