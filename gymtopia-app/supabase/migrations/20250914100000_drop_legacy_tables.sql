-- Permanently drop legacy tables/views no longer needed
-- Keep profiles_legacy for safety; drop only content-related legacy tables

DO $$
DECLARE
  name text;
  legacy text[] := ARRAY[
    'posts_legacy',
    'likes_legacy',
    'comments_legacy',
    'muscle_parts_legacy',
    'workout_sets_legacy',
    'gym_posts_partitioned_legacy'
  ];
  oid_ oid;
  kind "char";
BEGIN
  FOREACH name IN ARRAY legacy LOOP
    oid_ := to_regclass('public.' || name);
    IF oid_ IS NOT NULL THEN
      SELECT relkind INTO kind FROM pg_class WHERE oid = oid_;
      IF kind = 'v' THEN
        EXECUTE format('DROP VIEW IF EXISTS public.%I CASCADE', name);
      ELSE
        EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', name);
      END IF;
    END IF;
  END LOOP;
END $$;
