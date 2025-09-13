-- Seed data supporting visible UI (reviews, notifications, comments)
-- Safe to re-run

-- Prepare helpers
-- 1) Gym review (publicly readable)
WITH first_user AS (
  SELECT id FROM public.users ORDER BY created_at NULLS LAST LIMIT 1
), latest_gym AS (
  SELECT id FROM public.gyms ORDER BY created_at DESC NULLS LAST LIMIT 1
), latest_public_post AS (
  SELECT id FROM public.gym_posts WHERE is_public = true ORDER BY created_at DESC NULLS LAST LIMIT 1
)
INSERT INTO public.gym_reviews (gym_id, user_id, rating, title, content, created_at)
SELECT (SELECT id FROM latest_gym), (SELECT id FROM first_user), 5,
       '最高の設備', 'Hammer Strengthのマシンが豊富で最高でした！', NOW()
WHERE EXISTS (SELECT 1 FROM latest_gym) AND EXISTS (SELECT 1 FROM first_user)
AND NOT EXISTS (
  SELECT 1 FROM public.gym_reviews
  WHERE gym_id = (SELECT id FROM latest_gym) AND user_id = (SELECT id FROM first_user)
);

-- 2) Notification (generic)
WITH first_user AS (
  SELECT id FROM public.users ORDER BY created_at NULLS LAST LIMIT 1
)
INSERT INTO public.notifications (user_id, type, title, message, is_read, created_at)
SELECT (SELECT id FROM first_user), 'gym_update', '新しい設備', 'パワーラックが追加されました', false, NOW()
WHERE EXISTS (SELECT 1 FROM first_user)
AND NOT EXISTS (
  SELECT 1 FROM public.notifications WHERE user_id = (SELECT id FROM first_user) AND type='gym_update' AND title='新しい設備'
);

-- 3) Comment on the latest public post (publicly readable)
WITH first_user AS (
  SELECT id FROM public.users ORDER BY created_at NULLS LAST LIMIT 1
), latest_public_post AS (
  SELECT id FROM public.gym_posts WHERE is_public = true ORDER BY created_at DESC NULLS LAST LIMIT 1
)
INSERT INTO public.post_comments (user_id, post_id, content, created_at)
SELECT (SELECT id FROM first_user), (SELECT id FROM latest_public_post), 'ナイスセッション！', NOW()
WHERE EXISTS (SELECT 1 FROM first_user) AND EXISTS (SELECT 1 FROM latest_public_post)
AND NOT EXISTS (
  SELECT 1 FROM public.post_comments
  WHERE user_id = (SELECT id FROM first_user)
    AND post_id = (SELECT id FROM latest_public_post)
    AND content = 'ナイスセッション！'
);
