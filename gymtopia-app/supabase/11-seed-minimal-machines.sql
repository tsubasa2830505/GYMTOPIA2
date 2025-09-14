-- =====================================================
-- Seed minimal machine inventory for UI verification (idempotent)
-- - Picks one existing gym
-- - Ensures a couple of machines exist
-- - Links them via gym_machines with small quantities
-- =====================================================

-- Ensure makers (commonly seeded already)
INSERT INTO public.machine_makers(id, name)
VALUES
  ('hammer','Hammer Strength'),
  ('technogym','Technogym')
ON CONFLICT (id) DO NOTHING;

-- Ensure machines exist (TEXT id)
INSERT INTO public.machines(id, name, target, target_category, target_detail, type, maker)
VALUES
  ('iso-lateral-incline-press','Iso-Lateral Incline Press','chest-upper','chest','上部','free-weight','hammer'),
  ('lat-pulldown','Lat Pulldown','back-mid','back','中部','machine','technogym')
ON CONFLICT (id) DO NOTHING;

-- Pick one gym and link two machines
WITH g AS (
  SELECT id FROM public.gyms ORDER BY created_at NULLS LAST LIMIT 1
)
INSERT INTO public.gym_machines(gym_id, machine_id, quantity)
SELECT g.id, m.mid, m.qty
FROM g
CROSS JOIN (VALUES
  ('iso-lateral-incline-press', 2),
  ('lat-pulldown', 1)
) AS m(mid, qty)
ON CONFLICT (gym_id, machine_id) DO NOTHING;
