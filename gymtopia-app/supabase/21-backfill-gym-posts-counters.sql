-- Backfill likes_count and comments_count on gym_posts
-- Compute separate aggregates then update in two passes
WITH pl AS (
  SELECT post_id, COUNT(*)::int AS cnt FROM public.post_likes GROUP BY post_id
)
UPDATE public.gym_posts gp
SET likes_count = pl.cnt
FROM pl
WHERE gp.id = pl.post_id;

WITH pc AS (
  SELECT post_id, COUNT(*)::int AS cnt FROM public.post_comments GROUP BY post_id
)
UPDATE public.gym_posts gp
SET comments_count = pc.cnt
FROM pc
WHERE gp.id = pc.post_id;

-- Also zero out rows with no matches
UPDATE public.gym_posts gp
SET likes_count = 0
WHERE gp.likes_count IS NULL;

UPDATE public.gym_posts gp
SET comments_count = 0
WHERE gp.comments_count IS NULL;
