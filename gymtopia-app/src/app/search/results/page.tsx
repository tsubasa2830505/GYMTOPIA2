'use client'

import { MapPin, List, Filter, ChevronDown, Heart, Map as MapIcon, Star, ArrowLeft, X } from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import GymDetailModal from '@/components/GymDetailModal'
import { getGyms, Gym } from '@/lib/supabase/gyms'
import { getMachines } from '@/lib/supabase/machines'
import type { FacilityKey } from '@/types/facilities'
import { supabase } from '@/lib/supabase/client'

function SearchResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
  // const [sortBy, setSortBy] = useState('popular')
  const [selectedGymId, setSelectedGymId] = useState<string | null>(null)
  const [gyms, setGyms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [machineNames, setMachineNames] = useState<Record<string, string>>({})
  const [processingLikes, setProcessingLikes] = useState<Set<string>>(new Set())

  const MOCK_USER_ID = 'user-demo-001'

  // Handle toggle like function
  const toggleLike = async (gymId: string) => {
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
        const { error } = await supabase
          .from('favorite_gyms')
          .delete()
          .eq('user_id', MOCK_USER_ID)
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
        const { error } = await supabase
          .from('favorite_gyms')
          .insert({
            user_id: MOCK_USER_ID,
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
            console.error('Error adding like:', error)
            alert('いきたいの追加に失敗しました: ' + error.message)
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
      alert('エラーが発生しました: ' + error.message)
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
      params.set('freeWeights', newConditions.freeWeights.map(fw => `${fw.name}:${fw.count}`).join(','))
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
      if (conditions.machines?.length) {
        filters.machines = conditions.machines
      }
      if (conditions.freeWeights?.length) {
        filters.machineTypes = conditions.freeWeights
      }
      if (conditions.facilities?.length) {
        filters.categories = conditions.facilities
      }
      
      const data = await getGyms(filters)
      
      if (data) {
        // Transform data to match component format
        const transformedData = data.map((gym: Gym) => ({
          id: gym.id,
          name: gym.name || 'ジム名未設定',
          location: gym.city || gym.prefecture || '場所未設定',
          distance: '徒歩5分', // Placeholder - would calculate from actual location
          likes: gym.review_count || 0,
          tags: gym.equipment_types || [],
          image: gym.images && gym.images.length > 0
            ? gym.images[0]
            : 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
          price: '¥10,000～', // Placeholder
          isLiked: false,
          address: gym.address || '',
          images: gym.images || [] // 全画像を保持
        }))
        
        setGyms(transformedData)
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
  }, [searchParams])

  useEffect(() => {
    // Parse machines with count (format: "name:count")
    const machinesParam = searchParams.get('machines')?.split(',').filter(Boolean) || []
    const machines = machinesParam.map(item => {
      const [name, count] = item.split(':')
      return { name, count: parseInt(count) || 1 }
    })

    // Parse freeWeights with count (format: "name:count")
    const freeWeightsParam = searchParams.get('freeWeights')?.split(',').filter(Boolean) || []
    const freeWeights = freeWeightsParam.map(item => {
      const [name, count] = item.split(':')
      return { name, count: parseInt(count) || 1 }
    })
    const facilities = searchParams.get('facilities')?.split(',').filter(Boolean) || []

    const newConditions = { machines, freeWeights, facilities }
    setSelectedConditions(newConditions)

    // マシンIDから名前を取得
    if (machines.length > 0) {
      getMachines().then(allMachines => {
        const nameMap: Record<string, string> = {}
        allMachines.forEach((machine: any) => {
          nameMap[machine.id] = machine.name
        })
        setMachineNames(nameMap)
      })
    }

    fetchGyms(newConditions)
  }, [searchParams, fetchGyms])

  const getTotalConditionsCount = () => {
    return selectedConditions.machines.length + selectedConditions.freeWeights.length + selectedConditions.facilities.length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">ジムを検索中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-[73.5px] flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-[42px] sm:h-[42px] bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <Image
                src="/images/gymtopia-logo.svg"
                alt="ジムトピア"
                width={120}
                height={32}
                className="h-6 sm:h-8 w-auto"
              />
              <p className="text-xs text-slate-600">理想のジムを見つけよう</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">

        {/* Results Summary Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <button 
              onClick={() => router.back()}
              aria-label="戻る"
              className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
            </button>
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">検索結果</h2>
              <p className="text-xs sm:text-sm text-slate-600">
                {getTotalConditionsCount() > 0 
                  ? `${getTotalConditionsCount()}件の条件で検索` 
                  : '理想のジムが見つかりました'
                }
              </p>
            </div>
            <div className="hidden sm:flex bg-cyan-100 px-4 py-2 rounded-full items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-900" />
              <span className="text-sm font-semibold text-cyan-900">{gyms.length}件のジム</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Selected Conditions Display */}
          {(getTotalConditionsCount() > 0 || searchParams.get('searchType')) && (
            <div className="mb-4 sm:mb-6 p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-700">検索条件</h3>
                <button
                  onClick={() => {
                    clearAllConditions()
                    router.push('/search/results')
                  }}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  すべてクリア
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {/* スマート検索条件の表示 */}
                {searchParams.get('searchType') && (
                  <>
                    {searchParams.get('muscle') && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                        🏋️ 部位: {searchParams.get('muscle')}
                      </span>
                    )}
                    {searchParams.get('maker') && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                        🏭 メーカー: {searchParams.get('maker')}
                      </span>
                    )}
                    {searchParams.get('name') && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium">
                        🎯 マシン: {searchParams.get('name')}
                      </span>
                    )}
                    {searchParams.get('type') && (
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium">
                        ⚙️ タイプ: {searchParams.get('type')}
                      </span>
                    )}
                  </>
                )}
                {/* 既存の条件表示 */}
                {selectedConditions.machines.map((machine, index) => (
                  <button
                    key={`machine-${index}-${machine.name}`}
                    onClick={() => removeCondition('machines', machine.name)}
                    className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200 transition-colors flex items-center gap-1"
                  >
                    {machine.name}
                    {machine.count > 1 && (
                      <span className="font-bold ml-1">×{machine.count}</span>
                    )}
                    <X className="w-3 h-3" />
                  </button>
                ))}
                {selectedConditions.freeWeights.map((weight, index) => (
                  <button
                    key={`weight-${index}-${weight.name}`}
                    onClick={() => removeCondition('freeWeights', weight.name)}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors flex items-center gap-1"
                  >
                    {weight.name}
                    {weight.count > 1 && (
                      <span className="font-bold ml-1">×{weight.count}</span>
                    )}
                    <X className="w-3 h-3" />
                  </button>
                ))}
                {selectedConditions.facilities.map((facility, index) => (
                  <button
                    key={`facility-${index}-${facility}`}
                    onClick={() => removeCondition('facilities', facility)}
                    className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors flex items-center gap-1"
                  >
                    {facility}
                    <X className="w-3 h-3" />
                  </button>
                ))}
              </div>
              {getTotalConditionsCount() > 1 && (
                <div className="mt-3 pt-2 border-t border-slate-200">
                  <p className="text-xs text-slate-500">
                    条件が多すぎる場合は、いくつか削除してみてください
                  </p>
                </div>
              )}
            </div>
          )}


          {/* View Mode and Sort Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden sm:block text-sm font-medium text-slate-900">表示形式</span>
              <div className="bg-slate-100 rounded-xl sm:rounded-2xl p-0.5 sm:p-1 flex">
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-medium transition-all flex items-center gap-0.5 sm:gap-1 ${
                    viewMode === 'map'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-slate-600'
                  }`}
                >
                  <MapIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  地図
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-medium transition-all flex items-center gap-0.5 sm:gap-1 ${
                    viewMode === 'list'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-slate-600'
                  }`}
                >
                  <List className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  リスト
                </button>
              </div>
              <button aria-label="フィルター" className="p-1.5 sm:p-2 bg-slate-100 rounded-xl sm:rounded-2xl">
                <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />
              </button>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 bg-white border border-slate-200 rounded-xl sm:rounded-2xl px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-sm">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-900" />
              <span className="text-[10px] sm:text-xs font-medium text-slate-900">イキタイの多い順</span>
              <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500" />
            </div>
          </div>
        </div>

        {/* Map and Gym Cards */}
        <div className="relative">
          {/* Map Container */}
          {viewMode === 'map' && (
            <div className="h-[400px] sm:h-[600px] mb-4 sm:mb-6 bg-slate-100 rounded-xl flex items-center justify-center">
              <div className="text-center text-slate-600">
                <p className="text-lg font-semibold mb-2">マップ機能は開発中です</p>
                <p className="text-sm">現在はリスト表示をご利用ください</p>
              </div>
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {gyms.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center">
                  <p className="text-slate-600">検索条件に一致するジムが見つかりませんでした</p>
                </div>
              ) : (
                gyms.map((gym) => (
                  <div key={gym.id} className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 border border-slate-100">
                    <div className="flex gap-3 sm:gap-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex-shrink-0 overflow-hidden bg-slate-100">
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
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900">{gym.name}</h3>
                            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-600 mt-1">
                              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{gym.location} • {gym.distance}</span>
                            </div>
                            {gym.address && (
                              <p className="text-xs text-slate-500 mt-1">{gym.address}</p>
                            )}
                            <div className="flex items-center gap-2 sm:gap-3 mt-2">
                              <div className="flex items-center gap-0.5 sm:gap-1">
                                <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${gym.isLiked ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                                <span className="text-xs sm:text-sm font-medium">{gym.likes}</span>
                              </div>
                              <span className="text-base sm:text-lg font-bold text-blue-600">{gym.price}</span>
                            </div>
                          </div>
                          <div className="hidden sm:flex flex-col gap-2">
                            <button
                              onClick={() => toggleLike(gym.id)}
                              disabled={processingLikes.has(gym.id)}
                              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
                              gym.isLiked
                                ? 'bg-white border border-slate-200 text-slate-900'
                                : 'bg-white border border-slate-200 text-slate-900 hover:bg-slate-50'
                            } ${processingLikes.has(gym.id) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                              <Heart className={`w-3 h-3 sm:w-4 sm:h-4 inline mr-0.5 sm:mr-1 ${gym.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                              {processingLikes.has(gym.id) ? '処理中...' : (gym.isLiked ? 'イキタイ済み' : 'イキタイ')}
                            </button>
                            <button 
                              onClick={() => setSelectedGymId(gym.id)}
                              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium hover:bg-blue-600 transition-colors">
                              詳細を見る
                            </button>
                          </div>
                        </div>
                        {gym.tags.length > 0 && (
                          <div className="flex gap-1 sm:gap-2 mt-2 sm:mt-3">
                            {gym.tags.map((tag: string, index: number) => (
                              <span key={index} className="px-2 sm:px-3 py-0.5 sm:py-1 bg-violet-100 text-indigo-900 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2 mt-3 sm:hidden">
                          <button
                            onClick={() => toggleLike(gym.id)}
                            disabled={processingLikes.has(gym.id)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            gym.isLiked
                              ? 'bg-white border border-slate-200 text-slate-900'
                              : 'bg-white border border-slate-200 text-slate-900'
                          } ${processingLikes.has(gym.id) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <Heart className={`w-3 h-3 inline mr-0.5 ${gym.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                            {processingLikes.has(gym.id) ? '処理中...' : (gym.isLiked ? 'イキタイ済み' : 'イキタイ')}
                          </button>
                          <button 
                            onClick={() => setSelectedGymId(gym.id)}
                            className="flex-1 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium">
                            詳細を見る
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">検索結果を読み込み中...</p>
        </div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  )
}
