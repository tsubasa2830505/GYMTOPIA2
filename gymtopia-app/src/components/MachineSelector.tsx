'use client'

import { useState, useEffect } from 'react'
import {
  ChevronRight, Check, Settings, Target, Factory,
  Activity, Dumbbell, Plus, Minus
} from 'lucide-react'
import { getMuscleParts } from '@/lib/supabase/muscle-parts'
import { getMachines, getMachineMakers } from '@/lib/supabase/machines'
import type { Machine, MachineMaker } from '@/lib/supabase/machines'

interface MachineSelectorProps {
  selectedMachines: Map<string, number>
  onSelectionChange: (selected: Map<string, number>) => void
}

interface MachineFilter {
  targetCategory: string | null  // 選択されたカテゴリー
  targetParts: string[]  // 選択された詳細部位
  maker: string[]
}

// 日本語と英語のカテゴリーマッピング
const categoryMapping: { [key: string]: string } = {
  '胸': 'chest',
  '背中': 'back',
  '肩': 'shoulder',
  '脚': 'legs',
  '腕': 'arms',
  '体幹': 'core',
  'chest': '胸',
  'back': '背中',
  'shoulder': '肩',
  'legs': '脚',
  'arms': '腕',
  'core': '体幹',
  'cardio': '有酸素',
  'multiple': '複合'
}

// デフォルトの部位データ（Supabaseから取得できない場合のフォールバック）
const defaultTargetOptions = [
  { id: '胸', name: '胸', parts: ['上部', '中部', '下部'] },
  { id: '背中', name: '背中', parts: ['上部', '中部', '下部', '僧帽筋'] },
  { id: '肩', name: '肩', parts: ['前部', '中部', '後部'] },
  { id: '脚', name: '脚', parts: ['大腿四頭筋', 'ハムストリング', '臀筋', 'カーフ', '内転筋', '外転筋'] },
  { id: '腕', name: '腕', parts: ['二頭筋', '三頭筋'] },
  { id: '体幹', name: '体幹', parts: ['腹直筋', '腹斜筋', '下背部'] },
]


// デフォルトのメーカーオプション（Supabaseから取得できない場合のフォールバック）
const defaultMakerOptions = [
  { id: 'hammer', name: 'Hammer Strength' },
  { id: 'cybex', name: 'Cybex' },
  { id: 'life-fitness', name: 'Life Fitness' },
  { id: 'technogym', name: 'Technogym' },
  { id: 'matrix', name: 'Matrix' },
  { id: 'nautilus', name: 'Nautilus' },
]

