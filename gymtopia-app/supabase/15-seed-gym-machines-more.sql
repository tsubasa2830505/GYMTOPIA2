-- Seed additional gym_machines across multiple gyms for demo filtering
-- Adds two common machines to top 3 gyms without duplicates

-- Ensure machine makers and machines exist (id = TEXT)
INSERT INTO public.machine_makers(id, name) VALUES
  ('life-fitness','Life Fitness')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.machines(id, name, target, target_category, target_detail, type, maker)
VALUES
  ('lat-pulldown','Lat Pulldown','back-upper','back','上部','machine','life-fitness')
ON CONFLICT (id) DO NOTHING;

WITH gyms3 AS (
  SELECT id FROM public.gyms ORDER BY created_at NULLS LAST LIMIT 3
)
INSERT INTO public.gym_machines(gym_id, machine_id, quantity)
SELECT g.id, m.mid, m.qty
FROM gyms3 g
CROSS JOIN (VALUES
  ('iso-lateral-incline-press', 2),
  ('lat-pulldown', 1)
) AS m(mid, qty)
ON CONFLICT (gym_id, machine_id) DO NOTHING;

