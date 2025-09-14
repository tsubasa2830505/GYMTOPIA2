-- =====================================================
-- 最終セキュリティ修正（spatial_ref_sys除く）
-- =====================================================

-- 1. マテリアライズドビューのアクセス制限
-- user_stats_cachedビューのアクセス制限
REVOKE SELECT ON user_stats_cached FROM anon;
REVOKE SELECT ON user_stats_cached FROM authenticated;

-- 管理者のみアクセス可能にする
GRANT SELECT ON user_stats_cached TO service_role;

-- popular_postsビューのアクセス制限
REVOKE SELECT ON popular_posts FROM anon;
-- 認証済みユーザーのみアクセス可能
GRANT SELECT ON popular_posts TO authenticated;

-- 2. 拡張機能用スキーマの作成
CREATE SCHEMA IF NOT EXISTS extensions;

-- 3. コメント追加
COMMENT ON SCHEMA extensions IS 'Extensions schema for security isolation';;
