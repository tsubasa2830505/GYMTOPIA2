-- =============================================
-- Phase 1: Authentication Foundation
-- Users table and related configurations
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. USERS TABLE (Core authentication)
-- =============================================
-- Note: Supabase Auth creates auth.users table automatically
-- This is our public users table that extends auth.users

CREATE TABLE IF NOT EXISTS public.users (
    -- Primary key linked to Supabase Auth
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic information
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    display_name TEXT,
    
    -- Profile
    avatar_url TEXT,
    bio TEXT,
    
    -- Account status
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$'),
    CONSTRAINT display_name_length CHECK (char_length(display_name) <= 50),
    CONSTRAINT bio_length CHECK (char_length(bio) <= 500)
);

-- =============================================
-- 2. USER_PROFILES TABLE (Extended profile)
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Training information
    gym_experience_years DECIMAL(3,1),
    training_frequency TEXT, -- 'daily', 'weekly_3-4', 'weekly_5+', etc.
    training_goals TEXT[], -- ['muscle_gain', 'weight_loss', 'strength', 'endurance']
    preferred_training_time TEXT, -- 'morning', 'afternoon', 'evening', 'night'
    
    -- Physical stats (optional)
    height_cm INTEGER,
    weight_kg DECIMAL(5,2),
    body_fat_percentage DECIMAL(4,1),
    
    -- Privacy settings
    profile_visibility TEXT DEFAULT 'public', -- 'public', 'friends', 'private'
    show_stats BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT experience_range CHECK (gym_experience_years >= 0 AND gym_experience_years <= 100),
    CONSTRAINT height_range CHECK (height_cm >= 50 AND height_cm <= 300),
    CONSTRAINT weight_range CHECK (weight_kg >= 20 AND weight_kg <= 500),
    CONSTRAINT body_fat_range CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 100),
    CONSTRAINT valid_frequency CHECK (training_frequency IN ('daily', 'weekly_1-2', 'weekly_3-4', 'weekly_5+', 'occasional')),
    CONSTRAINT valid_training_time CHECK (preferred_training_time IN ('early_morning', 'morning', 'afternoon', 'evening', 'night', 'flexible')),
    CONSTRAINT valid_visibility CHECK (profile_visibility IN ('public', 'friends', 'private'))
);

-- =============================================
-- 3. INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_created_at ON public.users(created_at DESC);
CREATE INDEX idx_users_is_active ON public.users(is_active) WHERE is_active = true;

-- =============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view all public profiles" 
    ON public.users FOR SELECT 
    USING (true);

CREATE POLICY "Users can update own profile" 
    ON public.users FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON public.users FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- User profiles table policies
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.user_profiles FOR SELECT 
    USING (
        profile_visibility = 'public' 
        OR user_id = auth.uid()
    );

CREATE POLICY "Users can update own extended profile" 
    ON public.user_profiles FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own extended profile" 
    ON public.user_profiles FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own extended profile" 
    ON public.user_profiles FOR DELETE 
    USING (auth.uid() = user_id);

-- =============================================
-- 5. FUNCTIONS
-- =============================================

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, username, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        -- Generate temporary username from email
        LOWER(SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTRING(NEW.id::TEXT, 1, 4)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1))
    );
    
    -- Create empty profile
    INSERT INTO public.user_profiles (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 6. TRIGGERS
-- =============================================

-- Trigger to create user profile on auth signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers to update timestamps
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 7. SAMPLE DATA (Development only - remove in production)
-- =============================================
-- Uncomment below for testing

/*
-- Test user (password: test123456)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
    'a0eebc99-3333-4444-5555-eb8cc0f87fff',
    'test@example.com',
    crypt('test123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
);

-- Test user profile
INSERT INTO public.users (id, email, username, display_name, bio)
VALUES (
    'a0eebc99-3333-4444-5555-eb8cc0f87fff',
    'test@example.com',
    'testuser',
    'Test User',
    'フィットネス愛好家です！'
);

INSERT INTO public.user_profiles (user_id, gym_experience_years, training_frequency, training_goals)
VALUES (
    'a0eebc99-3333-4444-5555-eb8cc0f87fff',
    3.5,
    'weekly_3-4',
    ARRAY['muscle_gain', 'strength']
);
*/

-- =============================================
-- Notes for implementation:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Enable Email Auth in Authentication settings
-- 3. Configure email templates for verification
-- 4. Set up OAuth providers if needed
-- =============================================