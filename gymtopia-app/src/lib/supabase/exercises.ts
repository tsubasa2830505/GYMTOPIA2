import { getSupabaseClient } from './client'

export interface ExerciseMaster {
  id: string
  name: string
  base_mets: number
  equipment_type: string
  category: string
  description?: string
  created_at: string
  updated_at: string
}

// すべての種目を取得
export async function getExercises(): Promise<ExerciseMaster[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('exercise_master')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching exercises:', error)
    return []
  }

  return data || []
}

// カテゴリ別に種目を取得
export async function getExercisesByCategory(category: string): Promise<ExerciseMaster[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('exercise_master')
    .select('*')
    .eq('category', category)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching exercises by category:', error)
    return []
  }

  return data || []
}

// 種目名で検索
export async function searchExercises(query: string): Promise<ExerciseMaster[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('exercise_master')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error searching exercises:', error)
    return []
  }

  return data || []
}

// 単一の種目を取得
export async function getExerciseById(id: string): Promise<ExerciseMaster | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('exercise_master')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching exercise by id:', error)
    return null
  }

  return data
}

// 種目を追加（管理者用）
export async function addExercise(exercise: Omit<ExerciseMaster, 'id' | 'created_at' | 'updated_at'>): Promise<ExerciseMaster | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('exercise_master')
    .insert([exercise])
    .select()
    .single()

  if (error) {
    console.error('Error adding exercise:', error)
    return null
  }

  return data
}

// バッチで種目を追加（初期データ投入用）
export async function addExercisesBatch(exercises: Array<Omit<ExerciseMaster, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
  const supabase = getSupabaseClient()

  const { error } = await supabase
    .from('exercise_master')
    .insert(exercises)

  if (error) {
    console.error('Error adding exercises batch:', error)
    return false
  }

  return true
}