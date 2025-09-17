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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-[60] sm:hidden shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white">
          <div className="flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 relative block hover:bg-gray-50 active:bg-gray-100 transition-colors duration-150`}
              >
                <div className={`flex flex-col items-center justify-center py-3 px-2 min-h-[60px] transition-all ${
                  item.isActive
                    ? 'transform scale-105'
                    : 'transform scale-100'
                }`}>
                  <div className="relative">
                    <item.icon className={`w-5 h-5 transition-colors duration-150 ${
                      item.isActive ? 'text-blue-600' : 'text-slate-500'
                    }`} />
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] mt-1 font-medium transition-colors duration-150 ${
                    item.isActive ? 'text-blue-600' : 'text-slate-500'
                  }`}>
                    {item.label}
                  </span>
                  {item.isActive && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full animate-pulse" />
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