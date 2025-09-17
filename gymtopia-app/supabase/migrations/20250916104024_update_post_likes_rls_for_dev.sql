-- post_likesテーブルの既存のポリシーを削除
DROP POLICY IF EXISTS "post_likes_mutate_self" ON post_likes;

-- 開発用の緩いポリシーを作成（誰でもいいねできる）
CREATE POLICY "Allow all operations for development" ON post_likes
FOR ALL
USING (true)
WITH CHECK (true);;
