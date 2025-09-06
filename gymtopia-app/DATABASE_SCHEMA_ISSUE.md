# データベーススキーマの競合問題

## 問題の概要
現在のプロジェクトには2つの競合するデータベーススキーマが存在しています：

### 1. ユーザーテーブル（`001_create_users_table.sql`）
- `public.users` テーブルが `auth.users(id)` を参照
- `public.user_profiles` テーブルが `public.users(id)` を参照

### 2. プロフィールテーブル（`04-user-system.sql`）
- `public.profiles` テーブルが `auth.users(id)` を参照
- その他のテーブル（follows, gym_reviews等）が `public.profiles(id)` を参照

## エラーの詳細
```
ERROR: 23503: insert or update on table "users" violates foreign key constraint "users_id_fkey"
DETAIL: Key (id)=(00000000-0000-0000-0000-000000000001) is not present in table "users".
```

このエラーは、開発環境のモック認証システムが UUID `00000000-0000-0000-0000-000000000001` を使用しようとしているが、実際のSupabase認証テーブル（`auth.users`）にそのUUIDが存在しないことが原因です。

## 影響
- 現在の開発環境ではモック認証を使用しているため、アプリケーション機能には影響なし
- データベース操作を伴うSupabase認証機能を使用する際にエラーが発生する可能性

## 解決案

### 選択肢1: プロフィールベーススキーマを使用（推奨）
`04-user-system.sql`のスキーマを採用し、`001_create_users_table.sql`の内容を統合

### 選択肢2: ユーザーベーススキーマを使用
`001_create_users_table.sql`のスキーマを採用し、他のテーブルの参照を修正

### 選択肢3: 開発モード用のダミーデータ挿入
開発環境でのみ、`auth.users`にモックユーザーを挿入

## 推奨する実装手順
1. データベーススキーマの統一（プロフィールベースを推奨）
2. 既存の型定義とAPI関数の更新
3. モック認証システムの調整
4. テストの実行と確認

## 現在のワークアラウンド
- 開発モードではモック認証を使用してデータベース依存を回避
- プロフィール関連の関数では、データベースエラー時にモックデータにフォールバック

## 注意事項
本番環境にデプロイする前に、この競合を解決することが必須です。