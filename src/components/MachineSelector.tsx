'use client'

import { useState } from 'react'
import { 
  ChevronRight, Check, Activity, Dumbbell, 
  Target, Footprints, CircleDot, Zap, Heart, 
  TrendingUp, Wind
} from 'lucide-react'

interface MachineCategory {
  id: string
  name: string
  description: string
  icon: React.ElementType
  items: MachineItem[]
}

interface MachineItem {
  id: string
  name: string
  brand?: string
  description?: string
}

interface MachineSelectorProps {
  onSelectionChange: (selected: Set<string>) => void
}

const machineCategories: MachineCategory[] = [
  {
    id: 'chest',
    name: '胸部マシン',
    description: 'チェストプレス、ペックフライなど',
    icon: Target,
    items: [
      { id: 'chest_press', name: 'チェストプレス', brand: 'Hammer Strength', description: 'アイソラテラル式' },
      { id: 'incline_press', name: 'インクラインチェストプレス', brand: 'Life Fitness', description: '上部胸筋' },
      { id: 'decline_press', name: 'デクラインチェストプレス', brand: 'Technogym', description: '下部胸筋' },
      { id: 'pec_fly', name: 'ペックフライ/ペックデック', brand: 'Cybex', description: '胸筋内側' },
      { id: 'cable_crossover', name: 'ケーブルクロスオーバー', brand: 'Prime Fitness', description: '多角度調整可能' },
      { id: 'smith_machine', name: 'スミスマシン', brand: 'Matrix', description: '安全なベンチプレス' },
    ]
  },
  {
    id: 'back',
    name: '背中マシン',
    description: 'ラットプルダウン、ローイングなど',
    icon: Activity,
    items: [
      { id: 'lat_pulldown', name: 'ラットプルダウン', brand: 'Hammer Strength', description: 'アイソラテラル式' },
      { id: 'seated_row', name: 'シーテッドロー', brand: 'Life Fitness', description: '中背部' },
      { id: 'cable_row', name: 'ケーブルロー', brand: 'Technogym', description: '多角度調整' },
      { id: 't_bar_row', name: 'Tバーロー', brand: 'Hammer Strength', description: '厚みのある背中' },
      { id: 'pullover', name: 'プルオーバーマシン', brand: 'Nautilus', description: '広背筋ストレッチ' },
      { id: 'assisted_pullup', name: 'アシステッドプルアップ', brand: 'Life Fitness', description: '補助付き懸垂' },
      { id: 'reverse_fly', name: 'リバースフライ', brand: 'Cybex', description: '後部三角筋' },
    ]
  },
  {
    id: 'legs',
    name: '脚部マシン',
    description: 'レッグプレス、レッグカールなど',
    icon: Footprints,
    items: [
      { id: 'leg_press', name: 'レッグプレス', brand: 'Hammer Strength', description: '45度/水平' },
      { id: 'hack_squat', name: 'ハックスクワット', brand: 'Cybex', description: '安全なスクワット' },
      { id: 'leg_extension', name: 'レッグエクステンション', brand: 'Life Fitness', description: '大腿四頭筋' },
      { id: 'leg_curl', name: 'レッグカール', brand: 'Technogym', description: 'ハムストリングス' },
      { id: 'calf_raise', name: 'カーフレイズ', brand: 'Hammer Strength', description: 'ふくらはぎ' },
      { id: 'adductor', name: 'アダクター（内転筋）', brand: 'Life Fitness', description: '内もも' },
      { id: 'abductor', name: 'アブダクター（外転筋）', brand: 'Life Fitness', description: '外もも' },
      { id: 'glute_machine', name: 'グルートマシン', brand: 'Nautilus', description: '臀筋専用' },
    ]
  },
  {
    id: 'shoulders',
    name: '肩マシン',
    description: 'ショルダープレス、サイドレイズなど',
    icon: CircleDot,
    items: [
      { id: 'shoulder_press', name: 'ショルダープレス', brand: 'Hammer Strength', description: 'アイソラテラル式' },
      { id: 'lateral_raise', name: 'ラテラルレイズマシン', brand: 'Life Fitness', description: '三角筋中部' },
      { id: 'rear_delt', name: 'リアデルトマシン', brand: 'Cybex', description: '三角筋後部' },
      { id: 'shrugs_machine', name: 'シュラッグマシン', brand: 'Hammer Strength', description: '僧帽筋上部' },
      { id: 'upright_row', name: 'アップライトローマシン', brand: 'Technogym', description: '肩全体' },
    ]
  },
  {
    id: 'arms',
    name: '腕マシン',
    description: 'アームカール、トライセプスなど',
    icon: Dumbbell,
    items: [
      { id: 'bicep_curl', name: 'バイセップカール', brand: 'Life Fitness', description: '上腕二頭筋' },
      { id: 'preacher_curl', name: 'プリーチャーカール', brand: 'Hammer Strength', description: '集中カール' },
      { id: 'tricep_extension', name: 'トライセプスエクステンション', brand: 'Cybex', description: '上腕三頭筋' },
      { id: 'tricep_dip', name: 'ディップマシン', brand: 'Life Fitness', description: '補助付きディップス' },
      { id: 'cable_machine', name: 'ケーブルマシン', brand: 'Prime Fitness', description: '多目的アーム' },
    ]
  },
  {
    id: 'core',
    name: '体幹マシン',
    description: 'アブドミナル、バックエクステンションなど',
    icon: Zap,
    items: [
      { id: 'ab_crunch', name: 'アブドミナルクランチ', brand: 'Technogym', description: '腹直筋' },
      { id: 'rotary_torso', name: 'ロータリートルソー', brand: 'Life Fitness', description: '腹斜筋' },
      { id: 'back_extension', name: 'バックエクステンション', brand: 'Hammer Strength', description: '脊柱起立筋' },
      { id: 'ab_coaster', name: 'アブコースター', brand: 'Ab Coaster', description: '下腹部' },
      { id: 'captain_chair', name: 'キャプテンチェア', brand: 'Life Fitness', description: 'レッグレイズ' },
    ]
  },
  {
    id: 'cardio',
    name: '有酸素マシン',
    description: 'トレッドミル、バイクなど',
    icon: Heart,
    items: [
      { id: 'treadmill', name: 'トレッドミル', brand: 'Life Fitness', description: '傾斜機能付き' },
      { id: 'elliptical', name: 'エリプティカル', brand: 'Precor', description: '低負荷有酸素' },
      { id: 'bike', name: 'エアロバイク', brand: 'Technogym', description: 'アップライト/リカンベント' },
      { id: 'rowing', name: 'ローイングマシン', brand: 'Concept2', description: '全身有酸素' },
      { id: 'stairmaster', name: 'ステアマスター', brand: 'StairMaster', description: '階段昇降' },
      { id: 'assault_bike', name: 'アサルトバイク', brand: 'Assault Fitness', description: 'HIIT向け' },
      { id: 'ski_erg', name: 'スキーエルゴ', brand: 'Concept2', description: 'スキー動作' },
    ]
  },
  {
    id: 'functional',
    name: 'ファンクショナル',
    description: 'ケーブルマシン、TRXなど',
    icon: Wind,
    items: [
      { id: 'cable_station', name: 'ケーブルステーション', brand: 'Prime Fitness', description: '多機能ケーブル' },
      { id: 'functional_trainer', name: 'ファンクショナルトレーナー', brand: 'Life Fitness', description: 'デュアルアジャスタブル' },
      { id: 'trx', name: 'TRXサスペンション', brand: 'TRX', description: '自重トレーニング' },
      { id: 'battle_rope', name: 'バトルロープ', brand: 'Rogue', description: 'HIIT/体幹' },
      { id: 'sled', name: 'プッシュ/プルスレッド', brand: 'Rogue', description: '全身パワー' },
      { id: 'ghd', name: 'GHDマシン', brand: 'Rogue', description: 'グルートハムレイズ' },
    ]
  }
]

