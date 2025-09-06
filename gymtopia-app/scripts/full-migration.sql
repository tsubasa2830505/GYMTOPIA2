-- =============================================
-- GYMTOPIA 2.0 完全データベース移行スクリプト
-- 新しいSupabaseプロジェクト用
-- =============================================

-- 拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =============================================
-- PHASE 2: ジム情報システム
-- =============================================

-- ジム情報テーブル
CREATE TABLE IF NOT EXISTS public.gyms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    name_kana TEXT,
    description TEXT,
    
    -- 位置情報
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location GEOGRAPHY(POINT, 4326),
    address TEXT,
    prefecture TEXT,
    city TEXT,
    
    -- 営業情報
    business_hours JSONB,
    holidays TEXT,
    phone TEXT,
    website TEXT,
    
    -- 施設情報
    facilities JSONB, -- {parking: true, shower: true, locker: true, etc}
    equipment_types TEXT[], -- ['machine', 'free_weight', 'cardio']
    machine_brands TEXT[], -- ['Life Fitness', 'Technogym', etc]
    
    -- 料金情報
    price_info JSONB,
    
    -- 評価
    rating DECIMAL(2,1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    
    -- メタデータ
    status TEXT DEFAULT 'active', -- active, closed, temporary_closed
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    
    CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5)
);

-- マシン・設備テーブル
CREATE TABLE IF NOT EXISTS public.gym_equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    
    category TEXT NOT NULL, -- 'machine', 'free_weight', 'cardio'
    type TEXT NOT NULL, -- 'chest_press', 'lat_pulldown', 'squat_rack', etc
    brand TEXT,
    model TEXT,
    quantity INTEGER DEFAULT 1,
    muscle_groups TEXT[], -- ['chest', 'triceps']
    
    notes TEXT,
    image_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PHASE 3: ソーシャル機能
-- =============================================

-- 投稿テーブル
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    gym_id UUID REFERENCES public.gyms(id) ON DELETE SET NULL,
    
    content TEXT,
    images TEXT[],
    
    -- トレーニング情報
    workout_type TEXT, -- 'strength', 'cardio', 'flexibility'
    muscle_groups_trained TEXT[],
    duration_minutes INTEGER,
    
    -- 混雑状況
    crowd_status TEXT, -- 'empty', 'few', 'normal', 'crowded', 'full'
    
    -- エンゲージメント
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    
    -- メタデータ
    visibility TEXT DEFAULT 'public', -- 'public', 'friends', 'private'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_crowd_status CHECK (crowd_status IN ('empty', 'few', 'normal', 'crowded', 'full')),
    CONSTRAINT valid_visibility CHECK (visibility IN ('public', 'friends', 'private'))
);

-- いいねテーブル
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, post_id)
);

-- コメントテーブル
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- フォロー関係テーブル
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- ジム友達テーブル
CREATE TABLE IF NOT EXISTS public.gym_friends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    
    UNIQUE(user_id, friend_id),
    CHECK (user_id != friend_id),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'blocked'))
);

-- =============================================
-- PHASE 4: トレーニング記録
-- =============================================

-- ワークアウトセッション
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    gym_id UUID REFERENCES public.gyms(id) ON DELETE SET NULL,
    
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    
    notes TEXT,
    mood TEXT, -- 'great', 'good', 'normal', 'tired', 'bad'
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_mood CHECK (mood IN ('great', 'good', 'normal', 'tired', 'bad'))
);

-- エクササイズ記録
CREATE TABLE IF NOT EXISTS public.workout_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    
    exercise_name TEXT NOT NULL,
    muscle_group TEXT,
    equipment_type TEXT,
    
    sets JSON NOT NULL, -- [{reps: 10, weight: 60, rest: 60}, ...]
    
    notes TEXT,
    order_index INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PHASE 5: レビュー・評価
-- =============================================

