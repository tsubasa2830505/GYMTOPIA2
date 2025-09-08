-- Normalize gyms.prefecture/city from address for demo data (idempotent-ish)
-- This is a heuristic for addresses starting with '東京都...区...'

-- Prefecture: set if NULL and address starts with 東京都
UPDATE public.gyms
SET prefecture = '東京都'
WHERE prefecture IS NULL AND address LIKE '東京都%';

-- City: extract '...区' part after 東京都 when city is NULL
UPDATE public.gyms g
SET city = sub.city
FROM (
  SELECT id,
         regexp_replace(address, '^東京都([^0-9]+?区).*$','\1') AS city
  FROM public.gyms 
  WHERE address LIKE '東京都%'
) AS sub
WHERE g.id = sub.id
  AND (g.city IS NULL OR g.city = '');

