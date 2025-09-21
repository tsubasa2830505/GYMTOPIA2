import { memo } from 'react'
import { ChevronRight } from 'lucide-react'
import type { GymData } from '../types'

interface PricingCardsProps {
  gymData: GymData
}

const PricingCards = memo(function PricingCards({ gymData }: PricingCardsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 sm:mb-6 px-4 sm:px-6">
      {gymData.pricingPlans && Array.isArray(gymData.pricingPlans) && gymData.pricingPlans.map((plan) => (
        <a
          key={plan.id}
          href={plan.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 bg-gradient-to-br from-[rgba(231,103,76,0.08)] to-[rgba(240,142,111,0.1)] rounded-2xl hover:shadow-lg transition-shadow"
        >
          <p className="text-sm font-medium text-[color:var(--text-subtle)] mb-2">{plan.title}</p>
          <p className="text-2xl font-bold text-[color:var(--foreground)]">
            {formatPrice(plan.priceJPY)}
          </p>
          <div className="flex items-center justify-end mt-3">
            <span className="text-xs text-[color:var(--gt-secondary-strong)] font-medium">詳細を見る</span>
            <ChevronRight className="w-4 h-4 text-[color:var(--gt-secondary-strong)] ml-1" />
          </div>
        </a>
      ))}
    </div>
  )
})

export default PricingCards