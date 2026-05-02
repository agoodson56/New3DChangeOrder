-- Cloudflare D1 schema for cross-device sync.
--
-- Setup:
--   1. wrangler d1 create co-storage
--   2. Add binding "DB" → co-storage in Cloudflare Pages dashboard
--   3. wrangler d1 execute co-storage --file=./db/schema.sql
--
-- Each row holds a JSON blob for one (org, scope) pair. Scopes:
--   history     — array of SavedCO
--   customers   — array of SavedCustomer
--   templates   — array of SavedTemplate
--   rates       — LaborRates object
--   draft_<id>  — current draft for a specific user (id = email hash)
--
-- Conflict policy: last-write-wins per scope, with updated_at tie-breaker.
-- For an internal team this is acceptable; if two coordinators edit the same
-- list simultaneously the later push wins. Add per-row tables later if needed.

CREATE TABLE IF NOT EXISTS blobs (
  org_id     TEXT NOT NULL DEFAULT 'default',
  scope      TEXT NOT NULL,
  content    TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  updated_by TEXT,
  PRIMARY KEY (org_id, scope)
);

CREATE INDEX IF NOT EXISTS idx_blobs_org_updated ON blobs(org_id, updated_at DESC);
