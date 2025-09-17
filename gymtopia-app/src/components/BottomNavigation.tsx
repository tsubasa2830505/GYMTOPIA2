'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MapPin, FileSearch, SlidersHorizontal, User } from 'lucide-react'

export default function BottomNavigation() {
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
      isActive: pathname === '/search/results' || pathname === '/search',
      badge: 3
    },
    { 
      href: '/feed', 
      icon: SlidersHorizontal, 
      label: 'ジム活フィード',
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
    <nav className="fixed bottom-4 left-0 right-0 z-[60] sm:hidden px-4">
      <div className="max-w-md mx-auto">
        <div className="gt-shell bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_18px_40px_-28px_rgba(20,31,68,0.55)]">
          <div className="flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 relative block"
              >
                <div className={`flex flex-col items-center justify-center py-3 px-2 min-h-[60px] transition-all ${
                  item.isActive ? 'scale-[1.08]' : 'scale-100'
                }`}>
                  <div className="relative">
                    <item.icon
                      className={`w-5 h-5 transition-colors duration-150 ${
                        item.isActive
                          ? 'text-[color:var(--gt-primary-strong)]'
                          : 'text-[color:var(--text-muted)]'
                      }`}
                    />
                    {item.badge && (
                      <span className="absolute -top-1.5 -right-1 bg-gradient-to-r from-[#6056ff] to-[#ff6b9f] text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] mt-1 font-medium transition-colors duration-150 ${
                    item.isActive
                      ? 'text-[color:var(--gt-primary-strong)]'
                      : 'text-[color:var(--text-muted)]'
                  }`}>
                    {item.label}
                  </span>
                  {item.isActive && (
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-10 h-1 bg-gradient-to-r from-[#6056ff] to-[#ff6b9f] rounded-full" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
