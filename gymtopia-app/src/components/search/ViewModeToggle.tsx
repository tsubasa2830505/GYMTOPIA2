'use client'

import { List, Map as MapIcon } from 'lucide-react'

interface ViewModeToggleProps {
  viewMode: 'map' | 'list'
  onViewModeChange: (mode: 'map' | 'list') => void
}

export default function ViewModeToggle({
  viewMode,
  onViewModeChange
}: ViewModeToggleProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="hidden sm:block gt-label-lg text-[color:var(--foreground)]">表示形式</span>
      <div className="gt-tab-track flex">
        <button
          type="button"
          onClick={() => onViewModeChange('map')}
          className={`gt-tab gt-pill-label flex items-center gap-1 ${viewMode === 'map' ? 'gt-tab-active' : 'gt-tab-inactive'}`}
        >
          <MapIcon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${viewMode === 'map' ? 'text-[color:var(--gt-secondary-strong)]' : 'text-[color:var(--text-muted)]'}`} />
          地図
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('list')}
          className={`gt-tab gt-pill-label flex items-center gap-1 ${viewMode === 'list' ? 'gt-tab-active' : 'gt-tab-inactive'}`}
        >
          <List className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${viewMode === 'list' ? 'text-[color:var(--gt-secondary-strong)]' : 'text-[color:var(--text-muted)]'}`} />
          リスト
        </button>
      </div>
    </div>
  )
}