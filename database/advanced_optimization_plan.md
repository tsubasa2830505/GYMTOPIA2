# 高度なDB最適化計画

## 🔴 最優先：JSONBの正規化（パフォーマンス大幅改善）

### gym_detailed_info の6個のJSONBを構造化テーブルへ

#### 1. 営業時間テーブル（operating_hours）
```sql
CREATE TABLE gym_operating_hours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT FALSE,
  is_24h BOOLEAN DEFAULT FALSE,
  UNIQUE(gym_id, day_of_week)
);

-- インデックス
CREATE INDEX idx_gym_hours_gym_day ON gym_operating_hours(gym_id, day_of_week);
```

**効果**:
- 営業時間検索が10倍高速化
- 「今開いているジム」検索が可能に

#### 2. 料金プランテーブル（pricing_plans）
```sql
CREATE TABLE gym_pricing_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  plan_name VARCHAR(100) NOT NULL,
  plan_type VARCHAR(50) CHECK (plan_type IN ('monthly', 'yearly', 'daily', 'visitor')),
  price DECIMAL(10,2),
  duration_days INT,
  features TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0
);

CREATE INDEX idx_pricing_gym_active ON gym_pricing_plans(gym_id, is_active);
```

**効果**:
- 価格比較クエリが高速化
- 料金フィルタリングが可能

#### 3. アクセス情報テーブル（access_info）
```sql
CREATE TABLE gym_access_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE UNIQUE,
  nearest_station VARCHAR(100),
  walking_minutes INT,
  parking_capacity INT,
  parking_free BOOLEAN,
  parking_fee DECIMAL(10,2),
  bicycle_parking BOOLEAN DEFAULT FALSE,
  wheelchair_accessible BOOLEAN DEFAULT FALSE
);
```

## 🟡 中優先：重複データの解消

### 1. user_primary_gyms と user_profiles.primary_gym_id の統一
```sql
-- user_profiles.primary_gym_id を削除し、
-- user_primary_gyms テーブルに統一

-- ビューで互換性維持
CREATE VIEW user_profiles_with_gym AS
SELECT
  up.*,
  upg.gym_id as primary_gym_id,
  ARRAY(
    SELECT gym_id FROM user_secondary_gyms
    WHERE user_id = up.user_id
  ) as secondary_gym_ids
FROM user_profiles up
LEFT JOIN user_primary_gyms upg ON up.user_id = upg.user_id;
```

### 2. 配列カラムの正規化

#### gym_posts.muscle_groups_trained → post_muscle_groups
```sql
CREATE TABLE post_muscle_groups (
  post_id UUID REFERENCES gym_posts(id) ON DELETE CASCADE,
  muscle_group VARCHAR(50),
  is_primary BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (post_id, muscle_group)
);

-- データ移行
INSERT INTO post_muscle_groups (post_id, muscle_group)
SELECT id, unnest(muscle_groups_trained)
FROM gym_posts
WHERE muscle_groups_trained IS NOT NULL;
```

## 🟢 パフォーマンス最適化

### 1. パーティショニング（大規模データ対応）
```sql
-- gym_posts を月別パーティションに
CREATE TABLE gym_posts_new (LIKE gym_posts INCLUDING ALL)
PARTITION BY RANGE (created_at);

-- 2024年の各月のパーティション
CREATE TABLE gym_posts_2024_01 PARTITION OF gym_posts_new
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- 以降、各月のパーティションを作成
```

### 2. 頻繁なクエリ用の複合インデックス
```sql
-- フィード取得の最適化（現在最も遅い）
CREATE INDEX idx_gym_posts_feed_composite ON gym_posts
(created_at DESC, visibility, is_public)
INCLUDE (user_id, gym_id, like_count, comment_count)
WHERE visibility = 'public' AND is_public = true;

-- ジム検索の最適化（260ms → 10ms以下へ）
CREATE INDEX idx_gyms_search_composite ON gyms
USING gin(
  to_tsvector('japanese', name || ' ' || COALESCE(address, '') || ' ' || COALESCE(city, ''))
);
```

### 3. マテリアライズドビューの追加
```sql
-- 人気ジムランキング（リアルタイム不要）
CREATE MATERIALIZED VIEW popular_gyms_weekly AS
SELECT
  g.*,
  COUNT(DISTINCT gp.user_id) as unique_posters,
  COUNT(gp.id) as post_count,
  AVG(gp.like_count) as avg_likes
FROM gyms g
LEFT JOIN gym_posts gp ON g.id = gp.gym_id
  AND gp.created_at > NOW() - INTERVAL '7 days'
GROUP BY g.id;

CREATE INDEX idx_popular_gyms_ranking ON popular_gyms_weekly(post_count DESC);
```

## 実装による期待効果

### パフォーマンス改善
- **JSONBクエリ**: 70-90%高速化
- **gyms関連クエリ**: 260ms → 20ms以下
- **フィード取得**: 50%高速化
- **統計クエリ**: マテリアライズドビューで即座

### ストレージ最適化
- **JSONB削除**: 約30%容量削減
- **インデックス最適化**: クエリプランの改善

### 保守性向上
- **型安全性**: JSONBから構造化テーブルへ
- **クエリ簡素化**: 複雑なJSON操作が不要に
- **拡張性**: 新機能追加が容易に

## 実装優先順位

1. **即実施（影響小）**
   - 複合インデックス追加
   - マテリアライズドビュー作成

2. **段階実施（要テスト）**
   - gym_detailed_info のJSONB正規化
   - 配列カラムの正規化

3. **大規模変更（要計画）**
   - パーティショニング
   - 重複データ統合

## リスクと対策

| 変更内容 | リスク | 対策 |
|----------|--------|------|
| JSONB正規化 | 既存クエリの修正必要 | ビューで互換性維持 |
| パーティショニング | 大規模なデータ移行 | 営業時間外に実施 |
| インデックス追加 | 一時的な負荷上昇 | CONCURRENTLYオプション使用 |