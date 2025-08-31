'use client'

import { Search, MapPin, SlidersHorizontal, User, Calendar, ChevronRight, Plus, Dumbbell } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MachineSelector from '@/components/MachineSelector'
import FreeWeightSelector from '@/components/FreeWeightSelector'
import ConditionSelector from '@/components/ConditionSelector'

export default function Home() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('condition')
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([])
  const [selectedMakers, setSelectedMakers] = useState<string[]>([])
  const [selectedMachines, setSelectedMachines] = useState<Set<string>>(new Set())
  const [selectedFreeWeights, setSelectedFreeWeights] = useState<Set<string>>(new Set())
  const [selectedFacilities, setSelectedFacilities] = useState<Set<string>>(new Set())



  const hasAnySelection = () => {
    return selectedMachines.size + selectedFreeWeights.size + selectedFacilities.size > 0
  }

  const muscles = ['胸', '背中', '脚', '肩', '腕']
  const makers = [
    { name: 'ROGUE Fitness', location: 'USA' },
    { name: 'Hammer Strength', location: 'USA' },
    { name: 'Prime Fitness', location: 'USA' },
    { name: 'Cybex', location: 'USA' },
    { name: 'Life Fitness', location: 'USA' },
    { name: 'Technogym', location: 'Italy' },
  ]

  const searchResults = [
    {
      name: 'アイソラテラル チェストプレス',
      brand: 'Hammer Strength',
      tags: ['大胸筋上部', '大胸筋中部', '+2'],
    },
    {
      name: 'アイソラテラル インクラインプレス',
      brand: 'Hammer Strength',
      tags: ['大胸筋上部', '三角筋前部', '+1'],
    },
    {
      name: 'ラットプルダウン',
      brand: 'Hammer Strength',
      tags: ['広背筋上部', '広背筋中部', '+2'],
    },
    {
      name: 'リニア レッグプレス',
      brand: 'Hammer Strength',
      tags: ['大腿四頭筋', 'ハムストリングス', '+1'],
    },
    {
      name: 'HV-1 ケーブルマシン',
      brand: 'Prime Fitness',
      tags: ['大胸筋上部', '大胸筋中部', '+8'],
    },
    {
      name: 'プロディジー ケーブル クロスオーバー',
      brand: 'Prime Fitness',
      tags: ['大胸筋上部', '大胸筋中部', '+3'],
    },
    {
      name: '95T Achieve トレッドミル',
      brand: 'Life Fitness',
      tags: ['大腿四頭筋', 'ハムストリングス', '+2'],
    },
    {
      name: '95E Achieve エリプティカル',
      brand: 'Life Fitness',
      tags: ['大腿四頭筋', 'ハムストリングス', '+2'],
    },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--md-background)' }}>
      {/* Header */}
      <header className="md-surface md-elevation-1 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-[73.5px] flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-[42px] sm:h-[42px] bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
              <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-[21px] font-bold text-slate-900">ジムトピア</h1>
              <p className="text-xs text-slate-600">理想のジムを見つけよう</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">

        {/* Main Content */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="md-headline-medium sm:md-display-small font-bold mb-3 sm:mb-4 leading-tight" style={{ color: 'var(--md-on-background)' }}>
            理想のジムトピアを<br className="sm:hidden" />見つけよう
          </h2>
          <p className="text-slate-600 text-sm sm:text-lg px-4 sm:px-0">
            マシンや設備から条件を選んで、<br />
            あなたにぴったりのトレーニング環境を見つけましょう。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Panel - Search */}
          <div className="col-span-1 lg:col-span-2">
            <div className="md-card rounded-3xl">
              {/* Search Header */}
              <div className="bg-slate-100 p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md">
                    <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">施設条件・エリアを検索</h3>
                    <p className="text-xs sm:text-sm text-slate-600">理想のジム環境を構築しよう</p>
                  </div>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="マシン名、メーカーで検索..."
                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-white rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="p-4 sm:p-6 border-b">
                <div className="md-surface-variant rounded-xl sm:rounded-2xl p-0.5 sm:p-1 flex gap-0.5 sm:gap-1">
                  <button 
                    onClick={() => setActiveTab('machine')}
                    className={`flex-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl md-label-medium font-medium md-transition-standard md-ripple ${
                      activeTab === 'machine' 
                        ? 'md-surface md-elevation-1' 
                        : 'text-slate-600 hover:bg-white/50'
                    }`}>
                    <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline mr-0.5 sm:mr-1" />
                    マシン
                  </button>
                  <button 
                    onClick={() => setActiveTab('freeweight')}
                    className={`flex-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl md-label-medium font-medium md-transition-standard md-ripple ${
                      activeTab === 'freeweight' 
                        ? 'md-surface md-elevation-1' 
                        : 'text-slate-600 hover:bg-white/50'
                    }`}>
                    フリー
                  </button>
                  <button 
                    onClick={() => setActiveTab('condition')}
                    className={`flex-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl md-label-medium font-medium md-transition-standard md-ripple ${
                      activeTab === 'condition' 
                        ? 'md-surface md-elevation-1' 
                        : 'text-slate-600 hover:bg-white/50'
                    }`}>
                    条件
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-4 sm:p-6 max-h-[600px] overflow-y-auto">
                {/* Machine Tab */}
                {activeTab === 'machine' && (
                  <MachineSelector onSelectionChange={setSelectedMachines} />
                )}
                
                {/* Free Weight Tab */}
                {activeTab === 'freeweight' && (
                  <FreeWeightSelector onSelectionChange={setSelectedFreeWeights} />
                )}
                
                {/* Condition Tab */}
                {activeTab === 'condition' && (
                  <ConditionSelector 
                    onSelectionChange={setSelectedFacilities} 
                  />
                )}
                
                {/* Muscle Tab - Original content */}
                {activeTab === 'muscle' && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-3 sm:mb-4">鍛えたい部位を選択</h4>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                  {muscles.map((muscle) => (
                    <button
                      key={muscle}
                      onClick={() => {
                        setSelectedMuscles(prev =>
                          prev.includes(muscle)
                            ? prev.filter(m => m !== muscle)
                            : [...prev, muscle]
                        )
                      }}
                      className={`py-3 sm:py-4 px-2 sm:px-3 rounded-xl sm:rounded-2xl shadow-sm transition-all ${
                        selectedMuscles.includes(muscle)
                          ? 'bg-blue-500 text-white'
                          : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2">
                        <Dumbbell className="w-full h-full" />
                      </div>
                      <p className="text-[10px] sm:text-xs font-medium">{muscle}</p>
                    </button>
                  ))}
                </div>

                {/* Makers */}
                <h4 className="text-sm font-bold text-slate-900 mt-4 sm:mt-6 mb-3 sm:mb-4">メーカーを選択</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {makers.map((maker) => (
                    <button
                      key={maker.name}
                      onClick={() => {
                        setSelectedMakers(prev =>
                          prev.includes(maker.name)
                            ? prev.filter(m => m !== maker.name)
                            : [...prev, maker.name]
                        )
                      }}
                      className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm text-left transition-all ${
                        selectedMakers.includes(maker.name)
                          ? 'bg-blue-500 text-white'
                          : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-xs sm:text-sm font-semibold">{maker.name}</p>
                      <p className="text-[10px] sm:text-xs opacity-75">{maker.location}</p>
                    </button>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-200 my-4 sm:my-6" />

                {/* Search Results */}
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <h4 className="text-sm font-bold text-slate-900">検索結果</h4>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-purple-100 text-purple-700 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium">
                    8台のマシン
                  </span>
                </div>

                <div className="space-y-2 sm:space-y-3 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="md-card-outlined rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:md-elevation-2 md-transition-standard cursor-pointer"
                      onClick={() => router.push('/search/results')}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="text-xs sm:text-sm font-medium text-slate-900 mb-1">
                            {result.name}
                          </h5>
                          <span className="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 border border-slate-200 rounded-md sm:rounded-lg text-[10px] sm:text-xs text-slate-700 mb-1.5 sm:mb-2">
                            {result.brand}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {result.tags.slice(0, 2).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-100 text-purple-700 rounded-md sm:rounded-lg text-[10px] sm:text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                            {result.tags.length > 2 && (
                              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-100 text-purple-700 rounded-md sm:rounded-lg text-[10px] sm:text-xs">
                                {result.tags[2]}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Selected Conditions */}
          <div className="col-span-1 lg:col-span-1 hidden lg:block">
            <div className="md-surface md-elevation-3 backdrop-blur-md rounded-2xl p-6 sticky top-24">
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 -m-6 mb-6 p-6 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-md">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">選択した条件</h3>
                    <p className="text-xs text-slate-600">
                      {selectedMachines.size + selectedFreeWeights.size + selectedFacilities.size}個の条件を選択中
                    </p>
                  </div>
                </div>
              </div>

              {!hasAnySelection() ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-7 h-7 text-slate-400" />
                  </div>
                  <p className="text-slate-700 font-medium mb-2">条件を選択してください</p>
                  <p className="text-xs text-slate-500">
                    マシン・設備・施設条件を選択して<br />
                    理想のジムを見つけましょう
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* マシン条件 */}
                  {Array.from(selectedMachines).map((machine) => (
                    <div key={`machine-${machine}`} className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                      <span className="text-sm font-medium text-purple-700">{machine}</span>
                      <button
                        onClick={() => {
                          const newMachines = new Set(selectedMachines)
                          newMachines.delete(machine)
                          setSelectedMachines(newMachines)
                        }}
                        className="text-purple-500 hover:text-purple-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  {/* フリーウェイト条件 */}
                  {Array.from(selectedFreeWeights).map((weight) => (
                    <div key={`weight-${weight}`} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                      <span className="text-sm font-medium text-blue-700">{weight}</span>
                      <button
                        onClick={() => {
                          const newWeights = new Set(selectedFreeWeights)
                          newWeights.delete(weight)
                          setSelectedFreeWeights(newWeights)
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  {/* 施設条件 */}
                  {Array.from(selectedFacilities).map((facility) => (
                    <div key={`facility-${facility}`} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                      <span className="text-sm font-medium text-green-700">{facility}</span>
                      <button
                        onClick={() => {
                          const newFacilities = new Set(selectedFacilities)
                          newFacilities.delete(facility)
                          setSelectedFacilities(newFacilities)
                        }}
                        className="text-green-500 hover:text-green-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}