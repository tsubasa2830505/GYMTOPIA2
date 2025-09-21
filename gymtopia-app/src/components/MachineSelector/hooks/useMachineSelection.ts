import type { Machine } from '@/lib/supabase/machines'

interface UseMachineSelectionParams {
  selectedMachines: Map<string, number>
  onSelectionChange: (selected: Map<string, number>) => void
  filteredMachines: Machine[]
}

interface UseMachineSelectionReturn {
  toggleMachine: (machineId: string) => void
  updateMachineCount: (machineId: string, count: number) => void
  selectAllFiltered: () => void
  deselectAllFiltered: () => void
}

export function useMachineSelection({
  selectedMachines,
  onSelectionChange,
  filteredMachines
}: UseMachineSelectionParams): UseMachineSelectionReturn {
  const toggleMachine = (machineId: string) => {
    const newSelected = new Map(selectedMachines)
    if (newSelected.has(machineId)) {
      newSelected.delete(machineId)
    } else {
      newSelected.set(machineId, 1)
    }
    onSelectionChange(newSelected)
  }

  const updateMachineCount = (machineId: string, count: number) => {
    const newSelected = new Map(selectedMachines)
    if (count <= 0) {
      newSelected.delete(machineId)
    } else {
      newSelected.set(machineId, count)
    }
    onSelectionChange(newSelected)
  }

  const selectAllFiltered = () => {
    const newSelected = new Map(selectedMachines)
    filteredMachines.forEach(machine => {
      if (!newSelected.has(machine.id)) {
        newSelected.set(machine.id, 1)
      }
    })
    onSelectionChange(newSelected)
  }

  const deselectAllFiltered = () => {
    const newSelected = new Map(selectedMachines)
    filteredMachines.forEach(machine => {
      newSelected.delete(machine.id)
    })
    onSelectionChange(newSelected)
  }

  return {
    toggleMachine,
    updateMachineCount,
    selectAllFiltered,
    deselectAllFiltered
  }
}