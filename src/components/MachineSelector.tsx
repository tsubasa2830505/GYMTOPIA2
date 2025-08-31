'use client'

import { useState } from 'react'
import { 
  ChevronRight, Check, Settings, Target, Factory,
  Zap, Activity, Cpu, Dumbbell
} from 'lucide-react'

interface MachineSelectorProps {
  selectedMachines: Set<string>
  onSelectionChange: (selected: Set<string>) => void
}

interface MachineFilter {
  target: string[]
  type: string[]
  maker: string[]
}

const targetOptions = [
  { id: 'chest', name: '胸', parts: ['上部', '中部', '下部'] },
  { id: 'back', name: '背中', parts: ['上部', '中部', '下部', '僧帽筋'] },
  { id: 'shoulder', name: '肩', parts: ['前部', '中部', '後部'] },
  { id: 'legs', name: '脚', parts: ['大腿四頭筋', 'ハムストリング', '臀筋', 'カーフ', '内転筋', '外転筋'] },
  { id: 'arms', name: '腕', parts: ['二頭筋', '三頭筋'] },
  { id: 'core', name: '体幹', parts: ['腹直筋', '腹斜筋', '下背部'] },
]

const typeOptions = [
  { id: 'plate-loaded', name: 'プレートロード', icon: Dumbbell },
  { id: 'selectorized', name: 'セレクタライズ（重量スタック）', icon: Activity },
  { id: 'cable', name: 'ケーブル（可動プーリー含む）', icon: Zap },
  { id: 'smith', name: 'スミスマシン', icon: Cpu },
  { id: 'leg-press', name: 'レッグプレス（ハック/スレッド/垂直等）', icon: Settings },
]

const makerOptions = [
  { id: 'hammer', name: 'Hammer Strength' },
  { id: 'cybex', name: 'Cybex' },
  { id: 'life-fitness', name: 'Life Fitness' },
  { id: 'technogym', name: 'Technogym' },
  { id: 'matrix', name: 'Matrix' },
  { id: 'rogue', name: 'Rogue' },
  { id: 'eleiko', name: 'Eleiko' },
  { id: 'watson', name: 'Watson' },
  { id: 'prime', name: 'Prime' },
  { id: 'nautilus', name: 'Nautilus' },
]

