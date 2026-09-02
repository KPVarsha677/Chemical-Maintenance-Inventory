-- Run this in the Supabase SQL editor (Project -> SQL Editor).
-- Adds the missing columns required by the backend to the existing `chemicals` table.
-- Safe to re-run: IF NOT EXISTS guards prevent errors on repeat execution.
-- Does not touch existing rows or columns.

ALTER TABLE chemicals
    ADD COLUMN IF NOT EXISTS quantity numeric,
    ADD COLUMN IF NOT EXISTS unit text,
    ADD COLUMN IF NOT EXISTS location text,
    ADD COLUMN IF NOT EXISTS expiry_date date,
    ADD COLUMN IF NOT EXISTS hazard_level text;
