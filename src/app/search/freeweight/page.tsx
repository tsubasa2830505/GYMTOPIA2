'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ChevronLeft, Search, Filter, ChevronRight, Check,
  Dumbbell, MapPin, Info, X
} from 'lucide-react'

interface FreeWeightCategory {
  id: string
  name: string
  description: string
  icon: string
  items: FreeWeightItem[]
}

interface FreeWeightItem {
  id: string
  name: string
  description?: string
}

const freeWeightCategories: FreeWeightCategory[] = [
  {
    id: 'barbell',
    name: 'バーベル',
    description: 'オリンピックバー、カールバーなど',
    icon: '🏋️',
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
    icon: '💪',
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
    icon: '⭕',
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
    icon: '🔔',
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
    icon: '🪑',
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
    icon: '🏗️',
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

export default function FreeWeightSearchPage() {
  const router = useRouter()
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['barbell']))

  const handleCategoryToggle = (categoryId: string) => {
    const newSelected = new Set(selectedCategories)
    const category = freeWeightCategories.find(c => c.id === categoryId)
    
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId)
      // カテゴリーを外したら、そのカテゴリーのアイテムも全て外す
      category?.items.forEach(item => {
        selectedItems.delete(item.id)
      })
    } else {
      newSelected.add(categoryId)
      // カテゴリーを選択したら、全アイテムも選択
      const newItems = new Set(selectedItems)
      category?.items.forEach(item => {
        newItems.add(item.id)
      })
      setSelectedItems(newItems)
    }
    setSelectedCategories(newSelected)
  }

  const handleItemToggle = (itemId: string, categoryId: string) => {
    const newSelected = new Set(selectedItems)
    
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
      // アイテムを一つでも外したら、カテゴリーの選択も外す
      selectedCategories.delete(categoryId)
      setSelectedCategories(new Set(selectedCategories))
    } else {
      newSelected.add(itemId)
      // 全アイテムが選択されたらカテゴリーも選択
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

  const handleSearch = () => {
    // 選択された条件を持って検索結果画面へ
    const params = new URLSearchParams()
    selectedItems.forEach(item => params.append('equipment', item))
    router.push(`/search/results?type=freeweight&${params.toString()}`)
  }

  const clearAll = () => {
    setSelectedCategories(new Set())
    setSelectedItems(new Set())
  }

  const selectedCount = selectedItems.size

  return (
    <div className="min-h-screen bg-slate-50 pb-20 sm:pb-0">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100"
            >
              <ChevronLeft className="w-5 h-5 text-slate-900" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900">フリーウェイト設備</h1>
              <p className="text-xs text-slate-600">設備を選択してジムを検索</p>
            </div>
          </div>
          {selectedCount > 0 && (
            <button 
              onClick={clearAll}
              className="text-sm text-blue-600 font-medium"
            >
              クリア
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-4 sm:py-6 max-w-4xl mx-auto">
        {/* Info Card */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-4 sm:mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <Dumbbell className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-slate-900 mb-1">フリーウェイト設備を選択</h2>
              <p className="text-sm text-slate-600">
                希望する設備を選んで、条件に合うジムを見つけましょう
              </p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {freeWeightCategories.map((category) => (
            <div 
              key={category.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleExpandCategory(category.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-xl">
                    {category.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900">{category.name}</h3>
                    <p className="text-xs text-slate-600">{category.description}</p>
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
                    className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${
                      selectedCategories.has(category.id)
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-medium text-sm">
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
                      className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${
                        selectedItems.has(item.id)
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'bg-white border-2 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-left">
                        <p className="font-medium text-sm text-slate-900">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
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

      {/* Fixed Bottom Button */}
      {selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 sm:hidden">
          <button
            onClick={handleSearch}
            className="w-full py-3 bg-blue-500 text-white rounded-2xl font-medium flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            <span>{selectedCount}個の条件で検索</span>
          </button>
        </div>
      )}

      {/* Desktop Search Button */}
      <div className="hidden sm:block sticky bottom-6 mt-6">
        <div className="max-w-4xl mx-auto px-4">
          {selectedCount > 0 && (
            <button
              onClick={handleSearch}
              className="w-full py-4 bg-blue-500 text-white rounded-2xl font-medium flex items-center justify-center gap-2 shadow-lg hover:bg-blue-600 transition-colors"
            >
              <Search className="w-5 h-5" />
              <span>{selectedCount}個の条件で検索</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}