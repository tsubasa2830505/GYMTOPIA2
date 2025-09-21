import { supabase } from './client'

// BIG3の最大重量を取得
export async function getBig3MaxWeights(userId: string, period?: 'week' | 'month' | 'year') {
  try {
    const now = new Date()
    let startDate: Date

    switch(period) {
      case 'week':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - now.getDay())
        startDate.setHours(0, 0, 0, 0)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(0)
    }

    // Get workout sessions for the period
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('id')
      .eq('user_id', userId)
      .gte('started_at', startDate.toISOString())

    if (!sessions || sessions.length === 0) {
      return {
        benchPress: 0,
        squat: 0,
        deadlift: 0
      }
    }

    // Get exercises for these sessions
    const { data: exercises } = await supabase
      .from('workout_exercises')
      .select('exercise_name, sets')
      .in('session_id', sessions.map(s => s.id))
      .in('exercise_name', ['ベンチプレス', 'スクワット', 'デッドリフト'])

    let benchPress = 0
    let squat = 0
    let deadlift = 0

    if (exercises) {
      exercises.forEach(exercise => {
        if (exercise.sets && Array.isArray(exercise.sets)) {
          const maxWeight = Math.max(...exercise.sets.map((set: any) => set.weight || 0))

          switch(exercise.exercise_name) {
            case 'ベンチプレス':
              benchPress = Math.max(benchPress, maxWeight)
              break
            case 'スクワット':
              squat = Math.max(squat, maxWeight)
              break
            case 'デッドリフト':
              deadlift = Math.max(deadlift, maxWeight)
              break
          }
        }
      })
    }

    return {
      benchPress,
      squat,
      deadlift
    }
  } catch (error) {
    console.error('Error fetching BIG3 weights:', error)
    return {
      benchPress: 0,
      squat: 0,
      deadlift: 0
    }
  }
}

// 種目別の頻度ランキングを取得
export async function getExerciseFrequencyRanking(userId: string, period?: 'week' | 'month' | 'year', limit = 5) {
  try {
    const now = new Date()
    let startDate: Date

    switch(period) {
      case 'week':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - now.getDay())
        startDate.setHours(0, 0, 0, 0)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(0)
    }

    // Get workout sessions for the period
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('id')
      .eq('user_id', userId)
      .gte('started_at', startDate.toISOString())

    if (!sessions || sessions.length === 0) {
      return []
    }

    // Get exercises for these sessions
    const { data: exercises } = await supabase
      .from('workout_exercises')
      .select('exercise_name, sets')
      .in('session_id', sessions.map(s => s.id))

    if (!exercises) return []

    // Count frequency and calculate max weight for each exercise
    const exerciseStats: Record<string, { count: number, maxWeight: number }> = {}

    exercises.forEach(exercise => {
      if (!exerciseStats[exercise.exercise_name]) {
        exerciseStats[exercise.exercise_name] = { count: 0, maxWeight: 0 }
      }

      exerciseStats[exercise.exercise_name].count++

      if (exercise.sets && Array.isArray(exercise.sets)) {
        const maxWeight = Math.max(...exercise.sets.map((set: any) => set.weight || 0))
        exerciseStats[exercise.exercise_name].maxWeight = Math.max(
          exerciseStats[exercise.exercise_name].maxWeight,
          maxWeight
        )
      }
    })

    // Convert to array and sort by count
    const ranking = Object.entries(exerciseStats)
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        maxWeight: stats.maxWeight
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)

    return ranking
  } catch (error) {
    console.error('Error fetching exercise ranking:', error)
    return []
  }
}

