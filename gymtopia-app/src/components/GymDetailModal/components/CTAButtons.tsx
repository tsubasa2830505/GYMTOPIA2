import { memo } from 'react'
import { Heart, MessageSquare } from 'lucide-react'
import type { CTAButtonsProps } from '../types'

const CTAButtons = memo(function CTAButtons({
  gymData,
  liked,
  isProcessingLike,
  onToggleLike,
  onClose
}: CTAButtonsProps) {
  return (
    <div className="space-y-3 mb-5 sm:mb-6 px-4 sm:px-6">
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onToggleLike}
          disabled={isProcessingLike}
          className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-medium transition-all ${
            isProcessingLike
              ? 'bg-[rgba(254,255,250,0.82)] text-[color:var(--text-muted)] cursor-not-allowed'
              : liked
              ? 'bg-[rgba(231,103,76,0.08)] text-white hover:bg-[color:var(--gt-primary-strong)]'
              : 'bg-white border-2 border-[rgba(186,122,103,0.26)] text-[color:var(--foreground)] hover:bg-[rgba(254,255,250,0.98)]'
          }`}
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-white' : ''} ${isProcessingLike ? 'animate-pulse' : ''}`} />
          <span className="text-sm sm:text-base">
            {isProcessingLike ? '処理中...' : liked ? 'イキタイ済み' : 'イキタイ'}
          </span>
        </button>
        <button
          onClick={() => {
            onClose()
            window.location.href = `/add?gymId=${gymData.id}&gymName=${encodeURIComponent(gymData.name)}`
          }}
          className="flex items-center justify-center gap-2 py-3 bg-[color:var(--gt-primary)] text-white rounded-2xl font-medium"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-sm sm:text-base">ジム活を投稿</span>
        </button>
      </div>
    </div>
  )
})

export default CTAButtons