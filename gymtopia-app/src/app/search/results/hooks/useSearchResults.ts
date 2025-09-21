import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getGyms } from '@/lib/supabase/gyms'
import { searchGymsNearby } from '@/lib/supabase/search'
import { getMachines } from '@/lib/supabase/machines'
import { getUserGymCheckinStatus } from '@/lib/supabase/checkin'
import { enrichGymWithStationInfo } from '@/lib/utils/distance'
import { calculateDistance, sortGyms } from '../utils/distance'
import type { SearchResultsState, UserLocation } from '../types'

export function useSearchResults() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const [state, setState] = useState<SearchResultsState>({
    currentView: 'list',
    sortBy: 'default',
    sortDropdownOpen: false,
    selectedGym: null,
    showGymModal: false,
    loading: true,
    filteredGyms: [],
    gymCheckinStatuses: new Map(),
    machines: []
  })

  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    loadSearchResults()
  }, [searchParams])

  // Load user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.warn('Failed to get user location:', error)
        }
      )
    }
  }, [])

  const loadSearchResults = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      setError(null)

      // Get search parameters
      const query = searchParams.get('q') || ''
      const area = searchParams.get('area') || ''
      const searchType = searchParams.get('searchType')

      let gyms: any[] = []

      if (searchType === 'nearby' && userLocation) {
        gyms = await searchGymsNearby(userLocation.lat, userLocation.lng, 10)
      } else {
        gyms = await getGyms()
      }

      // Filter gyms based on search parameters
      if (query) {
        gyms = gyms.filter(gym =>
          gym.name.toLowerCase().includes(query.toLowerCase()) ||
          gym.description?.toLowerCase().includes(query.toLowerCase())
        )
      }

      if (area) {
        gyms = gyms.filter(gym =>
          gym.area?.toLowerCase().includes(area.toLowerCase()) ||
          gym.prefecture?.toLowerCase().includes(area.toLowerCase())
        )
      }

      // Enrich gyms with station info and calculate distances
      const enrichedGyms = await Promise.all(
        gyms.map(async (gym) => {
          let enrichedGym = await enrichGymWithStationInfo(gym)

          if (userLocation && gym.latitude && gym.longitude) {
            enrichedGym.distanceFromUser = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              gym.latitude,
              gym.longitude
            )
          }

          return enrichedGym
        })
      )

      // Load checkin statuses
      const checkinStatuses = new Map()
      if (user) {
        for (const gym of enrichedGyms) {
          try {
            const status = await getUserGymCheckinStatus(user.id, gym.id)
            checkinStatuses.set(gym.id, status)
          } catch (error) {
            console.warn(`Failed to load checkin status for gym ${gym.id}:`, error)
          }
        }
      }

      // Load machines for filtering
      const machines = await getMachines()

      setState(prev => ({
        ...prev,
        filteredGyms: enrichedGyms,
        gymCheckinStatuses: checkinStatuses,
        machines,
        loading: false
      }))

    } catch (error) {
      console.error('Error loading search results:', error)
      setError('検索結果の読み込みに失敗しました')
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const updateState = useCallback((updates: Partial<SearchResultsState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const handleViewChange = useCallback((view: 'list' | 'map') => {
    updateState({ currentView: view })
  }, [updateState])

  const handleSortChange = useCallback((sortBy: string) => {
    const sortedGyms = sortGyms(state.filteredGyms, sortBy, userLocation)
    updateState({
      sortBy,
      filteredGyms: sortedGyms,
      sortDropdownOpen: false
    })
  }, [state.filteredGyms, userLocation, updateState])

  const handleSortDropdownToggle = useCallback(() => {
    updateState({ sortDropdownOpen: !state.sortDropdownOpen })
  }, [state.sortDropdownOpen, updateState])

  const handleGymSelect = useCallback((gym: any) => {
    updateState({ selectedGym: gym, showGymModal: true })
  }, [updateState])

  const handleModalClose = useCallback(() => {
    updateState({ selectedGym: null, showGymModal: false })
  }, [updateState])

  return {
    state,
    userLocation,
    error,
    updateState,
    handleViewChange,
    handleSortChange,
    handleSortDropdownToggle,
    handleGymSelect,
    handleModalClose,
    loadSearchResults
  }
}