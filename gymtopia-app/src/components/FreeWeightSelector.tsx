'use client'

import { useState } from 'react'
import {
  ChevronRight, Dumbbell, Weight,
  Circle, Armchair, Home,
  Check, Target
} from 'lucide-react'

interface FreeWeightCategory {
  id: string
  name: string
  description: string
  icon: React.ElementType
  items: FreeWeightItem[]
}

interface FreeWeightItem {
  id: string
  name: string
  description?: string
}

interface FreeWeightSelectorProps {
  selectedFreeWeights: Set<string>
  onSelectionChange: (selected: Set<string>) => void
}

// ダンベル重量範囲の定義
interface WeightRange {
  id: string
  label: string
  min?: number
  max?: number
  color: string // グラデーション用
}

const dumbbellWeightRanges: WeightRange[] = [
  { id: 'all', label: '指定なし', min: 0, max: Infinity, color: 'from-gray-400 to-gray-500' },
  { id: 'light', label: '〜20kg（初心者向け）', min: 1, max: 20, color: 'from-green-400 to-green-500' },
  { id: 'medium', label: '21-40kg（中級者向け）', min: 21, max: 40, color: 'from-blue-400 to-blue-500' },
  { id: 'heavy', label: '41-60kg（上級者向け）', min: 41, max: 60, color: 'from-orange-400 to-orange-500' },
  { id: 'pro', label: '61kg以上（プロ仕様）', min: 61, max: Infinity, color: 'from-red-500 to-red-600' }
]

const freeWeightCategories: FreeWeightCategory[] = [
  {
    id: 'rack',
    name: 'パワーラック',
    description: 'スクワット・ベンチプレス対応',
    icon: Home,
    items: [
      { id: 'power_rack', name: 'パワーラック', description: 'フルケージ、安全バー付き' },
      { id: 'half_rack', name: 'ハーフラック', description: '省スペース型' },
      { id: 'squat_rack', name: 'スクワットラック', description: 'スクワット特化' },
      { id: 'combo_rack', name: 'コンボラック', description: 'プルアップバー付き' },
      { id: 'wall_mount_rack', name: 'ウォールマウントラック', description: '壁設置型' },
      { id: 'portable_rack', name: 'ポータブルラック', description: '移動可能' },
    ]
  },
  {
    id: 'bench',
    name: 'ベンチ',
    description: 'フラット・インクライン・デクライン',
    icon: Armchair,
    items: [
      { id: 'flat_bench', name: 'フラットベンチ', description: '基本的なベンチプレス用' },
      { id: 'adjustable_bench', name: 'アジャスタブルベンチ', description: '角度調整可能' },
      { id: 'olympic_bench', name: 'オリンピックベンチ', description: 'ラック付き' },
      { id: 'decline_bench', name: 'デクラインベンチ', description: '下部胸筋用' },
      { id: 'preacher_bench', name: 'プリーチャーベンチ', description: 'アームカール専用' },
      { id: 'utility_bench', name: 'ユーティリティベンチ', description: '多目的使用' },
    ]
  },
  {
    id: 'dumbbell',
    name: 'ダンベル',
    description: '固定式・可変式ダンベル',
    icon: Dumbbell,
    items: [
      { id: 'fixed_dumbbell', name: '固定式ダンベル（1-50kg）', description: 'ラバーコーティング' },
      { id: 'adjustable_dumbbell', name: '可変式ダンベル', description: 'PowerBlock、Bowflexなど' },
      { id: 'hex_dumbbell', name: 'ヘックスダンベル', description: '六角形、転がり防止' },
      { id: 'round_dumbbell', name: 'ラウンドダンベル', description: '丸型プロ仕様' },
      { id: 'vinyl_dumbbell', name: 'ビニールダンベル（軽量）', description: '1-10kg、初心者向け' },
    ]
  },
  {
    id: 'barbell',
    name: 'バーベル',
    description: 'オリンピックバー、カールバーなど',
    icon: Weight,
    items: [
      { id: 'olympic_bar', name: 'オリンピックバー（20kg）', description: '長さ220cm、直径28mm' },
      { id: 'olympic_bar_15', name: 'オリンピックバー（15kg）', description: '女性用、直径25mm' },
      { id: 'ez_curl_bar', name: 'EZカールバー', description: '腕のトレーニング特化' },
      { id: 'straight_bar', name: 'ストレートバー', description: '短めのバーベル' },
      { id: 'trap_bar', name: 'トラップバー（ヘックスバー）', description: 'デッドリフト用六角形バー' },
      { id: 'safety_squat_bar', name: 'セーフティスクワットバー', description: '肩への負担軽減' },
    ]
  },
  {
    id: 'kettlebell',
    name: 'ケトルベル',
    description: 'ファンクショナルトレーニング',
    icon: Circle,
    items: [
      { id: 'cast_iron_kb', name: 'キャストアイアンケトルベル', description: '4-48kg' },
      { id: 'competition_kb', name: 'コンペティションケトルベル', description: '統一サイズ' },
      { id: 'adjustable_kb', name: '可変式ケトルベル', description: '重量調整可能' },
      { id: 'vinyl_kb', name: 'ビニールケトルベル', description: '軽量、初心者向け' },
    ]
  }
]

