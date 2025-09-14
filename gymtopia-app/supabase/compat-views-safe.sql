-- Safe compatibility views for long-term migration

-- machines and machine_makers views are idempotent
CREATE OR REPLACE VIEW public.machine_makers AS
SELECT DISTINCT
  LOWER(REPLACE(COALESCE(e.maker, 'unknown'), ' ', '-')) AS id,
  COALESCE(e.maker, 'Unknown') AS name
FROM public.equipment e
WHERE e.maker IS NOT NULL;

CREATE OR REPLACE VIEW public.machines AS
SELECT 
  e.id::text                         AS id,
  e.name                             AS name,
  NULL::text                         AS target,
  CASE 
    WHEN ec.name ILIKE '%チェスト%' THEN 'chest'
    WHEN ec.name ILIKE '%バック%' OR ec.name ILIKE '%背%' THEN 'back'
    WHEN ec.name ILIKE '%レッグ%' OR ec.name ILIKE '%脚%' THEN 'legs'
    WHEN ec.name ILIKE '%ショルダー%' OR ec.name ILIKE '%肩%' THEN 'shoulder'
    WHEN ec.name ILIKE '%アーム%' OR ec.name ILIKE '%腕%' THEN 'arms'
    WHEN ec.name ILIKE '%アブ%' OR ec.name ILIKE '%腹%' OR ec.name ILIKE '%コア%' THEN 'core'
    WHEN ec.name ILIKE '%フリーウェイト%' THEN 'multiple'
    ELSE NULL
  END                                AS target_category,
  NULL::text                         AS target_detail,
  e.type                             AS type,
  COALESCE(e.maker, 'Unknown')       AS maker
FROM public.equipment e
LEFT JOIN public.equipment_categories ec ON ec.id = e.category_id;

CREATE OR REPLACE VIEW public.gym_machines AS
SELECT
  ge.id,
  ge.gym_id,
  (ge.equipment_id::text)      AS machine_id,
  ge.count                      AS quantity,
  ge.max_weight,
  ge.condition,
  ge.notes,
  ge.created_at,
  ge.updated_at
FROM public.gym_equipment ge;

-- Create profiles view only if it's not a table; replace only if already a view
DO $$
BEGIN
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

