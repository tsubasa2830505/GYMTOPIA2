# Supabaseモニタリング設定ガイド

## 📅 作成日: 2025年9月25日

## 1. Supabaseダッシュボードでの設定

### A. データベースメトリクス監視

#### 監視すべき主要メトリクス
1. **CPU使用率**: 80%以上でアラート
2. **メモリ使用率**: 85%以上でアラート
3. **ストレージ使用量**: 90%以上でアラート
4. **接続数**: 最大接続数の80%でアラート
5. **クエリ実行時間**: 1秒以上のスロークエリ

#### Supabaseダッシュボードでの設定手順
1. プロジェクトダッシュボードを開く
2. Settings → Database → Performance
3. Alert Thresholds設定:
   - CPU Usage: 80%
   - Memory Usage: 85%
   - Storage Usage: 90%
   - Connection Pool: 80%

### B. APIメトリクス監視

#### 監視項目
- **リクエスト数/分**: 異常なスパイクを検知
- **エラー率**: 5%以上でアラート
- **レスポンス時間**: p95が500ms以上でアラート
- **4xx/5xxエラー**: 閾値超過でアラート

## 2. カスタム監視クエリ

### A. パフォーマンス監視クエリ

```sql
-- スロークエリの検出
CREATE OR REPLACE VIEW monitoring_slow_queries AS
SELECT
    query,
    calls,
    total_time,
    mean_time,
    max_time,
    min_time,
    stddev_time
FROM pg_stat_statements
WHERE mean_time > 100 -- 100ms以上
ORDER BY mean_time DESC
LIMIT 20;

-- インデックス使用率の監視
CREATE OR REPLACE VIEW monitoring_index_usage AS
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- テーブルサイズ監視
CREATE OR REPLACE VIEW monitoring_table_sizes AS
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as indexes_size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### B. アプリケーション監視クエリ

```sql
-- アクティブユーザー数
CREATE OR REPLACE VIEW monitoring_active_users AS
SELECT
    DATE_TRUNC('hour', created_at) as hour,
    COUNT(DISTINCT user_id) as active_users
FROM gym_posts
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;

-- エラー率の監視
CREATE OR REPLACE VIEW monitoring_error_rates AS
SELECT
    DATE_TRUNC('hour', occurred_at) as hour,
    COUNT(*) FILTER (WHERE operation = 'INSERT') as inserts,
    COUNT(*) FILTER (WHERE operation = 'UPDATE') as updates,
    COUNT(*) FILTER (WHERE operation = 'DELETE') as deletes,
    COUNT(*) as total_operations
FROM audit_logs
WHERE occurred_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;

-- API使用状況
CREATE OR REPLACE VIEW monitoring_api_usage AS
SELECT
    endpoint,
    SUM(total_requests) as total_requests,
    SUM(successful_requests) as success,
    SUM(failed_requests) as failed,
    CASE
        WHEN SUM(total_requests) > 0
        THEN ROUND(SUM(failed_requests)::numeric / SUM(total_requests) * 100, 2)
        ELSE 0
    END as error_rate_pct,
    AVG(average_response_time_ms) as avg_response_ms
FROM api_usage_stats
WHERE date = CURRENT_DATE
GROUP BY endpoint
ORDER BY total_requests DESC;
```

## 3. アラート設定

### A. データベースヘルスチェック関数

```sql
-- 総合ヘルスチェック関数
CREATE OR REPLACE FUNCTION check_database_health()
RETURNS TABLE(
    check_name TEXT,
    status TEXT,
    value NUMERIC,
    threshold NUMERIC,
    message TEXT
) AS $$
BEGIN
    -- CPU使用率チェック（疑似）
    RETURN QUERY
    SELECT 'Connection Count'::TEXT,
           CASE WHEN COUNT(*) > 80 THEN 'WARNING' ELSE 'OK' END,
           COUNT(*)::NUMERIC,
           100::NUMERIC,
           'Active connections: ' || COUNT(*)
    FROM pg_stat_activity
    WHERE state != 'idle';

    -- ストレージ使用率
    RETURN QUERY
    SELECT 'Database Size'::TEXT,
           CASE WHEN pg_database_size(current_database()) > 1073741824 THEN 'WARNING' ELSE 'OK' END,
           ROUND((pg_database_size(current_database()) / 1048576.0)::numeric, 2),
           1024::NUMERIC,
           'Database size: ' || pg_size_pretty(pg_database_size(current_database()));

    -- スロークエリ数
    RETURN QUERY
    SELECT 'Slow Queries'::TEXT,
           CASE WHEN COUNT(*) > 10 THEN 'WARNING' ELSE 'OK' END,
           COUNT(*)::NUMERIC,
           10::NUMERIC,
           'Queries slower than 100ms: ' || COUNT(*)
    FROM pg_stat_statements
    WHERE mean_time > 100;

    -- デッドロック
    RETURN QUERY
    SELECT 'Deadlocks'::TEXT,
           CASE WHEN deadlocks > 0 THEN 'ERROR' ELSE 'OK' END,
           deadlocks::NUMERIC,
           0::NUMERIC,
           'Deadlocks detected: ' || deadlocks
    FROM pg_stat_database
    WHERE datname = current_database();

    -- レプリケーション遅延（該当する場合）
    RETURN QUERY
    SELECT 'Table Bloat'::TEXT,
           CASE WHEN MAX(n_dead_tup) > 10000 THEN 'WARNING' ELSE 'OK' END,
           MAX(n_dead_tup)::NUMERIC,
           10000::NUMERIC,
           'Max dead tuples: ' || MAX(n_dead_tup)
    FROM pg_stat_user_tables;
