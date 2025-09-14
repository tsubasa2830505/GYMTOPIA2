-- =====================================================
-- ユーザー関連テーブルの外部キー制約修正
-- =====================================================

-- 1. gyms.created_byの削除制約を修正
-- ユーザーが削除されてもジム情報は残すようにする
ALTER TABLE public.gyms 
  DROP CONSTRAINT IF EXISTS gyms_created_by_fkey;

ALTER TABLE public.gyms 
  ADD CONSTRAINT gyms_created_by_fkey 
  FOREIGN KEY (created_by) 
  REFERENCES public.users(id) 
  ON DELETE SET NULL;

-- 2. gym_checkinsテーブルの確認と整理
-- 使用されていない場合はコメントアウト可能
-- DROP TABLE IF EXISTS public.gym_checkins CASCADE;

-- 3. 重要度の高いテーブルに複合インデックスを追加
-- ユーザーごとの検索を高速化

-- gym_friendsの双方向検索用インデックス
CREATE INDEX IF NOT EXISTS idx_gym_friends_bidirectional 
  ON public.gym_friends(user_id, friend_id, status);

-- notificationsの未読通知検索用インデックス  
CREATE INDEX IF NOT EXISTS idx_notifications_unread 
  ON public.notifications(user_id, is_read, created_at DESC);

-- workout_sessionsの統計集計用インデックス
CREATE INDEX IF NOT EXISTS idx_workout_sessions_stats 
  ON public.workout_sessions(user_id, started_at, ended_at);

-- 4. データ整合性チェック用のビュー作成
CREATE OR REPLACE VIEW public.user_data_summary AS
SELECT 
  u.id as user_id,
  u.username,
  u.display_name,
  COUNT(DISTINCT gp.id) as post_count,
  COUNT(DISTINCT ws.id) as workout_count,
  COUNT(DISTINCT f1.following_id) as following_count,
  COUNT(DISTINCT f2.follower_id) as follower_count,
  COUNT(DISTINCT gf.friend_id) as friend_count,
  COUNT(DISTINCT a.id) as achievement_count,
  COUNT(DISTINCT pr.id) as personal_record_count,
  COUNT(DISTINCT fg.gym_id) as favorite_gym_count,
  COUNT(DISTINCT gr.id) as review_count,
  COUNT(DISTINCT n.id) FILTER (WHERE n.is_read = false) as unread_notification_count
FROM public.users u
LEFT JOIN public.gym_posts gp ON u.id = gp.user_id
LEFT JOIN public.workout_sessions ws ON u.id = ws.user_id
LEFT JOIN public.follows f1 ON u.id = f1.follower_id
LEFT JOIN public.follows f2 ON u.id = f2.following_id
LEFT JOIN public.gym_friends gf ON u.id = gf.user_id AND gf.status = 'accepted'
LEFT JOIN public.achievements a ON u.id = a.user_id
LEFT JOIN public.personal_records pr ON u.id = pr.user_id
LEFT JOIN public.favorite_gyms fg ON u.id = fg.user_id
LEFT JOIN public.gym_reviews gr ON u.id = gr.user_id
LEFT JOIN public.notifications n ON u.id = n.user_id
GROUP BY u.id, u.username, u.display_name;

-- 5. 孤立データのクリーンアップ（必要に応じて実行）
-- auth.usersに存在しないユーザーIDを持つレコードを検出

/*
-- 孤立データの確認クエリ（実行前に確認）
SELECT 'user_profiles' as table_name, COUNT(*) as orphan_count
FROM public.user_profiles WHERE user_id NOT IN (SELECT id FROM public.users)
UNION ALL
SELECT 'gym_posts', COUNT(*)
FROM public.gym_posts WHERE user_id NOT IN (SELECT id FROM public.users)
UNION ALL
SELECT 'workout_sessions', COUNT(*)
FROM public.workout_sessions WHERE user_id NOT IN (SELECT id FROM public.users);
*/

-- =====================================================
-- 実行完了
-- =====================================================
-- ✅ gyms.created_byの削除制約を修正
-- ✅ パフォーマンス向上のための複合インデックスを追加
-- ✅ ユーザーデータ集計用のビューを作成