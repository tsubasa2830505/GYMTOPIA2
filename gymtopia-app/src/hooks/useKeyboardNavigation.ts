import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  action: () => void
  description?: string
}

/**
 * キーボードナビゲーション用カスタムフック
 */
export function useKeyboardNavigation(shortcuts: KeyboardShortcut[] = []) {
  const router = useRouter()

  // デフォルトショートカット
  const defaultShortcuts: KeyboardShortcut[] = [
    {
      key: 'h',
      alt: true,
      action: () => router.push('/'),
      description: 'ホームへ移動'
    },
    {
      key: 's',
      alt: true,
      action: () => router.push('/search'),
      description: '検索画面へ'
    },
    {
      key: 'p',
      alt: true,
      action: () => router.push('/profile'),
      description: 'プロフィールへ'
    },
    {
      key: 'f',
      alt: true,
      action: () => router.push('/feed'),
      description: 'フィードへ'
    },
    {
      key: '/',
      action: () => {
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      },
      description: '検索フォーカス'
    },
    {
      key: 'Escape',
      action: () => {
        const activeElement = document.activeElement as HTMLElement
        if (activeElement) {
          activeElement.blur()
        }
      },
      description: 'フォーカス解除'
    }
  ]

  const allShortcuts = [...defaultShortcuts, ...shortcuts]

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // 入力フィールドでは無効化
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      // Escapeキーは例外
      if (event.key !== 'Escape') {
        return
      }
    }

    for (const shortcut of allShortcuts) {
      const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey
      const altMatch = shortcut.alt ? event.altKey : !event.altKey
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        event.preventDefault()
        shortcut.action()
        break
      }
    }
  }, [allShortcuts])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return allShortcuts
}

/**
 * Tab trap for modals and dialogs
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, isActive = true) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement?.focus()
          e.preventDefault()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          firstElement?.focus()
          e.preventDefault()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }, [containerRef, isActive])
}

/**
 * スキップリンク用フック
 */
export function useSkipLinks() {
  useEffect(() => {
    const skipLink = document.createElement('a')
    skipLink.href = '#main-content'
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white px-4 py-2 rounded shadow-lg z-50'
    skipLink.textContent = 'メインコンテンツへスキップ'

    document.body.insertBefore(skipLink, document.body.firstChild)

    return () => {
      if (skipLink.parentNode) {
        skipLink.parentNode.removeChild(skipLink)
      }
    }
  }, [])
}