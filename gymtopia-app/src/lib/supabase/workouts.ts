import { createClient } from '@supabase/supabase-js'
import type {
  WorkoutSession as EnhancedWorkoutSession,
  WorkoutExercise as EnhancedWorkoutExercise,
  ExerciseSet,
  ExerciseTemplate,
  PersonalRecord,
  BodyMeasurement,
  FitnessGoal,
  CreateWorkoutSessionInput,
  CreateExerciseInput,
  CreateSetInput,
  CreateBodyMeasurementInput,
  CreateFitnessGoalInput,
  WorkoutStats as EnhancedWorkoutStats
} from '@/lib/types/workout'

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

// ========================================
// ENHANCED WORKOUT TRACKING
// ========================================

// Enhanced workout session functions using new schema
export async function createEnhancedWorkoutSession(input: CreateWorkoutSessionInput) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: user.id,
        gym_id: input.gym_id,
        started_at: input.started_at || new Date().toISOString(),
        notes: input.notes,
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    console.error('Error creating enhanced workout session:', error)
    return { data: null, error: error.message }
  }
}

// Add exercise sets with detailed tracking
export async function addDetailedSetToExercise(workoutExerciseId: string, input: CreateSetInput) {
  try {
    // Get current set count
    const { data: existingSets } = await supabase
      .from('exercise_sets')
      .select('set_number')
      .eq('workout_exercise_id', workoutExerciseId)
      .order('set_number', { ascending: false })
      .limit(1)

    const setNumber = existingSets?.[0]?.set_number ? existingSets[0].set_number + 1 : 1

    const { data, error } = await supabase
      .from('exercise_sets')
      .insert({
        workout_exercise_id: workoutExerciseId,
        set_number: setNumber,
        reps: input.reps,
        weight: input.weight,
        rest_seconds: input.rest_seconds,
        is_failure: input.is_failure || false,
        is_warmup: input.is_warmup || false,
        notes: input.notes,
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    console.error('Error adding detailed set:', error)
    return { data: null, error: error.message }
  }
}

// Get exercise templates
export async function getExerciseTemplates(category?: string) {
  try {
    let query = supabase
      .from('exercise_templates')
      .select('*')
      .order('name')

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) throw error
    return { data: data as ExerciseTemplate[], error: null }
  } catch (error: any) {
    console.error('Error fetching exercise templates:', error)
    return { data: [], error: error.message }
  }
}

// Personal Records
export async function updatePersonalRecord(
  exerciseName: string,
  recordType: string,
  weight?: number,
  reps?: number,
  gymId?: string
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const recordData = {
      user_id: user.id,
      exercise_name: exerciseName,
      record_type: recordType,
      weight,
      reps,
      volume_kg: weight && reps ? weight * reps : undefined,
      achieved_at: new Date().toISOString().split('T')[0],
      gym_id: gymId,
    }

    const { data, error } = await supabase
      .from('personal_records')
      .upsert(recordData, {
        onConflict: 'user_id,exercise_name,record_type'
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    console.error('Error updating personal record:', error)
    return { data: null, error: error.message }
  }
}

export async function getPersonalRecords(exerciseName?: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    let query = supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', user.id)
      .order('achieved_at', { ascending: false })

    if (exerciseName) {
      query = query.eq('exercise_name', exerciseName)
    }

    const { data, error } = await query

    if (error) throw error
    return { data: data as PersonalRecord[], error: null }
  } catch (error: any) {
    console.error('Error fetching personal records:', error)
    return { data: [], error: error.message }
  }
}

// Body Measurements
export async function addBodyMeasurement(input: CreateBodyMeasurementInput) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('body_measurements')
      .insert({
        user_id: user.id,
        ...input,
        measured_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    console.error('Error adding body measurement:', error)
    return { data: null, error: error.message }
  }
}

export async function getBodyMeasurements(limit: number = 50) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('body_measurements')
      .select('*')
      .eq('user_id', user.id)
      .order('measured_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return { data: data as BodyMeasurement[], error: null }
  } catch (error: any) {
    console.error('Error fetching body measurements:', error)
    return { data: [], error: error.message }
  }
}

// Fitness Goals
export async function createFitnessGoal(input: CreateFitnessGoalInput) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('fitness_goals')
      .insert({
        user_id: user.id,
        ...input,
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    console.error('Error creating fitness goal:', error)
    return { data: null, error: error.message }
  }
}

