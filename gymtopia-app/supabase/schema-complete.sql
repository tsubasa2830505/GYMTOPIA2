-- GYMTOPIA 2.0 Complete Database Schema
-- Supabase (PostgreSQL) Database Design
-- Created: 2025-01-06

-- Ensure UUID functions are available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- 1. USERS & AUTHENTICATION
-- ========================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    location TEXT,
    training_frequency TEXT,
    joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. GYMS & LOCATIONS
-- ========================================

-- Gyms table
CREATE TABLE IF NOT EXISTS public.gyms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    area TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone TEXT,
    website TEXT,
    business_hours JSONB,
    facilities JSONB,
    membership_fee JSONB,
    day_pass_fee INTEGER,
    is_24_hours BOOLEAN DEFAULT false,
    has_parking BOOLEAN DEFAULT false,
    has_shower BOOLEAN DEFAULT true,
    has_locker BOOLEAN DEFAULT true,
    rating DECIMAL(2, 1) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for location-based queries
CREATE INDEX idx_gyms_location ON public.gyms(latitude, longitude);
CREATE INDEX idx_gyms_area ON public.gyms(area);

-- ========================================
-- 2.5 POSTS & SOCIAL (App compatibility)
-- ========================================

-- Posts (gym activity feed)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    crowd_status TEXT CHECK (crowd_status IN ('empty', 'normal', 'crowded')),
    training_details JSONB DEFAULT '{}',
    image_urls TEXT[] DEFAULT '{}',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes on posts
CREATE TABLE IF NOT EXISTS public.likes (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id)
);

-- Comments on posts
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorite gyms (aka Ikitai)
CREATE TABLE IF NOT EXISTS public.favorite_gyms (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, gym_id)
);

-- User memberships in gyms (for same-gym checks)
CREATE TABLE IF NOT EXISTS public.user_gym_memberships (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
    membership_type TEXT,
    joined_at DATE DEFAULT CURRENT_DATE,
    expires_at DATE,
    is_active BOOLEAN DEFAULT true,
    PRIMARY KEY (user_id, gym_id)
);

-- ========================================
-- 3. EQUIPMENT & MACHINES
-- ========================================

-- Equipment categories
CREATE TABLE IF NOT EXISTS public.equipment_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0
);

-- Equipment/Machines table
CREATE TABLE IF NOT EXISTS public.equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.equipment_categories(id),
    name TEXT NOT NULL,
    maker TEXT NOT NULL,
    model TEXT,
    target_muscles TEXT[],
    type TEXT, -- 'machine', 'free_weight', 'cardio'
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gym equipment inventory
CREATE TABLE IF NOT EXISTS public.gym_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES public.equipment(id),
    count INTEGER DEFAULT 1,
    max_weight INTEGER,
    condition TEXT CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(gym_id, equipment_id)
);

-- ========================================
-- 4. MUSCLE GROUPS & PARTS
-- ========================================

-- Muscle groups table
CREATE TABLE IF NOT EXISTS public.muscle_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    parts TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default muscle groups
INSERT INTO public.muscle_groups (category, name, parts) VALUES
('chest', '胸', ARRAY['大胸筋上部', '大胸筋中部', '大胸筋下部', '小胸筋']),
('back', '背中', ARRAY['広背筋', '僧帽筋上部', '僧帽筋中部', '僧帽筋下部', '脊柱起立筋', '大円筋', '小円筋', 'ローテーターカフ']),
('shoulders', '肩', ARRAY['三角筋前部', '三角筋中部', '三角筋後部']),
('arms', '腕', ARRAY['上腕二頭筋', '上腕三頭筋', '前腕屈筋群', '前腕伸筋群']),
('legs', '脚', ARRAY['大腿四頭筋', 'ハムストリングス', '内転筋', '外転筋', '大臀筋', '中臀筋', '腓腹筋', 'ヒラメ筋']),
('core', '体幹', ARRAY['腹直筋', '外腹斜筋', '内腹斜筋', '腹横筋']);

-- ========================================
-- 5. SOCIAL FEATURES
-- ========================================

-- Follows table
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Gym likes/Ikitai
CREATE TABLE IF NOT EXISTS public.gym_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, gym_id)
);

