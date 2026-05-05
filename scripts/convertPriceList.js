const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('D:\\price-list.jsonl'),
  crlfDelay: Infinity
});

const products = {};
let count = 0;

rl.on('line', (line) => {
  if (!line.trim()) return;

  try {
    const item = JSON.parse(line);
    const key = `${item.manufacturer}|${item.part_number}`.toLowerCase();

    // For change orders: use list price with NO discount
    let listPrice = item.mfr_list_price;
    if (!listPrice && item.unit_cost && item.discount_pct) {
      // Reverse discount: list_price = unit_cost / (1 - discount/100)
      listPrice = item.unit_cost / (1 - item.discount_pct / 100);
    }
    listPrice = listPrice || item.unit_cost || 0;

    if (!products[key]) {
      products[key] = {
        manufacturer: item.manufacturer,
        partNumber: item.part_number,
        description: item.description,
        serviceLine: item.service_line,
        listPrice: Math.round(listPrice * 100) / 100,
        unit: item.unit || 'EA',
      };
      count++;
    }
  } catch (e) {
    console.error('Parse error:', e.message);
  }
});

rl.on('close', () => {
  const output = `// Auto-generated from price-list.jsonl
export const PRICE_LIST_PRODUCTS = {
${Object.entries(products).map(([key, val]) =>
  `  '${key}': ${JSON.stringify(val)},`
).join('\n')}
};

export function lookupPrice(manufacturer, partNumber) {
  const key = \`\${manufacturer}|\${partNumber}\`.toLowerCase();
  return PRICE_LIST_PRODUCTS[key]?.listPrice || null;
}
`;

  fs.writeFileSync('data/priceListProducts.ts', output);
  console.log(`✓ Converted ${count} products to data/priceListProducts.ts`);
});
