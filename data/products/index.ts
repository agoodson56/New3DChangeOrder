/**
 * Product Catalog Barrel Export
 * 
 * Aggregates all category-specific product arrays into a single
 * unified catalog of CompactProduct entries, plus converter utilities.
 */

export { type CompactProduct, toProductDefinition, toProductDefinitions } from './types';

import { type CompactProduct } from './types';
// ── Base files ──
import { CATALOG_CCTV_CAMERAS } from './cctvCameras';
import { CATALOG_CCTV_RECORDING } from './cctvRecording';
import { CATALOG_CCTV_ACCESSORIES } from './cctvAccessories';
import { CATALOG_ACCESS_CONTROL } from './accessControl';
import { CATALOG_AV_SYSTEMS } from './avSystems';
import { CATALOG_INTRUSION } from './intrusionSystems';
import { CATALOG_FIRE_ALARM } from './fireAlarm';
import { CATALOG_CABLING } from './cabling';
import { CATALOG_NETWORKING } from './networking';
import { CATALOG_PATHWAY } from './pathway';
// ── Extension files ──
import { CATALOG_CCTV_CAMERAS_EXT } from './cctvCamerasExt';
import { CATALOG_ACCESS_CONTROL_EXT } from './accessControlExt';
import { CATALOG_AV_EXT } from './avSystemsExt';
import { CATALOG_CABLING_EXT } from './cablingExt';
// ── Batch expansion files ──
import { CATALOG_CCTV_BATCH2 } from './cctvBatch2';
import { CATALOG_INTRUSION_FIRE_BATCH2 } from './intrusionFireBatch2';
import { CATALOG_NETWORKING_BATCH2 } from './networkingBatch2';
// ── New category files ──
import { CATALOG_WIRELESS } from './wireless';
import { CATALOG_INTERCOM_PAGING } from './intercomPaging';
import { CATALOG_POWER_UPS } from './powerUps';
// ── Bulk expansion files ──
import { CATALOG_BULK_EXPANSION_A } from './bulkExpansionA';
import { CATALOG_BULK_EXPANSION_B } from './bulkExpansionB';
import { CATALOG_BULK_EXPANSION_C } from './bulkExpansionC';
import { CATALOG_BULK_EXPANSION_D } from './bulkExpansionD';
import { CATALOG_BULK_EXPANSION_E } from './bulkExpansionE';
import { CATALOG_BULK_EXPANSION_F } from './bulkExpansionF';

/**
 * Full product catalog — all compact product entries across all categories.
 */
export const FULL_CATALOG: CompactProduct[] = [
    // Base
    ...CATALOG_CCTV_CAMERAS,
    ...CATALOG_CCTV_RECORDING,
    ...CATALOG_CCTV_ACCESSORIES,
    ...CATALOG_ACCESS_CONTROL,
    ...CATALOG_AV_SYSTEMS,
    ...CATALOG_INTRUSION,
    ...CATALOG_FIRE_ALARM,
    ...CATALOG_CABLING,
    ...CATALOG_NETWORKING,
    ...CATALOG_PATHWAY,
    // Extensions
    ...CATALOG_CCTV_CAMERAS_EXT,
    ...CATALOG_ACCESS_CONTROL_EXT,
    ...CATALOG_AV_EXT,
    ...CATALOG_CABLING_EXT,
    // Batch expansions
    ...CATALOG_CCTV_BATCH2,
    ...CATALOG_INTRUSION_FIRE_BATCH2,
    ...CATALOG_NETWORKING_BATCH2,
    // New categories
    ...CATALOG_WIRELESS,
    ...CATALOG_INTERCOM_PAGING,
    ...CATALOG_POWER_UPS,
    // Bulk expansions
    ...CATALOG_BULK_EXPANSION_A,
    ...CATALOG_BULK_EXPANSION_B,
    ...CATALOG_BULK_EXPANSION_C,
    ...CATALOG_BULK_EXPANSION_D,
    ...CATALOG_BULK_EXPANSION_E,
    ...CATALOG_BULK_EXPANSION_F,
];

// Re-export individual catalogs for category-specific access
export {
    CATALOG_CCTV_CAMERAS, CATALOG_CCTV_CAMERAS_EXT, CATALOG_CCTV_BATCH2,
    CATALOG_CCTV_RECORDING, CATALOG_CCTV_ACCESSORIES,
    CATALOG_ACCESS_CONTROL, CATALOG_ACCESS_CONTROL_EXT,
    CATALOG_AV_SYSTEMS, CATALOG_AV_EXT,
    CATALOG_INTRUSION, CATALOG_INTRUSION_FIRE_BATCH2,
    CATALOG_FIRE_ALARM,
    CATALOG_CABLING, CATALOG_CABLING_EXT,
    CATALOG_NETWORKING, CATALOG_NETWORKING_BATCH2,
    CATALOG_PATHWAY,
    CATALOG_WIRELESS, CATALOG_INTERCOM_PAGING, CATALOG_POWER_UPS,
    CATALOG_BULK_EXPANSION_A, CATALOG_BULK_EXPANSION_B,
    CATALOG_BULK_EXPANSION_C, CATALOG_BULK_EXPANSION_D,
    CATALOG_BULK_EXPANSION_E, CATALOG_BULK_EXPANSION_F,
};

/**
 * Lookup a product by part number or model in the full catalog.
 * Returns the matching CompactProduct or undefined.
 */
export function lookupProduct(query: string): CompactProduct | undefined {
    const q = query.toLowerCase().trim();
    return FULL_CATALOG.find(p =>
        p[2].toLowerCase() === q || // partNumber
        p[1].toLowerCase() === q    // model
    );
}

/**
 * Search products by keyword across manufacturer, model, partNumber, description.
 * Returns up to `limit` matching CompactProducts.
 */
export function searchCatalog(keyword: string, limit = 20): CompactProduct[] {
    const kw = keyword.toLowerCase().trim();
    const results: CompactProduct[] = [];
    for (const p of FULL_CATALOG) {
        if (results.length >= limit) break;
        if (
            p[0].toLowerCase().includes(kw) || // manufacturer
            p[1].toLowerCase().includes(kw) || // model
            p[2].toLowerCase().includes(kw) || // partNumber
            p[7].toLowerCase().includes(kw)    // description
        ) {
            results.push(p);
        }
    }
    return results;
}

/**
 * Get catalog statistics.
 */
export function getCatalogStats() {
    const byManufacturer = new Map<string, number>();
    const byCategory = new Map<string, number>();
    for (const p of FULL_CATALOG) {
        byManufacturer.set(p[0], (byManufacturer.get(p[0]) || 0) + 1);
        byCategory.set(p[4], (byCategory.get(p[4]) || 0) + 1);
    }
    return {
        total: FULL_CATALOG.length,
        manufacturers: Object.fromEntries(byManufacturer),
        categories: Object.fromEntries(byCategory),
    };
}
