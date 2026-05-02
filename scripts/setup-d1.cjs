#!/usr/bin/env node
/**
 * Cross-platform setup wizard for the D1 backend.
 *
 *   npm run setup:d1
 *
 * Walks through:
 *   1. Wrangler login (if not already)
 *   2. Create the co-storage database (or reuse existing)
 *   3. Patch wrangler.toml with the database_id
 *   4. Run the schema migration
 *
 * After this script completes you still need to do TWO dashboard clicks:
 *   - Cloudflare Pages → your project → Settings → Functions → D1 bindings:
 *     verify "DB" → co-storage is bound (the wrangler.toml usually does this
 *     automatically on the next deploy, but the dashboard is the source of
 *     truth for Pages)
 *   - Cloudflare Zero Trust → Access → Applications → Add Application:
 *     domain = your-pages.pages.dev/api/data*, identity provider = your choice
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const WRANGLER = process.env.WRANGLER || 'npx wrangler';
const TOML_PATH = path.join(__dirname, '..', 'wrangler.toml');
const SCHEMA_PATH = path.join(__dirname, '..', 'db', 'schema.sql');

function step(msg) { console.log(`\n→ ${msg}`); }
function ok(msg)   { console.log(`  ✓ ${msg}`); }
function fail(msg) { console.error(`  ✗ ${msg}`); process.exit(1); }

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], ...opts });
  } catch (e) {
    return { error: true, stdout: e.stdout || '', stderr: e.stderr || '', code: e.status };
  }
}

function checkLoggedIn() {
  step('Checking Cloudflare auth status');
  const r = run(`${WRANGLER} whoami`);
  if (r.error || /Not logged in/i.test(String(r))) {
    console.log('  Not logged in. Running interactive login — your browser will open.');
    console.log('  After you authorize, come back here and re-run: npm run setup:d1');
    try {
      execSync(`${WRANGLER} login`, { stdio: 'inherit' });
    } catch (e) {
      fail('Login failed. Run "npx wrangler login" manually, then retry.');
    }
    process.exit(0);
  }
  ok('Logged in to Cloudflare');
}

function createOrFindDatabase() {
  step('Creating D1 database "co-storage" (or reusing existing)');
  const list = run(`${WRANGLER} d1 list --json`);
  const listText = typeof list === 'string' ? list : list.stdout || '';
  let existing = null;
  try {
    const databases = JSON.parse(listText);
    existing = databases.find(d => d.name === 'co-storage');
  } catch { /* parse failed — assume not found */ }

  if (existing) {
    ok(`Database already exists: ${existing.uuid}`);
    return existing.uuid;
  }

  const create = run(`${WRANGLER} d1 create co-storage`);
  const text = typeof create === 'string' ? create : (create.stdout || '') + (create.stderr || '');
  const m = text.match(/database_id\s*=\s*"([a-f0-9-]+)"/i);
  if (!m) {
    console.error(text);
    fail('Could not parse database UUID from wrangler output. Create it manually with "npx wrangler d1 create co-storage" then re-run this script.');
  }
  ok(`Database created: ${m[1]}`);
  return m[1];
}

function patchWranglerToml(uuid) {
  step('Updating wrangler.toml with the database UUID');
  const toml = fs.readFileSync(TOML_PATH, 'utf8');
  if (toml.includes(uuid)) {
    ok('wrangler.toml already has this UUID — nothing to update');
    return;
  }
  const updated = toml.replace(
    /database_id\s*=\s*"[^"]*"/,
    `database_id = "${uuid}"`
  );
  if (updated === toml) {
    fail('Could not find database_id field in wrangler.toml');
  }
  fs.writeFileSync(TOML_PATH, updated, 'utf8');
  ok('wrangler.toml updated. Commit this file so deploys pick up the binding.');
}

function runSchemaMigration() {
  step('Running schema migration against co-storage');
  if (!fs.existsSync(SCHEMA_PATH)) {
    fail(`Schema file not found at ${SCHEMA_PATH}`);
  }
  const r = run(`${WRANGLER} d1 execute co-storage --remote --file=${SCHEMA_PATH}`);
  const text = typeof r === 'string' ? r : (r.stdout || '') + (r.stderr || '');
  if (r.error) {
    console.error(text);
    fail('Schema migration failed.');
  }
  ok('Schema migration complete (table "blobs" + index created)');
}

function printNextSteps() {
  console.log('\n────────────────────────────────────────────────────────────');
  console.log('  D1 backend provisioned ✓');
  console.log('  Two manual dashboard steps remain (each ~2 minutes):');
  console.log('────────────────────────────────────────────────────────────\n');
  console.log('  1. CLOUDFLARE PAGES — bind the database to your project');
  console.log('     Pages → your-project → Settings → Functions → D1 bindings');
  console.log('     Add binding: name="DB", database="co-storage"');
  console.log('     (Then redeploy, or trigger a deploy by pushing to main.)\n');
  console.log('  2. CLOUDFLARE ZERO TRUST — protect /api/data* with Access');
  console.log('     Zero Trust → Access → Applications → Add Application');
  console.log('     Type: Self-hosted');
  console.log('     Application domain: your-pages.pages.dev/api/data*');
  console.log('     Identity provider: Google Workspace / Microsoft / OTP-email');
  console.log('     Add a policy that allows your @3dtsi.com employees.\n');
  console.log('  After both are done, hit /api/health on the deployed site to verify.');
  console.log('────────────────────────────────────────────────────────────\n');
}

(function main() {
  console.log('3DTSI change-order tool — D1 setup');
  checkLoggedIn();
  const uuid = createOrFindDatabase();
  patchWranglerToml(uuid);
  runSchemaMigration();
  printNextSteps();
})();
