-- =====================================================
-- get_nearby_gyms RPC (no PostGIS, haversine)
-- Signature used by app:
--   rpc('get_nearby_gyms', { lat, lng, radius_km, max_results })
-- Returns: id, name, latitude, longitude, distance_km
-- Idempotent: drop/create
-- =====================================================

DROP FUNCTION IF EXISTS public.get_nearby_gyms(double precision, double precision, numeric, integer);

CREATE OR REPLACE FUNCTION public.get_nearby_gyms(
  lat double precision,
  lng double precision,
  radius_km numeric DEFAULT 5,
  max_results integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  name text,
  latitude double precision,
  longitude double precision,
  distance_km numeric
) AS $$
  SELECT 
    g.id,
    g.name,
    g.latitude,
    g.longitude,
    (
      6371 * acos(
        cos(radians(lat)) * cos(radians(g.latitude)) * cos(radians(g.longitude) - radians(lng)) +
        sin(radians(lat)) * sin(radians(g.latitude))
      )
    )::numeric(10,3) AS distance_km
  FROM public.gyms g
  WHERE g.latitude IS NOT NULL AND g.longitude IS NOT NULL
  AND (
    6371 * acos(
      cos(radians(lat)) * cos(radians(g.latitude)) * cos(radians(g.longitude) - radians(lng)) +
      sin(radians(lat)) * sin(radians(g.latitude))
    )
  ) <= radius_km
  ORDER BY distance_km ASC
  LIMIT max_results;
$$ LANGUAGE sql STABLE;

GRANT EXECUTE ON FUNCTION public.get_nearby_gyms(double precision, double precision, numeric, integer) TO anon, authenticated;
