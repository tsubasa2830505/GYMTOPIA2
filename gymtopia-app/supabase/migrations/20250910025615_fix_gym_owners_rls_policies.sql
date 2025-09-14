-- 既存のRLSポリシーを削除して再作成
DROP POLICY IF EXISTS "Gym owners can view their own relationships" ON gym_owners;

-- ユーザーが自分のオーナー関係を見れるポリシー
CREATE POLICY "Users can view their own gym ownership"
  ON gym_owners
  FOR SELECT
  USING (auth.uid() = user_id);

-- 管理者は全てのオーナー関係を見れる
CREATE POLICY "Admins can view all gym ownerships"
  ON gym_owners
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- ユーザーは自分のオーナー関係を作成できる（申請経由）
CREATE POLICY "Users can create their own gym ownership"
  ON gym_owners
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のオーナー関係を更新できる
CREATE POLICY "Users can update their own gym ownership"
  ON gym_owners
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のオーナー関係を削除できる
CREATE POLICY "Users can delete their own gym ownership"
  ON gym_owners
  FOR DELETE
  USING (auth.uid() = user_id);;
