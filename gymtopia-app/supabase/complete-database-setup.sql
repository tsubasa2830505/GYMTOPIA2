-- GYMTOPIA 2.0 完全データベースセットアップ（一括実行）
-- Supabase SQLエディタで実行してください

-- 拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. プロファイルテーブル
-- ========================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    location TEXT,
    training_frequency TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. ジムテーブル
-- ========================================
CREATE TABLE IF NOT EXISTS public.gyms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    area TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone TEXT,
    website TEXT,
    business_hours JSONB,
    facilities JSONB,
    day_pass_fee INTEGER,
    is_24_hours BOOLEAN DEFAULT false,
    has_parking BOOLEAN DEFAULT false,
    has_shower BOOLEAN DEFAULT true,
    has_locker BOOLEAN DEFAULT true,
    rating DECIMAL(2, 1) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. ワークアウトセッション
-- ========================================
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    gym_id UUID REFERENCES gyms(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    total_weight_lifted INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. ワークアウトエクササイズ
-- ========================================
CREATE TABLE IF NOT EXISTS public.workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    sets INTEGER NOT NULL,
    reps INTEGER[],
    weight DECIMAL[],
    rest_seconds INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. パーソナルレコード
-- ========================================
CREATE TABLE IF NOT EXISTS public.personal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    record_type TEXT NOT NULL, -- '1RM', '3RM', '5RM', etc.
    weight DECIMAL,
    reps INTEGER,
    distance DECIMAL,
    duration_seconds INTEGER,
    notes TEXT,
    achieved_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, exercise_name, record_type)
);

-- ========================================
-- 6. 達成記録
-- ========================================
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL, -- 'milestone', 'streak', 'personal_record', etc.
    title TEXT NOT NULL,
    description TEXT,
    badge_icon TEXT,
    points INTEGER DEFAULT 0,
    earned_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 7. ジム活投稿
-- ========================================
CREATE TABLE IF NOT EXISTS public.gym_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    workout_session_id UUID REFERENCES workout_sessions(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    training_details JSONB,
    image_url TEXT,
    is_public BOOLEAN DEFAULT true,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 8. ソーシャル機能テーブル
-- ========================================
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES gym_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES gym_posts(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gym_friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    gym_id UUID REFERENCES gyms(id) ON DELETE SET NULL,
    initiated_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    friendship_status TEXT NOT NULL DEFAULT 'pending' CHECK (friendship_status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user1_id, user2_id),
    CHECK (user1_id < user2_id)
);

CREATE TABLE IF NOT EXISTS public.favorite_gyms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, gym_id)
);

-- ========================================
-- 9. ビュー作成
-- ========================================
CREATE OR REPLACE VIEW user_profile_stats AS
SELECT 
  p.id as user_id,
  p.username,
  p.display_name,
  p.bio,
  p.avatar_url,
  p.location,
  p.is_verified,
  p.joined_date as joined_at,
  -- ワークアウト統計
  COALESCE(workout_stats.workout_count, 0) as workout_count,
  COALESCE(workout_stats.total_sessions, 0) as total_sessions,
  
  -- ソーシャル統計
  COALESCE(social_stats.followers_count, 0) as followers_count,
  COALESCE(social_stats.following_count, 0) as following_count,
  COALESCE(social_stats.gym_friends_count, 0) as gym_friends_count,
  
  -- 投稿統計
  COALESCE(post_stats.posts_count, 0) as posts_count,
  COALESCE(post_stats.total_likes, 0) as total_likes,
  
  -- 達成統計
  COALESCE(achievement_stats.achievements_count, 0) as achievements_count,
  COALESCE(favorite_stats.favorite_gyms_count, 0) as favorite_gyms_count,
  
  p.created_at,
  p.updated_at
FROM profiles p

-- ワークアウト統計
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as workout_count,
    COUNT(DISTINCT DATE(started_at)) as total_sessions
  FROM workout_sessions 
  GROUP BY user_id
) workout_stats ON p.id = workout_stats.user_id

