# Supabase データベースセットアップガイド

## 📋 概要
GYMTOPIA 2.0のSupabaseデータベースを構築するための完全ガイドです。

## 🚀 クイックスタート

### 1. Supabaseプロジェクトの作成
1. [Supabase](https://supabase.com) にアクセス
2. 新規プロジェクトを作成
3. プロジェクト名: `gymtopia` (任意)
4. データベースパスワードを設定（安全な場所に保存）
5. リージョン: `Northeast Asia (Tokyo)` を選択

### 2. SQLエディタでスキーマを実行
1. Supabaseダッシュボード → SQL Editor
2. 新規クエリを作成
3. 以下のファイルの内容を順番に実行：

```sql
-- ① 完全スキーマの実行
-- supabase/schema-complete.sql の内容をコピー&ペースト → Run

-- ② サンプルデータの投入（任意）
-- supabase/seed-data.sql の内容をコピー&ペースト → Run
```

### 3. 環境変数の設定
Supabaseダッシュボード → Settings → API から以下をコピー：

```env
# .env.local に追加
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 📊 データベース構造

### 主要テーブル一覧

#### 👤 ユーザー関連
- `profiles` - ユーザープロフィール
- `follows` - フォロー関係
- `personal_records` - パーソナルレコード

#### 🏢 ジム関連
- `gyms` - ジム情報
- `gym_equipment` - ジムの設備
- `gym_reviews` - レビュー
- `gym_likes` - いいね/行きたい
- `gym_managers` - ジム管理者

#### 💪 トレーニング関連
- `equipment` - 機器マスター
- `equipment_categories` - 機器カテゴリ
- `muscle_groups` - 筋肉部位
- `workout_sessions` - トレーニングセッション
- `workout_exercises` - エクササイズ記録

#### 📱 ソーシャル関連
- `activities` - アクティビティフィード
- `review_responses` - レビューへの返信

## 🔐 セキュリティ設定

### Row Level Security (RLS)
すべてのテーブルでRLSが有効化されています：

- **公開データ**: ジム情報、レビューは誰でも閲覧可能
- **プライベートデータ**: ワークアウト記録は本人のみ
- **編集権限**: 自分のデータのみ編集可能

### 認証設定
1. Authentication → Settings
2. 以下を有効化：
   - Email認証
   - Google OAuth（任意）
   - GitHub OAuth（任意）

## 🛠️ 管理機能

### Supabase Dashboard での操作

#### データの確認
- Table Editor → 各テーブルを選択
- データの追加/編集/削除が可能

#### SQLクエリの実行
- SQL Editor → 新規クエリ
- 例：
```sql
-- ジム一覧の取得
SELECT * FROM gyms ORDER BY rating DESC;

-- 設備の多いジムTOP5
SELECT g.name, COUNT(ge.id) as equipment_count
FROM gyms g
LEFT JOIN gym_equipment ge ON g.id = ge.gym_id
GROUP BY g.id, g.name
ORDER BY equipment_count DESC
LIMIT 5;
```

## 📝 TypeScript型定義の生成

```bash
# Supabase CLIをインストール
npm install -g supabase

# 型定義を生成
supabase gen types typescript \
  --project-id your_project_id \
  --schema public > src/types/supabase.ts
```

## 🔄 マイグレーション

### 新しいテーブルの追加
```sql
-- supabase/migrations/002_add_new_table.sql
CREATE TABLE IF NOT EXISTS public.new_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLSを有効化
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;

-- ポリシーを追加
CREATE POLICY "Public read access" ON public.new_table
    FOR SELECT USING (true);
```

## 🐛 トラブルシューティング

### よくある問題

#### 1. "relation does not exist" エラー
→ スキーマが正しく実行されていない可能性
→ 解決: schema-complete.sql を再実行

#### 2. "permission denied" エラー
→ RLSポリシーが正しく設定されていない
→ 解決: 該当テーブルのポリシーを確認

#### 3. データが表示されない
→ RLSが有効でポリシーがない
→ 解決: 適切なポリシーを追加

## 📚 参考リンク

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## ✅ セットアップ完了チェックリスト

- [ ] Supabaseプロジェクト作成
- [ ] スキーマ実行
- [ ] 環境変数設定
- [ ] RLS有効化確認
- [ ] 認証設定
- [ ] サンプルデータ投入（任意）
- [ ] アプリケーションから接続テスト

---

セットアップ完了後、アプリケーションの `/test-supabase` ページで接続テストができます。