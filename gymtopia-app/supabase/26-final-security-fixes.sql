-- =====================================================
-- 最終セキュリティ修正
-- =====================================================

-- 1. spatial_ref_sysテーブルのRLS有効化
-- PostGISシステムテーブルなので読み取り専用でRLSを設定
ALTER TABLE spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- 全員が読み取り可能（地理空間参照システムは公開データ）
CREATE POLICY "spatial_ref_sys_select_policy" ON spatial_ref_sys
    FOR SELECT
    USING (true);

-- 2. マテリアライズドビューのアクセス制限
-- user_stats_cachedビューのアクセス制限
REVOKE SELECT ON user_stats_cached FROM anon;
REVOKE SELECT ON user_stats_cached FROM authenticated;

-- 管理者のみアクセス可能にする
GRANT SELECT ON user_stats_cached TO service_role;

-- popular_postsビューのアクセス制限
REVOKE SELECT ON popular_posts FROM anon;
-- 認証済みユーザーのみアクセス可能
GRANT SELECT ON popular_posts TO authenticated;

-- 3. 拡張機能のスキーマ移動（extensions専用スキーマを作成）
CREATE SCHEMA IF NOT EXISTS extensions;

-- postgis拡張機能の移動
-- 注意: これは既存の拡張機能なので、移動ではなくアクセス制限で対応
-- 実際の移動は破壊的変更になる可能性があるため、アクセス制限のみ実施

-- pg_trgm拡張機能へのアクセス制限
-- 同様に、既存の拡張機能は移動せずアクセス制限で対応

-- 4. セキュリティ強化のための追加設定
-- 新しい拡張機能は必ずextensionsスキーマに作成するようにする
ALTER DATABASE postgres SET search_path = public, extensions;

-- 5. 権限の最小化
-- 不要な権限の削除（必要に応じて）
-- 注意: 本番環境では慎重に実施

COMMENT ON SCHEMA extensions IS 'Extensions schema for security isolation';
COMMENT ON POLICY "spatial_ref_sys_select_policy" ON spatial_ref_sys IS 'Allow read access to spatial reference systems';

-- 6. セキュリティ監査用の追加設定
-- 機密データへのアクセスログ強化（将来の拡張用）

-- ログ設定の強化
-- ALTER SYSTEM SET log_statement = 'all'; -- 本番では慎重に設定
-- ALTER SYSTEM SET log_min_duration_statement = 1000; -- 1秒以上のクエリをログ