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
    const colors = ['#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899']
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/profile')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <h1 className="text-xl font-bold text-blue-600">フォロー</h1>
                <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full font-medium">
                  {followCounts.following}人
                </span>
              </div>
              <button 
                onClick={() => router.push('/followers')}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <span className="text-lg font-bold">フォロワー</span>
                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">
                  {followCounts.followers}人
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="名前、ユーザー名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === 'all' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                すべて
              </button>
              <button
                onClick={() => setSelectedFilter('mutual')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === 'mutual' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                相互
              </button>
              <button
                onClick={() => setSelectedFilter('recent')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === 'recent' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                最近アクティブ
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-700">総フォロー数</span>
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{followCounts.following}人</div>
            <div className="text-xs text-slate-600 mt-1">アクティブユーザー</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-700">相互</span>
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{mutualFollowsCount}人</div>
            <div className="text-xs text-slate-600 mt-1">
              {followCounts.following > 0 ? 
                `フォロー中の${Math.round(mutualFollowsCount / followCounts.following * 100)}%` : 
                '0%'
              }
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-700">今日アクティブ</span>
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{activeToday}人</div>
            <div className="text-xs text-slate-600 mt-1">過去24時間以内</div>
          </div>
        </div>

        {/* Following List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-slate-600">読み込み中...</p>
          </div>
        ) : filteredFollowing.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-slate-600">
              {searchQuery ? '検索結果が見つかりませんでした' : 'フォローしているユーザーがいません'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFollowing.map((user) => (
              <div key={user.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
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
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
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
                          <Link href={`/user/${user.id}`} className="font-bold text-lg text-slate-900 hover:text-blue-600 transition-colors">
                            {user.display_name || user.username}
                          </Link>
                          {user.is_mutual_follow && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                              相互
                            </span>
                          )}
                        </div>
                        <Link href={`/user/${user.id}`} className="text-sm text-slate-600 hover:text-blue-600 transition-colors inline-block">@{user.username}</Link>
                        {user.bio && (
                          <p className="text-sm text-slate-700 mt-1">{user.bio}</p>
                        )}
                        
                        {/* Stats */}
                        <div className="flex flex-wrap gap-3 mt-3">
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            <Calendar className="w-3 h-3" />
                            <span>{formatJoinDate(user.created_at)}から</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            <span>{user.posts_count}投稿</span>
                          </div>
                          {user.mutual_friends_count > 0 && (
                            <div className="flex items-center gap-1 text-xs text-slate-600">
                              <span>共通の友達 {user.mutual_friends_count}人</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            <Clock className="w-3 h-3" />
                            <span>最終: {formatLastActive(user.last_seen_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleUnfollow(user.id)}
                          disabled={processingIds.includes(user.id)}
                          className={`px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors flex items-center gap-1 ${
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