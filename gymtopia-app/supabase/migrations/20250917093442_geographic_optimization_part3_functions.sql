-- Part 3: Create helper functions for distance calculations

-- Function to calculate distance between two points using Haversine formula
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 double precision,
  lon1 double precision,
  lat2 double precision,
  lon2 double precision
) RETURNS double precision AS $$
DECLARE
  R constant double precision := 6371; -- Earth's radius in kilometers
  dlat double precision;
  dlon double precision;
  a double precision;
  c double precision;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  a := sin(dlat/2) * sin(dlat/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(dlon/2) * sin(dlon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to find nearby gyms within a radius
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
    AND g.is_active = true
    AND calculate_distance(center_lat, center_lon, g.latitude, g.longitude) <= radius_km
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;;
