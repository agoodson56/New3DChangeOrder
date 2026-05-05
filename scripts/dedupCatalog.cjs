#!/usr/bin/env node
/**
 * Catalog deduplication tool.
 *
 * The compact product catalog under data/products/*.ts is concatenated into
 * FULL_CATALOG by data/products/index.ts. Duplicate part numbers across files
 * cause non-deterministic pricing: lookupProduct() returns the first match in
 * FULL_CATALOG order, so whichever file is imported first in index.ts wins.
 *
 * This script can run in two modes:
 *   - report (default): print all duplicate groups with their differing
 *     prices/labor/descriptions. No file mutations.
 *   - apply: delete the non-canonical entries (anything after the first
 *     occurrence in FULL_CATALOG order). The first occurrence is treated as
 *     canonical because that's what lookupProduct already returns at runtime.
 *
 * Usage:
 *   node scripts/dedupCatalog.cjs                  # report
 *   node scripts/dedupCatalog.cjs --apply          # mutate files
 *   node scripts/dedupCatalog.cjs --check          # report + non-zero exit if dupes (CI mode)
 *
 * Exit codes (non-apply modes):
 *   0  — no duplicates
 *   1  — duplicates exist (only in --check mode; report mode always exits 0)
 */

const fs = require('fs');
const path = require('path');

const COMPACT_DIR = path.join(__dirname, '..', 'data', 'products');
const INDEX_PATH = path.join(COMPACT_DIR, 'index.ts');

// Discover the order in which catalog files are concatenated. Match runtime
// FULL_CATALOG order so dedup choices reflect what lookupProduct() actually
// returns first.
function discoverFileOrder() {
  const indexSrc = fs.readFileSync(INDEX_PATH, 'utf8');
  const order = [];
  const importRegex = /from\s+['"]\.\/([^'"]+)['"]/g;
  let m;
  while ((m = importRegex.exec(indexSrc)) !== null) {
    order.push(m[1] + '.ts');
  }
  return order;
}

function parseFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const lines = src.split('\n');
  const entries = [];
  // Match a CompactProduct tuple line, capturing all 10 cells.
  // [mfr, model, partNumber, M|E, subcategory, msrp, uom, description, laborHours, complexity]
  // We need the line/index for later mutation, so do a line-by-line scan.
  const tupleRe = /^\s*\[\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]*)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([ME])['"]\s*,\s*['"]([^'"]*)['"]\s*,\s*([\d.]+)\s*,\s*['"]([^'"]*)['"]\s*,\s*['"]([^'"]*)['"]\s*,\s*([\d.]+)\s*,\s*['"]([LMH])['"]\s*\]\s*,?\s*$/;
  for (let i = 0; i < lines.length; i++) {
    const m = tupleRe.exec(lines[i]);
    if (!m) continue;
    entries.push({
      lineIndex: i,
      raw: lines[i],
      manufacturer: m[1],
      model: m[2],
      partNumber: m[3],
      category: m[4],
      subcategory: m[5],
      msrp: parseFloat(m[6]),
      unitOfMeasure: m[7],
      description: m[8],
      laborHours: parseFloat(m[9]),
      complexity: m[10],
    });
  }
  return { src, lines, entries };
}

function buildDuplicateMap(orderedFiles) {
  const seen = new Map(); // partNumber-lower -> { canonical: {file, entry}, dupes: [{file, entry}] }
  for (const file of orderedFiles) {
    const fp = path.join(COMPACT_DIR, file);
    if (!fs.existsSync(fp)) continue;
    const { entries } = parseFile(fp);
    for (const entry of entries) {
      const key = entry.partNumber.toLowerCase();
      if (!key) continue;
      if (!seen.has(key)) {
        seen.set(key, { canonical: { file, entry }, dupes: [] });
      } else {
        seen.get(key).dupes.push({ file, entry });
      }
    }
  }
  // Filter to keys that actually have duplicates.
  const dupes = new Map();
  for (const [k, v] of seen) {
    if (v.dupes.length > 0) dupes.set(k, v);
  }
  return dupes;
}

