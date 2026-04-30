#!/usr/bin/env node
/**
 * Price-consistency check.
 *
 * The app currently has two product databases:
 *   1. data/productDatabase.ts — rich format with installation requirements
 *      and accessories metadata. Used by the AI prompt context.
 *   2. data/products/* — compact tuple format (FULL_CATALOG). Authoritative
 *      price source for the validator (per pricingValidator.isInDatabase).
 *
 * When the same SKU lives in BOTH with different prices, the validator
 * silently uses the compact catalog and the AI sees the rich one — leading
 * to confusing audits ("Δ 25% from DB"). This script flags those cases so
 * we keep the two sources in sync.
 *
 * Strategy:
 *   - Parse both files heuristically (partNumber + msrp pairs)
 *   - Match cross-DB by part number (case-insensitive)
 *   - Flag any pair where price delta > 5%
 *
 * Exits non-zero on any conflict so CI catches drift.
 */

const fs = require('fs');
const path = require('path');

const RICH_DB_PATH = path.join(__dirname, '..', 'data', 'productDatabase.ts');
const COMPACT_DIR = path.join(__dirname, '..', 'data', 'products');
const TOLERANCE_PCT = 5; // ≤5% delta is acceptable rounding/source variance

// =============================================================================
// Parse rich DB — looking for blocks like:
//   { manufacturer: 'X', model: 'Y', partNumber: 'PN', ..., msrp: 123.45, ... }
// =============================================================================
function parseRichDb(filePath) {
    const src = fs.readFileSync(filePath, 'utf8');
    const entries = [];
    const objectRegex = /\{[^{}]*partNumber:\s*['"]([^'"]+)['"][^{}]*msrp:\s*([\d.]+)[^{}]*\}/g;
    let m;
    while ((m = objectRegex.exec(src)) !== null) {
        const partNumber = m[1].trim();
        const msrp = parseFloat(m[2]);
        if (partNumber && msrp > 0) {
            entries.push({ partNumber, msrp });
        }
    }
    return entries;
}

// =============================================================================
// Parse compact catalog files — tuples like:
//   ['Manufacturer', 'Model', 'PartNumber', 'M'|'E', 'Subcategory', 123.45, 'ea', 'desc', 0.5, 'L']
// =============================================================================
function parseCompactCatalog(dir) {
    const entries = [];
    if (!fs.existsSync(dir)) return entries;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts') && !f.endsWith('.test.ts'));
    for (const file of files) {
        const src = fs.readFileSync(path.join(dir, file), 'utf8');
        // Match tuples: ['mfr', 'model', 'partNumber', 'M|E', 'sub', NUMBER, 'unit', ...]
        // We only need partNumber (3rd) and msrp (6th)
        const tupleRegex = /\[\s*['"][^'"]+['"]\s*,\s*['"][^'"]+['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*['"][ME]['"]\s*,\s*['"][^'"]+['"]\s*,\s*([\d.]+)\s*,/g;
        let m;
        while ((m = tupleRegex.exec(src)) !== null) {
            const partNumber = m[1].trim();
            const msrp = parseFloat(m[2]);
            if (partNumber && msrp > 0) {
                entries.push({ partNumber, msrp, file });
            }
        }
    }
    return entries;
}

// =============================================================================
// Main
// =============================================================================
const richEntries = parseRichDb(RICH_DB_PATH);
const compactEntries = parseCompactCatalog(COMPACT_DIR);

console.log(`📊 Parsed ${richEntries.length} entries from productDatabase.ts`);
console.log(`📊 Parsed ${compactEntries.length} entries from data/products/*`);
console.log('');

// Index compact catalog by partNumber (lowercase) — keep first occurrence
const compactByPart = new Map();
for (const e of compactEntries) {
    const key = e.partNumber.toLowerCase();
    if (!compactByPart.has(key)) compactByPart.set(key, e);
}

const conflicts = [];
const consistent = [];

for (const rich of richEntries) {
    const key = rich.partNumber.toLowerCase();
    const compact = compactByPart.get(key);
    if (!compact) continue; // SKU only in rich DB — that's fine
    const richPrice = rich.msrp;
    const compactPrice = compact.msrp;
    const deltaPct = Math.abs(richPrice - compactPrice) / Math.max(richPrice, compactPrice) * 100;
    if (deltaPct > TOLERANCE_PCT) {
        conflicts.push({
            partNumber: rich.partNumber,
            richPrice,
            compactPrice,
            compactFile: compact.file,
            deltaPct: deltaPct.toFixed(1),
        });
    } else {
        consistent.push({ partNumber: rich.partNumber, richPrice, compactPrice });
    }
}

if (conflicts.length === 0) {
    console.log(`✅ No price conflicts found across ${consistent.length} cross-DB SKUs (tolerance ${TOLERANCE_PCT}%).`);
    process.exit(0);
}

console.log(`❌ Found ${conflicts.length} SKU(s) with conflicting prices in the two databases:`);
console.log('');
console.log('part number              rich DB        compact         Δ%      compact file');
console.log('─'.repeat(95));
for (const c of conflicts) {
    console.log(
        c.partNumber.padEnd(24) + ' ' +
        ('$' + c.richPrice.toFixed(2)).padEnd(14) + ' ' +
        ('$' + c.compactPrice.toFixed(2)).padEnd(15) + ' ' +
        (c.deltaPct + '%').padEnd(7) + ' ' +
        c.compactFile
    );
}
console.log('');
console.log(`Resolution: pick one canonical price for each SKU and update both files,`);
console.log(`or remove the duplicate from the database where it doesn't belong.`);
console.log(`(Reminder: the compact catalog wins at runtime — see pricingValidator.isInDatabase.)`);
process.exit(1);