// 部位別ボリューム内訳を取得
export async function getBodyPartBreakdown(userId: string, period?: 'week' | 'month' | 'year') {
  try {
    const now = new Date()
    let startDate: Date

    switch(period) {
      case 'week':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - now.getDay())
        startDate.setHours(0, 0, 0, 0)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(0)
    }

    // Get workout sessions for the period
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('id')
      .eq('user_id', userId)
      .gte('started_at', startDate.toISOString())

    if (!sessions || sessions.length === 0) {
      return []
    }

    // Get exercises with their categories
    const { data: exercises } = await supabase
      .from('workout_exercises')
      .select(`
        exercise_name,
        sets,
        exercises(category)
      `)
      .in('session_id', sessions.map(s => s.id))

    if (!exercises) return []

    // Calculate volume by body part
    const bodyPartVolumes: Record<string, number> = {}

    exercises.forEach(exercise => {
      const category = exercise.exercises?.category || '不明'

      if (exercise.sets && Array.isArray(exercise.sets)) {
        const totalVolume = exercise.sets.reduce((sum: number, set: any) => {
          return sum + (set.weight || 0) * (set.reps || 0)
        }, 0)

        bodyPartVolumes[category] = (bodyPartVolumes[category] || 0) + totalVolume
      }
    })

    // Convert to array and sort by volume
    const breakdown = Object.entries(bodyPartVolumes)
      .map(([name, volume]) => ({
        name,
        volume,
        percentage: 0 // Will be calculated below
      }))
      .sort((a, b) => b.volume - a.volume)

    // Calculate percentages
    const totalVolume = breakdown.reduce((sum, item) => sum + item.volume, 0)
    breakdown.forEach(item => {
      item.percentage = totalVolume > 0 ? Math.round((item.volume / totalVolume) * 100) : 0
    })

    return breakdown
  } catch (error) {
    console.error('Error fetching body part breakdown:', error)
    return []
  }
}

// 器具タイプ別内訳を取得
export async function getEquipmentBreakdown(userId: string, period?: 'week' | 'month' | 'year') {
  try {
    const now = new Date()
    let startDate: Date

    switch(period) {
      case 'week':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - now.getDay())
        startDate.setHours(0, 0, 0, 0)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(0)
    }

    // Get workout sessions for the period
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('id')
      .eq('user_id', userId)
      .gte('started_at', startDate.toISOString())

    if (!sessions || sessions.length === 0) {
      return []
    }

    // Get exercises with their equipment types
    const { data: exercises } = await supabase
      .from('workout_exercises')
      .select(`
        exercise_name,
        sets,
        exercises(equipment)
      `)
      .in('session_id', sessions.map(s => s.id))

    if (!exercises) return []

    // Calculate stats by equipment type
    const equipmentStats: Record<string, { setCount: number, volume: number }> = {}

    exercises.forEach(exercise => {
      const equipment = exercise.exercises?.equipment || '不明'

      if (exercise.sets && Array.isArray(exercise.sets)) {
        const setCount = exercise.sets.length
        const totalVolume = exercise.sets.reduce((sum: number, set: any) => {
          return sum + (set.weight || 0) * (set.reps || 0)
        }, 0)

        if (!equipmentStats[equipment]) {
          equipmentStats[equipment] = { setCount: 0, volume: 0 }
        }

        equipmentStats[equipment].setCount += setCount
        equipmentStats[equipment].volume += totalVolume
      }
    })

    // Convert to array and sort by volume
    const breakdown = Object.entries(equipmentStats)
      .map(([name, stats]) => ({
        name,
        setCount: stats.setCount,
        volume: stats.volume,
        setPercentage: 0, // Will be calculated below
        volumePercentage: 0
      }))
      .sort((a, b) => b.volume - a.volume)

    // Calculate percentages
    const totalSets = breakdown.reduce((sum, item) => sum + item.setCount, 0)
    const totalVolume = breakdown.reduce((sum, item) => sum + item.volume, 0)

    breakdown.forEach(item => {
      item.setPercentage = totalSets > 0 ? Math.round((item.setCount / totalSets) * 100) : 0
      item.volumePercentage = totalVolume > 0 ? Math.round((item.volume / totalVolume) * 100) : 0
    })

    return breakdown
  } catch (error) {
    console.error('Error fetching equipment breakdown:', error)
    return []
  }
}