export default function MachineSelector({ selectedMachines, onSelectionChange }: MachineSelectorProps) {
  const [filter, setFilter] = useState<MachineFilter>({
    targetCategory: null,
    targetParts: [],
    type: [],
    maker: []
  })
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['target', 'maker']))
  const [targetOptions, setTargetOptions] = useState(defaultTargetOptions)
  const [isLoadingParts, setIsLoadingParts] = useState(true)
  const [showPartsDetail, setShowPartsDetail] = useState(false)
  const [machines, setMachines] = useState<Machine[]>([])
  const [makerOptions, setMakerOptions] = useState<MachineMaker[]>([
    { id: 'hammer', name: 'Hammer Strength' },
    { id: 'cybex', name: 'Cybex' },
    { id: 'life-fitness', name: 'Life Fitness' },
    { id: 'technogym', name: 'Technogym' },
    { id: 'matrix', name: 'Matrix' },
    { id: 'nautilus', name: 'Nautilus' },
  ])
  const [isLoadingMachines, setIsLoadingMachines] = useState(true)

  // Supabaseから筋肉部位データを取得
  useEffect(() => {
    async function fetchMuscleParts() {
      setIsLoadingParts(true)
      try {
        const parts = await getMuscleParts()
        if (parts && parts.length > 0) {
          // Supabaseのデータ形式をコンポーネントの形式に変換
          const formattedParts = parts.map(part => ({
            id: part.category,
            name: part.name,
            parts: part.parts
          }))
          setTargetOptions(formattedParts)
        }
      } catch (error) {
        console.error('Failed to fetch muscle parts:', error)
        // エラーの場合はデフォルトデータを使用
      } finally {
        setIsLoadingParts(false)
      }
    }

    fetchMuscleParts()
  }, [])

  // Supabaseからマシンとメーカーデータを取得
  useEffect(() => {
    async function fetchMachinesAndMakers() {
      setIsLoadingMachines(true)
      try {
        // マシンとメーカーを並行して取得
        const [machinesData, makersData] = await Promise.all([
          getMachines(),
          getMachineMakers()
        ])

        if (machinesData && machinesData.length > 0) {
          setMachines(machinesData)
        }

        if (makersData && makersData.length > 0) {
          setMakerOptions(makersData)
        }
      } catch (error) {
        console.error('Failed to fetch machines and makers:', error)
      } finally {
        setIsLoadingMachines(false)
      }
    }

    fetchMachinesAndMakers()
  }, [])
  
  // ターゲットに基づいて関連するタイプを取得
  const getRelatedTypes = () => {
    if (!filter.targetCategory) return []
    
    const relatedTypes = new Set<string>()
    
    // 選択されたターゲットに該当するマシンのタイプを収集
    machines.forEach(machine => {
      // 日本語カテゴリーを英語に変換して比較
      const englishCategory = categoryMapping[filter.targetCategory] || filter.targetCategory
      if (filter.targetCategory && machine.target_category === englishCategory) {
        relatedTypes.add(machine.type)
      }
    })
    
    return Array.from(relatedTypes)
  }
  
  // ターゲットとタイプに基づいて関連するメーカーを取得
  const getRelatedMakers = () => {
    if (!filter.targetCategory && filter.type.length === 0) return []
    
    const relatedMakers = new Set<string>()
    
    // フィルターに該当するマシンのメーカーを収集
    machines.forEach(machine => {
      // 日本語カテゴリーを英語に変換して比較
      const englishCategory = categoryMapping[filter.targetCategory] || filter.targetCategory
      const targetMatch = !filter.targetCategory ||
        machine.target_category === englishCategory
      const typeMatch = filter.type.length === 0 ||
        filter.type.includes(machine.type)

      if (targetMatch && typeMatch) {
        relatedMakers.add(machine.maker)
      }
    })
    
    return Array.from(relatedMakers)
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  // カテゴリー選択
  const selectCategory = (categoryId: string) => {
    setFilter({
      ...filter,
      targetCategory: filter.targetCategory === categoryId ? null : categoryId,
      targetParts: []  // カテゴリー変更時は詳細部位をリセット
    })
    setShowPartsDetail(filter.targetCategory !== categoryId && categoryId !== null)
    
    // 部位を選択したら自動的にタイプセクションも開く（部位×マシンの組み合わせ検索を促進）
    if (filter.targetCategory !== categoryId && categoryId !== null) {
      setExpandedSections(new Set(['target', 'type']))
    }
  }

  // 詳細部位選択
  const togglePart = (part: string) => {
    const newParts = [...filter.targetParts]
    const index = newParts.indexOf(part)
    
    if (index > -1) {
      newParts.splice(index, 1)
    } else {
      newParts.push(part)
    }
    
    setFilter({ ...filter, targetParts: newParts })
  }

  const toggleFilter = (category: 'type' | 'maker', value: string) => {
    const newFilter = { ...filter }
    const index = newFilter[category].indexOf(value)
    
    if (index > -1) {
      newFilter[category] = newFilter[category].filter(item => item !== value)
    } else {
      newFilter[category] = [...newFilter[category], value]
    }
    
    // タイプを選択したら自動的にメーカーセクションを開く
    if (category === 'type' && newFilter.type.length > 0) {
      setExpandedSections(new Set(['type', 'maker']))
    }
    
    setFilter(newFilter)
  }

  const filteredMachines = machines.filter(machine => {
    // カテゴリーマッチ（日本語カテゴリーを英語に変換して比較）
    const englishCategory = categoryMapping[filter.targetCategory] || filter.targetCategory
    const targetMatch = !filter.targetCategory ||
      machine.target_category === englishCategory

    // 詳細部位マッチ（選択されている場合のみ）
    const partMatch = filter.targetParts.length === 0 ||
      (machine.target_detail && filter.targetParts.includes(machine.target_detail))

    // タイプマッチ
    const typeMatch = filter.type.length === 0 || filter.type.includes(machine.type)

    // メーカーマッチ
    const makerMatch = filter.maker.length === 0 || filter.maker.includes(machine.maker)

    return targetMatch && partMatch && typeMatch && makerMatch
  })

  const toggleMachine = (machineId: string) => {
    const newSelected = new Map(selectedMachines)
    if (newSelected.has(machineId)) {
      newSelected.delete(machineId)
    } else {
      newSelected.set(machineId, 1)
    }
    onSelectionChange(newSelected)
  }

  const updateMachineCount = (machineId: string, count: number) => {
    const newSelected = new Map(selectedMachines)
    if (count <= 0) {
      newSelected.delete(machineId)
    } else {
      newSelected.set(machineId, count)
    }
    onSelectionChange(newSelected)
  }

  const selectAllFiltered = () => {
    const newSelected = new Map(selectedMachines)
    filteredMachines.forEach(machine => {
      if (!newSelected.has(machine.id)) {
        newSelected.set(machine.id, 1)
      }
    })
    onSelectionChange(newSelected)
  }

  const deselectAllFiltered = () => {
    const newSelected = new Map(selectedMachines)
    filteredMachines.forEach(machine => {
      newSelected.delete(machine.id)
    })
    onSelectionChange(newSelected)
  }

  return (
    <div className="space-y-4">
      {/* フィルター部分 */}
      <div className="space-y-3">
        {/* ターゲット（部位） */}
        <div className="gt-card overflow-hidden">
          <button
            onClick={() => toggleSection('target')}
            className="w-full p-4 flex items-center justify-between hover:bg-white/60 gt-transition"
          >
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-[color:var(--gt-primary-strong)]" />
              <h3 className="font-semibold text-[color:var(--foreground)]">ターゲット（部位）</h3>
              {filter.targetCategory && (
                <span className="gt-badge text-[11px]">
                  {targetOptions.find(t => t.id === filter.targetCategory)?.name}
                  {filter.targetParts.length > 0 && ` (${filter.targetParts.length})`}
                </span>
              )}
            </div>
            <ChevronRight 
              className={`w-5 h-5 text-[color:var(--text-muted)] transition-transform ${
                expandedSections.has('target') ? 'rotate-90' : ''
              }`} 
            />
          </button>
          
          {expandedSections.has('target') && (
            <div className="border-t border-white/60 p-4">
              {isLoadingParts ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[color:var(--gt-primary-strong)]"></div>
                  <p className="gt-body-muted mt-2">部位データを読み込み中...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* カテゴリー選択 */}
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--foreground)] mb-2">
                      1. 鍛えたい部位を選択
                      <span className="gt-body-muted ml-2">
                        （選択するとその部位向けのマシンのみ表示されます）
                      </span>
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {targetOptions.map((target) => (
                        <button
                          key={target.id}
                          onClick={() => selectCategory(target.id)}
                          className={`p-3 rounded-xl text-sm font-semibold transition-all border-2 ${
                            filter.targetCategory === target.id
                              ? 'bg-gradient-to-r from-[var(--gt-primary)] via-[var(--gt-secondary)] to-[var(--gt-secondary)] text-white shadow-[0_18px_36px_-24px_rgba(189,101,78,0.46)] border-transparent'
                              : 'bg-[rgba(254,255,250,0.92)] text-[color:var(--text-subtle)] border-[rgba(231,103,76,0.2)] hover:border-[rgba(231,103,76,0.32)] hover:bg-white'
                          }`}
                        >
                          {target.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 詳細部位選択 */}
                  {filter.targetCategory && showPartsDetail && (
                    <div className="animate-fadeIn">
                      <p className="text-sm font-medium text-[color:var(--foreground)] mb-2">
                        2. {targetOptions.find(t => t.id === filter.targetCategory)?.name}の詳細部位を選択
                        <span className="text-xs text-[color:var(--text-muted)] ml-2">（任意：さらに絞り込めます）</span>
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {targetOptions
                          .find(t => t.id === filter.targetCategory)
                          ?.parts.map((part) => (
                            <button
                              key={part}
                              onClick={() => togglePart(part)}
                              className={`p-2 rounded-lg text-xs font-semibold transition-all border-2 ${
                                filter.targetParts.includes(part)
                                  ? 'bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white shadow-[0_14px_30px_-20px_rgba(189,101,78,0.46)] border-transparent'
                                  : 'bg-[rgba(254,255,250,0.85)] text-[color:var(--text-subtle)] border-[rgba(231,103,76,0.18)] hover:bg-white hover:border-[rgba(231,103,76,0.32)]'
                              }`}
                            >
                              {part}
                            </button>
                          ))}
                      </div>
                      <p className="text-xs text-[color:var(--text-muted)] mt-2">
                        ※ 詳細部位を選択しない場合は、{targetOptions.find(t => t.id === filter.targetCategory)?.name}全体が対象になります
                      </p>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}
        </div>
        {/* メーカー */}
        <div className="gt-card overflow-hidden">
          <button
            onClick={() => toggleSection('maker')}
            className="w-full p-4 flex items-center justify-between hover:bg-white/60 gt-transition"
          >
            <div className="flex items-center gap-3">
              <Factory className="w-5 h-5 text-[color:var(--gt-tertiary-strong)]" />
              <h3 className="font-semibold text-[color:var(--foreground)]">メーカー</h3>
              {filter.maker.length > 0 && (
                <span className="gt-badge text-[11px]" style={{ background: 'rgba(245, 177, 143, 0.18)', color: 'var(--gt-tertiary-strong)', borderColor: 'rgba(245, 177, 143, 0.28)' }}>
                  {filter.maker.length}
                </span>
              )}
            </div>
            <ChevronRight 
              className={`w-5 h-5 text-[color:var(--text-muted)] transition-transform ${
                expandedSections.has('maker') ? 'rotate-90' : ''
              }`} 
            />
          </button>
          
          {expandedSections.has('maker') && (
            <div className="border-t border-white/60 p-4">
              <div className="grid grid-cols-2 gap-2">
                {makerOptions.map((maker) => {
                  const relatedMakers = getRelatedMakers()
                  const isRelated = relatedMakers.includes(maker.id)
                  const isSelected = filter.maker.includes(maker.id)
                  
                  return (
                    <button
                      key={maker.id}
                      onClick={() => toggleFilter('maker', maker.id)}
                      className={`p-2 rounded-lg text-sm font-medium transition-all border-2 ${
                        isSelected
                          ? 'bg-gradient-to-r from-[var(--gt-primary)] via-[var(--gt-secondary)] to-[var(--gt-secondary)] text-white shadow-[0_16px_36px_-24px_rgba(189,101,78,0.44)] border-transparent'
                          : isRelated && (filter.targetCategory || filter.type.length > 0)
                          ? 'bg-[rgba(254,255,250,0.92)] text-[color:var(--gt-primary-strong)] border-[rgba(231,103,76,0.26)] hover:bg-white'
                          : 'bg-[rgba(254,255,250,0.8)] text-[color:var(--text-subtle)] border-[rgba(231,103,76,0.18)] hover:bg-white hover:border-[rgba(231,103,76,0.24)]'
                      }`}
                    >
                      {maker.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* フィルター結果と一括操作 */}
      <div className="gt-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="gt-body">
              {filter.targetCategory && (
                <span className="font-semibold text-[color:var(--gt-primary-strong)]">
                  {targetOptions.find(t => t.id === filter.targetCategory)?.name}向けの
                </span>
              )}
              {filteredMachines.length}台のマシンが見つかりました
              {selectedMachines.size > 0 && (
                <span className="ml-2 font-semibold text-[color:var(--gt-primary-strong)]">
                  （{Array.from(selectedMachines.keys()).filter(id =>
                    filteredMachines.some(m => m.id === id)
                  ).reduce((sum, id) => sum + (selectedMachines.get(id) || 0), 0)}台選択中）
                </span>
              )}
            </p>
            {filter.targetCategory && filteredMachines.length > 0 && (
              <p className="text-xs text-[color:var(--text-muted)] mt-1">
                ※ {targetOptions.find(t => t.id === filter.targetCategory)?.name}を鍛えるのに最適なマシンのみ表示しています
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={selectAllFiltered}
              className="px-3 py-1 rounded-full bg-gradient-to-r from-[var(--gt-primary)] via-[var(--gt-secondary)] to-[var(--gt-secondary)] text-white text-xs sm:text-sm font-semibold shadow-[0_14px_34px_-22px_rgba(189,101,78,0.46)] transition-transform hover:-translate-y-[1px]"
            >
              すべて選択
            </button>
            <button
              onClick={deselectAllFiltered}
              className="px-3 py-1 rounded-full bg-[rgba(254,255,250,0.9)] text-[color:var(--text-subtle)] text-xs sm:text-sm font-semibold border border-[rgba(231,103,76,0.18)] hover:bg-white transition-colors"
            >
              選択解除
            </button>
          </div>
        </div>
      </div>

      {/* マシン一覧 */}
      {isLoadingMachines ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--gt-primary-strong)]"></div>
          <p className="text-sm text-[color:var(--text-muted)] mt-2">マシンデータを読み込み中...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredMachines.map((machine) => {
            // 英語カテゴリーを日本語に変換して表示
            const japaneseCategory = categoryMapping[machine.target_category] || machine.target_category
            const target = targetOptions.find(t => t.id === japaneseCategory)
            const maker = makerOptions.find(m => m.id === machine.maker)
            const machineCount = selectedMachines.get(machine.id) || 0

            return (
            <div
              key={machine.id}
              className={`p-4 rounded-xl transition-all ${
                machineCount > 0
                  ? 'gt-primary-plate border-2 border-[rgba(231,103,76,0.32)]'
                  : 'gt-layer border-2 border-[rgba(231,103,76,0.18)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left flex-1">
                  <p className="font-medium text-[color:var(--foreground)]">{machine.name}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded text-xs bg-[rgba(231,103,76,0.16)] text-[color:var(--gt-primary-strong)]">
                      {target?.name}{machine.target_detail ? ` - ${machine.target_detail}` : ''}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs bg-[rgba(123,139,255,0.16)] text-[color:var(--gt-tertiary-strong)]">
                      {maker?.name}
                    </span>
                  </div>
                </div>

                {/* 個数調整UI */}
                <div className="flex items-center gap-2">
                  {machineCount > 0 ? (
                    <>
                      <button
                        onClick={() => updateMachineCount(machine.id, machineCount - 1)}
                        className="w-8 h-8 rounded-lg bg-[rgba(254,255,250,0.88)] border border-[rgba(231,103,76,0.18)] hover:bg-white flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-4 h-4 text-[color:var(--foreground)]" />
                      </button>
                      <div className="min-w-[3rem] text-center">
                        <span className="font-medium text-lg text-[color:var(--gt-primary-strong)]">{machineCount}</span>
                        <span className="text-sm text-[color:var(--text-muted)] ml-1">台</span>
                      </div>
                      <button
                        onClick={() => updateMachineCount(machine.id, machineCount + 1)}
                        className="w-8 h-8 rounded-lg bg-[color:var(--gt-primary)] hover:bg-[color:var(--gt-primary-strong)] flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => toggleMachine(machine.id)}
                      className="px-4 py-2 rounded-lg bg-[rgba(254,255,250,0.9)] hover:bg-white text-[color:var(--text-subtle)] font-medium text-sm transition-colors border-2 border-[rgba(231,103,76,0.18)] hover:border-[rgba(231,103,76,0.32)]"
                    >
                      追加
                    </button>
                  )}
                </div>
              </div>
            </div>
            )
          })}
        </div>
      )}

      {!isLoadingMachines && filteredMachines.length === 0 && (
        <div className="text-center py-8 text-[color:var(--text-muted)]">
          <Settings className="w-12 h-12 mx-auto mb-3 text-[rgba(68,73,73,0.4)]" />
          <p>条件に一致するマシンが見つかりません</p>
          <p className="text-sm mt-1">フィルターを調整してください</p>
        </div>
      )}
    </div>
  )
}
