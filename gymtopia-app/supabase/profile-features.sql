-- GYMTOPIA 2.0 - Profile Page Features
-- Additional tables needed for profile functionality
-- Created: 2025-09-06

-- ========================================
-- 1. SOCIAL FEATURES
-- ========================================

-- User follows/followers
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Gym friends (users who go to same gyms)
CREATE TABLE IF NOT EXISTS public.gym_friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
    friendship_status TEXT DEFAULT 'pending' CHECK (friendship_status IN ('pending', 'accepted', 'blocked')),
    initiated_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user1_id, user2_id),
    CONSTRAINT no_self_friend CHECK (user1_id != user2_id),
    CONSTRAINT ordered_users CHECK (user1_id < user2_id)
);

-- ========================================
-- 2. GYM POSTS & SOCIAL SHARING
-- ========================================

-- Gym activity posts
CREATE TABLE IF NOT EXISTS public.gym_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    workout_session_id UUID REFERENCES public.workout_sessions(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post likes
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.gym_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Post comments
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.gym_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. FAVORITE GYMS
-- ========================================

-- User's favorite gyms
CREATE TABLE IF NOT EXISTS public.favorite_gyms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, gym_id)
);

-- ========================================
-- 4. ENHANCED PROFILES TABLE
-- ========================================

-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS workout_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_workouts INTEGER DEFAULT 0;

-- ========================================
-- 5. INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_gym_friends_user1 ON public.gym_friends(user1_id);
CREATE INDEX IF NOT EXISTS idx_gym_friends_user2 ON public.gym_friends(user2_id);
CREATE INDEX IF NOT EXISTS idx_gym_friends_gym ON public.gym_friends(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_posts_user ON public.gym_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_posts_created ON public.gym_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_favorite_gyms_user ON public.favorite_gyms(user_id);

-- ========================================
-- 6. ROW LEVEL SECURITY
-- ========================================

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_gyms ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view public follows" ON public.follows
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own follows" ON public.follows
  FOR ALL USING (follower_id = auth.uid());

CREATE POLICY "Users can view their gym friends" ON public.gym_friends
  FOR ALL USING (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY "Users can view public gym posts" ON public.gym_posts
  FOR SELECT USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can manage their own posts" ON public.gym_posts
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can like any public post" ON public.post_likes
  FOR ALL USING (
    user_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.gym_posts 
      WHERE id = post_id AND (is_public = true OR user_id = auth.uid())
    )
  );

CREATE POLICY "Users can comment on public posts" ON public.post_comments
  FOR ALL USING (
    user_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.gym_posts 
      WHERE id = post_id AND (is_public = true OR user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage their favorite gyms" ON public.favorite_gyms
  FOR ALL USING (user_id = auth.uid());

-- ========================================
-- 7. FUNCTIONS FOR STATISTICS
-- ========================================

-- Function to update post counts when likes/comments change
CREATE OR REPLACE FUNCTION update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'post_likes' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE public.gym_posts 
            SET likes_count = likes_count + 1 
            WHERE id = NEW.post_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE public.gym_posts 
            SET likes_count = likes_count - 1 
            WHERE id = OLD.post_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'post_comments' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE public.gym_posts 
            SET comments_count = comments_count + 1 
            WHERE id = NEW.post_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE public.gym_posts 
            SET comments_count = comments_count - 1 
            WHERE id = OLD.post_id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updating post counts
DROP TRIGGER IF EXISTS update_likes_count ON public.post_likes;
CREATE TRIGGER update_likes_count
    AFTER INSERT OR DELETE ON public.post_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_counts();

DROP TRIGGER IF EXISTS update_comments_count ON public.post_comments;
CREATE TRIGGER update_comments_count
    AFTER INSERT OR DELETE ON public.post_comments
    FOR EACH ROW EXECUTE FUNCTION update_post_counts();

-- ========================================
-- 8. VIEWS FOR PROFILE STATISTICS
-- ========================================

-- View for user profile statistics
CREATE OR REPLACE VIEW public.user_profile_stats AS
SELECT 
    p.id as user_id,
    p.display_name,
    p.username,
    p.avatar_url,
    p.bio,
    p.location,
    p.joined_at,
    p.is_verified,
    
    -- Workout stats
    COALESCE(ws.workout_count, 0) as workout_count,
    COALESCE(p.workout_streak, 0) as workout_streak,
    
    -- Social stats
    COALESCE(followers.count, 0) as followers_count,
    COALESCE(following.count, 0) as following_count,
    COALESCE(gym_friends.count, 0) as gym_friends_count,
    
    -- Content stats
    COALESCE(posts.count, 0) as posts_count,
    COALESCE(achievements.count, 0) as achievements_count,
    COALESCE(favorite_gyms.count, 0) as favorite_gyms_count

FROM public.profiles p

LEFT JOIN (
    SELECT user_id, COUNT(*) as count
    FROM public.workout_sessions
    GROUP BY user_id
) ws ON p.id = ws.user_id

LEFT JOIN (
    SELECT following_id, COUNT(*) as count
    FROM public.follows
    GROUP BY following_id
) followers ON p.id = followers.following_id

LEFT JOIN (
    SELECT follower_id, COUNT(*) as count
    FROM public.follows
    GROUP BY follower_id
) following ON p.id = following.follower_id

LEFT JOIN (
    SELECT 
        CASE WHEN user1_id < user2_id THEN user1_id ELSE user2_id END as user_id,
        COUNT(*) as count
    FROM public.gym_friends
    WHERE friendship_status = 'accepted'
    GROUP BY user_id
    UNION ALL
    SELECT 
        CASE WHEN user1_id < user2_id THEN user2_id ELSE user1_id END as user_id,
        COUNT(*) as count
    FROM public.gym_friends
    WHERE friendship_status = 'accepted'
    GROUP BY user_id
) gym_friends ON p.id = gym_friends.user_id

LEFT JOIN (
    SELECT user_id, COUNT(*) as count
    FROM public.gym_posts
    GROUP BY user_id
) posts ON p.id = posts.user_id

LEFT JOIN (
    SELECT user_id, COUNT(*) as count
    FROM public.achievements
    GROUP BY user_id
) achievements ON p.id = achievements.user_id

LEFT JOIN (
    SELECT user_id, COUNT(*) as count
    FROM public.favorite_gyms
    GROUP BY user_id
) favorite_gyms ON p.id = favorite_gyms.user_id;

COMMIT;