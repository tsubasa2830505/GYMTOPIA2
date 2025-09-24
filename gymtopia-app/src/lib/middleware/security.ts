/**
 * セキュリティミドルウェア
 * XSS、CSRF、その他のセキュリティヘッダーを設定
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '../utils/logger';

/**
 * セキュリティヘッダーを設定
 */
export function setSecurityHeaders(response: NextResponse): NextResponse {
  const headers = {
    // XSS対策
    'X-XSS-Protection': '1; mode=block',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',

    // HSTS (HTTPS強制)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; '),

    // 権限ポリシー
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()'
    ].join(', '),

    // リファラーポリシー
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // CORS設定（本番環境用）
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production'
      ? 'https://gymtopia-app.vercel.app'
      : '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Access-Control-Max-Age': '86400',
  };

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * 危険なリクエストパターンを検出
 */
export function detectSuspiciousRequest(request: NextRequest): boolean {
  const url = request.url;
  const userAgent = request.headers.get('user-agent') || '';

  // SQLインジェクション試行の検出
  const sqlPatterns = [
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bDROP\b.*\bTABLE\b)/i,
    /(\bINSERT\b.*\bINTO\b)/i,
    /(--|\*\/)/,
    /(\bOR\b.*=.*)/i
  ];

  // XSS試行の検出
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe[^>]*>/gi
  ];

  // パストラバーサル試行の検出
  const pathTraversalPatterns = [
    /\.\.[\/\\]/,
    /\x00/,
    /%2e%2e/i,
    /%252e%252e/i
  ];

  const suspiciousPatterns = [
    ...sqlPatterns,
    ...xssPatterns,
    ...pathTraversalPatterns
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(userAgent)) {
      logger.warn('Suspicious request detected:', {
        url,
        userAgent,
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      });
      return true;
    }
  }

  return false;
}

/**
 * APIリクエストのセキュリティ検証
 */
export async function validateAPIRequest(request: NextRequest): Promise<NextResponse | null> {
  // 危険なリクエストパターンの検出
  if (detectSuspiciousRequest(request)) {
    logger.error('Blocked suspicious request:', {
      url: request.url,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent')
    });

    return NextResponse.json(
      { error: 'Request blocked for security reasons' },
      { status: 403 }
    );
  }

  // リクエストサイズの制限（10MB）
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
    logger.warn('Large request blocked:', {
      size: contentLength,
      url: request.url,
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json(
      { error: 'Request too large' },
      { status: 413 }
    );
  }

  return null;
}

/**
 * 本番環境での機密情報漏洩防止
 */
export function sanitizeErrorForProduction(error: any): any {
  if (process.env.NODE_ENV === 'production') {
    // 本番環境では詳細なエラー情報を隠す
    return {
      message: 'An error occurred',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    };
  }

  // 開発環境では詳細情報を返す
  return {
    message: error.message || 'An error occurred',
    code: error.code || 'UNKNOWN_ERROR',
    stack: error.stack,
    timestamp: new Date().toISOString()
  };
}

/**
 * セキュリティイベントのログ記録
 */
export function logSecurityEvent(
  event: string,
  request: NextRequest,
  details?: any
) {
  logger.warn(`Security Event: ${event}`, {
    url: request.url,
    method: request.method,
    ip: request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent'),
    timestamp: new Date().toISOString(),
    ...details
  });
}

/**
 * IPアドレスの検証（ブロックリスト）
 */
export function isBlockedIP(ip: string): boolean {
  // 開発環境ではブロックしない
  if (process.env.NODE_ENV !== 'production') {
    return false;
  }

  // 本番環境でのIPブロックリスト（必要に応じて追加）
  const blockedIPs = [
    // 既知の悪意のあるIPアドレスをここに追加
    // '192.0.2.1',
  ];

  return blockedIPs.includes(ip);
}

/**
 * ブルートフォース攻撃の検出
 */
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function detectBruteForce(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15分
  const maxAttempts = 5;

  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };

  // ウィンドウの外側なら履歴をクリア
  if (now - attempts.lastAttempt > windowMs) {
    attempts.count = 0;
  }

  attempts.count++;
  attempts.lastAttempt = now;
  loginAttempts.set(ip, attempts);

  if (attempts.count > maxAttempts) {
    logger.warn('Brute force attack detected:', {
      ip,
      attempts: attempts.count,
      timestamp: new Date().toISOString()
    });
    return true;
  }

  return false;
}