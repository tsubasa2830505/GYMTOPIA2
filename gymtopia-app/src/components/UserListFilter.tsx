'use client'

import { Search } from 'lucide-react'

interface UserListFilterProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedFilter: string
  onFilterChange: (filter: string) => void
  filters: Array<{
    value: string
    label: string
  }>
}

export default function UserListFilter({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  filters
}: UserListFilterProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(68,73,73,0.6)]" />
          <input
            type="text"
            placeholder="名前、ユーザー名で検索..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[rgba(254,255,250,0.97)] border border-[rgba(186,122,103,0.26)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)]"
          />
        </div>
        <div className="flex gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => onFilterChange(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === filter.value
                  ? 'bg-[color:var(--gt-primary)] text-white'
                  : 'bg-[rgba(254,255,250,0.95)] text-[color:var(--text-subtle)] hover:bg-[rgba(254,255,250,0.9)]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}