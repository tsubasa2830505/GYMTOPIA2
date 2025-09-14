-- =====================================================
-- GYMTOPIA 2.0 - Align Schema With App (Idempotent)
-- Purpose: fill the gaps between current UI/features and DB
-- Safe to re-run. Uses IF NOT EXISTS and additive ALTERs.
-- Depends on: 08-unified-schema.sql (users + user_profiles)
-- =====================================================

-- Extensions (noop if already installed)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------
-- Gyms: add columns expected by UI/search
-- -----------------------------------------------------
ALTER TABLE IF EXISTS public.gyms
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS prefecture TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS has_24h BOOLEAN,
  ADD COLUMN IF NOT EXISTS has_parking BOOLEAN,
  ADD COLUMN IF NOT EXISTS has_shower BOOLEAN,
  ADD COLUMN IF NOT EXISTS has_locker BOOLEAN,
  ADD COLUMN IF NOT EXISTS has_sauna BOOLEAN,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS business_hours JSONB,
  ADD COLUMN IF NOT EXISTS facilities JSONB,
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_gyms_status ON public.gyms(status);
CREATE INDEX IF NOT EXISTS idx_gyms_prefecture ON public.gyms(prefecture);
CREATE INDEX IF NOT EXISTS idx_gyms_city ON public.gyms(city);

-- -----------------------------------------------------
-- Machines domain (used by search + selector UI)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.machine_makers (
  id TEXT PRIMARY KEY,         -- e.g. 'hammer', 'technogym'
  name TEXT NOT NULL UNIQUE,   -- display name
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: If machines table already exists (commonly with TEXT id), this block is skipped.
CREATE TABLE IF NOT EXISTS public.machines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  -- UI expects: target_category ('chest'|'back'|'shoulder'|'legs'|'arms'|'core' ...)
  target_category TEXT NOT NULL,
  target_detail TEXT,
  type TEXT NOT NULL CHECK (type IN ('machine','free-weight','cardio')),
  maker TEXT NOT NULL REFERENCES public.machine_makers(id) ON UPDATE CASCADE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_machines_category ON public.machines(target_category);
CREATE INDEX IF NOT EXISTS idx_machines_type ON public.machines(type);
CREATE INDEX IF NOT EXISTS idx_machines_maker ON public.machines(maker);

-- Gym <-> Machines inventory
CREATE TABLE IF NOT EXISTS public.gym_machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  machine_id TEXT NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gym_id, machine_id)
);
CREATE INDEX IF NOT EXISTS idx_gym_machines_gym ON public.gym_machines(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_machines_machine ON public.gym_machines(machine_id);

-- Backward-compat view for code that references gym_equipment
DO $$ BEGIN
  -- Create compatibility view only when neither a table nor a view exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'gym_equipment'
  ) THEN
    CREATE VIEW public.gym_equipment AS
      SELECT id, gym_id, machine_id, quantity AS count, created_at
      FROM public.gym_machines;
  END IF;
END $$;

-- -----------------------------------------------------
-- Social/content: notifications + check-ins used by UI
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,               -- 'follow' | 'comment' | 'like' | ...
  title TEXT NOT NULL,
  message TEXT,
  related_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  related_post_id UUID REFERENCES public.gym_posts(id) ON DELETE SET NULL,
  related_gym_id UUID REFERENCES public.gyms(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- Gym check-ins / crowd reports
CREATE TABLE IF NOT EXISTS public.gym_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  checked_out_at TIMESTAMPTZ,
  crowd_level TEXT CHECK (crowd_level IN ('empty','normal','crowded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gym_checkins_user ON public.gym_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_checkins_gym ON public.gym_checkins(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_checkins_active ON public.gym_checkins(user_id, checked_out_at);

-- -----------------------------------------------------
-- Workouts: align columns used by app (non-destructive)
-- -----------------------------------------------------
-- Sessions: optional mood
ALTER TABLE IF EXISTS public.workout_sessions
  ADD COLUMN IF NOT EXISTS mood TEXT CHECK (mood IN ('great','good','normal','tired','bad'));

-- Exercises: app uses session_id and JSONB sets
ALTER TABLE IF EXISTS public.workout_exercises
  ADD COLUMN IF NOT EXISTS session_id UUID,
  ADD COLUMN IF NOT EXISTS muscle_group TEXT,
  ADD COLUMN IF NOT EXISTS equipment_type TEXT,
  ADD COLUMN IF NOT EXISTS sets JSONB,
  ADD COLUMN IF NOT EXISTS order_index INTEGER;

-- Add FK only if workout_sessions exists and FK not present
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='workout_sessions'
  ) THEN
    BEGIN
      ALTER TABLE public.workout_exercises
        ADD CONSTRAINT workout_exercises_session_id_fkey
        FOREIGN KEY (session_id) REFERENCES public.workout_sessions(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
      -- constraint already exists
      NULL;
    END;
  END IF;
END $$;

-- -----------------------------------------------------
-- Posts: ensure optional analytics/adornments exist
-- -----------------------------------------------------
ALTER TABLE IF EXISTS public.gym_posts
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS muscle_groups_trained TEXT[];

CREATE INDEX IF NOT EXISTS idx_gym_posts_user_id ON public.gym_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_posts_gym_id ON public.gym_posts(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_posts_created_at ON public.gym_posts(created_at DESC);

-- -----------------------------------------------------
-- RLS minimal defaults (read-mostly public content)
-- -----------------------------------------------------
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='notifications' AND policyname='notifications_select_self'
  ) THEN
    CREATE POLICY notifications_select_self ON public.notifications FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='notifications' AND policyname='notifications_mutate_self'
  ) THEN
    CREATE POLICY notifications_mutate_self ON public.notifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Gym posts should be public-readable if is_public
ALTER TABLE IF EXISTS public.gym_posts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gym_posts' AND policyname='gym_posts_public_read'
  ) THEN
    CREATE POLICY gym_posts_public_read ON public.gym_posts FOR SELECT USING (is_public = true OR user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gym_posts' AND policyname='gym_posts_mutate_self'
  ) THEN
    CREATE POLICY gym_posts_mutate_self ON public.gym_posts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- -----------------------------------------------------
-- Notes
-- - This script is additive and safe to apply on existing DBs.
-- - For full identity unification, run 08-unified-schema.sql first.
-- - gym_equipment view satisfies code that selects equipment_count:gym_equipment(count)
-- - Consider adding PostGIS + RPC(get_nearby_gyms) for precise nearby search.
-- =====================================================
