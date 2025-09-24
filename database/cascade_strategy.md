# データ整合性：カスケード戦略

## 現状の問題点
多くの外部キー制約がNO ACTIONまたはSET NULLになっており、データ削除時の整合性が不十分。

## カスケード設定方針

### 基本原則
1. **ユーザー削除時**: 関連データは保持（SET NULL）または論理削除
2. **投稿削除時**: 関連するいいね・コメントは削除（CASCADE）
3. **ジム削除時**: 基本的に論理削除、物理削除は制限

## 優先度別実装計画

### 🔴 最優先：投稿関連

#### 1. gym_posts（投稿）削除時のカスケード
```sql
-- post_likes: 投稿削除時にいいねも削除
ALTER TABLE post_likes
DROP CONSTRAINT post_likes_post_id_fkey,
ADD CONSTRAINT post_likes_post_id_fkey
FOREIGN KEY (post_id) REFERENCES gym_posts(id)
ON DELETE CASCADE;

-- post_comments: 投稿削除時にコメントも削除
ALTER TABLE post_comments
DROP CONSTRAINT post_comments_post_id_fkey,
ADD CONSTRAINT post_comments_post_id_fkey
FOREIGN KEY (post_id) REFERENCES gym_posts(id)
ON DELETE CASCADE;

-- notifications: 投稿削除時に通知をNULL化
ALTER TABLE notifications
DROP CONSTRAINT notifications_related_post_id_fkey,
ADD CONSTRAINT notifications_related_post_id_fkey
FOREIGN KEY (related_post_id) REFERENCES gym_posts(id)
ON DELETE SET NULL;
```

### 🟡 中優先：ユーザー関連

#### 2. users削除時の処理（論理削除推奨）
```sql
-- ユーザーは物理削除せず、is_active = false で論理削除
-- ただし、完全削除が必要な場合のカスケード設定

-- gym_posts: ユーザー削除時も投稿は保持
ALTER TABLE gym_posts
DROP CONSTRAINT gym_posts_user_id_fkey,
ADD CONSTRAINT gym_posts_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE SET NULL;

-- follows: フォロー関係は削除
ALTER TABLE follows
DROP CONSTRAINT follows_follower_id_fkey,
ADD CONSTRAINT follows_follower_id_fkey
FOREIGN KEY (follower_id) REFERENCES users(id)
ON DELETE CASCADE;

ALTER TABLE follows
DROP CONSTRAINT follows_following_id_fkey,
ADD CONSTRAINT follows_following_id_fkey
FOREIGN KEY (following_id) REFERENCES users(id)
ON DELETE CASCADE;
```

### 🟢 低優先：ジム関連

#### 3. gyms削除時の処理（論理削除推奨）
```sql
-- ジムは status = 'inactive' で論理削除
-- 物理削除時のカスケード設定（緊急時のみ）

-- gym_checkins: チェックイン履歴は保持
ALTER TABLE gym_checkins
DROP CONSTRAINT gym_checkins_gym_id_fkey,
ADD CONSTRAINT gym_checkins_gym_id_fkey
FOREIGN KEY (gym_id) REFERENCES gyms(id)
ON DELETE SET NULL;

-- favorite_gyms: お気に入りは削除
ALTER TABLE favorite_gyms
DROP CONSTRAINT favorite_gyms_gym_id_fkey,
ADD CONSTRAINT favorite_gyms_gym_id_fkey
FOREIGN KEY (gym_id) REFERENCES gyms(id)
ON DELETE CASCADE;
```

## 実装順序

### Phase 1: 投稿関連（即実施）
- post_likes → CASCADE
- post_comments → CASCADE
- notifications → SET NULL

### Phase 2: フォロー関連
- follows（両方向） → CASCADE

### Phase 3: ワークアウト関連
- workout_exercises → CASCADE（セッション削除時）

### Phase 4: その他
- 残りの制約を個別検討

## リスクと対策

| リスク | 対策 |
|--------|------|
| 誤削除によるデータ損失 | 論理削除を優先、物理削除は制限 |
| カスケード削除の連鎖 | 削除前の確認プロセス追加 |
| パフォーマンス低下 | 削除操作のバッチ処理化 |

## テスト項目

1. 投稿削除時のいいね・コメント削除確認
2. ユーザー削除時のフォロー関係削除確認
3. 孤立データが発生しないことの確認
4. ロールバックテスト