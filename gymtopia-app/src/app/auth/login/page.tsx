'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    setError(null)
    setIsLoading(true)

    try {
      // 現在のポート番号を検出してリダイレクトURLを設定
      const currentPort = typeof window !== 'undefined' 
        ? window.location.port || '3000'
        : '3001'
      
      const redirectBase = typeof window !== 'undefined' 
        ? window.location.origin
        : `http://localhost:${currentPort}`

      console.log('Redirect URL:', `${redirectBase}/auth/callback`)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${redirectBase}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        setError(error.message)
        setIsLoading(false)
      }
    } catch (err: any) {
      setError(err?.message || 'Googleログイン中にエラーが発生しました')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgba(243,247,255,0.96)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[color:var(--foreground)]">
            ログイン
          </h2>
          <p className="mt-2 text-center text-sm text-[color:var(--text-subtle)]">
            ジムトピアへようこそ
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          {error && (
            <div className="rounded-md bg-[rgba(224,112,122,0.12)] p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}
          
          <div>
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-[color:var(--text-subtle)] bg-white hover:bg-[rgba(243,247,255,0.96)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLoading ? 'ログイン中...' : 'Googleでログイン'}
            </button>
          </div>

          <div className="text-center text-sm text-[color:var(--text-subtle)]">
            初めての方は、Googleアカウントでログインすると
            <br />
            自動的にアカウントが作成されます
          </div>
        </div>
      </div>
    </div>
  )
}
