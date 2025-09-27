'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MapPin, FileSearch, Activity, User, CheckCircle } from 'lucide-react'

export default function SidebarNavigation() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/',
      icon: MapPin,
      label: 'ジムを探す',
      isActive: pathname === '/'
    },
    {
      href: '/search/results',
      icon: FileSearch,
      label: '検索結果',
      isActive: pathname === '/search/results' || pathname === '/search'
    },
    {
      href: '/checkin',
      icon: CheckCircle,
      label: 'チェックイン',
      isActive: pathname === '/checkin'
    },
    {
      href: '/feed',
      icon: Activity,
      label: 'フィード',
      isActive: pathname === '/feed'
    },
    {
      href: '/profile',
      icon: User,
      label: 'プロフィール',
      isActive: pathname === '/profile'
    },
  ]

  return (
    <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-white/95 via-gray-50/95 to-zinc-100/95 backdrop-blur-xl border-r border-gray-200/60 z-[60] flex-col py-6 shadow-xl">
      {/* Navigation Items */}
      <div className="flex-1 px-3 mt-8">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group ${
                item.isActive
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                  : 'text-gray-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:text-gray-900'
              }`}
            >
              <item.icon
                className={`w-6 h-6 transition-transform duration-200 ${
                  item.isActive ? 'scale-110' : 'group-hover:scale-105'
                }`}
              />
              <span className="font-medium text-base">{item.label}</span>
              {item.isActive && (
                <div className="ml-auto w-1 h-6 bg-white rounded-full opacity-80" />
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pt-4 border-t border-gray-200/60">
        <div className="text-xs text-gray-500 text-center">
          © 2024 GYMTOPIA
        </div>
      </div>
    </nav>
  )
}