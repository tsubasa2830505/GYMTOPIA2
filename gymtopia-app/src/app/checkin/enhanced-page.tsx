'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { MapPin, Trophy, Target, Calendar, ChevronRight, Shield, Award } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'

interface NearbyGym {
  id: string
  name: string
  address: string
  distance: number
  image_url?: string
  latitude: number
  longitude: number
  checkedInBefore?: boolean
  checkInCount?: number
  lastCheckIn?: string
}

interface CheckInStats {
  streak: number
  totalCheckIns: number
  uniqueGyms: number
  thisWeek: number
  rareGyms: number // レアジム訪問数
  cityCount: number // 訪問都市数
}

interface CheckIn {
  id: string
  gym_id: string
  gym_name: string
  checked_in_at: string
  note: string | null
  verified: boolean // 位置情報検証済み
  distance_from_gym: number // ジムからの距離
}

// 位置情報検証の閾値（メートル）
const MAX_CHECKIN_DISTANCE = 100 // 100m以内でないとチェックイン不可
const WARNING_DISTANCE = 50 // 50m以上離れていると警告

export default function EnhancedCheckInPage() {
  const router = useRouter()
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [nearbyGyms, setNearbyGyms] = useState<NearbyGym[]>([])
  const [stats, setStats] = useState<CheckInStats>({
    streak: 0,
    totalCheckIns: 0,
    uniqueGyms: 0,
    thisWeek: 0,
    rareGyms: 0,
    cityCount: 0
  })
  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState<string | null>(null)
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null)
  const [gymCollection, setGymCollection] = useState<Set<string>>(new Set())

  useEffect(() => {
    // 高精度位置情報を取得
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          setLocationAccuracy(position.coords.accuracy)

          // 精度が悪い場合は警告
          if (position.coords.accuracy > 50) {
            console.warn('位置情報の精度が低い:', position.coords.accuracy, 'm')
          }

          await fetchNearbyGyms(location)
          setLoading(false)
        },
        (error) => {
          console.error('位置情報取得エラー:', error)
          setLoading(false)
        },
        {
          enableHighAccuracy: true, // 高精度モード
          timeout: 10000,
          maximumAge: 0 // キャッシュを使わない
        }
      )
    }
  }, [])

  // Haversine距離計算（メートル単位）
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000 // 地球の半径（メートル）
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // 近くのジムを取得
  const fetchNearbyGyms = async (location: { lat: number; lng: number }) => {
    try {
      const supabase = getSupabaseClient()
      const { data: gymRows, error: gymError } = await supabase
        .from('gyms')
        .select('*')
        .limit(50) // より多くのジムを取得して距離でフィルタリング

      if (gymError) throw gymError

      // 実際の距離を計算してフィルタリング
      const gymsWithRealDistance = (gymRows || [])
        .map((gym: any) => {
          const distance = calculateDistance(
            location.lat,
            location.lng,
            gym.latitude || location.lat,
            gym.longitude || location.lng
          )
          return {
            id: gym.id,
            name: gym.name,
            address: gym.address || `${gym.prefecture} ${gym.city}`,
            distance: distance,
            image_url: gym.image_url || (gym.images && gym.images[0]),
            latitude: gym.latitude || location.lat,
            longitude: gym.longitude || location.lng,
            checkedInBefore: false,
            checkInCount: 0
          }
        })
        .filter(gym => gym.distance <= 5000) // 5km以内のジムのみ
        .sort((a: NearbyGym, b: NearbyGym) => a.distance - b.distance)

      setNearbyGyms(gymsWithRealDistance)
      await loadCheckInData(gymsWithRealDistance.map(g => g.id))
    } catch (error) {
      console.error('Error fetching nearby gyms:', error)
    }
  }

  // チェックインデータと統計を読み込み
  const loadCheckInData = async (gymIds: string[]) => {
    try {
      const supabase = getSupabaseClient()
      const demoUserId = '0ab7b9a0-fbf6-447c-9af5-ff5b12e92fa8'

      // チェックイン履歴を取得
      const { data: checkIns, error: checkInError } = await supabase
        .from('check_ins')
        .select(`
          *,
          gyms (
            id,
            name,
            prefecture,
            city,
            visit_count
          )
        `)
        .eq('user_id', demoUserId)
        .order('checked_in_at', { ascending: false })

      if (checkInError) throw checkInError

      // コレクション（訪問済みジム）を設定
      const visitedGyms = new Set(checkIns?.map(c => c.gym_id) || [])
      setGymCollection(visitedGyms)

      // 統計を計算
      if (checkIns && checkIns.length > 0) {
        const uniqueGyms = new Set(checkIns.map(c => c.gym_id)).size
        const uniqueCities = new Set(checkIns.map(c => `${c.gyms?.prefecture}-${c.gyms?.city}`)).size

        // レアジム（訪問者が少ないジム）をカウント
        const rareGyms = checkIns.filter(c => (c.gyms?.visit_count || 0) < 100).length

        // 今週のチェックイン
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const thisWeek = checkIns.filter(c => new Date(c.checked_in_at) > weekAgo).length

        // 連続日数を計算
        const streak = calculateStreak(checkIns.map(c => c.checked_in_at))

        setStats({
          streak,
          totalCheckIns: checkIns.length,
          uniqueGyms,
          thisWeek,
          rareGyms,
          cityCount: uniqueCities
        })

        // 最近のチェックイン（検証フラグ付き）
        const recent = checkIns.slice(0, 10).map((c: any) => ({
          id: c.id,
          gym_id: c.gym_id,
          gym_name: c.gyms?.name || 'Unknown Gym',
          checked_in_at: c.checked_in_at,
          note: c.note,
          verified: c.distance_from_gym ? c.distance_from_gym < MAX_CHECKIN_DISTANCE : false,
          distance_from_gym: c.distance_from_gym || 0
        }))
        setRecentCheckIns(recent)
      }
    } catch (error) {
      console.error('Error loading check-in data:', error)
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

  // チェックイン処理（厳密な位置検証付き）
  const handleCheckIn = async (gymId: string) => {
    if (!userLocation) {
      alert('位置情報を取得できません')
      return
    }

    setCheckingIn(gymId)

    try {
      const gym = nearbyGyms.find(g => g.id === gymId)
      if (!gym) {
        alert('ジム情報が見つかりません')
        return
      }

      // 距離を再計算して検証
      const actualDistance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        gym.latitude,
        gym.longitude
      )

      // 距離チェック
      if (actualDistance > MAX_CHECKIN_DISTANCE) {
        alert(`ジムから${Math.round(actualDistance)}m離れています。\n100m以内に近づいてチェックインしてください。`)
        setCheckingIn(null)
        return
      }

      // 警告表示（50m以上の場合）
      if (actualDistance > WARNING_DISTANCE) {
        const confirmCheckIn = confirm(
          `ジムから${Math.round(actualDistance)}m離れています。\n本当にチェックインしますか？`
        )
        if (!confirmCheckIn) {
          setCheckingIn(null)
          return
        }
      }

      const supabase = getSupabaseClient()
      const demoUserId = '0ab7b9a0-fbf6-447c-9af5-ff5b12e92fa8'

      // チェックインを保存（距離情報付き）
      const { data, error } = await supabase
        .from('check_ins')
        .insert({
          user_id: demoUserId,
          gym_id: gymId,
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          distance_from_gym: actualDistance,
          location_accuracy: locationAccuracy,
          note: null
        })
        .select('*, gyms(name)')
        .single()

      if (error) throw error

      // コレクションに追加
      setGymCollection(prev => new Set([...prev, gymId]))

      // 統計を更新
      setStats(prev => ({
        ...prev,
        totalCheckIns: prev.totalCheckIns + 1,
        thisWeek: prev.thisWeek + 1,
        uniqueGyms: gymCollection.size + 1
      }))

      // 成功通知
      alert(`✅ ${gym.name}にチェックインしました！\n距離: ${Math.round(actualDistance)}m`)

    } catch (error) {
      console.error('Check-in error:', error)
      alert('チェックインに失敗しました')
    } finally {
      setCheckingIn(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー with 実績バッジ */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">チェックイン</h1>
              <p className="text-blue-100 text-sm">位置情報で実績を記録</p>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-xs text-green-400">位置認証</span>
            </div>
          </div>

          {/* 統計カード */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-300" />
              <div className="text-2xl font-bold">{stats.uniqueGyms}</div>
              <div className="text-xs text-blue-100">開拓ジム</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <Award className="w-5 h-5 mx-auto mb-1 text-purple-300" />
              <div className="text-2xl font-bold">{stats.rareGyms}</div>
              <div className="text-xs text-blue-100">レアジム</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <MapPin className="w-5 h-5 mx-auto mb-1 text-green-300" />
              <div className="text-2xl font-bold">{stats.cityCount}</div>
              <div className="text-xs text-blue-100">訪問都市</div>
            </div>
          </div>
        </div>
      </div>

      {/* 位置情報精度表示 */}
      {locationAccuracy && (
        <div className="px-4 py-2 bg-white border-b">
          <div className="max-w-4xl mx-auto flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${locationAccuracy < 20 ? 'bg-green-500' : locationAccuracy < 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
            <span className="text-gray-600">
              位置精度: ±{Math.round(locationAccuracy)}m
            </span>
          </div>
        </div>
      )}

      {/* 近くのジム一覧 */}
      <div className="max-w-4xl mx-auto p-4">
        <h2 className="text-lg font-bold text-gray-900 mb-3">近くのジム（100m以内でチェックイン可能）</h2>

        <div className="space-y-4">
          {nearbyGyms.map((gym) => {
            const canCheckIn = gym.distance <= MAX_CHECKIN_DISTANCE
            const isCollected = gymCollection.has(gym.id)

            return (
              <div
                key={gym.id}
                className={`bg-white rounded-xl p-4 shadow-sm border ${
                  isCollected ? 'border-green-200 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex gap-4">
                  <div className="relative">
                    {gym.image_url ? (
                      <Image
                        src={gym.image_url}
                        alt={gym.name}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    {isCollected && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                        <Trophy className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{gym.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{gym.address}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`font-medium ${
                        gym.distance <= MAX_CHECKIN_DISTANCE ? 'text-green-600' :
                        gym.distance <= 500 ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                        {gym.distance < 1000
                          ? `${Math.round(gym.distance)}m`
                          : `${(gym.distance / 1000).toFixed(1)}km`
                        }
                      </span>
                      {isCollected && (
                        <span className="text-green-600">訪問済み</span>
                      )}
                    </div>

                    {canCheckIn ? (
                      <button
                        onClick={() => handleCheckIn(gym.id)}
                        disabled={checkingIn === gym.id || isCollected}
                        className={`mt-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          isCollected
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : checkingIn === gym.id
                            ? 'bg-gray-300 text-gray-600'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg'
                        }`}
                      >
                        {isCollected ? '取得済み' : checkingIn === gym.id ? 'チェックイン中...' : 'チェックイン'}
                      </button>
                    ) : (
                      <div className="mt-2 text-sm text-gray-500">
                        もっと近づいてください
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* コレクション進捗 */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">ジムコレクション</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>開拓進捗</span>
                <span>{stats.uniqueGyms} / 500 ジム</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                  style={{ width: `${Math.min((stats.uniqueGyms / 500) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">連続記録</div>
                <div className="text-xl font-bold text-gray-900">{stats.streak}日</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">今週</div>
                <div className="text-xl font-bold text-gray-900">{stats.thisWeek}回</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">総回数</div>
                <div className="text-xl font-bold text-gray-900">{stats.totalCheckIns}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}