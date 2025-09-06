-- Sample data for Gymtopia app (schema-complete.sql compatible)
-- This script adds sample posts, follows, and reviews using existing profiles and gyms.
-- Prerequisites:
--   - You have applied supabase/schema-complete.sql and supabase/seed-data.sql
--   - There are rows in public.profiles (linked to auth.users) and public.gyms

-- Create sample posts and follows for up to 5 users
DO $$
DECLARE
  user_ids uuid[];
  gym_ids  uuid[];
  ucount   int;
  gcount   int;
BEGIN
  -- Collect up to 5 existing profile IDs
  SELECT array_agg(id) INTO user_ids
  FROM (
    SELECT id FROM public.profiles LIMIT 5
  ) t;

  -- Collect up to 3 gym IDs
  SELECT array_agg(id) INTO gym_ids
  FROM (
    SELECT id FROM public.gyms LIMIT 3
  ) g;

  ucount := COALESCE(array_length(user_ids, 1), 0);
  gcount := COALESCE(array_length(gym_ids, 1), 0);

  IF ucount < 2 OR gcount < 1 THEN
    RAISE NOTICE 'Not enough data (profiles:% gyms:%). Aborting sample insert.', ucount, gcount;
    RETURN;
  END IF;

  -- Insert sample posts (rotate gyms)
  FOR i IN 1..LEAST(5, ucount) LOOP
    INSERT INTO public.posts (
      id, user_id, gym_id, content, crowd_status, training_details, image_urls, likes_count, comments_count, shares_count, created_at
    ) VALUES (
      gen_random_uuid(),
      user_ids[i],
      gym_ids[(i - 1) % gcount + 1],
      CASE i
        WHEN 1 THEN 'ついにベンチプレス90kg達成！次は100kgを目指します💪'
        WHEN 2 THEN 'ヨガクラスでリフレッシュ✨ 初心者でも楽しくできました'
        WHEN 3 THEN 'スクワット150kg×5回クリア。大会に向けて順調です！'
        WHEN 4 THEN 'ジム通い1ヶ月で体重2kg減🎉 継続は力なり'
        ELSE '初めてのジム体験！スタッフが丁寧に教えてくれました💪'
      END,
      'normal',
      '{}'::jsonb,
      ARRAY[]::text[],
      0, 0, 0,
      NOW() - make_interval(days := i)
    ) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Chain follows: user[i] -> user[i+1]
  IF ucount >= 2 THEN
    FOR i IN 1..(ucount - 1) LOOP
      INSERT INTO public.follows (follower_id, following_id, created_at)
      VALUES (user_ids[i], user_ids[i+1], NOW() - make_interval(days := (i * 7)))
      ON CONFLICT (follower_id, following_id) DO NOTHING;
    END LOOP;
  END IF;
END$$;

-- Sync counters (likes/comments)
UPDATE public.posts 
SET likes_count = (
    SELECT COUNT(*) FROM public.likes WHERE likes.post_id = posts.id
),
comments_count = (
    SELECT COUNT(*) FROM public.comments WHERE comments.post_id = posts.id
);

-- Insert a few gym reviews if profiles and gyms exist
DO $$
DECLARE
  uids uuid[];
  gids uuid[];
BEGIN
  SELECT array_agg(id) INTO uids FROM (SELECT id FROM public.profiles LIMIT 5) u;
  SELECT array_agg(id) INTO gids FROM (SELECT id FROM public.gyms LIMIT 3) g;
  IF uids IS NULL OR gids IS NULL THEN RETURN; END IF;

  INSERT INTO public.gym_reviews (
    id, gym_id, user_id, rating, title, content, equipment_rating, cleanliness_rating, staff_rating, accessibility_rating, created_at
  ) VALUES 
    (gen_random_uuid(), gids[1], uids[1], 5, '最高のジムです！', '設備が充実していて、スタッフも親切。フリーウェイトが豊富。', 5, 4, 5, 4, NOW() - INTERVAL '1 month'),
    (gen_random_uuid(), gids[2], uids[2], 4, 'ヨガクラスが充実', '初心者にも優しいクラス編成。シャワールームも清潔。', 4, 5, 4, 3, NOW() - INTERVAL '2 weeks'),
    (gen_random_uuid(), gids[3], uids[3], 5, 'マシンの種類が豊富', '24時間営業でいつでも使えるのが嬉しい。', 5, 4, 4, 5, NOW() - INTERVAL '3 weeks')
  ON CONFLICT DO NOTHING;
END$$;

-- Update aggregate rating fields on gyms
UPDATE public.gyms 
SET rating = (
    SELECT AVG(rating)::DECIMAL(3,1)
    FROM public.gym_reviews 
    WHERE gym_reviews.gym_id = gyms.id
),
total_reviews = (
    SELECT COUNT(*) 
    FROM public.gym_reviews 
    WHERE gym_reviews.gym_id = gyms.id
);

-- Done
