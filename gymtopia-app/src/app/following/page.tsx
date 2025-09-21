'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Search, MoreHorizontal } from 'lucide-react'
import { getUserFollowers, getUserFollowing, unfollowUser } from '@/lib/supabase/profile'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'

interface Following {
  id: string
  following: {
    id: string
    username: string
    display_name: string
    avatar_url: string | null
  }
  created_at: string
}

export default function FollowingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [following, setFollowing] = useState<Following[]>([])
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [loading, setLoading] = useState(true)

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

      setFollowing(followingData)
      setFollowersCount(followersData.length)
      setFollowingCount(followingData.length)
    } catch (error) {
      console.error('データ取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFollowing = following.filter(user => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      user.following.display_name?.toLowerCase().includes(query) ||
      user.following.username?.toLowerCase().includes(query)
    )
  })

  const handleUnfollow = async (unfollowUserId: string) => {
    if (!userId) return

    try {
      const success = await unfollowUser(userId, unfollowUserId)
      if (success) {
        // リストから削除
        setFollowing(prev => prev.filter(f => f.following.id !== unfollowUserId))
        setFollowingCount(prev => prev - 1)
      }
    } catch (error) {
      console.error('フォロー解除エラー:', error)
    }
  }

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
              <h1 className="text-xl font-semibold text-[color:var(--foreground)]">フォロー中</h1>
              <p className="text-sm text-[color:var(--text-muted)]">{followingCount}人</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => router.push('/followers')}
            className="flex-1 py-3 text-center font-medium text-[color:var(--text-muted)] hover:text-[color:var(--foreground)]"
          >
            フォロワー
          </button>
          <button className="flex-1 py-3 text-center font-medium border-b-2 border-[color:var(--gt-primary)] text-[color:var(--gt-primary)]">
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

        {/* Following List */}
        <div className="space-y-0">
          {filteredFollowing.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[color:var(--text-muted)]">
                {searchQuery ? '検索結果が見つかりませんでした' : 'フォロー中のユーザーがいません'}
              </p>
            </div>
          ) : (
            filteredFollowing.map((user) => (
              <div key={user.id} className="flex items-center justify-between py-3 hover:bg-gray-50 px-2 rounded-lg transition-colors">
                <Link href={`/user/${user.following.id}`} className="flex items-center gap-3 flex-1">
                  {/* Avatar */}
                  <div className="w-12 h-12 relative">
                    {user.following.avatar_url ? (
                      <Image
                        src={user.following.avatar_url}
                        alt={user.following.display_name || user.following.username}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-[color:var(--gt-primary)] to-[color:var(--gt-secondary)] rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-semibold">
                          {(user.following.display_name || user.following.username || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-[color:var(--foreground)] truncate">
                        {user.following.display_name || user.following.username}
                      </p>
                    </div>
                    {user.following.username && user.following.display_name && (
                      <p className="text-sm text-[color:var(--text-muted)] truncate">@{user.following.username}</p>
                    )}
                  </div>
                </Link>

                {/* Action Button */}
                <button
                  onClick={() => handleUnfollow(user.following.id)}
                  className="px-6 py-1.5 bg-[color:var(--gt-primary)] hover:bg-[color:var(--gt-primary-strong)] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  フォロー中
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}