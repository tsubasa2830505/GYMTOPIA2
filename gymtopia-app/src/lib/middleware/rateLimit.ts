import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number  // 時間窓（ミリ秒）
  maxRequests: number  // 最大リクエスト数
  message?: string  // エラーメッセージ
}

// メモリベースの簡易実装（本番環境ではRedis推奨）
const requestCounts = new Map<string, { count: number; resetTime: number }>()

/**
 * IPベースのレート制限
 */
export function createRateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests, message = 'Too many requests' } = config

  return async function rateLimit(req: NextRequest): Promise<NextResponse | null> {
    const ip = req.headers.get('x-forwarded-for') ||
               req.headers.get('x-real-ip') ||
               'unknown'

    const now = Date.now()
    const key = `${ip}:${req.nextUrl.pathname}`

    const record = requestCounts.get(key)

    if (!record || now > record.resetTime) {
      // 新しい時間窓を開始
      requestCounts.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      return null  // リクエストを許可
    }

    if (record.count >= maxRequests) {
      // レート制限に達した
      return NextResponse.json(
        {
          error: message,
          retryAfter: Math.ceil((record.resetTime - now) / 1000)
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
            'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString()
          }
        }
      )
    }

    // カウントをインクリメント
    record.count++
    return null  // リクエストを許可
  }
}

// 古いエントリをクリーンアップ（メモリリーク防止）
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(key)
    }
  }
}, 60000)  // 1分ごとにクリーンアップ

// プリセット設定
export const rateLimiters = {
  // APIエンドポイント用（1分間に60リクエストまで）
  api: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 60,
    message: 'API rate limit exceeded. Please try again later.'
  }),

  // 認証エンドポイント用（5分間に5リクエストまで）
  auth: createRateLimiter({
    windowMs: 5 * 60 * 1000,
    maxRequests: 5,
    message: 'Too many authentication attempts. Please try again later.'
  }),

  // アップロード用（1分間に10リクエストまで）
  upload: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 10,
    message: 'Upload rate limit exceeded. Please try again later.'
  })
}