-- Basera schema additions (run after 001_schema.sql).
-- Adds an optional landmark + ensures location fields are present.

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS landmark TEXT;

-- Latitude / longitude already exist in 001_schema.sql; this guards forks.
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS latitude  NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC;

CREATE INDEX IF NOT EXISTS idx_properties_geo
  ON properties (latitude, longitude);
