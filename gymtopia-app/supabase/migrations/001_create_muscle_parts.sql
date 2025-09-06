-- muscle_partsテーブルの作成（テーブルID: 17328）
CREATE TABLE IF NOT EXISTS muscle_parts (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  parts TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックスの作成
CREATE INDEX idx_muscle_parts_category ON muscle_parts(category);

-- 初期データの挿入
INSERT INTO muscle_parts (category, name, parts) VALUES
  ('chest', '胸', ARRAY['大胸筋上部', '大胸筋中部', '大胸筋下部']),
  ('back', '背中', ARRAY['僧帽筋', '広背筋上部', '広背筋中部', '広背筋下部', '脊柱起立筋']),
  ('shoulder', '肩', ARRAY['三角筋前部', '三角筋中部', '三角筋後部']),
  ('legs', '脚', ARRAY['大腿四頭筋（大腿直筋）', '大腿四頭筋（外側広筋）', '大腿四頭筋（内側広筋）', 'ハムストリングス', '大臀筋', '中臀筋', 'ふくらはぎ（腓腹筋）', 'ふくらはぎ（ヒラメ筋）', '内転筋群', '外転筋群']),
  ('arms', '腕', ARRAY['上腕二頭筋', '上腕三頭筋', '前腕筋群']),
  ('core', '体幹', ARRAY['腹直筋', '腹斜筋', '腹横筋', '脊柱起立筋（下部）'])
ON CONFLICT (category) DO UPDATE
SET 
  name = EXCLUDED.name,
  parts = EXCLUDED.parts,
  updated_at = CURRENT_TIMESTAMP;

-- Row Level Security (RLS) の有効化
ALTER TABLE muscle_parts ENABLE ROW LEVEL SECURITY;

-- 読み取り専用ポリシーの作成（すべてのユーザーが閲覧可能）
CREATE POLICY "Allow public read access" ON muscle_parts
  FOR SELECT
  USING (true);

-- 更新トリガーの作成（updated_atの自動更新）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_muscle_parts_updated_at
  BEFORE UPDATE ON muscle_parts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();