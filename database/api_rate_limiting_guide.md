# API Rate Limiting 実装ガイド

## 📅 実装日: 2025年9月25日

## 1. 概要

本番環境のAPI保護のため、以下の制限機能を実装しました：
- **Rate Limiting**: 時間窓ベースのリクエスト制限
- **API Quotas**: ユーザープラン別の使用量制限
- **使用統計**: API使用状況の追跡

## 2. Rate Limiting（レート制限）

### 実装済みテーブル
```sql
api_rate_limits       -- リクエスト追跡
api_usage_stats      -- 使用統計
```

### 使用方法
```sql
-- Rate Limitチェック（例：1時間に100リクエストまで）
SELECT check_rate_limit(
    p_user_id := 'user-uuid',
    p_ip_address := '192.168.1.1'::inet,
    p_endpoint := '/api/posts',
    p_limit := 100,
    p_window_minutes := 60
);
-- Returns: TRUE（制限内）/ FALSE（制限超過）
```

### アプリケーションでの実装例
```typescript
// Supabaseエッジ関数やミドルウェアで
const checkRateLimit = async (userId: string, ip: string, endpoint: string) => {
  const { data, error } = await supabase.rpc('check_rate_limit', {
    p_user_id: userId,
    p_ip_address: ip,
    p_endpoint: endpoint,
    p_limit: 100,
    p_window_minutes: 60
  });

  if (!data) {
    throw new Error('Rate limit exceeded');
  }

  return true;
};
```

## 3. API Quotas（使用量制限）

### プラン別制限
| プラン | 日次リクエスト | 月次リクエスト | ストレージ | 同時接続 |
|-------|--------------|--------------|-----------|---------|
| Free | 1,000 | 10,000 | 100MB | 10 |
| Basic | 5,000 | 50,000 | 500MB | 25 |
| Pro | 20,000 | 200,000 | 2GB | 50 |
| Enterprise | 無制限 | 無制限 | 10GB | 200 |

