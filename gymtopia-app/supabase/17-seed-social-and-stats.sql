-- Seed social, posts interactions, favorites, workouts, achievements, notifications, reviews
-- Idempotent-ish: uses WHERE NOT EXISTS / ON CONFLICT where possible

-- Pick two existing users
-- Follows
WITH u AS (
  SELECT id, row_number() over () rn FROM public.users LIMIT 2
), u1 AS (SELECT id FROM u WHERE rn=1), u2 AS (SELECT id FROM u WHERE rn=2)
INSERT INTO public.follows (follower_id, following_id)
SELECT (SELECT id FROM u1), (SELECT id FROM u2)
WHERE EXISTS (SELECT 1 FROM u1) AND EXISTS (SELECT 1 FROM u2)
AND NOT EXISTS (
  SELECT 1 FROM public.follows WHERE follower_id = (SELECT id FROM u1) AND following_id = (SELECT id FROM u2)
);

-- Gym friends (accepted)
WITH u AS (
  SELECT id, row_number() over () rn FROM public.users LIMIT 2
), u1 AS (SELECT id FROM u WHERE rn=1), u2 AS (SELECT id FROM u WHERE rn=2)
INSERT INTO public.gym_friends (user_id, friend_id, status, accepted_at)
SELECT (SELECT id FROM u1), (SELECT id FROM u2), 'accepted', NOW()
WHERE EXISTS (SELECT 1 FROM u1) AND EXISTS (SELECT 1 FROM u2)
AND NOT EXISTS (
  SELECT 1 FROM public.gym_friends 
  WHERE (user_id = (SELECT id FROM u1) AND friend_id = (SELECT id FROM u2))
     OR (user_id = (SELECT id FROM u2) AND friend_id = (SELECT id FROM u1))
);

-- Favorite gyms
WITH u AS (
  SELECT id, row_number() over () rn FROM public.users LIMIT 1
), u1 AS (SELECT id FROM u WHERE rn=1), g AS (
  SELECT id, row_number() over (order by created_at desc nulls last) rn FROM public.gyms LIMIT 1
), g1 AS (SELECT id FROM g WHERE rn=1)
INSERT INTO public.favorite_gyms (user_id, gym_id)
SELECT (SELECT id FROM u1), (SELECT id FROM g1)
WHERE EXISTS (SELECT 1 FROM u1) AND EXISTS (SELECT 1 FROM g1)
AND NOT EXISTS (
  SELECT 1 FROM public.favorite_gyms WHERE user_id = (SELECT id FROM u1) AND gym_id = (SELECT id FROM g1)
);

-- Workout session + exercises
WITH u AS (
  SELECT id, row_number() over () rn FROM public.users LIMIT 1
), u1 AS (SELECT id FROM u WHERE rn=1), g AS (
  SELECT id, row_number() over (order by created_at desc nulls last) rn FROM public.gyms LIMIT 1
), g1 AS (SELECT id FROM g WHERE rn=1), new_session AS (
  INSERT INTO public.workout_sessions (user_id, gym_id, started_at, ended_at)
  SELECT (SELECT id FROM u1), (SELECT id FROM g1), NOW() - INTERVAL '90 minutes', NOW() - INTERVAL '10 minutes'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.workout_sessions WHERE user_id = (SELECT id FROM u1) LIMIT 1
  )
  RETURNING id
)
INSERT INTO public.workout_exercises (session_id, exercise_name, muscle_group, equipment_type, sets, notes, order_index)
SELECT s.id, 'ベンチプレス', 'chest', 'barbell',
       '[{"set":1,"weight":80,"reps":10},{"set":2,"weight":85,"reps":8},{"set":3,"weight":90,"reps":6}]'::jsonb,
       '自己ベスト更新を狙う', 1
FROM new_session s;

-- Notifications (follow)
WITH u AS (
  SELECT id, row_number() over () rn FROM public.users LIMIT 2
), u1 AS (SELECT id FROM u WHERE rn=1), u2 AS (SELECT id FROM u WHERE rn=2)
INSERT INTO public.notifications (user_id, type, title, message, related_user_id, is_read)
SELECT (SELECT id FROM u2), 'follow', '新しいフォロワー', 'あなたをフォローしました', (SELECT id FROM u1), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.notifications WHERE user_id = (SELECT id FROM u2) AND type = 'follow' AND related_user_id = (SELECT id FROM u1)
);

-- (skip gym_reviews seeding due to varying schema)

-- (skip post_likes/post_comments due to legacy trigger on posts table)
