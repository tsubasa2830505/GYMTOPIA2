-- Part 4: Create materialized view for gym statistics (fixed)

-- Drop the regular view if it exists
DROP VIEW IF EXISTS gym_stats CASCADE;

-- Create materialized view for pre-calculated statistics
CREATE MATERIALIZED VIEW gym_stats AS
SELECT 
  g.id,
  g.name,
  g.prefecture,
  g.city,
  g.latitude,
  g.longitude,
  g.rating,
  g.review_count,
  g.address,
  g.facilities,
  g.equipment_types,
  g.verified,
  g.status,
  COUNT(DISTINCT fg.user_id) as favorite_count,
  COUNT(DISTINCT gc.user_id) as checkin_count
FROM gyms g
LEFT JOIN favorite_gyms fg ON g.id = fg.gym_id
LEFT JOIN gym_checkins gc ON g.id = gc.gym_id
WHERE g.status = 'active'
  AND g.latitude IS NOT NULL 
  AND g.longitude IS NOT NULL
GROUP BY 
  g.id, g.name, g.prefecture, g.city, 
  g.latitude, g.longitude, g.rating, g.review_count,
  g.address, g.facilities, g.equipment_types, g.verified, g.status;

-- Create indexes on the materialized view
CREATE INDEX idx_gym_stats_location ON gym_stats(latitude, longitude);
CREATE INDEX idx_gym_stats_prefecture_city ON gym_stats(prefecture, city);
CREATE INDEX idx_gym_stats_rating ON gym_stats(rating DESC NULLS LAST);

-- Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_gym_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY gym_stats;
END;
$$ LANGUAGE plpgsql;;