export default function MachineSelector({ onSelectionChange }: MachineSelectorProps) {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['chest']))

  const handleCategoryToggle = (categoryId: string) => {
    const newSelected = new Set(selectedCategories)
    const category = machineCategories.find(c => c.id === categoryId)
    
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
      const category = machineCategories.find(c => c.id === categoryId)
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
      {/* Info Card */}
      <div className="md-secondary-container rounded-2xl p-4 mb-4 sm:mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 md-surface rounded-xl flex items-center justify-center md-elevation-1">
            <Activity className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h2 className="md-title-medium font-semibold mb-1" style={{ color: 'var(--md-on-surface)' }}>マシン設備を選択</h2>
            <p className="md-body-small" style={{ color: 'var(--md-on-surface-variant)' }}>
              希望するマシンを選んで、条件に合うジムを見つけましょう
            </p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {machineCategories.map((category) => (
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
                <div className="w-10 h-10 md-secondary-container rounded-xl flex items-center justify-center">
                  <category.icon className="w-5 h-5 text-purple-600" />
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
                      <div className="flex items-center gap-2 mt-0.5">
                        {item.brand && (
                          <span className="md-label-small font-medium" style={{ color: 'var(--md-primary)' }}>{item.brand}</span>
                        )}
                        {item.description && (
                          <span className="md-label-small" style={{ color: 'var(--md-on-surface-variant)' }}>• {item.description}</span>
                        )}
                      </div>
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