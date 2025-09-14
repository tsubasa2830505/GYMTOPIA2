-- =====================================================
-- GYMTOPIA 2.0 - Safe rename of legacy/unused tables
-- Action: rename to *_legacy and create compat view for profiles
-- NOTE: Non-destructive. Run again safely.
-- =====================================================

-- Helper: safe rename (only if src exists and dest not exists)
DO $$ BEGIN
  IF to_regclass('public.muscle_parts') IS NOT NULL
     AND to_regclass('public.muscle_parts_legacy') IS NULL THEN
    EXECUTE 'ALTER TABLE public.muscle_parts RENAME TO muscle_parts_legacy';
    EXECUTE 'COMMENT ON TABLE public.muscle_parts_legacy IS ''LEGACY: unused by app (replaced by muscle_groups)''';
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.workout_sets') IS NOT NULL
     AND to_regclass('public.workout_sets_legacy') IS NULL THEN
    EXECUTE 'ALTER TABLE public.workout_sets RENAME TO workout_sets_legacy';
    EXECUTE 'COMMENT ON TABLE public.workout_sets_legacy IS ''LEGACY: app stores sets JSON on workout_exercises''';
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.profiles') IS NOT NULL
     AND (SELECT relkind FROM pg_class WHERE oid = 'public.profiles'::regclass) <> 'v'
     AND to_regclass('public.profiles_legacy') IS NULL THEN
    EXECUTE 'ALTER TABLE public.profiles RENAME TO profiles_legacy';
    EXECUTE 'COMMENT ON TABLE public.profiles_legacy IS ''LEGACY: replaced by public.users + public.user_profiles''';
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.gym_posts_partitioned') IS NOT NULL
     AND to_regclass('public.gym_posts_partitioned_legacy') IS NULL THEN
    EXECUTE 'ALTER TABLE public.gym_posts_partitioned RENAME TO gym_posts_partitioned_legacy';
    EXECUTE 'COMMENT ON TABLE public.gym_posts_partitioned_legacy IS ''LEGACY: partition example; not used by app''';
  END IF;
END $$;

-- Old social names kept by mistake (new: gym_posts/post_likes/post_comments)
DO $$ BEGIN
  IF to_regclass('public.posts') IS NOT NULL
     AND to_regclass('public.posts_legacy') IS NULL THEN
    EXECUTE 'ALTER TABLE public.posts RENAME TO posts_legacy';
    EXECUTE 'COMMENT ON TABLE public.posts_legacy IS ''LEGACY: renamed to public.gym_posts''';
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.likes') IS NOT NULL
     AND to_regclass('public.likes_legacy') IS NULL THEN
    EXECUTE 'ALTER TABLE public.likes RENAME TO likes_legacy';
    EXECUTE 'COMMENT ON TABLE public.likes_legacy IS ''LEGACY: renamed to public.post_likes''';
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.comments') IS NOT NULL
     AND to_regclass('public.comments_legacy') IS NULL THEN
    EXECUTE 'ALTER TABLE public.comments RENAME TO comments_legacy';
    EXECUTE 'COMMENT ON TABLE public.comments_legacy IS ''LEGACY: renamed to public.post_comments''';
  END IF;
END $$;

-- After renaming profiles table (if it existed), provide a compatibility view
DO $$
BEGIN
  -- Create profiles view only if it's not a table; replace only if already a view
  IF to_regclass('public.profiles') IS NULL THEN
    EXECUTE $$
      CREATE VIEW public.profiles AS
      SELECT 
        u.id,
        u.username,
        u.display_name,
        u.bio,
        u.avatar_url,
        NULL::text        AS location,
        NULL::text        AS training_frequency,
        TRUE              AS is_public,
        u.created_at,
        u.updated_at
      FROM public.users u;
    $$;
  ELSIF EXISTS (SELECT 1 FROM pg_class WHERE oid = 'public.profiles'::regclass AND relkind = 'v') THEN
    EXECUTE $$
      CREATE OR REPLACE VIEW public.profiles AS
      SELECT 
        u.id,
        u.username,
        u.display_name,
        u.bio,
        u.avatar_url,
        NULL::text        AS location,
        NULL::text        AS training_frequency,
        TRUE              AS is_public,
        u.created_at,
        u.updated_at
      FROM public.users u;
    $$;
  ELSE
    RAISE NOTICE 'public.profiles exists as a table, skip creating view';
  END IF;
END
$$;

-- Optional: note machine_makers/facility_types are kept (FK targets)
-- COMMENTs only (no action):
DO $$ BEGIN
  IF to_regclass('public.machine_makers') IS NOT NULL THEN
    EXECUTE 'COMMENT ON TABLE public.machine_makers IS ''IN-USE FK target for public.machines (keep unless deprecating machines)''';
  END IF;
  IF to_regclass('public.facility_types') IS NOT NULL THEN
    EXECUTE 'COMMENT ON TABLE public.facility_types IS ''IN-USE FK target for public.gym_facilities (keep)''';
  END IF;
END $$;

-- =====================================================
-- End
-- =====================================================

