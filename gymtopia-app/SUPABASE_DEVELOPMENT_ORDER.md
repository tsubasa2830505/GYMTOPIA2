# 🔧 開発に不都合が起きない実装順序

## ⚠️ 重要な依存関係と制約

### 開発で起きる問題を防ぐ原則
1. **参照先は先に作る** - 外部キー制約エラーを防ぐ
2. **マスターデータ優先** - データ投入時のエラーを防ぐ
3. **認証は最後** - 開発中のアクセス制限を防ぐ
4. **RLSは段階的に** - デバッグを容易にする

---

## 📝 正しい実装順序

### 🟦 Step 1: 独立したマスターテーブル（依存なし）
**これらは他に依存しないので最初に作成**

```sql
-- 1. 筋肉部位マスター（完全独立）
CREATE TABLE muscle_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    parts TEXT[]
);

-- 2. 設備カテゴリマスター（完全独立）
CREATE TABLE equipment_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0
);

-- サンプルデータ投入（エラーなし）
INSERT INTO muscle_groups (category, name, parts) VALUES
('chest', '胸', ARRAY['大胸筋上部', '大胸筋中部', '大胸筋下部']);

INSERT INTO equipment_categories (name, description) VALUES
('チェストプレス', '胸部を鍛えるマシン');
```

**✅ メリット**: 
- 外部キー制約なし
- いつでもデータ投入可能
- 他の開発をブロックしない

---

### 🟩 Step 2: 基本エンティティ（依存は上記のみ）

```sql
-- 3. ジム基本情報（独立）
CREATE TABLE gyms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    area TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    rating DECIMAL(2, 1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. 設備マスター（categoriesに依存）
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES equipment_categories(id), -- ⚠️ Step1が必要
    name TEXT NOT NULL,
    maker TEXT NOT NULL,
    model TEXT,
    target_muscles TEXT[],
    type TEXT
);

-- サンプルデータ（依存関係OK）
INSERT INTO gyms (name, area, address) VALUES
('ハンマーストレングス渋谷', '渋谷', '東京都渋谷区道玄坂1-1-1');

INSERT INTO equipment (category_id, name, maker) 
SELECT id, 'チェストプレス', 'Technogym' 
FROM equipment_categories WHERE name = 'チェストプレス';
```

**✅ メリット**:
- 基本的な検索機能が実装可能
- UIの開発が進められる

---

### 🟨 Step 3: 関連テーブル（両方に依存）

```sql
-- 5. ジム設備在庫（gyms + equipment必須）
CREATE TABLE gym_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,      -- ⚠️ gyms必要
    equipment_id UUID REFERENCES equipment(id),              -- ⚠️ equipment必要
    count INTEGER DEFAULT 1,
    max_weight INTEGER,
    condition TEXT
);

-- データ投入（両方のテーブルが必要）
INSERT INTO gym_equipment (gym_id, equipment_id, count)
SELECT g.id, e.id, 2
FROM gyms g, equipment e
WHERE g.name = 'ハンマーストレングス渋谷' 
AND e.name = 'チェストプレス';
```

**✅ この時点で**: アプリの基本機能（検索・表示）が完全動作

---

### 🟧 Step 4: ユーザー関連（Auth設定後）

```sql
-- ⚠️ 注意: Supabase Authを先に有効化

-- 6. プロフィール（auth.usersに依存）
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, -- ⚠️ Auth必要
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    bio TEXT
);

-- 7. トリガー設定（新規ユーザー自動作成）
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'ユーザー')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**⚠️ 開発の罠**: Authなしでprofilesを作るとエラー

---

### 🟥 Step 5: ユーザー依存テーブル

```sql
-- 8. レビュー（profiles + gyms必要）
CREATE TABLE gym_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES gyms(id),           -- ⚠️ gyms必要
    user_id UUID REFERENCES profiles(id),      -- ⚠️ profiles必要
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    content TEXT NOT NULL
);

-- 9. いいね（profiles + gyms必要）
CREATE TABLE gym_likes (
    user_id UUID REFERENCES profiles(id),      -- ⚠️ profiles必要
    gym_id UUID REFERENCES gyms(id),           -- ⚠️ gyms必要
    PRIMARY KEY (user_id, gym_id)
);

