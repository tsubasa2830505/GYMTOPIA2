# 🔐 Supabase認証 - 現在の状況

## ⚠️ 現在の状態
**メール認証が無効** - Supabaseダッシュボードでの設定が必要

## 📋 必要な作業

### 1. Supabaseダッシュボードにアクセス
```
https://supabase.com/dashboard/project/htytewqvkgwyuvcsvjwm/auth/providers
```

### 2. 以下の設定を行ってください：

#### Email Provider設定
1. **Email** セクションを探す
2. **Enable Email Provider** を **ON** にする ✅
3. **Save** をクリック

#### URL Configuration設定
1. **Authentication → URL Configuration** に移動
2. 設定:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: 
     ```
     http://localhost:3000/auth/callback
     ```

## 🔍 設定確認方法

設定後、以下のコマンドで確認：
```bash
# テストユーザー作成
curl -X POST "https://htytewqvkgwyuvcsvjwm.supabase.co/auth/v1/signup" \
  -H "apikey: [あなたのAPIキー]" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test1234!"}'
```

成功すると以下のようなレスポンスが返ります：
```json
{
  "access_token": "...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "id": "...",
    "email": "test@example.com"
  }
}
```

## 📝 アプリ側の準備状況

### ✅ 実装済み
- `/auth/login` - ログインページ
- `/auth/signup` - サインアップページ
- Supabaseクライアント設定
- 環境変数設定

### ⏳ 待機中
- Supabaseダッシュボードでの認証有効化

## 🚀 設定後の動作

1. **ユーザー登録**
   - http://localhost:3000/auth/signup でメール/パスワード登録
   
2. **ログイン**
   - http://localhost:3000/auth/login でログイン

3. **自動プロフィール作成**
   - profilesテーブルに自動でレコード作成（SQL実行後）

## ❓ よくある質問

**Q: なぜ設定が必要？**
A: セキュリティのため、デフォルトでは認証が無効になっています

**Q: Google認証も使いたい**
A: Providers → Google で設定可能（Client ID/Secret必要）

**Q: メール確認をスキップしたい**
A: 開発中は「Confirm email」をOFFにすると便利

---
*Supabaseダッシュボードでの設定をお願いします*