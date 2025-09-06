'use client'

import { useState } from 'react'
import { Check, ChevronRight } from 'lucide-react'

interface DetailedOption {
  id: string
  category: string
  name: string
  variations: {
    id: string
    name: string
    description?: string
  }[]
}

const detailedOptions: DetailedOption[] = [
  {
    id: 'chest_detailed',
    category: '胸部',
    name: 'チェストプレス系',
    variations: [
      { id: 'flat_press', name: 'フラットプレス', description: '水平位置' },
      { id: 'incline_press', name: 'インクラインプレス', description: '15-45度上向き' },
      { id: 'decline_press', name: 'デクラインプレス', description: '15-30度下向き' },
      { id: 'converging_press', name: 'コンバージングプレス', description: '軌道が収束' },
      { id: 'iso_lateral_press', name: 'アイソラテラルプレス', description: '左右独立' }
    ]
  },
  {
    id: 'chest_fly',
    category: '胸部',
    name: 'フライ系',
    variations: [
      { id: 'pec_fly', name: 'ペックフライ', description: '座位で胸を開閉' },
      { id: 'cable_fly', name: 'ケーブルフライ', description: '多角度調整可能' },
      { id: 'dumbbell_fly_bench', name: 'ダンベルフライ用ベンチ', description: '可動域大' }
    ]
  },
  {
    id: 'back_pull',
    category: '背中',
    name: 'プルダウン系',
    variations: [
      { id: 'wide_grip_lat', name: 'ワイドグリップ', description: '広背筋外側' },
      { id: 'close_grip_lat', name: 'クローズグリップ', description: '広背筋下部' },
      { id: 'neutral_grip_lat', name: 'ニュートラルグリップ', description: '肘に優しい' },
      { id: 'reverse_grip_lat', name: 'リバースグリップ', description: '二頭筋も関与' },
      { id: 'iso_lateral_pulldown', name: 'アイソラテラルプルダウン', description: '左右独立' }
    ]
  },
  {
    id: 'back_row',
    category: '背中',
    name: 'ローイング系',
    variations: [
      { id: 'seated_cable_row', name: 'シーテッドケーブルロー', description: '安定した軌道' },
      { id: 'chest_supported_row', name: 'チェストサポートロー', description: '腰部保護' },
      { id: 't_bar_row', name: 'Tバーロー', description: '厚みを作る' },
      { id: 'hammer_row', name: 'ハンマーストレングスロー', description: '強度重視' }
    ]
  },
  {
    id: 'legs_press',
    category: '脚',
    name: 'プレス系',
    variations: [
      { id: '45_degree_press', name: '45度レッグプレス', description: '標準的な角度' },
      { id: 'horizontal_press', name: '水平レッグプレス', description: '腰に優しい' },
      { id: 'vertical_press', name: '垂直レッグプレス', description: '省スペース' },
      { id: 'hack_squat', name: 'ハックスクワット', description: 'スクワット動作' },
      { id: 'pendulum_squat', name: 'ペンデュラムスクワット', description: '自然な軌道' }
    ]
  },
  {
    id: 'legs_isolation',
    category: '脚',
    name: 'アイソレーション系',
    variations: [
      { id: 'leg_extension', name: 'レッグエクステンション', description: '大腿四頭筋' },
      { id: 'lying_leg_curl', name: 'ライイングレッグカール', description: 'うつ伏せ' },
      { id: 'seated_leg_curl', name: 'シーテッドレッグカール', description: '座位' },
      { id: 'standing_leg_curl', name: 'スタンディングレッグカール', description: '立位' },
      { id: 'glute_ham_raise', name: 'グルートハムレイズ', description: '臀筋+ハム' }
    ]
  }
]

interface MachineDetailedSearchProps {
  selectedOptions: Set<string>
  onSelectionChange: (options: Set<string>) => void
}

export default function MachineDetailedSearch({ 
  selectedOptions, 
  onSelectionChange 
}: MachineDetailedSearchProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('chest_detailed')

  const handleVariationToggle = (variationId: string) => {
    const newSelection = new Set(selectedOptions)
    
    if (newSelection.has(variationId)) {
      newSelection.delete(variationId)
    } else {
      newSelection.add(variationId)
    }
    
    onSelectionChange(newSelection)
  }

  const handleCategoryToggle = (categoryId: string) => {
    const newSelection = new Set(selectedOptions)
    const option = detailedOptions.find(o => o.id === categoryId)
    
    if (!option) return

    const allSelected = option.variations.every(v => 
      selectedOptions.has(v.id)
    )

    if (allSelected) {
      // Remove all
      option.variations.forEach(v => {
        newSelection.delete(v.id)
      })
    } else {
      // Add all
      option.variations.forEach(v => {
        newSelection.add(v.id)
      })
    }

    onSelectionChange(newSelection)
  }

  const getCategorySelectedCount = (categoryId: string) => {
    const option = detailedOptions.find(o => o.id === categoryId)
    if (!option) return 0
    return option.variations.filter(v => selectedOptions.has(v.id)).length
  }

  // Group by category
  const groupedOptions = detailedOptions.reduce((acc, option) => {
    if (!acc[option.category]) {
      acc[option.category] = []
    }
    acc[option.category].push(option)
    return acc
  }, {} as Record<string, DetailedOption[]>)

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 mb-4">
        部位と動作の詳細を選択してください
      </p>

      {Object.entries(groupedOptions).map(([category, options]) => (
        <div key={category} className="space-y-3">
          <h3 className="font-semibold text-slate-900 px-1">{category}</h3>
          
          {options.map((option) => {
            const isExpanded = expandedCategory === option.id
            const selectedCount = getCategorySelectedCount(option.id)
            const totalCount = option.variations.length
            const allSelected = selectedCount === totalCount
            
            return (
              <div key={option.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {/* Option Header */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setExpandedCategory(isExpanded ? null : option.id)}
                      className="flex-1 flex items-center justify-between"
                    >
                      <div className="text-left">
                        <h4 className="font-medium text-slate-900">{option.name}</h4>
                        {selectedCount > 0 && (
                          <p className="text-xs text-blue-600 mt-0.5">
                            {selectedCount}/{totalCount} 選択中
                          </p>
                        )}
                      </div>
                      <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`} />
                    </button>
                    
                    <button
                      onClick={() => handleCategoryToggle(option.id)}
                      className={`
                        ml-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                        ${allSelected 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }
                      `}
                    >
                      {allSelected ? '選択解除' : 'すべて選択'}
                    </button>
                  </div>
                </div>

                {/* Variations */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-2">
                    {option.variations.map((variation) => {
                      const isChecked = selectedOptions.has(variation.id)
                      
                      return (
                        <button
                          key={variation.id}
                          onClick={() => handleVariationToggle(variation.id)}
                          className={`
                            w-full p-3 rounded-lg text-left transition-all
                            ${isChecked 
                              ? 'bg-blue-100 border-2 border-blue-500' 
                              : 'bg-white border-2 border-slate-200 hover:border-slate-300'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`font-medium text-sm ${
                                isChecked ? 'text-blue-700' : 'text-slate-900'
                              }`}>
                                {variation.name}
                              </p>
                              {variation.description && (
                                <p className="text-xs text-slate-600 mt-0.5">
                                  {variation.description}
                                </p>
                              )}
                            </div>
                            <div className={`
                              w-5 h-5 rounded border-2 flex items-center justify-center
                              ${isChecked 
                                ? 'bg-blue-500 border-blue-500' 
                                : 'border-slate-300'
                              }
                            `}>
                              {isChecked && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}