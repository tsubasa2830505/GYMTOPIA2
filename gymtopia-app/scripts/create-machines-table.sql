-- machinesテーブルを作成
CREATE TABLE IF NOT EXISTS public.machines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    target TEXT NOT NULL, -- 'chest-upper', 'back-middle', etc
    target_category TEXT NOT NULL, -- 'chest', 'back', 'shoulder', etc
    target_detail TEXT, -- '上部', '中部', '下部', etc
    type TEXT NOT NULL, -- 'free-weight', 'machine'
    maker TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_machines_target_category ON public.machines(target_category);
CREATE INDEX IF NOT EXISTS idx_machines_type ON public.machines(type);
CREATE INDEX IF NOT EXISTS idx_machines_maker ON public.machines(maker);

-- RLSを有効化
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;

-- RLSポリシー（誰でも閲覧可能）
CREATE POLICY "Machines are viewable by everyone" 
ON public.machines FOR SELECT 
USING (true);

-- マシンデータを挿入
INSERT INTO public.machines (id, name, target, target_category, target_detail, type, maker) VALUES
-- 胸
('iso-lateral-incline-press', 'Iso-Lateral Incline Press', 'chest-upper', 'chest', '上部', 'free-weight', 'hammer'),
('iso-lateral-decline-press', 'Iso-Lateral Decline Press', 'chest-lower', 'chest', '下部', 'free-weight', 'hammer'),
('chest-press', 'Chest Press', 'chest-middle', 'chest', '中部', 'machine', 'life-fitness'),
('pec-deck', 'Pec Deck', 'chest-middle', 'chest', '中部', 'machine', 'technogym'),
('cable-crossover', 'Cable Crossover', 'chest-middle', 'chest', '中部', 'free-weight', 'cybex'),

-- 背中
('iso-lateral-row', 'Iso-Lateral Row', 'back-middle', 'back', '中部', 'free-weight', 'hammer'),
('iso-lateral-pulldown', 'Iso-Lateral Pulldown', 'back-upper', 'back', '上部', 'free-weight', 'hammer'),
('lat-pulldown', 'Lat Pulldown', 'back-upper', 'back', '上部', 'free-weight', 'life-fitness'),
('seated-row', 'Seated Row', 'back-middle', 'back', '中部', 'free-weight', 'cybex'),
('pullover', 'Pullover Machine', 'back-upper', 'back', '上部', 'machine', 'nautilus'),

-- 肩
('shoulder-press', 'Shoulder Press', 'shoulder-middle', 'shoulder', '中部', 'machine', 'life-fitness'),
('lateral-raise', 'Lateral Raise Machine', 'shoulder-middle', 'shoulder', '中部', 'machine', 'technogym'),
('rear-delt-fly', 'Rear Delt Fly', 'shoulder-rear', 'shoulder', '後部', 'machine', 'cybex'),

-- 脚
('leg-extension', 'Leg Extension', 'legs-quad', 'legs', '大腿四頭筋', 'machine', 'life-fitness'),
('seated-leg-curl', 'Seated Leg Curl', 'legs-hamstring', 'legs', 'ハムストリング', 'machine', 'cybex'),
('lying-leg-curl', 'Lying Leg Curl', 'legs-hamstring', 'legs', 'ハムストリング', 'machine', 'technogym'),
('hip-thrust', 'Hip Thrust Machine', 'legs-glutes', 'legs', '臀筋', 'free-weight', 'hammer'),
('leg-press', '45° Leg Press', 'legs-quad', 'legs', '大腿四頭筋', 'machine', 'hammer'),
('hack-squat', 'Hack Squat', 'legs-quad', 'legs', '大腿四頭筋', 'machine', 'cybex'),
('calf-raise', 'Calf Raise', 'legs-calf', 'legs', 'カーフ', 'machine', 'life-fitness'),
('hip-abduction', 'Hip Abduction', 'legs-abductor', 'legs', '外転筋', 'machine', 'technogym'),
('hip-adduction', 'Hip Adduction', 'legs-adductor', 'legs', '内転筋', 'machine', 'technogym'),

-- 腕
('preacher-curl', 'Preacher Curl Machine', 'arms-biceps', 'arms', '二頭筋', 'machine', 'life-fitness'),
('tricep-extension', 'Tricep Extension', 'arms-triceps', 'arms', '三頭筋', 'machine', 'cybex'),
('cable-curl', 'Cable Curl', 'arms-biceps', 'arms', '二頭筋', 'free-weight', 'matrix'),

-- 体幹
('ab-crunch', 'Ab Crunch Machine', 'core-abs', 'core', '腹直筋', 'machine', 'life-fitness'),
('rotary-torso', 'Rotary Torso', 'core-obliques', 'core', '腹斜筋', 'machine', 'technogym'),
('back-extension', 'Back Extension', 'core-lower-back', 'core', '下背部', 'machine', 'cybex'),

-- スミスマシン（フリーウェイトに分類）
('smith-machine', 'Smith Machine', 'multiple', 'multiple', NULL, 'free-weight', 'hammer'),
('smith-machine-3d', '3D Smith Machine', 'multiple', 'multiple', NULL, 'free-weight', 'matrix')
ON CONFLICT (id) DO NOTHING;

-- メーカーマスタテーブル
CREATE TABLE IF NOT EXISTS public.machine_makers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.machine_makers (id, name) VALUES
('hammer', 'Hammer Strength'),
('cybex', 'Cybex'),
('life-fitness', 'Life Fitness'),
('technogym', 'Technogym'),
('matrix', 'Matrix'),
('rogue', 'Rogue'),
('eleiko', 'Eleiko'),
('watson', 'Watson'),
('prime', 'Prime'),
('nautilus', 'Nautilus')
ON CONFLICT (id) DO NOTHING;

-- RLS設定
ALTER TABLE public.machine_makers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Machine makers are viewable by everyone" 
ON public.machine_makers FOR SELECT 
USING (true);