# バックアップとリストア戦略

## 📅 作成日: 2025年9月25日

## 1. Supabaseの自動バックアップ

### デフォルト設定（無料プラン）
- **頻度**: 毎日自動バックアップ
- **保持期間**: 7日間
- **リストア**: Supabaseダッシュボードから実行

### 有料プラン（Pro以上）
- **頻度**: 毎日自動バックアップ
- **保持期間**: 30日間
- **Point-in-Time Recovery**: 最大30日前まで

## 2. 手動バックアップ手順

### A. 全体バックアップ（pg_dump使用）

```bash
# 1. 接続情報を環境変数に設定
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.htytewqvkgwyuvcsvjwm.supabase.co:5432/postgres"

# 2. 全体バックアップ
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 3. 圧縮して保存
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### B. テーブル単位のバックアップ

```bash
# 特定テーブルのみ
pg_dump $DATABASE_URL -t users -t gym_posts > critical_tables_backup.sql

# データのみ（スキーマ除外）
pg_dump $DATABASE_URL --data-only > data_backup.sql

# スキーマのみ（データ除外）
pg_dump $DATABASE_URL --schema-only > schema_backup.sql
```

## 3. リストア手順

### A. 完全リストア

```bash
# 1. 既存データのクリア（慎重に！）
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# 2. バックアップからリストア
psql $DATABASE_URL < backup_20250925.sql

# 3. 圧縮ファイルから
gunzip -c backup_20250925.sql.gz | psql $DATABASE_URL
```

### B. 部分リストア

```bash
# 特定テーブルのみリストア
psql $DATABASE_URL < critical_tables_backup.sql

# トランザクション付きリストア（エラー時にロールバック）
psql $DATABASE_URL --single-transaction < backup.sql
```

## 4. Supabase CLI を使った方法

```bash
# インストール
npm install -g supabase

# ログイン
supabase login

# プロジェクトリンク
supabase link --project-ref htytewqvkgwyuvcsvjwm

# DBダンプ作成
supabase db dump > backup.sql

# リストア
supabase db push < backup.sql
```

## 5. 緊急時復旧計画

### レベル1: 軽微な問題（誤削除など）
1. audit_logsで変更履歴確認
2. 特定レコードのみ復元
3. 所要時間: 5-10分

### レベル2: テーブル破損
1. Supabaseダッシュボードから過去7日のバックアップ選択
2. リストア実行
3. 所要時間: 30分

### レベル3: 完全障害
1. 最新の手動バックアップを使用
2. 新しいSupabaseプロジェクト作成
3. 完全リストア実行
4. アプリケーションの接続先変更
5. 所要時間: 1-2時間

## 6. バックアップ自動化スクリプト

```bash
#!/bin/bash
# backup.sh

# 設定
DB_URL="postgresql://postgres:[PASSWORD]@db.htytewqvkgwyuvcsvjwm.supabase.co:5432/postgres"
BACKUP_DIR="/backups"
RETENTION_DAYS=30

# バックアップ実行
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DB_URL | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# 古いバックアップ削除
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# S3やGCSにアップロード（オプション）
# aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://my-bucket/backups/
```

## 7. cronでの定期実行

```bash
# crontab -e
# 毎日午前3時にバックアップ
0 3 * * * /path/to/backup.sh >> /var/log/backup.log 2>&1
```

## 8. テストリストア手順

### 月1回の復旧テスト推奨

1. テスト用Supabaseプロジェクト作成
2. 本番バックアップをテスト環境にリストア
3. アプリケーション接続テスト
4. データ整合性確認
5. テスト環境削除

## 9. 重要な注意事項

### ⚠️ 実行前に必ず確認
- [ ] バックアップの完全性確認
- [ ] リストア先の環境確認（本番/開発）
- [ ] 現在のデータのバックアップ
- [ ] メンテナンスモードへの切り替え
- [ ] 関係者への通知

### 🔒 セキュリティ
- バックアップファイルは暗号化して保存
- アクセス権限を制限
- パスワードは環境変数で管理

## 10. 連絡先とエスカレーション

### 問題発生時の連絡先
1. **Supabaseサポート**: support@supabase.io
2. **社内DBA**: [連絡先を記入]
3. **システム管理者**: [連絡先を記入]

### エスカレーション基準
- 5分以内に解決不可 → レベル2対応
- 30分以内に解決不可 → レベル3対応
- データ損失の可能性 → 即座に全関係者通知