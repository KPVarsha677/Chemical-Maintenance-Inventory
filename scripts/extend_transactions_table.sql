-- Run this in the Supabase SQL editor (Project -> SQL Editor).
-- Extends the existing `transactions` table so it can record chemical usage
-- events (the "Record Usage" workflow), instead of only container movements.
-- Safe to re-run: IF NOT EXISTS guards prevent errors on repeat execution.
-- Does not touch existing rows or columns.

ALTER TABLE transactions
    ADD COLUMN IF NOT EXISTS chemical_id bigint REFERENCES chemicals(id),
    ADD COLUMN IF NOT EXISTS performed_by text,
    ADD COLUMN IF NOT EXISTS purpose text,
    ADD COLUMN IF NOT EXISTS location text,
    ADD COLUMN IF NOT EXISTS notes text;

-- `container_id` was NOT NULL, but usage events are logged against a chemical
-- directly rather than a specific container. Relaxing this is safe: the table
-- currently has no rows, and existing container-based transactions (if any
-- are added later) can still populate it.
ALTER TABLE transactions ALTER COLUMN container_id DROP NOT NULL;

-- Default new rows to "now" if no timestamp is supplied by the API.
ALTER TABLE transactions ALTER COLUMN timestamp SET DEFAULT now();