-- ジムレビュー
CREATE TABLE IF NOT EXISTS public.gym_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    rating INTEGER NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    
    -- 詳細評価
    equipment_rating INTEGER,
    cleanliness_rating INTEGER,
    staff_rating INTEGER,
    crowd_rating INTEGER,
    
    images TEXT[],
    
    helpful_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(gym_id, user_id),
    CONSTRAINT valid_ratings CHECK (
        rating >= 1 AND rating <= 5 AND
        (equipment_rating IS NULL OR (equipment_rating >= 1 AND equipment_rating <= 5)) AND
        (cleanliness_rating IS NULL OR (cleanliness_rating >= 1 AND cleanliness_rating <= 5)) AND
        (staff_rating IS NULL OR (staff_rating >= 1 AND staff_rating <= 5)) AND
        (crowd_rating IS NULL OR (crowd_rating >= 1 AND crowd_rating <= 5))
    )
);

-- お気に入りジム
CREATE TABLE IF NOT EXISTS public.favorite_gyms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, gym_id)
);

-- =============================================
-- PHASE 6: 通知・メッセージ
-- =============================================

-- 通知テーブル
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    type TEXT NOT NULL, -- 'like', 'comment', 'follow', 'friend_request', etc
    title TEXT NOT NULL,
    message TEXT,
    
    related_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    related_post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    related_gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
    
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- インデックス
-- =============================================

-- ジム検索用
CREATE INDEX idx_gyms_location ON public.gyms USING GIST(location);
CREATE INDEX idx_gyms_prefecture_city ON public.gyms(prefecture, city);
CREATE INDEX idx_gyms_status ON public.gyms(status) WHERE status = 'active';

-- 投稿取得用
CREATE INDEX idx_posts_user_created ON public.posts(user_id, created_at DESC);
CREATE INDEX idx_posts_gym_created ON public.posts(gym_id, created_at DESC);
CREATE INDEX idx_posts_visibility ON public.posts(visibility, created_at DESC);

-- ソーシャル機能用
CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_following ON public.follows(following_id);
CREATE INDEX idx_gym_friends_user ON public.gym_friends(user_id, status);
CREATE INDEX idx_gym_friends_friend ON public.gym_friends(friend_id, status);

-- 通知用
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- =============================================
-- RLSポリシー
-- =============================================

-- ジム情報は誰でも閲覧可能
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gyms are viewable by everyone" ON public.gyms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create gyms" ON public.gyms FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Gym creators can update their gyms" ON public.gyms FOR UPDATE USING (auth.uid() = created_by);

-- 投稿のRLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public posts are viewable by everyone" ON public.posts FOR SELECT 
    USING (visibility = 'public' OR user_id = auth.uid());
CREATE POLICY "Users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- その他のテーブルのRLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- トリガー関数
-- =============================================

-- いいね数の自動更新
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_likes
    AFTER INSERT OR DELETE ON public.likes
    FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

-- コメント数の自動更新
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_comments
    AFTER INSERT OR DELETE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

-- ジムの評価自動更新
CREATE OR REPLACE FUNCTION update_gym_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.gyms 
    SET 
        rating = (SELECT AVG(rating) FROM public.gym_reviews WHERE gym_id = NEW.gym_id),
        review_count = (SELECT COUNT(*) FROM public.gym_reviews WHERE gym_id = NEW.gym_id)
    WHERE id = NEW.gym_id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gym_ratings
    AFTER INSERT OR UPDATE OR DELETE ON public.gym_reviews
    FOR EACH ROW EXECUTE FUNCTION update_gym_rating();

-- =============================================
-- 初期データ（サンプル）
-- =============================================

-- サンプルジムデータ
INSERT INTO public.gyms (name, name_kana, description, latitude, longitude, address, prefecture, city, facilities, equipment_types)
VALUES 
    ('ゴールドジム渋谷', 'ゴールドジムシブヤ', '世界最大級のフィットネスクラブ', 35.6595, 139.7004, '東京都渋谷区渋谷1-23-16', '東京都', '渋谷区', 
     '{"parking": true, "shower": true, "locker": true, "sauna": true}'::jsonb, 
     ARRAY['machine', 'free_weight', 'cardio']),
    
    ('エニタイムフィットネス新宿', 'エニタイムフィットネスシンジュク', '24時間営業のフィットネスジム', 35.6896, 139.7006, '東京都新宿区新宿3-29-1', '東京都', '新宿区',
     '{"parking": false, "shower": true, "locker": true, "sauna": false}'::jsonb,
     ARRAY['machine', 'free_weight'])
ON CONFLICT DO NOTHING;

-- 完了メッセージ
-- Migration complete! All tables and features have been set up.