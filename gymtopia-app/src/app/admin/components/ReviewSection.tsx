import { memo } from 'react'
import { Send } from 'lucide-react'
import type { Review } from '../types'

interface ReviewSectionProps {
  reviews: Review[]
  newReviewReply: string
  selectedReviewId: string | null
  onReplyChange: (value: string) => void
  onReplyStart: (reviewId: string) => void
  onReplySubmit: (reviewId: string) => void
  onReplyCancel: () => void
}

const ReviewSection = memo(function ReviewSection({
  reviews,
  newReviewReply,
  selectedReviewId,
  onReplyChange,
  onReplyStart,
  onReplySubmit,
  onReplyCancel
}: ReviewSectionProps) {
  return (
    <div className="bg-white border border-[rgba(186,122,103,0.26)] rounded-[14.5px] p-[22px]">
      <h3 className="text-[14px] font-bold text-[color:var(--foreground)] mb-4">レビュー管理</h3>

      {reviews.length === 0 ? (
        <div className="text-center py-8 text-[color:var(--text-muted)] text-[12.3px]">
          レビューがありません
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border border-[rgba(186,122,103,0.15)] rounded-[8.5px] p-4"
            >
              {/* レビュー内容 */}
              <div className="flex items-start space-x-3 mb-3">
                <div className="flex-shrink-0">
                  {review.author.avatar ? (
                    <img
                      src={review.author.avatar}
                      alt={review.author.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-[var(--gt-primary)] rounded-full flex items-center justify-center text-white text-[11px] font-bold">
                      {review.author.initial || review.author.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-bold text-[12.3px] text-[color:var(--foreground)]">
                      {review.author.name}
                    </span>
                    <span className="text-[11px] text-[color:var(--text-muted)]">
                      {review.date}
                    </span>
                  </div>

                  <p className="text-[12.3px] text-[color:var(--foreground)] leading-relaxed">
                    {review.content}
                  </p>
                </div>
              </div>

              {/* 店舗からの返信 */}
              {review.reply ? (
                <div className="ml-11 p-3 bg-[rgba(254,255,250,0.8)] border border-[rgba(186,122,103,0.15)] rounded-[6px]">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-bold text-[11px] text-[var(--gt-primary)]">
                      {review.reply.storeName}
                    </span>
                    <span className="text-[10px] text-[color:var(--text-muted)]">
                      {review.reply.role}
                    </span>
                    <span className="text-[10px] text-[color:var(--text-muted)]">
                      {review.reply.date}
                    </span>
                  </div>
                  <p className="text-[11px] text-[color:var(--foreground)]">
                    {review.reply.content}
                  </p>
                </div>
              ) : selectedReviewId === review.id ? (
                /* 返信入力フォーム */
                <div className="ml-11 space-y-2">
                  <textarea
                    className="w-full px-3 py-2 bg-white border border-[rgba(186,122,103,0.26)] rounded-[6px] text-[12.3px] text-[color:var(--foreground)] placeholder-[color:var(--text-muted)] focus:ring-2 focus:ring-[var(--gt-primary)] focus:border-transparent"
                    rows={3}
                    placeholder="お客様への返信を入力してください..."
                    value={newReviewReply}
                    onChange={(e) => onReplyChange(e.target.value)}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onReplySubmit(review.id)}
                      className="flex items-center px-3 py-1.5 bg-[var(--gt-primary)] text-white rounded-[6px] hover:bg-[var(--gt-primary-strong)] transition-colors text-[11px]"
                    >
                      <Send className="w-3 h-3 mr-1" />
                      返信
                    </button>
                    <button
                      onClick={onReplyCancel}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-[6px] hover:bg-gray-300 transition-colors text-[11px]"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                /* 返信ボタン */
                <div className="ml-11">
                  <button
                    onClick={() => onReplyStart(review.id)}
                    className="text-[11px] text-[var(--gt-primary)] hover:text-[var(--gt-primary-strong)] transition-colors"
                  >
                    返信する
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

export default ReviewSection