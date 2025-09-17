-- View that exposes gym_posts with live counts for likes and comments
CREATE OR REPLACE VIEW public.gym_posts_with_counts AS
SELECT
  p.*,
  COALESCE((SELECT count(*) FROM public.post_likes l WHERE l.post_id = p.id), 0) AS likes_count_live,
  COALESCE((SELECT count(*) FROM public.post_comments c WHERE c.post_id = p.id), 0) AS comments_count_live
FROM public.gym_posts p;
