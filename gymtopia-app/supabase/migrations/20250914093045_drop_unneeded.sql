-- Drop original names when corresponding *_legacy exists (safe cleanup)

DO $$
DECLARE
  name text;
  base_names text[] := ARRAY[
    'posts',
    'likes',
    'comments',
    'muscle_parts',
    'workout_sets',
    'gym_posts_partitioned'
  ];
  oid_ oid;
  kind "char";
BEGIN
  FOREACH name IN ARRAY base_names LOOP
    IF to_regclass('public.' || name || '_legacy') IS NOT NULL THEN
      oid_ := to_regclass('public.' || name);
      IF oid_ IS NOT NULL THEN
        SELECT relkind INTO kind FROM pg_class WHERE oid = oid_;
        IF kind = 'v' THEN
          EXECUTE format('DROP VIEW IF EXISTS public.%I CASCADE', name);
        ELSIF kind = 'r' THEN
          -- Table with same name shouldn't exist anymore, but drop if it does
          EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', name);
        ELSE
          -- Other kinds (materialized view etc.)
          EXECUTE format('DROP VIEW IF EXISTS public.%I CASCADE', name);
        END IF;
      END IF;
    END IF;
  END LOOP;
END $$;
