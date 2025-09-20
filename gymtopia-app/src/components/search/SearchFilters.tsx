'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react'

interface SearchFiltersProps {
  filters: {
    prefecture: string
    city: string
    facilities: string[]
  }
  onFilterChange: (key: string, value: string | string[]) => void
  onClearFilters: () => void
  className?: string
}

const prefectures = [
  '東京都', '神奈川県', '大阪府', '愛知県', '埼玉県', '千葉県', '兵庫県', '北海道', '福岡県', '静岡県'
]

const facilities = [
  { id: '24hours', label: '24時間営業' },
  { id: 'shower', label: 'シャワー' },
  { id: 'parking', label: '駐車場' },
  { id: 'locker', label: 'ロッカー' },
  { id: 'wifi', label: 'Wi-Fi' },
  { id: 'sauna', label: 'サウナ' },
  { id: 'pool', label: 'プール' },
  { id: 'personal_training', label: 'パーソナル' }
]

export default function SearchFilters({
  filters,
  onFilterChange,
  onClearFilters,
  className = ''
}: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const hasActiveFilters = filters.prefecture || filters.city || filters.facilities.length > 0

  const handleFacilityToggle = (facilityId: string) => {
    const newFacilities = filters.facilities.includes(facilityId)
      ? filters.facilities.filter(f => f !== facilityId)
      : [...filters.facilities, facilityId]
    onFilterChange('facilities', newFacilities)
  }

  return (
    <div className={`bg-white border border-[rgba(231,103,76,0.2)] rounded-lg ${className}`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 border-b border-[rgba(231,103,76,0.1)]">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[color:var(--gt-primary)]" />
          <h3 className="font-medium text-[color:var(--foreground)]">絞り込み</h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 bg-[color:var(--gt-primary)] text-white text-xs rounded-full">
              {(filters.prefecture ? 1 : 0) + (filters.city ? 1 : 0) + filters.facilities.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 px-2 py-1 text-xs text-[color:var(--text-muted)] hover:text-[color:var(--foreground)] transition-colors"
            >
              <X className="w-3 h-3" />
              クリア
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-[rgba(231,103,76,0.1)] rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* フィルター内容 */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* 都道府県 */}
          <div>
            <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
              都道府県
            </label>
            <select
              value={filters.prefecture}
              onChange={(e) => onFilterChange('prefecture', e.target.value)}
              className="w-full px-3 py-2 border border-[rgba(231,103,76,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--gt-primary)] bg-white"
            >
              <option value="">すべて</option>
              {prefectures.map((pref) => (
                <option key={pref} value={pref}>{pref}</option>
              ))}
            </select>
          </div>

          {/* 市区町村 */}
          <div>
            <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
              市区町村
            </label>
            <input
              type="text"
              value={filters.city}
              onChange={(e) => onFilterChange('city', e.target.value)}
              placeholder="例: 渋谷区"
              className="w-full px-3 py-2 border border-[rgba(231,103,76,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--gt-primary)] bg-white"
            />
          </div>

          {/* 設備・サービス */}
          <div>
            <label className="block text-sm font-medium text-[color:var(--foreground)] mb-3">
              設備・サービス
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {facilities.map((facility) => (
                <label
                  key={facility.id}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-[rgba(231,103,76,0.05)] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.facilities.includes(facility.id)}
                    onChange={() => handleFacilityToggle(facility.id)}
                    className="w-4 h-4 text-[color:var(--gt-primary)] border-[rgba(231,103,76,0.3)] rounded focus:ring-[color:var(--gt-primary)]"
                  />
                  <span className="text-sm text-[color:var(--foreground)]">
                    {facility.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}