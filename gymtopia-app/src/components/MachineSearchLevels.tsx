'use client'

import { useState } from 'react'
import { 
  ChevronRight, Check, Info, Search,
  Zap, Target, Microscope
} from 'lucide-react'

export type SearchLevel = 'fuzzy' | 'detailed' | 'super_detailed'

interface SearchLevelConfig {
  id: SearchLevel
  name: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
}

const searchLevels: SearchLevelConfig[] = [
  {
    id: 'fuzzy',
    name: '曖昧検索',
    description: '部位のみで検索（大胸筋、広背筋など）',
    icon: Zap,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500'
  },
  {
    id: 'detailed',
    name: '詳細検索',
    description: '部位 + 追加条件（角度、グリップなど）',
    icon: Target,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500'
  },
  {
    id: 'super_detailed',
    name: '超詳細検索',
    description: '特定メーカー・機器モデルで検索',
    icon: Microscope,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-500'
  }
]

interface MachineSearchLevelsProps {
  selectedLevel: SearchLevel
  onLevelChange: (level: SearchLevel) => void
}

export default function MachineSearchLevels({ 
  selectedLevel, 
  onLevelChange 
}: MachineSearchLevelsProps) {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <div className="space-y-4">
      {/* Info Toggle */}
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <Info className="w-4 h-4" />
        <span>検索レベルについて</span>
        <ChevronRight className={`w-4 h-4 transition-transform ${showInfo ? 'rotate-90' : ''}`} />
      </button>

      {/* Info Content */}
      {showInfo && (
        <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 space-y-2">
          <p className="font-medium text-slate-900">検索レベルの違い：</p>
          <ul className="space-y-1.5 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-green-600">•</span>
              <span><strong>曖昧検索：</strong>大まかな部位だけで検索。初心者向け</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span><strong>詳細検索：</strong>部位に加えて、角度や動作を指定</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600">•</span>
              <span><strong>超詳細：</strong>特定のブランドや機器モデルまで指定</span>
            </li>
          </ul>
        </div>
      )}

      {/* Level Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {searchLevels.map((level) => {
          const Icon = level.icon
          const isSelected = selectedLevel === level.id
          
          return (
            <button
              key={level.id}
              onClick={() => onLevelChange(level.id)}
              className={`
                relative p-4 rounded-xl border-2 transition-all
                ${isSelected 
                  ? `${level.bgColor} ${level.borderColor}` 
                  : 'bg-white border-slate-200 hover:border-slate-300'
                }
              `}
            >
              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${level.color} bg-white`}>
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`w-12 h-12 rounded-xl ${level.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${level.color}`} />
                </div>
                <div>
                  <h3 className={`font-semibold ${isSelected ? level.color : 'text-slate-900'}`}>
                    {level.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {level.description}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}