const machines = [
  // 胸
  { id: 'iso-lateral-incline-press', name: 'Iso-Lateral Incline Press', target: 'chest-upper', type: 'plate-loaded', maker: 'hammer' },
  { id: 'iso-lateral-decline-press', name: 'Iso-Lateral Decline Press', target: 'chest-lower', type: 'plate-loaded', maker: 'hammer' },
  { id: 'chest-press', name: 'Chest Press', target: 'chest-middle', type: 'selectorized', maker: 'life-fitness' },
  { id: 'pec-deck', name: 'Pec Deck', target: 'chest-middle', type: 'selectorized', maker: 'technogym' },
  { id: 'cable-crossover', name: 'Cable Crossover', target: 'chest-middle', type: 'cable', maker: 'cybex' },
  
  // 背中
  { id: 'iso-lateral-row', name: 'Iso-Lateral Row', target: 'back-middle', type: 'plate-loaded', maker: 'hammer' },
  { id: 'iso-lateral-pulldown', name: 'Iso-Lateral Pulldown', target: 'back-upper', type: 'plate-loaded', maker: 'hammer' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', target: 'back-upper', type: 'cable', maker: 'life-fitness' },
  { id: 'seated-row', name: 'Seated Row', target: 'back-middle', type: 'cable', maker: 'cybex' },
  { id: 'pullover', name: 'Pullover Machine', target: 'back-upper', type: 'selectorized', maker: 'nautilus' },
  
  // 肩
  { id: 'shoulder-press', name: 'Shoulder Press', target: 'shoulder-middle', type: 'selectorized', maker: 'life-fitness' },
  { id: 'lateral-raise', name: 'Lateral Raise Machine', target: 'shoulder-middle', type: 'selectorized', maker: 'technogym' },
  { id: 'rear-delt-fly', name: 'Rear Delt Fly', target: 'shoulder-rear', type: 'selectorized', maker: 'cybex' },
  
  // 脚
  { id: 'leg-extension', name: 'Leg Extension', target: 'legs-quad', type: 'selectorized', maker: 'life-fitness' },
  { id: 'seated-leg-curl', name: 'Seated Leg Curl', target: 'legs-hamstring', type: 'selectorized', maker: 'cybex' },
  { id: 'lying-leg-curl', name: 'Lying Leg Curl', target: 'legs-hamstring', type: 'selectorized', maker: 'technogym' },
  { id: 'hip-thrust', name: 'Hip Thrust Machine', target: 'legs-glutes', type: 'plate-loaded', maker: 'hammer' },
  { id: 'leg-press', name: '45° Leg Press', target: 'legs-quad', type: 'leg-press', maker: 'hammer' },
  { id: 'hack-squat', name: 'Hack Squat', target: 'legs-quad', type: 'leg-press', maker: 'cybex' },
  { id: 'calf-raise', name: 'Calf Raise', target: 'legs-calf', type: 'selectorized', maker: 'life-fitness' },
  { id: 'hip-abduction', name: 'Hip Abduction', target: 'legs-abductor', type: 'selectorized', maker: 'technogym' },
  { id: 'hip-adduction', name: 'Hip Adduction', target: 'legs-adductor', type: 'selectorized', maker: 'technogym' },
  
  // 腕
  { id: 'preacher-curl', name: 'Preacher Curl Machine', target: 'arms-biceps', type: 'selectorized', maker: 'life-fitness' },
  { id: 'tricep-extension', name: 'Tricep Extension', target: 'arms-triceps', type: 'selectorized', maker: 'cybex' },
  { id: 'cable-curl', name: 'Cable Curl', target: 'arms-biceps', type: 'cable', maker: 'matrix' },
  
  // 体幹
  { id: 'ab-crunch', name: 'Ab Crunch Machine', target: 'core-abs', type: 'selectorized', maker: 'life-fitness' },
  { id: 'rotary-torso', name: 'Rotary Torso', target: 'core-obliques', type: 'selectorized', maker: 'technogym' },
  { id: 'back-extension', name: 'Back Extension', target: 'core-lower-back', type: 'selectorized', maker: 'cybex' },
  
  // スミスマシン
  { id: 'smith-machine', name: 'Smith Machine', target: 'multiple', type: 'smith', maker: 'hammer' },
  { id: 'smith-machine-3d', name: '3D Smith Machine', target: 'multiple', type: 'smith', maker: 'matrix' },
]

export default function MachineSelector({ selectedMachines, onSelectionChange }: MachineSelectorProps) {
  const [filter, setFilter] = useState<MachineFilter>({
    target: [],
    type: [],
    maker: []
  })
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['target']))
  
  // ターゲットに基づいて関連するタイプを取得
  const getRelatedTypes = () => {
    if (filter.target.length === 0) return []
    
    const relatedTypes = new Set<string>()
    
    // 選択されたターゲットに該当するマシンのタイプを収集
    machines.forEach(machine => {
      const isTargetMatch = filter.target.some(t => machine.target.startsWith(t))
      if (isTargetMatch) {
        relatedTypes.add(machine.type)
      }
    })
    
    return Array.from(relatedTypes)
  }
  
  // ターゲットとタイプに基づいて関連するメーカーを取得
  const getRelatedMakers = () => {
    if (filter.target.length === 0 && filter.type.length === 0) return []
    
    const relatedMakers = new Set<string>()
    
    // フィルターに該当するマシンのメーカーを収集
    machines.forEach(machine => {
      const targetMatch = filter.target.length === 0 || 
        filter.target.some(t => machine.target.startsWith(t))
      const typeMatch = filter.type.length === 0 || 
        filter.type.includes(machine.type)
      
      if (targetMatch && typeMatch) {
        relatedMakers.add(machine.maker)
      }
    })
    
    return Array.from(relatedMakers)
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const toggleFilter = (category: 'target' | 'type' | 'maker', value: string) => {
    const newFilter = { ...filter }
    const index = newFilter[category].indexOf(value)
    
    if (index > -1) {
      newFilter[category] = newFilter[category].filter(item => item !== value)
    } else {
      newFilter[category] = [...newFilter[category], value]
    }
    
    setFilter(newFilter)
  }

  const filteredMachines = machines.filter(machine => {
    const targetMatch = filter.target.length === 0 || 
      filter.target.some(t => machine.target.startsWith(t.split('-')[0]))
    const typeMatch = filter.type.length === 0 || filter.type.includes(machine.type)
    const makerMatch = filter.maker.length === 0 || filter.maker.includes(machine.maker)
    
    return targetMatch && typeMatch && makerMatch
  })

  const toggleMachine = (machineId: string) => {
    const newSelected = new Set(selectedMachines)
    if (newSelected.has(machineId)) {
      newSelected.delete(machineId)
    } else {
      newSelected.add(machineId)
    }
    onSelectionChange(newSelected)
  }

  const selectAllFiltered = () => {
    const newSelected = new Set(selectedMachines)
    filteredMachines.forEach(machine => {
      newSelected.add(machine.id)
    })
    onSelectionChange(newSelected)
  }

  const deselectAllFiltered = () => {
    const newSelected = new Set(selectedMachines)
    filteredMachines.forEach(machine => {
      newSelected.delete(machine.id)
    })
    onSelectionChange(newSelected)
  }

  return (
    <div className="space-y-4">
      {/* フィルター部分 */}
      <div className="space-y-3">
        {/* ターゲット（部位） */}
        <div className="md-card overflow-hidden">
          <button
            onClick={() => toggleSection('target')}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 md-transition-standard"
          >
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-slate-900">ターゲット（部位）</h3>
              {filter.target.length > 0 && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {filter.target.length}
                </span>
              )}
            </div>
            <ChevronRight 
              className={`w-5 h-5 text-slate-400 transition-transform ${
                expandedSections.has('target') ? 'rotate-90' : ''
              }`} 
            />
          </button>
          
          {expandedSections.has('target') && (
            <div className="border-t border-slate-100 p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {targetOptions.map((target) => (
                  <button
                    key={target.id}
                    onClick={() => toggleFilter('target', target.id)}
                    className={`p-2 rounded-lg text-sm font-medium transition-all ${
                      filter.target.includes(target.id)
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {target.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* タイプ */}
        <div className="md-card overflow-hidden">
          <button
            onClick={() => toggleSection('type')}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 md-transition-standard"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-slate-900">タイプ</h3>
              {filter.type.length > 0 && (
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {filter.type.length}
                </span>
              )}
            </div>
            <ChevronRight 
              className={`w-5 h-5 text-slate-400 transition-transform ${
                expandedSections.has('type') ? 'rotate-90' : ''
              }`} 
            />
          </button>
          
          {expandedSections.has('type') && (
            <div className="border-t border-slate-100 p-4 space-y-2">
              {typeOptions.map((type) => {
                const relatedTypes = getRelatedTypes()
                const isRelated = relatedTypes.includes(type.id)
                const isSelected = filter.type.includes(type.id)
                
                return (
                  <button
                    key={type.id}
                    onClick={() => toggleFilter('type', type.id)}
                    className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'bg-green-500 text-white'
                        : isRelated && filter.target.length > 0
                        ? 'bg-green-50 text-green-700 border-2 border-green-300 hover:bg-green-100'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <type.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{type.name}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* メーカー */}
        <div className="md-card overflow-hidden">
          <button
            onClick={() => toggleSection('maker')}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 md-transition-standard"
          >
            <div className="flex items-center gap-3">
              <Factory className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-slate-900">メーカー</h3>
              {filter.maker.length > 0 && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  {filter.maker.length}
                </span>
              )}
            </div>
            <ChevronRight 
              className={`w-5 h-5 text-slate-400 transition-transform ${
                expandedSections.has('maker') ? 'rotate-90' : ''
              }`} 
            />
          </button>
          
          {expandedSections.has('maker') && (
            <div className="border-t border-slate-100 p-4">
              <div className="grid grid-cols-2 gap-2">
                {makerOptions.map((maker) => {
                  const relatedMakers = getRelatedMakers()
                  const isRelated = relatedMakers.includes(maker.id)
                  const isSelected = filter.maker.includes(maker.id)
                  
                  return (
                    <button
                      key={maker.id}
                      onClick={() => toggleFilter('maker', maker.id)}
                      className={`p-2 rounded-lg text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-purple-500 text-white'
                          : isRelated && (filter.target.length > 0 || filter.type.length > 0)
                          ? 'bg-purple-50 text-purple-700 border-2 border-purple-300 hover:bg-purple-100'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {maker.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* フィルター結果と一括操作 */}
      <div className="md-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-slate-600">
            {filteredMachines.length}台のマシンが見つかりました
            {selectedMachines.size > 0 && (
              <span className="ml-2 font-medium text-blue-600">
                （{Array.from(selectedMachines).filter(id => 
                  filteredMachines.some(m => m.id === id)
                ).length}台選択中）
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <button
              onClick={selectAllFiltered}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
            >
              すべて選択
            </button>
            <button
              onClick={deselectAllFiltered}
              className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              選択解除
            </button>
          </div>
        </div>
      </div>

      {/* マシン一覧 */}
      <div className="space-y-2">
        {filteredMachines.map((machine) => {
          const target = targetOptions.find(t => machine.target.startsWith(t.id))
          const type = typeOptions.find(t => t.id === machine.type)
          const maker = makerOptions.find(m => m.id === machine.maker)
          
          return (
            <button
              key={machine.id}
              onClick={() => toggleMachine(machine.id)}
              className={`w-full p-4 rounded-xl flex items-center justify-between transition-all ${
                selectedMachines.has(machine.id)
                  ? 'md-primary-container border-2 border-blue-500'
                  : 'md-surface border-2 border-slate-200 hover:md-elevation-1'
              }`}
            >
              <div className="text-left">
                <p className="font-medium text-slate-900">{machine.name}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                    {target?.name}
                  </span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                    {type?.name.split('（')[0]}
                  </span>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                    {maker?.name}
                  </span>
                </div>
              </div>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                selectedMachines.has(machine.id)
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-slate-300'
              }`}>
                {selectedMachines.has(machine.id) && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {filteredMachines.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <Settings className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p>条件に一致するマシンが見つかりません</p>
          <p className="text-sm mt-1">フィルターを調整してください</p>
        </div>
      )}
    </div>
  )
}