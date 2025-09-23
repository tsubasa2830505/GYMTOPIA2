import { memo } from 'react'
import { Clock } from 'lucide-react'
import type { GymData } from '../types'

interface InfoCardsProps {
  gymData: GymData
}

const InfoCards = memo(function InfoCards({ gymData }: InfoCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 sm:mb-5 px-4 sm:px-6">
      <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[rgba(186,122,103,0.26)] hover:shadow-md transition-shadow">
        <Clock className="w-5 h-5 text-[color:var(--text-muted)]" />
        <div>
          <p className="text-sm font-semibold text-[color:var(--foreground)]">
            {gymData.businessHours && gymData.businessHours.length > 0
              ? `${gymData.businessHours[0].open}–${gymData.businessHours[0].close}`
              : '営業時間情報なし'}
          </p>
          <p className={`text-xs font-medium ${gymData.isOpenNow ? 'text-[color:var(--gt-secondary-strong)]' : 'text-[color:var(--gt-primary-strong)]'}`}>
            {gymData.businessHours && gymData.businessHours.length > 0
              ? (gymData.isOpenNow ? '営業中' : '営業時間外')
              : ''}
          </p>
        </div>
      </div>

    </div>
  )
})

export default InfoCards