-- Compatibility views for UI components expecting `machines` and `machine_makers`
-- These views map to the normalized equipment/equipment_categories tables.

CREATE OR REPLACE VIEW public.machine_makers AS
SELECT DISTINCT
  LOWER(REPLACE(COALESCE(e.maker, 'unknown'), ' ', '-')) AS id,
  COALESCE(e.maker, 'Unknown') AS name
FROM public.equipment e
WHERE e.maker IS NOT NULL;

-- Map equipment to a machine-like shape
-- Note: target/target_category/target_detail are best-effort placeholders.
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

