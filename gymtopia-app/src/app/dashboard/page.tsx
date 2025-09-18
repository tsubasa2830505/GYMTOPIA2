'use client'

/**
 * User Information Dashboard Page
 * tsubasa.a.283.0505@gmail.com向けの情報ダッシュボード
 */

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { UserInfoDashboard } from '@/components/UserInfo'
import { ArrowLeft, User, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, mockSignOut } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[rgba(31,79,255,0.22)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-lg hover:bg-blue-100 transition-colors"
              title="ホームに戻る"
            >
              <ArrowLeft className="w-5 h-5 text-blue-600" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">ユーザーダッシュボード</h1>
                <p className="text-sm text-slate-600">詳細な統計とアクティビティ</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && user && (
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {user.displayName || user.username || 'ユーザー'}
                  </p>
                  <p className="text-xs text-slate-600">{user.email}</p>
                </div>
                {user.avatarUrl && (
                  <Image
                    src={user.avatarUrl}
                    alt="アバター"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[rgba(31,79,255,0.22)]"
                  />
                )}
              </div>
            )}

            <button
              onClick={() => router.push('/profile/edit')}
              className="p-2 rounded-lg hover:bg-blue-100 transition-colors"
              title="設定"
            >
              <Settings className="w-5 h-5 text-blue-600" />
            </button>

            {/* 開発環境でのログアウトボタン */}
            {process.env.NODE_ENV === 'development' && isAuthenticated && (
              <button
                onClick={mockSignOut}
                className="px-4 py-2 bg-[rgba(224,112,122,0.12)]0 text-white rounded-lg hover:bg-[#e0707a] transition-colors text-sm"
              >
                ログアウト
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {!isAuthenticated ? (
          // 未認証時の表示
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-[rgba(31,79,255,0.22)] max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">ログインが必要です</h2>
              <p className="text-slate-600 mb-6">
                ユーザーダッシュボードを表示するには、ログインが必要です。
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all font-semibold"
                >
                  ログイン
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-semibold"
                >
                  ホームに戻る
                </button>
              </div>
            </div>
          </div>
        ) : (
          // 認証済み時のダッシュボード表示
          <div className="space-y-8">
            {/* ウェルカムメッセージ */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                こんにちは、{user?.displayName || user?.username || 'ユーザー'}さん！
              </h2>
              <p className="text-slate-600">
                あなた専用の詳細情報とアクティビティをご覧ください。
              </p>
            </div>

            {/* メインダッシュボード */}
            <UserInfoDashboard className="w-full" />

            {/* クイックアクション */}
            <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">クイックアクション</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ActionButton
                  label="投稿作成"
                  onClick={() => router.push('/add')}
                  className="bg-blue-500 hover:bg-blue-600"
                />
                <ActionButton
                  label="プロフィール編集"
                  onClick={() => router.push('/profile/edit')}
                  className="bg-[rgba(31,143,106,0.12)]0 hover:bg-[#1f8f6a]"
                />
                <ActionButton
                  label="フォロー中"
                  onClick={() => router.push('/following')}
                  className="bg-purple-500 hover:bg-purple-600"
                />
                <ActionButton
                  label="フォロワー"
                  onClick={() => router.push('/followers')}
                  className="bg-orange-500 hover:bg-orange-600"
                />
              </div>
            </div>

            {/* 開発者情報（開発環境のみ） */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-gray-100 rounded-lg p-6 border-2 border-gray-300">
                <h3 className="text-lg font-semibold text-[color:var(--foreground)] mb-4">🔧 開発者情報</h3>
                <div className="text-sm text-[color:var(--text-subtle)] space-y-2">
                  <p>このページは開発環境でのテスト用です。</p>
                  <p>本番環境では、認証されたユーザーのみアクセス可能です。</p>
                  <p>現在のユーザー: {user?.email}</p>
                  <p>環境: {process.env.NODE_ENV}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// クイックアクションボタンコンポーネント
function ActionButton({
  label,
  onClick,
  className = ''
}: {
  label: string
  onClick: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3 text-white rounded-lg transition-colors font-semibold text-sm ${className}`}
    >
      {label}
    </button>
  )
}