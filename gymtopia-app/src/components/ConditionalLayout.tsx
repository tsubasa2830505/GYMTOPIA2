'use client'

import { usePathname } from 'next/navigation'
import BottomNavigation from '@/components/BottomNavigation'
import SidebarNavigation from '@/components/SidebarNavigation'

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // ログイン関連ページかどうかを判定
  const authPages = ['/auth/login', '/auth/signup', '/auth/reset-password', '/auth/verify-email']
  const isAuthPage = authPages.includes(pathname)

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      {!isAuthPage && <SidebarNavigation />}

      {/* Main Content */}
      <div className={`${isAuthPage ? "min-h-screen" : "min-h-screen pb-20 md:pb-0 md:ml-64"}`}>
        {children}
      </div>

      {/* Mobile Bottom Navigation */}
      {!isAuthPage && <BottomNavigation />}
    </>
  )
}