// 推定消費カロリーを計算（B確度）
export async function getEstimatedCalories(userId: string, period?: 'week' | 'month' | 'year') {
  try {
    const now = new Date()
    let startDate: Date

    switch(period) {
      case 'week':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - now.getDay())
        startDate.setHours(0, 0, 0, 0)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(0)
    }

    // Get workout sessions for the period
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('id')
      .eq('user_id', userId)
      .gte('started_at', startDate.toISOString())

    if (!sessions || sessions.length === 0) {
      return {
        totalCalories: 0,
        metsCalories: 0,
        volumeCalories: 0,
        estimatedTimeMinutes: 0
      }
    }

    // Get exercises for these sessions
    const { data: exercises } = await supabase
      .from('workout_exercises')
      .select('exercise_name, sets')
      .in('session_id', sessions.map(s => s.id))

    if (!exercises) {
      return {
        totalCalories: 0,
        metsCalories: 0,
        volumeCalories: 0,
        estimatedTimeMinutes: 0
      }
    }

    let totalSets = 0
    let totalVolume = 0

    exercises.forEach(exercise => {
      if (exercise.sets && Array.isArray(exercise.sets)) {
        totalSets += exercise.sets.length

        const exerciseVolume = exercise.sets.reduce((sum: number, set: any) => {
          return sum + (set.weight || 0) * (set.reps || 0)
        }, 0)
        totalVolume += exerciseVolume
      }
    })

    // Calorie calculations based on user's formulas
    const estimatedTimeMinutes = totalSets * 3 // 推定時間(分) = セット数 × 3
    const baseMets = 6.0 // 筋トレの基本METs値
    const assumedBodyWeight = 70 // 仮定体重（kg）- 実際のユーザー体重が取得できない場合の推定値

    // METsカロリー = base_mets × 体重(kg) × (時間/60) × 1.05
    const metsCalories = Math.round(baseMets * assumedBodyWeight * (estimatedTimeMinutes / 60) * 1.05)

    // ボリュームカロリー = Σ(weight×reps) × 0.05
    const volumeCalories = Math.round(totalVolume * 0.05)

    // 合計推定カロリー
    const totalCalories = metsCalories + volumeCalories

    return {
      totalCalories,
      metsCalories,
      volumeCalories,
      estimatedTimeMinutes
    }
  } catch (error) {
    console.error('Error calculating estimated calories:', error)
    return {
      totalCalories: 0,
      metsCalories: 0,
      volumeCalories: 0,
      estimatedTimeMinutes: 0
    }
  }
}

// 週目標達成度を計算
export async function getWeeklyGoalProgress(userId: string) {
  try {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    // Get workout sessions for this week
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('id, started_at, duration_minutes')
      .eq('user_id', userId)
      .gte('started_at', startOfWeek.toISOString())

    if (!sessions || sessions.length === 0) {
      return {
        weeklyVisits: { current: 0, target: 3, percentage: 0 },
        weeklyTime: { current: 0, target: 300, percentage: 0 }, // 5時間目標
        weeklyVolume: { current: 0, target: 5000, percentage: 0 }, // 5t目標
        overallProgress: 0
      }
    }

    // Get exercises for these sessions
    const { data: exercises } = await supabase
      .from('workout_exercises')
      .select('exercise_name, sets')
      .in('session_id', sessions.map(s => s.id))

    let totalVolume = 0
    if (exercises) {
      exercises.forEach(exercise => {
        if (exercise.sets && Array.isArray(exercise.sets)) {
          const exerciseVolume = exercise.sets.reduce((sum: number, set: any) => {
            return sum + (set.weight || 0) * (set.reps || 0)
          }, 0)
          totalVolume += exerciseVolume
        }
      })
    }

    // Calculate total time for the week
    const totalTime = sessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0)

    // Define weekly targets
    const targets = {
      visits: 3,        // 週3回の訪問目標
      time: 300,        // 週5時間（300分）の時間目標
      volume: 5000      // 週5,000kgのボリューム目標
    }

    // Calculate progress percentages
    const weeklyVisits = {
      current: sessions.length,
      target: targets.visits,
      percentage: Math.min(100, Math.round((sessions.length / targets.visits) * 100))
    }

    const weeklyTime = {
      current: totalTime,
      target: targets.time,
      percentage: Math.min(100, Math.round((totalTime / targets.time) * 100))
    }

    const weeklyVolume = {
      current: totalVolume,
      target: targets.volume,
      percentage: Math.min(100, Math.round((totalVolume / targets.volume) * 100))
    }

    // Calculate overall progress (average of all goals)
    const overallProgress = Math.round((weeklyVisits.percentage + weeklyTime.percentage + weeklyVolume.percentage) / 3)

    return {
      weeklyVisits,
      weeklyTime,
      weeklyVolume,
      overallProgress
    }
  } catch (error) {
    console.error('Error calculating weekly goal progress:', error)
    return {
      weeklyVisits: { current: 0, target: 3, percentage: 0 },
      weeklyTime: { current: 0, target: 300, percentage: 0 },
      weeklyVolume: { current: 0, target: 5000, percentage: 0 },
      overallProgress: 0
    }
  }
}

