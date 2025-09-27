/**
 * デバッグユーティリティ
 * 条件付きデバッグ出力とパフォーマンス測定
 */

import { logger } from './logger'

type DebugCategory = 'auth' | 'api' | 'ui' | 'data' | 'performance' | 'general'

interface DebugOptions {
  category?: DebugCategory
  force?: boolean
}

const DEBUG_CATEGORIES: Record<DebugCategory, boolean> = {
  auth: process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true',
  api: process.env.NEXT_PUBLIC_DEBUG_API === 'true',
  ui: process.env.NEXT_PUBLIC_DEBUG_UI === 'true',
  data: process.env.NEXT_PUBLIC_DEBUG_DATA === 'true',
  performance: process.env.NEXT_PUBLIC_DEBUG_PERFORMANCE === 'true',
  general: process.env.NEXT_PUBLIC_DEBUG === 'true',
}

export const debug = {
  log: (message: string, data?: any, options?: DebugOptions) => {
    const category = options?.category || 'general'
    if (options?.force || DEBUG_CATEGORIES[category]) {
      logger.debug(`[${category.toUpperCase()}]`, message, data || '')
    }
  },

  error: (message: string, error: any, options?: DebugOptions) => {
    const category = options?.category || 'general'
    logger.error(`[${category.toUpperCase()}]`, message, {
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      details: error?.details,
    })
  },

  warn: (message: string, data?: any, options?: DebugOptions) => {
    const category = options?.category || 'general'
    if (options?.force || DEBUG_CATEGORIES[category]) {
      logger.warn(`[${category.toUpperCase()}]`, message, data || '')
    }
  },

  info: (message: string, data?: any, options?: DebugOptions) => {
    const category = options?.category || 'general'
    if (options?.force || DEBUG_CATEGORIES[category]) {
      logger.info(`[${category.toUpperCase()}]`, message, data || '')
    }
  },

  time: (label: string) => {
    if (DEBUG_CATEGORIES.performance) {
      console.time(label)
    }
  },

  timeEnd: (label: string) => {
    if (DEBUG_CATEGORIES.performance) {
      console.timeEnd(label)
    }
  },

  group: (label: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(label)
    }
  },

  groupEnd: () => {
    if (process.env.NODE_ENV === 'development') {
      console.groupEnd()
    }
  },
}

/**
 * パフォーマンス測定用デコレーター
 */
export function measurePerformance(label: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const start = performance.now()
      try {
        const result = await originalMethod.apply(this, args)
        const end = performance.now()
        debug.log(
          `Performance: ${label} took ${(end - start).toFixed(2)}ms`,
          undefined,
          { category: 'performance' }
        )
        return result
      } catch (error) {
        const end = performance.now()
        debug.error(
          `Performance: ${label} failed after ${(end - start).toFixed(2)}ms`,
          error,
          { category: 'performance' }
        )
        throw error
      }
    }

    return descriptor
  }
}