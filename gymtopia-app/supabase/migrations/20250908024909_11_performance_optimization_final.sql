-- =====================================================
-- GYMTOPIA 2.0 - パフォーマンス最適化
-- =====================================================

-- 1. 重複インデックスの削除
-- -----------------------------------------------------
DROP INDEX IF EXISTS public.idx_gym_posts_user_id;
DROP INDEX IF EXISTS public.idx_gym_posts_gym_id;
DROP INDEX IF EXISTS public.idx_post_likes_post;
DROP INDEX IF EXISTS public.idx_post_likes_user;

-- 2. 新規パフォーマンス最適化インデックス
-- -----------------------------------------------------

-- フィード取得の最適化
DROP INDEX IF EXISTS idx_posts_visibility;
CREATE INDEX IF NOT EXISTS idx_gym_posts_feed 
  ON public.gym_posts(visibility, created_at DESC) 
  WHERE visibility = 'public';

-- いいね存在チェックの高速化
CREATE INDEX IF NOT EXISTS idx_post_likes_check 
  ON public.post_likes(post_id, user_id);

-- ジム検索の最適化
CREATE INDEX IF NOT EXISTS idx_gyms_active 
  ON public.gyms(prefecture, city, name) 
  WHERE status = 'active' AND verified = true;

-- フォロー関係チェックの高速化
CREATE INDEX IF NOT EXISTS idx_follows_check 
  ON public.follows(follower_id, following_id);

-- 3. マテリアライズドビューの作成
-- -----------------------------------------------------

-- フィード用の高速ビュー（人気投稿）
DROP MATERIALIZED VIEW IF EXISTS public.popular_posts;
CREATE MATERIALIZED VIEW public.popular_posts AS
SELECT 
  gp.id,
  gp.user_id,
  gp.gym_id,
  gp.content,
  gp.images,
  gp.workout_type,
  gp.muscle_groups_trained,
  gp.duration_minutes,
  gp.crowd_status,
  gp.visibility,
  gp.created_at,
  gp.updated_at,
  COUNT(DISTINCT pl.user_id) as total_likes,
  COUNT(DISTINCT pc.id) as total_comments,
  u.username,
  u.display_name,
  u.avatar_url,
  g.name as gym_name
FROM public.gym_posts gp
LEFT JOIN public.post_likes pl ON gp.id = pl.post_id
LEFT JOIN public.post_comments pc ON gp.id = pc.post_id
LEFT JOIN public.users u ON gp.user_id = u.id
LEFT JOIN public.gyms g ON gp.gym_id = g.id
WHERE gp.visibility = 'public'
  AND gp.created_at > NOW() - INTERVAL '7 days'
GROUP BY gp.id, u.username, u.display_name, u.avatar_url, g.name
HAVING COUNT(DISTINCT pl.user_id) > 5
ORDER BY COUNT(DISTINCT pl.user_id) DESC;

-- インデックス追加
CREATE INDEX idx_popular_posts_created 
  ON public.popular_posts(created_at DESC);

-- ユーザー統計の高速化
DROP MATERIALIZED VIEW IF EXISTS public.user_stats_cached;
CREATE MATERIALIZED VIEW public.user_stats_cached AS
SELECT 
  u.id as user_id,
  u.username,
  COUNT(DISTINCT gp.id) as post_count,
  COUNT(DISTINCT ws.id) as workout_count,
  COUNT(DISTINCT f1.following_id) as following_count,
  COUNT(DISTINCT f2.follower_id) as follower_count,
  COUNT(DISTINCT a.id) as achievement_count,
  AVG(CASE WHEN ws.ended_at IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (ws.ended_at - ws.started_at))/60 
      ELSE NULL END)::INT as avg_workout_minutes,
  MAX(ws.started_at) as last_workout_at
FROM public.users u
LEFT JOIN public.gym_posts gp ON u.id = gp.user_id
LEFT JOIN public.workout_sessions ws ON u.id = ws.user_id
LEFT JOIN public.follows f1 ON u.id = f1.follower_id  
LEFT JOIN public.follows f2 ON u.id = f2.following_id
LEFT JOIN public.achievements a ON u.id = a.user_id
GROUP BY u.id, u.username;

CREATE UNIQUE INDEX idx_user_stats_cached_user 
  ON public.user_stats_cached(user_id);

-- 4. 関数インデックスの作成
-- -----------------------------------------------------

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_gyms_name_lower_trgm 
  ON public.gyms USING gin(LOWER(name) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_users_username_lower 
  ON public.users(LOWER(username));

-- 5. パフォーマンス監視用のビュー
-- -----------------------------------------------------

CREATE OR REPLACE VIEW public.performance_monitor AS
SELECT 
  schemaname,
  relname as tablename,
  n_live_tup as rows,
  n_dead_tup as dead_rows,
  ROUND(n_dead_tup::numeric / NULLIF(n_live_tup, 0) * 100, 2) as dead_pct,
  last_vacuum,
  last_autovacuum,
  CASE 
    WHEN n_dead_tup::numeric / NULLIF(n_live_tup, 0) > 0.2 THEN '⚠️ VACUUM推奨'
    ELSE '✅ 正常'
  END as status
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_dead_tup DESC;;
