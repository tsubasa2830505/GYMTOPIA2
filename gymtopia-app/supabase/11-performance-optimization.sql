-- =====================================================
-- GYMTOPIA 2.0 - パフォーマンス最適化
-- =====================================================

-- 1. 重複インデックスの削除
-- -----------------------------------------------------
-- gym_postsの重複インデックスを削除
DROP INDEX IF EXISTS public.idx_gym_posts_user_id;  -- idx_gym_posts_userと重複
DROP INDEX IF EXISTS public.idx_gym_posts_gym_id;   -- idx_gym_posts_user_gymでカバー

-- post_likesの重複インデックスを削除  
DROP INDEX IF EXISTS public.idx_post_likes_post;    -- idx_post_likes_post_idと重複
DROP INDEX IF EXISTS public.idx_post_likes_user;    -- idx_post_likes_user_idと重複

-- 2. VACUUM処理でデッドタプルをクリーンアップ
-- -----------------------------------------------------
-- デッドタプル率が高いテーブルをVACUUM
VACUUM ANALYZE public.users;       -- 387.50% dead ratio
VACUUM ANALYZE public.muscle_groups; -- 116.67% dead ratio  
VACUUM ANALYZE public.gym_posts;   -- 40.00% dead ratio

-- 3. 新規パフォーマンス最適化インデックス
-- -----------------------------------------------------

-- フィード取得の最適化（visibility + created_at）
DROP INDEX IF EXISTS idx_posts_visibility;
CREATE INDEX idx_gym_posts_feed 
  ON public.gym_posts(visibility, created_at DESC) 
  WHERE visibility = 'public';

-- いいね存在チェックの高速化（カバリングインデックス）
CREATE INDEX IF NOT EXISTS idx_post_likes_check 
  ON public.post_likes(post_id, user_id);

-- ジム検索の最適化（部分インデックス）
CREATE INDEX IF NOT EXISTS idx_gyms_active 
  ON public.gyms(prefecture, city, name) 
  WHERE status = 'active' AND verified = true;

-- フォロー関係チェックの高速化
CREATE INDEX IF NOT EXISTS idx_follows_check 
  ON public.follows(follower_id, following_id);

-- 4. マテリアライズドビューの作成
-- -----------------------------------------------------

-- フィード用の高速ビュー（人気投稿）
CREATE MATERIALIZED VIEW IF NOT EXISTS public.popular_posts AS
SELECT 
  gp.*,
  COUNT(DISTINCT pl.user_id) as like_count,
  COUNT(DISTINCT pc.id) as comment_count,
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
CREATE MATERIALIZED VIEW IF NOT EXISTS public.user_stats_cached AS
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

-- インデックス追加
CREATE UNIQUE INDEX idx_user_stats_cached_user 
  ON public.user_stats_cached(user_id);

-- 5. 関数インデックスの作成
-- -----------------------------------------------------

-- ジム名の検索最適化（大文字小文字を無視）
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_gyms_name_lower_trgm 
  ON public.gyms USING gin(LOWER(name) gin_trgm_ops);

-- ユーザー名検索の最適化
CREATE INDEX IF NOT EXISTS idx_users_username_lower 
  ON public.users(LOWER(username));

-- 6. パーティショニングの準備（将来の拡張用）
-- -----------------------------------------------------

-- 大量データ対応用のパーティションテーブル例（コメントアウト）
/*
-- 月別パーティション用の投稿テーブル
CREATE TABLE public.gym_posts_partitioned (
  LIKE public.gym_posts INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- 自動パーティション作成用の関数
CREATE OR REPLACE FUNCTION create_monthly_partition()
RETURNS void AS $$
DECLARE
  start_date date;
  end_date date;
  partition_name text;
BEGIN
  start_date := date_trunc('month', CURRENT_DATE);
  end_date := start_date + interval '1 month';
  partition_name := 'gym_posts_' || to_char(start_date, 'YYYY_MM');
  
  EXECUTE format('CREATE TABLE IF NOT EXISTS public.%I PARTITION OF public.gym_posts_partitioned FOR VALUES FROM (%L) TO (%L)',
    partition_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;
*/

-- 7. 自動更新トリガーの設定
-- -----------------------------------------------------

-- マテリアライズドビューの自動更新関数
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.popular_posts;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_stats_cached;
END;
$$ LANGUAGE plpgsql;

-- 8. パフォーマンス監視用のビュー
-- -----------------------------------------------------

CREATE OR REPLACE VIEW public.performance_monitor AS
SELECT 
  schemaname,
  tablename,
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
ORDER BY n_dead_tup DESC;

-- 9. 接続プーリング用の設定（推奨）
-- -----------------------------------------------------
/*
Supabaseダッシュボードで以下を設定：
- Connection Pooling: Transaction mode
- Pool Size: 15
- Statement Timeout: 30s
- Idle in Transaction Timeout: 60s
*/

-- 10. クエリ最適化のヒント
-- -----------------------------------------------------
COMMENT ON INDEX idx_gym_posts_feed IS 'フィード取得用の最適化インデックス';
COMMENT ON INDEX idx_post_likes_check IS 'いいね存在チェック用カバリングインデックス';
COMMENT ON INDEX idx_gyms_active IS 'アクティブなジム検索用部分インデックス';
COMMENT ON MATERIALIZED VIEW popular_posts IS '人気投稿のキャッシュ（1時間ごと更新推奨）';
COMMENT ON MATERIALIZED VIEW user_stats_cached IS 'ユーザー統計のキャッシュ（1日ごと更新推奨）';

-- =====================================================
-- 実行完了
-- =====================================================
-- ✅ 重複インデックスを削除（メモリ使用量削減）
-- ✅ 高頻度クエリ用の最適化インデックスを追加
-- ✅ マテリアライズドビューでキャッシュ機能実装
-- ✅ VACUUM処理でストレージを最適化
-- ✅ パフォーマンス監視ビューを追加