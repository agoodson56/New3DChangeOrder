-- Per-row change order storage. Replaces the single-blob `history` scope so
-- multi-office concurrent edits don't clobber each other and revisions get
-- first-class parent_id links.
--
-- Apply:
--   wrangler d1 execute co-storage --remote --file=./db/migrations/003_change_orders.sql

CREATE TABLE IF NOT EXISTS change_orders (
  id            TEXT PRIMARY KEY,
  user_id       INTEGER NOT NULL,
  org_id        TEXT NOT NULL DEFAULT 'default',
  pco_number    TEXT,
  revision      INTEGER NOT NULL DEFAULT 0,
  parent_id     TEXT,
  customer      TEXT,
  project_name  TEXT,
  data          TEXT NOT NULL,            -- ChangeOrderData JSON
  grand_total   REAL NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'pending',
  notes         TEXT,
  close_reason  TEXT,
  saved_at      INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL,
  updated_by    TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (parent_id) REFERENCES change_orders(id)
);

CREATE INDEX IF NOT EXISTS idx_co_user_updated ON change_orders(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_co_parent ON change_orders(parent_id);
CREATE INDEX IF NOT EXISTS idx_co_user_status ON change_orders(user_id, status);
