'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MapPin, Dumbbell, Users, User } from 'lucide-react'

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', icon: Home, label: 'ホーム' },
    { href: '/map', icon: MapPin, label: 'マップ' },
    { href: '/workout', icon: Dumbbell, label: 'ワークアウト' },
    { href: '/feed', icon: Users, label: 'フィード' },
    { href: '/profile', icon: User, label: 'プロフィール' },
  ]

  return (
    <nav className="fixed bottom-4 left-0 right-0 px-4 z-[60]">
      <div className="max-w-2xl mx-auto gt-shell bg-[rgba(254,255,250,0.92)] backdrop-blur-xl border border-[rgba(231,103,76,0.18)]">
        <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-all ${
                isActive
                  ? 'text-[color:var(--gt-primary-strong)]'
                  : 'text-[color:var(--text-muted)] hover:text-[color:var(--foreground)]'
              }`}
            >
              <div
                className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-accent to-accent-secondary text-[color:var(--gt-on-primary)] shadow-[0_16px_34px_-22px_rgba(189,101,78,0.44)]'
                    : 'bg-[rgba(254,255,250,0.85)] border border-[rgba(231,103,76,0.18)]'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          )
        })}
        </div>
      </div>
    </nav>
  )
}
