/**
 * 共通バリデーション関数
 * 全APIエンドポイントで統一的に使用
 */

import { logger } from './logger';

/**
 * UUID v4形式の検証
 * @param uuid 検証するUUID文字列
 * @returns 有効なUUIDかどうか
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * UUIDリストの検証
 * @param uuids 検証するUUID文字列の配列
 * @returns すべてが有効なUUIDかどうか
 */
export function areValidUUIDs(uuids: string[]): boolean {
  return uuids.every(uuid => isValidUUID(uuid));
}

/**
 * パラメータのUUID検証とエラーレスポンス生成
 * @param params キーと値のオブジェクト
 * @returns 無効なUUIDがある場合はエラーメッセージ、すべて有効な場合はnull
 */
export function validateUUIDs(params: Record<string, string>): string | null {
  const invalidUUIDs: string[] = [];

  for (const [key, value] of Object.entries(params)) {
    if (!isValidUUID(value)) {
      invalidUUIDs.push(key);
    }
  }

  if (invalidUUIDs.length > 0) {
    logger.error('Invalid UUID format detected:', { invalidParams: invalidUUIDs, params });
    return `無効なパラメータ形式です: ${invalidUUIDs.join(', ')}`;
  }

  return null;
}

/**
 * メールアドレスの検証
 * @param email 検証するメールアドレス
 * @returns 有効なメールアドレスかどうか
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * パスワード強度の検証
 * @param password 検証するパスワード
 * @returns 強度チェック結果
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('パスワードは8文字以上である必要があります');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('パスワードには大文字を含む必要があります');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('パスワードには小文字を含む必要があります');
  }

  if (!/\d/.test(password)) {
    errors.push('パスワードには数字を含む必要があります');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * SQLインジェクション対策のための文字列検証
 * @param input 検証する入力文字列
 * @returns 危険な文字が含まれているかどうか
 */
export function containsSuspiciousSQL(input: string): boolean {
  const suspiciousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(--|\/\*|\*\/)/,
    /(\b(OR|AND)\b.*=.*)/i,
    /(;|\|)/
  ];

  return suspiciousPatterns.some(pattern => pattern.test(input));
}

/**
 * XSS対策のためのHTML文字列検証
 * @param input 検証する入力文字列
 * @returns 危険なHTMLタグが含まれているかどうか
 */
export function containsSuspiciousHTML(input: string): boolean {
  const suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/i,
    /on\w+\s*=/i
  ];

  return suspiciousPatterns.some(pattern => pattern.test(input));
}

/**
 * 汎用的な入力値サニタイゼーション
 * @param input サニタイゼーションする文字列
 * @returns サニタイゼーション済みの文字列
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // HTMLタグの除去
    .replace(/['"]/g, '') // クォートの除去
    .trim(); // 前後の空白除去
}