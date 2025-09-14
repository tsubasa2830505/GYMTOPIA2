-- 既存のトリガーを削除
DROP TRIGGER IF EXISTS on_auth_user_created ON users;

-- auth.usersテーブルに対して正しいトリガーを作成
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, username, display_name, created_at, is_gym_owner, role)
  VALUES (
    NEW.id,
    NEW.email,
    -- メールアドレスからユーザー名を生成
    regexp_replace(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9_-]', '_', 'g'),
    -- display_nameにはメールの@前を使用
    split_part(NEW.email, '@', 1),
    NOW(),
    false,
    'user'
  );
  RETURN NEW;
END;
$$;

-- auth.usersテーブルにトリガーを設定
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();;
