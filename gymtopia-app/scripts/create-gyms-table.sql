-- UUID拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PostGIS拡張機能を有効化（位置情報用）
CREATE EXTENSION IF NOT EXISTS postgis;

-- ジム情報テーブル
CREATE TABLE IF NOT EXISTS public.gyms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    name_kana TEXT,
    description TEXT,
    
    -- 位置情報
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    prefecture TEXT,
    city TEXT,
    
    -- 営業情報
    business_hours JSONB DEFAULT '{}',
    holidays TEXT,
    phone TEXT,
    website TEXT,
    
    -- 施設情報
    facilities JSONB DEFAULT '{}', -- {parking: true, shower: true, locker: true, etc}
    equipment_types TEXT[] DEFAULT '{}', -- ['machine', 'free_weight', 'cardio']
    machine_brands TEXT[] DEFAULT '{}', -- ['Life Fitness', 'Technogym', etc]
    
    -- 料金情報
    price_info JSONB DEFAULT '{}',
    
    -- 評価
    rating DECIMAL(2,1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    
    -- メタデータ
    status TEXT DEFAULT 'active', -- active, closed, temporary_closed
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5)
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_gyms_prefecture ON public.gyms(prefecture);
CREATE INDEX IF NOT EXISTS idx_gyms_city ON public.gyms(city);
CREATE INDEX IF NOT EXISTS idx_gyms_status ON public.gyms(status);
CREATE INDEX IF NOT EXISTS idx_gyms_location ON public.gyms USING GIST(
    ll_to_earth(latitude::float8, longitude::float8)
);

-- RLSを有効化
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;

-- RLSポリシー（誰でも閲覧可能）
CREATE POLICY "Gyms are viewable by everyone" 
ON public.gyms FOR SELECT 
USING (true);

