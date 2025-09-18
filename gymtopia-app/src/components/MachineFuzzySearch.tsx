'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

interface BodyPart {
  id: string
  name: string
  muscles: string[]
}

const bodyParts: BodyPart[] = [
  {
    id: 'chest',
    name: '胸部',
    muscles: ['大胸筋上部', '大胸筋中部', '大胸筋下部', '前鋸筋']
  },
  {
    id: 'back',
    name: '背中',
    muscles: ['広背筋', '僧帽筋', '菱形筋', '脊柱起立筋']
  },
  {
    id: 'shoulders',
    name: '肩',
    muscles: ['三角筋前部', '三角筋中部', '三角筋後部', 'ローテーターカフ']
  },
  {
    id: 'legs',
    name: '脚',
    muscles: ['大腿四頭筋', 'ハムストリングス', '大臀筋', '中臀筋', '腓腹筋', 'ヒラメ筋']
  },
  {
    id: 'arms',
    name: '腕',
    muscles: ['上腕二頭筋', '上腕三頭筋', '前腕筋群']
  },
  {
    id: 'core',
    name: '体幹',
    muscles: ['腹直筋', '外腹斜筋', '内腹斜筋', '腹横筋']
  }
]

interface MachineFuzzySearchProps {
  selectedParts: Set<string>
  onSelectionChange: (parts: Set<string>) => void
}

export default function MachineFuzzySearch({ 
  selectedParts, 
  onSelectionChange 
}: MachineFuzzySearchProps) {
  const [expandedPart, setExpandedPart] = useState<string | null>('chest')

  const handlePartToggle = (partId: string) => {
    const newSelection = new Set(selectedParts)
    const part = bodyParts.find(p => p.id === partId)
    
    if (!part) return

    const hasAnyMuscle = part.muscles.some(muscle => 
      selectedParts.has(`${partId}:${muscle}`)
    )

    if (hasAnyMuscle) {
      // Remove all muscles from this part
      part.muscles.forEach(muscle => {
        newSelection.delete(`${partId}:${muscle}`)
      })
    } else {
      // Add all muscles from this part
      part.muscles.forEach(muscle => {
        newSelection.add(`${partId}:${muscle}`)
      })
    }

    onSelectionChange(newSelection)
  }

  const handleMuscleToggle = (partId: string, muscle: string) => {
    const newSelection = new Set(selectedParts)
    const key = `${partId}:${muscle}`
    
    if (newSelection.has(key)) {
      newSelection.delete(key)
    } else {
      newSelection.add(key)
    }
    
    onSelectionChange(newSelection)
  }

  const isPartSelected = (partId: string) => {
    const part = bodyParts.find(p => p.id === partId)
    if (!part) return false
    return part.muscles.every(muscle => 
      selectedParts.has(`${partId}:${muscle}`)
    )
  }

  const isPartPartiallySelected = (partId: string) => {
    const part = bodyParts.find(p => p.id === partId)
    if (!part) return false
    const selectedCount = part.muscles.filter(muscle => 
      selectedParts.has(`${partId}:${muscle}`)
    ).length
    return selectedCount > 0 && selectedCount < part.muscles.length
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[color:var(--text-muted)] mb-4">
        トレーニングしたい筋肉部位を選択してください
      </p>

      {bodyParts.map((part) => {
        const isExpanded = expandedPart === part.id
        const isSelected = isPartSelected(part.id)
        const isPartial = isPartPartiallySelected(part.id)
        
        return (
          <div key={part.id} className="bg-white rounded-xl border border-[rgba(186,122,103,0.26)] overflow-hidden">
            {/* Part Header */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setExpandedPart(isExpanded ? null : part.id)}
                  className="flex-1 text-left"
                >
                  <h3 className="font-semibold text-[color:var(--foreground)]">{part.name}</h3>
                  <p className="text-xs text-[color:var(--text-muted)] mt-0.5">
                    {part.muscles.length}個の筋肉群
                  </p>
                </button>
                
                <button
                  onClick={() => handlePartToggle(part.id)}
                  className={`
                    w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all
                    ${isSelected 
                      ? 'bg-[rgba(240,142,111,0.1)] border-[color:var(--gt-secondary)]' 
                      : isPartial
                      ? 'bg-[rgba(240,142,111,0.16)] border-[color:var(--gt-secondary)]'
                      : 'border-[rgba(186,122,103,0.32)] hover:border-[rgba(231,103,76,0.38)]'
                    }
                  `}
                >
                  {(isSelected || isPartial) && (
                    <Check className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[color:var(--gt-secondary-strong)]'}`} />
                  )}
                </button>
              </div>
            </div>

            {/* Muscle List */}
            {isExpanded && (
              <div className="border-t border-[rgba(186,122,103,0.18)] px-4 py-3 bg-[rgba(254,255,250,0.97)]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {part.muscles.map((muscle) => {
                    const key = `${part.id}:${muscle}`
                    const isChecked = selectedParts.has(key)
                    
                    return (
                      <button
                        key={muscle}
                        onClick={() => handleMuscleToggle(part.id, muscle)}
                        className={`
                          px-3 py-2 rounded-lg text-sm text-left transition-all
                          ${isChecked 
                            ? 'bg-[rgba(240,142,111,0.16)] text-[color:var(--gt-secondary-strong)] font-medium' 
                            : 'bg-white text-[color:var(--text-subtle)] hover:bg-[rgba(254,255,250,0.95)]'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`
                            w-4 h-4 rounded border flex items-center justify-center
                            ${isChecked 
                              ? 'bg-[rgba(240,142,111,0.1)] border-[color:var(--gt-secondary)]' 
                              : 'border-[rgba(186,122,103,0.32)]'
                            }
                          `}>
                            {isChecked && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span>{muscle}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}