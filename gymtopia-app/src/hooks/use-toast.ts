import { useState, useCallback } from 'react'

interface ToastOptions {
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
  duration?: number
}

interface Toast extends ToastOptions {
  id: string
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: Toast = {
      id,
      ...options,
      duration: options.duration ?? 5000
    }

    setToasts((prevToasts) => [...prevToasts, newToast])

    // Auto-remove toast after duration
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id))
    }, newToast.duration)

    return id
  }, [])

  const dismiss = useCallback((toastId?: string) => {
    setToasts((prevToasts) =>
      toastId ? prevToasts.filter((t) => t.id !== toastId) : []
    )
  }, [])

  return {
    toast,
    dismiss,
    toasts
  }
}

// Export a simple toast function for convenience
export const toast = (options: ToastOptions) => {
  // This is a simplified version - in a real app you'd want a toast provider
  console.log('Toast:', options)
}