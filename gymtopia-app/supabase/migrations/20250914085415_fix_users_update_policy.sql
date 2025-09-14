-- 既存のupdate policyを削除
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- 新しいupdate policyを作成（with_checkを追加）
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- デバッグ用: 現在のauth.uid()を確認できるようにする
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT auth.uid();
$$;;