-- ソーシャル統計
LEFT JOIN (
  SELECT 
    p.id as user_id,
    COALESCE(followers.count, 0) as followers_count,
    COALESCE(following.count, 0) as following_count,
    COALESCE(gym_friends.count, 0) as gym_friends_count
  FROM profiles p
  LEFT JOIN (
    SELECT following_id, COUNT(*) as count
    FROM follows GROUP BY following_id
  ) followers ON p.id = followers.following_id
  LEFT JOIN (
    SELECT follower_id, COUNT(*) as count
    FROM follows GROUP BY follower_id
  ) following ON p.id = following.follower_id
  LEFT JOIN (
    SELECT 
      user_id,
      COUNT(*) as count
    FROM (
      SELECT user1_id as user_id FROM gym_friends WHERE friendship_status = 'accepted'
      UNION ALL
      SELECT user2_id as user_id FROM gym_friends WHERE friendship_status = 'accepted'
    ) gym_friend_users
    GROUP BY user_id
  ) gym_friends ON p.id = gym_friends.user_id
) social_stats ON p.id = social_stats.user_id

-- 投稿統計
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as posts_count,
    SUM(likes_count) as total_likes
  FROM gym_posts 
  WHERE is_public = true
  GROUP BY user_id
) post_stats ON p.id = post_stats.user_id

-- 達成統計
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as achievements_count
  FROM achievements
  GROUP BY user_id
) achievement_stats ON p.id = achievement_stats.user_id

-- お気に入り統計
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as favorite_gyms_count
  FROM favorite_gyms
  GROUP BY user_id
) favorite_stats ON p.id = favorite_stats.user_id;

