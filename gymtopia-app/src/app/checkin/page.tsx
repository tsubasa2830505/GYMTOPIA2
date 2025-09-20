'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { MapPin, Navigation, Clock, Trophy, Calendar, Users, ChevronRight, Loader2, Check, Shield, Award } from 'lucide-react'
import Header from '@/components/Header'
import { searchGymsNearby } from '@/lib/supabase/search'
import { getSupabaseClient } from '@/lib/supabase/client'
import { performGPSCheckin, findNearbyGyms, type BadgeEarned } from '@/lib/supabase/checkin'
import { getAccuratePosition, type Coordinates } from '@/lib/gps-verification'

interface NearbyGym {
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

interface CheckInStats {
  streak: number
  totalCheckIns: number
  uniqueGyms: number
  thisWeek: number
}

interface CheckIn {
  id: string
  gym_id: string
  gym_name: string
  checked_in_at: string
  note?: string
}

export default function CheckInPage() {
  const router = useRouter()
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [nearbyGyms, setNearbyGyms] = useState<NearbyGym[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState<string | null>(null)
  const [checkedInGyms, setCheckedInGyms] = useState<Set<string>>(new Set())
  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([])
  const [stats, setStats] = useState<CheckInStats>({
    streak: 0,
    totalCheckIns: 0,
    uniqueGyms: 0,
    thisWeek: 0
  })
  const [locationError, setLocationError] = useState<string | null>(null)
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null)
  const [newBadges, setNewBadges] = useState<BadgeEarned[]>([])
  const [showBadgeModal, setShowBadgeModal] = useState(false)

  // Get user location with high accuracy
  useEffect(() => {
    const getHighAccuracyLocation = async () => {
      setLoading(true)
      try {
        const position = await getAccuratePosition(3, {
          maxDistance: 100,
          requiredAccuracy: 50,
          timeoutMs: 15000,
          enableHighAccuracy: true
        })

        const location = {
          lat: position.latitude,
          lng: position.longitude
        }

        setUserLocation(location)
        setGpsAccuracy(position.accuracy || null)
        await fetchNearbyGyms(location)
      } catch (error) {
        console.error('GPS error:', error)
        if (error instanceof Error) {
          if (error.message.includes('permission')) {
            setLocationError('位置情報へのアクセスが拒否されました。ブラウザの設定から位置情報を許可してください。')
          } else if (error.message.includes('accuracy')) {
            setLocationError('GPS精度が不十分です。屋外または窓の近くで再試行してください。')
          } else {
            setLocationError('位置情報を取得できませんでした。GPS機能を確認してください。')
          }
        } else {
          setLocationError('位置情報サービスがご利用いただけません。')
        }
        setLoading(false)
      }
    }

    getHighAccuracyLocation()
  }, [])

  // Fetch nearby gyms using GPS-based search
  const fetchNearbyGyms = async (location: { lat: number; lng: number }) => {
    try {
      const userCoords: Coordinates = {
        latitude: location.lat,
        longitude: location.lng
      }

      const { data: nearbyGymData, error } = await findNearbyGyms(userCoords, 2, 20)

      if (error) {
        console.error('Error fetching nearby gyms:', error)
        // フォールバック: 従来の方法
        await fetchNearbyGymsFromDb(location)
        return
      }

      const gymsWithDistance = (nearbyGymData || []).map((gym: any) => ({
        id: gym.id,
        name: gym.name,
        address: gym.address,
        distance: gym.distance_meters / 1000, // Convert to km
        image_url: gym.image_url,
        latitude: gym.latitude,
        longitude: gym.longitude,
        rarity_level: gym.rarity_level,
        rarity_tags: gym.rarity_tags,
        total_checkins: gym.total_checkins,
        checkedInToday: false // Will be checked in loadCheckInData
      }))

      setNearbyGyms(gymsWithDistance)
      await loadCheckInData()
    } catch (error) {
      console.error('Error fetching nearby gyms:', error)
      await fetchNearbyGymsFromDb(location)
    } finally {
      setLoading(false)
    }
  }

  // Fallback method for fetching gyms
  const fetchNearbyGymsFromDb = async (location: { lat: number; lng: number }) => {
    try {
      const supabase = getSupabaseClient()
      const { data: gymRows, error: gymError } = await supabase
        .from('gyms')
        .select(`
          id, name, address, latitude, longitude, images,
          gym_rarities (rarity_level, rarity_tags)
        `)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .limit(20)

      if (gymError) throw gymError

      const gymsWithDistance = (gymRows || []).map((gym: any) => {
        const distance = gym.latitude && gym.longitude
          ? Math.sqrt(
              Math.pow((gym.latitude - location.lat) * 111, 2) +
              Math.pow((gym.longitude - location.lng) * 111 * Math.cos(location.lat * Math.PI / 180), 2)
            )
          : Math.random() * 3 + 0.5

        return {
          id: gym.id,
          name: gym.name,
          address: gym.address || '住所未設定',
          distance,
          image_url: gym.images?.[0],
          latitude: gym.latitude || location.lat,
          longitude: gym.longitude || location.lng,
          rarity_level: gym.gym_rarities?.rarity_level || 'common',
          rarity_tags: gym.gym_rarities?.rarity_tags || [],
          checkedInToday: false
        }
      }).sort((a, b) => a.distance - b.distance)

      setNearbyGyms(gymsWithDistance)
    } catch (error) {
      console.error('Fallback gym fetch error:', error)
    }
  }

  // Load check-in data and stats
  const loadCheckInData = async () => {
    try {
      const supabase = getSupabaseClient()

      // デモモードでユーザーIDを固定
      const demoUserId = '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'

      // 最近のチェックインを取得
      const { data: checkIns, error: checkInsError } = await supabase
        .from('gym_checkins')
        .select('*, gyms(name)')
        .eq('user_id', demoUserId)
        .order('checked_in_at', { ascending: false })
        .limit(10)

      if (!checkInsError && checkIns) {
        const formattedCheckIns = checkIns.map((ci: any) => ({
          id: ci.id,
          gym_id: ci.gym_id,
          gym_name: ci.gyms?.name || 'Unknown Gym',
          checked_in_at: ci.checked_in_at,
          note: ci.note
        }))
        setRecentCheckIns(formattedCheckIns)

        // 今日チェックインしたジムをマーク
        const today = new Date().toISOString().split('T')[0]
        const todaysCheckIns = checkIns.filter((ci: any) =>
          ci.checked_in_at.startsWith(today)
        )
        setCheckedInGyms(new Set(todaysCheckIns.map((ci: any) => ci.gym_id)))
      }

      // 統計を計算
      const { data: statsData } = await supabase
        .from('gym_checkins')
        .select('gym_id, checked_in_at')
        .eq('user_id', demoUserId)

      if (statsData) {
        const uniqueGyms = new Set(statsData.map((s: any) => s.gym_id)).size
        const totalCheckIns = statsData.length

        // 今週のチェックイン数を計算
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const thisWeek = statsData.filter((s: any) =>
          new Date(s.checked_in_at) > weekAgo
        ).length

        // 連続日数を計算（簡易版）
        const streak = calculateStreak(statsData.map((s: any) => s.checked_in_at))

        setStats({
          streak,
          totalCheckIns,
          uniqueGyms,
          thisWeek
        })
      }
    } catch (error) {
      console.error('Error loading check-in data:', error)
      // デモデータを設定
      setStats({
        streak: 7,
        totalCheckIns: 45,
        uniqueGyms: 12,
        thisWeek: 5
      })
    }
  }

  // 連続日数を計算
  const calculateStreak = (dates: string[]): number => {
    if (!dates.length) return 0

    const sortedDates = dates
      .map(d => new Date(d).toISOString().split('T')[0])
      .sort()
      .reverse()

    const uniqueDates = Array.from(new Set(sortedDates))

    let streak = 0
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    // 今日か昨日にチェックインがある場合のみ連続とみなす
    if (uniqueDates[0] === today || uniqueDates[0] === yesterdayStr) {
      streak = 1
      const currentDate = new Date(uniqueDates[0])

      for (let i = 1; i < uniqueDates.length; i++) {
        currentDate.setDate(currentDate.getDate() - 1)
        const expectedDate = currentDate.toISOString().split('T')[0]

        if (uniqueDates[i] === expectedDate) {
          streak++
        } else {
          break
        }
      }
    }

    return streak
  }

  // Handle GPS-verified check-in
  const handleCheckIn = async (gymId: string) => {
    if (!userLocation) {
      alert('位置情報が取得できていません。')
      return
    }

    setCheckingIn(gymId)

    try {
      const demoUserId = '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'
      const gym = nearbyGyms.find(g => g.id === gymId)

      if (!gym) {
        throw new Error('ジム情報が見つかりません')
      }

      // GPS認証付きチェックイン実行
      const result = await performGPSCheckin(
        demoUserId,
        gymId,
        {
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          accuracy: gpsAccuracy || undefined
        },
        {
          crowdLevel: 'normal' // TODO: ユーザーに選択させる
        }
      )

      if (!result.success) {
        if (result.verification && !result.verification.isValid) {
          const distance = Math.round(result.verification.distance)
          alert(`チェックインできませんでした。\nジムから${distance}m離れています。\n（許可範囲: ${Math.round(result.verification.maxAllowedDistance)}m）`)
        } else {
          alert(`チェックインに失敗しました: ${result.error}`)
        }
        return
      }

      // チェックイン成功
      setCheckedInGyms(prev => new Set([...prev, gymId]))

      // 新しいバッジがある場合は表示
      if (result.badges_earned && result.badges_earned.length > 0) {
        setNewBadges(result.badges_earned)
        setShowBadgeModal(true)
      }

      // 最近のチェックインに追加
      const newCheckIn: CheckIn = {
        id: result.checkin_id || '',
        gym_id: gymId,
        gym_name: gym.name,
        checked_in_at: new Date().toISOString(),
        note: undefined
      }
      setRecentCheckIns(prev => [newCheckIn, ...prev].slice(0, 10))

      // 統計を更新
      setStats(prev => ({
        ...prev,
        totalCheckIns: prev.totalCheckIns + 1,
        thisWeek: prev.thisWeek + 1
      }))

    } catch (error) {
      console.error('GPS check-in error:', error)
      alert('チェックインに失敗しました。再度お試しください。')
    } finally {
      setCheckingIn(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgba(231,103,76,0.08)] to-[rgba(240,142,111,0.1)]">
      <Header />

      {/* Hero Section with Stats */}
      <div className="relative bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">チェックイン</h1>
          <p className="text-[rgba(255,240,234,0.85)] text-sm mb-6">ジムに到着したらチェックインしよう</p>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{stats.streak}</div>
              <div className="text-xs text-[rgba(255,240,234,0.85)]">連続日数</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{stats.totalCheckIns}</div>
              <div className="text-xs text-[rgba(255,240,234,0.85)]">総回数</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{stats.uniqueGyms}</div>
              <div className="text-xs text-[rgba(255,240,234,0.85)]">開拓ジム</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{stats.thisWeek}</div>
              <div className="text-xs text-[rgba(255,240,234,0.85)]">今週</div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Status */}
      <div className="px-4 py-3 bg-white border-b">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[color:var(--gt-secondary-strong)]" />
                <span className="text-[color:var(--text-muted)]">高精度GPS取得中...</span>
              </>
            ) : locationError ? (
              <>
                <MapPin className="w-4 h-4 text-red-500" />
                <span className="text-red-600">{locationError}</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 text-[color:var(--gt-secondary)]" />
                <span className="text-[color:var(--text-muted)]">現在地から2km以内のジム</span>
              </>
            )}
          </div>
          {gpsAccuracy && !loading && !locationError && (
            <div className="flex items-center gap-1 text-xs">
              <div className={`w-2 h-2 rounded-full ${
                gpsAccuracy <= 10 ? 'bg-green-500' :
                gpsAccuracy <= 30 ? 'bg-yellow-500' : 'bg-orange-500'
              }`}></div>
              <span className="text-[color:var(--text-subtle)]">GPS精度: {Math.round(gpsAccuracy)}m</span>
            </div>
          )}
        </div>
      </div>

