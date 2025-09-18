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
      <div className="min-h-screen bg-gradient-to-br from-[rgba(231,103,76,0.08)] via-[rgba(245,177,143,0.12)] to-[rgba(240,142,111,0.16)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[color:var(--gt-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[color:var(--text-muted)]">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgba(231,103,76,0.08)] via-[rgba(245,177,143,0.12)] to-[rgba(240,142,111,0.16)]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[rgba(231,103,76,0.22)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-lg hover:bg-[rgba(240,142,111,0.14)] transition-colors"
              title="ホームに戻る"
            >
              <ArrowLeft className="w-5 h-5 text-[color:var(--gt-secondary-strong)]" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[color:var(--foreground)]">ユーザーダッシュボード</h1>
                <p className="text-sm text-[color:var(--text-muted)]">詳細な統計とアクティビティ</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && user && (
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">
                    {user.displayName || user.username || 'ユーザー'}
                  </p>
                  <p className="text-xs text-[color:var(--text-muted)]">{user.email}</p>
                </div>
                {user.avatarUrl && (
                  <Image
                    src={user.avatarUrl}
                    alt="アバター"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[rgba(231,103,76,0.22)]"
                  />
                )}
              </div>
            )}

            <button
              onClick={() => router.push('/profile/edit')}
              className="p-2 rounded-lg hover:bg-[rgba(240,142,111,0.14)] transition-colors"
              title="設定"
            >
              <Settings className="w-5 h-5 text-[color:var(--gt-secondary-strong)]" />
            </button>

            {/* 開発環境でのログアウトボタン */}
            {process.env.NODE_ENV === 'development' && isAuthenticated && (
              <button
                onClick={mockSignOut}
                className="px-4 py-2 bg-[rgba(224,112,122,0.12)] text-white rounded-lg hover:bg-[color:var(--gt-primary-strong)] transition-colors text-sm"
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
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-[rgba(231,103,76,0.22)] max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[color:var(--foreground)] mb-4">ログインが必要です</h2>
              <p className="text-[color:var(--text-muted)] mb-6">
                ユーザーダッシュボードを表示するには、ログインが必要です。
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white rounded-lg hover:from-[var(--gt-primary-strong)] hover:to-[var(--gt-primary-strong)] transition-all font-semibold"
                >
                  ログイン
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full px-6 py-3 bg-[rgba(254,255,250,0.95)] text-[color:var(--text-subtle)] rounded-lg hover:bg-[rgba(254,255,250,0.9)] transition-colors font-semibold"
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
              <h2 className="text-3xl font-bold text-[color:var(--foreground)] mb-2">
                こんにちは、{user?.displayName || user?.username || 'ユーザー'}さん！
              </h2>
              <p className="text-[color:var(--text-muted)]">
                あなた専用の詳細情報とアクティビティをご覧ください。
              </p>
            </div>

            {/* メインダッシュボード */}
            <UserInfoDashboard className="w-full" />

            {/* クイックアクション */}
            <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-[rgba(186,122,103,0.26)]">
              <h3 className="text-lg font-semibold text-[color:var(--foreground)] mb-4">クイックアクション</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ActionButton
                  label="投稿作成"
                  onClick={() => router.push('/add')}
                  className="bg-[color:var(--gt-primary)] hover:bg-[color:var(--gt-primary-strong)]"
                />
                <ActionButton
                  label="プロフィール編集"
                  onClick={() => router.push('/profile/edit')}
                  className="bg-[rgba(31,143,106,0.12)] hover:bg-[var(--gt-secondary-strong)]"
                />
                <ActionButton
                  label="フォロー中"
                  onClick={() => router.push('/following')}
                  className="bg-[rgba(240,142,111,0.1)] hover:bg-[color:var(--gt-primary-strong)]"
                />
                <ActionButton
                  label="フォロワー"
                  onClick={() => router.push('/followers')}
                  className="bg-[color:var(--gt-primary)] hover:bg-[color:var(--gt-primary-strong)]"
                />
              </div>
            </div>

            {/* 開発者情報（開発環境のみ） */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-[rgba(254,255,250,0.95)] rounded-lg p-6 border-2 border-[rgba(186,122,103,0.28)]">
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