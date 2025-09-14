import { createClient } from '@supabase/supabase-js'

// Supabaseクライアントの作成
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
      // データベースエラーの場合はサンプルデータを返す
      return getDefaultMachines()
    }

    // データが空の場合もサンプルデータを返す
    if (!data || data.length === 0) {
      console.log('No machines found, using default data')
      return getDefaultMachines()
    }

    return data
  } catch (error) {
    console.error('Failed to fetch machines:', error)
    return getDefaultMachines()
  }
}

// デフォルトのマシンデータ
function getDefaultMachines(): Machine[] {
  return [
    // 胸
    { id: 'chest-1', name: 'チェストプレス', target: '胸', target_category: '胸', target_detail: '中部', type: 'machine', maker: 'hammer' },
    { id: 'chest-2', name: 'インクラインプレス', target: '胸', target_category: '胸', target_detail: '上部', type: 'machine', maker: 'life-fitness' },
    { id: 'chest-3', name: 'ペックフライ', target: '胸', target_category: '胸', target_detail: '中部', type: 'machine', maker: 'technogym' },
    { id: 'chest-4', name: 'ディップス', target: '胸', target_category: '胸', target_detail: '下部', type: 'free-weight', maker: 'hammer' },

    // 背中
    { id: 'back-1', name: 'ラットプルダウン', target: '背中', target_category: '背中', target_detail: '上部', type: 'machine', maker: 'cybex' },
    { id: 'back-2', name: 'シーテッドロー', target: '背中', target_category: '背中', target_detail: '中部', type: 'machine', maker: 'hammer' },
    { id: 'back-3', name: 'ロープーリー', target: '背中', target_category: '背中', target_detail: '下部', type: 'machine', maker: 'life-fitness' },
    { id: 'back-4', name: 'プルアップ', target: '背中', target_category: '背中', target_detail: '上部', type: 'free-weight', maker: 'matrix' },

    // 肩
    { id: 'shoulder-1', name: 'ショルダープレス', target: '肩', target_category: '肩', target_detail: '前部', type: 'machine', maker: 'technogym' },
    { id: 'shoulder-2', name: 'サイドレイズマシン', target: '肩', target_category: '肩', target_detail: '中部', type: 'machine', maker: 'cybex' },
    { id: 'shoulder-3', name: 'リアデルトフライ', target: '肩', target_category: '肩', target_detail: '後部', type: 'machine', maker: 'hammer' },

    // 脚
    { id: 'legs-1', name: 'レッグプレス', target: '脚', target_category: '脚', target_detail: '大腿四頭筋', type: 'machine', maker: 'hammer' },
    { id: 'legs-2', name: 'レッグカール', target: '脚', target_category: '脚', target_detail: 'ハムストリング', type: 'machine', maker: 'cybex' },
    { id: 'legs-3', name: 'カーフレイズ', target: '脚', target_category: '脚', target_detail: 'カーフ', type: 'machine', maker: 'life-fitness' },
    { id: 'legs-4', name: 'アブダクター', target: '脚', target_category: '脚', target_detail: '外転筋', type: 'machine', maker: 'technogym' },
    { id: 'legs-5', name: 'アダクター', target: '脚', target_category: '脚', target_detail: '内転筋', type: 'machine', maker: 'matrix' },

    // 腕
    { id: 'arms-1', name: 'バイセップカール', target: '腕', target_category: '腕', target_detail: '二頭筋', type: 'machine', maker: 'life-fitness' },
    { id: 'arms-2', name: 'トライセップエクステンション', target: '腕', target_category: '腕', target_detail: '三頭筋', type: 'machine', maker: 'cybex' },
    { id: 'arms-3', name: 'プリーチャーカール', target: '腕', target_category: '腕', target_detail: '二頭筋', type: 'machine', maker: 'hammer' },

    // 体幹
    { id: 'core-1', name: 'アブドミナルクランチ', target: '体幹', target_category: '体幹', target_detail: '腹直筋', type: 'machine', maker: 'technogym' },
    { id: 'core-2', name: 'ロータリートルソー', target: '体幹', target_category: '体幹', target_detail: '腹斜筋', type: 'machine', maker: 'hammer' },
    { id: 'core-3', name: 'バックエクステンション', target: '体幹', target_category: '体幹', target_detail: '下背部', type: 'machine', maker: 'life-fitness' },
  ]
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