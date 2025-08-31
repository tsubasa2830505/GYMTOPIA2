'use client'

import { useState } from 'react'
import { 
  ChevronRight, Check, Dumbbell, Weight, 
  Circle, Disc, Package, Armchair, Home
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
  onSelectionChange: (selected: Set<string>) => void
}

const freeWeightCategories: FreeWeightCategory[] = [
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
    id: 'plate',
    name: 'プレート',
    description: 'オリンピックプレート',
    icon: Disc,
    items: [
      { id: 'olympic_plate', name: 'オリンピックプレート', description: '穴径50mm' },
      { id: 'bumper_plate', name: 'バンパープレート', description: 'ラバー製、落下OK' },
      { id: 'calibrated_plate', name: 'キャリブレーテッドプレート', description: '競技用高精度' },
      { id: 'fractional_plate', name: 'フラクショナルプレート', description: '0.5kg、1kg、1.25kg' },
      { id: 'standard_plate', name: 'スタンダードプレート', description: '穴径28mm' },
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
  }
]

export default function FreeWeightSelector({ onSelectionChange }: FreeWeightSelectorProps) {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['barbell']))

  const handleCategoryToggle = (categoryId: string) => {
    const newSelected = new Set(selectedCategories)
    const category = freeWeightCategories.find(c => c.id === categoryId)
    
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId)
      category?.items.forEach(item => {
        selectedItems.delete(item.id)
      })
    } else {
      newSelected.add(categoryId)
      const newItems = new Set(selectedItems)
      category?.items.forEach(item => {
        newItems.add(item.id)
      })
      setSelectedItems(newItems)
    }
    setSelectedCategories(newSelected)
    onSelectionChange(selectedItems)
  }

  const handleItemToggle = (itemId: string, categoryId: string) => {
    const newSelected = new Set(selectedItems)
    
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
      selectedCategories.delete(categoryId)
      setSelectedCategories(new Set(selectedCategories))
    } else {
      newSelected.add(itemId)
      const category = freeWeightCategories.find(c => c.id === categoryId)
      if (category) {
        const allSelected = category.items.every(item => 
          newSelected.has(item.id)
        )
        if (allSelected) {
          selectedCategories.add(categoryId)
          setSelectedCategories(new Set(selectedCategories))
        }
      }
    }
    setSelectedItems(newSelected)
    onSelectionChange(newSelected)
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
            className="md-card overflow-hidden"
          >
            {/* Category Header */}
            <button
              onClick={() => toggleExpandCategory(category.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 md-transition-standard md-ripple"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md-primary-container rounded-xl flex items-center justify-center">
                  <category.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="md-title-small font-semibold" style={{ color: 'var(--md-on-surface)' }}>{category.name}</h3>
                  <p className="md-label-small" style={{ color: 'var(--md-on-surface-variant)' }}>{category.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedCategories.has(category.id) && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
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
              <div className="border-t border-slate-100 p-4 space-y-2">
                {/* Select All */}
                <button
                  onClick={() => handleCategoryToggle(category.id)}
                  className={`w-full p-3 rounded-xl flex items-center justify-between md-transition-standard md-ripple ${
                    selectedCategories.has(category.id)
                      ? 'md-primary-container border-2 border-blue-500'
                      : 'md-surface-variant border-2 border-transparent hover:md-elevation-1'
                  }`}
                >
                  <span className="md-label-large">
                    すべて選択
                  </span>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedCategories.has(category.id)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-slate-300'
                  }`}>
                    {selectedCategories.has(category.id) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </button>

                {/* Individual Items */}
                {category.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemToggle(item.id, category.id)}
                    className={`w-full p-3 rounded-xl flex items-center justify-between md-transition-standard md-ripple ${
                      selectedItems.has(item.id)
                        ? 'md-primary-container border-2 border-blue-500'
                        : 'md-surface border-2 border-slate-200 hover:md-elevation-1'
                    }`}
                  >
                    <div className="text-left">
                      <p className="md-label-large" style={{ color: 'var(--md-on-surface)' }}>{item.name}</p>
                      {item.description && (
                        <p className="md-label-small mt-0.5" style={{ color: 'var(--md-on-surface-variant)' }}>{item.description}</p>
                      )}
                    </div>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedItems.has(item.id)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-slate-300'
                    }`}>
                      {selectedItems.has(item.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}