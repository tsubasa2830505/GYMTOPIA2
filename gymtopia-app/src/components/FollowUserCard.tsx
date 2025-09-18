'use client'

import Image from 'next/image'
import { UserPlus, UserCheck, UserMinus, Clock, Calendar } from 'lucide-react'

interface FollowUserCardProps {
  user: {
    id: string
    username: string
    display_name?: string
    avatar_url?: string | null
    bio?: string | null
    created_at: string
    last_seen_at?: string | null
    is_following_back?: boolean
    is_mutual_follow?: boolean
    posts_count?: number
    mutual_friends_count?: number
  }
  isFollowing?: boolean
  showFollowButton?: boolean
  showUnfollowButton?: boolean
  onFollow?: (userId: string) => void
  onUnfollow?: (userId: string) => void
  isProcessing?: boolean
}

export default function FollowUserCard({
  user,
  isFollowing = false,
  showFollowButton = false,
  showUnfollowButton = false,
  onFollow,
  onUnfollow,
  isProcessing = false
}: FollowUserCardProps) {
  const formatLastActive = (lastSeenAt: string | null | undefined) => {
    if (!lastSeenAt) return 'オフライン'

    const lastSeen = new Date(lastSeenAt)
    const now = new Date()
    const diffMs = now.getTime() - lastSeen.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'オンライン'
    if (diffMins < 60) return `${diffMins}分前`
    if (diffHours < 24) return `${diffHours}時間前`
    if (diffDays < 7) return `${diffDays}日前`
    return lastSeen.toLocaleDateString('ja-JP')
  }

  const formatJoinDate = (createdAt: string) => {
    const date = new Date(createdAt)
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })
  }

  const getAvatarColor = (name: string) => {
    const colors = ['var(--gt-secondary-strong)', 'var(--gt-tertiary-strong)', 'var(--gt-tertiary)', 'var(--gt-primary-strong)', 'var(--gt-secondary)', 'var(--gt-secondary)']
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.display_name || user.username}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: getAvatarColor(user.display_name || user.username) }}
            >
              {(user.display_name || user.username).charAt(0)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg text-[color:var(--foreground)]">
                  {user.display_name || user.username}
                </h3>
                {user.is_mutual_follow && (
                  <span className="px-2 py-1 bg-[rgba(240,142,111,0.16)] text-[color:var(--gt-secondary-strong)] text-xs rounded-full font-medium">
                    相互
                  </span>
                )}
                {user.is_following_back && !user.is_mutual_follow && (
                  <span className="px-2 py-1 bg-[rgba(240,142,111,0.14)] text-[color:var(--gt-secondary-strong)] text-xs rounded-full font-medium">
                    相互フォロー
                  </span>
                )}
                {!user.is_following_back && showFollowButton && (
                  <span className="px-2 py-1 bg-[rgba(245,177,143,0.14)] text-[color:var(--gt-tertiary-strong)] text-xs rounded-full font-medium">
                    未フォロー
                  </span>
                )}
              </div>
              <p className="text-sm text-[color:var(--text-muted)]">@{user.username}</p>
              {user.bio && (
                <p className="text-sm text-[color:var(--text-subtle)] mt-1">{user.bio}</p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-3 mt-3">
                <div className="flex items-center gap-1 text-xs text-[color:var(--text-muted)]">
                  <Calendar className="w-3 h-3" />
                  <span>{formatJoinDate(user.created_at)}から</span>
                </div>
                {user.posts_count !== undefined && (
                  <div className="flex items-center gap-1 text-xs text-[color:var(--text-muted)]">
                    <span>{user.posts_count}投稿</span>
                  </div>
                )}
                {user.mutual_friends_count !== undefined && user.mutual_friends_count > 0 && (
                  <div className="flex items-center gap-1 text-xs text-[color:var(--text-muted)]">
                    <span>共通の友達 {user.mutual_friends_count}人</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-[color:var(--text-muted)]">
                  <Clock className="w-3 h-3" />
                  <span>最終: {formatLastActive(user.last_seen_at)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {showFollowButton && !isFollowing && (
                <button
                  onClick={() => onFollow?.(user.id)}
                  disabled={isProcessing}
                  className={`px-3 py-2 bg-[color:var(--gt-primary)] text-white rounded-lg text-sm font-medium hover:bg-[color:var(--gt-primary-strong)] transition-colors flex items-center gap-1 ${
                    isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isProcessing ? (
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3" />
                      フォローバック
                    </>
                  )}
                </button>
              )}

              {showFollowButton && isFollowing && (
                <button
                  onClick={() => onUnfollow?.(user.id)}
                  disabled={isProcessing}
                  className={`px-3 py-2 bg-[rgba(254,255,250,0.95)] text-[color:var(--text-subtle)] rounded-lg text-sm font-medium hover:bg-[rgba(254,255,250,0.9)] transition-colors flex items-center gap-1 ${
                    isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isProcessing ? (
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserCheck className="w-3 h-3" />
                      フォロー中
                    </>
                  )}
                </button>
              )}

              {showUnfollowButton && (
                <button
                  onClick={() => onUnfollow?.(user.id)}
                  disabled={isProcessing}
                  className={`px-3 py-2 bg-[rgba(231,103,76,0.12)] text-[color:var(--gt-primary-strong)] rounded-lg text-sm font-medium hover:bg-[rgba(231,103,76,0.18)] transition-colors flex items-center gap-1 ${
                    isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isProcessing ? (
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserMinus className="w-3 h-3" />
                      フォロー解除
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}