// 前回比較データを取得（重量・ボリューム比較）
export async function getPeriodComparison(userId: string, period: 'week' | 'month' | 'year' = 'month') {
  try {
    const now = new Date()
    let currentStartDate: Date
    let previousStartDate: Date
    let previousEndDate: Date

    switch(period) {
      case 'week':
        // Current week
        currentStartDate = new Date(now)
        currentStartDate.setDate(now.getDate() - now.getDay())
        currentStartDate.setHours(0, 0, 0, 0)

        // Previous week
        previousEndDate = new Date(currentStartDate)
        previousEndDate.setTime(previousEndDate.getTime() - 1)
        previousStartDate = new Date(previousEndDate)
        previousStartDate.setDate(previousEndDate.getDate() - 6)
        previousStartDate.setHours(0, 0, 0, 0)
        break

      case 'month':
        // Current month
        currentStartDate = new Date(now.getFullYear(), now.getMonth(), 1)

        // Previous month
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
        break

      case 'year':
        // Current year
        currentStartDate = new Date(now.getFullYear(), 0, 1)

        // Previous year
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1)
        previousEndDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999)
        break

      default:
        // Default to current month
        currentStartDate = new Date(now.getFullYear(), now.getMonth(), 1)
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
    }

    // Get current period sessions
    const { data: currentSessions } = await supabase
      .from('workout_sessions')
      .select('id, duration_minutes')
      .eq('user_id', userId)
      .gte('started_at', currentStartDate.toISOString())

    // Get previous period sessions
    const { data: previousSessions } = await supabase
      .from('workout_sessions')
      .select('id, duration_minutes')
      .eq('user_id', userId)
      .gte('started_at', previousStartDate.toISOString())
      .lte('started_at', previousEndDate.toISOString())

    // Calculate current period data
    const currentData = await calculatePeriodData(currentSessions || [])
    const previousData = await calculatePeriodData(previousSessions || [])

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    const visitsChange = calculateChange(currentData.visits, previousData.visits)
    const volumeChange = calculateChange(currentData.volume, previousData.volume)
    const timeChange = calculateChange(currentData.time, previousData.time)

    return {
      current: currentData,
      previous: previousData,
      changes: {
        visits: visitsChange,
        volume: volumeChange,
        time: timeChange
      },
      period
    }
  } catch (error) {
    console.error('Error calculating period comparison:', error)
    return {
      current: { visits: 0, volume: 0, time: 0 },
      previous: { visits: 0, volume: 0, time: 0 },
      changes: { visits: 0, volume: 0, time: 0 },
      period: 'month' as const
    }
  }
}

