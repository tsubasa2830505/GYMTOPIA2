-- GPS認証関連のフィールドをgym_postsテーブルに追加
ALTER TABLE gym_posts
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS checkin_id UUID REFERENCES gym_checkins(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS verification_method TEXT CHECK (verification_method IN ('check_in', 'manual', NULL)),
ADD COLUMN IF NOT EXISTS distance_from_gym INTEGER;

-- インデックスを追加してパフォーマンスを改善
CREATE INDEX IF NOT EXISTS idx_gym_posts_is_verified ON gym_posts(is_verified);
CREATE INDEX IF NOT EXISTS idx_gym_posts_checkin_id ON gym_posts(checkin_id);

-- gym_posts_with_countsビューを再作成（GPS認証フィールドを含む）
CREATE OR REPLACE VIEW gym_posts_with_counts AS
SELECT
  gp.*,
  gp.is_verified,
  gp.checkin_id,
  gp.verification_method,
  gp.distance_from_gym,
  COALESCE(lc.count, 0) AS likes_count_live,
  COALESCE(cc.count, 0) AS comments_count_live
FROM gym_posts gp
LEFT JOIN (
  SELECT post_id, COUNT(*) as count
  FROM post_likes
  GROUP BY post_id
) lc ON gp.id = lc.post_id
LEFT JOIN (
  SELECT post_id, COUNT(*) as count
  FROM post_comments
  GROUP BY post_id
) cc ON gp.id = cc.post_id;

-- 既存のチェックイン済み投稿を更新
UPDATE gym_posts gp
SET
  is_verified = true,
  verification_method = 'check_in'
FROM gym_checkins gc
WHERE gp.user_id = gc.user_id
  AND gp.gym_id = gc.gym_id
  AND gp.created_at BETWEEN gc.check_in_time AND gc.check_in_time + interval '4 hours'
  AND gp.is_verified IS NULL;