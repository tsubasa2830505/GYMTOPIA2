-- Robust renames handling tables or views for legacy objects

-- Helper to rename relation to *_legacy whether table or view
DO $$
DECLARE oid_ oid; kind "char";
BEGIN
  -- posts -> posts_legacy
  oid_ := to_regclass('public.posts');
  IF oid_ IS NOT NULL AND to_regclass('public.posts_legacy') IS NULL THEN
    SELECT relkind INTO kind FROM pg_class WHERE oid = oid_;
    IF kind = 'v' THEN
      EXECUTE 'ALTER VIEW public.posts RENAME TO posts_legacy';
      EXECUTE 'COMMENT ON VIEW public.posts_legacy IS ''LEGACY: renamed to public.gym_posts''';
    ELSE
      EXECUTE 'ALTER TABLE public.posts RENAME TO posts_legacy';
      EXECUTE 'COMMENT ON TABLE public.posts_legacy IS ''LEGACY: renamed to public.gym_posts''';
    END IF;
  END IF;

  -- likes -> likes_legacy
  oid_ := to_regclass('public.likes');
  IF oid_ IS NOT NULL AND to_regclass('public.likes_legacy') IS NULL THEN
    SELECT relkind INTO kind FROM pg_class WHERE oid = oid_;
    IF kind = 'v' THEN
      EXECUTE 'ALTER VIEW public.likes RENAME TO likes_legacy';
      EXECUTE 'COMMENT ON VIEW public.likes_legacy IS ''LEGACY: renamed to public.post_likes''';
    ELSE
      EXECUTE 'ALTER TABLE public.likes RENAME TO likes_legacy';
      EXECUTE 'COMMENT ON TABLE public.likes_legacy IS ''LEGACY: renamed to public.post_likes''';
    END IF;
  END IF;

  -- comments -> comments_legacy
  oid_ := to_regclass('public.comments');
  IF oid_ IS NOT NULL AND to_regclass('public.comments_legacy') IS NULL THEN
    SELECT relkind INTO kind FROM pg_class WHERE oid = oid_;
    IF kind = 'v' THEN
      EXECUTE 'ALTER VIEW public.comments RENAME TO comments_legacy';
      EXECUTE 'COMMENT ON VIEW public.comments_legacy IS ''LEGACY: renamed to public.post_comments''';
    ELSE
      EXECUTE 'ALTER TABLE public.comments RENAME TO comments_legacy';
      EXECUTE 'COMMENT ON TABLE public.comments_legacy IS ''LEGACY: renamed to public.post_comments''';
    END IF;
  END IF;
END $$;
