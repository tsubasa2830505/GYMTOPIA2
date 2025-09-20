'use client'

import { MapPin, Heart } from 'lucide-react'

interface GymResultCardProps {
  gym: {
    id: string | number
    name: string
    location: string
    address?: string
    image: string
    likes: number
    price: string
    isLiked: boolean
    tags: string[]
    distanceFromUser?: number | null
    distance?: string
  }
  sortBy: string
  isProcessing: boolean
  isSelected?: boolean
  onToggleLike: (gymId: string) => void
  onViewDetails: (gymId: string) => void
}

export default function GymResultCard({
  gym,
  sortBy,
  isProcessing,
  isSelected = false,
  onToggleLike,
  onViewDetails
}: GymResultCardProps) {
  return (
    <div
      className={`gt-card p-4 sm:p-6 transition-all ${isSelected ? 'ring-2 ring-[rgba(231,103,76,0.32)]' : 'hover:-translate-y-[3px]'}`}
    >
      <div className="flex gap-3 sm:gap-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex-shrink-0 overflow-hidden border border-white/60 bg-white/70">
          <img
            src={gym.image}
            alt={gym.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop'
            }}
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[color:var(--foreground)]">{gym.name}</h3>
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-[color:var(--text-muted)] mt-1">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{gym.location}</span>
              </div>
              {gym.address && (
                <p className="gt-body-muted mt-1">{gym.address}</p>
              )}
              {sortBy === 'distance' && gym.distanceFromUser && (
                <p className="text-xs text-[color:var(--gt-primary-strong)] font-medium mt-1">
                  現在地から {gym.distanceFromUser.toFixed(1)}km
                </p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 text-[color:var(--text-muted)]">
                  <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${gym.isLiked ? 'fill-[color:var(--gt-primary)] text-[color:var(--gt-primary)]' : ''}`} />
                  <span className="text-xs sm:text-sm font-semibold text-[color:var(--foreground)]">{gym.likes}</span>
                </div>
                <span className="text-base sm:text-lg font-bold text-[color:var(--gt-primary-strong)]">{gym.price}</span>
              </div>
            </div>
            <div className="hidden sm:flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onToggleLike(String(gym.id))}
                disabled={isProcessing}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold gt-pressable transition-all ${
                  gym.isLiked
                    ? 'bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-primary-strong)] text-white'
                    : 'bg-white/80 text-[color:var(--foreground)] border border-white/60 hover:-translate-y-[2px]'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Heart className={`w-3 h-3 sm:w-4 sm:h-4 inline mr-1 ${gym.isLiked ? 'fill-white' : 'text-[color:var(--gt-secondary-strong)]'}`} />
                {isProcessing ? '処理中...' : (gym.isLiked ? 'イキタイ済み' : 'イキタイ')}
              </button>
              <button
                type="button"
                onClick={() => onViewDetails(String(gym.id))}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-primary-strong)] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-[0_18px_36px_-26px_rgba(189,101,78,0.46)] hover:-translate-y-[2px] transition-all"
              >
                詳細を見る
              </button>
            </div>
          </div>
          {gym.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
              {gym.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="gt-chip text-[10px] sm:text-xs"
                  style={{ background: 'rgba(96, 86, 255, 0.12)', borderColor: 'rgba(96, 86, 255, 0.32)', color: 'var(--gt-primary-strong)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2 mt-3 sm:hidden">
            <button
              type="button"
              onClick={() => onToggleLike(String(gym.id))}
              disabled={isProcessing}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold gt-pressable transition-all ${
                gym.isLiked
                  ? 'bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-primary-strong)] text-white'
                  : 'bg-white/80 text-[color:var(--foreground)] border border-white/60'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Heart className={`w-3 h-3 inline mr-1 ${gym.isLiked ? 'fill-white' : 'text-[color:var(--gt-secondary-strong)]'}`} />
              {isProcessing ? '処理中...' : (gym.isLiked ? 'イキタイ済み' : 'イキタイ')}
            </button>
            <button
              type="button"
              onClick={() => onViewDetails(String(gym.id))}
              className="flex-1 py-1.5 bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-primary-strong)] text-white rounded-xl text-xs font-semibold shadow-[0_14px_30px_-24px_rgba(189,101,78,0.44)]"
            >
              詳細を見る
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}