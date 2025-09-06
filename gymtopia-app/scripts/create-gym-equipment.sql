-- gym_equipment テーブルを作成
CREATE TABLE IF NOT EXISTS public.gym_equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    
    category TEXT NOT NULL, -- 'machine', 'free_weight', 'cardio'
    type TEXT NOT NULL, -- 'chest_press', 'lat_pulldown', 'squat_rack', etc
    brand TEXT,
    model TEXT,
    quantity INTEGER DEFAULT 1,
    muscle_groups TEXT[], -- ['chest', 'triceps']
    
    notes TEXT,
    image_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_gym_equipment_gym_id ON public.gym_equipment(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_equipment_category ON public.gym_equipment(category);
CREATE INDEX IF NOT EXISTS idx_gym_equipment_type ON public.gym_equipment(type);

-- RLSを有効化
ALTER TABLE public.gym_equipment ENABLE ROW LEVEL SECURITY;

-- RLSポリシー（誰でも閲覧可能）
CREATE POLICY "Gym equipment is viewable by everyone" 
ON public.gym_equipment FOR SELECT 
USING (true);

-- サンプルデータを挿入
INSERT INTO public.gym_equipment (gym_id, category, type, quantity, muscle_groups)
SELECT 
    (SELECT id FROM public.gyms LIMIT 1) as gym_id,
    category,
    type,
    1 as quantity,
    muscle_groups
FROM (VALUES
    -- フリーウェイト
    ('free_weight', 'power_rack', ARRAY['legs', 'back']),
    ('free_weight', 'bench_press', ARRAY['chest', 'arms']),
    ('free_weight', 'squat_rack', ARRAY['legs']),
    ('free_weight', 'dumbbell', ARRAY['arms', 'chest']),
    ('free_weight', 'barbell', ARRAY['arms', 'chest', 'back']),
    ('free_weight', 'kettlebell', ARRAY['legs', 'core']),
    
    -- マシン
    ('machine', 'lat_pulldown', ARRAY['back']),
    ('machine', 'chest_press', ARRAY['chest']),
    ('machine', 'leg_press', ARRAY['legs']),
    ('machine', 'shoulder_press', ARRAY['shoulder']),
    ('machine', 'leg_curl', ARRAY['legs']),
    ('machine', 'leg_extension', ARRAY['legs']),
    ('machine', 'cable_crossover', ARRAY['chest']),
    ('machine', 'seated_row', ARRAY['back']),
    ('machine', 'tricep_extension', ARRAY['arms']),
    ('machine', 'bicep_curl', ARRAY['arms']),
    
    -- カーディオ
    ('cardio', 'treadmill', ARRAY[]::TEXT[]),
    ('cardio', 'exercise_bike', ARRAY[]::TEXT[]),
    ('cardio', 'rowing_machine', ARRAY['back', 'arms']),
    ('cardio', 'elliptical', ARRAY[]::TEXT[]),
    ('cardio', 'stair_climber', ARRAY['legs']),
    ('cardio', 'spin_bike', ARRAY[]::TEXT[])
) AS equipment(category, type, muscle_groups);