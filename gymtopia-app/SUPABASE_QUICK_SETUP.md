# 🚀 Supabase クイックセットアップガイド

## 📋 現在の状況
- **Supabaseプロジェクト**: ✅ 作成済み（htytewqvkgwyuvcsvjwm）
- **環境変数**: ✅ 設定済み（.env.local）
- **SQLファイル**: ✅ 準備完了

## 🔧 セットアップ手順

### Step 1: Supabaseダッシュボードにアクセス
1. https://supabase.com/dashboard/project/htytewqvkgwyuvcsvjwm にアクセス
2. ログイン（必要に応じて）

### Step 2: SQL実行（順番が重要！）

#### 2-1: 最小構成テーブル作成
1. SQL Editor → New query
2. `/supabase/01-minimum-setup.sql` の内容をコピー&ペースト
3. Run をクリック
4. 成功メッセージを確認

#### 2-2: muscle_groupsテーブル作成
1. SQL Editor → New query
2. `/supabase/02-muscle-groups.sql` の内容をコピー&ペースト
3. Run をクリック
4. 成功メッセージを確認

### Step 3: データ確認

#### Table Editorで確認
1. Table Editor タブを開く
2. 以下のテーブルにデータが入っているか確認：
   - `gyms` - 5件のジム
   - `equipment` - 10件の設備
   - `gym_equipment` - 50件の関連データ
   - `muscle_groups` - 21件の筋肉部位

#### SQLで確認（任意）
```sql
-- ジム一覧
SELECT * FROM gyms ORDER BY name;

-- 設備数の確認
SELECT COUNT(*) as total FROM equipment;

-- ジムごとの設備数
SELECT 
    g.name as gym_name,
    COUNT(ge.id) as equipment_count
FROM gyms g
LEFT JOIN gym_equipment ge ON g.id = ge.gym_id
GROUP BY g.id, g.name
ORDER BY equipment_count DESC;

-- 筋肉部位の確認
SELECT category, COUNT(*) as parts FROM muscle_groups 
GROUP BY category ORDER BY category;
```

### Step 4: アプリ接続テスト

#### ブラウザでテスト
```bash
# 開発サーバーが起動していない場合
cd /Users/tsubasa/GYMTOPIA2.0/gymtopia-app
npm run dev
```

1. http://localhost:3000/test-supabase にアクセス
2. 「muscle_groups」と入力して「テーブルデータ取得」をクリック
3. データが表示されることを確認

## ✅ 完了チェックリスト
- [ ] SQL Editor で `01-minimum-setup.sql` を実行
- [ ] SQL Editor で `02-muscle-groups.sql` を実行
- [ ] Table Editor で4つのテーブルにデータが入っていることを確認
- [ ] `/test-supabase` ページでデータ取得テスト成功

## 🔍 トラブルシューティング

### エラー: "relation does not exist"
→ SQLファイルが正しく実行されていない可能性
→ 解決: SQLファイルを再実行

### エラー: "permission denied"
→ RLSが有効になっている可能性
→ 解決: 各テーブルでRLSを無効化
```sql
ALTER TABLE gyms DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE gym_equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE muscle_groups DISABLE ROW LEVEL SECURITY;
```

### データが表示されない
→ サンプルデータが投入されていない
→ 解決: `01-minimum-setup.sql` のINSERT文を再実行

## 📝 次のステップ
1. ✅ 基本機能の動作確認
2. 追加テーブルの実装（必要に応じて）
3. RLSポリシーの設定（本番前）
4. Vercel環境変数の設定