'use client'

import { useState } from 'react'
import { 
  Check, Building, MapPin, Clock, Droplets, 
  Car, Sparkles, Waves, Wifi, Coffee, Lock,
  Users, Accessibility, Music, Thermometer
} from 'lucide-react'

interface ConditionCategory {
  id: string
  name: string
  description: string
  icon: React.ElementType
  items: ConditionItem[]
}

interface ConditionItem {
  id: string
  name: string
  icon?: React.ElementType
  description?: string
}

interface ConditionSelectorProps {
  selectedFacilities: Set<string>
  onSelectionChange: (facilities: Set<string>) => void
}

const facilityConditions: ConditionCategory[] = [
  {
    id: 'basic',
    name: '基本設備',
    description: '営業時間・基本サービス',
    icon: Building,
    items: [
      { id: '24hours', name: '24時間営業', icon: Clock, description: '深夜・早朝も利用可能' },
      { id: 'shower', name: 'シャワー', icon: Droplets, description: 'シャワールーム完備' },
      { id: 'parking', name: '駐車場', icon: Car, description: '無料/有料駐車場あり' },
      { id: 'locker', name: 'ロッカー', icon: Lock, description: '鍵付きロッカー' },
      { id: 'wifi', name: 'WiFi', icon: Wifi, description: '無料WiFi利用可能' },
    ]
  },
  {
    id: 'training',
    name: 'トレーニング環境',
    description: 'トレーニングに関する設備',
    icon: Sparkles,
    items: [
      { id: 'chalk', name: 'チョーク利用可', icon: Sparkles, description: 'パワーリフティング対応' },
      { id: 'belt_rental', name: 'ベルト貸出', description: 'トレーニングベルト無料貸出' },
      { id: 'personal_training', name: 'パーソナルトレーニング', icon: Users, description: '専属トレーナー' },
      { id: 'group_lesson', name: 'グループレッスン', description: 'ヨガ・エアロビクス等' },
      { id: 'studio', name: 'スタジオ', icon: Music, description: 'グループレッスン用スタジオ' },
    ]
  },
  {
    id: 'amenity',
    name: 'アメニティ',
    description: 'リラクゼーション・快適設備',
    icon: Waves,
    items: [
      { id: 'sauna', name: 'サウナ', icon: Thermometer, description: 'サウナ・水風呂完備' },
      { id: 'pool', name: 'プール', icon: Waves, description: '温水プール' },
      { id: 'jacuzzi', name: 'ジャグジー', description: 'リラクゼーション' },
      { id: 'massage_chair', name: 'マッサージチェア', description: '疲労回復' },
      { id: 'cafe', name: 'カフェ/売店', icon: Coffee, description: 'プロテインバー' },
    ]
  },
  {
    id: 'special',
    name: '特別対応',
    description: '特別なニーズへの対応',
    icon: Accessibility,
    items: [
      { id: 'women_only', name: '女性専用エリア', description: '女性専用トレーニングエリア' },
      { id: 'barrier_free', name: 'バリアフリー', icon: Accessibility, description: '車椅子対応' },
      { id: 'kids_room', name: 'キッズルーム', description: '子供預かりサービス' },
      { id: 'english_support', name: '英語対応', description: 'English speaking staff' },
    ]
  }
]


export default function ConditionSelector({ selectedFacilities, onSelectionChange }: ConditionSelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['basic']))

  const handleFacilityToggle = (itemId: string) => {
    const newSelected = new Set(selectedFacilities)
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

  return (
    <div>
      {/* Facility Conditions */}
      <div>
        <div className="space-y-4">
          {facilityConditions.map((category) => (
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
                  <div className="w-10 h-10 md-tertiary-container rounded-xl flex items-center justify-center">
                    <category.icon className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="md-title-small font-semibold" style={{ color: 'var(--md-on-surface)' }}>{category.name}</h3>
                    <p className="md-label-small" style={{ color: 'var(--md-on-surface-variant)' }}>{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {category.items.some(item => selectedFacilities.has(item.id)) && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                      {category.items.filter(item => selectedFacilities.has(item.id)).length}
                    </span>
                  )}
                  <svg
                    className={`w-5 h-5 text-slate-400 transition-transform ${
                      expandedCategories.has(category.id) ? 'rotate-90' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Category Items */}
              {expandedCategories.has(category.id) && (
                <div className="border-t border-slate-100 p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {category.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleFacilityToggle(item.id)}
                        className={`p-3 rounded-xl flex items-center justify-between md-transition-standard md-ripple ${
                          selectedFacilities.has(item.id)
                            ? 'md-primary-container border-2 border-blue-500'
                            : 'md-surface border-2 border-slate-200 hover:md-elevation-1'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon && (
                            <item.icon className={`w-4 h-4 ${
                              selectedFacilities.has(item.id) ? 'text-blue-600' : 'text-slate-500'
                            }`} />
                          )}
                          <div className="text-left">
                            <p className="md-label-large" style={{ color: 'var(--md-on-surface)' }}>{item.name}</p>
                            {item.description && (
                              <p className="md-label-small mt-0.5" style={{ color: 'var(--md-on-surface-variant)' }}>{item.description}</p>
                            )}
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedFacilities.has(item.id)
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-slate-300'
                        }`}>
                          {selectedFacilities.has(item.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Count */}
      {selectedFacilities.size > 0 && (
        <div className="mt-6 p-4 md-primary-container rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="md-label-large font-semibold" style={{ color: 'var(--md-on-primary)' }}>
                選択中の条件
              </p>
              <p className="md-label-small mt-1" style={{ color: 'var(--md-on-primary)' }}>
                施設: {selectedFacilities.size}件
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedFacilities(new Set())
                onSelectionChange(new Set())
              }}
              className="text-sm text-blue-600 font-medium hover:text-blue-700"
            >
              すべてクリア
            </button>
          </div>
        </div>
      )}
    </div>
  )
}