export default function FreeWeightSelector({ selectedFreeWeights, onSelectionChange }: FreeWeightSelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [selectedWeightRanges, setSelectedWeightRanges] = useState<Set<string>>(new Set(['all']))

  const toggleItem = (itemId: string) => {
    const newSelected = new Set(selectedFreeWeights)

    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }

    onSelectionChange(newSelected)
  }

  const toggleWeightRange = (rangeId: string) => {
    const newSelected = new Set(selectedWeightRanges)

    if (rangeId === 'all') {
      // 「指定なし」を選択した場合、他をすべてクリア
      setSelectedWeightRanges(new Set(['all']))
    } else {
      // 他の範囲を選択した場合、「指定なし」を削除
      newSelected.delete('all')

      if (newSelected.has(rangeId)) {
        newSelected.delete(rangeId)
      } else {
        newSelected.add(rangeId)
      }

      // 何も選択されていない場合は「指定なし」に戻す
      if (newSelected.size === 0) {
        newSelected.add('all')
      }

      setSelectedWeightRanges(newSelected)
    }
  }

  const getCategoryItemCount = (categoryId: string) => {
    const category = freeWeightCategories.find(c => c.id === categoryId)
    if (!category) return 0
    return category.items.filter(item => selectedFreeWeights.has(item.id)).length
  }

  const toggleExpandCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  return (
    <div>
      {/* Categories */}
      <div className="space-y-4">
        {freeWeightCategories.map((category) => (
          <div 
            key={category.id}
            className="gt-card overflow-hidden"
          >
            {/* Category Header */}
            <button
              onClick={() => toggleExpandCategory(category.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-white/60 gt-transition gt-pressable"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gt-primary-plate rounded-xl flex items-center justify-center">
                  <category.icon className="w-5 h-5 text-[color:var(--gt-primary-strong)]" />
                </div>
                <div className="text-left">
                  <h3 className="gt-title-sm font-semibold" style={{ color: 'var(--gt-text-main)' }}>{category.name}</h3>
                  <p className="gt-label-sm" style={{ color: 'var(--text-muted)' }}>{category.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getCategoryItemCount(category.id) > 0 && (
                  <span className="gt-badge text-[11px]">
                    {getCategoryItemCount(category.id)}種類
                  </span>
                )}
                <ChevronRight 
                  className={`w-5 h-5 text-[rgba(68,73,73,0.6)] transition-transform ${
                    expandedCategories.has(category.id) ? 'rotate-90' : ''
                  }`} 
                />
              </div>
            </button>

            {/* Category Items */}
            {expandedCategories.has(category.id) && (
              <div className="border-t border-[rgba(231,103,76,0.16)] p-4 space-y-4">
                {/* Weight Range Filter for Dumbbell */}
                {category.id === 'dumbbell' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-[color:var(--gt-primary-strong)]" />
                      <h4 className="font-semibold text-sm text-[color:var(--foreground)]">重量範囲で絞り込み</h4>
                      {(selectedWeightRanges.size > 1 || !selectedWeightRanges.has('all')) && (
                        <span className="gt-badge text-[10px]">
                          {selectedWeightRanges.has('all') ? '指定なし' : `${selectedWeightRanges.size}種類`}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {dumbbellWeightRanges.map((range) => {
                        const isSelected = selectedWeightRanges.has(range.id)
                        return (
                          <button
                            key={range.id}
                            onClick={() => toggleWeightRange(range.id)}
                            className={`p-3 rounded-xl text-left transition-all border-2 ${
                              isSelected
                                ? `bg-gradient-to-r ${range.color} text-white shadow-[0_16px_36px_-24px_rgba(189,101,78,0.44)] border-transparent`
                                : 'bg-[rgba(254,255,250,0.92)] text-[color:var(--text-subtle)] border-[rgba(231,103,76,0.18)] hover:bg-white hover:border-[rgba(231,103,76,0.32)]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold">{range.label}</span>
                              {isSelected && <Check className="w-4 h-4" />}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                    <div className="border-t border-[rgba(231,103,76,0.16)] pt-3">
                      <p className="text-xs text-[color:var(--text-muted)]">
                        💡 複数の重量範囲を選択可能です。これにより該当範囲のダンベルが揃っているジムを検索できます。
                      </p>
                    </div>
                  </div>
                )}

                {/* Individual Items */}
                {category.items.map((item) => {
                  const isSelected = selectedFreeWeights.has(item.id)
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`w-full p-3 rounded-2xl flex items-center justify-between gt-transition ${
                        isSelected
                          ? 'gt-primary-plate border border-[rgba(231,103,76,0.18)] ring-1 ring-[rgba(231,103,76,0.26)]'
                          : 'gt-surface-outline hover:shadow-[0_20px_40px_-30px_rgba(189,101,78,0.42)]'
                      }`}
                    >
                      <div className="text-left flex-1">
                        <p className="gt-label-lg" style={{ color: 'var(--gt-text-main)' }}>{item.name}</p>
                        {item.description && (
                          <p className="gt-label-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
                        )}
                      </div>
                      <div className="flex items-center">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white'
                              : 'bg-[rgba(254,255,250,0.9)] border-2 border-[rgba(231,103,76,0.18)]'
                          }`}
                        >
                          {isSelected && <Check className="w-4 h-4" />}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