// Helper function to calculate data for a period
async function calculatePeriodData(sessions: any[]) {
  if (!sessions || sessions.length === 0) {
    return { visits: 0, volume: 0, time: 0 }
  }

  const visits = sessions.length
  const time = sessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0)

  // Get exercises for these sessions
  const { data: exercises } = await supabase
    .from('workout_exercises')
    .select('exercise_name, sets')
    .in('session_id', sessions.map(s => s.id))

  let volume = 0
  if (exercises) {
    exercises.forEach(exercise => {
      if (exercise.sets && Array.isArray(exercise.sets)) {
        const exerciseVolume = exercise.sets.reduce((sum: number, set: any) => {
          return sum + (set.weight || 0) * (set.reps || 0)
        }, 0)
        volume += exerciseVolume
      }
    })
  }

  return { visits, volume, time }
}

// パーソナルレコードを取得
export async function getPersonalRecords(userId: string) {
  try {
    // Get all workout sessions
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('id, started_at')
      .eq('user_id', userId)
      .order('started_at', { ascending: true })

    if (!sessions || sessions.length === 0) {
      return []
    }

    // Get all exercises
    const { data: exercises } = await supabase
      .from('workout_exercises')
      .select('exercise_name, sets, session_id')
      .in('session_id', sessions.map(s => s.id))

    if (!exercises) return []

    // Track personal records
    const records: Record<string, { weight: number, date: string, sessionId: string }> = {}
    const prHistory: Array<{ exercise: string, weight: number, date: string, isNewPR: boolean }> = []

    exercises.forEach(exercise => {
      if (exercise.sets && Array.isArray(exercise.sets)) {
        const maxWeight = Math.max(...exercise.sets.map((set: any) => set.weight || 0))
        const session = sessions.find(s => s.id === exercise.session_id)

        if (session && maxWeight > 0) {
          const currentRecord = records[exercise.exercise_name]

          if (!currentRecord || maxWeight > currentRecord.weight) {
            records[exercise.exercise_name] = {
              weight: maxWeight,
              date: session.started_at,
              sessionId: exercise.session_id
            }

            prHistory.push({
              exercise: exercise.exercise_name,
              weight: maxWeight,
              date: session.started_at,
              isNewPR: true
            })
          }
        }
      }
    })

    // Return top records
    return Object.entries(records)
      .map(([exercise, record]) => ({
        exercise,
        weight: record.weight,
        date: new Date(record.date).toLocaleDateString('ja-JP')
      }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 10)
  } catch (error) {
    console.error('Error fetching personal records:', error)
    return []
  }
}

// 今日の種目要約リストを取得
export async function getTodayExerciseSummary(userId: string) {
  try {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Get today's workout sessions
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('id')
      .eq('user_id', userId)
      .gte('started_at', startOfDay.toISOString())
      .lt('started_at', endOfDay.toISOString())

    if (!sessions || sessions.length === 0) {
      return []
    }

    // Get today's exercises
    const { data: exercises } = await supabase
      .from('workout_exercises')
      .select('exercise_name, sets')
      .in('session_id', sessions.map(s => s.id))

    if (!exercises) return []

    // Group exercises by name and calculate summaries
    const exerciseSummary: Record<string, {
      name: string
      sets: Array<{ weight: number, reps: number }>
      totalVolume: number
      estimatedCalories: number
      category: string
    }> = {}

    exercises.forEach(exercise => {
      if (exercise.sets && Array.isArray(exercise.sets)) {
        const sets = exercise.sets.filter((set: any) => set.weight && set.reps)

        if (sets.length > 0) {
          const totalVolume = sets.reduce((sum: number, set: any) => sum + (set.weight * set.reps), 0)
          const estimatedCalories = Math.round(totalVolume * 0.05) // Simple estimation

          // Get exercise category (simplified mapping)
          const category = getExerciseCategory(exercise.exercise_name)

          exerciseSummary[exercise.exercise_name] = {
            name: exercise.exercise_name,
            sets: sets,
            totalVolume,
            estimatedCalories,
            category
          }
        }
      }
    })

    return Object.values(exerciseSummary).sort((a, b) => b.totalVolume - a.totalVolume)
  } catch (error) {
    console.error('Error fetching today exercise summary:', error)
    return []
  }
}

// セット推移データを取得（疲労・維持率分析用）
export async function getTodaySetProgression(userId: string) {
  try {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Get today's workout sessions
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('id, started_at')
      .eq('user_id', userId)
      .gte('started_at', startOfDay.toISOString())
      .lt('started_at', endOfDay.toISOString())
      .order('started_at', { ascending: true })

    if (!sessions || sessions.length === 0) {
      return { progression: [], maintenanceRate: 0 }
    }

    // Get all exercises from today's sessions
    const { data: exercises } = await supabase
      .from('workout_exercises')
      .select('exercise_name, sets, session_id')
      .in('session_id', sessions.map(s => s.id))

    if (!exercises) return { progression: [], maintenanceRate: 0 }

    // Flatten all sets with set order
    const allSets: Array<{ setOrder: number, volume: number, exercise: string }> = []
    let setOrder = 0

    exercises.forEach(exercise => {
      if (exercise.sets && Array.isArray(exercise.sets)) {
        exercise.sets.forEach((set: any) => {
          if (set.weight && set.reps) {
            allSets.push({
              setOrder: setOrder++,
              volume: set.weight * set.reps,
              exercise: exercise.exercise_name
            })
          }
        })
      }
    })

    // Calculate maintenance rate (first vs last set performance)
    let maintenanceRate = 0
    if (allSets.length >= 2) {
      const firstSetVolume = allSets[0].volume
      const lastSetVolume = allSets[allSets.length - 1].volume
      maintenanceRate = Math.round((lastSetVolume / firstSetVolume) * 100)
    }

    return {
      progression: allSets,
      maintenanceRate
    }
  } catch (error) {
    console.error('Error fetching today set progression:', error)
    return { progression: [], maintenanceRate: 0 }
  }
}

// 部位配分推移データを取得（過去12週間）
export async function getBodyPartProgression(userId: string) {
  try {
    const now = new Date()
    const weeks = []

    // 過去12週間のデータを取得
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay() - (i * 7))
      weekStart.setHours(0, 0, 0, 0)

      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)

      // その週のワークアウトセッションを取得
      const { data: sessions } = await supabase
        .from('workout_sessions')
        .select('id')
        .eq('user_id', userId)
        .gte('started_at', weekStart.toISOString())
        .lte('started_at', weekEnd.toISOString())

      let bodyPartVolumes: Record<string, number> = {}

      if (sessions && sessions.length > 0) {
        // その週のエクササイズを取得
        const { data: exercises } = await supabase
          .from('workout_exercises')
          .select(`
            exercise_name,
            sets,
            exercises(category)
          `)
          .in('session_id', sessions.map(s => s.id))

        if (exercises) {
          exercises.forEach(exercise => {
            const category = exercise.exercises?.category || getExerciseCategory(exercise.exercise_name)

            if (exercise.sets && Array.isArray(exercise.sets)) {
              const volume = exercise.sets.reduce((sum: number, set: any) => {
                return sum + (set.weight || 0) * (set.reps || 0)
              }, 0)

              if (!bodyPartVolumes[category]) {
                bodyPartVolumes[category] = 0
              }
              bodyPartVolumes[category] += volume
            }
          })
        }
      }

      // 配分パーセンテージを計算
      const totalVolume = Object.values(bodyPartVolumes).reduce((sum, vol) => sum + vol, 0)
      const bodyPartPercentages: Record<string, number> = {}

      Object.keys(bodyPartVolumes).forEach(category => {
        bodyPartPercentages[category] = totalVolume > 0
          ? Math.round((bodyPartVolumes[category] / totalVolume) * 100)
          : 0
      })

      weeks.push({
        weekLabel: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        weekStartDate: weekStart.toISOString(),
        bodyPartVolumes,
        bodyPartPercentages,
        totalVolume
      })
    }

    return weeks
  } catch (error) {
    console.error('Error fetching body part progression:', error)
    return []
  }
}

