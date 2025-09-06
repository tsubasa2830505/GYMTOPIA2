# 🔐 Supabase認証設定ガイド

## 📋 設定手順（5分で完了）

### Step 1: Supabaseダッシュボードを開く
```
https://supabase.com/dashboard/project/htytewqvkgwyuvcsvjwm/auth/users
```

### Step 2: メール認証を有効化

1. **Authentication → Providers** に移動
2. **Email** セクションを探す
3. 以下を設定:
   - **Enable Email Provider**: ON ✅
   - **Confirm email**: OFF（開発時）
   - **Secure email change**: OFF（開発時）
   - **Secure password update**: OFF（開発時）

### Step 3: Google OAuth設定（オプション）

1. **Authentication → Providers → Google**
2. **Enable Sign in with Google**: ON ✅
3. Google Cloud Consoleで:
   - OAuth 2.0 クライアントID作成
   - リダイレクトURI: `https://htytewqvkgwyuvcsvjwm.supabase.co/auth/v1/callback`
4. 取得した値を入力:
   - **Google Client ID**: [Google Cloudから取得]
   - **Google Client Secret**: [Google Cloudから取得]

### Step 4: URL設定

1. **Authentication → URL Configuration**
2. 設定:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: 
     ```
     http://localhost:3000/auth/callback
     https://gymtopia-2.vercel.app/auth/callback
     ```

### Step 5: ユーザーテーブルSQL実行

1. **SQL Editor** を開く
2. 新規クエリ作成
3. 以下を実行:

```sql
-- ユーザープロフィールテーブル作成
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 新規ユーザー登録時に自動でプロフィール作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'ユーザー')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガー設定
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS設定（開発中は無効）
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
```

### Step 6: テストユーザー作成

#### 方法A: Supabaseダッシュボード
1. **Authentication → Users**
2. **Add user → Create new user**
3. 入力:
   - Email: `test@example.com`
   - Password: `Test1234!`
4. **Create user** クリック

#### 方法B: アプリから登録
1. http://localhost:3000/auth/signup にアクセス
2. メールとパスワードで登録

## ✅ 動作確認

### 1. 登録テスト
```bash
curl -X POST "https://htytewqvkgwyuvcsvjwm.supabase.co/auth/v1/signup" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMzQyNDYsImV4cCI6MjA3MjcxMDI0Nn0.xltaH28adx1dIhsqaWllLDPEjw8iDrSglDIwj19rXnA" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

### 2. プロフィール確認
```sql
SELECT * FROM auth.users;
SELECT * FROM public.profiles;
```

## 🔍 トラブルシューティング

### エラー: "Email provider is not enabled"
→ Step 2でEmail Providerを有効化

### エラー: "Invalid email or password"
→ パスワードは6文字以上必要

### エラー: "User already exists"
→ 既に登録済みのメール

### プロフィールが作成されない
→ Step 5のトリガーを再実行

## 📝 次のステップ

1. ✅ 認証設定完了
2. → レビュー機能実装
3. → お気に入り機能実装
4. → フォロー機能実装

---
*最終更新: 2025-01-06*