export async function getFitnessGoals(includeAchieved: boolean = false) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    let query = supabase
      .from('fitness_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!includeAchieved) {
      query = query.eq('is_achieved', false)
    }

    const { data, error } = await query

    if (error) throw error
    return { data: data as FitnessGoal[], error: null }
  } catch (error: any) {
    console.error('Error fetching fitness goals:', error)
    return { data: [], error: error.message }
  }
}

export async function updateFitnessGoal(goalId: string, updates: Partial<FitnessGoal>) {
  try {
    const { data, error } = await supabase
      .from('fitness_goals')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    console.error('Error updating fitness goal:', error)
    return { data: null, error: error.message }
  }
}

// Enhanced workout statistics
export async function getEnhancedWorkoutStats(days: number = 30): Promise<{ data: EnhancedWorkoutStats | null, error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - days)

    // Get workout sessions with exercises
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select(`
        id,
        started_at,
        ended_at,
        total_weight_lifted,
        workout_exercises(
          exercise_name,
          exercise_sets(reps, weight)
        )
      `)
      .eq('user_id', user.id)
      .gte('started_at', dateFrom.toISOString())
      .order('started_at', { ascending: false })

    if (!sessions) {
      return { data: null, error: null }
    }

    // Calculate detailed stats
    let totalDuration = 0
    let totalWeightLifted = 0
    const exerciseCount: Record<string, number> = {}

    sessions.forEach(session => {
      if (session.started_at && session.ended_at) {
        const duration = new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()
        totalDuration += duration / (1000 * 60) // Convert to minutes
      }

      totalWeightLifted += session.total_weight_lifted || 0

      session.workout_exercises?.forEach(exercise => {
        exerciseCount[exercise.exercise_name] = (exerciseCount[exercise.exercise_name] || 0) + 1
      })
    })

    const favoriteExercises = Object.entries(exerciseCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    const stats: EnhancedWorkoutStats = {
      total_workouts: sessions.length,
      total_duration_minutes: Math.round(totalDuration),
      total_weight_lifted_kg: totalWeightLifted,
      avg_workout_duration: sessions.length > 0 ? Math.round(totalDuration / sessions.length) : 0,
      current_streak_days: await calculateWorkoutStreak(user.id),
      longest_streak_days: await calculateLongestStreak(user.id),
      favorite_exercises: favoriteExercises,
      muscle_group_distribution: [], // TODO: Implement based on exercise templates
      strength_progress: [], // TODO: Implement based on personal records
    }

    return { data: stats, error: null }
  } catch (error: any) {
    console.error('Error calculating enhanced workout stats:', error)
    return { data: null, error: error.message }
  }
}

async function calculateWorkoutStreak(userId: string): Promise<number> {
  try {
    const { data } = await supabase
      .from('workout_sessions')
      .select('started_at')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })

    if (!data || data.length === 0) return 0

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    // Group workouts by date
    const workoutDates = new Set(
      data.map(session => new Date(session.started_at).toDateString())
    )

    // Count consecutive workout days
    while (workoutDates.has(currentDate.toDateString())) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    }

    return streak
  } catch (error) {
    console.error('Error calculating workout streak:', error)
    return 0
  }
}

async function calculateLongestStreak(userId: string): Promise<number> {
  try {
    const { data } = await supabase
      .from('workout_sessions')
      .select('started_at')
      .eq('user_id', userId)
      .order('started_at', { ascending: true })

    if (!data || data.length === 0) return 0

    // Group workouts by date and calculate longest streak
    const workoutDates = Array.from(
      new Set(data.map(session => new Date(session.started_at).toDateString()))
    ).sort()

    let longestStreak = 0
    let currentStreak = 1

    for (let i = 1; i < workoutDates.length; i++) {
      const currentDate = new Date(workoutDates[i])
      const prevDate = new Date(workoutDates[i - 1])
      const diffTime = currentDate.getTime() - prevDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        currentStreak++
      } else {
        longestStreak = Math.max(longestStreak, currentStreak)
        currentStreak = 1
      }
    }

    return Math.max(longestStreak, currentStreak)
  } catch (error) {
    console.error('Error calculating longest streak:', error)
    return 0
  }
}