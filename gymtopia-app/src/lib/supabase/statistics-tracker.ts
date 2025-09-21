import { supabase } from './client'

export interface StatisticsData {
  // 日次統計
  daily_visits?: number
  daily_duration_minutes?: number
  daily_weight_kg?: number
  daily_exercises?: string[]
  daily_gyms?: string[]

  // 週次統計
  weekly_visits?: number
  weekly_duration_hours?: number
  weekly_weight_kg?: number
  weekly_unique_gyms?: number
  weekly_unique_exercises?: number

  // 月次統計
  monthly_visits?: number
  monthly_duration_hours?: number
  monthly_weight_kg?: number
  monthly_unique_gyms?: number
  monthly_unique_exercises?: number

  // 年次統計
  yearly_visits?: number
  yearly_duration_hours?: number
  yearly_weight_kg?: number
  yearly_unique_gyms?: number
  yearly_unique_exercises?: number

  // 連続記録
  current_streak?: number
  longest_streak?: number
  last_visit_date?: string

  // 個人ベスト
  max_daily_weight?: number
  max_session_duration?: number
  most_exercises_per_session?: number

  // その他
  favorite_time_slots?: string[]
  favorite_days?: string[]
  crowd_preference?: string
}

export interface GymVisitData {
  visit_count: number
  total_duration_minutes: number
  total_weight_kg: number
  exercises_performed: string[]
  crowd_levels: string[]
  mood_scores: number[]
}

/**
 * ユーザー統計を更新または挿入
 */
