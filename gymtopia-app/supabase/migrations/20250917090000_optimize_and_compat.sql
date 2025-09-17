-- GYMTOPIA 2.0 - Index optimization and compatibility views
-- Non-destructive: adds extensions, indexes, and safe views only.

-- Enable text search acceleration for ILIKE queries on names
CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- Gyms: common filters and search
CREATE INDEX IF NOT EXISTS idx_gyms_status ON public.gyms (status);
CREATE INDEX IF NOT EXISTS idx_gyms_prefecture ON public.gyms (prefecture);
CREATE INDEX IF NOT EXISTS idx_gyms_city ON public.gyms (city);
CREATE INDEX IF NOT EXISTS idx_gyms_name_trgm ON public.gyms USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_gyms_facilities_gin ON public.gyms USING gin (facilities);
-- Note: current schema uses name/brand/count, not machine_id
CREATE INDEX IF NOT EXISTS idx_gym_machines_gym ON public.gym_machines (gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_machines_name ON public.gym_machines (name);
CREATE INDEX IF NOT EXISTS idx_gym_machines_gym_name ON public.gym_machines (gym_id, name);
-- Gym free weights
CREATE INDEX IF NOT EXISTS idx_gym_free_weights_gym ON public.gym_free_weights (gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_free_weights_name ON public.gym_free_weights (name);
-- Reviews
CREATE INDEX IF NOT EXISTS idx_gym_reviews_gym ON public.gym_reviews (gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_reviews_created_at ON public.gym_reviews (created_at DESC);
-- Favorites (イキタイ)
CREATE UNIQUE INDEX IF NOT EXISTS uq_favorite_gyms_user_gym ON public.favorite_gyms (user_id, gym_id);
CREATE INDEX IF NOT EXISTS idx_favorite_gyms_user ON public.favorite_gyms (user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_gyms_gym ON public.favorite_gyms (gym_id);
-- Create compatibility view only if not exists, to avoid breaking changes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname='public' AND viewname='gym_likes'
  ) THEN
    EXECUTE 'CREATE VIEW public.gym_likes AS SELECT id, user_id, gym_id, created_at FROM public.favorite_gyms';
  END IF;
END $$;
