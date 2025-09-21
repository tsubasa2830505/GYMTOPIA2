import { memo } from 'react'
import { MapPin, Users } from 'lucide-react'
import type { StatsRowProps } from '../types'

const ContentHeader = memo(function ContentHeader({ gymData, likesCount }: StatsRowProps) {
  return (
    <div className="px-4 sm:px-6 -mt-8 sm:-mt-10 relative">
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
        {gymData.tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 sm:px-4 sm:py-1.5 bg-white/95 backdrop-blur rounded-full text-xs sm:text-sm font-semibold text-[color:var(--foreground)] shadow-lg border border-white/20"
          >
            {tag}
          </span>
        ))}
        {gymData.facilities.drop_in && (
          <span className="px-3 py-1 sm:px-4 sm:py-1.5 bg-[color:var(--gt-secondary)] text-[color:var(--gt-on-secondary)] rounded-full text-xs sm:text-sm font-semibold shadow-lg border border-[color:var(--gt-secondary)] flex items-center gap-1">
            <Users className="w-3 h-3" />
            ドロップインOK
          </span>
        )}
      </div>

      {/* Title */}
      <div className="mb-4 sm:mb-5">
        <h1
          className="text-2xl sm:text-3xl font-bold text-[color:var(--foreground)] mb-2 leading-tight"
          style={{
            textShadow: '3px 3px 6px rgba(255,255,255,1), 0px 0px 12px rgba(255,255,255,0.8), -1px -1px 0px rgba(255,255,255,0.8), 1px -1px 0px rgba(255,255,255,0.8), -1px 1px 0px rgba(255,255,255,0.8), 1px 1px 0px rgba(255,255,255,0.8)'
          }}
        >
          {gymData.name}
        </h1>
        <div className="flex items-center gap-2 text-[color:var(--foreground)]">
          <MapPin
            className="w-4 h-4"
            style={{
              filter: 'drop-shadow(2px 2px 4px rgba(255,255,255,0.8)) drop-shadow(0px 0px 8px rgba(255,255,255,0.6))'
            }}
          />
          <span
            className="text-sm font-medium"
            style={{
              textShadow: '2px 2px 4px rgba(255,255,255,1), 0px 0px 8px rgba(255,255,255,0.8), -1px -1px 0px rgba(255,255,255,0.8), 1px -1px 0px rgba(255,255,255,0.8), -1px 1px 0px rgba(255,255,255,0.8), 1px 1px 0px rgba(255,255,255,0.8)'
            }}
          >
            {gymData.location.area} • 徒歩{gymData.location.walkingMinutes}分
          </span>
        </div>
      </div>

      {/* Stats Row - Airbnb style */}
      <div className="flex items-center gap-1 text-sm font-medium text-[color:var(--text-subtle)] mb-6 bg-white rounded-full px-4 py-2 shadow-sm w-fit">
        <span className="text-[color:var(--text-subtle)]">
          {gymData.review_count || 0}件のレビュー
        </span>
        <span className="text-[color:var(--text-muted)]">•</span>
        <span className="font-semibold">{likesCount}人がイキタイ</span>
      </div>
    </div>
  )
})

export default ContentHeader