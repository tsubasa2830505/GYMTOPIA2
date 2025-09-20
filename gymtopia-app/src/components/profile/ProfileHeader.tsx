'use client'

import Image from 'next/image'
import { MapPin, Calendar, Edit } from 'lucide-react'

interface ProfileHeaderProps {
  user: {
    id: string
    display_name?: string
    username?: string
    avatar_url?: string
    bio?: string
    location?: string
    joined_at: string
    is_verified: boolean
  }
  isOwnProfile: boolean
  onEdit?: () => void
}

export default function ProfileHeader({
  user,
  isOwnProfile,
  onEdit
}: ProfileHeaderProps) {
  const joinedDate = new Date(user.joined_at).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long'
  })

  return (
    <div className="relative">
      {/* カバー画像的な背景 */}
      <div className="h-32 bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] rounded-lg"></div>

      {/* プロフィール情報 */}
      <div className="relative px-6 pb-6">
        {/* アバター */}
        <div className="absolute -top-16 left-6">
          <div className="relative">
            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.display_name || 'ユーザー'}
                  width={88}
                  height={88}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-[rgba(231,103,76,0.1)] flex items-center justify-center text-2xl font-bold text-[color:var(--gt-primary)]">
                  {(user.display_name || user.username || 'U')[0].toUpperCase()}
                </div>
              )}
            </div>
            {user.is_verified && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>
        </div>

        {/* 編集ボタン */}
        {isOwnProfile && onEdit && (
          <div className="absolute top-4 right-6">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[rgba(231,103,76,0.2)] rounded-lg hover:bg-[rgba(231,103,76,0.05)] transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span className="text-sm font-medium">編集</span>
            </button>
          </div>
        )}

        {/* ユーザー情報 */}
        <div className="mt-12 space-y-3">
          <div>
            <h1 className="text-2xl font-bold text-[color:var(--foreground)]">
              {user.display_name || user.username || 'ユーザー'}
            </h1>
            {user.username && user.display_name && (
              <p className="text-[color:var(--text-muted)]">@{user.username}</p>
            )}
          </div>

          {user.bio && (
            <p className="text-[color:var(--foreground)] leading-relaxed">
              {user.bio}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-[color:var(--text-muted)]">
            {user.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{joinedDate}から利用</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}