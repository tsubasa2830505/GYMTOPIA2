import { logger } from '@/lib/utils/logger'

export interface ErrorOptions {
  context?: string
  showToUser?: boolean
  logToConsole?: boolean
}

export class AppError extends Error {
  context?: string
  showToUser: boolean

  constructor(message: string, options?: ErrorOptions) {
    super(message)
    this.name = 'AppError'
    this.context = options?.context
    this.showToUser = options?.showToUser ?? false
  }
}

export function handleError(error: unknown, options?: ErrorOptions): string {
  const context = options?.context || 'Unknown context'
  const showToUser = options?.showToUser ?? false
  const logToConsole = options?.logToConsole ?? true

  let errorMessage: string
  let errorDetails: any = {}

  if (error instanceof Error) {
    errorMessage = error.message
    errorDetails = {
      name: error.name,
      stack: error.stack,
    }
  } else if (typeof error === 'string') {
    errorMessage = error
  } else {
    errorMessage = 'An unknown error occurred'
    errorDetails = { raw: error }
  }

  if (logToConsole) {
    logger.error(`Error in ${context}:`, errorMessage, errorDetails)
  }

  if (showToUser) {
    return errorMessage
  }

  return 'エラーが発生しました。しばらくしてからもう一度お試しください。'
}

export function createErrorHandler(defaultContext: string) {
  return (error: unknown, options?: Omit<ErrorOptions, 'context'>) => {
    return handleError(error, { ...options, context: options?.context || defaultContext })
  }
}