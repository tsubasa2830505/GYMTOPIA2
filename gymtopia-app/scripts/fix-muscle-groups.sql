-- =============================================
-- muscle_groups テーブルを再作成（各部位1行形式）
-- =============================================

-- 1. 既存テーブルを削除
DROP TABLE IF EXISTS muscle_groups CASCADE;

-- 2. テーブルを再作成（categoryのユニーク制約なし）
CREATE TABLE muscle_groups (
    id INTEGER PRIMARY KEY,
    category TEXT NOT NULL,  -- ユニーク制約なし
    name TEXT NOT NULL,
    parts TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. データを挿入（各部位1行）
INSERT INTO muscle_groups (id, category, name, parts) VALUES
-- 肩（3部位）
(1, '肩', '三角筋後部', ARRAY['三角筋後部']),
(2, '肩', '三角筋前部', ARRAY['三角筋前部']),
(3, '肩', '三角筋中部', ARRAY['三角筋中部']),

-- 背中（5部位）
(4, '背中', '脊柱起立筋', ARRAY['脊柱起立筋']),
(5, '背中', '広背筋下部', ARRAY['広背筋下部']),
(6, '背中', '広背筋中部', ARRAY['広背筋中部']),
(7, '背中', '僧帽筋', ARRAY['僧帽筋']),
(8, '背中', '菱形筋', ARRAY['菱形筋']),

-- 胸（3部位）
(9, '胸', '大胸筋上部', ARRAY['大胸筋上部']),
(10, '胸', '大胸筋中部', ARRAY['大胸筋中部']),
(11, '胸', '大胸筋下部', ARRAY['大胸筋下部']),

-- 脚（7部位）
(12, '脚', '大臀筋', ARRAY['大臀筋']),
(13, '脚', '大腿四頭筋', ARRAY['大腿四頭筋']),
(14, '脚', '大腿直筋', ARRAY['大腿直筋']),
(15, '脚', '外側広筋', ARRAY['外側広筋']),
(16, '脚', '内側広筋', ARRAY['内側広筋']),
(17, '脚', 'ハムストリングス', ARRAY['ハムストリングス']),
(18, '脚', 'ヒラメ筋', ARRAY['ヒラメ筋']),

-- 腕（3部位）
(19, '腕', '前腕', ARRAY['前腕']),
(20, '腕', '上腕三頭筋', ARRAY['上腕三頭筋']),
(21, '腕', '上腕二頭筋', ARRAY['上腕二頭筋']),

-- 腹（3部位）
(22, '腹', '腹斜筋', ARRAY['腹斜筋']),
(23, '腹', '腹筋', ARRAY['腹筋']),
(24, '腹', '腹横筋', ARRAY['腹横筋']);

-- 4. インデックスを作成（検索高速化）
CREATE INDEX idx_muscle_groups_category ON muscle_groups(category);
CREATE INDEX idx_muscle_groups_name ON muscle_groups(name);

-- 5. RLSを有効化
ALTER TABLE muscle_groups ENABLE ROW LEVEL SECURITY;

-- 6. RLSポリシーを作成（誰でも閲覧可能）
CREATE POLICY "muscle_groups are viewable by everyone" 
ON muscle_groups FOR SELECT 
USING (true);

-- 完了メッセージ
-- ✅ muscle_groups テーブルが再作成されました（24部位、各部位1行）