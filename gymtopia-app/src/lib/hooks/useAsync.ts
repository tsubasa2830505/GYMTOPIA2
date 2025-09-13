'use client';

import { useState, useEffect, useCallback } from 'react';
import { LoadingState } from '../../types/enums';

interface UseAsyncState<T> {
  data: T | null;
  error: Error | null;
  status: LoadingState;
}

interface UseAsyncReturn<T> extends UseAsyncState<T> {
  execute: () => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for handling async operations with loading states
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
): UseAsyncReturn<T> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    error: null,
    status: LoadingState.IDLE
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, status: LoadingState.LOADING, error: null }));

    try {
      const data = await asyncFunction();
      setState({
        data,
        error: null,
        status: LoadingState.SUCCESS
      });
    } catch (error) {
      setState({
        data: null,
        error: error as Error,
        status: LoadingState.ERROR
      });
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      status: LoadingState.IDLE
    });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    ...state,
    execute,
    reset
  };
}