'use client'

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic'

import { MapPin, List, Filter, ChevronDown, Heart, Map as MapIcon, Star, ArrowLeft, Navigation, X } from 'lucide-react'
import Image from 'next/image'
import Header from '@/components/Header'
import { useState, useEffect, Suspense, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import GymDetailModal from '@/components/GymDetailModal'
import { UberStyleMapView } from '@/components/UberStyleMapView'
import { getGyms, Gym } from '@/lib/supabase/gyms'
import { searchGymsNearby } from '@/lib/supabase/search'
import { getMachines } from '@/lib/supabase/machines'
import type { FacilityKey } from '@/types/facilities'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { DatabaseGym } from '@/types/database'
import { enrichGymWithStationInfo } from '@/lib/utils/distance'

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Sort gyms based on selected criteria
function sortGyms(gyms: any[], sortBy: string, userLocation: { lat: number; lng: number } | null) {
  const sorted = [...gyms]

  switch (sortBy) {
    case 'distance':
      // Sort by distance from user location (closest first)
      return sorted.sort((a, b) => {
        if (!userLocation) return 0
        const distA = a.distanceFromUser ?? Infinity
        const distB = b.distanceFromUser ?? Infinity
        return distA - distB
      })

    case 'rating':
      // Sort by rating (highest first)
      return sorted.sort((a, b) => {
        const ratingA = a.rating || 0
        const ratingB = b.rating || 0
        return ratingB - ratingA
      })

    case 'popular':
    default:
      // Sort by likes/review count (most popular first)
      return sorted.sort((a, b) => {
        const likesA = a.likes || 0
        const likesB = b.likes || 0
        return likesB - likesA
      })
  }
}

function SearchResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list')
  const [sortBy, setSortBy] = useState<'popular' | 'distance' | 'rating'>('popular')
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const [selectedGymId, setSelectedGymId] = useState<string | null>(null)
  const [gyms, setGyms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [machineNames, setMachineNames] = useState<Record<string, string>>({})
  const [processingLikes, setProcessingLikes] = useState<Set<string>>(new Set())
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedGymForMap, setSelectedGymForMap] = useState<DatabaseGym | null>(null)
  const sortControlRef = useRef<HTMLDivElement | null>(null)

  const { user, isAuthenticated } = useAuth()

  // Handle toggle like function
  const toggleLike = async (gymId: string) => {
    if (!isAuthenticated || !user) {
      alert('ログインが必要です')
      return
    }
    if (processingLikes.has(gymId)) {
      return
    }

    setProcessingLikes(prev => new Set(prev).add(gymId))

    try {
      const gymIndex = gyms.findIndex(gym => gym.id === gymId)
      if (gymIndex === -1) return

      const gym = gyms[gymIndex]
      const isLiked = gym.isLiked

      if (isLiked) {
        // イキタイを解除
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from('favorite_gyms')
          .delete()
          .eq('user_id', user.id)
          .eq('gym_id', gymId)

        if (error) {
          console.error('Error removing like:', error)
          alert('いきたいの解除に失敗しました: ' + error.message)
        } else {
          // UI更新
          const updatedGyms = [...gyms]
          updatedGyms[gymIndex] = {
            ...gym,
            isLiked: false,
            likes: Math.max(0, gym.likes - 1)
          }
          setGyms(updatedGyms)
        }
      } else {
        // イキタイを追加
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from('favorite_gyms')
          .insert({
            user_id: user.id,
            gym_id: gymId
          })

        if (error) {
          if (error.code === '23505') {
            // 既に存在する場合
            const updatedGyms = [...gyms]
            updatedGyms[gymIndex] = {
              ...gym,
              isLiked: true
            }
            setGyms(updatedGyms)
          } else {
            console.error('Error adding like:', error, error?.message, error?.details)
            alert('いきたいの追加に失敗しました: ' + (error?.message || JSON.stringify(error)))
          }
        } else {
          // UI更新
          const updatedGyms = [...gyms]
          updatedGyms[gymIndex] = {
            ...gym,
            isLiked: true,
            likes: gym.likes + 1
          }
          setGyms(updatedGyms)
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      alert('エラーが発生しました: ' + (error instanceof Error ? error.message : String(error)))
    } finally {
      setProcessingLikes(prev => {
        const newSet = new Set(prev)
        newSet.delete(gymId)
        return newSet
      })
    }
  }

  // Parse URL parameters for selected conditions
  const [selectedConditions, setSelectedConditions] = useState<{
    machines: Array<{ name: string; count: number }>
    freeWeights: Array<{ name: string; count: number }>
    facilities: string[]
  }>({ machines: [], freeWeights: [], facilities: [] })

  const removeCondition = (type: 'machines' | 'freeWeights' | 'facilities', value: string) => {
    const newConditions = { ...selectedConditions }

    if (type === 'facilities') {
      newConditions.facilities = selectedConditions.facilities.filter(item => item !== value)
    } else if (type === 'machines') {
      newConditions.machines = selectedConditions.machines.filter(item => item.name !== value)
    } else if (type === 'freeWeights') {
      newConditions.freeWeights = selectedConditions.freeWeights.filter(item => item.name !== value)
    }

    setSelectedConditions(newConditions)
    
    // Update URL with new conditions
    const params = new URLSearchParams()
    if (newConditions.machines.length > 0) {
      params.set('machines', newConditions.machines.map(m => `${m.name}:${m.count}`).join(','))
    }
    if (newConditions.freeWeights.length > 0) {
      params.set('freeWeights', newConditions.freeWeights.map(fw => fw.name).join(','))
    }
    if (newConditions.facilities.length > 0) {
      params.set('facilities', newConditions.facilities.join(','))
    }
    
    // Get current tab if it exists
    const currentTab = searchParams.get('tab')
    if (currentTab) {
      params.set('tab', currentTab)
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : '/search/results'
    router.push(`/search/results${newUrl}`)
  }

  const clearAllConditions = () => {
    setSelectedConditions({ machines: [], freeWeights: [], facilities: [] })
    router.push('/search/results')
  }

  // Fetch gyms from Supabase
  const fetchGyms = useCallback(async (conditions: {
    machines: Array<{ name: string; count: number }>
    freeWeights: Array<{ name: string; count: number }>
    facilities: string[]
  }) => {
    try {
      setLoading(true)
      setError(null)

      const keyword = searchParams.get('keyword') || undefined
      const prefecture = searchParams.get('prefecture') || undefined
      const city = searchParams.get('city') || undefined
      const facilitiesParam = searchParams.get('facilities') || ''
      const facilities = facilitiesParam
        ? (facilitiesParam.split(',').filter(Boolean) as FacilityKey[])
        : undefined

      const filters: { search?: string; prefecture?: string; city?: string; facilities?: FacilityKey[] } = {}
      if (keyword) filters.search = keyword
      if (prefecture) filters.prefecture = prefecture
      if (city) filters.city = city
      if (facilities && facilities.length > 0) filters.facilities = facilities

      // Pass all condition filters to getGyms
      // Note: conditions are handled separately in the UI, not passed to getGyms
      
      const data = await getGyms(filters)
      
      if (data) {
        // Transform data to match component format
        const transformedData = data.map((gym: Gym, index: number) => {
          // 距離と駅情報を計算
          const stationInfo = enrichGymWithStationInfo({
            address: gym.address,
            latitude: gym.latitude,
            longitude: gym.longitude
          })

          // Calculate distance from user location if available
          let distanceFromUser = null
          if (userLocation && gym.latitude && gym.longitude) {
            distanceFromUser = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              parseFloat(gym.latitude),
              parseFloat(gym.longitude)
            )
          }

          return {
            id: gym.id || `gym-${index}`, // Ensure unique ID
            name: gym.name || 'ジム名未設定',
            location: stationInfo.walkingMinutes > 0
              ? `${stationInfo.station}から徒歩${String(stationInfo.walkingMinutes)}分`
              : stationInfo.area,
            distance: String(stationInfo.walkingText),
            distanceFromUser: distanceFromUser, // Distance in km from user location
            likes: gym.review_count || 0,
            tags: gym.equipment_types || [],
            image: gym.images && gym.images.length > 0
              ? gym.images[0]
              : 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
            price: '¥10,000～', // Placeholder
            isLiked: false,
            address: gym.address || '',
            images: gym.images || [], // 全画像を保持
            // DatabaseGym format for map (convert string to number)
            latitude: gym.latitude ? parseFloat(gym.latitude) : null,
            longitude: gym.longitude ? parseFloat(gym.longitude) : null,
            description: gym.description,
            prefecture: gym.prefecture,
            city: gym.city,
            facilities: gym.facilities,
            rating: gym.rating,
            review_count: gym.review_count,
            // 追加情報
            nearestStation: stationInfo.station,
            walkingMinutes: stationInfo.walkingMinutes
          }
        })

        // Remove duplicates based on ID
        let uniqueGyms = transformedData.filter((gym, index, self) =>
          self.findIndex(g => g.id === gym.id) === index
        )

        // Apply sorting
        uniqueGyms = sortGyms(uniqueGyms, sortBy, userLocation)

        setGyms(uniqueGyms)
      }
    } catch (err) {
      console.error('Failed to fetch gyms:', err)
      setError('ジムの検索に失敗しました')
      
      // Fallback to sample data
      setGyms([
        {
          id: 1,
          name: 'プレミアムフィットネス銀座',
          location: '銀座',
          distance: '徒歩3分',
          likes: 256,
          tags: ['プレミアム', 'サウナ'],
          image: '/gym1.jpg',
          price: '¥18,400',
          isLiked: true,
        },
        {
          id: 2,
          name: 'GOLD\'S GYM 渋谷',
          location: '渋谷',
          distance: '徒歩5分',
          likes: 189,
          tags: ['24時間', 'プール'],
          image: '/gym2.jpg',
          price: '¥15,000',
          isLiked: false,
        },
        {
          id: 3,
          name: 'エニタイムフィットネス新宿',
          location: '新宿',
          distance: '徒歩8分',
          likes: 145,
          tags: ['24時間営業', 'シャワー'],
          image: '/gym3.jpg',
          price: '¥12,600',
          isLiked: false,
        },
      ])
    } finally {
      setLoading(false)
    }
  }, [searchParams, sortBy, userLocation])

  // Close sort dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!sortDropdownOpen) return
      if (sortControlRef.current && sortControlRef.current.contains(event.target as Node)) {
        return
      }
      setSortDropdownOpen(false)
    }

    if (sortDropdownOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [sortDropdownOpen, sortControlRef])

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Location error:', error);
          // Don't set default location - let user see actual position
          // Users can still use the map without location permission
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  }, []);

  useEffect(() => {
    // Check if there are any search parameters or if this is a direct access
    const hasSearchParams = searchParams.toString().length > 0

    // If no search parameters, show all gyms as default
    if (!hasSearchParams) {
      setSelectedConditions({ machines: [], freeWeights: [], facilities: [] })
      fetchGyms({ machines: [], freeWeights: [], facilities: [] })
      return
    }

    // Parse machines with count (format: "name:count")
    const machinesParam = searchParams.get('machines')?.split(',').filter(Boolean) || []
    const machines = machinesParam.map(item => {
      const [name, count] = item.split(':')
      return { name, count: parseInt(count) || 1 }
    })

    // Parse freeWeights (format: "name" - presence based)
    const freeWeightsParam = searchParams.get('freeWeights')?.split(',').filter(Boolean) || []
    const freeWeights = freeWeightsParam.map(name => {
      return { name: name.trim(), count: 1 } // Always 1 for presence-based design
    })
    const facilities = searchParams.get('facilities')?.split(',').filter(Boolean) || []

    const newConditions = { machines, freeWeights, facilities }
    setSelectedConditions(newConditions)

    // URLのmachinesは名前を想定（ID対応が必要になった場合のみ取得）
    if (machines.length > 0) {
      const hasNonName = machines.some(m => /:/.test(m.name || m))
      if (hasNonName) {
        getMachines().then(allMachines => {
          const nameMap: Record<string, string> = {}
          allMachines.forEach((machine: any) => {
            nameMap[machine.id] = machine.name
          })
          setMachineNames(nameMap)
        })
      }
    }

    const nearby = searchParams.get('nearby') === '1'
    const lat = parseFloat(searchParams.get('lat') || '')
    const lon = parseFloat(searchParams.get('lon') || '')
    const radius = parseFloat(searchParams.get('radius') || '5')

    if (nearby && !Number.isNaN(lat) && !Number.isNaN(lon)) {
      (async () => {
        try {
          setLoading(true)
          setError(null)
          const { data, error } = await searchGymsNearby(lon, lat, radius, 100, 0)
          if (error) throw error
          const ids = (data || []).map((r: any) => r.id)
          if (ids.length === 0) {
            setGyms([])
            setLoading(false)
            return
          }
          const supabase = getSupabaseClient()
          const { data: gymRows } = await supabase
            .from('gyms')
            .select('*')
            .in('id', ids)
          const distMap = new Map<string, number>()
          ;(data || []).forEach((r: any) => distMap.set(r.id, r.distance_km))
          let transformed = (gymRows || []).map((g: any) => ({
            id: g.id,
            name: g.name,
            location: g.city || g.prefecture || '',
            distance: distMap.has(g.id) ? `${distMap.get(g.id)?.toFixed(1)} km` : undefined,
            distanceFromUser: distMap.get(g.id) || null,
            likes: g.review_count || 0,
            tags: g.equipment_types || [],
            image: g.images && g.images.length > 0 ? g.images[0] : 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
            price: '—',
            isLiked: false,
            address: g.address || '',
            images: g.images || [],
            rating: g.rating,
            latitude: g.latitude,
            longitude: g.longitude
          }))

          // Apply sorting for nearby search results too
          transformed = sortGyms(transformed, sortBy, { lat, lng })
          setGyms(transformed)
        } catch (e: any) {
          console.error('Nearby search failed', e)
          setError('近くのジム検索に失敗しました')
          setGyms([])
        } finally {
          setLoading(false)
        }
      })()
    } else {
      fetchGyms(newConditions)
    }
  }, [searchParams, fetchGyms])

  const getTotalConditionsCount = () => {
    return selectedConditions.machines.length + selectedConditions.freeWeights.length + selectedConditions.facilities.length
  }

  const handleMarkerClick = (gym: DatabaseGym) => {
    setSelectedGymForMap(gym);
    // Switch to list view to show selected gym
    if (viewMode === 'map') {
      setViewMode('list');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="gt-card px-10 py-8 text-center space-y-4">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto"
            style={{ borderColor: 'var(--gt-primary-strong)', borderTopColor: 'transparent' }}
          />
          <p className="gt-body text-[color:var(--text-subtle)]">ジムを検索中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-16 bg-gradient-to-br from-[rgba(231,103,76,0.08)] via-[rgba(245,177,143,0.12)] to-[rgba(240,142,111,0.16)]">
      {/* Header */}
      <Header subtitle="検索結果" />

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 pt-20">

        {/* Results Summary Card */}
        <div className="gt-card p-4 sm:p-6 mb-4 sm:mb-6 space-y-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => {
                if (searchParams.toString().length > 0) {
                  router.back()
                } else {
                  router.push('/search')
                }
              }}
              aria-label="戻る"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl gt-pressable bg-gradient-to-br from-[var(--gt-primary)] via-[var(--gt-primary)] to-[var(--gt-primary-strong)] text-white flex items-center justify-center shadow-[0_22px_40px_-26px_rgba(189,101,78,0.52)] transition-all hover:-translate-y-[2px]"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-[color:var(--foreground)]">検索結果</h2>
              <p className="gt-body-muted text-xs sm:text-sm">
                {(() => {
                  const nearby = searchParams.get('nearby') === '1'
                  if (nearby) {
                    const r = searchParams.get('radius') || '5'
                    return `現在地から半径${r}km`
                  }
                  return getTotalConditionsCount() > 0
                    ? `${getTotalConditionsCount()}件の条件で検索`
                    : 'おすすめのジムをご紹介'
                })()}
              </p>
            </div>
            <div className="hidden sm:flex gt-chip gt-chip--primary text-sm sm:text-base items-center">
              <MapPin className="w-4 h-4" />
              <span className="font-semibold">{gyms.length}件のジム</span>
            </div>
          </div>

          {error && (
            <div className="gt-layer p-3 border border-[rgba(231,103,76,0.22)] bg-[rgba(231,103,76,0.08)] text-[color:var(--gt-secondary-strong)] rounded-2xl text-sm">
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
          )}

          {(getTotalConditionsCount() > 0 || searchParams.get('searchType')) && (
            <div className="gt-layer p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="gt-label-lg text-[color:var(--foreground)]">検索条件</h3>
                <button
                  type="button"
                  onClick={() => {
                    clearAllConditions()
                    router.push('/search/results')
                  }}
                  className="gt-pill-label text-[color:var(--gt-secondary-strong)] hover:text-[color:var(--gt-secondary-strong)]"
                >
                  すべてクリア
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchParams.get('searchType') && (
                  <>
                    {searchParams.get('muscle') && (
                      <span className="gt-chip gt-chip--primary text-[11px] sm:text-xs">
                        🏋️ 部位: {searchParams.get('muscle')}
                      </span>
                    )}
                    {searchParams.get('maker') && (
                      <span className="gt-chip gt-chip--secondary text-[11px] sm:text-xs">
                        🏭 メーカー: {searchParams.get('maker')}
                      </span>
                    )}
                    {searchParams.get('name') && (
                      <span className="gt-chip text-[11px] sm:text-xs" style={{ background: 'rgba(255, 166, 77, 0.15)', borderColor: 'rgba(255, 166, 77, 0.35)', color: 'var(--gt-primary-strong)' }}>
                        🎯 マシン: {searchParams.get('name')}
                      </span>
                    )}
                  </>
                )}
                {selectedConditions.machines.map((machine, index) => (
                  <button
                    type="button"
                    key={`machine-${index}-${machine.name}`}
                    onClick={() => removeCondition('machines', machine.name)}
                    className="gt-chip gt-chip--secondary text-[11px] sm:text-xs"
                  >
                    <span>{machine.name}</span>
                    {machine.count > 1 && (
                      <span className="font-semibold">×{machine.count}</span>
                    )}
                    <X className="w-3 h-3" />
                  </button>
                ))}
                {selectedConditions.freeWeights.map((weight, index) => (
                  <button
                    type="button"
                    key={`weight-${index}-${weight.name}`}
                    onClick={() => removeCondition('freeWeights', weight.name)}
                    className="gt-chip gt-chip--primary text-[11px] sm:text-xs"
                  >
                    <span>{weight.name}</span>
                    {weight.count > 1 && (
                      <span className="font-semibold">×{weight.count}</span>
                    )}
                    <X className="w-3 h-3" />
                  </button>
                ))}
                {selectedConditions.facilities.map((facility, index) => (
                  <button
                    type="button"
                    key={`facility-${index}-${facility}`}
                    onClick={() => removeCondition('facilities', facility)}
                    className="gt-chip text-[11px] sm:text-xs"
                    style={{ background: 'rgba(56, 215, 167, 0.18)', borderColor: 'rgba(56, 215, 167, 0.35)', color: 'var(--gt-tertiary-strong)' }}
                  >
                    <span>{facility}</span>
                    <X className="w-3 h-3" />
                  </button>
                ))}
              </div>
              {getTotalConditionsCount() > 1 && (
                <div className="mt-3 pt-2 border-t border-white/50">
                  <p className="gt-body-muted text-[11px] sm:text-xs">
                    条件が多すぎる場合は、いくつか削除してみてください
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden sm:block gt-label-lg text-[color:var(--foreground)]">表示形式</span>
              <div className="gt-tab-track flex">
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`gt-tab gt-pill-label flex items-center gap-1 ${viewMode === 'map' ? 'gt-tab-active' : 'gt-tab-inactive'}`}
                >
                  <MapIcon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${viewMode === 'map' ? 'text-[color:var(--gt-secondary-strong)]' : 'text-[color:var(--text-muted)]'}`} />
                  地図
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`gt-tab gt-pill-label flex items-center gap-1 ${viewMode === 'list' ? 'gt-tab-active' : 'gt-tab-inactive'}`}
                >
                  <List className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${viewMode === 'list' ? 'text-[color:var(--gt-secondary-strong)]' : 'text-[color:var(--text-muted)]'}`} />
                  リスト
                </button>
              </div>
            </div>

            <div className="relative" ref={sortControlRef}>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  setSortDropdownOpen(!sortDropdownOpen)
                }}
              className="flex items-center gap-1 sm:gap-2 gt-pressable border-2 border-[rgba(186,122,103,0.32)] hover:border-[rgba(231,103,76,0.38)] rounded-2xl bg-white/80 px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-[0_12px_32px_-26px_rgba(189,101,78,0.38)] hover:-translate-y-[1px] transition-all"
              >
                {sortBy === 'distance' ? (
                  <Navigation className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[color:var(--gt-secondary-strong)]" />
                ) : sortBy === 'rating' ? (
                  <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[color:var(--gt-secondary-strong)]" />
                ) : (
                  <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[color:var(--gt-secondary-strong)]" />
                )}
                <span className="gt-pill-label text-[10px] sm:text-xs text-[color:var(--foreground)]">
                  {sortBy === 'distance' ? '近い順' :
                   sortBy === 'rating' ? '評価の高い順' :
                   'イキタイの多い順'}
                </span>
                <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-[color:var(--text-muted)] transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {sortDropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-2 gt-card p-1 w-44 z-50"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      setSortBy('popular')
                      setSortDropdownOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2 gt-pressable transition-colors ${sortBy === 'popular' ? 'bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-primary-strong)] text-white' : 'text-[color:var(--text-muted)] hover:bg-[rgba(231,103,76,0.08)]'}`}
                  >
                    <Heart className="w-3 h-3" />
                    イキタイの多い順
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      if (!userLocation) return
                      setSortBy('distance')
                      setSortDropdownOpen(false)
                    }}
                    disabled={!userLocation}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2 gt-pressable transition-colors ${sortBy === 'distance' ? 'bg-gradient-to-r from-[var(--gt-secondary)] to-[var(--gt-secondary)] text-white' : 'text-[color:var(--text-muted)] hover:bg-[rgba(231,103,76,0.08)]'} ${!userLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Navigation className="w-3 h-3" />
                    近い順
                    {!userLocation && <span className="text-[10px] text-[color:var(--text-muted)] ml-auto">要位置情報</span>}
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      setSortBy('rating')
                      setSortDropdownOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2 gt-pressable transition-colors ${sortBy === 'rating' ? 'bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white' : 'text-[color:var(--text-muted)] hover:bg-[rgba(231,103,76,0.08)]'}`}
                  >
                    <Star className="w-3 h-3" />
                    評価の高い順
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Content Views */}
      {viewMode === 'map' ? (
        // Uber-style Map with Bottom Sheet (keeps all UI above)
        <UberStyleMapView
          gyms={gyms.filter(gym => gym.latitude && gym.longitude) as DatabaseGym[]}
          userLocation={userLocation}
          onGymSelect={(gym) => {
            setSelectedGymId(gym.id);
          }}
          onBackToList={() => setViewMode('list')}
        />
      ) : (
        // List View Container
        <div className="max-w-7xl mx-auto px-4 pb-10">
          <div className="space-y-4 sm:space-y-5">
            {gyms.length === 0 ? (
              <div className="gt-card p-8 text-center">
                <p className="gt-body text-[color:var(--text-subtle)]">検索条件に一致するジムが見つかりませんでした</p>
              </div>
            ) : (
              gyms.map((gym) => {
                const isSelected = selectedGymForMap?.id === gym.id
                return (
                  <div
                    key={gym.id}
                    className={`gt-card p-4 sm:p-6 transition-all ${isSelected ? 'ring-2 ring-[rgba(231,103,76,0.32)]' : 'hover:-translate-y-[3px]'}`}
                  >
                    <div className="flex gap-3 sm:gap-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex-shrink-0 overflow-hidden border border-white/60 bg-white/70">
                        <img
                          src={gym.image}
                          alt={gym.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop'
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="text-base sm:text-lg font-bold text-[color:var(--foreground)]">{gym.name}</h3>
                            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-[color:var(--text-muted)] mt-1">
                              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{gym.location}</span>
                            </div>
                            {gym.address && (
                              <p className="gt-body-muted mt-1">{gym.address}</p>
                            )}
                            {sortBy === 'distance' && gym.distanceFromUser && (
                              <p className="text-xs text-[color:var(--gt-primary-strong)] font-medium mt-1">
                                現在地から {gym.distanceFromUser.toFixed(1)}km
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-1 text-[color:var(--text-muted)]">
                                <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${gym.isLiked ? 'fill-[color:var(--gt-primary)] text-[color:var(--gt-primary)]' : ''}`} />
                                <span className="text-xs sm:text-sm font-semibold text-[color:var(--foreground)]">{gym.likes}</span>
                              </div>
                              <span className="text-base sm:text-lg font-bold text-[color:var(--gt-primary-strong)]">{gym.price}</span>
                            </div>
                          </div>
                          <div className="hidden sm:flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => toggleLike(gym.id)}
                              disabled={processingLikes.has(gym.id)}
                              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold gt-pressable transition-all ${
                                gym.isLiked
                                  ? 'bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-primary-strong)] text-white'
                                  : 'bg-white/80 text-[color:var(--foreground)] border border-white/60 hover:-translate-y-[2px]'
                              } ${processingLikes.has(gym.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <Heart className={`w-3 h-3 sm:w-4 sm:h-4 inline mr-1 ${gym.isLiked ? 'fill-white' : 'text-[color:var(--gt-secondary-strong)]'}`} />
                              {processingLikes.has(gym.id) ? '処理中...' : (gym.isLiked ? 'イキタイ済み' : 'イキタイ')}
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedGymId(gym.id)}
                              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-primary-strong)] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-[0_18px_36px_-26px_rgba(189,101,78,0.46)] hover:-translate-y-[2px] transition-all"
                            >
                              詳細を見る
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3 sm:hidden">
                          <button
                            type="button"
                            onClick={() => toggleLike(gym.id)}
                            disabled={processingLikes.has(gym.id)}
                            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold gt-pressable transition-all ${
                              gym.isLiked
                                ? 'bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-primary-strong)] text-white'
                                : 'bg-white/80 text-[color:var(--foreground)] border border-white/60'
                            } ${processingLikes.has(gym.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Heart className={`w-3 h-3 inline mr-1 ${gym.isLiked ? 'fill-white' : 'text-[color:var(--gt-secondary-strong)]'}`} />
                            {processingLikes.has(gym.id) ? '処理中...' : (gym.isLiked ? 'イキタイ済み' : 'イキタイ')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedGymId(gym.id)}
                            className="flex-1 py-1.5 bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-primary-strong)] text-white rounded-xl text-xs font-semibold shadow-[0_14px_30px_-24px_rgba(189,101,78,0.44)]"
                          >
                            詳細を見る
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
      
      {/* Gym Detail Modal */}
      <GymDetailModal 
        isOpen={selectedGymId !== null}
        onClose={() => setSelectedGymId(null)}
        gymId={selectedGymId || ''}
      />
    </div>
  )
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="gt-card px-10 py-8 text-center space-y-4">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto"
            style={{ borderColor: 'var(--gt-primary-strong)', borderTopColor: 'transparent' }}
          />
          <p className="gt-body text-[color:var(--text-subtle)]">検索結果を読み込み中...</p>
        </div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  )
}
