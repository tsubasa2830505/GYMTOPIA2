import { useState } from 'react'
import type { Machine } from '@/lib/supabase/machines'

interface MachineFilter {
  targetCategory: string | null
  targetParts: string[]
  maker: string[]
}

interface UseMachineFilterParams {
  machines: Machine[]
}

interface UseMachineFilterReturn {
  filter: MachineFilter
  showPartsDetail: boolean
  expandedSections: Set<string>
  filteredMachines: Machine[]
  selectCategory: (categoryId: string) => void
  togglePart: (part: string) => void
  toggleFilter: (category: 'maker', value: string) => void
  toggleSection: (section: string) => void
  getRelatedMakers: () => string[]
}

const categoryMapping: { [key: string]: string } = {
  '胸': 'chest',
  '背中': 'back',
  '肩': 'shoulder',
  '脚': 'legs',
  '腕': 'arms',
  '体幹': 'core',
  'chest': '胸',
  'back': '背中',
  'shoulder': '肩',
  'legs': '脚',
  'arms': '腕',
  'core': '体幹',
  'cardio': '有酸素',
  'multiple': '複合'
}

export function useMachineFilter({ machines }: UseMachineFilterParams): UseMachineFilterReturn {
  const [filter, setFilter] = useState<MachineFilter>({
    targetCategory: null,
    targetParts: [],
    maker: []
  })
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['target', 'maker']))
  const [showPartsDetail, setShowPartsDetail] = useState(false)

  const getRelatedMakers = () => {
    if (!filter.targetCategory) return []

    const relatedMakers = new Set<string>()

    machines.forEach(machine => {
      const englishCategory = categoryMapping[filter.targetCategory] || filter.targetCategory
      const targetMatch = !filter.targetCategory ||
        machine.target_category === englishCategory

      if (targetMatch) {
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

  const selectCategory = (categoryId: string) => {
    setFilter({
      ...filter,
      targetCategory: filter.targetCategory === categoryId ? null : categoryId,
      targetParts: []
    })
    setShowPartsDetail(filter.targetCategory !== categoryId && categoryId !== null)

    if (filter.targetCategory !== categoryId && categoryId !== null) {
      setExpandedSections(new Set(['target', 'type']))
    }
  }

  const togglePart = (part: string) => {
    const newParts = [...filter.targetParts]
    const index = newParts.indexOf(part)

    if (index > -1) {
      newParts.splice(index, 1)
    } else {
      newParts.push(part)
    }

    setFilter({ ...filter, targetParts: newParts })
  }

  const toggleFilter = (category: 'maker', value: string) => {
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
    const englishCategory = categoryMapping[filter.targetCategory] || filter.targetCategory
    const targetMatch = !filter.targetCategory ||
      machine.target_category === englishCategory

    const partMatch = filter.targetParts.length === 0 ||
      (machine.target_detail && filter.targetParts.includes(machine.target_detail))

    const makerMatch = filter.maker.length === 0 || filter.maker.includes(machine.maker)

    return targetMatch && partMatch && makerMatch
  })

  return {
    filter,
    showPartsDetail,
    expandedSections,
    filteredMachines,
    selectCategory,
    togglePart,
    toggleFilter,
    toggleSection,
    getRelatedMakers
  }
}