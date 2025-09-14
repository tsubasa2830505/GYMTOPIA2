-- 画像アップロード用のストレージバケットを作成
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gym-posts', 'gym-posts', true);

-- バケットのRLSポリシーを設定（全ユーザーがアップロード・読み取り可能）
CREATE POLICY "Allow public uploads for gym posts" ON storage.objects 
FOR INSERT TO public 
WITH CHECK (bucket_id = 'gym-posts');

CREATE POLICY "Allow public access to gym post images" ON storage.objects 
FOR SELECT TO public 
USING (bucket_id = 'gym-posts');

-- 認証済みユーザーは自分のファイルを削除可能
CREATE POLICY "Allow users to delete their own gym post images" ON storage.objects 
FOR DELETE TO authenticated 
USING (bucket_id = 'gym-posts');;
