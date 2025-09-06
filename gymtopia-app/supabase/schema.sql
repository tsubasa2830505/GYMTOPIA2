-- ジムトピア データベース設計
-- Supabase (PostgreSQL) 向け

-- =====================================================
-- 1. 拡張機能の有効化
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- 位置情報検索用

-- =====================================================
-- 2. 基本テーブル
-- =====================================================

-- ユーザー管理（Supabase Authと連携）
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  personal_records JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ジム情報
CREATE TABLE gyms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  name_kana VARCHAR(200), -- カナ検索用
  address TEXT NOT NULL,
  location GEOGRAPHY(POINT), -- PostGIS型で位置情報
  phone VARCHAR(20),
  email VARCHAR(255),
  website TEXT,
  
  -- 営業時間（JSON形式で柔軟に保存）
  operating_hours JSONB DEFAULT '{}',
  -- 例: {"monday": {"open": "06:00", "close": "23:00"}, "tuesday": {...}}
  
  -- 料金情報
  pricing JSONB DEFAULT '{}',
  -- 例: {"monthly": 8000, "daily": 1000, "visitor": 2500}
  
  -- 施設情報
  facilities JSONB DEFAULT '{}',
  -- 例: {"machines": ["chest_press", "lat_pulldown"], "free_weights": {...}}
  
  -- メタ情報
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ジム活投稿
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  
  -- 投稿内容
  content TEXT NOT NULL,
  crowd_status VARCHAR(20) CHECK (crowd_status IN ('empty', 'normal', 'crowded')),
  
  -- トレーニング詳細
  training_details JSONB DEFAULT '{}',
  -- 例: {"exercises": [...], "total_sets": 15, "duration": 90}
  
  -- 画像
  image_urls TEXT[] DEFAULT '{}',
  
  -- エンゲージメント数（非正規化でパフォーマンス向上）
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. リレーションテーブル
-- =====================================================

