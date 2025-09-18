-- チェックインテーブルの作成
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  note TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_gym_id ON check_ins(gym_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_checked_in_at ON check_ins(checked_in_at DESC);

-- RLSポリシーを設定
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Users can view own check-ins" ON check_ins;
DROP POLICY IF EXISTS "Users can create own check-ins" ON check_ins;
DROP POLICY IF EXISTS "Anyone can view public check-ins" ON check_ins;

-- 自分のチェックインを見ることができる
CREATE POLICY "Users can view own check-ins" ON check_ins
  FOR SELECT USING (auth.uid() = user_id);

-- 自分のチェックインを作成できる
CREATE POLICY "Users can create own check-ins" ON check_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 公開チェックイン（フィードなど）を見ることができる
CREATE POLICY "Anyone can view public check-ins" ON check_ins
  FOR SELECT USING (true);