// 連続記録ヒートマップデータを取得（過去365日）
export async function getWorkoutStreakHeatmap(userId: string) {
  try {
    const now = new Date()
    const oneYearAgo = new Date(now)
    oneYearAgo.setFullYear(now.getFullYear() - 1)

    // 過去365日のワークアウトセッションを取得
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('started_at, duration')
      .eq('user_id', userId)
      .gte('started_at', oneYearAgo.toISOString())
      .order('started_at', { ascending: true })

    // 日付ごとのワークアウト強度を計算
    const heatmapData: Record<string, { intensity: number, sessions: number, totalDuration: number }> = {}

    if (sessions) {
      sessions.forEach(session => {
        const date = new Date(session.started_at).toISOString().split('T')[0]

        if (!heatmapData[date]) {
          heatmapData[date] = { intensity: 0, sessions: 0, totalDuration: 0 }
        }

        heatmapData[date].sessions += 1
        heatmapData[date].totalDuration += session.duration || 0
      })

      // 強度を計算（セッション数 + 時間で0-4のレベル）
      Object.keys(heatmapData).forEach(date => {
        const data = heatmapData[date]
        const sessionScore = Math.min(data.sessions * 2, 4)
        const durationScore = Math.min(Math.floor(data.totalDuration / 30), 2) // 30分ごとに+1
        heatmapData[date].intensity = Math.min(sessionScore + durationScore, 4)
      })
    }

    // 過去365日の配列を作成
    const days = []
    for (let i = 364; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      days.push({
        date: dateStr,
        dayOfWeek: date.getDay(),
        dayOfMonth: date.getDate(),
        month: date.getMonth(),
        intensity: heatmapData[dateStr]?.intensity || 0,
        sessions: heatmapData[dateStr]?.sessions || 0,
        totalDuration: heatmapData[dateStr]?.totalDuration || 0
      })
    }

    return days
  } catch (error) {
    console.error('Error fetching workout streak heatmap:', error)
    return []
  }
}

