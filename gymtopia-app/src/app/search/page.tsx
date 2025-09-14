'use client'

import { MapPin, Star, Search } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { Gym, getGyms } from '@/lib/supabase/gyms'
import dynamic from 'next/dynamic'

// GymDetailModalを動的インポート
const GymDetailModal = dynamic(() => import('@/components/GymDetailModal'), {
  ssr: false
})

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [gyms, setGyms] = useState<Gym[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPrefecture, setSelectedPrefecture] = useState('')
  const [searchMode, setSearchMode] = useState<'all' | 'search'>('all')
  const [selectedGymId, setSelectedGymId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadGyms = useCallback(async () => {
    try {
      setLoading(true)
      const filters: { prefecture?: string; city?: string; search?: string } = {}
      if (selectedPrefecture) filters.prefecture = selectedPrefecture
      if (searchQuery.trim() && searchMode === 'search') filters.search = searchQuery.trim()

      const data = await getGyms(filters)
      setGyms(data)
    } catch (error) {
      console.error('Failed to load gyms:', error)
      setGyms([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }, [selectedPrefecture, searchQuery, searchMode])

  useEffect(() => {
    loadGyms()
  }, [loadGyms])

  const handleSearch = () => {
    setSearchMode('search')
    loadGyms()
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchMode('all')
    loadGyms()
  }

  const prefectures = [
    '東京都', '神奈川県', '千葉県', '埼玉県', '大阪府', '愛知県',
    '福岡県', '北海道', '兵庫県', '京都府'
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4 space-y-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            ジム検索
          </h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ジム名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-20 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  クリア
                </button>
              )}
              <button
                onClick={handleSearch}
                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                検索
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => {
                setSelectedPrefecture('')
                setSearchMode('all')
              }}
              className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                !selectedPrefecture
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              全て
            </button>
            {prefectures.map((prefecture) => (
              <button
                key={prefecture}
                onClick={() => setSelectedPrefecture(prefecture === selectedPrefecture ? '' : prefecture)}
                className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                  prefecture === selectedPrefecture
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {prefecture}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">読み込み中...</p>
          </div>
        ) : gyms.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery || selectedPrefecture 
                ? '条件に一致するジムが見つかりません'
                : 'ジムのデータがありません'
              }
            </p>
            {(searchQuery || selectedPrefecture) && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedPrefecture('')
                  setSearchMode('all')
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                すべてのジムを表示
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {gyms.length}件のジムが見つかりました
              </p>
            </div>
            
            <div className="grid gap-4">
              {gyms.map((gym) => (
                <div
                  key={gym.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                  onClick={() => {
                    setSelectedGymId(gym.id)
                    setIsModalOpen(true)
                  }}
                >
                  {/* ジム画像 */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={gym.images && gym.images.length > 0
                        ? gym.images[0]
                        : 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop'
                      }
                      alt={gym.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop'
                      }}
                    />
                    {/* 画像の上にグラデーションオーバーレイを追加して、もしテキストが重なっても読みやすくする */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="p-4 relative z-10">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 leading-tight">
                      {gym.name}
                    </h3>
                  
                  {gym.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{gym.address}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-2">
                      {gym.prefecture && (
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">
                          {gym.prefecture}
                        </span>
                      )}
                      {gym.verified && (
                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded">
                          公式
                        </span>
                      )}
                    </div>
                    
                    {gym.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {gym.rating.toFixed(1)}
                        </span>
                        {gym.review_count && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({gym.review_count})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                    {gym.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                        {gym.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ジム詳細モーダル */}
      {selectedGymId && (
        <GymDetailModal
          gymId={selectedGymId}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedGymId(null)
          }}
        />
      )}
    </div>
  )
}