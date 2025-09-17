-- followsテーブルにユニーク制約を追加（重複フォロー防止）
ALTER TABLE follows 
DROP CONSTRAINT IF EXISTS unique_follower_following;

ALTER TABLE follows 
ADD CONSTRAINT unique_follower_following 
UNIQUE (follower_id, following_id);

-- パフォーマンス向上のためのインデックス追加
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON follows(created_at DESC);

-- 自己フォロー防止のチェック制約
ALTER TABLE follows 
DROP CONSTRAINT IF EXISTS check_no_self_follow;

ALTER TABLE follows 
ADD CONSTRAINT check_no_self_follow 
CHECK (follower_id != following_id);

-- RLSポリシーを有効化
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can view follows" ON follows;
DROP POLICY IF EXISTS "Users can create follows" ON follows;
DROP POLICY IF EXISTS "Users can delete their own follows" ON follows;

-- 新しいRLSポリシーを作成
-- 誰でもフォロー関係を見れる
CREATE POLICY "Users can view follows" 
ON follows FOR SELECT 
USING (true);

-- ログインユーザーは自分のフォローを作成できる
CREATE POLICY "Users can create follows" 
ON follows FOR INSERT 
WITH CHECK (auth.uid() = follower_id);

-- ログインユーザーは自分のフォローを削除できる
CREATE POLICY "Users can delete their own follows" 
ON follows FOR DELETE 
USING (auth.uid() = follower_id);;