-- 10. フォロー（profiles必要）
CREATE TABLE follows (
    follower_id UUID REFERENCES profiles(id),   -- ⚠️ profiles必要
    following_id UUID REFERENCES profiles(id),  -- ⚠️ profiles必要
    PRIMARY KEY (follower_id, following_id)
);
```

---

### 🔒 Step 6: セキュリティ（最後に）

```sql
-- RLSは開発が終わってから有効化

-- 開発中（RLS無効）
ALTER TABLE gyms DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipment DISABLE ROW LEVEL SECURITY;

-- 本番前（RLS有効化）
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "誰でも閲覧可能" ON gyms FOR SELECT USING (true);
```

---

## 🚨 開発でよくあるエラーと対策

### ❌ エラー1: 外部キー制約違反
```sql
-- NG: equipmentがまだない
INSERT INTO gym_equipment (gym_id, equipment_id) VALUES ('...', '...');
-- ERROR: insert or update on table "gym_equipment" violates foreign key constraint
```
**対策**: 参照先テーブルを先に作成

### ❌ エラー2: Auth依存エラー
```sql
-- NG: auth.usersがない状態でprofiles作成
INSERT INTO profiles (id, username) VALUES (gen_random_uuid(), 'test');
-- ERROR: insert or update on table "profiles" violates foreign key constraint
```
**対策**: 開発中は外部キー制約を一時的に外す

### ❌ エラー3: RLSでデータが見えない
```sql
-- RLS有効だがポリシーなし
SELECT * FROM gyms; -- 結果: 0件
```
**対策**: 開発中はRLS無効、本番前に有効化

---

## ✅ 推奨実装フロー

### 開発初期（今すぐ）
```bash
1. muscle_groups      ✅ 独立
2. equipment_categories ✅ 独立  
3. gyms               ✅ 独立
4. equipment          ← categoriesに依存
5. gym_equipment      ← gyms + equipmentに依存
```
**→ アプリ基本機能が動作**

### 開発中期（認証実装後）
```bash
6. Supabase Auth設定
7. profiles           ← auth.usersに依存
8. gym_reviews        ← profiles + gymsに依存
9. gym_likes          ← profiles + gymsに依存
10. follows           ← profilesに依存
```
**→ ユーザー機能が動作**

### 開発後期（仕上げ）
```bash
11. workout_sessions  ← profilesに依存
12. activities        ← 複数テーブルに依存
13. RLS有効化
14. ポリシー設定
15. インデックス最適化
```
**→ 本番環境準備完了**

---

## 💡 開発のコツ

### 1. 段階的なテスト
```sql
-- Step1完了後: マスターデータ確認
SELECT * FROM muscle_groups;
SELECT * FROM equipment_categories;

-- Step3完了後: 結合テスト
SELECT g.name, e.name, ge.count
FROM gym_equipment ge
JOIN gyms g ON ge.gym_id = g.id
JOIN equipment e ON ge.equipment_id = e.id;
```

### 2. 開発用の簡易設定
```sql
-- 開発中はRLS無効（全データアクセス可能）
ALTER TABLE ALL TABLES IN SCHEMA public DISABLE ROW LEVEL SECURITY;

-- 開発中は外部キー制約を緩める
ALTER TABLE profiles 
    DROP CONSTRAINT profiles_id_fkey,
    ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;
```

### 3. リセット用SQL
```sql
-- 全テーブル削除（依存順序を逆に）
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS workout_sessions CASCADE;
DROP TABLE IF EXISTS gym_reviews CASCADE;
DROP TABLE IF EXISTS gym_likes CASCADE;
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS gym_equipment CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS gyms CASCADE;
DROP TABLE IF EXISTS equipment_categories CASCADE;
DROP TABLE IF EXISTS muscle_groups CASCADE;
```

---

## 📌 まとめ

**絶対守るべき順序:**
1. マスターテーブル → エンティティ → 関連テーブル
2. Auth設定 → ユーザーテーブル → ユーザー依存テーブル
3. 開発中RLS無効 → 本番前にRLS有効

**この順序なら:**
- ✅ 外部キーエラーなし
- ✅ データ投入エラーなし
- ✅ 段階的にテスト可能
- ✅ いつでもロールバック可能