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

-- 3. ワークアウトデータの正規化
-- -----------------------------------------------------

-- セット情報を別テーブルに分離
CREATE TABLE IF NOT EXISTS public.workout_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_id UUID NOT NULL REFERENCES public.workout_exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  weight_kg DECIMAL(6,2),
  reps INTEGER,
  duration_seconds INTEGER,
  distance_meters DECIMAL(8,2),
  rest_seconds INTEGER,
  rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10), -- Rate of Perceived Exertion
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(exercise_id, set_number)
);

-- 4. ジム設備の正規化
-- -----------------------------------------------------

-- 設備マスタテーブル
CREATE TABLE IF NOT EXISTS public.facility_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_category TEXT NOT NULL,
  facility_name TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(facility_category, facility_name)
);

-- ジムと設備の中間テーブル
CREATE TABLE IF NOT EXISTS public.gym_facilities (
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES public.facility_types(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  notes TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (gym_id, facility_id)
);

-- 5. 通知テーブルの改善
-- -----------------------------------------------------

-- 通知タイプの明確化
ALTER TABLE IF EXISTS public.notifications
  ADD COLUMN IF NOT EXISTS notification_category TEXT,
  ADD COLUMN IF NOT EXISTS action_url TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 通知カテゴリの制約追加
ALTER TABLE public.notifications
  ADD CONSTRAINT notification_category_check 
  CHECK (notification_category IN ('social', 'workout', 'achievement', 'system', 'gym'));

-- 6. インデックスの最適化
-- -----------------------------------------------------

-- 投稿検索の高速化
CREATE INDEX IF NOT EXISTS idx_gym_posts_created_at ON public.gym_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gym_posts_user_gym ON public.gym_posts(user_id, gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_posts_visibility ON public.gym_posts(visibility);

-- ワークアウトセッション検索の高速化
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date ON public.workout_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_gym_id ON public.workout_sessions(gym_id);

-- ジム検索の高速化
CREATE INDEX IF NOT EXISTS idx_gyms_location ON public.gyms USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_gyms_prefecture_city ON public.gyms(prefecture, city);
CREATE INDEX IF NOT EXISTS idx_gyms_name_trgm ON public.gyms USING gin(name gin_trgm_ops);

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
CREATE INDEX IF NOT EXISTS idx_personal_records_achieved_at ON public.personal_records(achieved_at DESC);

-- 7. 集計用のビュー作成
-- -----------------------------------------------------

-- ユーザー統計ビュー
CREATE OR REPLACE VIEW public.user_statistics AS
SELECT 
  u.id as user_id,
  u.username,
  COUNT(DISTINCT ws.id) as total_workouts,
  COUNT(DISTINCT DATE(ws.started_at)) as workout_days,
  COUNT(DISTINCT gp.id) as total_posts,
  COUNT(DISTINCT f1.following_id) as following_count,
  COUNT(DISTINCT f2.follower_id) as follower_count,
  COUNT(DISTINCT a.id) as achievement_count,
  MAX(ws.started_at) as last_workout_at
FROM public.users u
LEFT JOIN public.workout_sessions ws ON u.id = ws.user_id
LEFT JOIN public.gym_posts gp ON u.id = gp.user_id
LEFT JOIN public.follows f1 ON u.id = f1.follower_id
LEFT JOIN public.follows f2 ON u.id = f2.following_id
LEFT JOIN public.achievements a ON u.id = a.user_id
GROUP BY u.id, u.username;

-- ジム統計ビュー
CREATE OR REPLACE VIEW public.gym_statistics AS
SELECT 
  g.id as gym_id,
  g.name as gym_name,
  COUNT(DISTINCT gr.id) as review_count,
  AVG(gr.rating) as average_rating,
  COUNT(DISTINCT ws.user_id) as unique_visitors,
  COUNT(DISTINCT gp.id) as post_count,
  COUNT(DISTINCT fg.user_id) as favorite_count
FROM public.gyms g
LEFT JOIN public.gym_reviews gr ON g.id = gr.gym_id
LEFT JOIN public.workout_sessions ws ON g.id = ws.gym_id
LEFT JOIN public.gym_posts gp ON g.id = gp.gym_id
LEFT JOIN public.favorite_gyms fg ON g.id = fg.gym_id
GROUP BY g.id, g.name;

-- 8. RLSポリシーの設定
-- -----------------------------------------------------

-- アチーブメントのRLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY achievements_select ON public.achievements
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users u
      LEFT JOIN public.user_profiles up ON u.id = up.user_id
      WHERE u.id = achievements.user_id
      AND (up.profile_visibility = 'public' OR up.profile_visibility IS NULL)
    )
  );

