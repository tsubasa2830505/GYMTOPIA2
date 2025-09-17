-- Fix the find_nearby_gyms function to use correct column
CREATE OR REPLACE FUNCTION find_nearby_gyms(
  center_lat double precision,
  center_lon double precision,
  radius_km double precision
) RETURNS TABLE(
  id uuid,
  name text,
  distance_km double precision
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    g.name,
    calculate_distance(center_lat, center_lon, g.latitude, g.longitude) as distance_km
  FROM gyms g
  WHERE 
    g.latitude IS NOT NULL 
    AND g.longitude IS NOT NULL
    AND g.status = 'active'
    AND calculate_distance(center_lat, center_lon, g.latitude, g.longitude) <= radius_km
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;;
