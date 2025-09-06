import { createClient } from '@supabase/supabase-js'
import type { MusclePart } from '@/lib/types/muscle-parts'

// Supabaseクライアントの作成
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  
  // muscle_groupsテーブルの構造に基づいてマッピング
  // テーブル構造: id, name, category, parts (配列またはJSON)
  const formattedParts: MusclePart[] = data.map((item, index) => {
    // カテゴリー名の取得
    const categoryName = String(item.name || item.group_name || item.category || 'その他')
    const categoryKey = String(item.category || item.key || categoryName.toLowerCase().replace(/\s+/g, '_'))
    
    // パーツの取得（配列、JSON文字列、カンマ区切り文字列に対応）
    let parts: string[] = []
    
    if (item.parts) {
      if (Array.isArray(item.parts)) {
        parts = item.parts.map(p => String(p))
      } else if (typeof item.parts === 'string') {
        // JSON文字列またはカンマ区切り文字列として解析
        try {
          const parsed = JSON.parse(item.parts as string)
          parts = Array.isArray(parsed) ? parsed.map(p => String(p)) : []
        } catch {
          // JSON解析に失敗した場合はカンマ区切りとして処理
          parts = (item.parts as string).split(',').map(p => p.trim()).filter(p => p)
        }
      } else if (typeof item.parts === 'object' && item.parts !== null) {
        // オブジェクトの場合、値を配列として取得
        parts = Object.values(item.parts as object).map(p => String(p))
      }
    }
    
    // muscle_detailsフィールドがある場合の処理
    if (!parts.length && item.muscle_details) {
      if (Array.isArray(item.muscle_details)) {
        parts = item.muscle_details.map(d => String(d))
      }
    }
    
    return {
      id: Number(item.id) || index + 1,
      category: categoryKey,
      name: categoryName,
      parts: parts
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