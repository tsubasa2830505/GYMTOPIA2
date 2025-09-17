-- Re-enable RLS that was temporarily disabled during development and restore sane policies

-- USERS: enable RLS and clean up permissive dev policy
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all updates for development" ON public.users;
-- Ensure update policy for self
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='Users can update own profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id)';
  END IF;
END $$;
-- Optionally allow selects for all users (public profiles); tighten if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='Users select public'
  ) THEN
    EXECUTE 'CREATE POLICY "Users select public" ON public.users FOR SELECT USING (true)';
  END IF;
END $$;
-- FAVORITE_GYMS: enable RLS and set sane policies
ALTER TABLE public.favorite_gyms ENABLE ROW LEVEL SECURITY;
-- Allow public read (to show like counts)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='favorite_gyms' AND policyname='favorite_gyms_select_public'
  ) THEN
    EXECUTE 'CREATE POLICY favorite_gyms_select_public ON public.favorite_gyms FOR SELECT USING (true)';
  END IF;
END $$;
-- Allow authenticated users to insert/delete their own likes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='favorite_gyms' AND policyname='favorite_gyms_insert_self'
  ) THEN
    EXECUTE 'CREATE POLICY favorite_gyms_insert_self ON public.favorite_gyms FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='favorite_gyms' AND policyname='favorite_gyms_delete_self'
  ) THEN
    EXECUTE 'CREATE POLICY favorite_gyms_delete_self ON public.favorite_gyms FOR DELETE USING (auth.uid() = user_id)';
  END IF;
END $$;
