/**
 * 環境別ログユーティリティ
 * 本番環境ではログを無効化
 */

const isDevelopment = process.env.NODE_ENV === 'development'
const isDebugMode = process.env.NEXT_PUBLIC_DEBUG === 'true'

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment || isDebugMode) {
      console.log(...args)
    }
  },

  error: (...args: any[]) => {
    // エラーは本番環境でも出力（エラートラッキング用）
    console.error(...args)
  },

  warn: (...args: any[]) => {
    if (isDevelopment || isDebugMode) {
      console.warn(...args)
    }
  },

  info: (...args: any[]) => {
    if (isDevelopment || isDebugMode) {
      console.info(...args)
    }
  },

  debug: (...args: any[]) => {
    if (isDebugMode) {
      console.debug(...args)
    }
  }
}

// パフォーマンス計測用
export const performance = {
  mark: (name: string) => {
    if (isDevelopment) {
      window.performance?.mark(name)
    }
  },

  measure: (name: string, startMark: string, endMark: string) => {
    if (isDevelopment) {
      window.performance?.measure(name, startMark, endMark)
    }
  }
}