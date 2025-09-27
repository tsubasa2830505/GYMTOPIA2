'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createBrowserClient } from '@supabase/ssr'
import { MapPin, Zap, Target, TrendingUp } from 'lucide-react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 relative overflow-hidden">
      {/* Background Graphics */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-orange-400/30 to-red-400/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-red-400/30 to-orange-400/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-orange-300/20 to-red-300/20 rounded-full blur-lg animate-pulse delay-2000"></div>
        <div className="absolute top-1/4 right-1/3 w-28 h-28 bg-gradient-to-br from-amber-400/25 to-orange-400/25 rounded-full blur-lg animate-pulse delay-3000"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 animate-pulse delay-300 opacity-60">
          <div className="w-16 h-16 bg-gradient-to-br from-white/80 to-gray-100/80 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/40 shadow-2xl">
            <Zap className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="absolute top-3/4 right-1/4 animate-pulse delay-700 opacity-60">
          <div className="w-14 h-14 bg-gradient-to-br from-white/80 to-gray-100/80 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/40 shadow-2xl">
            <Target className="w-7 h-7 text-red-500" />
          </div>
        </div>
        <div className="absolute bottom-1/3 left-1/6 animate-pulse delay-1000 opacity-60">
          <div className="w-12 h-12 bg-gradient-to-br from-white/80 to-gray-100/80 rounded-lg flex items-center justify-center backdrop-blur-md border border-white/40 shadow-xl">
            <TrendingUp className="w-6 h-6 text-amber-500" />
          </div>
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative">
          <div className="max-w-md space-y-8 text-center">
            {/* Logo */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-500">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <Image
                src="/images/gymtopia.png"
                alt="ジムトピア"
                width={320}
                height={80}
                className="h-16 w-auto"
                style={{
                  filter: 'brightness(0) saturate(100%) invert(45%) sepia(93%) saturate(1352%) hue-rotate(333deg) brightness(95%) contrast(96%)'
                }}
              />
            </div>

            {/* Hero Text */}
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-[color:var(--foreground)] leading-tight">
                理想のジムを
                <br />
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  見つけよう
                </span>
              </h1>
              <p className="text-lg text-[color:var(--text-muted)] leading-relaxed">
                街の熱量と一緒にジムを探そう。
                <br />
                あなたのフィットネスライフをサポートします。
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              <div className="text-center space-y-3 group">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl flex items-center justify-center mx-auto border border-orange-200 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <MapPin className="w-8 h-8 text-orange-500" />
                </div>
                <p className="text-sm font-semibold text-[color:var(--foreground)]">ジム検索</p>
                <p className="text-xs text-[color:var(--text-muted)]">最適なジムを発見</p>
              </div>
              <div className="text-center space-y-3 group">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl flex items-center justify-center mx-auto border border-orange-200 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <Zap className="w-8 h-8 text-orange-500" />
                </div>
                <p className="text-sm font-semibold text-[color:var(--foreground)]">パワーアップ</p>
                <p className="text-xs text-[color:var(--text-muted)]">効率的なトレーニング</p>
              </div>
              <div className="text-center space-y-3 group">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl flex items-center justify-center mx-auto border border-orange-200 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <Target className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-sm font-semibold text-[color:var(--foreground)]">目標達成</p>
                <p className="text-xs text-[color:var(--text-muted)]">理想の体型へ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent-secondary rounded-xl flex items-center justify-center shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <Image
                src="/images/gymtopia.png"
                alt="ジムトピア"
                width={280}
                height={70}
                className="h-10 w-auto"
                style={{
                  filter: 'brightness(0) saturate(100%) invert(45%) sepia(93%) saturate(1352%) hue-rotate(333deg) brightness(95%) contrast(96%)'
                }}
              />
            </div>

            {/* Login Card */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-[color:var(--foreground)]">
                  おかえりなさい
                </h2>
                <p className="text-[color:var(--text-muted)]">
                  アカウントにログインして続行
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-in slide-in-from-top duration-300">
                  <div className="text-sm text-red-700 font-medium">{error}</div>
                </div>
              )}

              <div className="space-y-6">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="group relative w-full flex justify-center items-center py-4 px-6 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-50/80 to-red-50/80 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <svg className="w-5 h-5 mr-3 z-10" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="z-10">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
                        ログイン中...
                      </div>
                    ) : (
                      'Googleでログイン'
                    )}
                  </span>
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-[color:var(--text-muted)]">または</span>
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm text-[color:var(--text-muted)]">
                    初めての方は、Googleアカウントでログインすると
                  </p>
                  <p className="text-sm font-medium text-orange-500">
                    自動的にアカウントが作成されます
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-[color:var(--text-muted)]">
              <p>
                ログインすることで、
                <Link href="/privacy" className="text-orange-500 hover:underline">プライバシーポリシー</Link>
                と
                <Link href="/terms" className="text-orange-500 hover:underline">利用規約</Link>
                に同意したものとみなされます。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
