'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAVIGATION_ITEMS, checkIsActive } from '@/constants/navigation'

export default function SidebarNavigation() {
  const pathname = usePathname()

  const navItems = NAVIGATION_ITEMS.map((item) => ({
    ...item,
    icon: item.iconDesktop || item.icon, // デスクトップ版アイコンがあれば使用
    isActive: checkIsActive(pathname, item.href, item.matchPaths),
  }))

  return (
    <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-[rgba(254,255,250,0.92)] backdrop-blur-xl border-r border-[rgba(231,103,76,0.18)] z-[60] flex-col py-6">
      {/* Navigation Items */}
      <div className="flex-1 px-3 mt-8">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group ${
                item.isActive
                  ? 'bg-[color:var(--gt-primary)] text-white shadow-lg'
                  : 'text-[color:var(--text-muted)] hover:bg-[rgba(231,103,76,0.08)] hover:text-[color:var(--foreground)]'
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
      <div className="px-6 pt-4 border-t border-[rgba(231,103,76,0.18)]">
        <div className="text-xs text-[color:var(--text-muted)] text-center">
          © 2024 GYMTOPIA
        </div>
      </div>
    </nav>
  )
}