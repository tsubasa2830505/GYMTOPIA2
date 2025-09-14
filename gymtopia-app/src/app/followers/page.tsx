'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, UserPlus, MapPin, Calendar, Search, UserCheck, Clock } from 'lucide-react'
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
  is_gym_friend: boolean
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
      console.log('No userId available for loadFollowers')
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
      console.log('No userId available for loadFollowCounts')
      return
    }
    const counts = await getFollowCounts(userId)
    if (!counts.error) {
      setFollowCounts(counts)
    }
  }

  const handleFollowBack = async (targetUserId: string) => {
    if (!userId) {
      console.log('No userId available for handleFollowBack')
      return
    }
    setProcessingIds(prev => [...prev, targetUserId])
    const { error } = await followUser(userId, targetUserId)
    if (!error) {
      setFollowers(prev => prev.map(f => 
        f.id === targetUserId ? { ...f, is_following_back: true } : f
      ))
      loadFollowCounts()
    }
    setProcessingIds(prev => prev.filter(id => id !== targetUserId))
  }

  const handleUnfollow = async (targetUserId: string) => {
    if (!userId) {
      console.log('No userId available for handleUnfollow')
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
    if (selectedFilter === 'gym-friends') return matchesSearch && user.is_gym_friend
    if (selectedFilter === 'not-following') return matchesSearch && !user.is_following_back
    if (selectedFilter === 'recent') {
      const lastActive = formatLastActive(user.last_seen_at)
      return matchesSearch && (lastActive.includes('分前') || lastActive.includes('時間前') || lastActive === 'オンライン')
    }
    return matchesSearch
  })

  const mutualFollowCount = followers.filter(f => f.is_following_back).length
  const notFollowingBackCount = followers.filter(f => !f.is_following_back).length

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
              <button 
                onClick={() => router.push('/following')}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <span className="text-lg font-bold">フォロー</span>
                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">
                  {followCounts.following}人
                </span>
              </button>
              <div className="flex items-center gap-1">
                <h1 className="text-xl font-bold text-green-600">フォロワー</h1>
                <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full font-medium">
                  {followCounts.followers}人
                </span>
              </div>
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
                onClick={() => setSelectedFilter('gym-friends')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === 'gym-friends' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ジム友
              </button>
              <button
                onClick={() => setSelectedFilter('not-following')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === 'not-following' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                未フォロー
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
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-700">総フォロワー数</span>
              <UserPlus className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{followCounts.followers}人</div>
            <div className="text-xs text-slate-600 mt-1">アクティブユーザー</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-700">相互フォロー</span>
              <UserCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{mutualFollowCount}人</div>
            <div className="text-xs text-slate-600 mt-1">
              {followCounts.followers > 0 ? 
                `フォロワーの${Math.round(mutualFollowCount / followCounts.followers * 100)}%` : 
                '0%'
              }
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-700">未フォロー</span>
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{notFollowingBackCount}人</div>
            <div className="text-xs text-slate-600 mt-1">フォローバック候補</div>
          </div>
        </div>

        {/* Followers List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-slate-600">読み込み中...</p>
          </div>
        ) : filteredFollowers.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-slate-600">
              {searchQuery ? '検索結果が見つかりませんでした' : 'フォロワーがいません'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFollowers.map((user) => (
              <div key={user.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
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
                          <h3 className="font-bold text-lg text-slate-900">
                            {user.display_name || user.username}
                          </h3>
                          {user.is_gym_friend && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                              ジム友
                            </span>
                          )}
                          {user.is_following_back && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                              相互フォロー
                            </span>
                          )}
                          {!user.is_following_back && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                              未フォロー
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">@{user.username}</p>
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
                          onClick={() => user.is_following_back ? 
                            handleUnfollow(user.id) : handleFollowBack(user.id)
                          }
                          disabled={processingIds.includes(user.id)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                            user.is_following_back 
                              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          } ${processingIds.includes(user.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
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