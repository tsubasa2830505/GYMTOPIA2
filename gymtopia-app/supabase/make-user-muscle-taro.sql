-- Make a specific user the canonical "筋トレマニア太郎" (test user)
-- How to use:
-- 1) Open Supabase Dashboard → SQL Editor
-- 2) Paste this script, optionally change v_email to your login email
-- 3) Run. If the user (auth.users) does not exist, create it first via Dashboard/Auth

DO $$
DECLARE
  v_email   text := 'tsubasa.a.283.0505@gmail.com';
  v_user_id uuid;
BEGIN
  -- Find the user in Supabase Auth
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'User with email % not found in auth.users. Create the user first.', v_email;
    RETURN;
  END IF;

  -- Upsert profile as 筋トレマニア太郎
  INSERT INTO public.profiles (id, username, display_name, bio, updated_at)
  VALUES (
    v_user_id,
    'muscle_taro',
    '筋トレマニア太郎',
    'テストユーザー（本人アカウント）。自動設定スクリプトにより更新。',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    username     = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    bio          = EXCLUDED.bio,
    updated_at   = NOW();

  RAISE NOTICE 'Updated profiles: id=% as 筋トレマニア太郎 (username=muscle_taro)', v_user_id;
END $$;

