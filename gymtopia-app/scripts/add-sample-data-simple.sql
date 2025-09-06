-- Simple sample data script that works with existing constraints
-- This creates sample data without needing auth.users entries

-- First, let's create some sample posts using existing gym IDs and dummy user IDs
-- We'll use the existing gym IDs from our gym data

-- Create some sample posts with realistic content
INSERT INTO public.posts (id, user_id, content, post_type, gym_id, visibility, likes_count, comments_count, created_at)
VALUES 
  (gen_random_uuid(), gen_random_uuid(), 'ついにベンチプレス90kg達成しました！🏋️‍♂️ 3年間の目標だったので本当に嬉しいです。次は100kgを目指します！', 'workout', 'gym-1', 'public', 24, 5, NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), gen_random_uuid(), '今日は新しいヨガクラスに参加してきました✨ 先生が優しくて、初心者の私でも楽しくできました。心も体もリフレッシュ！', 'normal', 'gym-2', 'public', 18, 3, NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), gen_random_uuid(), 'スクワット150kg×5回クリア💪 脚トレは辛いけど、この達成感がたまりません。大会に向けて順調に仕上がってます！', 'workout', 'gym-3', 'public', 32, 8, NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), gen_random_uuid(), 'ジム通い始めて1ヶ月経ちました！最初は不安でしたが、今では毎日通うのが楽しみです。体重も2kg減りました🎉', 'normal', 'gym-1', 'public', 15, 4, NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), gen_random_uuid(), '人生初のジム体験！マシンの使い方を丁寧に教えてもらえました。継続して頑張りたいと思います💪', 'check_in', 'gym-2', 'public', 12, 2, NOW() - INTERVAL '1 week'),
  (gen_random_uuid(), gen_random_uuid(), '今日の背中トレーニング終了！デッドリフトで130kgを引けました。フォームを意識して丁寧にやることが大切ですね。', 'workout', 'gym-1', 'public', 21, 6, NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- Create some sample workout sessions
INSERT INTO public.workout_sessions (id, user_id, gym_id, name, target_muscles, started_at, ended_at, duration_minutes, notes, mood, created_at)
VALUES 
  (gen_random_uuid(), gen_random_uuid(), 'gym-1', '胸・三頭筋トレーニング', ARRAY['胸部', '上腕三頭筋'], NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '90 minutes', 90, 'ベンチプレスで新記録達成！', 'excellent', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), gen_random_uuid(), 'gym-1', '背中・二頭筋トレーニング', ARRAY['背中', '上腕二頭筋'], NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '75 minutes', 75, 'デッドリフト頑張りました', 'good', NOW() - INTERVAL '5 days'),
  (gen_random_uuid(), gen_random_uuid(), 'gym-2', 'ヨガ＆ストレッチ', ARRAY['全身'], NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '60 minutes', 60, 'リラックスできました', 'good', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), gen_random_uuid(), 'gym-3', '脚トレーニング', ARRAY['脚部', '臀部'], NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '120 minutes', 120, 'スクワット150kg×5回', 'excellent', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), gen_random_uuid(), 'gym-1', '有酸素＋軽い筋トレ', ARRAY['全身'], NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '45 minutes', 45, '初心者向けメニュー', 'normal', NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), gen_random_uuid(), 'gym-2', '初回体験', ARRAY['全身'], NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week' + INTERVAL '30 minutes', 30, 'ジム初体験！緊張しました', 'normal', NOW() - INTERVAL '1 week')
ON CONFLICT (id) DO NOTHING;

-- Add some gym reviews using existing gym IDs
INSERT INTO public.gym_reviews (id, gym_id, user_id, rating, title, content, equipment_rating, cleanliness_rating, staff_rating, accessibility_rating, created_at)
VALUES 
  (gen_random_uuid(), 'gym-1', gen_random_uuid(), 5, '最高のジムです！', '設備が充実していて、スタッフの方も親切です。特にフリーウェイトエリアが広くて使いやすいです。', 5, 4, 5, 4, NOW() - INTERVAL '1 month'),
  (gen_random_uuid(), 'gym-2', gen_random_uuid(), 4, 'ヨガクラスが充実', 'ヨガやピラティスのクラスが豊富で、初心者にも優しいです。シャワールームもきれいです。', 4, 5, 4, 3, NOW() - INTERVAL '2 weeks'),
  (gen_random_uuid(), 'gym-3', gen_random_uuid(), 5, 'マシンの種類が豊富', 'どんなトレーニングにも対応できる設備が揃っています。24時間営業なのも助かります。', 5, 4, 4, 5, NOW() - INTERVAL '3 weeks'),
  (gen_random_uuid(), 'gym-1', gen_random_uuid(), 4, '初心者にも優しい', 'トレーニング方法を丁寧に教えてもらえました。料金もリーズナブルで続けやすいです。', 4, 4, 5, 4, NOW() - INTERVAL '1 week'),
  (gen_random_uuid(), 'gym-2', gen_random_uuid(), 3, '混雑することが多い', '設備は良いのですが、夕方は特に混雑します。もう少し広ければ完璧です。', 4, 3, 3, 3, NOW() - INTERVAL '5 days'),
  (gen_random_uuid(), 'gym-4', gen_random_uuid(), 4, 'アクセス抜群', '駅から徒歩3分でとても便利です。シンプルな設備ですが清潔で使いやすいです。', 3, 5, 4, 5, NOW() - INTERVAL '1 week'),
  (gen_random_uuid(), 'gym-5', gen_random_uuid(), 5, '女性専用エリアが良い', '女性専用エリアがあるので安心してトレーニングできます。スタッフさんも親切で丁寧です。', 4, 5, 5, 4, NOW() - INTERVAL '3 days')
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

-- Create some gym check-ins
INSERT INTO public.gym_checkins (id, user_id, gym_id, checked_in_at, created_at)
VALUES 
  (gen_random_uuid(), gen_random_uuid(), 'gym-1', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), gen_random_uuid(), 'gym-2', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), gen_random_uuid(), 'gym-3', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), gen_random_uuid(), 'gym-1', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), gen_random_uuid(), 'gym-2', NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week'),
  (gen_random_uuid(), gen_random_uuid(), 'gym-4', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), gen_random_uuid(), 'gym-5', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

COMMIT;