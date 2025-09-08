import { supabase } from './client'
import type { MusclePart } from '@/lib/types/muscle-parts'

// Supabaseクライアントの作成


// すべての筋肉部位データを取得
// Supabaseから取得を試み、失敗したらデフォルトデータを使用
export async function getMuscleParts(): Promise<MusclePart[]> {
  try {
    // まずmuscle_groupsテーブルを試す
    let { data, error } = await supabase
      .from('muscle_groups')
      .select('*')
      .order('id')

    // muscle_groupsが存在しない場合、musclesテーブルを試す
    if (error && error.code === '42P01') {
      console.log('muscle_groups table not found, trying muscles table...')
      const musclesResult = await supabase
        .from('muscles')
        .select('*')
        .order('id')
      
      data = musclesResult.data
      error = musclesResult.error
    }

    if (error) {
      console.warn('Supabase table not accessible, using default data:', error.message)
      return getDefaultMuscleParts()
    }

    if (data && data.length > 0) {
      console.log('Fetched data from Supabase:', data.length, 'records')
      return formatMuscleParts(data)
    }

    return getDefaultMuscleParts()
  } catch (error) {
    console.warn('Using default muscle parts data')
    return getDefaultMuscleParts()
  }
}

// Supabaseのデータ形式を統一フォーマットに変換
function formatMuscleParts(data: Record<string, unknown>[]): MusclePart[] {
  console.log('Raw muscle_groups data from Supabase:', data)
  
  // 新しいデータ構造（各部位1行）をカテゴリごとにグループ化
  const groupedByCategory = new Map<string, { name: string, parts: string[] }>()
  
  data.forEach((item) => {
    // categoryから番号を除去（例: "肩_1" -> "肩"）
    const rawCategory = String(item.category || '')
    const category = rawCategory.replace(/_\d+$/, '')
    const partName = String(item.name || '')
    
    if (!groupedByCategory.has(category)) {
      groupedByCategory.set(category, {
        name: category,
        parts: []
      })
    }
    
    const group = groupedByCategory.get(category)!
    if (!group.parts.includes(partName)) {
      group.parts.push(partName)
    }
  })
  
  // カテゴリIDマッピング
  const categoryIdMap: Record<string, string> = {
    '胸': 'chest',
    '背中': 'back',
    '肩': 'shoulder',
    '脚': 'legs',
    '腕': 'arms',
    '腹': 'core'
  }
  
  // グループ化されたデータをMusclePart形式に変換
  const formattedParts: MusclePart[] = Array.from(groupedByCategory.entries()).map(([category, data], index) => {
    return {
      id: index + 1,
      category: categoryIdMap[category] || category.toLowerCase(),
      name: category,
      parts: data.parts
    }
  })
  
  console.log('Formatted muscle parts:', formattedParts)
  
  return formattedParts.length > 0 ? formattedParts : getDefaultMuscleParts()
}

// カテゴリごとの筋肉部位を取得
export async function getMusclePartsByCategory(category: string): Promise<MusclePart | null> {
  try {
    // デフォルトデータから取得
    const defaultParts = getDefaultMuscleParts()
    const part = defaultParts.find(p => p.category === category)
    return part || null
  } catch (error) {
    console.warn('Error getting muscle parts by category:', error)
    return null
  }
}

// デフォルトのデータ（データベースから取得できない場合のフォールバック）
function getDefaultMuscleParts(): MusclePart[] {
  return [
    { 
      id: 1, 
      category: 'chest', 
      name: '胸', 
      parts: ['上部', '中部', '下部'] 
    },
    { 
      id: 2, 
      category: 'back', 
      name: '背中', 
      parts: ['上部', '中部', '下部', '僧帽筋'] 
    },
    { 
      id: 3, 
      category: 'shoulder', 
      name: '肩', 
      parts: ['前部', '中部', '後部'] 
    },
    { 
      id: 4, 
      category: 'legs', 
      name: '脚', 
      parts: ['大腿四頭筋', 'ハムストリング', '臀筋', 'カーフ', '内転筋', '外転筋'] 
    },
    { 
      id: 5, 
      category: 'arms', 
      name: '腕', 
      parts: ['二頭筋', '三頭筋'] 
    },
    { 
      id: 6, 
      category: 'core', 
      name: '体幹', 
      parts: ['腹直筋', '腹斜筋', '下背部'] 
    }
  ]
}