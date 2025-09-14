-- ユーザーロールの列を追加（まだない場合）
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user',
ADD COLUMN IF NOT EXISTS is_gym_owner BOOLEAN DEFAULT false;

-- ジムオーナーテーブル（ユーザーとジムの関連付け）
CREATE TABLE IF NOT EXISTS gym_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'owner', -- owner, manager, staff
  permissions JSONB DEFAULT '{"canEditBasicInfo": true, "canManageEquipment": true, "canReplyReviews": true, "canViewStats": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, gym_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_gym_owners_user_id ON gym_owners(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_owners_gym_id ON gym_owners(gym_id);

-- RLSポリシー
ALTER TABLE gym_owners ENABLE ROW LEVEL SECURITY;

-- ジムオーナーは自分の関連を見れる
CREATE POLICY "Gym owners can view their own relationships" 
ON gym_owners 
FOR SELECT 
USING (auth.uid() = user_id);

-- ジムオーナーは自分のジムの情報を更新できる
CREATE POLICY "Gym owners can update their own gym" 
ON gyms 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM gym_owners 
    WHERE gym_owners.gym_id = gyms.id 
    AND gym_owners.user_id = auth.uid()
    AND (gym_owners.permissions->>'canEditBasicInfo')::boolean = true
  )
);

-- ジムオーナーは自分のジムのマシン情報を管理できる
CREATE POLICY "Gym owners can manage their gym machines" 
ON gym_machines 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM gym_owners 
    WHERE gym_owners.gym_id = gym_machines.gym_id 
    AND gym_owners.user_id = auth.uid()
    AND (gym_owners.permissions->>'canManageEquipment')::boolean = true
  )
);

-- ジムオーナーは自分のジムのレビューに返信できる
CREATE POLICY "Gym owners can reply to reviews" 
ON gym_reviews 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM gym_owners 
    WHERE gym_owners.gym_id = gym_reviews.gym_id 
    AND gym_owners.user_id = auth.uid()
    AND (gym_owners.permissions->>'canReplyReviews')::boolean = true
  )
);

-- 関数：ユーザーが管理するジムを取得
CREATE OR REPLACE FUNCTION get_user_managed_gyms(user_uuid UUID)
RETURNS TABLE (
  gym_id UUID,
  gym_name VARCHAR,
  role VARCHAR,
  permissions JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id as gym_id,
    g.name as gym_name,
    go.role,
    go.permissions
  FROM gym_owners go
  JOIN gyms g ON g.id = go.gym_id
  WHERE go.user_id = user_uuid
  AND g.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- サンプルデータ（テスト用）
-- 既存のユーザーをジムオーナーに設定する例
-- INSERT INTO gym_owners (user_id, gym_id, role) 
-- SELECT 
--   (SELECT id FROM users LIMIT 1),
--   (SELECT id FROM gyms WHERE name LIKE 'ハンマーストレングス%' LIMIT 1),
--   'owner'
-- ON CONFLICT DO NOTHING;;
