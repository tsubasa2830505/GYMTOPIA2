-- =====================================================
-- GYMTOPIA 2.0 - Unified User Identity Schema (Long-term ready)
-- Goal: Use public.users (auth.users extension) as the canonical user id
-- and ensure all tables reference public.users(id).
-- Safe/idempotent: uses IF EXISTS / IF NOT EXISTS where possible.
-- =====================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------
-- 1) Canonical identity tables
-- -----------------------------------------------------

-- public.users extends auth.users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ,
  CONSTRAINT username_length CHECK (username IS NULL OR (char_length(username) >= 3 AND char_length(username) <= 30)),
  CONSTRAINT username_format CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9_]+$'),
  CONSTRAINT display_name_length CHECK (display_name IS NULL OR char_length(display_name) <= 50),
  CONSTRAINT bio_length CHECK (bio IS NULL OR char_length(bio) <= 500)
);

-- Make sure new columns exist when migrating from old scripts
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- Extended profile data
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
  CONSTRAINT experience_range CHECK (gym_experience_years IS NULL OR (gym_experience_years >= 0 AND gym_experience_years <= 100)),
  CONSTRAINT height_range CHECK (height_cm IS NULL OR (height_cm >= 50 AND height_cm <= 300)),
  CONSTRAINT weight_range CHECK (weight_kg IS NULL OR (weight_kg >= 20 AND weight_kg <= 500)),
  CONSTRAINT body_fat_range CHECK (body_fat_percentage IS NULL OR (body_fat_percentage >= 0 AND body_fat_percentage <= 100))
);

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- On auth signup, create user + empty extended profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, display_name, email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    LOWER(SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTRING(NEW.id::TEXT, 1, 4)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    (NEW.email_confirmed_at IS NOT NULL)
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------
-- 2) Reference all user_id to public.users(id)
--    (Drops old FKs if defined and recreates them)
-- -----------------------------------------------------

-- follows
ALTER TABLE IF EXISTS public.follows
  DROP CONSTRAINT IF EXISTS follows_follower_id_fkey,
  DROP CONSTRAINT IF EXISTS follows_following_id_fkey;
ALTER TABLE IF EXISTS public.follows
  ADD CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- gym_reviews
ALTER TABLE IF EXISTS public.gym_reviews
  DROP CONSTRAINT IF EXISTS gym_reviews_user_id_fkey;
ALTER TABLE IF EXISTS public.gym_reviews
  ADD CONSTRAINT gym_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- gym_likes
ALTER TABLE IF EXISTS public.gym_likes
  DROP CONSTRAINT IF EXISTS gym_likes_user_id_fkey;
ALTER TABLE IF EXISTS public.gym_likes
  ADD CONSTRAINT gym_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- personal_records
ALTER TABLE IF EXISTS public.personal_records
  DROP CONSTRAINT IF EXISTS personal_records_user_id_fkey;
ALTER TABLE IF EXISTS public.personal_records
  ADD CONSTRAINT personal_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- workout_sessions
ALTER TABLE IF EXISTS public.workout_sessions
  DROP CONSTRAINT IF EXISTS workout_sessions_user_id_fkey;
ALTER TABLE IF EXISTS public.workout_sessions
  ADD CONSTRAINT workout_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- gym_posts
ALTER TABLE IF EXISTS public.gym_posts
  DROP CONSTRAINT IF EXISTS gym_posts_user_id_fkey;
ALTER TABLE IF EXISTS public.gym_posts
  ADD CONSTRAINT gym_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- post_likes
ALTER TABLE IF EXISTS public.post_likes
  DROP CONSTRAINT IF EXISTS post_likes_user_id_fkey;
ALTER TABLE IF EXISTS public.post_likes
  ADD CONSTRAINT post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- post_comments
ALTER TABLE IF EXISTS public.post_comments
  DROP CONSTRAINT IF EXISTS post_comments_user_id_fkey;
ALTER TABLE IF EXISTS public.post_comments
  ADD CONSTRAINT post_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- gym_friends
ALTER TABLE IF EXISTS public.gym_friends
  DROP CONSTRAINT IF EXISTS gym_friends_user1_id_fkey,
  DROP CONSTRAINT IF EXISTS gym_friends_user2_id_fkey,
  DROP CONSTRAINT IF EXISTS gym_friends_initiated_by_fkey;
ALTER TABLE IF EXISTS public.gym_friends
  ADD CONSTRAINT gym_friends_user1_id_fkey FOREIGN KEY (user1_id) REFERENCES public.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT gym_friends_user2_id_fkey FOREIGN KEY (user2_id) REFERENCES public.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT gym_friends_initiated_by_fkey FOREIGN KEY (initiated_by) REFERENCES public.users(id) ON DELETE CASCADE;

-- favorite_gyms
ALTER TABLE IF EXISTS public.favorite_gyms
  DROP CONSTRAINT IF EXISTS favorite_gyms_user_id_fkey;
ALTER TABLE IF EXISTS public.favorite_gyms
  ADD CONSTRAINT favorite_gyms_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- achievements
ALTER TABLE IF EXISTS public.achievements
  DROP CONSTRAINT IF EXISTS achievements_user_id_fkey;
ALTER TABLE IF EXISTS public.achievements
  ADD CONSTRAINT achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- -----------------------------------------------------
-- 3) RLS policies (minimal sane defaults)
-- -----------------------------------------------------
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- Users: allow read for all, write self
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='users_select_all'
  ) THEN
    CREATE POLICY users_select_all ON public.users FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='users_update_self'
  ) THEN
    CREATE POLICY users_update_self ON public.users FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='users_insert_self'
  ) THEN
    CREATE POLICY users_insert_self ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;

  -- User profiles: read public or self; write self
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='user_profiles_select'
  ) THEN
    CREATE POLICY user_profiles_select ON public.user_profiles FOR SELECT USING (profile_visibility = 'public' OR user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='user_profiles_update_self'
  ) THEN
    CREATE POLICY user_profiles_update_self ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='user_profiles_insert_self'
  ) THEN
    CREATE POLICY user_profiles_insert_self ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- -----------------------------------------------------
-- 4) Developer notes
-- -----------------------------------------------------
-- If a real table named public.profiles exists from previous scripts,
-- consider migrating data into public.users, then drop it to avoid duplication.
-- After migration, update application queries to embed from `users` instead of `profiles`.

