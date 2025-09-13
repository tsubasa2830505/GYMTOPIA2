-- Create compatibility view gym_likes backed by favorite_gyms
-- and relax RLS for public read (counting in Admin Stats)

-- 1) Public SELECT policy on favorite_gyms (read-only)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='favorite_gyms' AND policyname='favorite_gyms_select_public'
  ) THEN
    EXECUTE 'CREATE POLICY favorite_gyms_select_public ON public.favorite_gyms FOR SELECT USING (true)';
  END IF;
END $$;

-- 2) Create or replace view gym_likes as favorite_gyms mapped to like_type='favorite'
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.views WHERE table_schema='public' AND table_name='gym_likes'
  ) THEN
    EXECUTE 'DROP VIEW public.gym_likes';
  END IF;
END $$;

CREATE VIEW public.gym_likes AS
SELECT
  fg.id,
  fg.user_id,
  fg.gym_id,
  'favorite'::text AS like_type,
  fg.created_at
FROM public.favorite_gyms fg;

