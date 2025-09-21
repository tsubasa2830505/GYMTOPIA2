import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { searchGymsNearby } from '@/lib/supabase/search'
import { getSupabaseClient } from '@/lib/supabase/client'
import { performGPSCheckin, findNearbyGyms, getCheckinPostStatus } from '@/lib/supabase/checkin'
import { getAccuratePosition } from '@/lib/gps-verification'
import type { CheckinPageState, NearbyGym, CheckInStats, CheckIn } from '../types'

export function useCheckinData() {
  const router = useRouter()

  const [state, setState] = useState<CheckinPageState>({
    userLocation: null,
    nearbyGyms: [],
    loading: true,
    checkingIn: null,
    checkedInGyms: new Set(),
    stats: null,
    recentCheckIns: [],
    locationPermission: null,
    hasLocationPermission: false,
    showSuccessMessage: false,
    showLocationPrompt: false,
    earnedBadges: [],
    postsPublished: 0,
    accurateLocationEnabled: false,
    isRefreshing: false,
    error: null
  })

  const updateState = useCallback((updates: Partial<CheckinPageState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Load user location and nearby gyms
  useEffect(() => {
    checkLocationPermission()
  }, [])

  const checkLocationPermission = async () => {
    try {
      if (!navigator.geolocation) {
        updateState({
          error: 'このデバイスでは位置情報がサポートされていません',
          loading: false
        })
        return
      }

      const permission = await navigator.permissions.query({ name: 'geolocation' })
      updateState({ locationPermission: permission.state })

      if (permission.state === 'granted') {
        await getUserLocation()
      } else if (permission.state === 'prompt') {
        updateState({ showLocationPrompt: true, loading: false })
      } else {
        updateState({
          error: '位置情報の使用が許可されていません',
          loading: false
        })
      }
    } catch (error) {
      console.error('Location permission check failed:', error)
      updateState({
        error: '位置情報の確認に失敗しました',
        loading: false
      })
    }
  }

  const getUserLocation = async () => {
    try {
      updateState({ loading: true, error: null })

      const position = state.accurateLocationEnabled
        ? await getAccuratePosition()
        : await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 60000
            })
          })

      const userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }

      updateState({
        userLocation,
        hasLocationPermission: true
      })

      await loadNearbyGyms(userLocation)
      await loadUserStats()

    } catch (error) {
      console.error('Failed to get user location:', error)
      updateState({
        error: '位置情報の取得に失敗しました',
        loading: false
      })
    }
  }

  const loadNearbyGyms = async (location: { lat: number; lng: number }) => {
    try {
      const result = await findNearbyGyms({ latitude: location.lat, longitude: location.lng }, 5, 20)

      if (result.error) {
        console.error('Failed to load nearby gyms:', result.error)
        updateState({
          error: '近くのジムの取得に失敗しました',
          nearbyGyms: [],
          loading: false
        })
        return
      }

      // Add distance calculation if missing
      const gymsWithDistance = (result.data || []).map(gym => {
        if (gym.distance === undefined || gym.distance === null) {
          // Calculate distance using Haversine formula
          const R = 6371000 // Earth's radius in meters
          const dLat = (gym.latitude - location.lat) * Math.PI / 180
          const dLng = (gym.longitude - location.lng) * Math.PI / 180
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                   Math.cos(location.lat * Math.PI / 180) * Math.cos(gym.latitude * Math.PI / 180) *
                   Math.sin(dLng/2) * Math.sin(dLng/2)
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
          const distance = R * c

          return { ...gym, distance }
        }
        return gym
      })

      updateState({ nearbyGyms: gymsWithDistance, loading: false })
    } catch (error) {
      console.error('Failed to load nearby gyms:', error)
      updateState({
        error: '近くのジムの取得に失敗しました',
        nearbyGyms: [],
        loading: false
      })
    }
  }

  const loadUserStats = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      // Load user checkin stats (simplified)
      const stats: CheckInStats = {
        streak: 7,
        totalCheckIns: 42,
        uniqueGyms: 8,
        thisWeek: 4
      }

      updateState({ stats })
    } catch (error) {
      console.error('Failed to load user stats:', error)
    }
  }

  const handleCheckin = async (gymId: string) => {
    if (!state.userLocation) return

    try {
      updateState({ checkingIn: gymId })

      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const result = await performGPSCheckin(
        user.id,
        gymId,
        { latitude: state.userLocation.lat, longitude: state.userLocation.lng },
        {
          crowdLevel: 'normal'
        }
      )

      if (result.success) {
        const newCheckedInGyms = new Set(state.checkedInGyms)
        newCheckedInGyms.add(gymId)

        updateState({
          checkedInGyms: newCheckedInGyms,
          showSuccessMessage: true,
          earnedBadges: result.badges_earned || [],
          postsPublished: 0
        })

        // Refresh nearby gyms to update checkin status
        await loadNearbyGyms(state.userLocation)
      } else {
        updateState({
          error: result.error || 'チェックインに失敗しました'
        })
      }
    } catch (error) {
      console.error('Checkin failed:', error)
      updateState({
        error: 'チェックインに失敗しました'
      })
    } finally {
      updateState({ checkingIn: null })
    }
  }

  const handleEnableLocation = () => {
    updateState({ showLocationPrompt: false })
    getUserLocation()
  }

  const handleRefresh = async () => {
    if (!state.userLocation) return

    updateState({ isRefreshing: true })
    await loadNearbyGyms(state.userLocation)
    updateState({ isRefreshing: false })
  }

  const handleToggleAccurateLocation = (enabled: boolean) => {
    updateState({ accurateLocationEnabled: enabled })
  }

  return {
    state,
    updateState,
    handleCheckin,
    handleEnableLocation,
    handleRefresh,
    handleToggleAccurateLocation,
    getUserLocation
  }
}