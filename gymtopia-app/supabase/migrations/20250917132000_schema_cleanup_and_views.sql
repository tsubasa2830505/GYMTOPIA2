-- 1) Fix latitude/longitude types to double precision (if possible)
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.gyms
      ALTER COLUMN latitude TYPE double precision USING latitude::double precision,
      ALTER COLUMN longitude TYPE double precision USING longitude::double precision;
  EXCEPTION WHEN others THEN
    -- Skip if cast fails; manual data cleanup may be required
    NULL;
  END;
END $$;
-- 2) Drop duplicate count columns on gym_posts (prefer live counts or single source)
-- Drop dependent view first if exists
DROP VIEW IF EXISTS public.gym_posts_with_counts;
ALTER TABLE IF EXISTS public.gym_posts DROP COLUMN IF EXISTS likes_count;
ALTER TABLE IF EXISTS public.gym_posts DROP COLUMN IF EXISTS comments_count;
-- 3) Replace/ensure compatibility views for normalized equipment
-- Map machines -> equipment with type normalization ('free-weight' -> 'free_weight')
DO $$
BEGIN
  -- Only create/replace view if 'equipment' is a view or does not exist; skip if it's a table
  IF EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relname='equipment' AND c.relkind='v'
  ) THEN
    EXECUTE 'CREATE OR REPLACE VIEW public.equipment AS '
         || 'SELECT id, name, '
         || 'CASE WHEN type=''free-weight'' THEN ''free_weight'' ELSE type END AS type '
         || 'FROM public.machines';
  ELSIF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relname='equipment'
  ) THEN
    EXECUTE 'CREATE VIEW public.equipment AS '
         || 'SELECT id, name, '
         || 'CASE WHEN type=''free-weight'' THEN ''free_weight'' ELSE type END AS type '
         || 'FROM public.machines';
  END IF;
END $$;
-- Map gym_machines -> gym_equipment with expected column names
DO $$
BEGIN
  -- Only create/replace view if 'gym_equipment' is a view or does not exist; skip if it's a table
  IF EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relname='gym_equipment' AND c.relkind='v'
  ) THEN
    EXECUTE 'CREATE OR REPLACE VIEW public.gym_equipment AS '
         || 'SELECT id, gym_id, machine_id AS equipment_id, quantity AS count, created_at '
         || 'FROM public.gym_machines';
  ELSIF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relname='gym_equipment'
  ) THEN
    EXECUTE 'CREATE VIEW public.gym_equipment AS '
         || 'SELECT id, gym_id, machine_id AS equipment_id, quantity AS count, created_at '
         || 'FROM public.gym_machines';
  END IF;
END $$;
-- 4) Constraints: ensure rating within 0..5
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='public' AND table_name='gym_reviews' AND constraint_name='chk_gym_reviews_rating_range'
  ) THEN
    ALTER TABLE public.gym_reviews
      ADD CONSTRAINT chk_gym_reviews_rating_range CHECK (rating >= 0 AND rating <= 5);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='gyms' AND column_name='rating') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema='public' AND table_name='gyms' AND constraint_name='chk_gyms_rating_range'
    ) THEN
      ALTER TABLE public.gyms
        ADD CONSTRAINT chk_gyms_rating_range CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5));
    END IF;
  END IF;
END $$;
-- 5) Indexes
CREATE INDEX IF NOT EXISTS idx_gyms_prefecture_city ON public.gyms(prefecture, city);
-- 6) Recreate posts-with-counts view and aggregated stats view for gyms
CREATE OR REPLACE VIEW public.gym_posts_with_counts AS
SELECT
  p.*,
  COALESCE((SELECT count(*) FROM public.post_likes l WHERE l.post_id = p.id), 0) AS likes_count_live,
  COALESCE((SELECT count(*) FROM public.post_comments c WHERE c.post_id = p.id), 0) AS comments_count_live
FROM public.gym_posts p;
CREATE OR REPLACE VIEW public.gym_stats AS
SELECT
  g.id,
  COALESCE(COUNT(DISTINCT fg.user_id), 0) AS favorite_count,
  COALESCE(COUNT(DISTINCT gr.id), 0) AS review_count,
  COALESCE(AVG(gr.rating), 0) AS avg_rating
FROM public.gyms g
LEFT JOIN public.favorite_gyms fg ON g.id = fg.gym_id
LEFT JOIN public.gym_reviews gr ON g.id = gr.gym_id
GROUP BY g.id;