export async function updateUserStatistics(
  userId: string,
  statType: 'daily_summary' | 'weekly_summary' | 'monthly_summary' | 'yearly_summary' | 'streak_data' | 'personal_best' | 'achievement',
  statPeriod: string, // YYYY-MM-DD形式
  statData: StatisticsData,
  metadata: Record<string, any> = {}
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('user_statistics')
      .upsert({
        user_id: userId,
        stat_type: statType,
        stat_period: statPeriod,
        stat_data: statData,
        metadata: metadata
      })

    if (error) {
      console.error('統計データ更新エラー:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('統計データ更新失敗:', error)
    return { success: false, error: '統計データの更新に失敗しました' }
  }
}

/**
 * ジム訪問統計を更新または挿入
 */
export async function updateGymVisitStatistics(
  userId: string,
  gymId: string,
  visitDate: string, // YYYY-MM-DD形式
  visitData: GymVisitData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('user_gym_visit_statistics')
      .upsert({
        user_id: userId,
        gym_id: gymId,
        visit_date: visitDate,
        visit_count: visitData.visit_count,
        total_duration_minutes: visitData.total_duration_minutes,
        total_weight_kg: visitData.total_weight_kg,
        exercises_performed: visitData.exercises_performed,
        crowd_levels: visitData.crowd_levels,
        mood_scores: visitData.mood_scores
      })

    if (error) {
      console.error('ジム訪問統計更新エラー:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('ジム訪問統計更新失敗:', error)
    return { success: false, error: 'ジム訪問統計の更新に失敗しました' }
  }
}

/**
 * ユーザー統計を取得
 */
export async function getUserStatistics(
  userId: string,
  statType?: string,
  startDate?: string,
  endDate?: string
): Promise<{ data: any[] | null; error?: string }> {
  try {
    let query = supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)

    if (statType) {
      query = query.eq('stat_type', statType)
    }

    if (startDate) {
      query = query.gte('stat_period', startDate)
    }

    if (endDate) {
      query = query.lte('stat_period', endDate)
    }

    const { data, error } = await query.order('stat_period', { ascending: false })

    if (error) {
      console.error('統計データ取得エラー:', error)
      return { data: null, error: error.message }
    }

    return { data }
  } catch (error) {
    console.error('統計データ取得失敗:', error)
    return { data: null, error: '統計データの取得に失敗しました' }
  }
}

/**
 * ジム訪問統計を取得
 */
export async function getGymVisitStatistics(
  userId: string,
  gymId?: string,
  startDate?: string,
  endDate?: string
): Promise<{ data: any[] | null; error?: string }> {
  try {
    let query = supabase
      .from('user_gym_visit_statistics')
      .select(`
        *,
        gyms (
          id,
          name,
          address
        )
      `)
      .eq('user_id', userId)

    if (gymId) {
      query = query.eq('gym_id', gymId)
    }

    if (startDate) {
      query = query.gte('visit_date', startDate)
    }

    if (endDate) {
      query = query.lte('visit_date', endDate)
    }

    const { data, error } = await query.order('visit_date', { ascending: false })

    if (error) {
      console.error('ジム訪問統計取得エラー:', error)
      return { data: null, error: error.message }
    }

    return { data }
  } catch (error) {
    console.error('ジム訪問統計取得失敗:', error)
    return { data: null, error: 'ジム訪問統計の取得に失敗しました' }
  }
}

/**
 * ワークアウト終了時に統計を自動更新
 */
export async function trackWorkoutCompletion(
  userId: string,
  gymId: string,
  workoutData: {
    duration_minutes: number
    total_weight_kg: number
    exercises: string[]
    crowd_level?: string
    mood_score?: number
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const today = new Date().toISOString().split('T')[0]

    // ジム訪問統計を更新
    const visitResult = await updateGymVisitStatistics(userId, gymId, today, {
      visit_count: 1,
      total_duration_minutes: workoutData.duration_minutes,
      total_weight_kg: workoutData.total_weight_kg,
      exercises_performed: workoutData.exercises,
      crowd_levels: workoutData.crowd_level ? [workoutData.crowd_level] : [],
      mood_scores: workoutData.mood_score ? [workoutData.mood_score] : []
    })

    if (!visitResult.success) {
      return visitResult
    }

    // 日次統計を更新
    const dailyResult = await updateUserStatistics(userId, 'daily_summary', today, {
      daily_visits: 1,
      daily_duration_minutes: workoutData.duration_minutes,
      daily_weight_kg: workoutData.total_weight_kg,
      daily_exercises: workoutData.exercises,
      daily_gyms: [gymId]
    })

    if (!dailyResult.success) {
      return dailyResult
    }

    // 連続記録の更新
    await updateStreakData(userId, today)

    return { success: true }
  } catch (error) {
    console.error('ワークアウト統計トラッキング失敗:', error)
    return { success: false, error: 'ワークアウト統計の記録に失敗しました' }
  }
}

/**
 * 連続記録データを更新
 */
async function updateStreakData(userId: string, visitDate: string): Promise<void> {
  try {
    // 現在の連続記録データを取得
    const { data: currentStreak } = await getUserStatistics(userId, 'streak_data')

    const today = new Date(visitDate)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let streakData: StatisticsData = {
      current_streak: 1,
      longest_streak: 1,
      last_visit_date: visitDate
    }

    if (currentStreak && currentStreak.length > 0) {
      const lastStreak = currentStreak[0].stat_data
      const lastVisitDate = new Date(lastStreak.last_visit_date || '1970-01-01')

      // 昨日訪問していた場合は連続記録を延長
      if (lastVisitDate.toDateString() === yesterday.toDateString()) {
        streakData.current_streak = (lastStreak.current_streak || 0) + 1
        streakData.longest_streak = Math.max(
          streakData.current_streak,
          lastStreak.longest_streak || 0
        )
      } else {
        // 連続記録がリセット
        streakData.longest_streak = Math.max(1, lastStreak.longest_streak || 0)
      }
    }

    await updateUserStatistics(userId, 'streak_data', visitDate, streakData)
  } catch (error) {
    console.error('連続記録更新エラー:', error)
  }
}

/**
 * 週次・月次・年次統計を集計して更新
 */
export async function aggregatePeriodicStatistics(
  userId: string,
  period: 'weekly' | 'monthly' | 'yearly'
): Promise<{ success: boolean; error?: string }> {
  try {
    const today = new Date()
    let startDate: Date
    let periodKey: string

    switch (period) {
      case 'weekly':
        startDate = new Date(today)
        startDate.setDate(today.getDate() - today.getDay()) // 週の始まり（日曜日）
        periodKey = startDate.toISOString().split('T')[0]
        break
      case 'monthly':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        periodKey = startDate.toISOString().split('T')[0]
        break
      case 'yearly':
        startDate = new Date(today.getFullYear(), 0, 1)
        periodKey = startDate.toISOString().split('T')[0]
        break
    }

    const endDate = today.toISOString().split('T')[0]
    const startDateStr = startDate.toISOString().split('T')[0]

    // 期間中のジム訪問統計を取得
    const { data: visits } = await getGymVisitStatistics(userId, undefined, startDateStr, endDate)

    if (!visits || visits.length === 0) {
      return { success: true } // データがない場合は正常終了
    }

    // 統計を集計
    const aggregatedStats: StatisticsData = {
      [`${period}_visits`]: visits.reduce((sum, visit) => sum + visit.visit_count, 0),
      [`${period}_duration_hours`]: Math.round(visits.reduce((sum, visit) => sum + visit.total_duration_minutes, 0) / 60),
      [`${period}_weight_kg`]: visits.reduce((sum, visit) => sum + visit.total_weight_kg, 0),
      [`${period}_unique_gyms`]: new Set(visits.map(visit => visit.gym_id)).size,
      [`${period}_unique_exercises`]: new Set(visits.flatMap(visit => visit.exercises_performed || [])).size
    }

    const statType = `${period}_summary` as 'weekly_summary' | 'monthly_summary' | 'yearly_summary'
    await updateUserStatistics(userId, statType, periodKey, aggregatedStats)

    return { success: true }
  } catch (error) {
    console.error('定期統計集計エラー:', error)
    return { success: false, error: '定期統計の集計に失敗しました' }
  }
}