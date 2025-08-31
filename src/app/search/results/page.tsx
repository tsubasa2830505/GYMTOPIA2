'use client'

import { Search, MapPin, List, Filter, ChevronDown, Heart, Plus, Minus, Map, TrendingUp, DollarSign, Clock, Star } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import GymDetailModal from '@/components/GymDetailModal'

export default function SearchResultsPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
  const [sortBy, setSortBy] = useState('popular')
  const [selectedGymId, setSelectedGymId] = useState<string | null>(null)

  const gyms = [
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
  ]

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
              <h1 className="text-lg sm:text-[21px] font-bold text-slate-900">ジムトピア</h1>
              <p className="text-xs text-slate-600">理想のジムを見つけよう</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">

        {/* Results Summary Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md">
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">検索結果</h2>
              <p className="text-xs sm:text-sm text-slate-600">理想のジムが見つかりました</p>
            </div>
            <div className="hidden sm:flex bg-cyan-100 px-4 py-2 rounded-full items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-900" />
              <span className="text-sm font-semibold text-cyan-900">3件のジム</span>
            </div>
          </div>


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
                  <Map className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
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
              <button className="p-1.5 sm:p-2 bg-slate-100 rounded-xl sm:rounded-2xl">
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
            <div className="bg-slate-100/30 rounded-xl sm:rounded-2xl h-[400px] sm:h-[600px] relative overflow-hidden mb-4 sm:mb-6">
              {/* Map Placeholder with Circles */}
              <div className="absolute inset-0">
                <div className="absolute w-[70px] h-[70px] bg-green-300/20 rounded-full" style={{ left: '322px', top: '150px' }} />
                <div className="absolute w-14 h-14 bg-blue-300/20 rounded-full" style={{ right: '241px', top: '50%' }} />
                <div className="absolute w-[42px] h-[42px] bg-yellow-300/20 rounded-full" style={{ left: '241px', bottom: '200px' }} />
              </div>

              {/* Gym Markers */}
              <button className="absolute w-7 h-7 bg-blue-500 rounded-full shadow-lg flex items-center justify-center ring-2 ring-white ring-offset-2 ring-offset-blue-300" style={{ left: '28%', top: '22%' }}>
                <MapPin className="w-3.5 h-3.5 text-white" />
              </button>
              <button className="absolute w-7 h-7 bg-blue-500 rounded-full shadow-lg flex items-center justify-center" style={{ left: '58%', top: '37%' }}>
                <MapPin className="w-3.5 h-3.5 text-white" />
              </button>
              <button className="absolute w-7 h-7 bg-blue-500 rounded-full shadow-lg flex items-center justify-center" style={{ left: '23%', top: '57%' }}>
                <MapPin className="w-3.5 h-3.5 text-white" />
              </button>

              {/* Zoom Controls */}
              <div className="absolute top-4 right-4 flex flex-col gap-1">
                <button className="w-7 h-7 bg-violet-200 rounded-lg flex items-center justify-center text-indigo-900 font-medium text-xs">
                  +
                </button>
                <button className="w-7 h-7 bg-violet-200 rounded-lg flex items-center justify-center text-indigo-900 font-medium text-xs">
                  −
                </button>
              </div>

              {/* Copyright */}
              <div className="absolute bottom-2 right-2 bg-white/80 rounded px-2 py-1">
                <span className="text-[10px] text-slate-600">© 2024 ジムトピア</span>
              </div>

              {/* Gym Card Overlay */}
              <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-auto bg-white rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 sm:w-[280px] border border-slate-200">
                <div className="flex gap-2 sm:gap-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">プレミアムフィットネス銀座</h3>
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-600 mt-1">
                      <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span>銀座 • 徒歩3分</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-slate-900 mt-1">
                      <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-red-500 text-red-500" />
                      <span>256</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 sm:gap-2 mt-2 sm:mt-3">
                  <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-violet-200 text-indigo-900 rounded-md sm:rounded-lg text-[9px] sm:text-[10px]">プレミアム</span>
                  <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-violet-200 text-indigo-900 rounded-md sm:rounded-lg text-[9px] sm:text-[10px]">サウナ</span>
                </div>
                <div className="flex gap-1 sm:gap-2 mt-2 sm:mt-3">
                  <button className="flex-1 py-1 sm:py-1.5 border border-slate-200 rounded-lg text-[10px] sm:text-xs font-medium text-slate-900 flex items-center justify-center gap-0.5 sm:gap-1 bg-white">
                    <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    イキタイ済み
                  </button>
                  <button 
                    onClick={() => setSelectedGymId('gym_rogue_shinjuku')}
                    className="flex-1 py-1 sm:py-1.5 bg-blue-500 text-white rounded-lg text-[10px] sm:text-xs font-medium">
                    詳細を見る
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {gyms.map((gym) => (
                <div key={gym.id} className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 border border-slate-100">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-slate-900">{gym.name}</h3>
                          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-600 mt-1">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{gym.location} • {gym.distance}</span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3 mt-2">
                            <div className="flex items-center gap-0.5 sm:gap-1">
                              <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${gym.isLiked ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                              <span className="text-xs sm:text-sm font-medium">{gym.likes}</span>
                            </div>
                            <span className="text-base sm:text-lg font-bold text-blue-600">{gym.price}</span>
                          </div>
                        </div>
                        <div className="hidden sm:flex flex-col gap-2">
                          <button className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
                            gym.isLiked
                              ? 'bg-white border border-slate-200 text-slate-900'
                              : 'bg-white border border-slate-200 text-slate-900 hover:bg-slate-50'
                          }`}>
                            <Heart className={`w-3 h-3 sm:w-4 sm:h-4 inline mr-0.5 sm:mr-1 ${gym.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                            {gym.isLiked ? 'イキタイ済み' : 'イキタイ'}
                          </button>
                          <button 
                            onClick={() => setSelectedGymId(`gym_${gym.id}`)}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium hover:bg-blue-600 transition-colors">
                            詳細を見る
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-1 sm:gap-2 mt-2 sm:mt-3">
                        {gym.tags.map((tag, index) => (
                          <span key={index} className="px-2 sm:px-3 py-0.5 sm:py-1 bg-violet-100 text-indigo-900 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-3 sm:hidden">
                        <button className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          gym.isLiked
                            ? 'bg-white border border-slate-200 text-slate-900'
                            : 'bg-white border border-slate-200 text-slate-900'
                        }`}>
                          <Heart className={`w-3 h-3 inline mr-0.5 ${gym.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                          {gym.isLiked ? 'イキタイ済み' : 'イキタイ'}
                        </button>
                        <button 
                          onClick={() => setSelectedGymId(`gym_${gym.id}`)}
                          className="flex-1 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium">
                          詳細を見る
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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