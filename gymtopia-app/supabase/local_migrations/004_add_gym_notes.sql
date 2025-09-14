-- ユーザーごとのジムメモ機能を追加
CREATE TABLE IF NOT EXISTS gym_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  is_private BOOLEAN DEFAULT true, -- プライベートメモかパブリックコメントか
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),

  -- ユーザーとジムの組み合わせでユニーク（プライベートメモの場合）
  CONSTRAINT unique_user_gym_note UNIQUE(gym_id, user_id, is_private)
);

-- インデックスを追加
CREATE INDEX idx_gym_notes_gym_id ON gym_notes(gym_id);
CREATE INDEX idx_gym_notes_user_id ON gym_notes(user_id);
CREATE INDEX idx_gym_notes_created_at ON gym_notes(created_at DESC);

-- RLS (Row Level Security) を有効化
ALTER TABLE gym_notes ENABLE ROW LEVEL SECURITY;

-- ポリシーを作成
-- ユーザーは自分のメモを読み書きできる
CREATE POLICY "Users can view own notes" ON gym_notes
  FOR SELECT USING (auth.uid() = user_id OR is_private = false);

CREATE POLICY "Users can create own notes" ON gym_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON gym_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON gym_notes
  FOR DELETE USING (auth.uid() = user_id);

-- 更新時刻を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gym_notes_updated_at
  BEFORE UPDATE ON gym_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- コメントを追加
COMMENT ON TABLE gym_notes IS 'ユーザーごとのジムに関するメモ・コメント';
COMMENT ON COLUMN gym_notes.note IS 'メモの内容（自由記述）';
COMMENT ON COLUMN gym_notes.is_private IS 'true: 個人メモ, false: 公開コメント';