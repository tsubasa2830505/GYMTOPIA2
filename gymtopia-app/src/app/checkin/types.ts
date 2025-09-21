export interface NearbyGym {
  id: string
  name: string
  address: string
  distance: number
  image_url?: string
  latitude: number
  longitude: number
  checkedInToday?: boolean
  lastCheckIn?: string
  rarity_level?: 'common' | 'rare' | 'legendary' | 'mythical'
  rarity_tags?: string[]
  total_checkins?: number
}

export interface CheckInStats {
  streak: number
  totalCheckIns: number
  uniqueGyms: number
  thisWeek: number
}

export interface CheckIn {
  id: string
  gym_id: string
  gym_name: string
  checked_in_at: string
  note?: string
}

export interface CheckinPageState {
  userLocation: { lat: number; lng: number } | null
  nearbyGyms: NearbyGym[]
  loading: boolean
  checkingIn: string | null
  checkedInGyms: Set<string>
  stats: CheckInStats | null
  recentCheckIns: CheckIn[]
  locationPermission: PermissionState | null
  hasLocationPermission: boolean
  showSuccessMessage: boolean
  showLocationPrompt: boolean
  earnedBadges: any[]
  postsPublished: number
  accurateLocationEnabled: boolean
  isRefreshing: boolean
  error: string | null
}

export interface GymCardProps {
  gym: NearbyGym
  onCheckin: (gymId: string) => void
  isCheckingIn: boolean
  isCheckedIn: boolean
}

export interface StatsCardProps {
  stats: CheckInStats | null
  loading: boolean
}

export interface LocationPromptProps {
  onEnableLocation: () => void
  onDismiss: () => void
}

export interface CheckinSuccessProps {
  gym: NearbyGym
  badges: any[]
  postsPublished: number
  onDismiss: () => void
  onViewPosts: () => void
}