function fmtEntry(e) {
  return `${e.manufacturer.padEnd(15)} ${e.model.padEnd(28)} $${e.msrp.toFixed(2).padEnd(8)} ${e.laborHours.toFixed(2)}hr  "${e.description.slice(0, 50)}"`;
}

function reportDuplicates(dupes) {
  if (dupes.size === 0) {
    console.log('✅ No duplicate part numbers found.');
    return;
  }
  console.log(`Found ${dupes.size} duplicate part number(s).\n`);
  let priceConflicts = 0;
  let laborConflicts = 0;
  for (const [key, { canonical, dupes: ds }] of dupes) {
    const allEntries = [canonical, ...ds];
    const prices = new Set(allEntries.map(e => e.entry.msrp));
    const labors = new Set(allEntries.map(e => e.entry.laborHours));
    const priceConflict = prices.size > 1;
    const laborConflict = labors.size > 1;
    if (priceConflict) priceConflicts++;
    if (laborConflict) laborConflicts++;
    const flags = [
      priceConflict ? '💰 PRICE-CONFLICT' : '',
      laborConflict ? '⏱️ LABOR-CONFLICT' : '',
    ].filter(Boolean).join('  ');
    console.log(`── ${key.padEnd(20)} ${flags}`);
    console.log(`   CANONICAL ${canonical.file.padEnd(28)} ${fmtEntry(canonical.entry)}`);
    for (const d of ds) {
      console.log(`   DUP-OF    ${d.file.padEnd(28)} ${fmtEntry(d.entry)}`);
    }
  }
  console.log('');
  console.log(`Summary: ${dupes.size} duplicate part numbers, ${priceConflicts} with price conflicts, ${laborConflicts} with labor-hour conflicts.`);
}

function applyDedup(dupes) {
  // Group dupes by file so we can rewrite each file once with all targeted
  // lines deleted at the same time (otherwise line indices shift).
  const removalsByFile = new Map(); // file -> Set<lineIndex>
  for (const [, { dupes: ds }] of dupes) {
    for (const d of ds) {
      if (!removalsByFile.has(d.file)) removalsByFile.set(d.file, new Set());
      removalsByFile.get(d.file).add(d.entry.lineIndex);
    }
  }
  let totalRemoved = 0;
  for (const [file, lineSet] of removalsByFile) {
    const fp = path.join(COMPACT_DIR, file);
    const { lines } = parseFile(fp);
    const kept = lines.filter((_, i) => !lineSet.has(i));
    fs.writeFileSync(fp, kept.join('\n'), 'utf8');
    totalRemoved += lineSet.size;
    console.log(`  ${file}: removed ${lineSet.size} duplicate entries`);
  }
  console.log(`\nApplied: removed ${totalRemoved} duplicate entries across ${removalsByFile.size} files.`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const mode = args.includes('--apply') ? 'apply' : args.includes('--check') ? 'check' : 'report';

const orderedFiles = discoverFileOrder();
console.log(`Discovered ${orderedFiles.length} catalog files in import order from data/products/index.ts`);
const dupes = buildDuplicateMap(orderedFiles);

if (mode === 'apply') {
  reportDuplicates(dupes);
  if (dupes.size > 0) {
    console.log('\nApplying dedup (canonical = first occurrence in FULL_CATALOG order)...');
    applyDedup(dupes);
  }
  process.exit(0);
}

if (mode === 'check') {
  reportDuplicates(dupes);
  process.exit(dupes.size > 0 ? 1 : 0);
}

// Default: report only.
reportDuplicates(dupes);
console.log('\nRun with --apply to remove duplicates (canonical = first occurrence).');
console.log('Run with --check to exit non-zero on any dupe (CI mode).');
process.exit(0);
