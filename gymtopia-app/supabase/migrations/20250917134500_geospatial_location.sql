-- Optional geospatial support for gyms (enable PostGIS; add location + GIST index)
DO $$
BEGIN
  BEGIN
    CREATE EXTENSION IF NOT EXISTS postgis;
  EXCEPTION WHEN others THEN
    -- Extension may be locked down; skip silently
    NULL;
  END;

  -- Add geography point if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='gyms' AND column_name='location'
  ) THEN
    BEGIN
      ALTER TABLE public.gyms ADD COLUMN location geography(Point,4326);
    EXCEPTION WHEN others THEN
      -- Fallback to geometry if geography unavailable
      BEGIN
        ALTER TABLE public.gyms ADD COLUMN location geometry(Point,4326);
      EXCEPTION WHEN others THEN
        NULL;
      END;
    END;
  END IF;

  -- Backfill location from longitude/latitude when both present
  BEGIN
    UPDATE public.gyms
    SET location =
      CASE
        WHEN location IS NULL AND longitude IS NOT NULL AND latitude IS NOT NULL THEN
          (SELECT 
            CASE 
              WHEN (SELECT EXISTS(SELECT 1 FROM pg_type WHERE typname='geography')) THEN
                ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
              ELSE
                ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
            END)
        ELSE location
      END;
  EXCEPTION WHEN others THEN
    NULL;
  END;

  -- Create GIST index if possible
  BEGIN
    CREATE INDEX IF NOT EXISTS idx_gyms_location_gist ON public.gyms USING GIST(location);
  EXCEPTION WHEN others THEN
    NULL;
  END;
END $$;