-- ========================================
-- 10. インデックス作成
-- ========================================
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_started_at ON workout_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_session_id ON workout_exercises(workout_session_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_user_id ON personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_posts_user_id ON gym_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_posts_created_at ON gym_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_gym_friends_user1_id ON gym_friends(user1_id);
CREATE INDEX IF NOT EXISTS idx_gym_friends_user2_id ON gym_friends(user2_id);
CREATE INDEX IF NOT EXISTS idx_favorite_gyms_user_id ON favorite_gyms(user_id);

-- ========================================
-- 11. 筋トレマニア太郎テストデータ投入
-- ========================================

-- プロファイル作成
INSERT INTO public.profiles (
  id, 
  username, 
  display_name, 
  bio, 
  avatar_url, 
  location, 
  training_frequency,
  is_verified,
  is_public, 
  joined_date,
  created_at, 
  updated_at
) VALUES (
  'mock-user-id',
  'muscle_taro',
  '筋トレマニア太郎',
  '筋トレ歴5年｜ベンチプレス115kg｜スクワット150kg｜デッドリフト180kg｜ジムで最高の一日を',
  '/muscle-taro-avatar.svg',
  '東京',
  '週5-6回',
  true,
  true,
  '2023-04-15 10:00:00',
  '2023-04-15 10:00:00',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url,
  location = EXCLUDED.location,
  training_frequency = EXCLUDED.training_frequency,
  is_verified = EXCLUDED.is_verified,
  updated_at = NOW();

-- ジム投入
INSERT INTO public.gyms (
  id, name, area, address, latitude, longitude, 
  phone, business_hours, facilities, day_pass_fee, 
  is_24_hours, has_parking, has_shower, has_locker, 
  rating, total_reviews, description, created_at
) VALUES 
  ('gym-shibuya-01', 'ハンマーストレングス渋谷', '渋谷', '東京都渋谷区神南1-20-17', 35.6595, 139.7004, 
   '03-1234-5678', '{"monday": "6:00-24:00", "tuesday": "6:00-24:00", "wednesday": "6:00-24:00", "thursday": "6:00-24:00", "friday": "6:00-24:00", "saturday": "8:00-22:00", "sunday": "8:00-22:00"}', 
   '["フリーウェイト", "マシン", "カーディオ", "スタジオ"]', 2500, 
   false, true, true, true, 
   4.3, 234, 'プロフェッショナル向けの本格的なトレーニング施設', '2023-01-15 10:00:00'),
  ('gym-shinjuku-01', 'ROGUEクロストレーニング新宿', '新宿', '東京都新宿区西新宿1-1-3', 35.6896, 139.6995, 
   '03-2345-6789', '{"monday": "24時間", "tuesday": "24時間", "wednesday": "24時間", "thursday": "24時間", "friday": "24時間", "saturday": "24時間", "sunday": "24時間"}', 
   '["クロスフィット", "フリーウェイト", "ファンクショナル"]', 3000, 
   true, true, true, true, 
   4.5, 189, 'クロスフィット専門の最新設備を完備', '2023-02-01 14:30:00'),
  ('gym-ginza-01', 'プレミアムフィットネス銀座', '銀座', '東京都中央区銀座4-1-1', 35.6718, 139.7640, 
   '03-3456-7890', '{"monday": "7:00-23:00", "tuesday": "7:00-23:00", "wednesday": "7:00-23:00", "thursday": "7:00-23:00", "friday": "7:00-23:00", "saturday": "9:00-21:00", "sunday": "9:00-21:00"}', 
   '["プール", "サウナ", "マシン", "パーソナル"]', 4000, 
   false, true, true, true, 
   4.7, 456, '高級感あふれる都心のプレミアムジム', '2023-01-20 11:15:00')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  area = EXCLUDED.area,
  address = EXCLUDED.address,
  description = EXCLUDED.description,
  updated_at = NOW();

-- パーソナルレコード投入
INSERT INTO public.personal_records (
  id, user_id, exercise_name, record_type, weight, reps, achieved_at, created_at
) VALUES 
  (gen_random_uuid(), 'mock-user-id', 'ベンチプレス', '1RM', 120, 1, '2023-12-15 18:30:00', '2023-12-15 18:30:00'),
  (gen_random_uuid(), 'mock-user-id', 'スクワット', '3RM', 130, 3, '2023-11-20 19:00:00', '2023-11-20 19:00:00'),
  (gen_random_uuid(), 'mock-user-id', 'デッドリフト', '1RM', 150, 1, '2023-10-10 17:45:00', '2023-10-10 17:45:00'),
  (gen_random_uuid(), 'mock-user-id', 'ショルダープレス', '8RM', 60, 8, '2023-09-25 18:15:00', '2023-09-25 18:15:00'),
  (gen_random_uuid(), 'mock-user-id', 'バーベルロウ', '6RM', 90, 6, '2023-08-30 19:30:00', '2023-08-30 19:30:00')
ON CONFLICT (user_id, exercise_name, record_type) DO UPDATE SET
  weight = EXCLUDED.weight,
  reps = EXCLUDED.reps,
  achieved_at = EXCLUDED.achieved_at;

-- 達成記録投入
INSERT INTO public.achievements (
  id, user_id, title, description, achievement_type, badge_icon, earned_at, created_at
) VALUES 
  (gen_random_uuid(), 'mock-user-id', '初回記録', '初めてのワークアウトセッションを完了', 'milestone', '🏆', '2023-06-01 20:00:00', '2023-06-01 20:00:00'),
  (gen_random_uuid(), 'mock-user-id', '100日連続ジム通い', '100日間連続でトレーニング', 'streak', '🔥', '2023-08-15 19:30:00', '2023-08-15 19:30:00'),
  (gen_random_uuid(), 'mock-user-id', 'ジム新人100突破', 'ジム利用回数が100回を突破', 'milestone', '🎯', '2023-10-20 16:00:00', '2023-10-20 16:00:00'),
  (gen_random_uuid(), 'mock-user-id', 'ベンチプレス100kg達成', 'ベンチプレス100kg突破', 'personal_record', '💪', '2023-12-01 18:00:00', '2023-12-01 18:00:00')
ON CONFLICT DO NOTHING;

-- お気に入りジム
INSERT INTO public.favorite_gyms (
  id, user_id, gym_id, created_at
) VALUES 
  (gen_random_uuid(), 'mock-user-id', 'gym-shibuya-01', '2023-06-10 10:30:00'),
  (gen_random_uuid(), 'mock-user-id', 'gym-shinjuku-01', '2023-07-15 14:20:00'),
  (gen_random_uuid(), 'mock-user-id', 'gym-ginza-01', '2023-08-20 16:45:00')
ON CONFLICT (user_id, gym_id) DO NOTHING;

-- ワークアウトセッション（最近の分）
INSERT INTO public.workout_sessions (
  id, user_id, gym_id, started_at, ended_at, total_weight_lifted, created_at
) VALUES 
  ('session-1', 'mock-user-id', 'gym-shibuya-01', '2024-01-05 18:00:00', '2024-01-05 19:30:00', 2750, '2024-01-05 19:30:00'),
  ('session-2', 'mock-user-id', 'gym-shinjuku-01', '2024-01-03 19:00:00', '2024-01-03 20:15:00', 3200, '2024-01-03 20:15:00'),
  ('session-3', 'mock-user-id', 'gym-shibuya-01', '2024-01-01 17:00:00', '2024-01-01 18:45:00', 2900, '2024-01-01 18:45:00')
ON CONFLICT (id) DO UPDATE SET
  ended_at = EXCLUDED.ended_at,
  total_weight_lifted = EXCLUDED.total_weight_lifted;

-- ワークアウトエクササイズ
INSERT INTO public.workout_exercises (
  id, workout_session_id, exercise_name, sets, reps, weight, created_at
) VALUES 
  (gen_random_uuid(), 'session-1', 'ベンチプレス', 3, ARRAY[5, 4, 3], ARRAY[115, 115, 115], '2024-01-05 18:30:00'),
  (gen_random_uuid(), 'session-1', 'インクラインプレス', 3, ARRAY[8, 7, 6], ARRAY[85, 85, 85], '2024-01-05 19:00:00'),
  (gen_random_uuid(), 'session-2', 'デッドリフト', 3, ARRAY[3, 2, 1], ARRAY[140, 140, 140], '2024-01-03 19:30:00'),
  (gen_random_uuid(), 'session-2', 'スクワット', 4, ARRAY[8, 6, 5, 4], ARRAY[120, 120, 120, 120], '2024-01-03 20:00:00'),
  (gen_random_uuid(), 'session-3', 'ベンチプレス', 4, ARRAY[6, 5, 4, 3], ARRAY[110, 110, 110, 110], '2024-01-01 17:30:00'),
  (gen_random_uuid(), 'session-3', 'ダンベルフライ', 3, ARRAY[12, 10, 8], ARRAY[32.5, 32.5, 32.5], '2024-01-01 18:00:00')
ON CONFLICT DO NOTHING;

-- ジム活投稿
INSERT INTO public.gym_posts (
  id, user_id, workout_session_id, content, training_details, 
  is_public, likes_count, comments_count, shares_count, created_at, updated_at
) VALUES 
  (gen_random_uuid(), 'mock-user-id', 'session-1',
   '今日はベンチプレス115kgが上がった！新年から絶好調💪 継続は力なり！',
   '{"exercises": [{"name": "ベンチプレス", "weight": [115], "sets": 3, "reps": [5, 4, 3]}, {"name": "インクラインプレス", "weight": [85], "sets": 3, "reps": [8, 7, 6]}]}',
   true, 15, 3, 2, '2024-01-05 19:35:00', '2024-01-05 19:35:00'),
  (gen_random_uuid(), 'mock-user-id', 'session-2',
   '新年初トレ！ROGUEでクロストレーニング🔥 体が重いけど気合で乗り切った',
   '{"exercises": [{"name": "デッドリフト", "weight": [140], "sets": 3, "reps": [3, 2, 1]}, {"name": "スクワット", "weight": [120], "sets": 4, "reps": [8, 6, 5, 4]}]}',
   true, 12, 5, 1, '2024-01-03 20:20:00', '2024-01-03 20:20:00'),
  (gen_random_uuid(), 'mock-user-id', 'session-3',
   '2024年のトレーニング開始！今年も筋トレ頑張るぞ💪 目標はベンチ120kg！',
   '{"exercises": [{"name": "ベンチプレス", "weight": [110], "sets": 4, "reps": [6, 5, 4, 3]}, {"name": "ダンベルフライ", "weight": [32.5], "sets": 3, "reps": [12, 10, 8]}]}',
   true, 8, 2, 0, '2024-01-01 18:50:00', '2024-01-01 18:50:00')
ON CONFLICT DO NOTHING;

-- RLSを無効化（開発用）
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gyms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_friends DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_gyms DISABLE ROW LEVEL SECURITY;

-- 完了メッセージ
DO $$
BEGIN
    RAISE NOTICE 'GYMTOPIA 2.0 データベースセットアップが完了しました！';
    RAISE NOTICE '✅ テーブル作成: 12テーブル';
    RAISE NOTICE '✅ ビュー作成: user_profile_stats';
    RAISE NOTICE '✅ インデックス作成: 15個';
    RAISE NOTICE '✅ テストデータ投入: 筋トレマニア太郎';
    RAISE NOTICE '✅ パーソナルレコード: 5件';
    RAISE NOTICE '✅ 達成記録: 4件';
    RAISE NOTICE '✅ ジム: 3件';
    RAISE NOTICE '✅ ワークアウトセッション: 3件';
    RAISE NOTICE '✅ ジム活投稿: 3件';
    RAISE NOTICE '';
    RAISE NOTICE 'アプリでテスト: http://localhost:3000/profile';
END $$;