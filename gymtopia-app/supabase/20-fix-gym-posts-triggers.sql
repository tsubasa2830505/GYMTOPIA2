-- Fix legacy trigger functions to update gym_posts counters instead of public.posts
-- Safe to re-run

-- Ensure columns exist on gym_posts
ALTER TABLE IF EXISTS public.gym_posts
  ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- 1) Likes counter
CREATE OR REPLACE FUNCTION public.update_post_like_count()
RETURNS TRIGGER AS $$
DECLARE v_post_id uuid;
BEGIN
  v_post_id := CASE WHEN TG_OP = 'INSERT' THEN NEW.post_id ELSE OLD.post_id END;
  UPDATE public.gym_posts
    SET likes_count = COALESCE((SELECT COUNT(*) FROM public.post_likes WHERE post_id = v_post_id), 0)
  WHERE id = v_post_id;
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  ELSE
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_post_like_count'
  ) THEN
    CREATE TRIGGER trg_update_post_like_count
      AFTER INSERT OR DELETE ON public.post_likes
      FOR EACH ROW EXECUTE FUNCTION public.update_post_like_count();
  END IF;
END $$;

-- 2) Comments counter
CREATE OR REPLACE FUNCTION public.update_post_comment_count()
RETURNS TRIGGER AS $$
DECLARE v_post_id uuid;
BEGIN
  v_post_id := CASE WHEN TG_OP = 'INSERT' THEN NEW.post_id ELSE OLD.post_id END;
  UPDATE public.gym_posts
    SET comments_count = COALESCE((SELECT COUNT(*) FROM public.post_comments WHERE post_id = v_post_id), 0)
  WHERE id = v_post_id;
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  ELSE
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_post_comment_count'
  ) THEN
    CREATE TRIGGER trg_update_post_comment_count
      AFTER INSERT OR DELETE ON public.post_comments
      FOR EACH ROW EXECUTE FUNCTION public.update_post_comment_count();
  END IF;
END $$;

