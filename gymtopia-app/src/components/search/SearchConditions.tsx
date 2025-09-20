'use client'

import { X } from 'lucide-react'

interface SearchConditionsProps {
  conditions: {
    machines: Array<{ name: string; count: number }>
    freeWeights: Array<{ name: string; count: number }>
    facilities: string[]
  }
  searchParams: URLSearchParams
  onRemoveCondition: (type: 'machines' | 'freeWeights' | 'facilities', value: string) => void
  onClearAll: () => void
}

export default function SearchConditions({
  conditions,
  searchParams,
  onRemoveCondition,
  onClearAll
}: SearchConditionsProps) {
  const getTotalConditionsCount = () => {
    return conditions.machines.length + conditions.freeWeights.length + conditions.facilities.length
  }

  if (getTotalConditionsCount() === 0 && !searchParams.get('searchType')) {
    return null
  }

  return (
    <div className="gt-layer p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="gt-label-lg text-[color:var(--foreground)]">検索条件</h3>
        <button
          type="button"
          onClick={onClearAll}
          className="gt-pill-label text-[color:var(--gt-secondary-strong)] hover:text-[color:var(--gt-secondary-strong)]"
        >
          すべてクリア
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {searchParams.get('searchType') && (
          <>
            {searchParams.get('muscle') && (
              <span className="gt-chip gt-chip--primary text-[11px] sm:text-xs">
                🏋️ 部位: {searchParams.get('muscle')}
              </span>
            )}
            {searchParams.get('maker') && (
              <span className="gt-chip gt-chip--secondary text-[11px] sm:text-xs">
                🏭 メーカー: {searchParams.get('maker')}
              </span>
            )}
            {searchParams.get('name') && (
              <span className="gt-chip text-[11px] sm:text-xs" style={{ background: 'rgba(255, 166, 77, 0.15)', borderColor: 'rgba(255, 166, 77, 0.35)', color: 'var(--gt-primary-strong)' }}>
                🎯 マシン: {searchParams.get('name')}
              </span>
            )}
          </>
        )}
        {conditions.machines.map((machine, index) => (
          <button
            type="button"
            key={`machine-${index}-${machine.name}`}
            onClick={() => onRemoveCondition('machines', machine.name)}
            className="gt-chip gt-chip--secondary text-[11px] sm:text-xs"
          >
            <span>{machine.name}</span>
            {machine.count > 1 && (
              <span className="font-semibold">×{machine.count}</span>
            )}
            <X className="w-3 h-3" />
          </button>
        ))}
        {conditions.freeWeights.map((weight, index) => (
          <button
            type="button"
            key={`weight-${index}-${weight.name}`}
            onClick={() => onRemoveCondition('freeWeights', weight.name)}
            className="gt-chip gt-chip--primary text-[11px] sm:text-xs"
          >
            <span>{weight.name}</span>
            {weight.count > 1 && (
              <span className="font-semibold">×{weight.count}</span>
            )}
            <X className="w-3 h-3" />
          </button>
        ))}
        {conditions.facilities.map((facility, index) => (
          <button
            type="button"
            key={`facility-${index}-${facility}`}
            onClick={() => onRemoveCondition('facilities', facility)}
            className="gt-chip text-[11px] sm:text-xs"
            style={{ background: 'rgba(56, 215, 167, 0.18)', borderColor: 'rgba(56, 215, 167, 0.35)', color: 'var(--gt-tertiary-strong)' }}
          >
            <span>{facility}</span>
            <X className="w-3 h-3" />
          </button>
        ))}
      </div>
      {getTotalConditionsCount() > 1 && (
        <div className="mt-3 pt-2 border-t border-white/50">
          <p className="gt-body-muted text-[11px] sm:text-xs">
            条件が多すぎる場合は、いくつか削除してみてください
          </p>
        </div>
      )}
    </div>
  )
}