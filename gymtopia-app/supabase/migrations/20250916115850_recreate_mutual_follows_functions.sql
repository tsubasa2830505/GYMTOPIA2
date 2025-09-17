-- 既存の関数を削除
DROP FUNCTION IF EXISTS get_mutual_follow_count(UUID);
DROP FUNCTION IF EXISTS get_follower_count(UUID);
DROP FUNCTION IF EXISTS get_following_count(UUID);

-- mutual_followsビューを再作成
DROP VIEW IF EXISTS mutual_follows;
CREATE VIEW mutual_follows AS
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
WHERE f1.follower_id < f1.following_id;

-- 相互フォロー数を取得する関数
CREATE FUNCTION get_mutual_follow_count(user_id_param UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM mutual_follows
        WHERE user1_id = user_id_param OR user2_id = user_id_param
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- フォロワー数を取得する関数
CREATE FUNCTION get_follower_count(user_id_param UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM follows
        WHERE following_id = user_id_param
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- フォロー数を取得する関数
CREATE FUNCTION get_following_count(user_id_param UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM follows
        WHERE follower_id = user_id_param
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;;
