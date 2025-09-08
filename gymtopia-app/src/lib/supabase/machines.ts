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

// すべてのメーカーデータを取得
export async function getMachineMakers(): Promise<MachineMaker[]> {
  try {
    const { data, error } = await supabase
      .from('machine_makers')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching machine makers:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch machine makers:', error)
    return []
  }
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