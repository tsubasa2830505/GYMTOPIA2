# DB最適化の機会

## 🔴 重要な最適化ポイント

### 1. 非正規化の解消

#### gym_posts テーブル
```sql
-- 問題：集計値の冗長保存
like_count, comment_count → リアルタイム集計に変更

-- 解決案：マテリアライズドビューまたはトリガー更新
CREATE MATERIALIZED VIEW gym_posts_stats AS
SELECT
  post_id,
  COUNT(DISTINCT pl.user_id) as like_count,
  COUNT(DISTINCT pc.id) as comment_count
FROM gym_posts gp
LEFT JOIN post_likes pl ON gp.id = pl.post_id
LEFT JOIN post_comments pc ON gp.id = pc.post_id
GROUP BY post_id;

-- 問題：計算可能な値の保存
workout_duration_calculated → started_at/ended_atから計算
```

#### users テーブル
```sql
-- 問題：冗長フラグ
is_gym_owner → gym_ownersテーブルから判定可能

-- 解決案：ビューで対応
CREATE VIEW users_with_owner_flag AS
SELECT u.*,
  EXISTS(SELECT 1 FROM gym_owners WHERE user_id = u.id) as is_gym_owner
FROM users u;
```

### 2. 配列カラムの正規化

#### 優先度高
```sql
-- gym_posts.muscle_groups_trained → 別テーブル化
CREATE TABLE post_muscle_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES gym_posts(id) ON DELETE CASCADE,
  muscle_group TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_profiles.secondary_gym_ids → 既存のuser_secondary_gymsで管理
-- （重複管理を解消）
```

### 3. JSONBカラムの最適化

#### gym_detailed_info
```sql
-- 現在：6つのJSONBカラム
-- 問題：クエリパフォーマンス、型安全性

-- 解決案：構造化テーブルへの分離
CREATE TABLE gym_pricing_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  price DECIMAL(10,2),
  duration TEXT,
  features TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gym_operating_hours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT FALSE
);
```

## 🟡 パフォーマンス改善

### 1. パーティショニング候補

```sql
-- gym_posts: 月別パーティション
-- 100件以上のデータがあれば効果的
CREATE TABLE gym_posts_2024_01 PARTITION OF gym_posts
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### 2. 不要データのアーカイブ

```sql
-- 古い通知の削除
DELETE FROM notifications
WHERE created_at < NOW() - INTERVAL '3 months'
  AND is_read = true;

-- 古いチェックインのアーカイブ
CREATE TABLE gym_checkins_archive AS
SELECT * FROM gym_checkins
WHERE checked_in_at < NOW() - INTERVAL '1 year';
```

### 3. インデックスの追加最適化

```sql
-- 複合インデックスの見直し
CREATE INDEX idx_gym_posts_user_visibility_created
ON gym_posts(user_id, visibility, created_at DESC)
WHERE is_public = true;

-- 部分インデックスの活用
CREATE INDEX idx_notifications_unread_recent
ON notifications(user_id, created_at DESC)
WHERE is_read = false
  AND created_at > NOW() - INTERVAL '7 days';
```

## 🟢 クエリ最適化

### 1. N+1問題の解消

```sql
-- 問題：ユーザーごとの投稿数を個別クエリ
-- 解決：JOINで一括取得
CREATE VIEW user_post_counts AS
SELECT
  u.id,
  u.username,
  COUNT(gp.id) as post_count
FROM users u
LEFT JOIN gym_posts gp ON u.id = gp.user_id
GROUP BY u.id, u.username;
```

### 2. 統計情報の事前計算

```sql
-- 日次集計バッチ
CREATE TABLE daily_user_stats AS
SELECT
  user_id,
  DATE(created_at) as date,
  COUNT(*) as post_count,
  AVG(duration_minutes) as avg_duration
FROM gym_posts
GROUP BY user_id, DATE(created_at);
```

## 実装優先順位

1. **即実施**
   - gym_posts の like_count/comment_count をビュー化
   - 不要な配列カラムの正規化

2. **今週中**
   - JSONBカラムの構造化
   - 古いデータのアーカイブ

3. **来週以降**
   - パーティショニングの検討
   - マテリアライズドビューの活用

## 期待される効果

- **クエリ速度**: 30-50%改善
- **ストレージ**: 20%削減
- **保守性**: 大幅向上
- **型安全性**: JSONBから構造化で向上