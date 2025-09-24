# RLS（Row Level Security）実装計画

## 現状分析
- **RLS有効**: 19/38テーブル（50%）
- **RLS無効**: 10テーブル（重要度別に対応必要）

## 実装優先順位

### 🔴 最優先（コアデータ保護）
1. **users** - ユーザー基本情報
2. **gyms** - ジム基本情報
3. **gym_posts** - 投稿データ

### 🟡 中優先（運営データ）
4. **gym_detailed_info** - ジム詳細情報
5. **gym_owners** - オーナー権限
6. **workout_sessions** - トレーニング記録

### 🟢 低優先（補助データ）
7. **achievements** - 実績データ
8. **checkin_badges** - バッジ
9. **checkin_verifications** - 認証ログ
10. **gym_rarities** - レアリティ

## RLSポリシー設計原則

### 1. users テーブル
```sql
-- 自分の情報は読み書き可能
-- 他人の公開情報は読み取りのみ
-- プライバシー設定を尊重
```

### 2. gym_posts テーブル
```sql
-- 自分の投稿は編集・削除可能
-- 公開投稿は全員読み取り可能
-- プライベート投稿は本人のみ
```

### 3. gyms テーブル
```sql
-- 基本情報は全員読み取り可能
-- オーナーのみ編集可能
-- 新規登録は認証ユーザーのみ
```

## 実装手順

### Step 1: バックアップ
```sql
-- 現在のポリシーをバックアップ
pg_dump --schema-only --table=* > backup_before_rls.sql
```

### Step 2: RLS有効化
```sql
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;
```

### Step 3: ポリシー作成
```sql
CREATE POLICY [policy_name] ON [table_name]
FOR [operation]
TO [role]
USING ([condition])
WITH CHECK ([condition]);
```

### Step 4: テスト
- 各ロールでのCRUD操作確認
- パフォーマンステスト
- エッジケース検証

### Step 5: モニタリング
- クエリパフォーマンス監視
- アクセスログ確認
- エラー率チェック

## セキュリティベストプラクティス

1. **最小権限の原則**
   - 必要最小限のアクセス権のみ付与

2. **明示的な拒否**
   - デフォルトは全て拒否、必要な権限のみ許可

3. **監査ログ**
   - 重要操作は全て記録

4. **定期レビュー**
   - 月次でポリシーの見直し

## リスクと対策

| リスク | 対策 |
|--------|------|
| パフォーマンス低下 | インデックス最適化、ポリシー簡素化 |
| 複雑性増加 | ドキュメント整備、テスト自動化 |
| 運用ミス | ステージング環境でのテスト徹底 |

## 実装スケジュール

- **Week 1**: 高優先度テーブル（users, gyms, gym_posts）
- **Week 2**: 中優先度テーブル
- **Week 3**: 低優先度テーブル
- **Week 4**: 総合テスト、本番適用