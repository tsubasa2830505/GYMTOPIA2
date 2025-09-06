-- =====================================================
-- equipment テーブルにサンプルデータを追加
-- =====================================================

-- equipment テーブルにデータ投入
INSERT INTO public.equipment (id, name, brand, type, category, muscle_groups, created_at) VALUES
-- チェスト系マシン
(gen_random_uuid(), 'チェストプレス', 'Technogym', 'machine', 'chest', ARRAY['chest'], NOW()),
(gen_random_uuid(), 'ペックフライ', 'Life Fitness', 'machine', 'chest', ARRAY['chest'], NOW()),
(gen_random_uuid(), 'インクラインチェストプレス', 'Hammer Strength', 'machine', 'chest', ARRAY['chest'], NOW()),

-- バック系マシン
(gen_random_uuid(), 'ラットプルダウン', 'Cybex', 'machine', 'back', ARRAY['back'], NOW()),
(gen_random_uuid(), 'シーテッドロー', 'Technogym', 'machine', 'back', ARRAY['back'], NOW()),
(gen_random_uuid(), 'アシストプルアップ', 'Life Fitness', 'machine', 'back', ARRAY['back', 'arms'], NOW()),

-- レッグ系マシン
(gen_random_uuid(), 'レッグプレス', 'Hammer Strength', 'machine', 'legs', ARRAY['legs'], NOW()),
(gen_random_uuid(), 'レッグエクステンション', 'Cybex', 'machine', 'legs', ARRAY['legs'], NOW()),
(gen_random_uuid(), 'レッグカール', 'Technogym', 'machine', 'legs', ARRAY['legs'], NOW()),
(gen_random_uuid(), 'カーフレイズ', 'Life Fitness', 'machine', 'legs', ARRAY['legs'], NOW()),

-- ショルダー系マシン
(gen_random_uuid(), 'ショルダープレス', 'Hammer Strength', 'machine', 'shoulder', ARRAY['shoulder'], NOW()),
(gen_random_uuid(), 'サイドレイズ', 'Technogym', 'machine', 'shoulder', ARRAY['shoulder'], NOW()),

-- アーム系マシン
(gen_random_uuid(), 'バイセップカール', 'Life Fitness', 'machine', 'arms', ARRAY['arms'], NOW()),
(gen_random_uuid(), 'トライセップエクステンション', 'Cybex', 'machine', 'arms', ARRAY['arms'], NOW()),

-- コア系マシン
(gen_random_uuid(), 'アブドミナルクランチ', 'Technogym', 'machine', 'core', ARRAY['core'], NOW()),
(gen_random_uuid(), 'バックエクステンション', 'Hammer Strength', 'machine', 'core', ARRAY['core'], NOW()),

-- フリーウェイト
(gen_random_uuid(), 'ダンベル（1-40kg）', 'IVANKO', 'free_weight', 'free_weight', ARRAY['all'], NOW()),
(gen_random_uuid(), 'バーベル（20kg）', 'ELEIKO', 'free_weight', 'free_weight', ARRAY['all'], NOW()),
(gen_random_uuid(), 'EZバー', 'IVANKO', 'free_weight', 'free_weight', ARRAY['arms'], NOW()),
(gen_random_uuid(), 'ケトルベル（4-32kg）', 'ELEIKO', 'free_weight', 'free_weight', ARRAY['all'], NOW()),

-- カーディオ機器
(gen_random_uuid(), 'トレッドミル', 'Technogym', 'cardio', 'cardio', ARRAY['cardio'], NOW()),
(gen_random_uuid(), 'エアロバイク', 'Life Fitness', 'cardio', 'cardio', ARRAY['cardio'], NOW()),
(gen_random_uuid(), 'クロストレーナー', 'Cybex', 'cardio', 'cardio', ARRAY['cardio'], NOW()),
(gen_random_uuid(), 'ローイングマシン', 'Concept2', 'cardio', 'cardio', ARRAY['cardio'], NOW())
ON CONFLICT DO NOTHING;

-- =====================================================
-- 既存のジムに設備を追加
-- =====================================================

-- 既存のジムIDを取得して設備を関連付け
WITH gym_list AS (
    SELECT id FROM public.gyms LIMIT 5
),
equipment_list AS (
    SELECT id, type, category FROM public.equipment
)
INSERT INTO public.gym_equipment (gym_id, category, type, brand, quantity, muscle_groups)
SELECT 
    g.id as gym_id,
    e.category,
    e.type,
    'Various' as brand,
    CASE 
        WHEN e.type = 'machine' THEN floor(random() * 3 + 1)::integer
        WHEN e.type = 'free_weight' THEN floor(random() * 5 + 1)::integer
        WHEN e.type = 'cardio' THEN floor(random() * 10 + 3)::integer
        ELSE 1
    END as quantity,
    ARRAY['all'] as muscle_groups
FROM gym_list g
CROSS JOIN equipment_list e
ON CONFLICT DO NOTHING;

-- =====================================================
-- 動作確認用クエリ
-- =====================================================
-- 設備の総数確認
-- SELECT COUNT(*) as total_equipment FROM equipment;

-- カテゴリ別の設備数
-- SELECT category, COUNT(*) as count 
-- FROM equipment 
-- GROUP BY category 
-- ORDER BY category;

-- ジムごとの設備数
-- SELECT 
--     g.name as gym_name,
--     COUNT(DISTINCT ge.id) as equipment_types,
--     SUM(ge.quantity) as total_units
-- FROM gyms g
-- LEFT JOIN gym_equipment ge ON g.id = ge.gym_id
-- GROUP BY g.id, g.name
-- ORDER BY total_units DESC;