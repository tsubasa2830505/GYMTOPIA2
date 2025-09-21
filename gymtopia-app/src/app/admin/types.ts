// Admin page type definitions

export interface Equipment {
  id: string
  category: string
  name: string
  maker: string
  count?: number
  maxWeight?: number
}

export interface Review {
  id: string
  author: {
    name: string
    avatar?: string
    initial?: string
  }
  date: string
  content: string
  reply?: {
    storeName: string
    role: string
    content: string
    date: string
  }
}

export interface GymBasicInfo {
  name: string
  area: string
  address: string
  hours: string
  access: string
  phone: string
  description: string
  imageUrl: string
}

export interface AdminFormData {
  basicInfo: GymBasicInfo
}

export interface AdminPageState {
  activeTab: string
  selectedGym: any
  gyms: any[]
  managedGyms: any[]
  loading: boolean
  stats: any
  timeDistribution: any[]
  frequentPosters: any[]
  hasAccess: boolean
  authUser: any
  formData: AdminFormData
  newEquipment: Partial<Equipment>
  equipmentList: Equipment[]
  reviews: Review[]
  newReviewReply: string
  selectedReviewId: string | null
}