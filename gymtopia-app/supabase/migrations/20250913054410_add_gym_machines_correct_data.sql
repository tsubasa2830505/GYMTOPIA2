-- 既存のgym_machinesデータを削除（重複を避けるため）
DELETE FROM gym_machines WHERE gym_id IN (
  '4da45ef5-0842-4d1f-9ce5-9d557215474d',
  'b621ea2a-c3d6-4fec-a965-fcf33d87eed9',
  'aa3acfb9-cc32-448e-a9c8-83af2c1a3e3f'
);

-- アイアンヘブン北海道にマシンを追加（胸・背中系が充実）
INSERT INTO gym_machines (gym_id, machine_id, quantity) VALUES
('4da45ef5-0842-4d1f-9ce5-9d557215474d', 'iso-lateral-incline-press', 2),
('4da45ef5-0842-4d1f-9ce5-9d557215474d', 'iso-lateral-decline-press', 2),
('4da45ef5-0842-4d1f-9ce5-9d557215474d', 'chest-press', 3),
('4da45ef5-0842-4d1f-9ce5-9d557215474d', 'pec-deck', 2),
('4da45ef5-0842-4d1f-9ce5-9d557215474d', 'cable-crossover', 1),
('4da45ef5-0842-4d1f-9ce5-9d557215474d', 'iso-lateral-row', 2),
('4da45ef5-0842-4d1f-9ce5-9d557215474d', 'lat-pulldown', 3),
('4da45ef5-0842-4d1f-9ce5-9d557215474d', 'seated-row', 2);

-- フィットネスクラブ大阪にマシンを追加（バランス型）
INSERT INTO gym_machines (gym_id, machine_id, quantity) VALUES
('b621ea2a-c3d6-4fec-a965-fcf33d87eed9', 'chest-press', 2),
('b621ea2a-c3d6-4fec-a965-fcf33d87eed9', 'pec-deck', 1),
('b621ea2a-c3d6-4fec-a965-fcf33d87eed9', 'shoulder-press', 2),
('b621ea2a-c3d6-4fec-a965-fcf33d87eed9', 'lateral-raise', 2),
('b621ea2a-c3d6-4fec-a965-fcf33d87eed9', 'leg-press', 3),
('b621ea2a-c3d6-4fec-a965-fcf33d87eed9', 'leg-extension', 2),
('b621ea2a-c3d6-4fec-a965-fcf33d87eed9', 'seated-leg-curl', 2);

-- ハードコアジム福岡にマシンを追加（フリーウェイト重視）
INSERT INTO gym_machines (gym_id, machine_id, quantity) VALUES
('aa3acfb9-cc32-448e-a9c8-83af2c1a3e3f', 'iso-lateral-incline-press', 1),
('aa3acfb9-cc32-448e-a9c8-83af2c1a3e3f', 'cable-crossover', 2),
('aa3acfb9-cc32-448e-a9c8-83af2c1a3e3f', 'iso-lateral-row', 1),
('aa3acfb9-cc32-448e-a9c8-83af2c1a3e3f', 'hip-thrust', 2),
('aa3acfb9-cc32-448e-a9c8-83af2c1a3e3f', 'hack-squat', 1),
('aa3acfb9-cc32-448e-a9c8-83af2c1a3e3f', 'calf-raise', 2);;
