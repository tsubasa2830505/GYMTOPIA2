'use client'

import { ChevronDown, Navigation, Star, Heart } from 'lucide-react'
import { useRef, useEffect } from 'react'

interface SortControlProps {
  sortBy: 'popular' | 'distance' | 'rating'
  sortDropdownOpen: boolean
  userLocation: { lat: number; lng: number } | null
  onSortChange: (sortBy: 'popular' | 'distance' | 'rating') => void
  onDropdownToggle: () => void
  onDropdownClose: () => void
}

export default function SortControl({
  sortBy,
  sortDropdownOpen,
  userLocation,
  onSortChange,
  onDropdownToggle,
  onDropdownClose
}: SortControlProps) {
  const sortControlRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!sortDropdownOpen) return
      if (sortControlRef.current && sortControlRef.current.contains(event.target as Node)) {
        return
      }
      onDropdownClose()
    }

    if (sortDropdownOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [sortDropdownOpen, onDropdownClose])

  return (
    <div className="relative" ref={sortControlRef}>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onDropdownToggle()
        }}
        className="flex items-center gap-1 sm:gap-2 gt-pressable border-2 border-[rgba(186,122,103,0.32)] hover:border-[rgba(231,103,76,0.38)] rounded-2xl bg-white/80 px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-[0_12px_32px_-26px_rgba(189,101,78,0.38)] hover:-translate-y-[1px] transition-all"
      >
        {sortBy === 'distance' ? (
          <Navigation className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[color:var(--gt-secondary-strong)]" />
        ) : sortBy === 'rating' ? (
          <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[color:var(--gt-secondary-strong)]" />
        ) : (
          <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[color:var(--gt-secondary-strong)]" />
        )}
        <span className="gt-pill-label text-[10px] sm:text-xs text-[color:var(--foreground)]">
          {sortBy === 'distance' ? '近い順' :
           sortBy === 'rating' ? '評価の高い順' :
           'イキタイの多い順'}
        </span>
        <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-[color:var(--text-muted)] transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {sortDropdownOpen && (
        <div
          className="absolute right-0 top-full mt-2 gt-card p-1 w-44 z-50"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onSortChange('popular')
              onDropdownClose()
            }}
            className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2 gt-pressable transition-colors ${sortBy === 'popular' ? 'bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-primary-strong)] text-white' : 'text-[color:var(--text-muted)] hover:bg-[rgba(231,103,76,0.08)]'}`}
          >
            <Heart className="w-3 h-3" />
            イキタイの多い順
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              if (!userLocation) return
              onSortChange('distance')
              onDropdownClose()
            }}
            disabled={!userLocation}
            className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2 gt-pressable transition-colors ${sortBy === 'distance' ? 'bg-gradient-to-r from-[var(--gt-secondary)] to-[var(--gt-secondary)] text-white' : 'text-[color:var(--text-muted)] hover:bg-[rgba(231,103,76,0.08)]'} ${!userLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Navigation className="w-3 h-3" />
            近い順
            {!userLocation && <span className="text-[10px] text-[color:var(--text-muted)] ml-auto">要位置情報</span>}
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onSortChange('rating')
              onDropdownClose()
            }}
            className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2 gt-pressable transition-colors ${sortBy === 'rating' ? 'bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white' : 'text-[color:var(--text-muted)] hover:bg-[rgba(231,103,76,0.08)]'}`}
          >
            <Star className="w-3 h-3" />
            評価の高い順
          </button>
        </div>
      )}
    </div>
  )
}