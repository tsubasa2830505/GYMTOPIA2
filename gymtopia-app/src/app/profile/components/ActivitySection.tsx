import { useState, useCallback, memo } from 'react'
import Link from 'next/link'
import PostCard from '@/components/PostCard'
import { formatPostDate, formatTrainingDetails } from '../utils/helpers.tsx'
import type { GymPost } from '@/lib/types/profile'

interface ActivitySectionProps {
  userPosts: GymPost[]
  isLoadingMorePosts: boolean
  hasMorePosts: boolean
  onLoadMore: () => void
}

const ActivitySection = memo(function ActivitySection({
  userPosts,
  isLoadingMorePosts,
  hasMorePosts,
  onLoadMore
}: ActivitySectionProps) {
  const [expandedTraining, setExpandedTraining] = useState<Set<string>>(new Set())

  const toggleTrainingDetails = useCallback((postId: string) => {
    setExpandedTraining(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }, [])

  if (!userPosts.length) {
    return (
      <div className="text-center py-12">
        <p className="text-[color:var(--text-muted)] mb-4">まだアクティビティがありません</p>
        <Link
          href="/add"
          className="inline-flex items-center px-4 py-2 bg-[color:var(--gt-primary)] text-white rounded-lg hover:bg-[color:var(--gt-primary-strong)] transition-colors"
        >
          最初の投稿をする
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {userPosts.map((post) => {
        const trainingDetails = formatTrainingDetails(post)
        const isExpanded = expandedTraining.has(post.id)

        return (
          <div key={post.id} className="bg-white rounded-lg shadow-sm border border-[rgba(186,122,103,0.1)] overflow-hidden">
            <div className="p-6">
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-[color:var(--foreground)]">
                      {post.gym?.name || '不明なジム'}
                    </h3>
                    {post.is_verified && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        GPS認証済み
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[color:var(--text-muted)]">
                    {formatPostDate(post.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-[color:var(--text-muted)]">
                  <span>❤️ {post.likes_count || 0}</span>
                  <span>💬 {post.comments_count || 0}</span>
                </div>
              </div>

              {/* Post Content */}
              {post.content && (
                <div className="mb-4">
                  <p className="text-[color:var(--foreground)] leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>
              )}

              {/* Training Details */}
              {trainingDetails && (
                <div className="border-t border-[rgba(186,122,103,0.1)] pt-4">
                  <button
                    onClick={() => toggleTrainingDetails(post.id)}
                    className="flex items-center gap-2 text-sm font-medium text-[color:var(--gt-primary)] hover:text-[color:var(--gt-primary-strong)] transition-colors mb-2"
                  >
                    <span>トレーニング詳細</span>
                    <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="text-sm text-[color:var(--text-muted)] space-y-1">
                      {trainingDetails.split(' • ').map((detail, index) => (
                        <div key={index} className="pl-4 border-l-2 border-[color:var(--gt-primary-alpha)]">
                          {detail}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Post Images */}
              {post.images && post.images.length > 0 && (
                <div className="mt-4">
                  <div className="grid grid-cols-2 gap-2">
                    {post.images.slice(0, 4).map((image, index) => (
                      <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`トレーニング画像 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  {post.images.length > 4 && (
                    <p className="text-xs text-[color:var(--text-muted)] mt-2">
                      他 {post.images.length - 4} 枚の画像
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Load More Button */}
      {hasMorePosts && (
        <div className="text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMorePosts}
            className="px-6 py-3 bg-white border border-[color:var(--gt-primary)] text-[color:var(--gt-primary)] rounded-lg hover:bg-[color:var(--gt-primary-alpha)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingMorePosts ? '読み込み中...' : 'もっと見る'}
          </button>
        </div>
      )}
    </div>
  )
})

export default ActivitySection
