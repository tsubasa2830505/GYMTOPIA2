# 📝 GYMTOPIA 2.0 開発メモ

## 🎯 プロジェクト状況
- **バージョン**: v3.0.0
- **最終更新**: 2025-01-06
- **GitHub**: https://github.com/tsubasa2830505/GYMTOPIA2.git
- **Vercel**: https://gymtopia-2.vercel.app

## ✅ 完了タスク
1. **基本機能実装** - 全ページ作成完了
2. **警告・エラー解消** - TypeScript/ESLint対応済み
3. **テスト完了** - 全17ページ動作確認済み
4. **Supabaseデータベース設計** - スキーマ作成済み

## 📊 データベース実装順序（重要）

本プロジェクトは「最小構成（すぐ動かす）」と「完全構成（正規化・拡張）」の2段階で進める。

### フェーズ0: 前提（拡張/RLS方針）
- 拡張: `pgcrypto`（`gen_random_uuid()`用）を有効化。PostGISは近傍検索が必要になってから。
- RLS方針: 開発中はRLS無効。本番前にRLSを有効化し、最低限のポリシーを適用。

### A) 最小構成（まずはアプリを動かす）
```
1. gyms（独立）
2. equipment（独立）
3. gym_equipment（gyms + equipment依存）
--- ここまでで最小動作確認 ---
4. muscle_groups（MachineSelectorでの部位データをDB連携する場合）
```
補足:
- `MachineSelector`はSupabaseの`muscle_groups`を参照できるとUXが向上（コードにはフォールバックもあり）。
- 将来、検索を正規化JOINに寄せるか、`gyms.facilities`のJSONを併存させるかを選択（下記「コード整合の注記」参照）。

### B) 完全構成（正規化・ソーシャル・運用）
```
1. muscle_groups, equipment_categories（独立）
2. gyms（正規化/位置情報）
3. equipment（categoriesに依存）
4. gym_equipment（gyms + equipment依存）
5. Auth設定
6. profiles（auth.users依存）
7. gym_reviews, gym_likes, follows（profiles依存）
8. 近傍/フィード用RPC（find_nearby_gyms, get_personalized_feed）
9. RLS有効化 + ポリシー適用
```

### ⚠️ 開発の注意点
- **外部キー制約**: 参照先を先に作成
- **Auth依存**: profilesはAuth設定後
- **RLS**: 開発中は無効、本番前に有効化

## 🔧 環境変数
```env
NEXT_PUBLIC_SUPABASE_URL=https://htytewqvkgwyuvcsvjwm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=（設定済み）
```

## 📁 重要ファイル
- `/gymtopia-app/supabase/01-minimum-setup.sql` - 基本3テーブル
- `/gymtopia-app/supabase/02-muscle-groups.sql` - 筋肉部位データ
- `/gymtopia-app/supabase/03-add-equipment-data.sql` - 設備データ
- `/gymtopia-app/supabase/04-user-system.sql` - ユーザーシステム
- `/gymtopia-app/SUPABASE_SETUP.md` - セットアップ手順
- `/gymtopia-app/SUPABASE_USER_SETUP.md` - ユーザー機能セットアップ
- `/gymtopia-app/SUPABASE_DEVELOPMENT_ORDER.md` - 実装順序
- `/gymtopia-app/DB_IMPLEMENTATION_STATUS.md` - 実装状況

## 🚀 コマンド集

### 開発
```bash
cd gymtopia-app
npm run dev        # 開発サーバー起動
npm run build      # ビルド
npm run lint       # Lint実行
```

### Git/デプロイ
```bash
# バックアップ
git add -A
git commit -m "バックアップ: [説明]"
git push origin main
git tag -a v[バージョン] -m "[説明]"
git push origin --tags

# Vercel強制デプロイ
echo "Force deploy: $(date)" > force-deploy.txt
git add . && git commit -m "Force deployment"
git push origin main
```

### Supabase
```sql
-- 開発用: RLS無効化
ALTER TABLE [table_name] DISABLE ROW LEVEL SECURITY;

-- 本番用: RLS有効化
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- テーブル確認
SELECT * FROM muscle_groups;
SELECT * FROM gyms;
SELECT * FROM equipment;
```

## 🗄️ DB設計手順（Supabase）

### Step 1: Supabaseプロジェクト作成
1. https://supabase.com にアクセス
2. 「Start your project」クリック
3. GitHubでログイン
4. 「New Project」クリック
5. 設定:
   - Organization: 個人アカウント選択
   - Project name: `gymtopia`
   - Database Password: 強力なパスワード設定（保存必須）
   - Region: `Northeast Asia (Tokyo)`
   - Pricing Plan: Free（無料）

