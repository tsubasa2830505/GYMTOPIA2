import type { FacilityKey } from '@/types/facilities'
import type { GymCheckinStatus } from '@/lib/supabase/checkin'

export interface SearchResultsState {
  currentView: 'list' | 'map'
  sortBy: string
  sortDropdownOpen: boolean
  selectedGym: any | null
  showGymModal: boolean
  loading: boolean
  filteredGyms: any[]
  gymCheckinStatuses: Map<string, GymCheckinStatus>
  machines: any[]
}

export interface FilterState {
  facilities?: FacilityKey[]
  machines?: string[]
  freeWeights?: string[]
  minRating?: number
  maxDistance?: number
}

export interface SearchResultsHeaderProps {
  gymCount: number
  currentView: 'list' | 'map'
  onViewChange: (view: 'list' | 'map') => void
  sortBy: string
  sortDropdownOpen: boolean
  onSortChange: (sortBy: string) => void
  onSortDropdownToggle: () => void
}

export interface GymListProps {
  gyms: any[]
  checkinStatuses: Map<string, GymCheckinStatus>
  onGymClick: (gym: any) => void
}

export interface GymCardProps {
  gym: any
  checkinStatus?: GymCheckinStatus
  onClick: (gym: any) => void
}

export interface SearchFiltersProps {
  onFilter: (filters: FilterState) => void
  machines: any[]
}

export interface UserLocation {
  lat: number
  lng: number
}