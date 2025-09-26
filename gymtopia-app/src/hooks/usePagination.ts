'use client'

import { useState, useCallback, useMemo } from 'react'

interface UsePaginationOptions {
  initialPage?: number
  pageSize?: number
  totalItems?: number
}

interface UsePaginationReturn {
  currentPage: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  offset: number
  goToPage: (page: number) => void
  nextPage: () => void
  previousPage: () => void
  reset: () => void
}

export function usePagination({
  initialPage = 1,
  pageSize = 10,
  totalItems = 0,
}: UsePaginationOptions = {}): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage)

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize)
  }, [totalItems, pageSize])

  const hasNextPage = useMemo(() => {
    return currentPage < totalPages
  }, [currentPage, totalPages])

  const hasPreviousPage = useMemo(() => {
    return currentPage > 1
  }, [currentPage])

  const offset = useMemo(() => {
    return (currentPage - 1) * pageSize
  }, [currentPage, pageSize])

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }, [totalPages])

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1)
    }
  }, [hasNextPage])

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1)
    }
  }, [hasPreviousPage])

  const reset = useCallback(() => {
    setCurrentPage(initialPage)
  }, [initialPage])

  return {
    currentPage,
    pageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    offset,
    goToPage,
    nextPage,
    previousPage,
    reset,
  }
}