-- ジムが保有するマシンテーブル（machinesテーブルと関連）
CREATE TABLE IF NOT EXISTS public.gym_machines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    machine_id TEXT NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
    
    quantity INTEGER DEFAULT 1,
    condition TEXT DEFAULT 'good', -- excellent, good, fair, poor
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_gym_machine UNIQUE (gym_id, machine_id)
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_gym_machines_gym_id ON public.gym_machines(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_machines_machine_id ON public.gym_machines(machine_id);

-- RLSを有効化
ALTER TABLE public.gym_machines ENABLE ROW LEVEL SECURITY;

-- RLSポリシー（誰でも閲覧可能）
CREATE POLICY "Gym machines are viewable by everyone" 
ON public.gym_machines FOR SELECT 
USING (true);

-- ユーザーのジム会員情報テーブル
CREATE TABLE IF NOT EXISTS public.gym_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    
    membership_type TEXT DEFAULT 'regular', -- regular, premium, vip
    status TEXT DEFAULT 'active', -- active, inactive, paused
    
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_user_gym_membership UNIQUE (user_id, gym_id, status)
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_gym_memberships_user_id ON public.gym_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_memberships_gym_id ON public.gym_memberships(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_memberships_status ON public.gym_memberships(status);

-- RLSを有効化
ALTER TABLE public.gym_memberships ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
CREATE POLICY "Users can view their own memberships" 
ON public.gym_memberships FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view gym members of their gyms" 
ON public.gym_memberships FOR SELECT 
USING (
    gym_id IN (
        SELECT gym_id FROM public.gym_memberships 
        WHERE user_id = auth.uid() AND status = 'active'
    )
);

-- ジムチェックイン履歴テーブル
CREATE TABLE IF NOT EXISTS public.gym_checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    
    checked_in_at TIMESTAMPTZ DEFAULT NOW(),
    checked_out_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_gym_checkins_user_id ON public.gym_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_checkins_gym_id ON public.gym_checkins(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_checkins_checked_in_at ON public.gym_checkins(checked_in_at);

-- RLSを有効化
ALTER TABLE public.gym_checkins ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
CREATE POLICY "Users can view their own checkins" 
ON public.gym_checkins FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own checkins" 
ON public.gym_checkins FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- ジムレビューテーブル
CREATE TABLE IF NOT EXISTS public.gym_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    rating INTEGER NOT NULL,
    title TEXT,
    content TEXT,
    
    -- レビューの詳細評価
    equipment_rating INTEGER,
    cleanliness_rating INTEGER,
    staff_rating INTEGER,
    accessibility_rating INTEGER,
    
    images TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_ratings CHECK (
        rating >= 1 AND rating <= 5 AND
        (equipment_rating IS NULL OR (equipment_rating >= 1 AND equipment_rating <= 5)) AND
        (cleanliness_rating IS NULL OR (cleanliness_rating >= 1 AND cleanliness_rating <= 5)) AND
        (staff_rating IS NULL OR (staff_rating >= 1 AND staff_rating <= 5)) AND
        (accessibility_rating IS NULL OR (accessibility_rating >= 1 AND accessibility_rating <= 5))
    ),
    
    -- ユーザーは1つのジムに1つのレビューのみ
    CONSTRAINT unique_user_gym_review UNIQUE (gym_id, user_id)
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_gym_reviews_gym_id ON public.gym_reviews(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_reviews_user_id ON public.gym_reviews(user_id);

-- RLSを有効化
ALTER TABLE public.gym_reviews ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
CREATE POLICY "Gym reviews are viewable by everyone" 
ON public.gym_reviews FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own reviews" 
ON public.gym_reviews FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
ON public.gym_reviews FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
ON public.gym_reviews FOR DELETE 
USING (auth.uid() = user_id);

-- お気に入りジムテーブル
CREATE TABLE IF NOT EXISTS public.favorite_gyms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_user_gym_favorite UNIQUE (user_id, gym_id)
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_favorite_gyms_user_id ON public.favorite_gyms(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_gyms_gym_id ON public.favorite_gyms(gym_id);

-- RLSを有効化
ALTER TABLE public.favorite_gyms ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
CREATE POLICY "Users can view their own favorites" 
ON public.favorite_gyms FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites" 
ON public.favorite_gyms FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites" 
ON public.favorite_gyms FOR DELETE 
USING (auth.uid() = user_id);

-- ワークアウトセッションテーブル
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    gym_id UUID REFERENCES public.gyms(id) ON DELETE SET NULL,
    
    name TEXT NOT NULL,
    target_muscles TEXT[], -- ['chest', 'triceps']
    
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    
    notes TEXT,
    mood TEXT, -- excellent, good, normal, tired, bad
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_gym_id ON public.workout_sessions(gym_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_started_at ON public.workout_sessions(started_at);

-- RLSを有効化
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
CREATE POLICY "Users can view their own workouts" 
ON public.workout_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workouts" 
ON public.workout_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts" 
ON public.workout_sessions FOR UPDATE 
USING (auth.uid() = user_id);

-- ワークアウトエクササイズテーブル
CREATE TABLE IF NOT EXISTS public.workout_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    machine_id TEXT REFERENCES public.machines(id),
    
    exercise_name TEXT NOT NULL,
    exercise_order INTEGER NOT NULL,
    
    sets JSONB NOT NULL DEFAULT '[]', -- [{reps: 10, weight: 60, rest_seconds: 90}]
    
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_workout_exercises_session_id ON public.workout_exercises(session_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_machine_id ON public.workout_exercises(machine_id);

-- RLSを有効化
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
CREATE POLICY "Users can view exercises of their workouts" 
ON public.workout_exercises FOR SELECT 
USING (
    session_id IN (
        SELECT id FROM public.workout_sessions 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can manage exercises of their workouts" 
ON public.workout_exercises FOR ALL 
USING (
    session_id IN (
        SELECT id FROM public.workout_sessions 
        WHERE user_id = auth.uid()
    )
);

-- サンプルデータを挿入（東京の人気ジム）
INSERT INTO public.gyms (
    name, name_kana, description, 
    latitude, longitude, address, prefecture, city,
    business_hours, facilities, equipment_types, machine_brands,
    rating, review_count, verified
) VALUES
-- ゴールドジム
('ゴールドジム 渋谷東京', 'ゴールドジムシブヤトウキョウ', 
 '世界最大級のフィットネスクラブチェーン。最新鋭のマシンと経験豊富なトレーナーが在籍。',
 35.658517, 139.701334, '東京都渋谷区渋谷1-23-16', '東京都', '渋谷区',
 '{"weekday": "7:00-23:00", "saturday": "9:00-22:00", "sunday": "9:00-20:00"}'::jsonb,
 '{"parking": true, "shower": true, "locker": true, "sauna": true, "pool": false, "personal_training": true}'::jsonb,
 ARRAY['machine', 'free_weight', 'cardio'],
 ARRAY['Hammer Strength', 'Life Fitness', 'Cybex'],
 4.5, 128, true),

('ゴールドジム 原宿東京', 'ゴールドジムハラジュクトウキョウ',
 'プロボディビルダーも多く通う本格派ジム。フリーウェイトエリアが充実。',
 35.669752, 139.702695, '東京都渋谷区神宮前6-31-17', '東京都', '渋谷区',
 '{"weekday": "7:00-23:00", "saturday": "9:00-22:00", "sunday": "9:00-20:00"}'::jsonb,
 '{"parking": false, "shower": true, "locker": true, "sauna": true, "pool": false, "personal_training": true}'::jsonb,
 ARRAY['machine', 'free_weight', 'cardio'],
 ARRAY['Hammer Strength', 'Technogym', 'Matrix'],
 4.6, 98, true),

-- エニタイムフィットネス
('エニタイムフィットネス 六本木', 'エニタイムフィットネスロッポンギ',
 '24時間営業のフィットネスジム。世界中の店舗が利用可能。',
 35.662836, 139.731329, '東京都港区六本木7-12-3', '東京都', '港区',
 '{"24hours": true}'::jsonb,
 '{"parking": false, "shower": true, "locker": true, "sauna": false, "pool": false, "personal_training": false}'::jsonb,
 ARRAY['machine', 'free_weight', 'cardio'],
 ARRAY['Life Fitness', 'Precor'],
 4.2, 67, true),

('エニタイムフィットネス 新宿歌舞伎町', 'エニタイムフィットネスシンジュクカブキチョウ',
 '新宿の中心地にある24時間ジム。アクセス抜群。',
 35.695306, 139.703571, '東京都新宿区歌舞伎町2-19-13', '東京都', '新宿区',
 '{"24hours": true}'::jsonb,
 '{"parking": false, "shower": true, "locker": true, "sauna": false, "pool": false, "personal_training": false}'::jsonb,
 ARRAY['machine', 'free_weight', 'cardio'],
 ARRAY['Matrix', 'Life Fitness'],
 4.0, 89, true),

-- RIZAP
('RIZAP 新宿店', 'ライザップシンジュクテン',
 '結果にコミットする完全個室のパーソナルトレーニングジム。',
 35.689487, 139.700464, '東京都新宿区新宿3-17-20', '東京都', '新宿区',
 '{"weekday": "7:00-23:00", "saturday": "7:00-23:00", "sunday": "7:00-23:00"}'::jsonb,
 '{"parking": false, "shower": true, "locker": true, "sauna": false, "pool": false, "personal_training": true}'::jsonb,
 ARRAY['machine', 'free_weight'],
 ARRAY['Technogym'],
 4.7, 45, true),

-- ティップネス
('ティップネス 渋谷', 'ティップネスシブヤ',
 '総合フィットネスクラブ。プール、スタジオプログラムも充実。',
 35.658998, 139.698682, '東京都渋谷区宇田川町16-4', '東京都', '渋谷区',
 '{"weekday": "7:00-23:00", "saturday": "9:30-22:00", "sunday": "9:30-20:00"}'::jsonb,
 '{"parking": true, "shower": true, "locker": true, "sauna": true, "pool": true, "personal_training": true}'::jsonb,
 ARRAY['machine', 'free_weight', 'cardio'],
 ARRAY['Technogym', 'Life Fitness'],
 4.3, 156, true),

-- コナミスポーツクラブ
('コナミスポーツクラブ 池袋', 'コナミスポーツクラブイケブクロ',
 '大型総合スポーツクラブ。温浴施設も完備。',
 35.731702, 139.711085, '東京都豊島区東池袋1-41-30', '東京都', '豊島区',
 '{"weekday": "7:00-23:00", "saturday": "10:00-22:00", "sunday": "10:00-20:00"}'::jsonb,
 '{"parking": true, "shower": true, "locker": true, "sauna": true, "pool": true, "personal_training": true}'::jsonb,
 ARRAY['machine', 'free_weight', 'cardio'],
 ARRAY['Technogym', 'Matrix', 'Life Fitness'],
 4.1, 203, true)

ON CONFLICT (id) DO NOTHING;

-- ジムにマシンを追加（サンプルデータ）
INSERT INTO public.gym_machines (gym_id, machine_id, quantity, condition)
SELECT 
    g.id as gym_id,
    m.id as machine_id,
    CASE 
        WHEN m.type = 'free-weight' THEN floor(random() * 3 + 2)::int
        ELSE floor(random() * 2 + 1)::int
    END as quantity,
    CASE floor(random() * 4)::int
        WHEN 0 THEN 'excellent'
        WHEN 1 THEN 'good'
        WHEN 2 THEN 'good'
        ELSE 'fair'
    END as condition
FROM 
    public.gyms g
    CROSS JOIN public.machines m
WHERE 
    -- ゴールドジムには全マシン
    (g.name LIKE 'ゴールドジム%') OR
    -- エニタイムには基本的なマシンのみ
    (g.name LIKE 'エニタイム%' AND m.type IN ('machine', 'free-weight') AND m.target_category IN ('chest', 'back', 'legs')) OR
    -- その他のジムには主要なマシン
    (m.id IN ('chest-press', 'lat-pulldown', 'leg-press', 'shoulder-press', 'smith-machine'))
ON CONFLICT (gym_id, machine_id) DO NOTHING;

-- レビュー評価を更新する関数
CREATE OR REPLACE FUNCTION update_gym_rating() RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.gyms
    SET 
        rating = (SELECT AVG(rating) FROM public.gym_reviews WHERE gym_id = NEW.gym_id),
        review_count = (SELECT COUNT(*) FROM public.gym_reviews WHERE gym_id = NEW.gym_id)
    WHERE id = NEW.gym_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーを作成
DROP TRIGGER IF EXISTS update_gym_rating_on_review ON public.gym_reviews;
CREATE TRIGGER update_gym_rating_on_review
AFTER INSERT OR UPDATE OR DELETE ON public.gym_reviews
FOR EACH ROW EXECUTE FUNCTION update_gym_rating();

-- ジムの統計情報を更新する関数
CREATE OR REPLACE FUNCTION update_gym_stats() RETURNS TRIGGER AS $$
BEGIN
    -- ジムの会員数を更新
    UPDATE public.gyms
    SET 
        updated_at = NOW()
    WHERE id IN (NEW.gym_id, OLD.gym_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーを作成
DROP TRIGGER IF EXISTS update_gym_stats_on_membership ON public.gym_memberships;
CREATE TRIGGER update_gym_stats_on_membership
AFTER INSERT OR UPDATE OR DELETE ON public.gym_memberships
FOR EACH ROW EXECUTE FUNCTION update_gym_stats();