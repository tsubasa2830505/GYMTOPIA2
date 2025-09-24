import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// CSRFトークンの生成
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// CSRFトークンの検証
export function verifyCSRFToken(request: NextRequest): boolean {
  // GETリクエストはスキップ
  if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS') {
    return true
  }

  // CSRFトークンをヘッダーまたはボディから取得
  const headerToken = request.headers.get('X-CSRF-Token')
  const cookieToken = request.cookies.get('csrf-token')?.value

  // トークンが存在し、一致するか確認
  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return false
  }

  return true
}

// CSRF保護ミドルウェア
export async function csrfProtection(request: NextRequest): Promise<NextResponse | null> {
  // 開発環境では無効化可能
  if (process.env.NEXT_PUBLIC_DISABLE_CSRF === 'true') {
    return null
  }

  // APIルートのみ保護
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return null
  }

  // 除外パス（公開API等）
  const excludedPaths = [
    '/api/health',
    '/api/gyms',  // 公開情報の取得
  ]

  if (excludedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return null
  }

  // CSRF検証
  if (!verifyCSRFToken(request)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    )
  }

  return null
}

// CSRFトークンをレスポンスに設定
export function setCSRFToken(response: NextResponse): NextResponse {
  const token = generateCSRFToken()

  // Cookieに設定
  response.cookies.set({
    name: 'csrf-token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 // 24時間
  })

  // ヘッダーにも設定（クライアント側で取得可能）
  response.headers.set('X-CSRF-Token', token)

  return response
}