      {/* Nearby Gyms List */}
      <div className="max-w-4xl mx-auto p-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-[rgba(254,255,250,0.9)] rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-[rgba(254,255,250,0.9)] rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-[rgba(254,255,250,0.9)] rounded w-1/2 mb-2"></div>
                    <div className="h-10 bg-[rgba(254,255,250,0.9)] rounded-full w-32"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : nearbyGyms.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <MapPin className="w-12 h-12 text-[rgba(68,73,73,0.4)] mx-auto mb-4" />
            <p className="text-[color:var(--text-muted)] mb-2">周辺にジムが見つかりませんでした</p>
            <p className="text-[rgba(68,73,73,0.6)] text-sm">移動して再度お試しください</p>
          </div>
        ) : (
          <div className="space-y-4">
            {nearbyGyms.map((gym) => (
              <div
                key={gym.id}
                className={`bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all ${
                  checkedInGyms.has(gym.id) ? 'border-2 border-[color:var(--gt-secondary)]' : ''
                }`}
              >
                <div className="flex gap-4">
                  {/* Gym Image */}
                  <div className="w-20 h-20 bg-[rgba(254,255,250,0.95)] rounded-lg overflow-hidden flex-shrink-0">
                    {gym.image_url ? (
                      <Image
                        src={gym.image_url}
                        alt={gym.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-[rgba(68,73,73,0.4)]" />
                      </div>
                    )}
                  </div>

                  {/* Gym Info */}
                  <div className="flex-1">
                    <h3 className="font-bold text-[color:var(--foreground)] mb-1">{gym.name}</h3>
                    <p className="text-sm text-[color:var(--text-muted)] mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {gym.address}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-[color:var(--text-muted)]">
                      <span className="flex items-center gap-1">
                        <Navigation className="w-3 h-3" />
                        {gym.distance.toFixed(1)}km
                      </span>
                      {gym.rarity_level && gym.rarity_level !== 'common' && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          gym.rarity_level === 'mythical' ? 'bg-purple-100 text-purple-700' :
                          gym.rarity_level === 'legendary' ? 'bg-yellow-100 text-yellow-700' :
                          gym.rarity_level === 'rare' ? 'bg-blue-100 text-blue-700' : ''
                        }`}>
                          {gym.rarity_level === 'mythical' ? '💎 神話級' :
                           gym.rarity_level === 'legendary' ? '👑 伝説級' :
                           gym.rarity_level === 'rare' ? '⭐ レア' : ''}
                        </span>
                      )}
                      {checkedInGyms.has(gym.id) && (
                        <span className="text-[color:var(--gt-secondary-strong)] font-medium flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          チェックイン済み
                        </span>
                      )}
                    </div>

                    {/* Check-in Button */}
                    <button
                      onClick={() => handleCheckIn(gym.id)}
                      disabled={checkingIn === gym.id || checkedInGyms.has(gym.id)}
                      className={`mt-3 px-6 py-2 rounded-full font-medium transition-all ${
                        checkedInGyms.has(gym.id)
                          ? 'bg-[rgba(240,142,111,0.16)] text-[color:var(--gt-secondary-strong)] cursor-default'
                          : checkingIn === gym.id
                          ? 'bg-[rgba(254,255,250,0.95)] text-[rgba(68,73,73,0.6)] cursor-wait'
                          : 'bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white hover:shadow-lg active:scale-95'
                      }`}
                    >
                      {checkingIn === gym.id ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          チェックイン中...
                        </span>
                      ) : checkedInGyms.has(gym.id) ? (
                        <span className="flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          完了
                        </span>
                      ) : (
                        'チェックイン'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Check-ins Section */}
        {!loading && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-[color:var(--foreground)] mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              最近のチェックイン
            </h2>
            {recentCheckIns.length > 0 ? (
              <div className="space-y-3">
                {recentCheckIns.map((checkIn) => {
                  const checkInDate = new Date(checkIn.checked_in_at)
                  const isToday = checkInDate.toDateString() === new Date().toDateString()
                  const timeStr = checkInDate.toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                  const dateStr = isToday ? '今日' : checkInDate.toLocaleDateString('ja-JP', {
                    month: 'numeric',
                    day: 'numeric'
                  })

                  return (
                    <div key={checkIn.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-[color:var(--foreground)]">{checkIn.gym_name}</h3>
                          <p className="text-sm text-[color:var(--text-muted)]">
                            {dateStr} {timeStr}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            // 投稿作成画面へ遷移（チェックインIDを渡す）
                            router.push(`/add?checkInId=${checkIn.id}&gymId=${checkIn.gym_id}&gymName=${encodeURIComponent(checkIn.gym_name)}`)
                          }}
                          className="text-[color:var(--gt-secondary-strong)] hover:bg-[rgba(231,103,76,0.08)] px-3 py-1 rounded-full text-sm font-medium transition-colors"
                        >
                          投稿する
                        </button>
                      </div>
                      {checkIn.note && (
                        <p className="mt-2 text-sm text-[color:var(--text-muted)]">{checkIn.note}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-4 text-center text-[rgba(68,73,73,0.6)]">
                <p className="text-sm">まだチェックインがありません</p>
              </div>
            )}
          </div>
        )}

        {/* Badge Achievement Modal */}
        {showBadgeModal && newBadges.length > 0 && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-[color:var(--foreground)] mb-2">バッジ獲得！</h3>
              <div className="space-y-3 mb-6">
                {newBadges.map((badge, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-[rgba(254,255,250,0.9)] rounded-xl">
                    <div className="text-2xl">{badge.badge_icon}</div>
                    <div className="text-left flex-1">
                      <div className="font-bold text-[color:var(--foreground)]">{badge.badge_name}</div>
                      <div className="text-sm text-[color:var(--text-muted)]">{badge.badge_description}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowBadgeModal(false)}
                className="w-full py-3 bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white rounded-xl font-medium"
              >
                確認
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}