'use client'

import { MapPin, Calendar, Dumbbell, Search } from 'lucide-react'
import Image from 'next/image'
import Header from '@/components/Header'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MachineSelector from '@/components/MachineSelector'
import FreeWeightSelector from '@/components/FreeWeightSelector'
import ConditionSelector from '@/components/ConditionSelector'
import Button from '@/components/ui/Button'

export default function Home() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('machine')
  const [selectedMachines, setSelectedMachines] = useState<Map<string, number>>(new Map())
  const [selectedFreeWeights, setSelectedFreeWeights] = useState<Set<string>>(new Set())
  const [selectedFacilities, setSelectedFacilities] = useState<Set<string>>(new Set())
  const [isSearchMode, setIsSearchMode] = useState(false)
  const conditionSectionRef = useRef<HTMLDivElement>(null)
  const totalSelections = selectedMachines.size + selectedFreeWeights.size + selectedFacilities.size

  const scrollToFilters = () => {
    if (conditionSectionRef.current) {
      conditionSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const goToSearchResults = () => {
    const params = new URLSearchParams()

    if (selectedMachines.size > 0) {
      const machinesParam = Array.from(selectedMachines.entries())
        .map(([id, cnt]) => `${id}:${cnt}`)
        .join(',')
      params.set('machines', machinesParam)
    }
    if (selectedFreeWeights.size > 0) {
      params.set('freeWeights', Array.from(selectedFreeWeights).join(','))
    }
    if (selectedFacilities.size > 0) {
      params.set('facilities', Array.from(selectedFacilities).join(','))
    }

    params.set('tab', activeTab)

    router.push(`/search/results?${params.toString()}`)
  }

  useEffect(() => {
    if (totalSelections > 0 && conditionSectionRef.current) {
      conditionSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [totalSelections])

  const handleStartSearch = () => {
    setIsSearchMode(true)
    setTimeout(() => {
      if (conditionSectionRef.current) {
        conditionSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  const hasAnySelection = () => totalSelections > 0

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 right-16 h-60 w-60 rounded-full bg-[radial-gradient(circle_at_center,rgba(231,103,76,0.26),transparent_68%)] blur-3xl opacity-70" />
      <div className="pointer-events-none absolute top-[45%] -left-28 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(240,142,111,0.2),transparent_70%)] blur-3xl opacity-65" />

      <Header subtitle="ジムを探す" />

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12 sm:pt-28 sm:pb-16 space-y-10">

        {/* Hero Section */}
        <div className={`relative text-center mb-8 rounded-3xl overflow-hidden transition-all duration-500 ease-in-out ${
          isSearchMode ? 'h-20 sm:h-24' : 'h-64 sm:h-80'
        }`}>
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")'
            }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(231,103,76,0.82)] via-[rgba(201,86,61,0.76)] to-[rgba(240,142,111,0.7)]" />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center items-center h-full px-6">
            {!isSearchMode && (
              <>
                <h2 className="gt-heading-lg sm:gt-heading-xl font-black mb-3 sm:mb-4 leading-tight text-[color:var(--gt-on-primary)] drop-shadow-[0_12px_30px_rgba(0,0,0,0.4)]">
                  理想のジムトピアが<br className="sm:hidden" />ここにある
                </h2>
                <p className="text-[color:var(--gt-on-primary)]/80 max-w-2xl mx-auto text-sm sm:text-base drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] mb-6">
                  街のリアルな声で選ぶ。マシンや設備から条件を選んで、あなたにぴったりのトレーニング環境を見つけましょう。
                </p>
                <button
                  onClick={handleStartSearch}
                  className="bg-white/95 backdrop-blur-sm px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-[color:var(--gt-primary-strong)] shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:scale-105 hover:bg-white transition-all duration-300 flex items-center gap-2 text-sm sm:text-base"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  ジムトピアを探す
                </button>
              </>
            )}
            {isSearchMode && (
              <button
                onClick={() => setIsSearchMode(false)}
                className="text-[color:var(--gt-on-primary)]/80 text-xs sm:text-sm hover:text-[color:var(--gt-on-primary)] transition-colors"
              >
                ← トップに戻る
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="col-span-1 lg:col-span-2">
            <div className={`gt-card rounded-[32px] border border-[rgba(231,103,76,0.2)] backdrop-blur-sm transition-all duration-500 ${
              isSearchMode ? 'mt-0' : ''
            }`}>
              <div
                className="relative p-4 sm:p-6 border-b border-[rgba(231,103,76,0.18)] bg-[rgba(254,255,250,0.9)]"
                ref={conditionSectionRef}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-[radial-gradient(circle_at_30%_30%,rgba(231,103,76,0.24),rgba(240,142,111,0.14))] flex items-center justify-center shadow-[0_14px_34px_-22px_rgba(189,101,78,0.42)]">
                        <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[color:var(--gt-primary-strong)]" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-[color:var(--foreground)]">設備条件を選ぶ</h2>
                        <p className="gt-body-muted hidden sm:block">マシンや設備、通いやすさなどの基準を並べて、街のジムを絞り込みましょう。</p>
                      </div>
                    </div>
                    {totalSelections > 0 && (
                      <button
                        onClick={() => {
                          setSelectedMachines(new Map())
                          setSelectedFreeWeights(new Set())
                          setSelectedFacilities(new Set())
                        }}
                        className="text-[10px] sm:text-xs font-semibold text-[color:var(--text-muted)] underline-offset-4 hover:underline"
                      >
                        条件をクリア
                      </button>
                    )}
                  </div>

                  {totalSelections > 0 && (
                    <div className="rounded-3xl border border-[rgba(231,103,76,0.2)] bg-[rgba(254,255,250,0.96)] px-4 py-4 sm:px-5 sm:py-5 shadow-[0_24px_50px_-32px_rgba(189,101,78,0.48)] animate-pulse-once">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-semibold text-[color:var(--text-subtle)]">選択中の条件</span>
                        <span className="gt-badge">{totalSelections}</span>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {Array.from(selectedMachines.entries()).map(([machineId, count]) => (
                          <div key={`machine-${machineId}`} className="gt-chip gt-chip--secondary text-[11px] sm:text-xs">
                            <span>{count > 1 ? `${machineId} (${count}台)` : machineId}</span>
                            <button
                              onClick={() => {
                                const newMachines = new Map(selectedMachines)
                                newMachines.delete(machineId)
                                setSelectedMachines(newMachines)
                              }}
                              className="text-[color:var(--gt-secondary-strong)] hover:text-[color:var(--gt-secondary-strong)] leading-none"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {Array.from(selectedFreeWeights).map((weightId) => (
                          <div key={`weight-${weightId}`} className="gt-chip gt-chip--primary text-[11px] sm:text-xs">
                            <span>{weightId}</span>
                            <button
                              onClick={() => {
                                const newWeights = new Set(selectedFreeWeights)
                                newWeights.delete(weightId)
                                setSelectedFreeWeights(newWeights)
                              }}
                              className="text-[color:var(--gt-primary-strong)] hover:text-[color:var(--gt-primary-strong)] leading-none"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {Array.from(selectedFacilities).map((facility) => (
                          <div
                            key={`facility-${facility}`}
                            className="gt-chip text-[11px] sm:text-xs"
                            style={{ borderColor: 'rgba(245, 177, 143, 0.28)', color: 'var(--gt-tertiary-strong)' }}
                          >
                            <span>{facility}</span>
                            <button
                              onClick={() => {
                                const newFacilities = new Set(selectedFacilities)
                                newFacilities.delete(facility)
                                setSelectedFacilities(newFacilities)
                              }}
                              className="text-[color:var(--gt-tertiary-strong)] hover:text-[color:var(--gt-tertiary-strong)] leading-none"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-xs text-[color:var(--text-muted)]">選択した条件で検索結果ページに移動します。</span>
                        <Button
                          variant="outline"
                          size="md"
                          startIcon={<Search className="w-4 h-4" />}
                          onClick={goToSearchResults}
                        >
                          条件で検索 ({totalSelections})
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-6 border-b border-[rgba(231,103,76,0.18)] bg-[rgba(247,250,255,0.88)]">
                <div className="gt-tab-track flex gap-1">
                  <button
                    onClick={() => setActiveTab('machine')}
                    className={`flex-1 px-3 sm:px-4 py-1.5 sm:py-2 gt-tab gt-pill-label gt-transition gt-pressable ${
                      activeTab === 'machine' ? 'gt-tab-active' : 'gt-tab-inactive'
                    }`}
                  >
                    <Dumbbell className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline mr-0.5 sm:mr-1" />
                    マシン
                  </button>
                  <button
                    onClick={() => setActiveTab('freeweight')}
                    className={`flex-1 px-3 sm:px-4 py-1.5 sm:py-2 gt-tab gt-pill-label gt-transition gt-pressable whitespace-nowrap ${
                      activeTab === 'freeweight' ? 'gt-tab-active' : 'gt-tab-inactive'
                    }`}
                  >
                    フリーウェイト
                  </button>
                  <button
                    onClick={() => setActiveTab('condition')}
                    className={`flex-1 px-3 sm:px-4 py-1.5 sm:py-2 gt-tab gt-pill-label gt-transition gt-pressable ${
                      activeTab === 'condition' ? 'gt-tab-active' : 'gt-tab-inactive'
                    }`}
                  >
                    条件
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 max-h-[600px] overflow-y-auto bg-[rgba(254,255,250,0.92)]">
                {activeTab === 'machine' && (
                  <MachineSelector
                    selectedMachines={selectedMachines}
                    onSelectionChange={setSelectedMachines}
                  />
                )}

                {activeTab === 'freeweight' && (
                  <FreeWeightSelector
                    selectedFreeWeights={selectedFreeWeights}
                    onSelectionChange={setSelectedFreeWeights}
                  />
                )}

                {activeTab === 'condition' && (
                  <ConditionSelector
                    selectedFacilities={selectedFacilities}
                    onSelectionChange={setSelectedFacilities}
                  />
                )}
              </div>

              <div className="p-4 sm:p-6 border-t border-[rgba(231,103,76,0.18)] bg-[rgba(247,250,255,0.9)]">
                <button
                  onClick={goToSearchResults}
                  className="w-full gt-pill-button justify-center text-sm sm:text-base"
                >
                  <Search className="w-5 h-5" />
                  {totalSelections > 0
                    ? `ジムを検索する (${totalSelections}件の条件)`
                    : 'すべてのジムを検索'}
                </button>
              </div>
            </div>
          </div>

          <div className="col-span-1 hidden lg:block">
            <div className="gt-card p-6 sticky top-24 backdrop-blur-[8px] border border-[rgba(231,103,76,0.2)]">
              <div className="-m-6 mb-6 rounded-t-[28px] border-b border-[rgba(231,103,76,0.18)] bg-[radial-gradient(circle_at_20%_16%,rgba(96,134,255,0.18),transparent_60%),linear-gradient(180deg,rgba(247,250,255,0.96),rgba(234,242,255,0.9))] p-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[radial-gradient(circle_at_30%_30%,rgba(231,103,76,0.28),rgba(96,134,255,0.24))] flex items-center justify-center shadow-[0_20px_42px_-30px_rgba(189,101,78,0.46)]">
                    <MapPin className="w-5 h-5 text-[color:var(--gt-on-primary)]" />
                  </div>
                  <div>
                    <h3 className="gt-heading-md text-[color:var(--foreground)]">選択した条件</h3>
                    <p className="gt-body-muted">{totalSelections}個の条件を選択中</p>
                  </div>
                </div>
              </div>

              {!hasAnySelection() ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-[rgba(254,255,250,0.94)] border border-[rgba(231,103,76,0.18)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_18px_40px_-30px_rgba(189,101,78,0.45)]">
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
                  {Array.from(selectedMachines.entries()).map(([machineId, count]) => (
                    <div
                      key={`machine-summary-${machineId}`}
                      className="gt-surface-outline flex items-center justify-between p-3 rounded-2xl shadow-[0_16px_36px_-28px_rgba(189,101,78,0.44)]"
                    >
                      <span className="gt-label-lg text-[color:var(--gt-secondary-strong)]">{count > 1 ? `${machineId} (${count}台)` : machineId}</span>
                      <button
                        onClick={() => {
                          const newMachines = new Map(selectedMachines)
                          newMachines.delete(machineId)
                          setSelectedMachines(newMachines)
                        }}
                        className="text-[color:var(--gt-secondary-strong)] hover:text-[color:var(--gt-secondary-strong)] text-sm leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {Array.from(selectedFreeWeights).map((weightId) => (
                    <div
                      key={`weight-summary-${weightId}`}
                      className="gt-surface-outline flex items-center justify-between p-3 rounded-2xl shadow-[0_16px_36px_-28px_rgba(189,101,78,0.44)]"
                    >
                      <span className="gt-label-lg text-[color:var(--gt-primary-strong)]">{weightId}</span>
                      <button
                        onClick={() => {
                          const newWeights = new Set(selectedFreeWeights)
                          newWeights.delete(weightId)
                          setSelectedFreeWeights(newWeights)
                        }}
                        className="text-[color:var(--gt-primary-strong)] hover:text-[color:var(--gt-primary-strong)] text-sm leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {Array.from(selectedFacilities).map((facility) => (
                    <div
                      key={`facility-summary-${facility}`}
                      className="gt-surface-outline flex items-center justify-between p-3 rounded-2xl shadow-[0_16px_36px_-28px_rgba(189,101,78,0.44)]"
                    >
                      <span className="gt-label-lg" style={{ color: 'var(--gt-tertiary-strong)' }}>{facility}</span>
                      <button
                        onClick={() => {
                          const newFacilities = new Set(selectedFacilities)
                          newFacilities.delete(facility)
                          setSelectedFacilities(newFacilities)
                        }}
                        className="text-[color:var(--gt-tertiary-strong)] hover:text-[color:var(--gt-tertiary-strong)] text-sm leading-none"
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
