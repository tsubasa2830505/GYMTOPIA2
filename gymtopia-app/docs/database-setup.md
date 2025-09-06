# Database Setup Guide - Phase 1: Authentication

## 概要
GYMTOPIA 2.0のデータベース基盤構築の第1フェーズ：認証システムの実装ガイド

## セットアップ手順

### 1. Supabaseプロジェクトの準備

1. [Supabase Dashboard](https://supabase.com/dashboard/project/onfqhnhdfbovgcnksatu)にアクセス
2. SQL Editorを開く

### 2. データベースマイグレーション実行

1. SQL Editorで以下のファイルを実行：
   ```sql
   -- supabase/migrations/001_create_users_table.sql の内容をコピー＆ペースト
   ```

2. 実行結果を確認（エラーがないこと）

### 3. Supabase認証設定

#### 3.1 Email認証の有効化
1. Authentication → Providers → Email を有効化
2. 以下の設定を確認：
   - Enable Email Signup: ON
   - Enable Email Confirmations: ON（本番環境）/ OFF（開発環境）
   - Minimum password length: 8

#### 3.2 認証メールテンプレート設定
1. Authentication → Email Templates
2. 各テンプレートを日本語化（任意）

#### 3.3 認証URLの設定
1. Authentication → URL Configuration
2. Site URL: `http://localhost:3000`（開発）
3. Redirect URLs: 
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/reset-password`

### 4. 環境変数の確認

`.env.local`に以下が設定されていることを確認：
```env
NEXT_PUBLIC_SUPABASE_URL=https://onfqhnhdfbovgcnksatu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJ...
```

## テーブル構造

### users テーブル
| カラム名 | 型 | 説明 | 制約 |
|---------|------|------|------|
| id | UUID | ユーザーID（Auth連携） | PK, FK(auth.users) |
| email | TEXT | メールアドレス | UNIQUE, NOT NULL |
| username | TEXT | ユーザー名 | UNIQUE, 3-30文字, 英数字_ |
| display_name | TEXT | 表示名 | 最大50文字 |
| avatar_url | TEXT | アバター画像URL | - |
| bio | TEXT | 自己紹介 | 最大500文字 |
| is_active | BOOLEAN | アクティブ状態 | DEFAULT true |
| email_verified | BOOLEAN | メール確認済み | DEFAULT false |
| created_at | TIMESTAMPTZ | 作成日時 | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | 更新日時 | DEFAULT NOW() |
| last_seen_at | TIMESTAMPTZ | 最終ログイン日時 | - |

### user_profiles テーブル
| カラム名 | 型 | 説明 | 制約 |
|---------|------|------|------|
| user_id | UUID | ユーザーID | PK, FK(users) |
| gym_experience_years | DECIMAL(3,1) | ジム歴（年） | 0-100 |
| training_frequency | TEXT | トレーニング頻度 | ENUM値 |
| training_goals | TEXT[] | トレーニング目標 | 配列 |
| preferred_training_time | TEXT | 希望トレーニング時間 | ENUM値 |
| height_cm | INTEGER | 身長（cm） | 50-300 |
| weight_kg | DECIMAL(5,2) | 体重（kg） | 20-500 |
| body_fat_percentage | DECIMAL(4,1) | 体脂肪率（%） | 0-100 |
| profile_visibility | TEXT | プロフィール公開設定 | public/friends/private |
| show_stats | BOOLEAN | 統計表示設定 | DEFAULT false |

## Row Level Security (RLS) ポリシー

### users テーブル
- **閲覧**: 全ユーザーが全プロフィールを閲覧可能
- **更新**: 自分のプロフィールのみ更新可能
- **挿入**: 自分のプロフィールのみ作成可能

### user_profiles テーブル  
- **閲覧**: publicプロフィールは全員、それ以外は本人のみ
- **更新/削除**: 自分のプロフィールのみ
- **挿入**: 自分のプロフィールのみ

## 自動化機能

### トリガー
1. **新規ユーザー作成時**: auth.usersに挿入時、自動的にpublic.usersとuser_profilesにレコード作成
2. **タイムスタンプ更新**: UPDATE時にupdated_atを自動更新

### 関数
- `handle_new_user()`: 新規ユーザープロフィール自動作成
- `update_updated_at_column()`: タイムスタンプ自動更新

## 次のステップ

### 実装予定のAPI関数（src/lib/supabase/auth.ts）
```typescript
// ユーザー登録
async function signUp(data: UserRegistrationData)

// ログイン
async function signIn(data: UserLoginData)  

// ログアウト
async function signOut()

// プロフィール取得
async function getUserProfile(userId: string)

// プロフィール更新
async function updateUserProfile(data: UserProfileUpdateData)
```

### UI実装予定
1. サインアップ画面 (`/auth/signup`)
2. ログイン画面 (`/auth/login`)
3. プロフィール編集画面 (`/profile/edit`)
4. パスワードリセット画面 (`/auth/reset-password`)

## トラブルシューティング

### よくあるエラーと対処法

1. **"relation does not exist"エラー**
   - 原因: テーブルが作成されていない
   - 対処: マイグレーションSQLを再実行

2. **"permission denied"エラー**
   - 原因: RLSポリシーが正しく設定されていない
   - 対処: RLSポリシーを確認、auth.uid()が正しく取得できているか確認

3. **"duplicate key"エラー**
   - 原因: ユニーク制約違反（email, username）
   - 対処: 既存データを確認、重複を解消

## 注意事項

- **本番環境移行時**:
  - Email Confirmationsを必ずONにする
  - テストデータ（コメントアウト部分）を削除
  - パスワードポリシーを強化
  - Rate Limitingを設定

- **セキュリティ**:
  - Supabase Anon Keyは公開可能（RLSで保護）
  - Service Role Keyは絶対に公開しない
  - 環境変数は.env.localに保存

## 参考リンク

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)