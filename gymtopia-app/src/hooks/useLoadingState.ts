'use client'

import { useState, useCallback } from 'react'

interface UseLoadingStateReturn<T> {
  isLoading: boolean
  error: Error | null
  data: T | null
  execute: (asyncFunction: () => Promise<T>) => Promise<T | null>
  reset: () => void
  setData: (data: T | null) => void
}

export function useLoadingState<T = any>(initialData: T | null = null): UseLoadingStateReturn<T> {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<T | null>(initialData)

  const execute = useCallback(async (asyncFunction: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await asyncFunction()
      setData(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred')
      setError(error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
    setData(initialData)
  }, [initialData])

  return {
    isLoading,
    error,
    data,
    execute,
    reset,
    setData,
  }
}