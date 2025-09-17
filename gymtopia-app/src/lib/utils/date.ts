// 日付フォーマット関連のユーティリティ関数

export function formatLastActive(lastSeenAt: string | null | undefined): string {
  if (!lastSeenAt) return 'オフライン'

  const lastSeen = new Date(lastSeenAt)
  const now = new Date()
  const diffMs = now.getTime() - lastSeen.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'オンライン'
  if (diffMins < 60) return `${diffMins}分前`
  if (diffHours < 24) return `${diffHours}時間前`
  if (diffDays < 7) return `${diffDays}日前`
  return lastSeen.toLocaleDateString('ja-JP')
}

export function formatJoinDate(createdAt: string): string {
  const date = new Date(createdAt)
  return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP')
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('ja-JP')
}

export function getTimeDifference(date1: Date | string, date2: Date | string): string {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffMs = Math.abs(d1.getTime() - d2.getTime())
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}分`
  if (diffHours < 24) return `${diffHours}時間`
  return `${diffDays}日`
}