-- Add drop_in facility to existing gyms
-- The facilities column is already JSONB, so we just need to update existing records

-- Example: Update gyms to include drop_in facility (false by default)
-- This migration ensures the new drop_in key exists in the facilities JSONB

-- Note: In production, you might want to set specific gyms to have drop_in = true
-- For now, we'll add it with false as default for all existing gyms

UPDATE gyms
SET facilities =
  CASE
    WHEN facilities IS NULL THEN
      '{"drop_in": false}'::jsonb
    ELSE
      jsonb_set(facilities, '{drop_in}', 'false', true)
  END
WHERE NOT (facilities ? 'drop_in');

-- Add comment for documentation
COMMENT ON COLUMN gyms.facilities IS 'Facility information including drop_in (visitor) availability';