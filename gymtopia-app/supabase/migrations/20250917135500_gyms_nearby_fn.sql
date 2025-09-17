-- Nearby gyms function without requiring PostGIS (Haversine formula)
CREATE OR REPLACE FUNCTION public.gyms_nearby(
  lon double precision,
  lat double precision,
  radius_km double precision,
  limit_n integer DEFAULT 50,
  offset_n integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  name text,
  latitude double precision,
  longitude double precision,
  distance_km double precision
)
LANGUAGE sql STABLE AS $$
  WITH candidates AS (
    SELECT
      g.id,
      g.name,
      g.latitude,
      g.longitude,
      6371 * acos(
        cos(radians(lat)) * cos(radians(g.latitude)) * cos(radians(g.longitude) - radians(lon)) +
        sin(radians(lat)) * sin(radians(g.latitude))
      ) AS distance_km
    FROM public.gyms g
    WHERE g.latitude IS NOT NULL AND g.longitude IS NOT NULL
  )
  SELECT id, name, latitude, longitude, distance_km
  FROM candidates
  WHERE distance_km <= radius_km
  ORDER BY distance_km ASC
  LIMIT limit_n OFFSET offset_n;
$$;

