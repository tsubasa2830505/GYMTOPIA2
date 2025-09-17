-- ジムとも機能を削除してフォロー機能に統合

-- 1. まず既存のジムとも関係をフォロー関係に移行
-- accepted状態のジムともを相互フォローに変換
INSERT INTO follows (follower_id, following_id, created_at)
SELECT 
    user_id as follower_id,
    friend_id as following_id,
    created_at
FROM gym_friends
WHERE status = 'accepted'
    AND NOT EXISTS (
        SELECT 1 FROM follows f 
        WHERE f.follower_id = gym_friends.user_id 
        AND f.following_id = gym_friends.friend_id
    );

-- 逆方向のフォローも作成（相互フォロー）
INSERT INTO follows (follower_id, following_id, created_at)
SELECT 
    friend_id as follower_id,
    user_id as following_id,
    accepted_at
FROM gym_friends
WHERE status = 'accepted'
    AND accepted_at IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM follows f 
        WHERE f.follower_id = gym_friends.friend_id 
        AND f.following_id = gym_friends.user_id
    );

-- 2. gym_friends関連の通知タイプを更新
UPDATE notifications
SET type = 'follow'
WHERE type IN ('gym_friend_request', 'gym_friend_accept');

-- 3. gym_friendsテーブルを削除
DROP TABLE IF EXISTS gym_friends CASCADE;

-- 4. followsテーブルに相互フォロー確認用のビューを作成
CREATE OR REPLACE VIEW mutual_follows AS
SELECT 
    f1.follower_id as user1_id,
    f1.following_id as user2_id,
    f1.created_at as follow1_date,
    f2.created_at as follow2_date,
    GREATEST(f1.created_at, f2.created_at) as mutual_since
FROM follows f1
INNER JOIN follows f2 
    ON f1.follower_id = f2.following_id 
    AND f1.following_id = f2.follower_id
WHERE f1.follower_id < f1.following_id; -- 重複を避ける

-- 5. 統計用の関数を更新
CREATE OR REPLACE FUNCTION get_mutual_follow_count(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM mutual_follows
        WHERE user1_id = user_id OR user2_id = user_id
    );
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON VIEW mutual_follows IS '相互フォロー関係を表すビュー（旧ジムとも機能の代替）';
COMMENT ON FUNCTION get_mutual_follow_count IS 'ユーザーの相互フォロー数を取得';;
