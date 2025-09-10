-- Seed additional sample gyms (idempotent)

WITH vals(name,address,latitude,longitude,rating,review_count,description,status,prefecture,city) AS (
  VALUES
    ('パワーリフティングジム東京','東京都渋谷区神南1-1-1',35.661,139.699,4.6,87,'重量級に強い専門ジム','active','東京都','渋谷区'),
    ('新宿ストロングジム','東京都新宿区西新宿7-7-7',35.695,139.698,4.2,54,'新宿駅から徒歩5分の好立地','active','東京都','新宿区'),
    ('池袋フィットネス','東京都豊島区南池袋2-2-2',35.729,139.718,4.1,32,'初心者歓迎の総合ジム','active','東京都','豊島区')
)
INSERT INTO public.gyms (name,address,latitude,longitude,rating,review_count,description,created_at,status,prefecture,city)
SELECT v.name, v.address, v.latitude, v.longitude, v.rating, v.review_count, v.description, NOW(), v.status, v.prefecture, v.city
FROM vals v
WHERE NOT EXISTS (
  SELECT 1 FROM public.gyms g WHERE g.name = v.name AND g.address = v.address
);

-- Ensure common makers/machines exist
INSERT INTO public.machine_makers(id, name) VALUES
  ('hammer','Hammer Strength'),
  ('life-fitness','Life Fitness'),
  ('technogym','Technogym')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.machines(id, name, target, target_category, target_detail, type, maker)
VALUES
  ('power-rack','Power Rack','back-mid','back',null,'free-weight','hammer'),
  ('smith-machine','Smith Machine','chest-mid','chest',null,'machine','technogym'),
  ('treadmill','Treadmill','cardio','cardio',null,'cardio','life-fitness')
ON CONFLICT (id) DO NOTHING;

-- Link inventory to new gyms
WITH g AS (
  SELECT id,name FROM public.gyms WHERE name IN ('パワーリフティングジム東京','新宿ストロングジム','池袋フィットネス')
)
INSERT INTO public.gym_machines(gym_id, machine_id, quantity)
SELECT g.id, m.mid, m.qty
FROM g
CROSS JOIN (VALUES
  ('power-rack', 3),
  ('smith-machine', 2),
  ('treadmill', 8)
) AS m(mid, qty)
ON CONFLICT (gym_id, machine_id) DO NOTHING;