-- ========================================
-- 6. REVIEWS & RATINGS
-- ========================================

-- Gym reviews
CREATE TABLE IF NOT EXISTS public.gym_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT NOT NULL,
    visit_date DATE,
    images TEXT[],
    is_verified BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review responses from gym owners
CREATE TABLE IF NOT EXISTS public.review_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES public.gym_reviews(id) ON DELETE CASCADE,
    responder_id UUID REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 7. WORKOUTS & TRAINING
-- ========================================

-- Workout sessions
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    gym_id UUID REFERENCES public.gyms(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    total_weight_lifted INTEGER DEFAULT 0,
    exercises_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises in workout
CREATE TABLE IF NOT EXISTS public.workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES public.equipment(id),
    exercise_name TEXT NOT NULL,
    sets INTEGER,
    reps INTEGER[],
    weight DECIMAL[],
    rest_seconds INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personal records
CREATE TABLE IF NOT EXISTS public.personal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    record_type TEXT CHECK (record_type IN ('1rm', '3rm', '5rm', '10rm', 'max_reps')),
    weight DECIMAL,
    reps INTEGER,
    achieved_at DATE DEFAULT CURRENT_DATE,
    gym_id UUID REFERENCES public.gyms(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, exercise_name, record_type)
);

-- ========================================
-- 8. FEED & ACTIVITIES
-- ========================================

-- Activity feed
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'workout', 'review', 'like', 'follow', 'record'
    target_type TEXT, -- 'gym', 'user', 'workout'
    target_id UUID,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 9. ADMIN & MANAGEMENT
-- ========================================

-- Gym owners/managers
CREATE TABLE IF NOT EXISTS public.gym_managers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('owner', 'manager', 'staff')),
    permissions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(gym_id, user_id)
);

-- ========================================
-- 10. INDEXES & PERFORMANCE
-- ========================================

