-- =====================================================
-- SECURITY DEFINERビューの修正
-- SECURITY INVOKERに変更してRLSを適切に適用
-- =====================================================

-- 1. user_data_summaryビューの再作成（既存の定義を維持しつつSECURITY INVOKERに変更）
DROP VIEW IF EXISTS user_data_summary CASCADE;
CREATE VIEW user_data_summary WITH (security_invoker = true) AS
SELECT
    u.id AS user_id,
    u.username,
    u.display_name,
    COUNT(DISTINCT gp.id) AS post_count,
    COUNT(DISTINCT ws.id) AS workout_count,
    COUNT(DISTINCT f1.following_id) AS following_count,
    COUNT(DISTINCT f2.follower_id) AS follower_count,
    COUNT(DISTINCT gf.friend_id) AS friend_count,
    COUNT(DISTINCT a.id) AS achievement_count,
    COUNT(DISTINCT pr.id) AS personal_record_count,
    COUNT(DISTINCT fg.gym_id) AS favorite_gym_count,
    COUNT(DISTINCT gr.id) AS review_count,
    COUNT(DISTINCT n.id) FILTER (WHERE n.is_read = false) AS unread_notification_count
FROM users u
LEFT JOIN gym_posts gp ON u.id = gp.user_id
LEFT JOIN workout_sessions ws ON u.id = ws.user_id
LEFT JOIN follows f1 ON u.id = f1.follower_id
LEFT JOIN follows f2 ON u.id = f2.following_id
LEFT JOIN gym_friends gf ON u.id = gf.user_id AND gf.status = 'accepted'
LEFT JOIN achievements a ON u.id = a.user_id
LEFT JOIN personal_records pr ON u.id = pr.user_id
LEFT JOIN favorite_gyms fg ON u.id = fg.user_id
LEFT JOIN gym_reviews gr ON u.id = gr.user_id
LEFT JOIN notifications n ON u.id = n.user_id
GROUP BY u.id, u.username, u.display_name;

-- 2. gym_likesビューの再作成（既存の定義を維持しつつSECURITY INVOKERに変更）
DROP VIEW IF EXISTS gym_likes CASCADE;
CREATE VIEW gym_likes WITH (security_invoker = true) AS
SELECT
    id,
    user_id,
    gym_id,
    'favorite'::text AS like_type,
    created_at
FROM favorite_gyms fg;

-- 3. performance_monitorビューの再作成（既存の定義を維持しつつSECURITY INVOKERに変更）
DROP VIEW IF EXISTS performance_monitor CASCADE;
CREATE VIEW performance_monitor WITH (security_invoker = true) AS
SELECT
    schemaname,
    relname AS tablename,
    n_live_tup AS rows,
    n_dead_tup AS dead_rows,
    ROUND((n_dead_tup::numeric / NULLIF(n_live_tup, 0)::numeric) * 100, 2) AS dead_pct,
    last_vacuum,
    last_autovacuum,
    CASE
        WHEN (n_dead_tup::numeric / NULLIF(n_live_tup, 0)::numeric) > 0.2 THEN '⚠️ VACUUM推奨'
        ELSE '✅ 正常'
    END AS status
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_dead_tup DESC;

-- ビューの権限設定
GRANT SELECT ON user_data_summary TO authenticated;
GRANT SELECT ON gym_likes TO authenticated;
GRANT SELECT ON performance_monitor TO authenticated;;
