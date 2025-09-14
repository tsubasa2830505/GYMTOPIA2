-- username_format制約を削除（OAuthログインに対応するため）
ALTER TABLE users DROP CONSTRAINT IF EXISTS username_format;

-- より柔軟な制約を追加（NULL許可、または英数字・アンダースコア・ハイフン）
ALTER TABLE users ADD CONSTRAINT username_format 
  CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9_-]+$');

-- handle_new_userトリガー関数を更新
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- メールアドレスからユーザー名を生成（@より前の部分を使用）
  -- 特殊文字を除去してアンダースコアに置換
  NEW.username := COALESCE(
    NEW.username,
    regexp_replace(
      split_part(NEW.email, '@', 1),
      '[^a-zA-Z0-9_-]',
      '_',
      'g'
    )
  );
  
  -- display_nameが未設定の場合はメールアドレスの@より前を使用
  NEW.display_name := COALESCE(NEW.display_name, split_part(NEW.email, '@', 1));
  
  -- デフォルト値を設定
  NEW.created_at := COALESCE(NEW.created_at, NOW());
  NEW.updated_at := NOW();
  NEW.is_gym_owner := COALESCE(NEW.is_gym_owner, false);
  NEW.role := COALESCE(NEW.role, 'user');
  
  RETURN NEW;
END;
$$;;
