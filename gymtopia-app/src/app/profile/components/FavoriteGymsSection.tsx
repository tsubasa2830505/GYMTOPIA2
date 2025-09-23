import { memo } from 'react'
import { MapPin, Star } from 'lucide-react'
import Link from 'next/link'
import type { FavoriteGym } from '@/lib/types/profile'

interface FavoriteGymsSectionProps {
  favoriteGyms: FavoriteGym[]
  isLoadingFavorites: boolean
}

const FavoriteGymsSection = memo(function FavoriteGymsSection({
  favoriteGyms,
  isLoadingFavorites
}: FavoriteGymsSectionProps) {
  if (isLoadingFavorites) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--gt-primary)] mx-auto"></div>
        <p className="text-[color:var(--text-muted)] mt-4">読み込み中...</p>
      </div>
    )
  }

  if (!favoriteGyms.length) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-[color:var(--text-muted)] mb-4">
          まだお気に入りのジムがありません
        </p>
        <Link
          href="/search"
          className="inline-flex items-center px-4 py-2 bg-[color:var(--gt-primary)] text-white rounded-lg hover:bg-[color:var(--gt-primary-strong)] transition-colors"
        >
          ジムを探す
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favoriteGyms.map((gym) => (
        <Link
          key={gym.gym_id}
          href={`/gyms/${gym.gym_id}`}
          className="bg-white rounded-lg border border-[rgba(186,122,103,0.1)] overflow-hidden hover:shadow-md transition-shadow group"
        >
          {/* Gym Image */}
          <div className="aspect-video bg-gradient-to-br from-[color:var(--gt-primary-alpha)] to-[color:var(--gt-secondary-alpha)] relative overflow-hidden">
            {(() => {
              // Use same fallback logic as GymDetailModal
              const gymImages = gym.gym?.images && gym.gym.images.length > 0
                ? gym.gym.images
                : [
                    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&h=600&fit=crop'
                  ];

              return (
                <img
                  src={gymImages[0]}
                  alt={gym.gym?.name || 'ジム画像'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              );
            })()}
            <div className="absolute top-3 right-3">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
              </div>
            </div>
          </div>

          {/* Gym Info */}
          <div className="p-4">
            <h3 className="font-semibold text-[color:var(--foreground)] mb-2 group-hover:text-[color:var(--gt-primary)] transition-colors">
              {gym.gym?.name}
            </h3>

            {gym.gym?.address && (
              <div className="flex items-start gap-2 mb-3">
                <MapPin className="w-4 h-4 text-[color:var(--text-muted)] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-[color:var(--text-muted)] line-clamp-2">
                  {gym.gym.address}
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                {gym.visit_count && (
                  <span className="text-[color:var(--text-muted)]">
                    訪問 {gym.visit_count}回
                  </span>
                )}
                {gym.gym?.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-[color:var(--text-muted)]">
                      {gym.gym.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-xs text-[color:var(--text-muted)]">
                {new Date(gym.added_at).toLocaleDateString('ja-JP', {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
})

export default FavoriteGymsSection
