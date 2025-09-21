'use client'

import { memo } from 'react'
import ModalHeader from './GymDetailModal/components/ModalHeader'
import ContentHeader from './GymDetailModal/components/ContentHeader'
import InfoCards from './GymDetailModal/components/InfoCards'
import CTAButtons from './GymDetailModal/components/CTAButtons'
import PricingCards from './GymDetailModal/components/PricingCards'
import TabContent from './GymDetailModal/components/TabContent'
import ContactSection from './GymDetailModal/components/ContactSection'
import { useGymDetailData } from './GymDetailModal/hooks/useGymDetailData'
import type { GymDetailModalProps } from './GymDetailModal/types'

const GymDetailModal = memo(function GymDetailModal({ isOpen, onClose, gymId }: GymDetailModalProps) {
  const { state, handleToggleLike, handlePostActivity, setActiveTab } = useGymDetailData(isOpen, gymId)

  if (!isOpen) return null

  // Loading state
  if (state.loading) {
    return (
      <>
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] transition-opacity duration-300"
          onClick={onClose}
        />
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[color:var(--gt-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[color:var(--text-muted)]">ジム情報を読み込み中...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
        <div
          className="bg-white w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up sm:animate-scale-in pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[90vh] sm:max-h-[85vh]">
            {/* Header with Hero Image */}
            <ModalHeader gymData={state.gymData} onClose={onClose} />

            {/* Content Header with Title and Stats */}
            <ContentHeader gymData={state.gymData} likesCount={state.likesCount} />

            {/* Info Pills */}
            <InfoCards gymData={state.gymData} />

            {/* CTA Buttons */}
            <CTAButtons
              gymData={state.gymData}
              liked={state.liked}
              isProcessingLike={state.isProcessingLike}
              onToggleLike={handleToggleLike}
              onClose={onClose}
            />

            {/* Pricing Cards */}
            <PricingCards gymData={state.gymData} />

            {/* Tabs and Tab Content */}
            <TabContent
              gymData={state.gymData}
              activeTab={state.activeTab}
              gymId={gymId}
              onTabChange={setActiveTab}
            />

            {/* Contact Section and Reviews */}
            <ContactSection gymData={state.gymData} gymId={gymId} />
          </div>
        </div>
      </div>
    </>
  )
})

export default GymDetailModal