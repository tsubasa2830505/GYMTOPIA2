'use client'

import { MapPin, Calendar, Dumbbell, Search } from 'lucide-react'
import Image from 'next/image'
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
  const [selectedFreeWeights, setSelectedFreeWeights] = useState<Map<string, number>>(new Map())
  const [selectedFacilities, setSelectedFacilities] = useState<Set<string>>(new Set())
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
      params.set('freeWeights', Array.from(selectedFreeWeights.keys()).join(','))
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

  const hasAnySelection = () => totalSelections > 0

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 right-16 h-60 w-60 rounded-full bg-[radial-gradient(circle_at_center,rgba(120,168,255,0.3),transparent_68%)] blur-3xl opacity-70" />
      <div className="pointer-events-none absolute top-[45%] -left-28 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(132,210,255,0.26),transparent_70%)] blur-3xl opacity-65" />

      <header className="sticky top-0 z-50 border-b border-[rgba(157,176,226,0.45)] bg-[rgba(247,250,255,0.9)] backdrop-blur-xl shadow-[0_20px_46px_-28px_rgba(26,44,94,0.45)]">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-[radial-gradient(circle_at_30%_30%,rgba(59,99,243,0.42),rgba(142,208,255,0.32))] flex items-center justify-center shadow-[0_16px_30px_-20px_rgba(26,44,94,0.42)]">
              <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--gt-on-primary)]" />
            </div>
            <div>
              <Image
                src="/images/gymtopia-logo.svg"
                alt="ジムトピア"
                width={120}
                height={32}
                className="h-6 sm:h-8 w-auto"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 pt-8 pb-12 sm:pt-12 sm:pb-16 space-y-10">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="col-span-1 lg:col-span-2">
            <div className="gt-card rounded-[32px] border border-[rgba(157,176,226,0.5)] backdrop-blur-sm">
              <div
                className="relative p-4 sm:p-6 border-b border-[rgba(157,176,226,0.45)] bg-[rgba(243,247,255,0.9)]"
                ref={conditionSectionRef}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-[radial-gradient(circle_at_30%_30%,rgba(59,99,243,0.24),rgba(132,210,255,0.18))] flex items-center justify-center shadow-[0_14px_34px_-22px_rgba(26,44,94,0.45)]">
                        <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--gt-primary-strong)]" />
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
                          setSelectedFreeWeights(new Map())
                          setSelectedFacilities(new Set())
                        }}
                        className="text-[10px] sm:text-xs font-semibold text-[color:var(--text-muted)] underline-offset-4 hover:underline"
                      >
                        条件をクリア
                      </button>
                    )}
                  </div>

                  {totalSelections > 0 && (
                    <div className="rounded-3xl border border-[rgba(157,176,226,0.42)] bg-[rgba(236,242,255,0.96)] px-4 py-4 sm:px-5 sm:py-5 shadow-[0_24px_50px_-32px_rgba(26,44,94,0.48)] animate-pulse-once">
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
                              className="text-[color:var(--gt-secondary-strong)] hover:text-[#1f4f83] leading-none"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {Array.from(selectedFreeWeights).map(([weightId, count]) => (
                          <div key={`weight-${weightId}`} className="gt-chip gt-chip--primary text-[11px] sm:text-xs">
                            <span>{weightId} ({count}個)</span>
                            <button
                              onClick={() => {
                                const newWeights = new Map(selectedFreeWeights)
                                newWeights.delete(weightId)
                                setSelectedFreeWeights(newWeights)
                              }}
                              className="text-[color:var(--gt-primary-strong)] hover:text-[#1d3784] leading-none"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {Array.from(selectedFacilities).map((facility) => (
                          <div
                            key={`facility-${facility}`}
                            className="gt-chip text-[11px] sm:text-xs"
                            style={{ borderColor: 'rgba(123, 139, 255, 0.32)', color: 'var(--gt-tertiary-strong)' }}
                          >
                            <span>{facility}</span>
                            <button
                              onClick={() => {
                                const newFacilities = new Set(selectedFacilities)
                                newFacilities.delete(facility)
                                setSelectedFacilities(newFacilities)
                              }}
                              className="text-[color:var(--gt-tertiary-strong)] hover:text-[#3848ad] leading-none"
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

              <div className="p-4 sm:p-6 border-b border-[rgba(157,176,226,0.38)] bg-[rgba(247,250,255,0.88)]">
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

              <div className="p-4 sm:p-6 max-h-[600px] overflow-y-auto bg-[rgba(243,247,255,0.92)]">
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

              <div className="p-4 sm:p-6 border-t border-[rgba(157,176,226,0.38)] bg-[rgba(247,250,255,0.9)]">
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
            <div className="gt-card p-6 sticky top-24 backdrop-blur-[8px] border border-[rgba(157,176,226,0.5)]">
              <div className="-m-6 mb-6 rounded-t-[28px] border-b border-[rgba(157,176,226,0.45)] bg-[radial-gradient(circle_at_20%_16%,rgba(142,208,255,0.22),transparent_60%),linear-gradient(180deg,rgba(247,250,255,0.96),rgba(234,242,255,0.9))] p-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[radial-gradient(circle_at_30%_30%,rgba(59,99,243,0.28),rgba(132,210,255,0.28))] flex items-center justify-center shadow-[0_20px_42px_-30px_rgba(26,44,94,0.45)]">
                    <MapPin className="w-5 h-5 text-[var(--gt-on-primary)]" />
                  </div>
                  <div>
                    <h3 className="gt-heading-md text-[color:var(--foreground)]">選択した条件</h3>
                    <p className="gt-body-muted">{totalSelections}個の条件を選択中</p>
                  </div>
                </div>
              </div>

              {!hasAnySelection() ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-[rgba(243,247,255,0.94)] border border-[rgba(157,176,226,0.45)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_18px_40px_-30px_rgba(26,44,94,0.45)]">
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
                      className="gt-surface-outline flex items-center justify-between p-3 rounded-2xl shadow-[0_16px_36px_-28px_rgba(26,44,94,0.45)]"
                    >
                      <span className="gt-label-lg text-[color:var(--gt-secondary-strong)]">{count > 1 ? `${machineId} (${count}台)` : machineId}</span>
                      <button
                        onClick={() => {
                          const newMachines = new Map(selectedMachines)
                          newMachines.delete(machineId)
                          setSelectedMachines(newMachines)
                        }}
                        className="text-[color:var(--gt-secondary-strong)] hover:text-[#1f4f83] text-sm leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {Array.from(selectedFreeWeights).map(([weightId, count]) => (
                    <div
                      key={`weight-summary-${weightId}`}
                      className="gt-surface-outline flex items-center justify-between p-3 rounded-2xl shadow-[0_16px_36px_-28px_rgba(26,44,94,0.45)]"
                    >
                      <span className="gt-label-lg text-[color:var(--gt-primary-strong)]">{weightId} ({count}個)</span>
                      <button
                        onClick={() => {
                          const newWeights = new Map(selectedFreeWeights)
                          newWeights.delete(weightId)
                          setSelectedFreeWeights(newWeights)
                        }}
                        className="text-[color:var(--gt-primary-strong)] hover:text-[#1d3784] text-sm leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {Array.from(selectedFacilities).map((facility) => (
                    <div
                      key={`facility-summary-${facility}`}
                      className="gt-surface-outline flex items-center justify-between p-3 rounded-2xl shadow-[0_16px_36px_-28px_rgba(26,44,94,0.45)]"
                    >
                      <span className="gt-label-lg" style={{ color: 'var(--gt-tertiary-strong)' }}>{facility}</span>
                      <button
                        onClick={() => {
                          const newFacilities = new Set(selectedFacilities)
                          newFacilities.delete(facility)
                          setSelectedFacilities(newFacilities)
                        }}
                        className="text-[color:var(--gt-tertiary-strong)] hover:text-[#3848ad] text-sm leading-none"
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
