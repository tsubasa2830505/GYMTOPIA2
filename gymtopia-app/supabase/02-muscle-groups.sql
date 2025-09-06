-- =====================================================
-- muscle_groups テーブル（筋肉部位マスター）
-- MachineSelectorコンポーネントで使用
-- =====================================================

-- muscle_groups テーブル作成
CREATE TABLE IF NOT EXISTS public.muscle_groups (
    id INTEGER PRIMARY KEY,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_muscle_groups_category ON public.muscle_groups(category);

-- RLS無効化（開発用）
ALTER TABLE public.muscle_groups DISABLE ROW LEVEL SECURITY;

-- 既存データをクリア
TRUNCATE TABLE public.muscle_groups;

-- データ投入（MachineSelectorコンポーネントと同じ構造）
-- 各部位を個別の行として保存
INSERT INTO public.muscle_groups (id, category, name) VALUES
-- 胸
(1, '胸_1', '上部'),
(2, '胸_2', '中部'),
(3, '胸_3', '下部'),
-- 背中
(4, '背中_1', '上部'),
(5, '背中_2', '中部'),
(6, '背中_3', '下部'),
(7, '背中_4', '僧帽筋'),
-- 肩
(8, '肩_1', '前部'),
(9, '肩_2', '中部'),
(10, '肩_3', '後部'),
-- 脚
(11, '脚_1', '大腿四頭筋'),
(12, '脚_2', 'ハムストリング'),
(13, '脚_3', '臀筋'),
(14, '脚_4', 'カーフ'),
(15, '脚_5', '内転筋'),
(16, '脚_6', '外転筋'),
-- 腕
(17, '腕_1', '二頭筋'),
(18, '腕_2', '三頭筋'),
-- 体幹
(19, '体幹_1', '腹直筋'),
(20, '体幹_2', '腹斜筋'),
(21, '体幹_3', '下背部');

-- =====================================================
-- 動作確認用クエリ
-- =====================================================
-- SELECT * FROM muscle_groups ORDER BY id;
-- SELECT category, COUNT(*) as parts_count FROM muscle_groups GROUP BY category ORDER BY category;