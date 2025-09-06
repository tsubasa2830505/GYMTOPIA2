import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ワークアウトの型定義
export interface WorkoutSession {
  id: string
  user_id: string
  gym_id?: string
  name: string
  target_muscles?: string[]
  started_at: string
  ended_at?: string
  duration_minutes?: number
  notes?: string
  mood?: 'excellent' | 'good' | 'normal' | 'tired' | 'bad'
  created_at: string
  gym?: {
    name: string
  }
  exercises?: WorkoutExercise[]
}

export interface WorkoutExercise {
  id: string
  session_id: string
  machine_id?: string
  exercise_name: string
  exercise_order: number
  sets: WorkoutSet[]
  notes?: string
  machine?: {
    name: string
    target_category: string
  }
}

export interface WorkoutSet {
  reps: number
  weight: number
  rest_seconds?: number
}

// ワークアウトセッションを開始
export async function startWorkoutSession(data: {
  gym_id?: string
  name: string
  target_muscles?: string[]
  notes?: string
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: session, error } = await supabase
      .from('workout_sessions')
      .insert({
        ...data,
        user_id: user.id,
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return session as WorkoutSession
  } catch (error) {
    console.error('Error starting workout session:', error)
    throw error
  }
}

// ワークアウトセッションを終了
export async function endWorkoutSession(sessionId: string, mood?: string) {
  try {
    const endedAt = new Date()
    
    // セッション開始時刻を取得
    const { data: session } = await supabase
      .from('workout_sessions')
      .select('started_at')
      .eq('id', sessionId)
      .single()
    
    if (!session) throw new Error('Session not found')
    
    const startedAt = new Date(session.started_at)
    const durationMinutes = Math.floor((endedAt.getTime() - startedAt.getTime()) / 60000)
    
    const { data, error } = await supabase
      .from('workout_sessions')
      .update({
        ended_at: endedAt.toISOString(),
        duration_minutes: durationMinutes,
        mood
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) throw error
    return data as WorkoutSession
  } catch (error) {
    console.error('Error ending workout session:', error)
    throw error
  }
}

// エクササイズを追加
export async function addExercise(exercise: {
  session_id: string
  machine_id?: string
  exercise_name: string
  exercise_order: number
  sets: WorkoutSet[]
  notes?: string
}) {
  try {
    const { data, error } = await supabase
      .from('workout_exercises')
      .insert(exercise)
      .select(`
        *,
        machine:machines(name, target_category)
      `)
      .single()

    if (error) throw error
    return data as WorkoutExercise
  } catch (error) {
    console.error('Error adding exercise:', error)
    throw error
  }
}

// エクササイズを更新
export async function updateExercise(exerciseId: string, updates: {
  sets?: WorkoutSet[]
  notes?: string
}) {
  try {
    const { data, error } = await supabase
      .from('workout_exercises')
      .update(updates)
      .eq('id', exerciseId)
      .select()
      .single()

    if (error) throw error
    return data as WorkoutExercise
  } catch (error) {
    console.error('Error updating exercise:', error)
    throw error
  }
}

// エクササイズを削除
export async function deleteExercise(exerciseId: string) {
  try {
    const { error } = await supabase
      .from('workout_exercises')
      .delete()
      .eq('id', exerciseId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting exercise:', error)
    throw error
  }
}

// ユーザーのワークアウト履歴を取得
export async function getUserWorkoutHistory(userId?: string, limit = 20, offset = 0) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const targetUserId = userId || user?.id
    
    if (!targetUserId) throw new Error('User ID required')

    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        gym:gyms(name),
        exercises:workout_exercises(
          *,
          machine:machines(name, target_category)
        )
      `)
      .eq('user_id', targetUserId)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data as WorkoutSession[]
  } catch (error) {
    console.error('Error fetching workout history:', error)
    return []
  }
}

// 現在進行中のワークアウトを取得
export async function getCurrentWorkout() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        gym:gyms(name),
        exercises:workout_exercises(
          *,
          machine:machines(name, target_category)
        )
      `)
      .eq('user_id', user.id)
      .is('ended_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .single()

    if (error) return null
    return data as WorkoutSession
  } catch (error) {
    console.error('Error fetching current workout:', error)
    return null
  }
}

// ワークアウト統計を取得
export async function getWorkoutStats(userId?: string, period = 30) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const targetUserId = userId || user?.id
    
    if (!targetUserId) throw new Error('User ID required')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - period)

    const { data: sessions, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', targetUserId)
      .gte('started_at', startDate.toISOString())

    if (error) throw error

    // 統計を計算
    const stats = {
      totalSessions: sessions.length,
      totalMinutes: sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0),
      averageMinutesPerSession: 0,
      sessionsPerWeek: 0,
      favoriteTargetMuscles: [] as string[]
    }

    if (stats.totalSessions > 0) {
      stats.averageMinutesPerSession = Math.round(stats.totalMinutes / stats.totalSessions)
      stats.sessionsPerWeek = Math.round((stats.totalSessions / period) * 7)
      
      // ターゲット筋肉の頻度を計算
      const muscleCount: Record<string, number> = {}
      sessions.forEach(session => {
        session.target_muscles?.forEach((muscle: string) => {
          muscleCount[muscle] = (muscleCount[muscle] || 0) + 1
        })
      })
      
      stats.favoriteTargetMuscles = Object.entries(muscleCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([muscle]) => muscle)
    }

    return stats
  } catch (error) {
    console.error('Error fetching workout stats:', error)
    return null
  }
}