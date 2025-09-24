/**
 * 統一されたエラーハンドリングユーティリティ
 */

import { NextResponse } from 'next/server';
import { logger } from './logger';

export interface APIError {
  code: string;
  message: string;
  details?: any;
  statusCode: number;
}

/**
 * 標準的なAPIエラーレスポンスを生成
 */
export function createErrorResponse(
  message: string,
  statusCode: number,
  code?: string,
  details?: any
): NextResponse {
  const errorResponse = {
    error: message,
    code: code || `ERROR_${statusCode}`,
    timestamp: new Date().toISOString(),
    ...(details && { details })
  };

  logger.error('API Error Response:', errorResponse);

  return NextResponse.json(errorResponse, { status: statusCode });
}

/**
 * データベースエラーを適切にハンドリング
 */
export function handleDatabaseError(error: any): NextResponse {
  // PostgreSQLエラーコードの処理
  switch (error.code) {
    case '23503': // 外部キー制約違反
      return createErrorResponse(
        '関連するデータが存在しません',
        400,
        'FOREIGN_KEY_VIOLATION',
        { constraint: error.constraint }
      );

    case '23505': // 一意制約違反
      return createErrorResponse(
        'データが既に存在しています',
        409,
        'UNIQUE_VIOLATION',
        { constraint: error.constraint }
      );

    case '22P02': // 無効な入力構文
      return createErrorResponse(
        '入力データの形式が正しくありません',
        400,
        'INVALID_INPUT_SYNTAX'
      );

    case 'PGRST116': // 単一行が見つからない
      return createErrorResponse(
        'データが見つかりませんでした',
        404,
        'NOT_FOUND'
      );

    default:
      logger.error('Unhandled database error:', error);
      return createErrorResponse(
        'データベースエラーが発生しました',
        500,
        'DATABASE_ERROR'
      );
  }
}

/**
 * 認証エラーを処理
 */
export function handleAuthError(error: any): NextResponse {
  if (error.message?.includes('Auth session missing')) {
    return createErrorResponse(
      '認証が必要です',
      401,
      'AUTH_REQUIRED'
    );
  }

  if (error.message?.includes('Invalid login credentials')) {
    return createErrorResponse(
      'ログイン情報が正しくありません',
      401,
      'INVALID_CREDENTIALS'
    );
  }

  if (error.message?.includes('Email not confirmed')) {
    return createErrorResponse(
      'メールアドレスの確認が完了していません',
      403,
      'EMAIL_NOT_CONFIRMED'
    );
  }

  return createErrorResponse(
    '認証エラーが発生しました',
    401,
    'AUTH_ERROR'
  );
}

/**
 * ファイルアップロードエラーを処理
 */
export function handleFileError(error: any): NextResponse {
  if (error.message?.includes('File size')) {
    return createErrorResponse(
      'ファイルサイズが大きすぎます',
      413,
      'FILE_TOO_LARGE'
    );
  }

  if (error.message?.includes('File type')) {
    return createErrorResponse(
      'サポートされていないファイル形式です',
      415,
      'UNSUPPORTED_FILE_TYPE'
    );
  }

  return createErrorResponse(
    'ファイル処理エラーが発生しました',
    500,
    'FILE_ERROR'
  );
}

/**
 * バリデーションエラーを処理
 */
export function handleValidationError(errors: string[]): NextResponse {
  return createErrorResponse(
    '入力内容に問題があります',
    400,
    'VALIDATION_ERROR',
    { errors }
  );
}

/**
 * レート制限エラーを処理
 */
export function handleRateLimitError(): NextResponse {
  return createErrorResponse(
    'リクエストが多すぎます。しばらく待ってから再試行してください',
    429,
    'RATE_LIMIT_EXCEEDED',
    {
      retryAfter: '60 seconds'
    }
  );
}

/**
 * 汎用エラーハンドラー
 */
export function handleGenericError(error: any, context?: string): NextResponse {
  logger.error(`Generic error in ${context}:`, error);

  // 既知のエラータイプをチェック
  if (error.code) {
    // データベースエラー
    if (['23503', '23505', '22P02', 'PGRST116'].includes(error.code)) {
      return handleDatabaseError(error);
    }
  }

  // 認証関連エラー
  if (error.message?.toLowerCase().includes('auth')) {
    return handleAuthError(error);
  }

  // ファイル関連エラー
  if (error.message?.toLowerCase().includes('file')) {
    return handleFileError(error);
  }

  // JSONパースエラー
  if (error instanceof SyntaxError && error.message.includes('JSON')) {
    return createErrorResponse(
      'リクエストデータの形式が正しくありません',
      400,
      'INVALID_JSON'
    );
  }

  // デフォルトのサーバーエラー
  return createErrorResponse(
    'サーバーエラーが発生しました',
    500,
    'INTERNAL_SERVER_ERROR'
  );
}

/**
 * API成功レスポンスを生成
 */
export function createSuccessResponse(
  data: any,
  message?: string,
  statusCode: number = 200
): NextResponse {
  const response = {
    success: true,
    data,
    ...(message && { message }),
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * API応答を統一形式でラップ
 */
export function wrapAPIHandler(
  handler: (request: Request) => Promise<any>
) {
  return async (request: Request) => {
    try {
      const result = await handler(request);
      return result;
    } catch (error) {
      return handleGenericError(error, 'API Handler');
    }
  };
}