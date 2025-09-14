# Supabase認証設定ガイド

## 重要：Supabaseダッシュボードで以下の設定を行ってください

### 1. 認証設定ページにアクセス
1. https://supabase.com/dashboard にログイン
2. プロジェクト「htytewqvkgwyuvcsvjwm」を選択
3. 左メニューから「Authentication」→「URL Configuration」を選択

### 2. リダイレクトURLの設定
以下のURLを「Redirect URLs」に追加してください：

```
http://localhost:3000/auth/callback
http://localhost:3001/auth/callback
http://localhost:3002/auth/callback
https://gymtopia-dvnkndwee-tsubasaa2830505-7621s-projects.vercel.app/auth/callback
```

### 3. サイトURLの設定
「Site URL」を以下に設定：
```
http://localhost:3000
```

### 4. Google OAuth設定の確認
1. 「Authentication」→「Providers」→「Google」
2. 「Enabled」がONになっていることを確認
3. Client IDとClient Secretが設定されていることを確認

## ローカル環境での確認事項

### 環境変数（.env.local）
```env
NEXT_PUBLIC_SUPABASE_URL=https://htytewqvkgwyuvcsvjwm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMzQyNDYsImV4cCI6MjA3MjcxMDI0Nn0.xltaH28adx1dIhsqaWllLDPEjw8iDrSglDIwj19rXnA
```

## トラブルシューティング

### ログインループが発生する場合
1. ブラウザのCookieをクリア
2. SupabaseダッシュボードでリダイレクトURLが正しく設定されているか確認
3. ローカルストレージをクリア（開発者ツール → Application → Local Storage）

### "Database error saving new user"エラーが出る場合
すでに修正済み（auth.usersトリガーを正しく設定）

## 動作確認手順
1. http://localhost:3000/auth/login にアクセス
2. 「Googleでログイン」をクリック
3. Googleアカウントを選択
4. 自動的に /admin ページへリダイレクトされる