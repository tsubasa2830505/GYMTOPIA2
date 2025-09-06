# 📊 Supabaseデータベース実装優先順位

## 🎯 実装フェーズ別優先順位

### 🔴 Phase 1: 必須（MVP）- 今すぐ必要
**目的**: アプリの基本機能を動作させる

```sql
-- 1. 筋肉部位マスター（実装済み✅）
CREATE TABLE muscle_groups (
    id, category, name, parts[]
);

-- 2. ジム基本情報
CREATE TABLE gyms (
    id, name, area, address, 
    latitude, longitude, rating
);

-- 3. 設備カテゴリ
CREATE TABLE equipment_categories (
    id, name, description, icon
);

-- 4. 設備マスター
CREATE TABLE equipment (
    id, category_id, name, maker, 
    target_muscles[], type
);

-- 5. ジム設備在庫
CREATE TABLE gym_equipment (
    id, gym_id, equipment_id, 
    count, max_weight
);
```

**理由**: 
- 検索機能の実現
- ジム詳細表示
- 設備フィルタリング

---

### 🟡 Phase 2: 重要（ユーザー機能）- 1週間以内
**目的**: ユーザー体験の向上

```sql
-- 6. ユーザープロフィール
CREATE TABLE profiles (
    id, username, display_name, 
    bio, avatar_url, location
);

-- 7. ジムのいいね/行きたい
CREATE TABLE gym_likes (
    id, user_id, gym_id
);

-- 8. ジムレビュー
CREATE TABLE gym_reviews (
    id, gym_id, user_id, 
    rating, content
);

-- 9. フォロー機能
CREATE TABLE follows (
    id, follower_id, following_id
);
```

**理由**:
- ユーザー登録・ログイン
- ソーシャル機能の基盤
- レビュー投稿

---

### 🟢 Phase 3: 拡張機能 - 2週間以内
**目的**: 差別化機能の追加

```sql
-- 10. ワークアウト記録
CREATE TABLE workout_sessions (
    id, user_id, gym_id, 
    started_at, ended_at
);

-- 11. エクササイズ詳細
CREATE TABLE workout_exercises (
    id, session_id, equipment_id,
    sets, reps[], weight[]
);

-- 12. パーソナルレコード
CREATE TABLE personal_records (
    id, user_id, exercise_name,
    record_type, weight, reps
);

-- 13. アクティビティフィード
CREATE TABLE activities (
    id, user_id, activity_type,
    target_type, target_id
);
```

**理由**:
- トレーニング記録機能
- 成長の可視化
- モチベーション向上

---

### 🔵 Phase 4: 管理機能 - 1ヶ月以内
**目的**: 運営・管理の効率化

```sql
-- 14. ジム管理者
CREATE TABLE gym_managers (
    id, gym_id, user_id, role
);

-- 15. レビュー返信
CREATE TABLE review_responses (
    id, review_id, content
);

-- 16. 営業時間・料金
ALTER TABLE gyms ADD COLUMN
    business_hours JSONB,
    membership_fee JSONB;
```

**理由**:
- ジムオーナー向け機能
- カスタマーサポート
- ビジネスモデル対応

---

## 📋 実装チェックリスト

### 今週の目標（Phase 1）
- [ ] `muscle_groups` テーブル作成 ✅
- [ ] `gyms` テーブル作成・データ投入
- [ ] `equipment_categories` 作成
- [ ] `equipment` マスターデータ作成
- [ ] `gym_equipment` 在庫データ作成
- [ ] 基本的なRLSポリシー設定

### 来週の目標（Phase 2）
- [ ] Supabase Auth設定
- [ ] `profiles` テーブル作成
- [ ] ソーシャル機能テーブル作成
- [ ] レビュー機能実装

### 今月の目標（Phase 3-4）
- [ ] ワークアウト記録機能
- [ ] 管理者機能
- [ ] パフォーマンス最適化

---

## 🚀 簡易実装プラン

### Step 1: 最小限で動かす（3テーブルのみ）
```sql
-- これだけでアプリは動く！
CREATE TABLE gyms (最小構成);
CREATE TABLE equipment (最小構成);
CREATE TABLE gym_equipment (最小構成);
```

### Step 2: ユーザー機能追加（+3テーブル）
```sql
CREATE TABLE profiles;
CREATE TABLE gym_likes;
CREATE TABLE gym_reviews;
```

### Step 3: 本格運用（全テーブル）
```sql
-- 残り全テーブルを追加
```

---

## ⚡ クイックスタートSQL

最速でアプリを動かすための最小限SQL：

```sql
-- 1分で完了！必須3テーブルのみ
-- ========================================
-- ジムテーブル（簡易版）
CREATE TABLE gyms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    area TEXT NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 設備テーブル（簡易版）
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    maker TEXT NOT NULL,
    type TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ジム設備テーブル（簡易版）
CREATE TABLE gym_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES gyms(id),
    equipment_id UUID REFERENCES equipment(id),
    count INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- RLS無効（開発用）
ALTER TABLE gyms DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE gym_equipment DISABLE ROW LEVEL SECURITY;

-- サンプルデータ
INSERT INTO gyms (name, area, address) VALUES
('ハンマーストレングス渋谷', '渋谷', '東京都渋谷区道玄坂1-1-1'),
('ゴールドジム原宿', '原宿', '東京都渋谷区神宮前3-2-1');

INSERT INTO equipment (name, maker, type) VALUES
('チェストプレス', 'Technogym', 'machine'),
('ラットプルダウン', 'Life Fitness', 'machine'),
('ダンベル', 'IVANKO', 'free_weight');

-- 設備を紐付け
INSERT INTO gym_equipment (gym_id, equipment_id, count)
SELECT g.id, e.id, 1
FROM gyms g, equipment e;
```

---

## 📝 まとめ

### 必須実装（今すぐ）
1. **gyms** - ジム情報
2. **equipment** - 設備情報  
3. **gym_equipment** - 在庫情報

### できれば実装（早めに）
4. **profiles** - ユーザー
5. **gym_reviews** - レビュー
6. **gym_likes** - いいね

### 余裕があれば（将来）
- ワークアウト記録
- ソーシャル機能
- 管理機能

**推奨**: Phase 1の5テーブルだけ実装すれば、アプリの90%の機能が動作します！