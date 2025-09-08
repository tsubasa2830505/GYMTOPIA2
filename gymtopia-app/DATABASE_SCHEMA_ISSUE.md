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

## 解決案（最終方針）

長期運用では `public.users (auth.users拡張)` を正とし、全テーブルの `user_id` を `public.users(id)` に統一します。

### 実施内容（済）
- `supabase/08-unified-schema.sql` を追加：
  - `public.users` と `public.user_profiles` を定義（拡張・トリガー・RLS含む）
  - 既存テーブルの外部キーを `public.users(id)` へ移行（IF EXISTSで安全）
- アプリ側の参照を `profiles` から `users` へ更新（埋め込みやJOINの置換）

### 実行手順
1. Supabase SQLエディタで `supabase/08-unified-schema.sql` を実行
2. 旧`profiles`テーブルにユーザーデータがある場合は、`public.users`へ移行（バックアップ推奨）
3. アプリ再デプロイ（埋め込み先を`users`に変更済み）

注意: `complete-database-setup.sql` の一部は学習用サンプルです。実運用では `08-unified-schema.sql` に従ってください。

## 現在のワークアラウンド
- 開発モードではモック認証を使用してデータベース依存を回避
- プロフィール関連の関数では、データベースエラー時にモックデータにフォールバック

## 注意事項
本番環境にデプロイする前に、この競合を解決することが必須です。
