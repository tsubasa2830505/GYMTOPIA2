'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/lib/supabase/auth'
import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'

export default function Header() {
  const { user, isLoading, mockSignOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    // Check if we're in development mode with mock auth
    const isDevelopment = process.env.NODE_ENV === 'development'
    const useMockAuth = isDevelopment
    
    if (useMockAuth) {
      console.log('📱 Header: Mock logout - using mockSignOut')
      mockSignOut()
      return
    }
    
    await signOut()
    router.push('/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="flex justify-between items-center h-16 px-4">
        <Link href="/" className="text-xl font-bold text-gray-900">
          GYMTOPIA
        </Link>

        <div className="flex items-center gap-4">
          {!isLoading && (
            <>
              {user ? (
                <div className="flex items-center gap-4">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                  >
                    <User size={20} />
                    <span className="text-sm">{user.displayName || user.email}</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  ログイン
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}