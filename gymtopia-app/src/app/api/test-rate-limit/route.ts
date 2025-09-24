import { NextRequest, NextResponse } from 'next/server'
import { rateLimiters } from '@/lib/middleware/rateLimit'

export async function GET(request: NextRequest) {
  // レート制限チェック
  const rateLimitResult = await rateLimiters.api(request)
  if (rateLimitResult) {
    return rateLimitResult
  }

  return NextResponse.json({
    message: 'レート制限テスト成功',
    timestamp: new Date().toISOString(),
    ip: request.headers.get('x-forwarded-for') || 'unknown'
  })
}