### エンドポイント別制限（RPM: Requests Per Minute）
| エンドポイント | Free | Basic | Pro | Enterprise | 優先度 |
|--------------|------|-------|-----|------------|-------|
| /api/auth/* | 5 | 10 | 20 | 50 | 10 |
| /api/users/* | 10 | 30 | 60 | 150 | 8 |
| /api/gyms/* | 20 | 50 | 100 | 200 | 7 |
| /api/posts/* | 15 | 40 | 80 | 180 | 6 |
| /api/search/* | 10 | 25 | 50 | 100 | 5 |
| /api/upload/* | 5 | 15 | 30 | 60 | 4 |
| /api/stats/* | 5 | 20 | 40 | 80 | 3 |

### クォータチェック
```sql
-- ユーザーのクォータ確認
SELECT check_api_quota('user-uuid', 'api');
-- Returns: TRUE（クォータ内）/ FALSE（クォータ超過）
```

## 4. 使用統計の追跡

```sql
-- API使用統計を更新
SELECT update_api_usage_stats(
    p_user_id := 'user-uuid',
    p_endpoint := '/api/posts',
    p_success := true,
    p_response_time_ms := 45
);
```

## 5. 実装推奨事項

### Supabaseエッジ関数での実装
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'

serve(async (req) => {
  const supabase = createClient(...)

  // 1. ユーザー認証
  const { user } = await supabase.auth.getUser()

  // 2. Rate Limitチェック
  const { data: allowed } = await supabase.rpc('check_rate_limit', {
    p_user_id: user?.id,
    p_ip_address: req.headers.get('x-forwarded-for'),
    p_endpoint: new URL(req.url).pathname,
    p_limit: 100,
    p_window_minutes: 60
  })

  if (!allowed) {
    return new Response('Too Many Requests', { status: 429 })
  }

  // 3. クォータチェック
  const { data: quotaOk } = await supabase.rpc('check_api_quota', {
    p_user_id: user?.id,
    p_request_type: 'api'
  })

  if (!quotaOk) {
    return new Response('Quota Exceeded', { status: 429 })
  }

  // 4. 実際のAPI処理
  const startTime = Date.now()
  try {
    // ... API処理 ...

    // 5. 統計更新
    await supabase.rpc('update_api_usage_stats', {
      p_user_id: user?.id,
      p_endpoint: new URL(req.url).pathname,
      p_success: true,
      p_response_time_ms: Date.now() - startTime
    })

    return new Response(result, { status: 200 })
  } catch (error) {
    // エラー時も統計更新
    await supabase.rpc('update_api_usage_stats', {
      p_user_id: user?.id,
      p_endpoint: new URL(req.url).pathname,
      p_success: false,
      p_response_time_ms: Date.now() - startTime
    })

    throw error
  }
})
```

## 6. メンテナンス

### 古いレート制限レコードのクリーンアップ
```sql
-- 24時間以上前のレコードを削除
SELECT cleanup_old_rate_limits();
```

### cronジョブ設定（推奨）
```bash
# 毎日午前3時にクリーンアップ
0 3 * * * psql $DATABASE_URL -c "SELECT cleanup_old_rate_limits();"
```

## 7. モニタリング

### 現在のレート制限状況
```sql
-- ユーザーの現在の使用状況
SELECT * FROM api_rate_limits
WHERE user_id = 'user-uuid'
AND window_end > NOW()
ORDER BY created_at DESC;
```

### API使用統計
```sql
-- 日次使用統計
SELECT
    endpoint,
    SUM(total_requests) as total,
    SUM(successful_requests) as success,
    SUM(failed_requests) as failed,
    AVG(average_response_time_ms) as avg_ms
FROM api_usage_stats
WHERE date = CURRENT_DATE
GROUP BY endpoint
ORDER BY total DESC;
```

### ユーザー別クォータ状況
```sql
-- クォータ使用率
SELECT
    user_id,
    plan_type,
    daily_requests_used::float / daily_request_limit * 100 as daily_usage_pct,
    monthly_requests_used::float / monthly_request_limit * 100 as monthly_usage_pct,
    storage_used_mb::float / storage_limit_mb * 100 as storage_usage_pct
FROM api_quotas
ORDER BY monthly_usage_pct DESC;
```

## 8. トラブルシューティング

### よくある問題

1. **"Rate limit exceeded"エラー**
   - 原因: 短時間に大量のリクエスト
   - 対策: リトライロジックの実装、エクスポネンシャルバックオフ

2. **"Quota exceeded"エラー**
   - 原因: プラン制限到達
   - 対策: プランアップグレード、使用量最適化

3. **レスポンスが遅い**
   - 原因: Rate Limitingチェックのオーバーヘッド
   - 対策: Redis等のキャッシュ層導入

## 9. セキュリティ考慮事項

1. **DDoS対策**
   - IP単位でのRate Limiting実装済み
   - CloudflareなどのCDN/WAF追加推奨

2. **認証回避の防止**
   - 未認証ユーザーはIPベースで制限
   - 認証ユーザーはuser_idベースで制限

3. **制限回避の防止**
   - 複数アカウント作成対策が必要
   - IPアドレスのなりすまし対策

## 10. 今後の拡張案

1. **動的制限調整**
   - サーバー負荷に応じた自動調整
   - 時間帯別の制限変更

2. **詳細な統計**
   - エンドポイント別のレイテンシ分布
   - エラー率の追跡

3. **アラート機能**
   - 制限到達時の通知
   - 異常なトラフィックパターンの検知

## 重要な注意事項

⚠️ **本番環境適用前に**：
- [ ] Supabaseエッジ関数でのRate Limiting実装
- [ ] フロントエンドのエラーハンドリング追加
- [ ] 429エラー時のリトライロジック実装
- [ ] 負荷テストの実施
- [ ] アラート設定