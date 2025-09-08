import { supabase } from './client'


export interface WorkoutSession {
  id: string
  user_id: string
  gym_id: string | null
  started_at: string
  ended_at: string | null
  notes: string | null
  mood: 'great' | 'good' | 'normal' | 'tired' | 'bad' | null
  created_at: string
}

export interface WorkoutExercise {
  id: string
  session_id: string
  exercise_name: string
  muscle_group: string | null
  equipment_type: string | null
  sets: any // JSON data
  notes: string | null
  order_index: number | null
  created_at: string
}

// Get user's workout sessions
export async function getUserWorkoutSessions(
  userId: string,
  limit = 10,
  offset = 0
) {
  try {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        gym:gyms(id, name),
        exercises:workout_exercises(*)
      `)
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching workout sessions:', error)
    return { data: null, error }
  }
}

// Get single workout session with exercises
export async function getWorkoutSession(sessionId: string) {
  try {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        gym:gyms(id, name),
        exercises:workout_exercises(*)
      `)
      .eq('id', sessionId)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching workout session:', error)
    return { data: null, error }
  }
}

// Create new workout session
export async function createWorkoutSession(
  userId: string,
  gymId: string | null = null,
  notes: string | null = null
) {
  try {
    const { data, error } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: userId,
        gym_id: gymId,
        started_at: new Date().toISOString(),
        notes
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating workout session:', error)
    return { data: null, error }
  }
}

// End workout session
export async function endWorkoutSession(
  sessionId: string,
  mood: WorkoutSession['mood'] = null,
  notes: string | null = null
) {
  try {
    const { data, error } = await supabase
      .from('workout_sessions')
      .update({
        ended_at: new Date().toISOString(),
        mood,
        notes
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error ending workout session:', error)
    return { data: null, error }
  }
}

// Add exercise to workout session
export async function addWorkoutExercise(
  sessionId: string,
  exercise: {
    exercise_name: string
    muscle_group?: string
    equipment_type?: string
    sets: Array<{ set: number; weight?: number; reps?: number; duration?: number }>
    notes?: string
    order_index?: number
  }
) {
  try {
    const { data, error } = await supabase
      .from('workout_exercises')
      .insert({
        session_id: sessionId,
        exercise_name: exercise.exercise_name,
        muscle_group: exercise.muscle_group || null,
        equipment_type: exercise.equipment_type || null,
        sets: exercise.sets,
        notes: exercise.notes || null,
        order_index: exercise.order_index || null
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error adding workout exercise:', error)
    return { data: null, error }
  }
}

// Update exercise in workout session
export async function updateWorkoutExercise(
  exerciseId: string,
  updates: Partial<{
    sets: Array<{ set: number; weight?: number; reps?: number; duration?: number }>
    notes: string
    order_index: number
  }>
) {
  try {
    const { data, error } = await supabase
      .from('workout_exercises')
      .update(updates)
      .eq('id', exerciseId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating workout exercise:', error)
    return { data: null, error }
  }
}

// Delete exercise from workout session
export async function deleteWorkoutExercise(exerciseId: string) {
  try {
    const { error } = await supabase
      .from('workout_exercises')
      .delete()
      .eq('id', exerciseId)

    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting workout exercise:', error)
    return { success: false, error }
  }
}

// Get workout statistics for a user
export async function getUserWorkoutStats(userId: string) {
  try {
    const now = new Date()
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get total workouts
    const { count: totalWorkouts } = await supabase
      .from('workout_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get workouts this week
    const { count: weeklyWorkouts } = await supabase
      .from('workout_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('started_at', lastWeek.toISOString())

    // Get workouts this month
    const { count: monthlyWorkouts } = await supabase
      .from('workout_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('started_at', lastMonth.toISOString())

    // Calculate average duration
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('started_at, ended_at')
      .eq('user_id', userId)
      .not('ended_at', 'is', null)

    let avgDuration = 0
    if (sessions && sessions.length > 0) {
      const totalDuration = sessions.reduce((acc, session) => {
        const start = new Date(session.started_at).getTime()
        const end = new Date(session.ended_at!).getTime()
        return acc + (end - start)
      }, 0)
      avgDuration = Math.round(totalDuration / sessions.length / 60000) // Convert to minutes
    }

    return {
      data: {
        totalWorkouts: totalWorkouts || 0,
        weeklyWorkouts: weeklyWorkouts || 0,
        monthlyWorkouts: monthlyWorkouts || 0,
        avgDurationMinutes: avgDuration
      },
      error: null
    }
  } catch (error) {
    console.error('Error fetching workout stats:', error)
    return { data: null, error }
  }
}

// Get popular exercises for a user
export async function getUserPopularExercises(userId: string, limit = 5) {
  try {
    // First get all exercises for the user's sessions
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('id')
      .eq('user_id', userId)

    if (!sessions || sessions.length === 0) {
      return { data: [], error: null }
    }

    const sessionIds = sessions.map(s => s.id)

    // Get exercises and count frequency
    const { data: exercises } = await supabase
      .from('workout_exercises')
      .select('exercise_name, muscle_group')
      .in('session_id', sessionIds)

    if (!exercises) {
      return { data: [], error: null }
    }

    // Count frequency
    const exerciseCount = exercises.reduce((acc, exercise) => {
      const key = exercise.exercise_name
      if (!acc[key]) {
        acc[key] = { 
          name: exercise.exercise_name, 
          muscle_group: exercise.muscle_group,
          count: 0 
        }
      }
      acc[key].count++
      return acc
    }, {} as Record<string, { name: string; muscle_group: string | null; count: number }>)

    // Sort by frequency and take top N
    const popularExercises = Object.values(exerciseCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)

    return { data: popularExercises, error: null }
  } catch (error) {
    console.error('Error fetching popular exercises:', error)
    return { data: null, error }
  }
}