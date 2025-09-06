-- Sample data for posts and gym reviews
-- Uses correct column names based on current database structure

-- Insert sample posts
INSERT INTO public.posts (
  id, user_id, gym_id, content, likes_count, comments_count, created_at
) VALUES 
  (gen_random_uuid(), gen_random_uuid(), 'gym-1', 'ついにベンチプレス90kg達成！次は100kgを目指します💪', 24, 5, NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), gen_random_uuid(), 'gym-2', 'ヨガクラスでリフレッシュ✨ 初心者でも楽しくできました', 18, 3, NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), gen_random_uuid(), 'gym-3', 'スクワット150kg×5回クリア。大会に向けて順調です！', 32, 8, NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), gen_random_uuid(), 'gym-1', 'ジム通い1ヶ月で体重2kg減🎉 継続は力なり', 15, 4, NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), gen_random_uuid(), 'gym-2', '初めてのジム体験！スタッフが丁寧に教えてくれました💪', 12, 2, NOW() - INTERVAL '1 week')
ON CONFLICT (id) DO NOTHING;

-- Insert sample gym reviews
INSERT INTO public.gym_reviews (
  id, gym_id, user_id, rating, title, content, equipment_rating, cleanliness_rating, staff_rating, accessibility_rating, created_at
) VALUES 
  (gen_random_uuid(), 'gym-1', gen_random_uuid(), 5, '最高のジムです！', '設備が充実していて、スタッフも親切。フリーウェイトが豊富。', 5, 4, 5, 4, NOW() - INTERVAL '1 month'),
  (gen_random_uuid(), 'gym-2', gen_random_uuid(), 4, 'ヨガクラスが充実', '初心者にも優しいクラス編成。シャワールームも清潔。', 4, 5, 4, 3, NOW() - INTERVAL '2 weeks'),
  (gen_random_uuid(), 'gym-3', gen_random_uuid(), 5, 'マシンの種類が豊富', '24時間営業でいつでも使えるのが嬉しい。', 5, 4, 4, 5, NOW() - INTERVAL '3 weeks'),
  (gen_random_uuid(), 'gym-4', gen_random_uuid(), 4, 'アクセス抜群', '駅から徒歩3分でとても便利です。', 3, 5, 4, 5, NOW() - INTERVAL '1 week'),
  (gen_random_uuid(), 'gym-5', gen_random_uuid(), 5, '女性専用エリアが良い', '女性専用エリアがあるので安心。', 4, 5, 5, 4, NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- Update gym ratings based on reviews
UPDATE public.gyms 
SET rating = (
    SELECT AVG(rating)::numeric(3,1)
    FROM public.gym_reviews 
    WHERE gym_reviews.gym_id = gyms.id
),
review_count = (
    SELECT COUNT(*) 
    FROM public.gym_reviews 
    WHERE gym_reviews.gym_id = gyms.id
)
WHERE EXISTS (
    SELECT 1 FROM public.gym_reviews WHERE gym_reviews.gym_id = gyms.id
);

-- Insert sample workout sessions
INSERT INTO public.workout_sessions (
  id, user_id, gym_id, name, target_muscles, started_at, ended_at, duration_minutes, notes, mood, created_at
) VALUES 
  (gen_random_uuid(), gen_random_uuid(), 'gym-1', '胸・三頭筋トレーニング', ARRAY['胸部', '上腕三頭筋'], NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '90 minutes', 90, 'ベンチプレスで新記録達成！', 'excellent', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), gen_random_uuid(), 'gym-1', '背中・二頭筋トレーニング', ARRAY['背中', '上腕二頭筋'], NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '75 minutes', 75, 'デッドリフト頑張りました', 'good', NOW() - INTERVAL '5 days'),
  (gen_random_uuid(), gen_random_uuid(), 'gym-2', 'ヨガ＆ストレッチ', ARRAY['全身'], NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '60 minutes', 60, 'リラックスできました', 'good', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), gen_random_uuid(), 'gym-3', '脚トレーニング', ARRAY['脚部', '臀部'], NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '120 minutes', 120, 'スクワット150kg×5回', 'excellent', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), gen_random_uuid(), 'gym-1', '有酸素＋軽い筋トレ', ARRAY['全身'], NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '45 minutes', 45, '初心者向けメニュー', 'normal', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;