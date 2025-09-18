'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URLからコードとエラーを取得
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        const error_description = params.get('error_description')
        
        if (error_description) {
          console.error('OAuth error:', error_description)
          router.push('/auth/login')
          return
        }

        if (code) {
          // コードを使ってセッションを交換
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('Session exchange error:', error)
            router.push('/auth/login')
            return
          }

          if (data?.session) {
            console.log('Login successful, redirecting to admin...')
            // ログイン成功 - adminページへリダイレクト
            router.push('/admin')
            return
          }
        }

        // コードがない場合は既存のセッションをチェック
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          console.log('Existing session found, redirecting to admin...')
          router.push('/admin')
        } else {
          console.log('No session found, redirecting to login...')
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error)
        router.push('/auth/login')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgba(243,247,255,0.96)]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[color:var(--text-subtle)]">認証中...</p>
      </div>
    </div>
  )
}