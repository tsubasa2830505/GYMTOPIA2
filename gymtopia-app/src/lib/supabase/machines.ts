import { supabase } from './client'

// Supabaseクライアントの作成


export interface Machine {
  id: string
  name: string
  target: string
  target_category: string
  target_detail: string | null
  type: string
  maker: string
}

export interface MachineMaker {
  id: string
  name: string
}

// すべてのマシンデータを取得
export async function getMachines(): Promise<Machine[]> {
  try {
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .order('target_category, name')

    if (error) {
      console.error('Error fetching machines:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch machines:', error)
    return []
  }
}

// すべてのメーカーデータを取得（machinesテーブルから直接取得）
export async function getMachineMakers(): Promise<MachineMaker[]> {
  try {
    const { data, error } = await supabase
      .from('machines')
      .select('maker')

    if (error) {
      console.error('Error fetching machine makers:', error)
      return getDefaultMakers()
    }

    if (!data || data.length === 0) {
      return getDefaultMakers()
    }

    // ユニークなメーカーを抽出してMachineMaker形式に変換
    const uniqueMakers = Array.from(new Set(data.map(m => m.maker)))
      .filter(maker => maker != null)
      .map(maker => ({
        id: maker,
        name: getMakerDisplayName(maker)
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    return uniqueMakers.length > 0 ? uniqueMakers : getDefaultMakers()
  } catch (error) {
    console.error('Failed to fetch machine makers:', error)
    return getDefaultMakers()
  }
}

// メーカーIDから表示名を取得
function getMakerDisplayName(makerId: string): string {
  const makerNames: { [key: string]: string } = {
    'hammer': 'Hammer Strength',
    'cybex': 'Cybex',
    'life-fitness': 'Life Fitness',
    'technogym': 'Technogym',
    'matrix': 'Matrix',
    'nautilus': 'Nautilus',
  }
  return makerNames[makerId] || makerId
}

// デフォルトのメーカーデータ
function getDefaultMakers(): MachineMaker[] {
  return [
    { id: 'hammer', name: 'Hammer Strength' },
    { id: 'cybex', name: 'Cybex' },
    { id: 'life-fitness', name: 'Life Fitness' },
    { id: 'technogym', name: 'Technogym' },
    { id: 'matrix', name: 'Matrix' },
    { id: 'nautilus', name: 'Nautilus' },
  ]
}

// 特定のカテゴリーのマシンを取得
export async function getMachinesByCategory(category: string): Promise<Machine[]> {
  try {
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .eq('target_category', category)
      .order('name')

    if (error) {
      console.error('Error fetching machines by category:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch machines by category:', error)
    return []
  }
}

// 特定のタイプのマシンを取得
export async function getMachinesByType(type: string): Promise<Machine[]> {
  try {
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .eq('type', type)
      .order('name')

    if (error) {
      console.error('Error fetching machines by type:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch machines by type:', error)
    return []
  }
}