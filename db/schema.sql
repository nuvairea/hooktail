-- hooktail database schema (Postgres)
-- Run this once on a fresh database, e.g. in the Neon SQL Editor.
-- Safe to re-run: every statement uses IF NOT EXISTS.

-- A bin is one private URL. It expires at expires_at, and the default
-- below is the only place the 24h lifetime is defined.
-- ip is the (hashed) address of whoever created the bin, used to limit
-- how many bins one visitor can create. It is deleted with the bin.
CREATE TABLE IF NOT EXISTS bins (
  id         TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '24 hours',
  ip         TEXT
);

-- For databases created before the ip column existed.
ALTER TABLE bins ADD COLUMN IF NOT EXISTS ip TEXT;

-- Speeds up "how many bins has this ip created recently".
CREATE INDEX IF NOT EXISTS bins_ip_created_at_idx
  ON bins (ip, created_at DESC);

-- One row per request caught by a bin. Deleting a bin deletes its requests.
CREATE TABLE IF NOT EXISTS requests (
  id         BIGSERIAL PRIMARY KEY,
  bin_id     TEXT NOT NULL REFERENCES bins(id) ON DELETE CASCADE,
  method     TEXT NOT NULL,
  path       TEXT,
  headers    JSONB NOT NULL,
  query      TEXT,
  body       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Speeds up "all requests for this bin, newest first".
CREATE INDEX IF NOT EXISTS requests_bin_id_created_at_idx
  ON requests (bin_id, created_at DESC);