END;
$$ LANGUAGE plpgsql;

-- アラート通知テーブル
CREATE TABLE IF NOT EXISTS monitoring_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- アラート記録関数
CREATE OR REPLACE FUNCTION record_alert(
    p_alert_type VARCHAR,
    p_severity VARCHAR,
    p_message TEXT,
    p_details JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    v_alert_id UUID;
BEGIN
    INSERT INTO monitoring_alerts (alert_type, severity, message, details)
    VALUES (p_alert_type, p_severity, p_message, p_details)
    RETURNING id INTO v_alert_id;

    RETURN v_alert_id;
END;
$$ LANGUAGE plpgsql;
```

### B. 定期監視ジョブ

```sql
-- 5分ごとの監視関数
CREATE OR REPLACE FUNCTION monitoring_check_5min()
RETURNS VOID AS $$
DECLARE
    v_health RECORD;
BEGIN
    -- ヘルスチェック実行
    FOR v_health IN SELECT * FROM check_database_health() WHERE status != 'OK'
    LOOP
        -- アラート記録
        PERFORM record_alert(
            'health_check',
            CASE v_health.status
                WHEN 'ERROR' THEN 'error'
                WHEN 'WARNING' THEN 'warning'
                ELSE 'info'
            END,
            v_health.check_name || ': ' || v_health.message,
            jsonb_build_object(
                'check_name', v_health.check_name,
                'value', v_health.value,
                'threshold', v_health.threshold
            )
        );
    END LOOP;

    -- API制限チェック
    IF EXISTS (
        SELECT 1 FROM api_rate_limits
        WHERE window_end > NOW()
        GROUP BY user_id
        HAVING SUM(request_count) > 900 -- 90%の閾値
    ) THEN
        PERFORM record_alert(
            'rate_limit',
            'warning',
            'Users approaching rate limit',
            jsonb_build_object(
                'users_count', (
                    SELECT COUNT(DISTINCT user_id)
                    FROM api_rate_limits
                    WHERE window_end > NOW()
                )
            )
        );
    END IF;

    -- ストレージ使用量チェック
    IF EXISTS (
        SELECT 1 FROM user_storage_usage
        WHERE total_storage_bytes > 400 * 1048576 -- 400MB（500MBの80%）
    ) THEN
        PERFORM record_alert(
            'storage_usage',
            'warning',
            'Users approaching storage limit',
            jsonb_build_object(
                'users_count', (
                    SELECT COUNT(*)
                    FROM user_storage_usage
                    WHERE total_storage_bytes > 400 * 1048576
                )
            )
        );
    END IF;
END;
$$ LANGUAGE plpgsql;
```

## 4. ダッシュボードビュー

```sql
-- リアルタイムダッシュボード用ビュー
CREATE OR REPLACE VIEW monitoring_dashboard AS
SELECT
    -- 基本統計
    (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '24 hours') as new_users_24h,
    (SELECT COUNT(*) FROM gym_posts WHERE created_at > NOW() - INTERVAL '24 hours') as new_posts_24h,
    (SELECT COUNT(DISTINCT user_id) FROM gym_posts WHERE created_at > NOW() - INTERVAL '24 hours') as active_users_24h,

    -- パフォーマンス
    (SELECT AVG(average_response_time_ms) FROM api_usage_stats WHERE date = CURRENT_DATE) as avg_api_response_ms,
    (SELECT MAX(average_response_time_ms) FROM api_usage_stats WHERE date = CURRENT_DATE) as max_api_response_ms,

    -- エラー率
    (SELECT COUNT(*) FROM monitoring_alerts WHERE severity IN ('error', 'critical') AND resolved_at IS NULL) as unresolved_errors,

    -- ストレージ
    (SELECT pg_size_pretty(pg_database_size(current_database()))) as database_size,

    -- 現在時刻
    NOW() as last_updated;
```

## 5. Supabase Webhookとの統合

### Webhook設定（Supabaseダッシュボード）

1. Database → Webhooks
2. Create a new webhook:
   - Name: `monitoring_alerts`
   - Table: `monitoring_alerts`
   - Events: INSERT
   - URL: 通知先のエンドポイント（Slack, Discord, etc.）

### Webhook受信例（Next.js）

```typescript
// pages/api/monitoring/webhook.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { record } = req.body;

  // Slackに通知
  if (record.severity === 'critical' || record.severity === 'error') {
    await sendSlackAlert({
      text: `🚨 ${record.severity.toUpperCase()}: ${record.message}`,
      attachments: [{
        color: record.severity === 'critical' ? 'danger' : 'warning',
        fields: [
          { title: 'Alert Type', value: record.alert_type },
          { title: 'Details', value: JSON.stringify(record.details) },
          { title: 'Time', value: record.created_at }
        ]
      }]
    });
  }

  res.status(200).json({ received: true });
}
```

## 6. 外部モニタリングツールとの統合

### A. Datadogとの統合

```yaml
# datadog-config.yaml
init_config:

