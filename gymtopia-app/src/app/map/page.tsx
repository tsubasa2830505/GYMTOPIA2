'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { MapPin, Navigation, Search, Filter, X, Loader2, ExternalLink } from 'lucide-react'
import { getGyms } from '@/lib/supabase/gyms'
import type { Gym } from '@/types/gym'

export default function MapPage() {
  const [gyms, setGyms] = useState<Gym[]>([])
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [locationError, setLocationError] = useState<string | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])

  // ユーザーの現在地を取得
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
          console.error('Location error:', error)
          setLocationError('位置情報を取得できませんでした')
          // デフォルト位置（東京）を設定
          setUserLocation({ lat: 35.6762, lng: 139.6503 })
        }
      )
    } else {
      setLocationError('位置情報サービスが利用できません')
      setUserLocation({ lat: 35.6762, lng: 139.6503 })
    }
  }, [])

  // ジムデータを取得
  useEffect(() => {
    if (!userLocation) return

    const fetchGyms = async () => {
      try {
        const data = await getGyms(undefined, userLocation)
        setGyms(data)
      } catch (error) {
        console.error('Error fetching gyms:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchGyms()
  }, [userLocation])

  // Google Maps初期化
  useEffect(() => {
    if (!userLocation || !mapRef.current) return

    const loadGoogleMaps = () => {
      if (!window.google) {
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
        script.async = true
        script.defer = true
        script.onload = initMap
        document.head.appendChild(script)
      } else {
        initMap()
      }
    }

    const initMap = () => {
      if (!mapRef.current) return

      const map = new google.maps.Map(mapRef.current, {
        center: userLocation,
        zoom: 14,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      })

      setMapInstance(map)

      // 現在地マーカー
      new google.maps.Marker({
        position: userLocation,
        map: map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        },
        title: '現在地'
      })
    }

    loadGoogleMaps()
  }, [userLocation])

  // ジムマーカーを追加
  useEffect(() => {
    if (!mapInstance || gyms.length === 0) return

    // 既存のマーカーをクリア
    markers.forEach(marker => marker.setMap(null))

    const newMarkers: google.maps.Marker[] = []

    gyms.forEach(gym => {
      if (gym.latitude && gym.longitude) {
        const marker = new google.maps.Marker({
          position: { lat: gym.latitude, lng: gym.longitude },
          map: mapInstance,
          title: gym.name,
          icon: {
            url: '/gym-marker.png',
            scaledSize: new google.maps.Size(30, 30)
          }
        })

        marker.addListener('click', () => {
          setSelectedGym(gym)
        })

        newMarkers.push(marker)
      }
    })

    setMarkers(newMarkers)
  }, [mapInstance, gyms])

  // 検索結果をフィルタリング
  const filteredGyms = gyms.filter(gym =>
    gym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gym.address?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white relative">
      {/* ヘッダー */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">ジムマップ</h1>
              {locationError && (
                <span className="text-xs text-amber-600 ml-auto">{locationError}</span>
              )}
            </div>

            {/* 検索バー */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ジムを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* マップエリア */}
      <div ref={mapRef} className="w-full h-screen" />

      {/* ジムリスト（下部） */}
      <div className="absolute bottom-20 left-0 right-0 z-20">
        <div className="px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {filteredGyms.map((gym) => (
                <div
                  key={gym.id}
                  onClick={() => setSelectedGym(gym)}
                  className="flex-shrink-0 bg-white rounded-xl shadow-lg p-3 cursor-pointer hover:shadow-xl transition-shadow min-w-[250px]"
                >
                  <h3 className="font-semibold text-gray-900">{gym.name}</h3>
                  <p className="text-xs text-gray-600 mt-1">{gym.address}</p>
                  {gym.distanceText && (
                    <div className="flex items-center gap-1 mt-2">
                      <Navigation className="w-3 h-3 text-blue-600" />
                      <span className="text-xs text-blue-600">{gym.distanceText}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 選択されたジムの詳細 */}
      {selectedGym && (
        <div className="absolute inset-0 z-30 bg-black/50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 animate-slide-up">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedGym.name}</h2>
              <button
                onClick={() => setSelectedGym(null)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <p className="text-gray-700">{selectedGym.address}</p>
              </div>

              {selectedGym.website && (
                <a
                  href={selectedGym.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>ウェブサイトを見る</span>
                </a>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${selectedGym.latitude},${selectedGym.longitude}`,
                      '_blank'
                    )
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Navigation className="w-5 h-5" />
                  経路を表示
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ローディング */}
      {isLoading && (
        <div className="absolute inset-0 z-40 bg-white flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600">マップを読み込み中...</p>
          </div>
        </div>
      )}
    </div>
  )
}