export interface GymData {
  id: string
  name: string
  tags: string[]
  location: {
    area: string
    walkingMinutes: number
    lat?: number
    lng?: number
  }
  businessHours: Array<{
    open: string
    close: string
    days: number[]
  }>
  isOpenNow: boolean
  likesCount: number
  likedByMe: boolean
  images: string[]
  pricingPlans: Array<{
    id: string
    title: string
    priceJPY: number
    link: string
  }>
  freeWeights: Array<{
    name: string
    brand: string
    count?: number
    range?: string
  }>
  machines: Array<{
    name: string
    brand: string
    count: number
  }>
  facilities: Record<string, boolean>
  contact: {
    phone: string
    website: string
  }
  reviews: Array<{
    author: string
    date: string
    body: string
  }>
  review_count?: number
  assets?: {
    heroImages: string[]
  }
}

export interface GymDetailModalState {
  gymData: GymData
  loading: boolean
  liked: boolean
  likesCount: number
  activeTab: string
  gym: any | null
  machines: any[]
  isProcessingLike: boolean
}

export interface GymDetailModalProps {
  isOpen: boolean
  onClose: () => void
  gymId: string
}

export interface HeaderProps {
  gymData: GymData
  onClose: () => void
}

export interface StatsRowProps {
  gymData: GymData
  likesCount: number
}

export interface CTAButtonsProps {
  gymData: GymData
  liked: boolean
  isProcessingLike: boolean
  onToggleLike: () => void
  onClose: () => void
}

export interface TabContentProps {
  gymData: GymData
  activeTab: string
  gymId: string
}

export interface ContactSectionProps {
  gymData: GymData
  gymId: string
}