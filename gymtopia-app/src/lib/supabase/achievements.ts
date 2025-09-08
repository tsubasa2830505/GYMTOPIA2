import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Achievement {
  id: string
  user_id: string
  achievement_type: 'streak' | 'milestone' | 'personal_record' | 'challenge'
  achievement_name: string
  description?: string
  badge_icon?: string
  earned_at: string
  metadata?: any
  created_at: string
}

export interface PersonalRecord {
  id: string
  user_id: string
  exercise_name: string
  record_type: 'weight' | 'reps' | 'duration' | 'distance'
  record_value: number
  record_unit: string
  previous_value?: number
  achieved_at: string
  gym_id?: string
  workout_session_id?: string
  notes?: string
  created_at: string
  updated_at: string
  gym?: {
    name: string
  }
}

// ユーザーのアチーブメントを取得
export async function getUserAchievements(userId: string) {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })

    if (error) {
      console.error('Error fetching achievements:', error)
      return getMockAchievements()
    }

    return data as Achievement[]
  } catch (error) {
    console.error('Error in getUserAchievements:', error)
    return getMockAchievements()
  }
}

// パーソナルレコードを取得
export async function getUserPersonalRecords(userId: string) {
  try {
    const { data, error } = await supabase
      .from('personal_records')
      .select(`
        *,
        gym:gyms(name)
      `)
      .eq('user_id', userId)
      .order('achieved_at', { ascending: false })

    if (error) {
      console.error('Error fetching personal records:', error)
      return getMockPersonalRecords()
    }

    return data as PersonalRecord[]
  } catch (error) {
    console.error('Error in getUserPersonalRecords:', error)
    return getMockPersonalRecords()
  }
}

// 新しいアチーブメントを追加
export async function createAchievement(achievement: {
  user_id: string
  achievement_type: Achievement['achievement_type']
  achievement_name: string
  description?: string
  badge_icon?: string
  metadata?: any
}) {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .insert(achievement)
      .select()
      .single()

    if (error) throw error
    return data as Achievement
  } catch (error) {
    console.error('Error creating achievement:', error)
    throw error
  }
}

// パーソナルレコードを追加/更新
export async function upsertPersonalRecord(record: {
  user_id: string
  exercise_name: string
  record_type: PersonalRecord['record_type']
  record_value: number
  record_unit: string
  gym_id?: string
  workout_session_id?: string
  notes?: string
}) {
  try {
    // 既存のレコードを取得
    const { data: existingRecord } = await supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', record.user_id)
      .eq('exercise_name', record.exercise_name)
      .eq('record_type', record.record_type)
      .single()

    let data
    if (existingRecord && existingRecord.record_value < record.record_value) {
      // 既存レコードを更新
      const { data: updatedData, error } = await supabase
        .from('personal_records')
        .update({
          previous_value: existingRecord.record_value,
          record_value: record.record_value,
          achieved_at: new Date().toISOString(),
          gym_id: record.gym_id,
          workout_session_id: record.workout_session_id,
          notes: record.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRecord.id)
        .select()
        .single()

      if (error) throw error
      data = updatedData

      // 新記録達成のアチーブメントを作成
      await createAchievement({
        user_id: record.user_id,
        achievement_type: 'personal_record',
        achievement_name: `${record.exercise_name} 新記録！`,
        description: `${record.record_value}${record.record_unit}を達成`,
        badge_icon: '🏆',
        metadata: {
          exercise: record.exercise_name,
          value: record.record_value,
          unit: record.record_unit,
          previous_value: existingRecord.record_value
        }
      })
    } else if (!existingRecord) {
      // 新規レコードを作成
      const { data: newData, error } = await supabase
        .from('personal_records')
        .insert(record)
        .select()
        .single()

      if (error) throw error
      data = newData
    }

    return data as PersonalRecord
  } catch (error) {
    console.error('Error upserting personal record:', error)
    throw error
  }
}

// ストリーク計算
export async function calculateStreak(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('started_at')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(30)

    if (error || !data || data.length === 0) return 0

    // 連続日数を計算
    let streak = 0
    let lastDate = new Date()
    
    for (const session of data) {
      const sessionDate = new Date(session.started_at)
      const dayDiff = Math.floor((lastDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (dayDiff <= 1) {
        streak++
        lastDate = sessionDate
      } else {
        break
      }
    }

    return streak
  } catch (error) {
    console.error('Error calculating streak:', error)
    return 0
  }
}

// モックデータ
function getMockAchievements(): Achievement[] {
  return [
    {
      id: 'ach-1',
      user_id: 'mock-user',
      achievement_type: 'streak',
      achievement_name: '7日間連続トレーニング',
      description: '1週間毎日ジムに通いました！',
      badge_icon: '🔥',
      earned_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'ach-2',
      user_id: 'mock-user',
      achievement_type: 'milestone',
      achievement_name: '100回目のワークアウト',
      description: '通算100回のトレーニングを達成！',
      badge_icon: '🎯',
      earned_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'ach-3',
      user_id: 'mock-user',
      achievement_type: 'personal_record',
      achievement_name: 'ベンチプレス100kg達成',
      description: '初めて100kgを持ち上げました！',
      badge_icon: '🏆',
      earned_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
}

function getMockPersonalRecords(): PersonalRecord[] {
  return [
    {
      id: 'pr-1',
      user_id: 'mock-user',
      exercise_name: 'ベンチプレス',
      record_type: 'weight',
      record_value: 100,
      record_unit: 'kg',
      previous_value: 95,
      achieved_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      gym: {
        name: 'ハンマーストレングス渋谷'
      }
    },
    {
      id: 'pr-2',
      user_id: 'mock-user',
      exercise_name: 'スクワット',
      record_type: 'weight',
      record_value: 120,
      record_unit: 'kg',
      previous_value: 110,
      achieved_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      gym: {
        name: 'ROGUEクロストレーニング新宿'
      }
    },
    {
      id: 'pr-3',
      user_id: 'mock-user',
      exercise_name: 'デッドリフト',
      record_type: 'weight',
      record_value: 140,
      record_unit: 'kg',
      achieved_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
}