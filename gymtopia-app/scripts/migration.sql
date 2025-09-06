CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.users (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE,
      display_name TEXT,
      avatar_url TEXT,
      bio TEXT,
      is_active BOOLEAN DEFAULT true,
      email_verified BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      last_seen_at TIMESTAMPTZ,
      CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
      CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$'),
      CONSTRAINT display_name_length CHECK (char_length(display_name) <= 50),
      CONSTRAINT bio_length CHECK (char_length(bio) <= 500)
    );

CREATE TABLE IF NOT EXISTS public.user_profiles (
      user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
      gym_experience_years DECIMAL(3,1),
      training_frequency TEXT,
      training_goals TEXT[],
      preferred_training_time TEXT,
      height_cm INTEGER,
      weight_kg DECIMAL(5,2),
      body_fat_percentage DECIMAL(4,1),
      profile_visibility TEXT DEFAULT 'public',
      show_stats BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT experience_range CHECK (gym_experience_years >= 0 AND gym_experience_years <= 100),
      CONSTRAINT height_range CHECK (height_cm >= 50 AND height_cm <= 300),
      CONSTRAINT weight_range CHECK (weight_kg >= 20 AND weight_kg <= 500),
      CONSTRAINT body_fat_range CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 100),
      CONSTRAINT valid_frequency CHECK (training_frequency IN ('daily', 'weekly_1-2', 'weekly_3-4', 'weekly_5+', 'occasional')),
      CONSTRAINT valid_training_time CHECK (preferred_training_time IN ('early_morning', 'morning', 'afternoon', 'evening', 'night', 'flexible')),
      CONSTRAINT valid_visibility CHECK (profile_visibility IN ('public', 'friends', 'private'))
    );

CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active) WHERE is_active = true;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
        INSERT INTO public.users (id, email, username, display_name)
        VALUES (
            NEW.id,
            NEW.email,
            LOWER(SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTRING(NEW.id::TEXT, 1, 4)),
            COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1))
        );
        
        INSERT INTO public.user_profiles (user_id)
        VALUES (NEW.id);
        
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

-- Create Triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create RLS Policies
DROP POLICY IF EXISTS "Users can view all public profiles" ON public.users;
CREATE POLICY "Users can view all public profiles" 
    ON public.users FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" 
    ON public.users FOR UPDATE 
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" 
    ON public.users FOR INSERT 
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.user_profiles FOR SELECT 
    USING (
        profile_visibility = 'public' 
        OR user_id = auth.uid()
    );

DROP POLICY IF EXISTS "Users can update own extended profile" ON public.user_profiles;
CREATE POLICY "Users can update own extended profile" 
    ON public.user_profiles FOR UPDATE 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own extended profile" ON public.user_profiles;
CREATE POLICY "Users can insert own extended profile" 
    ON public.user_profiles FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own extended profile" ON public.user_profiles;
CREATE POLICY "Users can delete own extended profile" 
    ON public.user_profiles FOR DELETE 
    USING (auth.uid() = user_id);