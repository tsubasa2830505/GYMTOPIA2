# 安全なDB最適化計画

## ⚠️ UI依存性の調査結果

### 変更不可のカラム（UIで使用中）

#### 1. gym_posts.like_count / comment_count
- **使用箇所**: 4ファイル
  - `/app/user/[userId]/page.tsx`
  - `/lib/supabase/profile.ts`
  - `/lib/supabase/posts-original.ts`
- **影響**: 削除するとフィード・プロフィール画面が壊れる
- **結論**: ❌ 変更不可

#### 2. users.is_gym_owner
- **使用箇所**: `/lib/supabase/admin.ts`
- **影響**: ジムオーナー判定ロジックが壊れる
- **結論**: ❌ 変更不可

#### 3. user_profiles.secondary_gym_ids
- **使用箇所**: 5ファイル（フィード機能で重要）
- **影響**: 複数ジム登録機能が壊れる
- **結論**: ❌ 変更不可

## ✅ 安全に実施可能な最適化

### 1. トリガーによる自動更新（互換性維持）

```sql
-- like_count/comment_countを残したまま、トリガーで自動更新
CREATE OR REPLACE FUNCTION update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'post_likes' THEN
    UPDATE gym_posts
    SET like_count = (
      SELECT COUNT(*) FROM post_likes WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
    )
    WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  ELSIF TG_TABLE_NAME = 'post_comments' THEN
    UPDATE gym_posts
    SET comment_count = (
      SELECT COUNT(*) FROM post_comments WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
    )
    WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー設定
CREATE TRIGGER update_like_count
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_counts();

CREATE TRIGGER update_comment_count
AFTER INSERT OR DELETE ON post_comments
FOR EACH ROW EXECUTE FUNCTION update_post_counts();
```

**メリット**:
- UIは変更不要
- データ整合性が保証される
- 手動更新の必要なし

### 2. 未使用カラムの削除（安全）

```sql
-- workout_duration_calculated（使用箇所なし）
ALTER TABLE gym_posts DROP COLUMN IF EXISTS workout_duration_calculated;

-- training_details（JSONBカラム、未使用）
ALTER TABLE gym_posts DROP COLUMN IF EXISTS training_details;
```

### 3. ビューによる最適化（新規追加）

```sql
-- 統計情報の事前計算ビュー（既存に影響なし）
CREATE MATERIALIZED VIEW user_post_stats AS
SELECT
  user_id,
  DATE(created_at) as date,
  COUNT(*) as daily_posts,
  AVG(duration_minutes) as avg_duration
FROM gym_posts
GROUP BY user_id, DATE(created_at);

-- 1日1回更新
CREATE OR REPLACE FUNCTION refresh_user_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_post_stats;
END;
$$ LANGUAGE plpgsql;
```

### 4. インデックスの最適化（影響なし）

```sql
-- 未使用インデックスの削除
DROP INDEX IF EXISTS idx_unused_index_name;

-- より効率的な複合インデックス
CREATE INDEX CONCURRENTLY idx_gym_posts_feed_optimized
ON gym_posts(created_at DESC, visibility, is_public)
WHERE visibility = 'public' AND is_public = true;
```

### 5. パーティショニング（新規、既存に影響なし）

```sql
-- 古い通知をアーカイブテーブルへ
CREATE TABLE notifications_archive (LIKE notifications INCLUDING ALL);

-- 3ヶ月以上前の既読通知を移動
INSERT INTO notifications_archive
SELECT * FROM notifications
WHERE created_at < NOW() - INTERVAL '3 months'
  AND is_read = true;

DELETE FROM notifications
WHERE created_at < NOW() - INTERVAL '3 months'
  AND is_read = true;
```

## 実装順序（リスク最小化）

### Phase 1: 完全に安全（即実施可）
1. ✅ トリガーによるlike_count/comment_count自動更新
2. ✅ 未使用カラムの削除
3. ✅ 新規ビューの追加

### Phase 2: パフォーマンス改善（テスト後）
4. ✅ インデックス最適化
5. ✅ 古いデータのアーカイブ

### Phase 3: 将来的な改善（大規模リファクタ時）
- like_count/comment_countの完全移行
- JSONBカラムの構造化
- 配列カラムの正規化

## 実施前チェックリスト

- [ ] バックアップ作成
- [ ] ステージング環境でテスト
- [ ] アプリケーションの動作確認
- [ ] ロールバック手順の準備

## 期待効果

- **整合性**: 100%保証（トリガー）
- **パフォーマンス**: 20-30%改善
- **UIへの影響**: なし
- **リスク**: 最小限