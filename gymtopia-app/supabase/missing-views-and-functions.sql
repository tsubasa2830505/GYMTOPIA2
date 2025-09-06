-- プロフィール用のビューと関数を作成（まだ存在しない場合）

-- user_profile_stats ビューを作成
CREATE OR REPLACE VIEW user_profile_stats AS
SELECT 
  p.id as user_id,
  p.username,
  p.display_name,
  p.bio,
  p.avatar_url,
  p.location,
  p.is_verified,
  p.joined_date as joined_at,
  -- ワークアウト統計
  COALESCE(workout_stats.workout_count, 0) as workout_count,
  COALESCE(workout_stats.total_sessions, 0) as total_sessions,
  
  -- ソーシャル統計
  COALESCE(social_stats.followers_count, 0) as followers_count,
  COALESCE(social_stats.following_count, 0) as following_count,
  COALESCE(social_stats.gym_friends_count, 0) as gym_friends_count,
  
  -- 投稿統計
  COALESCE(post_stats.posts_count, 0) as posts_count,
  COALESCE(post_stats.total_likes, 0) as total_likes,
  
  -- 達成統計
  COALESCE(achievement_stats.achievements_count, 0) as achievements_count,
  COALESCE(favorite_stats.favorite_gyms_count, 0) as favorite_gyms_count,
  
  p.created_at,
  p.updated_at
FROM profiles p

-- ワークアウト統計
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as workout_count,
    COUNT(DISTINCT DATE(started_at)) as total_sessions
  FROM workout_sessions 
  GROUP BY user_id
) workout_stats ON p.id = workout_stats.user_id

-- ソーシャル統計
LEFT JOIN (
  SELECT 
    p.id as user_id,
    COALESCE(followers.count, 0) as followers_count,
    COALESCE(following.count, 0) as following_count,
    COALESCE(gym_friends.count, 0) as gym_friends_count
  FROM profiles p
  LEFT JOIN (
    SELECT following_id, COUNT(*) as count
    FROM follows GROUP BY following_id
  ) followers ON p.id = followers.following_id
  LEFT JOIN (
    SELECT follower_id, COUNT(*) as count
    FROM follows GROUP BY follower_id
  ) following ON p.id = following.follower_id
  LEFT JOIN (
    SELECT 
      user_id,
      COUNT(*) as count
    FROM (
      SELECT user1_id as user_id FROM gym_friends WHERE friendship_status = 'accepted'
      UNION ALL
      SELECT user2_id as user_id FROM gym_friends WHERE friendship_status = 'accepted'
    ) gym_friend_users
    GROUP BY user_id
  ) gym_friends ON p.id = gym_friends.user_id
) social_stats ON p.id = social_stats.user_id

-- 投稿統計
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as posts_count,
    SUM(likes_count) as total_likes
  FROM gym_posts 
  WHERE is_public = true
  GROUP BY user_id
) post_stats ON p.id = post_stats.user_id

-- 達成統計
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as achievements_count
  FROM achievements
  GROUP BY user_id
) achievement_stats ON p.id = achievement_stats.user_id

-- お気に入り統計
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as favorite_gyms_count
  FROM favorite_gyms
  GROUP BY user_id
) favorite_stats ON p.id = favorite_stats.user_id;

-- 必要なテーブルが存在しない場合の対応
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES gym_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES gym_posts(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gym_friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    gym_id UUID REFERENCES gyms(id) ON DELETE SET NULL,
    initiated_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    friendship_status TEXT NOT NULL DEFAULT 'pending' CHECK (friendship_status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user1_id, user2_id),
    CHECK (user1_id < user2_id)
);

-- インデックス作成（存在しない場合）
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_gym_friends_user1_id ON gym_friends(user1_id);
CREATE INDEX IF NOT EXISTS idx_gym_friends_user2_id ON gym_friends(user2_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_user_id ON personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_gyms_user_id ON favorite_gyms(user_id);

RAISE NOTICE 'ビューと関数、不足テーブルの作成が完了しました';