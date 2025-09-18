'use client'

import { useState } from 'react'
import { Check, ChevronRight, Award, Shield } from 'lucide-react'

interface MachineModel {
  id: string
  brand: string
  model: string
  series?: string
  year?: string
  features: string[]
  targetMuscles: string[]
}

const machineModels: MachineModel[] = [
  // Hammer Strength
  {
    id: 'hs_mts_chest',
    brand: 'Hammer Strength',
    model: 'MTS Iso-Lateral Chest Press',
    series: 'MTS Series',
    year: '2023',
    features: ['電子負荷調整', 'バイオメカニクス設計', 'モーションテクノロジー'],
    targetMuscles: ['大胸筋', '三角筋前部', '上腕三頭筋']
  },
  {
    id: 'hs_plate_chest',
    brand: 'Hammer Strength',
    model: 'Plate-Loaded Iso-Lateral Chest Press',
    series: 'Plate-Loaded',
    features: ['プレートロード式', '左右独立動作', '自然な軌道'],
    targetMuscles: ['大胸筋']
  },
  {
    id: 'hs_select_lat',
    brand: 'Hammer Strength',
    model: 'Select Lat Pulldown',
    series: 'Select Series',
    features: ['セレクタライズド', '複数グリップ対応', '滑らかな動作'],
    targetMuscles: ['広背筋', '僧帽筋', '菱形筋']
  },
  
  // Life Fitness
  {
    id: 'lf_signature_chest',
    brand: 'Life Fitness',
    model: 'Signature Series Chest Press',
    series: 'Signature',
    year: '2024',
    features: ['プレミアムデザイン', '人間工学設計', '耐久性重視'],
    targetMuscles: ['大胸筋']
  },
  {
    id: 'lf_insignia_squat',
    brand: 'Life Fitness',
    model: 'Insignia Series Squat Press',
    series: 'Insignia',
    features: ['最上位モデル', 'Apple GymKit対応', 'カスタマイズ可能'],
    targetMuscles: ['大腿四頭筋', '大臀筋', 'ハムストリングス']
  },
  
  // Technogym
  {
    id: 'tg_pure_chest',
    brand: 'Technogym',
    model: 'PURE Chest Press',
    series: 'PURE Strength',
    features: ['イタリアンデザイン', 'バイオメカニクス', 'QRコード連携'],
    targetMuscles: ['大胸筋']
  },
  {
    id: 'tg_selection_leg',
    brand: 'Technogym',
    model: 'Selection 900 Leg Press',
    series: 'Selection 900',
    year: '2023',
    features: ['Unity Mini対応', 'ワイヤレス接続', 'トレーニング記録'],
    targetMuscles: ['大腿四頭筋', '大臀筋']
  },
  
  // Cybex
  {
    id: 'cybex_eagle_chest',
    brand: 'Cybex',
    model: 'Eagle NX Chest Press',
    series: 'Eagle NX',
    features: ['高級ライン', '滑らかな動作', '調整簡単'],
    targetMuscles: ['大胸筋']
  },
  {
    id: 'cybex_vr3_back',
    brand: 'Cybex',
    model: 'VR3 Back Extension',
    series: 'VR3',
    features: ['スタンダードモデル', '安全設計', 'コンパクト'],
    targetMuscles: ['脊柱起立筋', '大臀筋']
  },
  
  // Matrix
  {
    id: 'matrix_ultra_chest',
    brand: 'Matrix',
    model: 'Ultra Series Chest Press',
    series: 'Ultra',
    year: '2024',
    features: ['プレミアムライン', '7インチディスプレイ', 'Virtual Active対応'],
    targetMuscles: ['大胸筋']
  },
  {
    id: 'matrix_versa_leg',
    brand: 'Matrix',
    model: 'Versa Series Leg Press',
    series: 'Versa',
    features: ['プレートロード', '省スペース', '高耐久性'],
    targetMuscles: ['大腿四頭筋']
  },
  
  // Precor
  {
    id: 'precor_discovery_chest',
    brand: 'Precor',
    model: 'Discovery Series Chest Press',
    series: 'Discovery',
    features: ['セレクタライズド', '50種類以上のマシン', 'Preva対応'],
    targetMuscles: ['大胸筋']
  },
  
  // Nautilus
  {
    id: 'nautilus_one_chest',
    brand: 'Nautilus',
    model: 'Nautilus One Chest Press',
    series: 'Nautilus One',
    features: ['特許取得カム', 'ウォークスルー設計', '4バー連動'],
    targetMuscles: ['大胸筋']
  }
]

interface MachineSuperDetailedSearchProps {
  selectedModels: Set<string>
  onSelectionChange: (models: Set<string>) => void
}

