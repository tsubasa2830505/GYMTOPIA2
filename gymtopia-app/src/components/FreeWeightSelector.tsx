'use client'

import { useState } from 'react'
import { 
  ChevronRight, Dumbbell, Weight, 
  Circle, Armchair, Home,
  Plus, Minus
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
  selectedFreeWeights: Map<string, number>
  onSelectionChange: (selected: Map<string, number>) => void
}

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

  const handleQuantityChange = (itemId: string, quantity: number) => {
    const newSelected = new Map(selectedFreeWeights)
    
    if (quantity === 0) {
      newSelected.delete(itemId)
    } else {
      newSelected.set(itemId, quantity)
    }
    
    onSelectionChange(newSelected)
  }
  
  const incrementQuantity = (itemId: string) => {
    const currentQty = selectedFreeWeights.get(itemId) || 0
    handleQuantityChange(itemId, Math.min(currentQty + 1, 99))
  }
  
  const decrementQuantity = (itemId: string) => {
    const currentQty = selectedFreeWeights.get(itemId) || 0
    handleQuantityChange(itemId, Math.max(currentQty - 1, 0))
  }
  
  const getCategoryItemCount = (categoryId: string) => {
    const category = freeWeightCategories.find(c => c.id === categoryId)
    if (!category) return 0
    return category.items.reduce((total, item) => {
      return total + (selectedFreeWeights.get(item.id) || 0)
    }, 0)
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
                    {getCategoryItemCount(category.id)}個
                  </span>
                )}
                <ChevronRight 
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    expandedCategories.has(category.id) ? 'rotate-90' : ''
                  }`} 
                />
              </div>
            </button>

            {/* Category Items */}
            {expandedCategories.has(category.id) && (
              <div className="border-t border-[rgba(168,184,228,0.35)] p-4 space-y-2">
                {/* Individual Items */}
                {category.items.map((item) => {
                  const quantity = selectedFreeWeights.get(item.id) || 0
                  return (
                    <div
                      key={item.id}
                      className={`w-full p-3 rounded-2xl flex items-center justify-between gt-transition ${
                        quantity > 0
                          ? 'gt-primary-plate border border-[rgba(157,176,226,0.45)] ring-1 ring-[rgba(59,99,243,0.3)]'
                          : 'gt-surface-outline hover:shadow-[0_20px_40px_-30px_rgba(26,44,94,0.42)]'
                      }`}
                    >
                      <div className="text-left flex-1">
                        <p className="gt-label-lg" style={{ color: 'var(--gt-text-main)' }}>{item.name}</p>
                        {item.description && (
                          <p className="gt-label-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => decrementQuantity(item.id)}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors border-2 ${
                            quantity > 0
                              ? 'bg-[rgba(243,247,255,0.9)] text-[color:var(--gt-primary-strong)] border-[rgba(168,184,228,0.45)] hover:bg-white hover:border-[rgba(59,99,243,0.36)]'
                              : 'bg-[rgba(243,247,255,0.6)] text-[color:var(--text-muted)] border-[rgba(168,184,228,0.35)] cursor-not-allowed'
                          }`}
                          disabled={quantity === 0}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <div className="w-12 text-center">
                          <span className={`font-semibold ${
                            quantity > 0 ? 'text-[color:var(--gt-primary-strong)]' : 'text-[color:var(--text-muted)]'
                          }`}>
                            {quantity}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => incrementQuantity(item.id)}
                          className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#3b63f3] via-[#5f6bdc] to-[#4aa0d9] text-white hover:shadow-[0_12px_34px_-22px_rgba(26,44,94,0.5)] flex items-center justify-center transition-all border-2 border-transparent"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
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
