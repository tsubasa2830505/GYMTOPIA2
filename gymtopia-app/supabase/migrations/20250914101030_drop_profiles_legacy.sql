-- Drop profiles_legacy if exists (table or view)

DO $$
DECLARE oid_ oid; kind "char";
BEGIN
  oid_ := to_regclass('public.profiles_legacy');
  IF oid_ IS NOT NULL THEN
    SELECT relkind INTO kind FROM pg_class WHERE oid = oid_;
    IF kind = 'v' THEN
      EXECUTE 'DROP VIEW IF EXISTS public.profiles_legacy CASCADE';
    ELSE
      EXECUTE 'DROP TABLE IF EXISTS public.profiles_legacy CASCADE';
    END IF;
  END IF;
END $$;

