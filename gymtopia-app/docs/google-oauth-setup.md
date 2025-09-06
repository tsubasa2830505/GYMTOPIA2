# Google OAuth設定ガイド

## 簡単な設定方法（テスト用）

### 1. Google Cloud Consoleにアクセス
https://console.cloud.google.com/

### 2. 新しいプロジェクトを作成
- 右上のプロジェクトセレクタ → 「新しいプロジェクト」
- プロジェクト名：GYMTOPIA（任意）
- 作成

### 3. OAuth同意画面の設定
1. 左メニュー → 「APIとサービス」→「OAuth同意画面」
2. User Type：「外部」を選択 → 作成
3. 必須項目のみ入力：
   - アプリ名：GYMTOPIA
   - ユーザーサポートメール：あなたのメール
   - デベロッパー連絡先：あなたのメール
4. 保存して次へ
5. スコープ：そのまま次へ
6. テストユーザー：あなたのGmailを追加
7. 保存

### 4. OAuth 2.0 クライアントIDの作成
1. 「認証情報」→「認証情報を作成」→「OAuth クライアント ID」
2. アプリケーションの種類：**ウェブアプリケーション**
3. 名前：GYMTOPIA Web
4. 承認済みのリダイレクトURI：
   ```
   https://htytewqvkgwyuvcsvjwm.supabase.co/auth/v1/callback
   ```
5. 作成

### 5. 認証情報をコピー
作成後、以下が表示されます：
- **クライアント ID**: `xxx.apps.googleusercontent.com`
- **クライアント シークレット**: `GOCSPX-xxx...`

これらをSupabaseに貼り付けてください。

## Supabaseに設定を入力

1. Supabaseの認証プロバイダー設定画面に戻る
2. Google設定に入力：
   - Client ID (for OAuth): コピーしたクライアントID
   - Client Secret (for OAuth): コピーしたクライアントシークレット
3. 「Save」をクリック

## 確認
http://localhost:3000/auth/login でGoogleログインボタンをテスト