CREATE POLICY achievements_insert ON public.achievements
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- パーソナルレコードのRLS
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY personal_records_select ON public.personal_records
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = personal_records.user_id
      AND up.show_stats = true
      AND (up.profile_visibility = 'public' OR
           (up.profile_visibility = 'friends' AND EXISTS (
             SELECT 1 FROM public.follows
             WHERE follower_id = auth.uid() AND following_id = personal_records.user_id
           )))
    )
  );

CREATE POLICY personal_records_insert ON public.personal_records
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY personal_records_update ON public.personal_records
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY personal_records_delete ON public.personal_records
  FOR DELETE USING (user_id = auth.uid());

-- ワークアウトセットのRLS
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY workout_sets_all ON public.workout_sets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workout_exercises we
      JOIN public.workout_sessions ws ON we.session_id = ws.id
      WHERE we.id = workout_sets.exercise_id
      AND ws.user_id = auth.uid()
    )
  );

-- 9. トリガーの追加
-- -----------------------------------------------------

-- パーソナルレコードのupdated_atトリガー
DROP TRIGGER IF EXISTS update_personal_records_updated_at ON public.personal_records;
CREATE TRIGGER update_personal_records_updated_at
  BEFORE UPDATE ON public.personal_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- アチーブメント達成時の通知トリガー
CREATE OR REPLACE FUNCTION public.notify_achievement_earned()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    notification_category,
    title,
    message,
    related_user_id,
    metadata
  ) VALUES (
    NEW.user_id,
    'achievement_earned',
    'achievement',
    '新しいアチーブメントを獲得！',
    NEW.achievement_name || 'を達成しました！',
    NEW.user_id,
    jsonb_build_object(
      'achievement_id', NEW.id,
      'achievement_type', NEW.achievement_type,
      'badge_icon', NEW.badge_icon
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_achievement_earned ON public.achievements;
CREATE TRIGGER on_achievement_earned
  AFTER INSERT ON public.achievements
  FOR EACH ROW EXECUTE FUNCTION public.notify_achievement_earned();

-- 10. 初期データの投入
-- -----------------------------------------------------

-- 基本的な設備タイプの追加
INSERT INTO public.facility_types (facility_category, facility_name, icon) VALUES
  ('cardio', 'ランニングマシン', '🏃'),
  ('cardio', 'エアロバイク', '🚴'),
  ('cardio', 'クロストレーナー', '🏃‍♀️'),
  ('strength', 'フリーウェイトエリア', '💪'),
  ('strength', 'マシンエリア', '🏋️'),
  ('strength', 'パワーラック', '🏋️‍♂️'),
  ('amenity', '更衣室', '👔'),
  ('amenity', 'シャワー', '🚿'),
  ('amenity', 'サウナ', '🧖'),
  ('amenity', 'プール', '🏊'),
  ('amenity', '駐車場', '🚗'),
  ('service', 'パーソナルトレーニング', '👨‍🏫'),
  ('service', 'グループレッスン', '👥'),
  ('service', '24時間営業', '🕐')
ON CONFLICT (facility_category, facility_name) DO NOTHING;

-- =====================================================
-- 実行完了メッセージ
-- =====================================================
-- Migration completed successfully!
-- Tables renamed: posts→gym_posts, likes→post_likes, comments→post_comments
-- New tables added: achievements, personal_records, workout_sets, facility_types, gym_facilities
-- Indexes and RLS policies configured
-- Initial facility types data inserted