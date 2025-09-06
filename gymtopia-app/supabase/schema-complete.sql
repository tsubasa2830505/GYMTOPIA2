-- GYMTOPIA 2.0 Complete Database Schema
-- Supabase (PostgreSQL) Database Design
-- Created: 2025-01-06

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

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Gyms policies (public read)
CREATE POLICY "Gyms are viewable by everyone" ON public.gyms
    FOR SELECT USING (true);

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

-- ========================================
-- END OF SCHEMA
-- ========================================