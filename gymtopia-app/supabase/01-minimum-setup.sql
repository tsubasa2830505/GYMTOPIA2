-- =====================================================
-- GYMTOPIA 2.0 - 最小構成セットアップ (Minimum Setup)
-- =====================================================
-- このファイルは最小限の3テーブルでアプリを動作させるためのSQL
-- 実行順序: このファイルを最初に実行してください
-- =====================================================

-- 必要な拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. gyms テーブル（ジム基本情報）
-- =====================================================
CREATE TABLE IF NOT EXISTS public.gyms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    area TEXT NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_gyms_area ON public.gyms(area);
CREATE INDEX IF NOT EXISTS idx_gyms_name ON public.gyms(name);

-- =====================================================
-- 2. equipment テーブル（設備マスター）
-- =====================================================
CREATE TABLE IF NOT EXISTS public.equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    maker TEXT NOT NULL,
    type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_equipment_name ON public.equipment(name);
CREATE INDEX IF NOT EXISTS idx_equipment_type ON public.equipment(type);

-- =====================================================
-- 3. gym_equipment テーブル（ジム設備在庫）
-- =====================================================
CREATE TABLE IF NOT EXISTS public.gym_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
    count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(gym_id, equipment_id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_gym_equipment_gym ON public.gym_equipment(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_equipment_equipment ON public.gym_equipment(equipment_id);

-- =====================================================
-- RLS設定（開発用: 無効化）
-- =====================================================
ALTER TABLE public.gyms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_equipment DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- サンプルデータ投入
-- =====================================================

-- ジムデータ
INSERT INTO public.gyms (name, area, address) VALUES
('ハンマーストレングス渋谷', '渋谷', '東京都渋谷区道玄坂1-1-1'),
('ゴールドジム原宿', '原宿', '東京都渋谷区神宮前3-2-1'),
('24/7ワークアウト新宿', '新宿', '東京都新宿区西新宿2-1-1'),
('エニタイムフィットネス六本木', '六本木', '東京都港区六本木3-5-1'),
('ジェクサー・フィットネス東京', '東京', '東京都千代田区丸の内1-9-1')
ON CONFLICT DO NOTHING;

-- 設備データ
INSERT INTO public.equipment (name, maker, type) VALUES
('チェストプレス', 'Technogym', 'machine'),
('ラットプルダウン', 'Life Fitness', 'machine'),
('レッグプレス', 'Cybex', 'machine'),
('ショルダープレス', 'Hammer Strength', 'machine'),
('アブドミナルクランチ', 'Technogym', 'machine'),
('ダンベル', 'IVANKO', 'free_weight'),
('バーベル', 'ELEIKO', 'free_weight'),
('EZバー', 'IVANKO', 'free_weight'),
('ケトルベル', 'ELEIKO', 'free_weight'),
('メディシンボール', 'Technogym', 'free_weight')
ON CONFLICT DO NOTHING;

-- 設備を全ジムに紐付け（サンプル）
INSERT INTO public.gym_equipment (gym_id, equipment_id, count)
SELECT 
    g.id, 
    e.id,
    CASE 
        WHEN e.type = 'machine' THEN 2
        WHEN e.type = 'free_weight' THEN 5
        ELSE 1
    END
FROM public.gyms g
CROSS JOIN public.equipment e
ON CONFLICT DO NOTHING;

-- =====================================================
-- 接続テスト用クエリ
-- =====================================================
-- 以下のクエリで動作確認できます:

-- テスト1: ジム一覧
-- SELECT * FROM gyms ORDER BY name;

-- テスト2: 設備一覧
-- SELECT * FROM equipment ORDER BY type, name;

-- テスト3: ジムごとの設備数
-- SELECT 
--     g.name as gym_name,
--     COUNT(ge.id) as equipment_count,
--     SUM(ge.count) as total_units
-- FROM gyms g
-- LEFT JOIN gym_equipment ge ON g.id = ge.gym_id
-- GROUP BY g.id, g.name
-- ORDER BY equipment_count DESC;