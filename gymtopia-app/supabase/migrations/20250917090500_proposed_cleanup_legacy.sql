-- GYMTOPIA 2.0 - Proposed cleanup of legacy/unused tables
-- IMPORTANT: Review carefully before applying. This file is non-applied by default.
-- It drops legacy tables if present. Ensure there are no external dependencies.

-- Drop legacy relations if they exist (table or view)
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname='public' AND viewname='posts') THEN EXECUTE 'DROP VIEW public.posts CASCADE'; END IF; END $$;
DROP TABLE IF EXISTS public.posts CASCADE;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname='public' AND viewname='likes') THEN EXECUTE 'DROP VIEW public.likes CASCADE'; END IF; END $$;
DROP TABLE IF EXISTS public.likes CASCADE;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname='public' AND viewname='comments') THEN EXECUTE 'DROP VIEW public.comments CASCADE'; END IF; END $$;
DROP TABLE IF EXISTS public.comments CASCADE;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname='public' AND viewname='profiles') THEN EXECUTE 'DROP VIEW public.profiles CASCADE'; END IF; END $$;
DROP TABLE IF EXISTS public.profiles CASCADE;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname='public' AND viewname='machine_makers') THEN EXECUTE 'DROP VIEW public.machine_makers CASCADE'; END IF; END $$;
DROP TABLE IF EXISTS public.machine_makers CASCADE;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname='public' AND viewname='gym_posts_partitioned') THEN EXECUTE 'DROP VIEW public.gym_posts_partitioned CASCADE'; END IF; END $$;
DROP TABLE IF EXISTS public.gym_posts_partitioned CASCADE;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname='public' AND viewname='facility_types') THEN EXECUTE 'DROP VIEW public.facility_types CASCADE'; END IF; END $$;
DROP TABLE IF EXISTS public.facility_types CASCADE;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname='public' AND viewname='muscle_parts') THEN EXECUTE 'DROP VIEW public.muscle_parts CASCADE'; END IF; END $$;
DROP TABLE IF EXISTS public.muscle_parts CASCADE;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname='public' AND viewname='workout_sets') THEN EXECUTE 'DROP VIEW public.workout_sets CASCADE'; END IF; END $$;
DROP TABLE IF EXISTS public.workout_sets CASCADE;
COMMENT ON SCHEMA public IS 'Legacy cleanup executed if applicable. Verify with runtime audits before applying.';
