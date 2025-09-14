-- =====================================================
-- GYMTOPIA 2.0 - Database Improvement Migration
-- 目的: アプリ機能とDB設計の整合性を改善
-- 実行順序: 08-unified-schema.sql の後に実行
-- =====================================================

-- 1. テーブル名の統一化
-- -----------------------------------------------------

-- posts → gym_posts
ALTER TABLE IF EXISTS public.posts RENAME TO gym_posts;

-- likes → post_likes  
ALTER TABLE IF EXISTS public.likes RENAME TO post_likes;

-- comments → post_comments
ALTER TABLE IF EXISTS public.comments RENAME TO post_comments;

-- 外部キー制約の名前も更新
ALTER TABLE IF EXISTS public.post_likes 
  RENAME CONSTRAINT likes_user_id_fkey TO post_likes_user_id_fkey;
ALTER TABLE IF EXISTS public.post_likes
  RENAME CONSTRAINT likes_post_id_fkey TO post_likes_post_id_fkey;

ALTER TABLE IF EXISTS public.post_comments
  RENAME CONSTRAINT comments_user_id_fkey TO post_comments_user_id_fkey;
ALTER TABLE IF EXISTS public.post_comments
  RENAME CONSTRAINT comments_post_id_fkey TO post_comments_post_id_fkey;

-- gym_postsの外部キー更新
ALTER TABLE IF EXISTS public.gym_posts
  RENAME CONSTRAINT posts_user_id_fkey TO gym_posts_user_id_fkey;
ALTER TABLE IF EXISTS public.gym_posts
  RENAME CONSTRAINT posts_gym_id_fkey TO gym_posts_gym_id_fkey;

-- 2. 不足テーブルの追加
-- -----------------------------------------------------

-- アチーブメントテーブル
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL CHECK (achievement_type IN ('streak', 'milestone', 'personal_record', 'challenge')),
  achievement_name TEXT NOT NULL,
  description TEXT,
  badge_icon TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- パーソナルレコードテーブル
CREATE TABLE IF NOT EXISTS public.personal_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  record_type TEXT NOT NULL CHECK (record_type IN ('weight', 'reps', 'duration', 'distance')),
  record_value DECIMAL(10,2) NOT NULL,
  record_unit TEXT NOT NULL,
  previous_value DECIMAL(10,2),
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  gym_id UUID REFERENCES public.gyms(id) ON DELETE SET NULL,
  workout_session_id UUID REFERENCES public.workout_sessions(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. インデックスの最適化
-- -----------------------------------------------------

-- 投稿検索の高速化
CREATE INDEX IF NOT EXISTS idx_gym_posts_created_at ON public.gym_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gym_posts_user_gym ON public.gym_posts(user_id, gym_id);

-- ワークアウトセッション検索の高速化
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date ON public.workout_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_gym_id ON public.workout_sessions(gym_id);

-- フォロー関係の高速化
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

-- いいねの高速化
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);

-- アチーブメントの高速化
CREATE INDEX IF NOT EXISTS idx_achievements_user_type ON public.achievements(user_id, achievement_type);
CREATE INDEX IF NOT EXISTS idx_achievements_earned_at ON public.achievements(earned_at DESC);

-- パーソナルレコードの高速化
CREATE INDEX IF NOT EXISTS idx_personal_records_user_exercise ON public.personal_records(user_id, exercise_name);
CREATE INDEX IF NOT EXISTS idx_personal_records_achieved_at ON public.personal_records(achieved_at DESC);;
