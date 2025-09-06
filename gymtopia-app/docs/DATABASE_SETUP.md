# ジムトピア データベースセットアップガイド

## 📚 概要
ジムトピアはSupabase（PostgreSQL）を使用したモダンなデータベース設計を採用しています。

## 🚀 セットアップ手順

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://app.supabase.com)にアクセス
2. 新しいプロジェクトを作成
3. リージョンは「Northeast Asia (Tokyo)」を選択
4. プロジェクト名: `gymtopia`

### 2. 環境変数の設定

```bash
# .env.localファイルを作成
cp .env.local.example .env.local

# Supabaseダッシュボードから以下の値をコピー
# Settings > API から取得
```

### 3. データベースの初期化

Supabase SQL Editorで以下を実行：

```sql
-- 1. スキーマファイルを実行
-- supabase/schema.sqlの内容をコピー＆ペースト

-- 2. 初期データの投入（オプション）
-- supabase/seed.sqlの内容を実行
```

### 4. ストレージバケットの作成

Supabaseダッシュボード > Storage：

```sql
-- 画像アップロード用バケット作成
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('post-images', 'post-images', true),
  ('gym-images', 'gym-images', true);
```

## 📊 データベース構造

### 主要テーブル

#### profiles（ユーザープロファイル）
- Supabase Authと連携
- ユーザー名、表示名、自己紹介など

#### gyms（ジム情報）
- ジムの基本情報
- 位置情報（PostGIS使用）
- 施設情報（JSONB）

#### posts（ジム活投稿）
- ユーザーの投稿
- 混雑状況
- トレーニング詳細

#### リレーションテーブル
- likes（いいね）
- comments（コメント）
- follows（フォロー）
- gym_friends（ジム友）
- favorite_gyms（お気に入りジム）

## 🔐 セキュリティ設定

### Row Level Security (RLS)

すべてのテーブルでRLSが有効：

```sql
-- 例：投稿のRLSポリシー
-- 誰でも閲覧可能
-- 本人のみ編集・削除可能
-- 認証済みユーザーのみ作成可能
```

### 認証フロー

```typescript
// サインアップ
await auth.signUp(email, password, username)

// サインイン
await auth.signIn(email, password)

// サインアウト
await auth.signOut()
```

## 🎯 主要機能の実装

### ジム検索

```typescript
// キーワード検索
const gyms = await db.searchGyms({
  keyword: '渋谷',
  machines: ['chest_press'],
  lat: 35.6762,
  lng: 139.6503,
  radius: 5
})
```

### フィード取得

```typescript
// パーソナライズドフィード
const posts = await db.getFeed({
  userId: currentUser.id,
  feedType: 'following', // all, following, gym_friends, same_gym
  limit: 20,
  offset: 0
})
```

### 投稿作成

```typescript
const post = await db.createPost({
  userId: currentUser.id,
  gymId: selectedGym.id,
  content: '今日は胸トレ！',
  crowdStatus: 'normal',
  trainingDetails: {
    exercises: [...],
    total_sets: 15
  }
})
```

## 🔄 リアルタイム機能

### 投稿のリアルタイム更新

```typescript
// フィードの購読
const channel = realtime.subscribeToFeed((payload) => {
  console.log('新しい投稿:', payload)
})

// 購読解除
realtime.unsubscribe(channel)
```

## 📈 パフォーマンス最適化

### インデックス

重要なクエリパスにインデックスを設定：

```sql
-- 投稿の取得高速化
CREATE INDEX idx_posts_gym_created ON posts(gym_id, created_at DESC);
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);

-- 位置情報検索の高速化
CREATE INDEX idx_gyms_location ON gyms USING GIST(location);
```

### ビューの活用

```sql
-- フィード用ビューで複雑なJOINを簡略化
SELECT * FROM feed_posts WHERE user_id = ?
```

### トリガーによる自動処理

- いいね数の自動更新
- コメント数の自動更新
- 更新日時の自動更新

## 🛠 メンテナンス

### バックアップ

Supabaseは自動バックアップを提供：
- Point-in-time recovery（7日間）
- 手動バックアップも可能

### モニタリング

```sql
-- スロークエリの監視
SELECT * FROM pg_stat_statements 
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC;

-- テーブルサイズの確認
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 📝 開発時の注意点

1. **環境変数は絶対にコミットしない**
   - `.env.local`は`.gitignore`に含める

2. **マイグレーション管理**
   - スキーマ変更は`supabase/migrations/`に保存

3. **型安全性**
   - `supabase gen types`で型定義を自動生成

4. **エラーハンドリング**
   - すべてのDB操作でtry-catchを実装

## 🆘 トラブルシューティング

### よくある問題

1. **RLSエラー**
   - ポリシーの確認
   - 認証状態の確認

2. **パフォーマンス問題**
   - インデックスの確認
   - N+1問題の回避

3. **リアルタイム接続エラー**
   - WebSocket接続の確認
   - ファイアウォール設定

## 📚 参考リンク

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostGIS Documentation](https://postgis.net/documentation/)