-- Part 1: Convert latitude/longitude to double precision for better performance
ALTER TABLE gyms 
  ALTER COLUMN latitude TYPE double precision USING latitude::double precision,
  ALTER COLUMN longitude TYPE double precision USING longitude::double precision;

-- Add check constraints to ensure valid coordinates
ALTER TABLE gyms
  ADD CONSTRAINT check_valid_latitude CHECK (latitude >= -90 AND latitude <= 90),
  ADD CONSTRAINT check_valid_longitude CHECK (longitude >= -180 AND longitude <= 180);;
