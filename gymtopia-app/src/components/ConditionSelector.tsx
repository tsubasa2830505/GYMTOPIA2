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
              className="gt-card overflow-hidden"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleExpandCategory(category.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/60 gt-transition gt-pressable"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 gt-tertiary-plate rounded-xl flex items-center justify-center">
                    <category.icon className="w-5 h-5" style={{ color: 'var(--gt-tertiary-strong)' }} />
                  </div>
                  <div className="text-left">
                    <h3 className="gt-title-sm font-semibold" style={{ color: 'var(--gt-text-main)' }}>{category.name}</h3>
                    <p className="gt-label-sm" style={{ color: 'var(--text-muted)' }}>{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {category.items.some(item => selectedFacilities.has(item.id)) && (
                    <span className="gt-badge text-[11px]">
                      {category.items.filter(item => selectedFacilities.has(item.id)).length}
                    </span>
                  )}
                  <svg
                    className={`w-5 h-5 text-[color:var(--text-muted)] transition-transform ${
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
                <div className="border-t border-[rgba(44,82,190,0.18)] p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {category.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleFacilityToggle(item.id)}
                        className={`p-3 rounded-2xl flex items-center justify-between gt-transition gt-pressable ${
                          selectedFacilities.has(item.id)
                            ? 'gt-primary-plate border border-[rgba(44,82,190,0.18)] ring-1 ring-[rgba(31,79,255,0.26)]'
                            : 'gt-surface-outline hover:shadow-[0_20px_40px_-30px_rgba(15,36,118,0.42)]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon && (
                            <item.icon className={`w-4 h-4 ${
                              selectedFacilities.has(item.id) ? 'text-[color:var(--gt-primary-strong)]' : 'text-[color:var(--text-muted)]'
                            }`} />
                          )}
                          <div className="text-left">
                            <p className="gt-label-lg" style={{ color: 'var(--gt-text-main)' }}>{item.name}</p>
                            {item.description && (
                              <p className="gt-label-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
                            )}
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                          selectedFacilities.has(item.id)
                            ? 'bg-gradient-to-r from-[#1f4fff] to-[#2a5fe8] border-transparent text-white shadow-[0_10px_26px_-18px_rgba(15,36,118,0.44)]'
                            : 'border-[rgba(44,82,190,0.18)] text-[color:var(--text-muted)] bg-[rgba(243,247,255,0.85)]'
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
        <div className="mt-6 p-4 gt-primary-plate rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="gt-label-lg font-semibold" style={{ color: 'var(--gt-on-primary)' }}>
                選択中の条件
              </p>
              <p className="gt-label-sm mt-1" style={{ color: 'var(--gt-on-primary)' }}>
                施設: {selectedFacilities.size}件
              </p>
            </div>
            <button
              onClick={() => {
                onSelectionChange(new Set())
              }}
              className="text-sm text-[color:var(--gt-on-primary)]/80 font-medium hover:text-[color:var(--gt-on-primary)]"
            >
              すべてクリア
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
