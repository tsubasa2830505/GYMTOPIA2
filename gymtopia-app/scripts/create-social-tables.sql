-- ソーシャル機能用テーブル作成

-- 投稿テーブル
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- 投稿内容
    content TEXT,
    images TEXT[], -- 画像URLの配列
    
    -- 投稿タイプ
    post_type TEXT DEFAULT 'normal', -- normal, workout, check_in, achievement
    
    -- ワークアウト投稿の場合
    workout_session_id UUID REFERENCES public.workout_sessions(id) ON DELETE SET NULL,
    
    -- チェックイン投稿の場合
    gym_id UUID REFERENCES public.gyms(id) ON DELETE SET NULL,
    checkin_id UUID REFERENCES public.gym_checkins(id) ON DELETE SET NULL,
    
    -- 達成記録の場合
    achievement_type TEXT, -- pr (personal record), milestone, goal
    achievement_data JSONB, -- {exercise: "ベンチプレス", weight: 100, reps: 1}
    
    -- プライバシー設定
    visibility TEXT DEFAULT 'public', -- public, followers, private
    
    -- 統計
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    
    -- タイムスタンプ
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_gym_id ON public.posts(gym_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON public.posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON public.posts(visibility);

-- RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are viewable based on visibility" 
ON public.posts FOR SELECT 
USING (
    visibility = 'public' OR 
    user_id = auth.uid() OR
    (visibility = 'followers' AND EXISTS (
        SELECT 1 FROM public.follows 
        WHERE follower_id = auth.uid() AND following_id = posts.user_id
    ))
);

CREATE POLICY "Users can create their own posts" 
ON public.posts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.posts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
ON public.posts FOR DELETE 
USING (auth.uid() = user_id);

-- いいねテーブル
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- ユーザーは1つの投稿に1つのいいねのみ
    CONSTRAINT unique_user_post_like UNIQUE (user_id, post_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON public.likes(created_at DESC);

-- RLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are viewable by everyone" 
ON public.likes FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own likes" 
ON public.likes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" 
ON public.likes FOR DELETE 
USING (auth.uid() = user_id);

-- コメントテーブル
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    
    content TEXT NOT NULL,
    
    -- 返信機能
    parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    
    -- 統計
    likes_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id ON public.comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at);

-- RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone" 
ON public.comments FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own comments" 
ON public.comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.comments FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.comments FOR DELETE 
USING (auth.uid() = user_id);

-- フォロー関係テーブル
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 自分自身はフォローできない
    CONSTRAINT no_self_follow CHECK (follower_id != following_id),
    -- 同じユーザーを重複フォローできない
    CONSTRAINT unique_follow UNIQUE (follower_id, following_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);

-- RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows are viewable by everyone" 
ON public.follows FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own follows" 
ON public.follows FOR INSERT 
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows" 
ON public.follows FOR DELETE 
USING (auth.uid() = follower_id);

-- ジム友達テーブル
CREATE TABLE IF NOT EXISTS public.gym_friends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- 友達関係のステータス
    status TEXT DEFAULT 'pending', -- pending, accepted, blocked
    
    -- 共通のジム
    common_gym_id UUID REFERENCES public.gyms(id) ON DELETE SET NULL,
    
    -- メタデータ
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    
    -- 自分自身と友達になれない
    CONSTRAINT no_self_friend CHECK (user_id != friend_id),
    -- 重複を防ぐ（順序を正規化）
    CONSTRAINT unique_friendship UNIQUE (
        LEAST(user_id, friend_id),
        GREATEST(user_id, friend_id)
    )
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_gym_friends_user_id ON public.gym_friends(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_friends_friend_id ON public.gym_friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_gym_friends_status ON public.gym_friends(status);
CREATE INDEX IF NOT EXISTS idx_gym_friends_common_gym_id ON public.gym_friends(common_gym_id);

-- RLS
ALTER TABLE public.gym_friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friendships" 
ON public.gym_friends FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friend requests" 
ON public.gym_friends FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friendships they're part of" 
ON public.gym_friends FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete friendships they're part of" 
ON public.gym_friends FOR DELETE 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- 通知テーブル
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- 通知タイプ
    type TEXT NOT NULL, -- like, comment, follow, friend_request, workout_milestone, achievement
    
    -- 関連エンティティ
    actor_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- 通知を発生させたユーザー
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    
    -- 通知内容
    title TEXT NOT NULL,
    message TEXT,
    data JSONB, -- 追加データ
    
    -- ステータス
    is_read BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.notifications FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
ON public.notifications FOR DELETE 
USING (auth.uid() = user_id);

-- 投稿のいいね数を更新するトリガー
CREATE OR REPLACE FUNCTION update_post_likes_count() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts
        SET likes_count = likes_count + 1
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts
        SET likes_count = GREATEST(likes_count - 1, 0)
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_post_likes_count_trigger ON public.likes;
CREATE TRIGGER update_post_likes_count_trigger
AFTER INSERT OR DELETE ON public.likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- 投稿のコメント数を更新するトリガー
CREATE OR REPLACE FUNCTION update_post_comments_count() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts
        SET comments_count = comments_count + 1
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts
        SET comments_count = GREATEST(comments_count - 1, 0)
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_post_comments_count_trigger ON public.comments;
CREATE TRIGGER update_post_comments_count_trigger
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- 通知作成関数
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT DEFAULT NULL,
    p_actor_id UUID DEFAULT NULL,
    p_post_id UUID DEFAULT NULL,
    p_comment_id UUID DEFAULT NULL,
    p_data JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO public.notifications (
        user_id, type, title, message, 
        actor_id, post_id, comment_id, data
    ) VALUES (
        p_user_id, p_type, p_title, p_message,
        p_actor_id, p_post_id, p_comment_id, p_data
    ) RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- いいね時の通知トリガー
CREATE OR REPLACE FUNCTION notify_on_like() RETURNS TRIGGER AS $$
DECLARE
    v_post_user_id UUID;
    v_liker_name TEXT;
BEGIN
    -- 投稿者のIDを取得
    SELECT user_id INTO v_post_user_id FROM public.posts WHERE id = NEW.post_id;
    
    -- 自分の投稿にいいねした場合は通知しない
    IF v_post_user_id = NEW.user_id THEN
        RETURN NEW;
    END IF;
    
    -- いいねしたユーザーの名前を取得
    SELECT display_name INTO v_liker_name FROM public.users WHERE id = NEW.user_id;
    
    -- 通知を作成
    PERFORM create_notification(
        v_post_user_id,
        'like',
        v_liker_name || 'さんがあなたの投稿にいいねしました',
        NULL,
        NEW.user_id,
        NEW.post_id,
        NULL,
        NULL
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notify_on_like_trigger ON public.likes;
CREATE TRIGGER notify_on_like_trigger
AFTER INSERT ON public.likes
FOR EACH ROW EXECUTE FUNCTION notify_on_like();

-- コメント時の通知トリガー
CREATE OR REPLACE FUNCTION notify_on_comment() RETURNS TRIGGER AS $$
DECLARE
    v_post_user_id UUID;
    v_commenter_name TEXT;
BEGIN
    -- 投稿者のIDを取得
    SELECT user_id INTO v_post_user_id FROM public.posts WHERE id = NEW.post_id;
    
    -- 自分の投稿にコメントした場合は通知しない
    IF v_post_user_id = NEW.user_id THEN
        RETURN NEW;
    END IF;
    
    -- コメントしたユーザーの名前を取得
    SELECT display_name INTO v_commenter_name FROM public.users WHERE id = NEW.user_id;
    
    -- 通知を作成
    PERFORM create_notification(
        v_post_user_id,
        'comment',
        v_commenter_name || 'さんがあなたの投稿にコメントしました',
        NEW.content,
        NEW.user_id,
        NEW.post_id,
        NEW.id,
        NULL
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notify_on_comment_trigger ON public.comments;
CREATE TRIGGER notify_on_comment_trigger
AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION notify_on_comment();

-- フォロー時の通知トリガー
CREATE OR REPLACE FUNCTION notify_on_follow() RETURNS TRIGGER AS $$
DECLARE
    v_follower_name TEXT;
BEGIN
    -- フォロワーの名前を取得
    SELECT display_name INTO v_follower_name FROM public.users WHERE id = NEW.follower_id;
    
    -- 通知を作成
    PERFORM create_notification(
        NEW.following_id,
        'follow',
        v_follower_name || 'さんがあなたをフォローしました',
        NULL,
        NEW.follower_id,
        NULL,
        NULL,
        NULL
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notify_on_follow_trigger ON public.follows;
CREATE TRIGGER notify_on_follow_trigger
AFTER INSERT ON public.follows
FOR EACH ROW EXECUTE FUNCTION notify_on_follow();