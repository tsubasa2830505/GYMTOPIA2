import { useState, useEffect } from 'react'
import { getMuscleParts } from '@/lib/supabase/muscle-parts'
import { getMachines, getMachineMakers } from '@/lib/supabase/machines'
import type { Machine, MachineMaker } from '@/lib/supabase/machines'

interface MachineDataState {
  targetOptions: Array<{id: string, name: string, parts: string[]}>
  machines: Machine[]
  makerOptions: MachineMaker[]
  isLoadingParts: boolean
  isLoadingMachines: boolean
}

interface UseMachineDataReturn extends MachineDataState {
  // No additional methods needed for now
}

const defaultTargetOptions = [
  { id: '胸', name: '胸', parts: ['上部', '中部', '下部'] },
  { id: '背中', name: '背中', parts: ['上部', '中部', '下部', '僧帽筋'] },
  { id: '肩', name: '肩', parts: ['前部', '中部', '後部'] },
  { id: '脚', name: '脚', parts: ['大腿四頭筋', 'ハムストリング', '臀筋', 'カーフ', '内転筋', '外転筋'] },
  { id: '腕', name: '腕', parts: ['二頭筋', '三頭筋'] },
  { id: '体幹', name: '体幹', parts: ['腹直筋', '腹斜筋', '下背部'] },
]

const defaultMakerOptions: MachineMaker[] = [
  { id: 'hammer', name: 'Hammer Strength' },
  { id: 'cybex', name: 'Cybex' },
  { id: 'life-fitness', name: 'Life Fitness' },
  { id: 'technogym', name: 'Technogym' },
  { id: 'matrix', name: 'Matrix' },
  { id: 'nautilus', name: 'Nautilus' },
]

export function useMachineData(): UseMachineDataReturn {
  const [state, setState] = useState<MachineDataState>({
    targetOptions: defaultTargetOptions,
    machines: [],
    makerOptions: defaultMakerOptions,
    isLoadingParts: true,
    isLoadingMachines: true
  })

  useEffect(() => {
    async function fetchMuscleParts() {
      try {
        const parts = await getMuscleParts()
        if (parts && parts.length > 0) {
          const formattedParts = parts.map(part => ({
            id: part.category,
            name: part.name,
            parts: part.parts
          }))
          setState(prev => ({ ...prev, targetOptions: formattedParts }))
        }
      } catch (error) {
        console.error('Failed to fetch muscle parts:', error)
      } finally {
        setState(prev => ({ ...prev, isLoadingParts: false }))
      }
    }

    fetchMuscleParts()
  }, [])

  useEffect(() => {
    async function fetchMachinesAndMakers() {
      try {
        const [machinesData, makersData] = await Promise.all([
          getMachines(),
          getMachineMakers()
        ])

        setState(prev => ({
          ...prev,
          machines: machinesData && machinesData.length > 0 ? machinesData : [],
          makerOptions: makersData && makersData.length > 0 ? makersData : defaultMakerOptions
        }))
      } catch (error) {
        console.error('Failed to fetch machines and makers:', error)
      } finally {
        setState(prev => ({ ...prev, isLoadingMachines: false }))
      }
    }

    fetchMachinesAndMakers()
  }, [])

  return state
}