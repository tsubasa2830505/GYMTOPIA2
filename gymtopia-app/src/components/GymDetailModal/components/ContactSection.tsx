import { memo } from 'react'
import { Phone, Globe, ChevronRight } from 'lucide-react'
import GymDetailedInfoDisplay from '@/components/GymDetailedInfoDisplay'
import type { ContactSectionProps } from '../types'

const ContactSection = memo(function ContactSection({ gymData, gymId }: ContactSectionProps) {
  return (
    <div className="px-4 sm:px-6 space-y-5">
      {/* Image Gallery */}
      {gymData.images && gymData.images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {gymData.images.slice(1).map((image, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shadow-md"
            >
              <img
                src={image}
                alt={`${gymData.name} ${index + 2}`}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
              />
            </div>
          ))}
        </div>
      )}

      {/* ジムオーナー詳細情報 */}
      <div>
        <GymDetailedInfoDisplay gymId={gymId} />
      </div>

      {/* Contact */}
      <div className="bg-[rgba(254,255,250,0.97)] rounded-2xl p-4">
        <h2 className="text-lg font-bold text-[color:var(--foreground)] mb-3">アクセス・お問い合わせ</h2>
        <div className="space-y-2">
          <a
            href={`tel:${gymData.contact.phone}`}
            className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-shadow"
          >
            <Phone className="w-5 h-5 text-[color:var(--gt-secondary-strong)]" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[color:var(--foreground)]">{gymData.contact.phone}</p>
              <p className="text-xs text-[color:var(--text-muted)]">電話で問い合わせ</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[rgba(68,73,73,0.6)]" />
          </a>
          <a
            href={gymData.contact.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-shadow"
          >
            <Globe className="w-5 h-5 text-[color:var(--gt-secondary-strong)]" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[color:var(--foreground)]">公式サイト</p>
              <p className="text-xs text-[color:var(--text-muted)]">詳細情報を見る</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[rgba(68,73,73,0.6)]" />
          </a>
        </div>
      </div>

      {/* Reviews */}
      <div className="pb-6">
        <h2 className="text-lg font-bold text-[color:var(--foreground)] mb-3">口コミ・レビュー</h2>
        <div className="space-y-3">
          {gymData.reviews.map((review, index) => (
            <div key={index} className="p-3 bg-white border border-[rgba(186,122,103,0.26)] rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[var(--gt-secondary)] to-[var(--gt-primary)] rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">{review.author}</p>
                  <p className="text-xs text-[color:var(--text-muted)]">
                    {new Date(review.date).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <p className="text-xs text-[color:var(--text-subtle)] leading-relaxed">{review.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

export default ContactSection