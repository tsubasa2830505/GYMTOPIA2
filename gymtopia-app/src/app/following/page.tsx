'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, UserPlus, MapPin, Calendar, Search, UserMinus, Clock } from 'lucide-react'
import { getFollowing, getFollowCounts, unfollowUser } from '@/lib/supabase/follows'
import { useAuth } from '@/contexts/AuthContext'

interface Following {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  created_at: string
  is_active: boolean
  last_seen_at: string | null
  follow_date: string
  is_mutual_follow: boolean  // 相互フォロー
  posts_count: number
  mutual_friends_count: number
}

export default function FollowingPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [following, setFollowing] = useState<Following[]>([])
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 })
  const [loading, setLoading] = useState(true)
  const [processingIds, setProcessingIds] = useState<string[]>([])
  const { user } = useAuth()

  const userId = user?.id

  useEffect(() => {
    if (userId) {
      loadFollowing()
      loadFollowCounts()
    } else {
      setLoading(false)
    }
  }, [userId])

  const loadFollowing = async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await getFollowing(userId)
    if (!error && data) {
      setFollowing(data as Following[])
    }
    setLoading(false)
  }

  const loadFollowCounts = async () => {
    if (!userId) {
      return
    }
    const counts = await getFollowCounts(userId)
    if (!counts.error) {
      setFollowCounts(counts)
    }
  }

  const handleUnfollow = async (targetUserId: string) => {
    if (!userId) {
      return
    }
    if (window.confirm('フォローを解除しますか？')) {
      setProcessingIds(prev => [...prev, targetUserId])
      const { error } = await unfollowUser(userId, targetUserId)
      if (!error) {
        setFollowing(prev => prev.filter(f => f.id !== targetUserId))
        loadFollowCounts()
      }
      setProcessingIds(prev => prev.filter(id => id !== targetUserId))
    }
  }

  const formatLastActive = (lastSeenAt: string | null) => {
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

  const filteredFollowing = following.filter(user => {
    const matchesSearch = 
      (user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.bio?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    
    if (selectedFilter === 'all') return matchesSearch
    if (selectedFilter === 'mutual') return matchesSearch && user.is_mutual_follow
    if (selectedFilter === 'recent') {
      const lastActive = formatLastActive(user.last_seen_at)
      return matchesSearch && (lastActive.includes('分前') || lastActive.includes('時間前') || lastActive === 'オンライン')
    }
    return matchesSearch
  })

  const mutualFollowsCount = following.filter(f => f.is_mutual_follow).length
  const activeToday = following.filter(f => {
    const lastActive = formatLastActive(f.last_seen_at)
    return lastActive === 'オンライン' || lastActive.includes('分前') || lastActive.includes('時間前')
  }).length

  return (
    <div className="min-h-screen pb-10 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(190deg,rgba(240,244,255,0.32),transparent_84%),radial-gradient(circle_at_18%_24%,rgba(60,104,255,0.16),transparent_64%),radial-gradient(circle_at_88%_16%,rgba(110,150,255,0.14),transparent_70%)]" />
        <div className="absolute -top-24 left-16 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(231,103,76,0.32),transparent_70%)] blur-[130px] opacity-70" />
        <div className="absolute bottom-[-10%] right-[-6%] h-[23rem] w-[23rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(96,134,255,0.24),transparent_76%)] blur-[150px] opacity-58" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[rgba(231,103,76,0.18)] bg-[rgba(247,250,255,0.9)] backdrop-blur-xl shadow-[0_18px_48px_-26px_rgba(189,101,78,0.4)]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/profile')}
              className="p-2 rounded-xl bg-[rgba(254,255,250,0.9)] border border-[rgba(231,103,76,0.18)] hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[color:var(--gt-primary-strong)]" />
            </button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[color:var(--gt-primary-strong)]">フォロー</h1>
                <span className="px-2 py-1 bg-[rgba(231,103,76,0.16)] text-[color:var(--gt-primary-strong)] text-xs rounded-full font-semibold border border-[rgba(231,103,76,0.26)]">
                  {followCounts.following}人
                </span>
              </div>
              <button 
                onClick={() => router.push('/followers')}
                className="flex items-center gap-2 text-[color:var(--text-subtle)] hover:text-[color:var(--foreground)] transition-colors"
              >
                <span className="text-lg font-semibold">フォロワー</span>
                <span className="px-2 py-1 bg-[rgba(254,255,250,0.92)] text-[color:var(--text-subtle)] text-xs rounded-full font-medium border border-[rgba(231,103,76,0.18)]">
                  {followCounts.followers}人
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Search and Filter */}
        <div className="gt-card p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--text-muted)]" />
              <input
                type="text"
                placeholder="名前、ユーザー名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[rgba(254,255,250,0.92)] border-2 border-[rgba(231,103,76,0.18)] focus:border-[color:var(--gt-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedFilter === 'all'
                    ? 'bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white shadow-[0_12px_30px_-18px_rgba(189,101,78,0.46)]'
                    : 'bg-[rgba(254,255,250,0.92)] text-[color:var(--text-subtle)] border border-[rgba(231,103,76,0.18)] hover:bg-white'
                }`}
              >
                すべて
              </button>
              <button
                onClick={() => setSelectedFilter('mutual')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedFilter === 'mutual'
                    ? 'bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white shadow-[0_12px_30px_-18px_rgba(189,101,78,0.46)]'
                    : 'bg-[rgba(254,255,250,0.92)] text-[color:var(--text-subtle)] border border-[rgba(231,103,76,0.18)] hover:bg-white'
                }`}
              >
                相互
              </button>
              <button
                onClick={() => setSelectedFilter('recent')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedFilter === 'recent'
                    ? 'bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white shadow-[0_12px_30px_-18px_rgba(189,101,78,0.46)]'
                    : 'bg-[rgba(254,255,250,0.92)] text-[color:var(--text-subtle)] border border-[rgba(231,103,76,0.18)] hover:bg-white'
                }`}
              >
                最近アクティブ
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl p-4 bg-gradient-to-br from-[rgba(231,103,76,0.12)] to-[rgba(96,134,255,0.18)] border border-[rgba(231,103,76,0.2)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[color:var(--text-subtle)]">総フォロー数</span>
              <UserPlus className="w-5 h-5 text-[color:var(--gt-primary-strong)]" />
            </div>
            <div className="text-2xl font-bold text-[color:var(--foreground)]">{followCounts.following}人</div>
            <div className="text-xs text-[color:var(--text-muted)] mt-1">アクティブユーザー</div>
          </div>
          <div className="rounded-xl p-4 bg-gradient-to-br from-[rgba(240,142,111,0.12)] to-[rgba(96,134,255,0.18)] border border-[rgba(231,103,76,0.2)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[color:var(--text-subtle)]">相互</span>
              <MapPin className="w-5 h-5 text-[color:var(--gt-secondary-strong)]" />
            </div>
            <div className="text-2xl font-bold text-[color:var(--foreground)]">{mutualFollowsCount}人</div>
            <div className="text-xs text-[color:var(--text-muted)] mt-1">
              {followCounts.following > 0 ? 
                `フォロー中の${Math.round(mutualFollowsCount / followCounts.following * 100)}%` : 
                '0%'
              }
            </div>
          </div>
          <div className="rounded-xl p-4 bg-gradient-to-br from-[rgba(245,177,143,0.12)] to-[rgba(188,210,255,0.2)] border border-[rgba(231,103,76,0.2)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[color:var(--text-subtle)]">今日アクティブ</span>
              <Calendar className="w-5 h-5 text-[color:var(--gt-tertiary-strong)]" />
            </div>
            <div className="text-2xl font-bold text-[color:var(--foreground)]">{activeToday}人</div>
            <div className="text-xs text-[color:var(--text-muted)] mt-1">過去24時間以内</div>
          </div>
        </div>

        {/* Following List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--gt-primary-strong)]"></div>
            <p className="mt-2 text-[color:var(--text-muted)]">読み込み中...</p>
          </div>
        ) : filteredFollowing.length === 0 ? (
          <div className="gt-card p-8 text-center">
            <p className="text-[color:var(--text-muted)]">
              {searchQuery ? '検索結果が見つかりませんでした' : 'フォローしているユーザーがいません'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFollowing.map((user) => (
              <div key={user.id} className="gt-card p-6 hover:shadow-[0_24px_50px_-30px_rgba(189,101,78,0.46)] transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Link href={`/user/${user.id}`} className="flex-shrink-0">
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
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-[0_14px_32px_-20px_rgba(189,101,78,0.44)]"
                        style={{ backgroundColor: getAvatarColor(user.display_name || user.username) }}
                      >
                        {(user.display_name || user.username).charAt(0)}
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/user/${user.id}`} className="font-bold text-lg text-[color:var(--foreground)] hover:text-[color:var(--gt-primary-strong)] transition-colors">
                            {user.display_name || user.username}
                          </Link>
                          {user.is_mutual_follow && (
                            <span className="px-2 py-1 bg-[rgba(240,142,111,0.16)] text-[color:var(--gt-secondary-strong)] text-xs rounded-full font-medium border border-[rgba(240,142,111,0.3)]">
                              相互
                            </span>
                          )}
                        </div>
                        <Link href={`/user/${user.id}`} className="text-sm text-[color:var(--text-subtle)] hover:text-[color:var(--gt-primary-strong)] transition-colors inline-block">@{user.username}</Link>
                        {user.bio && (
                          <p className="text-sm text-[color:var(--text-subtle)] mt-1">{user.bio}</p>
                        )}
                        
                        {/* Stats */}
                        <div className="flex flex-wrap gap-3 mt-3 text-xs text-[color:var(--text-muted)]">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[color:var(--gt-primary-strong)]" />
                            <span>{formatJoinDate(user.created_at)}から</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>{user.posts_count}投稿</span>
                          </div>
                          {user.mutual_friends_count > 0 && (
                            <div className="flex items-center gap-1">
                              <span>共通の友達 {user.mutual_friends_count}人</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[color:var(--gt-secondary-strong)]" />
                            <span>最終: {formatLastActive(user.last_seen_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleUnfollow(user.id)}
                          disabled={processingIds.includes(user.id)}
                          className={`px-3 py-2 bg-[rgba(255,247,247,0.9)] text-[color:var(--gt-primary-strong)] rounded-lg text-sm font-medium border border-[rgba(231,103,76,0.26)] hover:bg-[rgba(231,103,76,0.12)] transition-colors flex items-center gap-1 ${
                            processingIds.includes(user.id) ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {processingIds.includes(user.id) ? (
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <UserMinus className="w-3 h-3" />
                              フォロー解除
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
