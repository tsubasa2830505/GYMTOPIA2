'use client'

import { useState } from 'react'
import {
  Check, Building, Clock, Droplets,
  Car, Sparkles, Waves, Wifi, Coffee, Lock,
  Users, Accessibility, Music, Thermometer
} from 'lucide-react'
import { FACILITY_CATEGORIES_NO_ICON, FacilityCategoryId, FacilityMeta } from '@/types/facilities'

interface ConditionCategory {
  id: FacilityCategoryId
  name: string
  description: string
  icon: React.ElementType
  items: ConditionItem[]
}

interface ConditionItem {
  id: FacilityMeta['id']
  name: string
  icon?: React.ElementType
  description?: string
}

interface ConditionSelectorProps {
  selectedFacilities: Set<string>
  onSelectionChange: (facilities: Set<string>) => void
}

// Map facility items (without icons) to UI with icons
const ITEM_ICON_MAP: Partial<Record<FacilityMeta['id'], React.ElementType>> = {
  '24hours': Clock,
  shower: Droplets,
  parking: Car,
  locker: Lock,
  wifi: Wifi,
  chalk: Sparkles,
  personal_training: Users,
  studio: Music,
  sauna: Thermometer,
  pool: Waves,
  cafe: Coffee,
  barrier_free: Accessibility,
  drop_in: Users,  // ドロップイン用アイコン
}

const CATEGORY_ICON_MAP: Record<FacilityCategoryId, React.ElementType> = {
  basic: Building,
  training: Sparkles,
  amenity: Waves,
  special: Accessibility,
}

const facilityConditions: ConditionCategory[] = (Object.values(FACILITY_CATEGORIES_NO_ICON) as Array<(typeof FACILITY_CATEGORIES_NO_ICON)[FacilityCategoryId]>).
  map((cat) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    icon: CATEGORY_ICON_MAP[cat.id],
    items: cat.items.map((i) => ({
      id: i.id,
      name: i.name,
      description: i.description,
      icon: ITEM_ICON_MAP[i.id],
    })),
  }))


export default function ConditionSelector({ selectedFacilities, onSelectionChange }: ConditionSelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

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
