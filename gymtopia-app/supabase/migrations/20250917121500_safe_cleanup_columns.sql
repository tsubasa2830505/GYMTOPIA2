-- Safe cleanup of unused columns/tables based on audits
-- Only drop when there is no non-null data; otherwise keep

-- gym_reviews: sub-rating columns
DO $$
DECLARE has_data boolean;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='gym_reviews' AND column_name='cleanliness_rating') THEN
    SELECT EXISTS(SELECT 1 FROM public.gym_reviews WHERE cleanliness_rating IS NOT NULL) INTO has_data;
    IF NOT has_data THEN
      EXECUTE 'ALTER TABLE public.gym_reviews DROP COLUMN IF EXISTS cleanliness_rating';
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='gym_reviews' AND column_name='equipment_rating') THEN
    SELECT EXISTS(SELECT 1 FROM public.gym_reviews WHERE equipment_rating IS NOT NULL) INTO has_data;
    IF NOT has_data THEN
      EXECUTE 'ALTER TABLE public.gym_reviews DROP COLUMN IF EXISTS equipment_rating';
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='gym_reviews' AND column_name='staff_rating') THEN
    SELECT EXISTS(SELECT 1 FROM public.gym_reviews WHERE staff_rating IS NOT NULL) INTO has_data;
    IF NOT has_data THEN
      EXECUTE 'ALTER TABLE public.gym_reviews DROP COLUMN IF EXISTS staff_rating';
    END IF;
  END IF;
END $$;
-- user_statistics: drop table if exists and empty
DO $$
DECLARE rowcount bigint;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_statistics') THEN
    EXECUTE 'SELECT count(*) FROM public.user_statistics' INTO rowcount;
    IF rowcount = 0 THEN
      EXECUTE 'DROP TABLE public.user_statistics CASCADE';
    END IF;
  END IF;
END $$;