-- Create indexes for performance
CREATE INDEX idx_gym_reviews_gym_id ON public.gym_reviews(gym_id);
CREATE INDEX idx_gym_reviews_user_id ON public.gym_reviews(user_id);
CREATE INDEX idx_gym_equipment_gym_id ON public.gym_equipment(gym_id);
CREATE INDEX IF NOT EXISTS idx_posts_gym_created ON public.posts(gym_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_created ON public.posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_post ON public.likes(post_id);
CREATE INDEX idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX idx_activities_user_id ON public.activities(user_id);
CREATE INDEX idx_activities_created_at ON public.activities(created_at DESC);
CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_following ON public.follows(following_id);

-- ========================================
-- 11. ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_gyms ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Gyms policies (public read)
CREATE POLICY "Gyms are viewable by everyone" ON public.gyms
    FOR SELECT USING (true);

-- Posts policies (public read, owner write)
CREATE POLICY "Posts are viewable by everyone" ON public.posts
    FOR SELECT USING (true);

CREATE POLICY "Users can create own posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON public.posts
    FOR UPDATE USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Likes are viewable by everyone" ON public.likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like" ON public.likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike own" ON public.likes
    FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON public.comments
    FOR SELECT USING (true);

CREATE POLICY "Users can comment" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Favorite gyms policies
CREATE POLICY "Favorite gyms are viewable by everyone" ON public.favorite_gyms
    FOR SELECT USING (true);

CREATE POLICY "Users can toggle favorites" ON public.favorite_gyms
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own favorites" ON public.favorite_gyms
    FOR DELETE USING (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON public.gym_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create own reviews" ON public.gym_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON public.gym_reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Workout policies
CREATE POLICY "Users can view own workouts" ON public.workout_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workouts" ON public.workout_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- 12. FUNCTIONS & TRIGGERS
-- ========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_gyms_updated_at BEFORE UPDATE ON public.gyms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_gym_equipment_updated_at BEFORE UPDATE ON public.gym_equipment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update likes/comments counters on posts
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_likes_count
AFTER INSERT OR DELETE ON public.likes
    FOR EACH ROW EXECUTE FUNCTION update_likes_count();

CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comments_count
AFTER INSERT OR DELETE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_comments_count();

-- Function to update gym rating
CREATE OR REPLACE FUNCTION update_gym_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.gyms
    SET rating = (
        SELECT AVG(rating)::DECIMAL(2,1)
        FROM public.gym_reviews
        WHERE gym_id = NEW.gym_id
    ),
    total_reviews = (
        SELECT COUNT(*)
        FROM public.gym_reviews
        WHERE gym_id = NEW.gym_id
    )
    WHERE id = NEW.gym_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for gym rating update
CREATE TRIGGER update_gym_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.gym_reviews
    FOR EACH ROW EXECUTE FUNCTION update_gym_rating();

-- Nearby gyms (Haversine, lat/lng columns)
CREATE OR REPLACE FUNCTION public.find_nearby_gyms(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  address TEXT,
  distance_km DOUBLE PRECISION,
  business_hours JSONB,
  facilities JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    g.name,
    g.address,
    (2 * 6371 * ASIN(SQRT(
      POWER(SIN(RADIANS(g.latitude - user_lat) / 2), 2) +
      COS(RADIANS(user_lat)) * COS(RADIANS(g.latitude)) *
      POWER(SIN(RADIANS(g.longitude - user_lng) / 2), 2)
    ))) AS distance_km,
    g.business_hours,
    g.facilities
  FROM public.gyms g
  WHERE g.latitude IS NOT NULL AND g.longitude IS NOT NULL
  HAVING (2 * 6371 * ASIN(SQRT(
      POWER(SIN(RADIANS(g.latitude - user_lat) / 2), 2) +
      COS(RADIANS(user_lat)) * COS(RADIANS(g.latitude)) *
      POWER(SIN(RADIANS(g.longitude - user_lng) / 2), 2)
    ))) <= radius_km
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- Personalized feed (aligns with app queries)
CREATE OR REPLACE FUNCTION public.get_personalized_feed(
  current_user_id UUID,
  feed_type TEXT DEFAULT 'all',
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  post_id UUID,
  user_id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  gym_id UUID,
  gym_name TEXT,
  content TEXT,
  crowd_status TEXT,
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
    p.id AS post_id,
    p.user_id,
    pr.username,
    pr.display_name,
    pr.avatar_url,
    p.gym_id,
    g.name AS gym_name,
    p.content,
    p.crowd_status,
    p.training_details,
    p.image_urls,
    p.likes_count,
    p.comments_count,
    EXISTS(SELECT 1 FROM public.likes WHERE user_id = current_user_id AND post_id = p.id) AS is_liked,
    EXISTS(SELECT 1 FROM public.gym_friends WHERE user_id = current_user_id AND friend_id = p.user_id AND status = 'accepted') AS is_gym_friend,
    EXISTS(SELECT 1 FROM public.follows WHERE follower_id = current_user_id AND following_id = p.user_id) AS is_following,
    EXISTS(SELECT 1 FROM public.user_gym_memberships ugm1 
           JOIN public.user_gym_memberships ugm2 ON ugm1.gym_id = ugm2.gym_id 
           WHERE ugm1.user_id = current_user_id AND ugm2.user_id = p.user_id) AS is_same_gym,
    p.created_at
  FROM public.posts p
  JOIN public.profiles pr ON p.user_id = pr.id
  JOIN public.gyms g ON p.gym_id = g.id
  WHERE 
    CASE 
      WHEN feed_type = 'following' THEN 
        EXISTS(SELECT 1 FROM public.follows WHERE follower_id = current_user_id AND following_id = p.user_id)
      WHEN feed_type = 'gym_friends' THEN 
        EXISTS(SELECT 1 FROM public.gym_friends WHERE user_id = current_user_id AND friend_id = p.user_id AND status = 'accepted')
      WHEN feed_type = 'same_gym' THEN 
        EXISTS(SELECT 1 FROM public.user_gym_memberships ugm1 
               JOIN public.user_gym_memberships ugm2 ON ugm1.gym_id = ugm2.gym_id 
               WHERE ugm1.user_id = current_user_id AND ugm2.user_id = p.user_id)
      ELSE true
    END
  ORDER BY p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- END OF SCHEMA
-- ========================================