### Step 2: 最小限のテーブル作成（3つ）
```sql
-- SQL Editor → New Query → 以下を実行

-- 必要拡張
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ジムテーブル
CREATE TABLE gyms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    area TEXT NOT NULL,
    address TEXT NOT NULL
);

-- 2. 設備テーブル  
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    maker TEXT NOT NULL,
    type TEXT
);

-- 3. ジム設備テーブル
CREATE TABLE gym_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    count INTEGER DEFAULT 1,
    UNIQUE (gym_id, equipment_id)
);

-- 推奨インデックス
CREATE INDEX IF NOT EXISTS idx_gym_equipment_gym ON gym_equipment(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_equipment_equipment ON gym_equipment(equipment_id);

-- RLS無効（開発用）
ALTER TABLE gyms DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE gym_equipment DISABLE ROW LEVEL SECURITY;
```

### Step 3: サンプルデータ投入
```sql
-- ジムデータ
INSERT INTO gyms (name, area, address) VALUES
('ハンマーストレングス渋谷', '渋谷', '東京都渋谷区道玄坂1-1-1'),
('ゴールドジム原宿', '原宿', '東京都渋谷区神宮前3-2-1'),
('24/7ワークアウト新宿', '新宿', '東京都新宿区西新宿2-1-1');

-- 設備データ
INSERT INTO equipment (name, maker, type) VALUES
('チェストプレス', 'Technogym', 'machine'),
('ラットプルダウン', 'Life Fitness', 'machine'),
('レッグプレス', 'Cybex', 'machine'),
('ダンベル', 'IVANKO', 'free_weight'),
('バーベル', 'ELEIKO', 'free_weight');

-- 設備を全ジムに紐付け
INSERT INTO gym_equipment (gym_id, equipment_id, count)
SELECT g.id, e.id, 
    CASE 
        WHEN e.type = 'machine' THEN 2
        ELSE 1
    END
FROM gyms g, equipment e;
```

### Step 4: 環境変数取得
1. Supabaseダッシュボード → Settings → API
2. 以下をコピー:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 5: アプリに設定
```bash
# .env.localファイルを作成
cd gymtopia-app
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
EOF
```

### Step 6: 接続テスト
```bash
# 開発サーバー起動
npm run dev

# ブラウザで確認
open http://localhost:3000/test-supabase
```

### Step 7: RLS（本番）ポリシーの最小例
```sql
-- 本番前に有効化
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_equipment ENABLE ROW LEVEL SECURITY;

-- 読み取りは全員許可（必要に応じて絞る）
CREATE POLICY gyms_select_all ON gyms FOR SELECT USING (true);
CREATE POLICY equipment_select_all ON equipment FOR SELECT USING (true);
CREATE POLICY gym_equipment_select_all ON gym_equipment FOR SELECT USING (true);

-- 書き込みは管理者ロールのみ（例）
-- 事前に管理者判定の仕組みを用意（JWTのroleクレームなど）
CREATE POLICY gyms_admin_write ON gyms FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY gyms_admin_update ON gyms FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY gyms_admin_delete ON gyms FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');
```

### 完全版を実装する場合
```sql
-- /gymtopia-app/supabase/schema-complete.sql を実行
-- 12テーブル + RLS + トリガー + インデックス
```

## 🧩 コード整合の注記
- 現行の検索関数は`gyms.facilities`（JSON）に対するcontains検索を想定（`lib/supabase.ts`）。
  - 早期に検索を繋ぎ込みたい場合は、`gyms`に`facilities jsonb`を追加して暫定運用も可。
  - 完全構成へ移行後は、`gym_equipment`等の正規化テーブルJOINによる検索に寄せる方針を検討。
- `MachineSelector`は`muscle_groups`があるとDB連携で部位データを取得でき、UI体験が向上（フォールバックも実装済み）。

## 📋 TODO
- [x] Supabaseプロジェクト作成 ✅
- [x] 最小3テーブル作成（gyms, equipment, gym_equipment） ✅
- [x] サンプルデータ投入 ✅
- [x] 環境変数取得・設定 ✅
- [x] 接続テスト ✅
- [x] 拡張有効化（pgcrypto） ✅
- [x] インデックス/一意制約の作成確認 ✅
- [ ] RLS本番ポリシー適用（読み取り全員/書き込み管理者など）
- [x] Phase 1残り2テーブル追加（muscle_groups） ✅
- [ ] Vercel環境変数設定
- [ ] 本番デプロイ

## 🆕 ユーザーシステム実装状況
- [x] ユーザー関連テーブル設計完了 ✅
- [ ] Supabase認証有効化
- [ ] 04-user-system.sql実行
- [ ] 認証機能のフロントエンド実装
- [ ] テストユーザー作成と動作確認

## 💡 Tips
- 開発中はRLS無効が楽
- テーブルは依存順序を守る
- Auth設定は後回しでOK
- 最小3テーブルで動作確認可能

---
*このメモは開発の進捗に応じて更新してください*
