'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // URLからcodeとerror_descriptionを取得
        const code = searchParams.get('code')
        const error_description = searchParams.get('error_description')

        if (error_description) {
          console.error('OAuth error:', error_description)
          router.push('/auth/login')
          return
        }

        if (code) {
          // PKCE認証フローでセッションを交換
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)

          if (error) {
            console.error('Session exchange error:', error)
            router.push('/auth/login')
            return
          }

          if (data?.session) {
            console.log('Login successful, redirecting to home...')
            // ログイン成功 - redirectToパラメータがあればそこに、なければホームページへ
            const redirectTo = searchParams.get('redirectTo') || '/'
            router.push(redirectTo)
            return
          }
        }

        // コードがない場合は既存のセッションをチェック
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          console.log('Existing session found, redirecting to home...')
          const redirectTo = searchParams.get('redirectTo') || '/'
          router.push(redirectTo)
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
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgba(254,255,250,0.96)]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[color:var(--gt-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[color:var(--text-subtle)]">認証中...</p>
      </div>
    </div>
  )
}