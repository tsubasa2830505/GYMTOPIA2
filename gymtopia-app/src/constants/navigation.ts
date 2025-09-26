import { MapPin, Search, FileSearch, Activity, User, CheckCircle } from 'lucide-react'

export const NAVIGATION_ITEMS = [
  {
    href: '/',
    icon: MapPin,
    label: 'ジムを探す',
  },
  {
    href: '/search/results',
    icon: Search,
    iconDesktop: FileSearch, // デスクトップ版は別アイコン
    label: '検索結果',
    matchPaths: ['/search/results', '/search'], // マッチするパス
  },
  {
    href: '/checkin',
    icon: CheckCircle,
    label: 'チェックイン',
  },
  {
    href: '/feed',
    icon: Activity,
    label: 'フィード',
  },
  {
    href: '/profile',
    icon: User,
    label: 'プロフィール',
  },
] as const

export const checkIsActive = (pathname: string, href: string, matchPaths?: readonly string[]): boolean => {
  if (matchPaths) {
    return matchPaths.includes(pathname)
  }
  return pathname === href
}