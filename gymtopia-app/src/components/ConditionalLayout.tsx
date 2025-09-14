'use client'

import { usePathname } from 'next/navigation'
import BottomNavigation from '@/components/BottomNavigation'

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
      <div className={isAuthPage ? "min-h-screen" : "min-h-screen pb-20"}>
        {children}
      </div>
      {!isAuthPage && <BottomNavigation />}
    </>
  )
}