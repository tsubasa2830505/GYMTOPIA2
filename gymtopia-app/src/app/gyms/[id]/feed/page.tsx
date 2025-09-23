'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Plus, Filter, Layers, Users } from 'lucide-react'
import Header from '@/components/Header'
import PostCard from '@/components/PostCard'
import SidebarNavigation from '@/components/SidebarNavigation'
import { getFeedPosts } from '@/lib/supabase/posts'
import { likePost as likePostAPI, unlikePost as unlikePostAPI } from '@/lib/supabase/posts'
import { getGymDetail } from '@/lib/supabase/gym-detail'
import { useAuth } from '@/contexts/AuthContext'
import type { Post } from '@/lib/supabase/posts'

interface GymDetail {
  id: string
  name: string
  description?: string
  address: string
  prefecture?: string
  city?: string
  image_url?: string
}

export default function GymFeedPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const gymId = params.id as string

  const [gym, setGym] = useState<GymDetail | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedTraining, setExpandedTraining] = useState<Set<string>>(new Set())

  // ジム情報と投稿を取得
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // ジム詳細を取得
        const { data: gymData } = await getGymDetail(gymId)
        if (gymData) {
          setGym(gymData)
        }

        // そのジムの投稿のみを取得（フィルターで'same-gym'を使用し、特定のジムIDを指定）
        const gymPosts = await getFeedPosts(20, 0, 'all')
        // ジムIDでフィルタリング
        const filteredPosts = gymPosts.filter(post => post.gym_id === gymId)
        setPosts(filteredPosts)
      } catch (error) {
        console.error('Error fetching gym feed data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (gymId) {
      fetchData()
    }
  }, [gymId])

  const handleLike = async (post: Post) => {
    if (!user) return

    try {
      // 楽観的更新
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === post.id
            ? {
                ...p,
                is_liked: !p.is_liked,
                likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1
              }
            : p
        )
      )

      // API呼び出し
      if (post.is_liked) {
        await unlikePostAPI(post.id)
      } else {
        await likePostAPI(post.id)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      // エラー時は元に戻す
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === post.id
            ? {
                ...p,
                is_liked: post.is_liked,
                likes_count: post.likes_count
              }
            : p
        )
      )
    }
  }

  const handleToggleTraining = (postId: string) => {
    setExpandedTraining(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--background)]">
        <Header />
        <div className="flex justify-center px-4 pt-16">
          <SidebarNavigation className="hidden lg:block fixed left-0 top-16" />
          <main className="w-full max-w-2xl py-6">
            <div className="w-full">
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-[rgba(254,255,250,0.92)] rounded-lg"></div>
                <div className="h-32 bg-[rgba(254,255,250,0.92)] rounded-lg"></div>
                <div className="h-32 bg-[rgba(254,255,250,0.92)] rounded-lg"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!gym) {
    return (
      <div className="min-h-screen bg-[color:var(--background)]">
        <Header />
        <div className="flex justify-center px-4 pt-16">
          <SidebarNavigation className="hidden lg:block fixed left-0 top-16" />
          <main className="w-full max-w-2xl py-6">
            <div className="w-full text-center">
              <h1 className="text-2xl font-bold text-[color:var(--foreground)] mb-4">ジムが見つかりません</h1>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[color:var(--gt-primary)] text-white rounded-lg hover:bg-[color:var(--gt-primary-strong)] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                ホームに戻る
              </Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[color:var(--background)]">
      <Header />

      <div className="flex justify-center px-4 pt-16">
        <SidebarNavigation className="hidden lg:block fixed left-0 top-16" />

        <main className="w-full max-w-2xl py-6">
          <div className="w-full">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Link
                  href={`/gyms/${gymId}`}
                  className="inline-flex items-center gap-2 text-[color:var(--text-muted)] hover:text-[color:var(--foreground)] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  ジム詳細に戻る
                </Link>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-[rgba(186,122,103,0.26)] p-6 mb-6">
                <div className="flex items-start gap-4">
                  {gym.image_url && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={gym.image_url}
                        alt={gym.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-[color:var(--foreground)] mb-2">
                      {gym.name} のジム活フィード
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-[color:var(--text-muted)] mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{gym.address}</span>
                    </div>
                    <p className="text-[color:var(--text-subtle)] text-sm">
                      このジムでのトレーニング投稿を見ることができます
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-6 text-sm text-[color:var(--text-muted)]">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>{posts.length}件の投稿</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{new Set(posts.map(p => p.user_id)).size}人が投稿</span>
                  </div>
                </div>

                {user && (
                  <Link
                    href={`/add?gymId=${gymId}&gymName=${encodeURIComponent(gym.name)}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[color:var(--gt-primary)] text-white rounded-lg hover:bg-[color:var(--gt-primary-strong)] transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    投稿する
                  </Link>
                )}
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-6">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={user?.id}
                    onLike={handleLike}
                    onToggleTraining={() => handleToggleTraining(post.id)}
                    expandedTraining={expandedTraining}
                    showActions={true}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-[rgba(231,103,76,0.12)] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Layers className="w-8 h-8 text-[color:var(--gt-primary)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)] mb-2">
                    まだ投稿がありません
                  </h3>
                  <p className="text-[color:var(--text-muted)] mb-6">
                    このジムでの最初の投稿者になりましょう！
                  </p>
                  {user && (
                    <Link
                      href={`/add?gymId=${gymId}&gymName=${encodeURIComponent(gym.name)}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[color:var(--gt-primary)] text-white rounded-lg hover:bg-[color:var(--gt-primary-strong)] transition-colors font-medium"
                    >
                      <Plus className="w-5 h-5" />
                      投稿する
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}