// 週総ボリューム推移データを取得（過去12週間）
export async function getWeeklyVolumeProgression(userId: string) {
  try {
    const now = new Date()
    const weeks = []

    // 過去12週間のデータを取得
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay() - (i * 7))
      weekStart.setHours(0, 0, 0, 0)

      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)

      // その週のワークアウトセッションを取得
      const { data: sessions } = await supabase
        .from('workout_sessions')
        .select('id')
        .eq('user_id', userId)
        .gte('started_at', weekStart.toISOString())
        .lte('started_at', weekEnd.toISOString())

      let weeklyVolume = 0

      if (sessions && sessions.length > 0) {
        // その週のエクササイズを取得
        const { data: exercises } = await supabase
          .from('workout_exercises')
          .select('sets')
          .in('session_id', sessions.map(s => s.id))

        if (exercises) {
          exercises.forEach(exercise => {
            if (exercise.sets && Array.isArray(exercise.sets)) {
              exercise.sets.forEach((set: any) => {
                if (set.weight && set.reps) {
                  weeklyVolume += set.weight * set.reps
                }
              })
            }
          })
        }
      }

      weeks.push({
        weekLabel: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        weekStartDate: weekStart.toISOString(),
        volume: weeklyVolume,
        sessionCount: sessions?.length || 0
      })
    }

    return weeks
  } catch (error) {
    console.error('Error fetching weekly volume progression:', error)
    return []
  }
}

// Exercise category helper function
function getExerciseCategory(exerciseName: string): string {
  const name = exerciseName.toLowerCase()

  if (name.includes('ベンチプレス') || name.includes('プレス') || name.includes('フライ')) {
    return '胸'
  } else if (name.includes('ラットプル') || name.includes('ローイング') || name.includes('デッドリフト')) {
    return '背中'
  } else if (name.includes('スクワット') || name.includes('レッグ')) {
    return '脚'
  } else if (name.includes('ショルダー') || name.includes('サイドレイズ')) {
    return '肩'
  } else if (name.includes('カール') || name.includes('エクステンション')) {
    return '腕'
  } else if (name.includes('クランチ') || name.includes('アブ')) {
    return '腹'
  } else {
    return 'その他'
  }
}