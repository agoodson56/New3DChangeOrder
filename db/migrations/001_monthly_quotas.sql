-- Migration: Add monthly quota tracking for Gemini API usage
-- Purpose: Prevent accidental or malicious quota burn by enforcing per-user monthly limits
-- Applies to: /api/gemini endpoint

CREATE TABLE IF NOT EXISTS monthly_quotas (
  email TEXT NOT NULL,
  month TEXT NOT NULL,
  current_spend_usd REAL NOT NULL DEFAULT 0.0,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (email, month)
);

CREATE INDEX IF NOT EXISTS idx_monthly_quotas_month ON monthly_quotas(month);
