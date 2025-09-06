'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Dumbbell, BarChart3, User } from 'lucide-react'

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', icon: Home, label: 'ホーム' },
    { href: '/search', icon: Search, label: '検索' },
    { href: '/workout', icon: Dumbbell, label: 'ワークアウト' },
    { href: '/stats', icon: BarChart3, label: '統計' },
    { href: '/profile', icon: User, label: 'プロフィール' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex justify-around items-center h-20">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive
                  ? 'text-gray-900'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                isActive ? 'bg-gray-100' : ''
              }`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}