-- いいね
CREATE TABLE likes (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- コメント
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- フォロー関係
CREATE TABLE follows (
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- ジム友
CREATE TABLE gym_friends (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- お気に入りジム
CREATE TABLE favorite_gyms (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, gym_id)
);

-- ユーザーとジムの関係（メンバーシップ）
CREATE TABLE user_gym_memberships (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  membership_type VARCHAR(50), -- 'regular', 'visitor', 'trial'
  joined_at DATE DEFAULT CURRENT_DATE,
  expires_at DATE,
  is_active BOOLEAN DEFAULT true,
  PRIMARY KEY (user_id, gym_id)
);

-- =====================================================
-- 4. パフォーマンス用インデックス
-- =====================================================

-- 頻繁に使用されるクエリ用のインデックス
CREATE INDEX idx_posts_gym_created ON posts(gym_id, created_at DESC);
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_comments_post ON comments(post_id, created_at DESC);
CREATE INDEX idx_likes_post ON likes(post_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_gyms_location ON gyms USING GIST(location);
CREATE INDEX idx_gyms_name ON gyms(name);

-- =====================================================
-- 5. ビュー（よく使うクエリを簡単に）
-- =====================================================

-- フィード用ビュー
CREATE VIEW feed_posts AS
SELECT 
  p.*,
  pr.username,
  pr.display_name,
  pr.avatar_url,
  g.name as gym_name,
  g.address as gym_address,
  COALESCE(l.likes, 0) as total_likes,
  COALESCE(c.comments, 0) as total_comments
FROM posts p
JOIN profiles pr ON p.user_id = pr.id
JOIN gyms g ON p.gym_id = g.id
LEFT JOIN (
  SELECT post_id, COUNT(*) as likes 
  FROM likes 
  GROUP BY post_id
) l ON p.id = l.post_id
LEFT JOIN (
  SELECT post_id, COUNT(*) as comments 
  FROM comments 
  GROUP BY post_id
) c ON p.id = c.post_id;

-- =====================================================
-- 6. Row Level Security (RLS) ポリシー
-- =====================================================

-- プロファイルのRLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "プロファイルは誰でも閲覧可能" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "ユーザーは自分のプロファイルを更新可能" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 投稿のRLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "投稿は誰でも閲覧可能" ON posts
  FOR SELECT USING (true);

CREATE POLICY "認証済みユーザーは投稿作成可能" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の投稿を編集可能" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の投稿を削除可能" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- いいねのRLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "いいねは誰でも閲覧可能" ON likes
  FOR SELECT USING (true);

CREATE POLICY "認証済みユーザーはいいね可能" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のいいねを削除可能" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 7. トリガー関数（自動処理）
-- =====================================================

-- 更新時刻の自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- いいね数の自動更新
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_likes_count
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- コメント数の自動更新
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_comments_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_comments_count();

-- =====================================================
-- 8. ストアドプロシージャ（複雑な処理）
-- =====================================================

-- 近くのジムを検索
CREATE OR REPLACE FUNCTION find_nearby_gyms(
  user_lat FLOAT,
  user_lng FLOAT,
  radius_km INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  address TEXT,
  distance_km FLOAT,
  operating_hours JSONB,
  facilities JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    g.name,
    g.address,
    ST_Distance(g.location, ST_MakePoint(user_lng, user_lat)::geography) / 1000 as distance_km,
    g.operating_hours,
    g.facilities
  FROM gyms g
  WHERE ST_DWithin(
    g.location,
    ST_MakePoint(user_lng, user_lat)::geography,
    radius_km * 1000
  )
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- フィード取得（フォロー中、ジム友、同じジム）
CREATE OR REPLACE FUNCTION get_personalized_feed(
  current_user_id UUID,
  feed_type VARCHAR DEFAULT 'all',
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  post_id UUID,
  user_id UUID,
  username VARCHAR,
  display_name VARCHAR,
  avatar_url TEXT,
  gym_id UUID,
  gym_name VARCHAR,
  content TEXT,
  crowd_status VARCHAR,
  training_details JSONB,
  image_urls TEXT[],
  likes_count INTEGER,
  comments_count INTEGER,
  is_liked BOOLEAN,
  is_gym_friend BOOLEAN,
  is_following BOOLEAN,
  is_same_gym BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as post_id,
    p.user_id,
    pr.username,
    pr.display_name,
    pr.avatar_url,
    p.gym_id,
    g.name as gym_name,
    p.content,
    p.crowd_status,
    p.training_details,
    p.image_urls,
    p.likes_count,
    p.comments_count,
    EXISTS(SELECT 1 FROM likes WHERE user_id = current_user_id AND post_id = p.id) as is_liked,
    EXISTS(SELECT 1 FROM gym_friends WHERE user_id = current_user_id AND friend_id = p.user_id AND status = 'accepted') as is_gym_friend,
    EXISTS(SELECT 1 FROM follows WHERE follower_id = current_user_id AND following_id = p.user_id) as is_following,
    EXISTS(SELECT 1 FROM user_gym_memberships ugm1 
           JOIN user_gym_memberships ugm2 ON ugm1.gym_id = ugm2.gym_id 
           WHERE ugm1.user_id = current_user_id AND ugm2.user_id = p.user_id) as is_same_gym,
    p.created_at
  FROM posts p
  JOIN profiles pr ON p.user_id = pr.id
  JOIN gyms g ON p.gym_id = g.id
  WHERE 
    CASE 
      WHEN feed_type = 'following' THEN 
        EXISTS(SELECT 1 FROM follows WHERE follower_id = current_user_id AND following_id = p.user_id)
      WHEN feed_type = 'gym_friends' THEN 
        EXISTS(SELECT 1 FROM gym_friends WHERE user_id = current_user_id AND friend_id = p.user_id AND status = 'accepted')
      WHEN feed_type = 'same_gym' THEN 
        EXISTS(SELECT 1 FROM user_gym_memberships ugm1 
               JOIN user_gym_memberships ugm2 ON ugm1.gym_id = ugm2.gym_id 
               WHERE ugm1.user_id = current_user_id AND ugm2.user_id = p.user_id)
      ELSE true
    END
  ORDER BY p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;