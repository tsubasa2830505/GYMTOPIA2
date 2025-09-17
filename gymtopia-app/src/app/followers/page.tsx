'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, UserPlus, Calendar, Search, UserCheck, Clock } from 'lucide-react'
import { getFollowers, getFollowCounts, followUser, unfollowUser } from '@/lib/supabase/follows'
import { useAuth } from '@/contexts/AuthContext'

interface Follower {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  created_at: string
  is_active: boolean
  last_seen_at: string | null
  follow_date: string
  is_following_back: boolean
  is_mutual_follow: boolean  // 相互フォロー
  posts_count: number
  mutual_friends_count: number
}

export default function FollowersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [followers, setFollowers] = useState<Follower[]>([])
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 })
  const [loading, setLoading] = useState(true)
  const [processingIds, setProcessingIds] = useState<string[]>([])

  const userId = user?.id

  useEffect(() => {
    if (userId) {
      loadFollowers()
      loadFollowCounts()
    } else {
      setLoading(false)
    }
  }, [userId])

  const loadFollowers = async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await getFollowers(userId)
    if (!error && data) {
      setFollowers(data as Follower[])
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

  const handleFollowBack = async (targetUserId: string) => {
    if (!userId) {
      alert('ログインが必要です')
      return
    }
    setProcessingIds(prev => [...prev, targetUserId])
    const { error } = await followUser(userId, targetUserId)
    if (!error) {
      setFollowers(prev => prev.map(f =>
        f.id === targetUserId ? { ...f, is_following_back: true } : f
      ))
      loadFollowCounts()
    } else {
      console.error('フォローエラー:', error)
      alert(`フォローに失敗しました: ${error}`)
    }
    setProcessingIds(prev => prev.filter(id => id !== targetUserId))
  }

  const handleUnfollow = async (targetUserId: string) => {
    if (!userId) {
      return
    }
    setProcessingIds(prev => [...prev, targetUserId])
    const { error } = await unfollowUser(userId, targetUserId)
    if (!error) {
      setFollowers(prev => prev.map(f => 
        f.id === targetUserId ? { ...f, is_following_back: false } : f
      ))
      loadFollowCounts()
    }
    setProcessingIds(prev => prev.filter(id => id !== targetUserId))
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

  const isRecentlyActive = (lastSeenAt: string | null) => {
    if (!lastSeenAt) return false
    const diff = Date.now() - new Date(lastSeenAt).getTime()
    return diff <= 24 * 60 * 60 * 1000 // 24時間以内
  }

  const formatJoinDate = (createdAt: string) => {
    const date = new Date(createdAt)
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })
  }

  const getAvatarColor = (name: string) => {
    const colors = ['#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899']
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  const filteredFollowers = followers.filter(user => {
    const matchesSearch = 
      (user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.bio?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    
    if (selectedFilter === 'all') return matchesSearch
    if (selectedFilter === 'mutual') return matchesSearch && user.is_mutual_follow
    if (selectedFilter === 'not-following') return matchesSearch && !user.is_following_back
    if (selectedFilter === 'recent') return matchesSearch && isRecentlyActive(user.last_seen_at)
    return matchesSearch
  })

  const mutualFollowCount = followers.filter(f => f.is_following_back).length
  const notFollowingBackCount = followers.filter(f => !f.is_following_back).length
  const recentActiveCount = followers.filter(f => isRecentlyActive(f.last_seen_at)).length

  const filterOptions = [
    { value: 'all', label: 'すべて', count: followers.length },
    { value: 'mutual', label: '相互', count: mutualFollowCount },
    { value: 'not-following', label: '未フォロー', count: notFollowingBackCount },
    { value: 'recent', label: '最近アクティブ', count: recentActiveCount },
  ]

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(120,168,255,0.2),transparent_60%),radial-gradient(circle_at_bottom_right,rgba(74,160,217,0.18),transparent_65%)]" />
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[rgba(157,176,226,0.45)] bg-[rgba(247,250,255,0.9)] backdrop-blur-xl shadow-[0_20px_46px_-28px_rgba(26,44,94,0.42)]">
        <div className="max-w-6xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/profile')}
              className="p-2 rounded-xl bg-[rgba(243,247,255,0.9)] border border-[rgba(168,184,228,0.45)] hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[color:var(--gt-primary-strong)]" />
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={() => router.push('/following')}
                className="gt-chip text-xs sm:text-sm"
              >
                <span className="font-semibold text-[color:var(--text-subtle)]">フォロー</span>
                <span className="gt-pill-label text-[color:var(--gt-primary-strong)]">{followCounts.following}</span>
              </button>
              <div className="gt-chip gt-chip--primary text-xs sm:text-sm shadow-[0_14px_34px_-22px_rgba(26,44,94,0.5)]">
                <span className="font-semibold text-[color:var(--foreground)]">フォロワー</span>
                <span className="gt-pill-label">{followCounts.followers}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Search & Filters */}
        <div className="gt-card p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--text-muted)]" />
              <input
                type="text"
                placeholder="名前、ユーザー名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2 rounded-xl border-2 border-[rgba(168,184,228,0.45)] focus:border-[#3b63f3] bg-[rgba(243,247,255,0.9)] text-sm focus:outline-none focus:ring-2 focus:ring-[#3b63f3]"
              />
            </div>
            <div className="gt-tab-track flex flex-wrap gap-2 py-1">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedFilter(option.value)}
                  className={`gt-tab gt-pill-label flex items-center gap-1 px-3 sm:px-4 py-1.5 transition-all ${
                    selectedFilter === option.value ? 'gt-tab-active' : 'gt-tab-inactive'
                  }`}
                >
                  <span>{option.label}</span>
                  <span className="gt-pill-label text-[color:var(--text-muted)]">{option.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="gt-card p-4 sm:p-5 bg-gradient-to-br from-[#e3f8ff] to-[#eef3ff]">
            <div className="flex items-center justify-between mb-3">
              <span className="gt-label-lg text-[color:var(--text-subtle)]">総フォロワー</span>
              <UserPlus className="w-5 h-5 text-[color:var(--gt-primary-strong)]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[color:var(--foreground)]">{followCounts.followers}</div>
            <p className="gt-body mt-2">コミュニティ全体の人数</p>
          </div>
          <div className="gt-card p-4 sm:p-5 bg-gradient-to-br from-[#f5ecff] to-[#fef2fa]">
            <div className="flex items-center justify-between mb-3">
              <span className="gt-label-lg text-[color:var(--text-subtle)]">相互フォロー</span>
              <UserCheck className="w-5 h-5 text-[#7c6bff]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#7c6bff]">{mutualFollowCount}</div>
            <p className="gt-body mt-2">
              {followCounts.followers > 0
                ? `フォロワーの${Math.round((mutualFollowCount / followCounts.followers) * 100)}%`
                : 'まだ相互フォローはありません'}
            </p>
          </div>
          <div className="gt-card p-4 sm:p-5 bg-gradient-to-br from-[#e8fdf6] to-[#eef9ff]">
            <div className="flex items-center justify-between mb-3">
              <span className="gt-label-lg text-[color:var(--text-subtle)]">フォロー候補</span>
              <Clock className="w-5 h-5 text-[color:var(--gt-secondary-strong)]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[color:var(--gt-secondary-strong)]">{notFollowingBackCount}</div>
            <p className="gt-body mt-2">あなたをフォローしていて、まだフォロー返ししていないユーザー</p>
          </div>
        </div>

        {/* Followers */}
        {loading ? (
          <div className="gt-card p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[color:var(--gt-primary-strong)] border-t-transparent"></div>
            <p className="gt-body mt-3">読み込み中...</p>
          </div>
        ) : filteredFollowers.length === 0 ? (
          <div className="gt-card p-8 text-center">
            <h3 className="text-lg font-semibold text-[color:var(--foreground)] mb-2">フォロワーが見つかりません</h3>
            <p className="gt-body">
              {searchQuery ? '条件に合うユーザーがいません。キーワードを変えてみてください。' : 'まだフォロワーがいません。あなたの活動をシェアしてみましょう。'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFollowers.map((user) => (
              <div key={user.id} className="gt-card p-4 sm:p-5 hover:-translate-y-[2px] transition-transform">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href={`/user/${user.id}`} className="flex-shrink-0">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.display_name || user.username}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white/70"
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                        style={{ backgroundColor: getAvatarColor(user.display_name || user.username) }}
                      >
                        {(user.display_name || user.username).charAt(0)}
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/user/${user.id}`} className="text-base sm:text-lg font-semibold text-[color:var(--foreground)] hover:text-[color:var(--gt-primary-strong)] transition-colors">
                            {user.display_name || user.username}
                          </Link>
                          {user.is_mutual_follow && (
                            <span className="gt-chip gt-chip--primary text-[10px] sm:text-xs">相互</span>
                          )}
                          {user.is_following_back && !user.is_mutual_follow && (
                            <span className="gt-chip text-[10px] sm:text-xs" style={{ background: 'rgba(96,86,255,0.12)', borderColor: 'rgba(96,86,255,0.28)', color: 'var(--gt-primary-strong)' }}>
                              フォロー中
                            </span>
                          )}
                          {!user.is_following_back && (
                            <span className="gt-chip text-[10px] sm:text-xs" style={{ background: 'rgba(255,203,112,0.18)', borderColor: 'rgba(255,203,112,0.35)', color: '#C27803' }}>
                              フォローバック候補
                            </span>
                          )}
                        </div>
                        <Link href={`/user/${user.id}`} className="gt-pill-label text-[color:var(--text-muted)]">@{user.username}</Link>
                        {user.bio && (
                          <p className="gt-body mt-2">{user.bio}</p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-3 text-[10px] sm:text-xs text-[color:var(--text-muted)]">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
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
                            <Clock className="w-3 h-3" />
                            <span>最終: {formatLastActive(user.last_seen_at)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => user.is_following_back ? handleUnfollow(user.id) : handleFollowBack(user.id)}
                          disabled={processingIds.includes(user.id)}
                          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                            user.is_following_back
                              ? 'bg-[rgba(243,247,255,0.92)] border border-[rgba(168,184,228,0.45)] text-[color:var(--text-subtle)] hover:-translate-y-[1px]'
                              : 'bg-gradient-to-r from-[#3b63f3] to-[#4aa0d9] text-white shadow-[0_18px_32px_-22px_rgba(26,44,94,0.5)] hover:-translate-y-[2px]'
                          } ${processingIds.includes(user.id) ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          {processingIds.includes(user.id) ? (
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : user.is_following_back ? (
                            <>
                              <UserCheck className="w-3 h-3" />
                              フォロー中
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3 h-3" />
                              フォローバック
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
