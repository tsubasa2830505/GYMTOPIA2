'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Search, MoreHorizontal } from 'lucide-react'
import { getUserFollowers, getUserFollowing, followUser, unfollowUser } from '@/lib/supabase/profile'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'

interface Follower {
  id: string
  follower: {
    id: string
    username: string
    display_name: string
    avatar_url: string | null
  }
  created_at: string
}

export default function FollowersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [followers, setFollowers] = useState<Follower[]>([])
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set())

  const userId = user?.id

  useEffect(() => {
    if (userId) {
      loadData()
    } else {
      setLoading(false)
    }
  }, [userId])

  const loadData = async () => {
    if (!userId) return

    try {
      const [followersData, followingData] = await Promise.all([
        getUserFollowers(userId),
        getUserFollowing(userId)
      ])

      setFollowers(followersData)
      setFollowersCount(followersData.length)
      setFollowingCount(followingData.length)

      // フォロー中のIDセットを作成
      const ids = new Set(followingData.map(f => f.following.id))
      setFollowingIds(ids)
    } catch (error) {
      console.error('データ取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async (targetUserId: string) => {
    if (!userId) return

    try {
      const success = await followUser(userId, targetUserId)
      if (success) {
        setFollowingIds(prev => new Set([...prev, targetUserId]))
      }
    } catch (error) {
      console.error('フォローエラー:', error)
    }
  }

  const handleUnfollow = async (targetUserId: string) => {
    if (!userId) return

    try {
      const success = await unfollowUser(userId, targetUserId)
      if (success) {
        setFollowingIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(targetUserId)
          return newSet
        })
      }
    } catch (error) {
      console.error('フォロー解除エラー:', error)
    }
  }

  const filteredFollowers = followers.filter(follower => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      follower.follower.display_name?.toLowerCase().includes(query) ||
      follower.follower.username?.toLowerCase().includes(query)
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--background)]">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[color:var(--background)]">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-[color:var(--foreground)]">フォロワー</h1>
              <p className="text-sm text-[color:var(--text-muted)]">{followersCount}人</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button className="flex-1 py-3 text-center font-medium border-b-2 border-[color:var(--gt-primary)] text-[color:var(--gt-primary)]">
            フォロワー
          </button>
          <button
            onClick={() => router.push('/following')}
            className="flex-1 py-3 text-center font-medium text-[color:var(--text-muted)] hover:text-[color:var(--foreground)]"
          >
            フォロー中
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--text-muted)]" />
          <input
            type="text"
            placeholder="検索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--gt-primary)] focus:bg-white transition-all"
          />
        </div>

        {/* Followers List */}
        <div className="space-y-0">
          {filteredFollowers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[color:var(--text-muted)]">
                {searchQuery ? '検索結果が見つかりませんでした' : 'フォロワーがいません'}
              </p>
            </div>
          ) : (
            filteredFollowers.map((follower) => (
              <div key={follower.id} className="flex items-center justify-between py-3 hover:bg-gray-50 px-2 rounded-lg transition-colors">
                <Link href={`/user/${follower.follower.id}`} className="flex items-center gap-3 flex-1">
                  {/* Avatar */}
                  <div className="w-12 h-12 relative">
                    {follower.follower.avatar_url ? (
                      <Image
                        src={follower.follower.avatar_url}
                        alt={follower.follower.display_name || follower.follower.username}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-[color:var(--gt-primary)] to-[color:var(--gt-secondary)] rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-semibold">
                          {(follower.follower.display_name || follower.follower.username || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-[color:var(--foreground)] truncate">
                        {follower.follower.display_name || follower.follower.username}
                      </p>
                    </div>
                    {follower.follower.username && follower.follower.display_name && (
                      <p className="text-sm text-[color:var(--text-muted)] truncate">@{follower.follower.username}</p>
                    )}
                  </div>
                </Link>

                {/* Action Button */}
                {followingIds.has(follower.follower.id) ? (
                  <button
                    onClick={() => handleUnfollow(follower.follower.id)}
                    className="px-6 py-1.5 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-lg transition-colors"
                  >
                    フォロー中
                  </button>
                ) : (
                  <button
                    onClick={() => handleFollow(follower.follower.id)}
                    className="px-6 py-1.5 bg-[color:var(--gt-primary)] hover:bg-[color:var(--gt-primary-strong)] text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    フォローバック
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}