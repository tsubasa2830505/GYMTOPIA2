'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { User } from 'lucide-react'

export default function Header() {
  const { user, isLoading } = useAuth()

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
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                >
                  <User size={20} />
                  <span className="text-sm">{user.displayName || user.email}</span>
                </Link>
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