export default function MachineSuperDetailedSearch({ 
  selectedModels, 
  onSelectionChange 
}: MachineSuperDetailedSearchProps) {
  const [expandedBrand, setExpandedBrand] = useState<string | null>('Hammer Strength')
  const [searchTerm, setSearchTerm] = useState('')

  const handleModelToggle = (modelId: string) => {
    const newSelection = new Set(selectedModels)
    
    if (newSelection.has(modelId)) {
      newSelection.delete(modelId)
    } else {
      newSelection.add(modelId)
    }
    
    onSelectionChange(newSelection)
  }

  const handleBrandToggle = (brand: string) => {
    const newSelection = new Set(selectedModels)
    const brandModels = machineModels.filter(m => m.brand === brand)
    const allSelected = brandModels.every(m => selectedModels.has(m.id))

    if (allSelected) {
      brandModels.forEach(m => newSelection.delete(m.id))
    } else {
      brandModels.forEach(m => newSelection.add(m.id))
    }

    onSelectionChange(newSelection)
  }

  // Group by brand
  const groupedModels = machineModels.reduce((acc, model) => {
    if (!acc[model.brand]) {
      acc[model.brand] = []
    }
    acc[model.brand].push(model)
    return acc
  }, {} as Record<string, MachineModel[]>)

  // Filter by search term
  const filteredGroups = Object.entries(groupedModels).reduce((acc, [brand, models]) => {
    const filtered = models.filter(model => 
      searchTerm === '' ||
      model.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.series?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.targetMuscles.some(muscle => muscle.includes(searchTerm))
    )
    if (filtered.length > 0) {
      acc[brand] = filtered
    }
    return acc
  }, {} as Record<string, MachineModel[]>)

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="モデル名、シリーズ名、筋肉部位で検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 pr-10 bg-white border border-[rgba(186,122,103,0.26)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] focus:border-transparent"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(68,73,73,0.6)] hover:text-[color:var(--text-muted)]"
          >
            ✕
          </button>
        )}
      </div>

      <p className="text-sm text-[color:var(--text-muted)]">
        特定のメーカー・モデルを選択してください
      </p>

      {/* Brand Groups */}
      {Object.entries(filteredGroups).map(([brand, models]) => {
        const isExpanded = expandedBrand === brand
        const selectedCount = models.filter(m => selectedModels.has(m.id)).length
        const allSelected = selectedCount === models.length
        
        return (
          <div key={brand} className="bg-white rounded-xl border border-[rgba(186,122,103,0.26)] overflow-hidden">
            {/* Brand Header */}
            <div className="p-4 bg-gradient-to-r from-[rgba(240,142,111,0.1)] to-[rgba(245,177,143,0.12)]">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setExpandedBrand(isExpanded ? null : brand)}
                  className="flex-1 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Award className="w-5 h-5 text-[color:var(--gt-secondary-strong)]" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-[color:var(--foreground)]">{brand}</h4>
                      <p className="text-xs text-[color:var(--text-muted)]">
                        {models.length}モデル {selectedCount > 0 && `(${selectedCount}選択中)`}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-[rgba(68,73,73,0.6)] transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`} />
                </button>
                
                <button
                  onClick={() => handleBrandToggle(brand)}
                  className={`
                    ml-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${allSelected 
                      ? 'bg-[rgba(240,142,111,0.1)] text-white' 
                      : 'bg-white text-[color:var(--text-subtle)] hover:bg-[rgba(254,255,250,0.95)]'
                    }
                  `}
                >
                  {allSelected ? '選択解除' : 'すべて選択'}
                </button>
              </div>
            </div>

            {/* Models */}
            {isExpanded && (
              <div className="p-4 space-y-3 bg-[rgba(254,255,250,0.97)]">
                {models.map((model) => {
                  const isChecked = selectedModels.has(model.id)
                  
                  return (
                    <button
                      key={model.id}
                      onClick={() => handleModelToggle(model.id)}
                      className={`
                        w-full p-4 rounded-xl text-left transition-all
                        ${isChecked 
                          ? 'bg-[rgba(240,142,111,0.16)] border-2 border-[color:var(--gt-secondary)]' 
                          : 'bg-white border-2 border-[rgba(186,122,103,0.26)] hover:border-[rgba(186,122,103,0.32)]'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`font-semibold text-sm ${
                              isChecked ? 'text-[color:var(--gt-secondary-strong)]' : 'text-[color:var(--foreground)]'
                            }`}>
                              {model.model}
                            </p>
                            {model.year && (
                              <span className="px-2 py-0.5 bg-[rgba(254,255,250,0.95)] text-xs text-[color:var(--text-muted)] rounded">
                                {model.year}
                              </span>
                            )}
                          </div>
                          
                          {model.series && (
                            <p className="text-xs text-[color:var(--text-muted)] mb-2">
                              <Shield className="w-3 h-3 inline mr-1" />
                              {model.series}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap gap-1 mb-2">
                            {model.features.map((feature, idx) => (
                              <span 
                                key={idx}
                                className="px-2 py-0.5 bg-[rgba(240,142,111,0.1)] text-xs text-[color:var(--gt-secondary-strong)] rounded"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {model.targetMuscles.map((muscle, idx) => (
                              <span 
                                key={idx}
                                className="px-2 py-0.5 bg-[rgba(231,103,76,0.08)] text-xs text-[color:var(--gt-secondary-strong)] rounded"
                              >
                                {muscle}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className={`
                          ml-3 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                          ${isChecked 
                            ? 'bg-[rgba(240,142,111,0.1)] border-[color:var(--gt-secondary)]' 
                            : 'border-[rgba(186,122,103,0.32)]'
                          }
                        `}>
                          {isChecked && <Check className="w-4 h-4 text-white" />}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {Object.keys(filteredGroups).length === 0 && (
        <div className="text-center py-8 text-[color:var(--text-muted)]">
          <p>検索条件に一致するモデルが見つかりません</p>
        </div>
      )}
    </div>
  )
}