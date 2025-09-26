// 日付フォーマット関数
export function formatPostDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) return `${diffSeconds}秒前`
  if (diffMinutes < 60) return `${diffMinutes}分前`
  if (diffHours < 24) return `${diffHours}時間前`
  if (diffDays < 7) return `${diffDays}日前`

  return formatPostDate(dateString)
}

export function formatDate(dateString: string, format: 'short' | 'long' = 'short'): string {
  const date = new Date(dateString)

  if (format === 'short') {
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    })
  }

  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}