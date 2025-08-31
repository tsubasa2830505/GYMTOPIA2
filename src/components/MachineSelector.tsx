'use client'

import { useState } from 'react'
import { ChevronRight, Check, Target, Activity, Zap, UserPlus, Heart, Wind } from 'lucide-react'

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
  selectedMachines: Set<string>
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
    description: 'レッグプレス、スクワットマシンなど',
    icon: Zap,
    items: [
      { id: 'leg_press', name: 'レッグプレス', brand: 'Hammer Strength', description: '45度/水平' },
      { id: 'hack_squat', name: 'ハックスクワット', brand: 'Cybex', description: '安全なスクワット' },
      { id: 'leg_extension', name: 'レッグエクステンション', brand: 'Life Fitness', description: '大腿四頭筋' },
      { id: 'leg_curl', name: 'レッグカール', brand: 'Technogym', description: 'ライイング/シーテッド' },
      { id: 'calf_raise', name: 'カーフレイズ', brand: 'Hammer Strength', description: '立位/座位' },
      { id: 'adductor', name: 'アダクター/アブダクター', brand: 'Life Fitness', description: '内転/外転筋' },
      { id: 'glute_machine', name: 'グルートマシン', brand: 'Prime Fitness', description: 'ヒップスラスト' },
    ]
  },
  {
    id: 'shoulders',
    name: '肩部マシン',
    description: 'ショルダープレス、サイドレイズなど',
    icon: UserPlus,
    items: [
      { id: 'shoulder_press', name: 'ショルダープレス', brand: 'Hammer Strength', description: 'アイソラテラル式' },
      { id: 'lateral_raise', name: 'ラテラルレイズマシン', brand: 'Life Fitness', description: '側部三角筋' },
      { id: 'rear_delt', name: 'リアデルトマシン', brand: 'Cybex', description: '後部三角筋' },
      { id: 'shrugs', name: 'シュラッグマシン', brand: 'Hammer Strength', description: '僧帽筋' },
      { id: 'upright_row', name: 'アップライトロー', brand: 'Technogym', description: 'ケーブル式' },
    ]
  },
  {
    id: 'arms',
    name: '腕部マシン',
    description: 'アームカール、トライセプスなど',
    icon: Target,
    items: [
      { id: 'bicep_curl', name: 'バイセップカール', brand: 'Life Fitness', description: 'プリーチャー/スタンディング' },
      { id: 'tricep_extension', name: 'トライセプスエクステンション', brand: 'Cybex', description: 'オーバーヘッド/プッシュダウン' },
      { id: 'cable_curl', name: 'ケーブルカール', brand: 'Prime Fitness', description: '多角度調整' },
      { id: 'dip_machine', name: 'ディップマシン', brand: 'Hammer Strength', description: 'アシスト付き' },
      { id: 'arm_curl_machine', name: 'アームカールマシン', brand: 'Technogym', description: '固定軌道' },
    ]
  },
  {
    id: 'core',
    name: '体幹マシン',
    description: 'アブドミナル、ロータリートルソなど',
    icon: Heart,
    items: [
      { id: 'ab_crunch', name: 'アブドミナルクランチ', brand: 'Life Fitness', description: '腹直筋' },
      { id: 'rotary_torso', name: 'ロータリートルソ', brand: 'Cybex', description: '腹斜筋' },
      { id: 'back_extension', name: 'バックエクステンション', brand: 'Hammer Strength', description: '脊柱起立筋' },
      { id: 'roman_chair', name: 'ローマンチェア', brand: 'Body-Solid', description: '45度/90度' },
      { id: 'ab_coaster', name: 'アブコースター', brand: 'Ab Coaster', description: '下腹部' },
      { id: 'plank_station', name: 'プランクステーション', brand: 'TRX', description: '体幹安定' },
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

export default function MachineSelector({ selectedMachines, onSelectionChange }: MachineSelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['chest']))

  const handleCategoryToggle = (categoryId: string) => {
    const category = machineCategories.find(c => c.id === categoryId)
    if (!category) return
    
    const categoryItems = category.items.map(item => item.id)
    const allSelected = categoryItems.every(id => selectedMachines.has(id))
    
    const newSelected = new Set(selectedMachines)
    
    if (allSelected) {
      // すべて選択されていたら、全て外す
      categoryItems.forEach(id => newSelected.delete(id))
    } else {
      // 一部でも選択されていなければ、全て選択
      categoryItems.forEach(id => newSelected.add(id))
    }
    
    onSelectionChange(newSelected)
  }

  const handleItemToggle = (itemId: string) => {
    const newSelected = new Set(selectedMachines)
    
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    
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

  const selectedCount = selectedMachines.size
  
  // カテゴリーが選択されているかチェック
  const isCategorySelected = (categoryId: string) => {
    const category = machineCategories.find(c => c.id === categoryId)
    if (!category) return false
    return category.items.every(item => selectedMachines.has(item.id))
  }

  return (
    <div className="p-4 sm:p-6">
      {selectedCount > 0 && (
        <div className="mb-4 p-3 bg-purple-50 rounded-xl border border-purple-200">
          <span className="text-sm font-medium text-purple-700">
            {selectedCount}個のマシンを選択中
          </span>
        </div>
      )}
      
      <div className="space-y-4">
        {machineCategories.map((category) => (
          <div 
            key={category.id}
            className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200"
          >
            {/* Category Header */}
            <button
              onClick={() => toggleExpandCategory(category.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
                  <category.icon className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-slate-900">{category.name}</h3>
                  <p className="text-xs text-slate-600">{category.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isCategorySelected(category.id) && (
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
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
                  className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${
                    isCategorySelected(category.id)
                      ? 'bg-purple-50 border-2 border-purple-500'
                      : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                  }`}
                >
                  <span className="font-medium text-sm">
                    すべて選択
                  </span>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isCategorySelected(category.id)
                      ? 'bg-purple-500 border-purple-500'
                      : 'border-slate-300'
                  }`}>
                    {isCategorySelected(category.id) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </button>

                {/* Individual Items */}
                {category.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemToggle(item.id)}
                    className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${
                      selectedMachines.has(item.id)
                        ? 'bg-purple-50 border-2 border-purple-500'
                        : 'bg-white border-2 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-medium text-sm text-slate-900">{item.name}</p>
                      {item.brand && (
                        <p className="text-xs text-slate-600 mt-0.5">{item.brand} • {item.description}</p>
                      )}
                    </div>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedMachines.has(item.id)
                        ? 'bg-purple-500 border-purple-500'
                        : 'border-slate-300'
                    }`}>
                      {selectedMachines.has(item.id) && (
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