-- usersテーブルのRLSを一時的に無効化（テスト用）
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- または、より寛容なポリシーを作成
-- すべてのユーザーが更新可能にする（開発環境用）
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "Allow all updates for development" ON users
    FOR UPDATE
    USING (true)
    WITH CHECK (true);;
