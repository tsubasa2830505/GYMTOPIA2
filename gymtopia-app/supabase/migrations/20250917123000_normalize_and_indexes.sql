-- Step 1: gym_machines - add machine_id (text) and backfill from machines.name
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='gym_machines' AND column_name='machine_id'
  ) THEN
    EXECUTE 'ALTER TABLE public.gym_machines ADD COLUMN machine_id text';
  END IF;
END $$;
-- Backfill by name (case-insensitive)
UPDATE public.gym_machines gm
SET machine_id = m.id::text
FROM public.machines m
WHERE lower(gm.name) = lower(m.name)
  AND gm.machine_id IS NULL;
-- Index to accelerate filtering by gym + machine
CREATE INDEX IF NOT EXISTS idx_gym_machines_gym_machineid ON public.gym_machines (gym_id, machine_id);
-- Step 2: images standardization - add images[] and backfill from image_urls if compatible
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='gyms' AND column_name='images'
  ) THEN
    EXECUTE 'ALTER TABLE public.gyms ADD COLUMN images text[]';
  END IF;
END $$;
-- Try backfill when image_urls exists
DO $$
DECLARE coltype text;
BEGIN
  SELECT data_type INTO coltype
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name='gyms' AND column_name='image_urls';
  IF coltype = 'ARRAY' OR coltype = 'text[]' THEN
    EXECUTE 'UPDATE public.gyms SET images = image_urls WHERE images IS NULL AND image_urls IS NOT NULL';
  END IF;
EXCEPTION WHEN others THEN
  -- if unknown type, skip backfill safely
  NULL;
END $$;
-- Step 3: hot-path indexes
CREATE INDEX IF NOT EXISTS idx_gym_posts_user_created_at ON public.gym_posts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_started_at ON public.workout_sessions (user_id, started_at DESC);
-- Optional: fuzzy search on machine names
CREATE INDEX IF NOT EXISTS idx_machines_name_trgm ON public.machines USING gin (name gin_trgm_ops);