instances:
  - host: db.htytewqvkgwyuvcsvjwm.supabase.co
    port: 5432
    username: postgres
    password: <your-password>
    dbname: postgres
    tags:
      - env:production
      - app:gymtopia
    custom_queries:
      - metric_prefix: gymtopia
        query: SELECT COUNT(*) as active_users FROM users WHERE last_active > NOW() - INTERVAL '1 hour'
        columns:
          - name: active_users
            type: gauge
```

### B. Grafanaダッシュボード

```json
{
  "dashboard": {
    "title": "GYMTOPIA Monitoring",
    "panels": [
      {
        "title": "Active Users",
        "targets": [
          {
            "rawSql": "SELECT DATE_TRUNC('minute', NOW()) as time, COUNT(DISTINCT user_id) as value FROM gym_posts WHERE created_at > NOW() - INTERVAL '5 minutes'"
          }
        ]
      },
      {
        "title": "API Response Time",
        "targets": [
          {
            "rawSql": "SELECT date as time, AVG(average_response_time_ms) as value FROM api_usage_stats WHERE date > NOW() - INTERVAL '24 hours' GROUP BY date"
          }
        ]
      }
    ]
  }
}
```

## 7. アラート通知チャンネル

### 優先度別通知設定

| 優先度 | 通知方法 | 対応時間 |
|--------|---------|----------|
| Critical | 電話 + Slack + Email | 即座 |
| Error | Slack + Email | 15分以内 |
| Warning | Slack | 1時間以内 |
| Info | ダッシュボード表示のみ | 翌営業日 |

## 8. 運用手順

### 日次チェック
```bash
# ヘルスチェック実行
psql $DATABASE_URL -c "SELECT * FROM check_database_health();"

# アラート確認
psql $DATABASE_URL -c "SELECT * FROM monitoring_alerts WHERE resolved_at IS NULL;"
```

### 週次レポート
```sql
-- 週次パフォーマンスレポート
SELECT
    DATE_TRUNC('day', date) as day,
    COUNT(DISTINCT user_id) as unique_users,
    SUM(total_requests) as api_requests,
    AVG(average_response_time_ms) as avg_response_ms,
    SUM(failed_requests)::float / NULLIF(SUM(total_requests), 0) * 100 as error_rate_pct
FROM api_usage_stats
WHERE date > NOW() - INTERVAL '7 days'
GROUP BY day
ORDER BY day;
```

## 重要な注意事項

⚠️ **設定時の注意**：
- [ ] Supabaseダッシュボードでアラート閾値設定
- [ ] Webhook URLの設定とテスト
- [ ] 通知チャンネル（Slack/Discord）の設定
- [ ] 定期監視cronジョブの設定
- [ ] 外部監視ツールのAPIキー設定
- [ ] オンコール体制の確立