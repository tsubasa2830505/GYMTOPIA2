'use client'

import { MapPin, Calendar, Dumbbell, Search } from 'lucide-react'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MachineSelector from '@/components/MachineSelector'
import FreeWeightSelector from '@/components/FreeWeightSelector'
import ConditionSelector from '@/components/ConditionSelector'

export default function Home() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('machine')
  const [selectedMachines, setSelectedMachines] = useState<Map<string, number>>(new Map())
  const [selectedFreeWeights, setSelectedFreeWeights] = useState<Map<string, number>>(new Map())
  const [selectedFacilities, setSelectedFacilities] = useState<Set<string>>(new Set())
  const conditionSectionRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to condition section when items are selected
  useEffect(() => {
    const hasSelection = selectedMachines.size + selectedFreeWeights.size + selectedFacilities.size > 0
    
    if (hasSelection && conditionSectionRef.current) {
      // Scroll to the condition section with smooth animation
      conditionSectionRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start'
      })
    }
  }, [selectedMachines.size, selectedFreeWeights.size, selectedFacilities.size])



  const hasAnySelection = () => {
    return selectedMachines.size + selectedFreeWeights.size + selectedFacilities.size > 0
  }


  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/40 bg-white/60 shadow-[0_22px_40px_-32px_rgba(20,31,68,0.45)]">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-[42px] sm:h-[42px] bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
              <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
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

        {/* Main Content */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="gt-heading-lg sm:gt-heading-xl font-black mb-3 sm:mb-4 leading-tight text-[color:var(--foreground)] drop-shadow-[0_12px_30px_rgba(96,86,255,0.25)]">
            理想のジムトピアが<br className="sm:hidden" />ここにある
          </h2>
          <p className="gt-body text-sm sm:text-lg px-4 sm:px-0">
            マシンや設備から条件を選んで、<br />
            あなたにぴったりのトレーニング環境を見つけましょう。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Panel - Search */}
          <div className="col-span-1 lg:col-span-2">
            <div className="gt-card rounded-3xl">
              {/* Search Header */}
              <div className="bg-gradient-to-r from-[#eef1ff] via-[#f7f1ff] to-[#ffe9f6] p-3 sm:p-4 border-b border-white/60" ref={conditionSectionRef}>
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#6056ff] via-[#7c6bff] to-[#ff6b9f] rounded-xl flex items-center justify-center shadow-lg">
                    <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[color:var(--foreground)]">施設条件を選択</h3>
                  </div>
                </div>

                {/* Selected Tags Display */}
                {(selectedMachines.size > 0 || selectedFreeWeights.size > 0 || selectedFacilities.size > 0) && (
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-white/90 via-[#f6f0ff]/90 to-[#fef2fa]/95 border border-white/60 shadow-[0_24px_60px_-38px_rgba(20,31,68,0.55)] animate-pulse-once">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-[color:var(--text-subtle)]">選択中の条件:</span>
                      <span className="gt-badge">
                        {selectedMachines.size + selectedFreeWeights.size + selectedFacilities.size}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {/* Machine Tags */}
                      {Array.from(selectedMachines).map((machine) => (
                        <div key={`machine-${machine}`} className="gt-chip gt-chip--secondary text-[11px] sm:text-xs">
                          <span>{machine}</span>
                          <button
                            onClick={() => {
                              const newMachines = new Map(selectedMachines)
                              newMachines.delete(machine)
                              setSelectedMachines(newMachines)
                            }}
                            className="text-[color:var(--gt-secondary-strong)] hover:text-[#ff3b82] leading-none"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {/* Free Weight Tags */}
                      {Array.from(selectedFreeWeights).map(([weightId, count]) => (
                        <div key={`weight-${weightId}`} className="gt-chip gt-chip--primary text-[11px] sm:text-xs">
                          <span>{weightId} ({count}個)</span>
                          <button
                            onClick={() => {
                              const newWeights = new Map(selectedFreeWeights)
                              newWeights.delete(weightId)
                              setSelectedFreeWeights(newWeights)
                            }}
                            className="text-[color:var(--gt-primary-strong)] hover:text-[#4334d6] leading-none"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {/* Facility Tags */}
                      {Array.from(selectedFacilities).map((facility) => (
                        <div key={`facility-${facility}`} className="gt-chip text-[11px] sm:text-xs" style={{ color: 'var(--gt-tertiary-strong)', borderColor: 'rgba(56, 215, 167, 0.4)' }}>
                          <span>{facility}</span>
                          <button
                            onClick={() => {
                              const newFacilities = new Set(selectedFacilities)
                              newFacilities.delete(facility)
                              setSelectedFacilities(newFacilities)
                            }}
                            className="text-[#1f9b76] hover:text-[#178964] leading-none"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <button
                        onClick={() => {
                          setSelectedMachines(new Map())
                          setSelectedFreeWeights(new Map())
                          setSelectedFacilities(new Set())
                        }}
                        className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                      >
                        すべてクリア
                      </button>
                      <button
                        onClick={() => {
                          const params = new URLSearchParams()
                          
                          if (selectedMachines.size > 0) {
                            const machinesParam = Array.from(selectedMachines.entries())
                              .map(([id, cnt]) => `${id}:${cnt}`)
                              .join(',')
                            params.set('machines', machinesParam)
                          }
                          if (selectedFreeWeights.size > 0) {
                            // 伝搬はIDのみ（Mapの値=個数はURLに載せない）
                            params.set('freeWeights', Array.from(selectedFreeWeights.keys()).join(','))
                          }
                          if (selectedFacilities.size > 0) {
                            params.set('facilities', Array.from(selectedFacilities).join(','))
                          }
                          params.set('tab', activeTab)

                          router.push(`/search/results?${params.toString()}`)
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <Search className="w-4 h-4" />
                        検索 ({selectedMachines.size + selectedFreeWeights.size + selectedFacilities.size})
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="p-4 sm:p-6 border-b border-white/50">
                <div className="gt-tab-track flex gap-1">
                  <button 
                    onClick={() => setActiveTab('machine')}
                    className={`flex-1 px-3 sm:px-4 py-1.5 sm:py-2 gt-tab gt-pill-label gt-transition gt-pressable ${
                      activeTab === 'machine' 
                        ? 'gt-tab-active' 
                        : 'gt-tab-inactive'
                    }`}>
                    <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline mr-0.5 sm:mr-1" />
                    マシン
                  </button>
                  <button 
                    onClick={() => setActiveTab('freeweight')}
                    className={`flex-1 px-3 sm:px-4 py-1.5 sm:py-2 gt-tab gt-pill-label gt-transition gt-pressable whitespace-nowrap ${
                      activeTab === 'freeweight' 
                        ? 'gt-tab-active' 
                        : 'gt-tab-inactive'
                    }`}>
                    フリーウェイト
                  </button>
                  <button 
                    onClick={() => setActiveTab('condition')}
                    className={`flex-1 px-3 sm:px-4 py-1.5 sm:py-2 gt-tab gt-pill-label gt-transition gt-pressable ${
                      activeTab === 'condition' 
                        ? 'gt-tab-active' 
                        : 'gt-tab-inactive'
                    }`}>
                    条件
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-4 sm:p-6 max-h-[600px] overflow-y-auto">
                {/* Machine Tab */}
                {activeTab === 'machine' && (
                  <MachineSelector 
                    selectedMachines={selectedMachines}
                    onSelectionChange={setSelectedMachines} 
                  />
                )}
                
                {/* Free Weight Tab */}
                {activeTab === 'freeweight' && (
                  <FreeWeightSelector 
                    selectedFreeWeights={selectedFreeWeights}
                    onSelectionChange={setSelectedFreeWeights} 
                  />
                )}
                
                {/* Condition Tab */}
                {activeTab === 'condition' && (
                  <ConditionSelector 
                    selectedFacilities={selectedFacilities}
                    onSelectionChange={setSelectedFacilities} 
                  />
                )}
                
              </div>

              {/* Always visible search button */}
              <div className="p-4 sm:p-6 border-t border-white/50 bg-white/70">
                <button
                  onClick={() => {
                    const params = new URLSearchParams()
                    
                    if (selectedMachines.size > 0) {
                      const machinesParam = Array.from(selectedMachines.entries())
                        .map(([id, cnt]) => `${id}:${cnt}`)
                        .join(',')
                      params.set('machines', machinesParam)
                    }
                    if (selectedFreeWeights.size > 0) {
                      // 伝搬はIDのみ（Mapの値=個数はURLに載せない）
                      params.set('freeWeights', Array.from(selectedFreeWeights.keys()).join(','))
                    }
                    if (selectedFacilities.size > 0) {
                      params.set('facilities', Array.from(selectedFacilities).join(','))
                    }
                    params.set('tab', activeTab)

                    router.push(`/search/results?${params.toString()}`)
                  }}
                  className="w-full gt-pill-button justify-center text-sm sm:text-base"
                >
                  <Search className="w-5 h-5" />
                  {(selectedMachines.size > 0 || selectedFreeWeights.size > 0 || selectedFacilities.size > 0) 
                    ? `ジムを検索する (${selectedMachines.size + selectedFreeWeights.size + selectedFacilities.size}件の条件)` 
                    : 'すべてのジムを検索'
                  }
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Selected Conditions */}
          <div className="col-span-1 lg:col-span-1 hidden lg:block">
            <div className="gt-card p-6 sticky top-24 backdrop-blur-xl">
              <div className="bg-gradient-to-r from-[#eef1ff] via-[#f0f4ff] to-[#fff0f6] -m-6 mb-6 p-6 rounded-t-[26px] border-b border-white/60">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-[#6056ff] via-[#7c6bff] to-[#ff6b9f] rounded-2xl flex items-center justify-center shadow-lg">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="gt-heading-md text-[color:var(--foreground)]">選択した条件</h3>
                    <p className="gt-body-muted">
                      {selectedMachines.size + selectedFreeWeights.size + selectedFacilities.size}個の条件を選択中
                    </p>
                  </div>
                </div>
              </div>

              {!hasAnySelection() ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-white/70 border border-white/60 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_18px_40px_-30px_rgba(20,31,68,0.45)]">
                    <Calendar className="w-7 h-7 text-[color:var(--text-muted)]" />
                  </div>
                  <p className="gt-title-sm text-[color:var(--foreground)] mb-2">条件を選択してください</p>
                  <p className="gt-body-muted">
                    マシン・設備・施設条件を選択して<br />
                    理想のジムを見つけましょう
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* マシン条件 */}
                  {Array.from(selectedMachines).map((machine) => (
                    <div
                      key={`machine-${machine}`}
                      className="gt-surface-outline flex items-center justify-between p-3 rounded-2xl shadow-[0_14px_32px_-26px_rgba(20,31,68,0.55)]"
                    >
                      <span className="gt-label-lg text-[color:var(--gt-secondary-strong)]">{machine}</span>
                      <button
                        onClick={() => {
                          const newMachines = new Map(selectedMachines)
                          newMachines.delete(machine)
                          setSelectedMachines(newMachines)
                        }}
                        className="text-[color:var(--gt-secondary-strong)] hover:text-[#ff3b82] text-sm leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  {/* フリーウェイト条件 */}
                  {Array.from(selectedFreeWeights).map(([weightId, count]) => (
                    <div
                      key={`weight-${weightId}`}
                      className="gt-surface-outline flex items-center justify-between p-3 rounded-2xl shadow-[0_14px_32px_-26px_rgba(20,31,68,0.55)]"
                    >
                      <span className="gt-label-lg text-[color:var(--gt-primary-strong)]">{weightId} ({count}個)</span>
                      <button
                        onClick={() => {
                          const newWeights = new Map(selectedFreeWeights)
                          newWeights.delete(weightId)
                          setSelectedFreeWeights(newWeights)
                        }}
                        className="text-[color:var(--gt-primary-strong)] hover:text-[#4334d6] text-sm leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  {/* 施設条件 */}
                  {Array.from(selectedFacilities).map((facility) => (
                    <div
                      key={`facility-${facility}`}
                      className="gt-surface-outline flex items-center justify-between p-3 rounded-2xl shadow-[0_14px_32px_-26px_rgba(20,31,68,0.55)]"
                    >
                      <span className="gt-label-lg" style={{ color: 'var(--gt-tertiary-strong)' }}>{facility}</span>
                      <button
                        onClick={() => {
                          const newFacilities = new Set(selectedFacilities)
                          newFacilities.delete(facility)
                          setSelectedFacilities(newFacilities)
                        }}
                        className="text-[#1f9b76] hover:text-[#178964] text-sm leading-none"
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
