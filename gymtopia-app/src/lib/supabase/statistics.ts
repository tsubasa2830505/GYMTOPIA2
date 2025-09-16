import { supabase } from './client'


// Get user's workout statistics
export async function getUserWorkoutStatistics(userId: string) {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    // Get total visits
    const { count: totalVisits } = await supabase
      .from('workout_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get monthly visits
    const { count: monthlyVisits } = await supabase
      .from('workout_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('started_at', startOfMonth.toISOString())

    // Get weekly visits
    const { count: weeklyVisits } = await supabase
      .from('workout_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('started_at', startOfWeek.toISOString())

    // Get yearly visits
    const { count: yearlyVisits } = await supabase
      .from('workout_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('started_at', startOfYear.toISOString())

    // Calculate streak using SQL function to avoid RLS issues
    const { data: streakResult } = await supabase
      .rpc('calculate_user_streak', { target_user_id: userId })

    const currentStreak = streakResult?.current_streak || 0
    const longestStreak = streakResult?.longest_streak || 0

    // Calculate total weight lifted using SQL to bypass RLS issues
    const { data: weightResult } = await supabase
      .rpc('calculate_user_total_weight', { target_user_id: userId })

    const totalWeight = weightResult || 0

    // Calculate total duration
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('started_at, ended_at')
      .eq('user_id', userId)
      .not('ended_at', 'is', null)

    let totalDurationHours = 0
    if (sessions) {
      sessions.forEach(session => {
        const start = new Date(session.started_at).getTime()
        const end = new Date(session.ended_at).getTime()
        totalDurationHours += (end - start) / (1000 * 60 * 60)
      })
    }

    return {
      totalVisits: totalVisits || 0,
      monthlyVisits: monthlyVisits || 0,
      weeklyVisits: weeklyVisits || 0,
      yearlyVisits: yearlyVisits || 0,
      currentStreak,
      longestStreak,
      totalWeight,
      totalDurationHours: Math.round(totalDurationHours),
      avgDurationMinutes: totalVisits ? Math.round((totalDurationHours * 60) / totalVisits) : 0
    }
  } catch (error) {
    console.error('Error fetching workout statistics:', error)
    return {
      totalVisits: 0,
      monthlyVisits: 0,
      weeklyVisits: 0,
      yearlyVisits: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalWeight: 0,
      totalDurationHours: 0,
      avgDurationMinutes: 0
    }
  }
}

// Get gym visit rankings
export async function getGymVisitRankings(userId: string, limit = 5) {
  try {
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('gym_id, started_at')
      .eq('user_id', userId)
      .not('gym_id', 'is', null)

    if (!sessions || sessions.length === 0) {
      return []
    }

    // Count visits per gym
    const gymVisits: Record<string, { count: number; lastVisit: string }> = {}
    sessions.forEach(session => {
      if (!gymVisits[session.gym_id]) {
        gymVisits[session.gym_id] = { count: 0, lastVisit: session.started_at }
      }
      gymVisits[session.gym_id].count++
      // Update last visit if more recent
      if (new Date(session.started_at) > new Date(gymVisits[session.gym_id].lastVisit)) {
        gymVisits[session.gym_id].lastVisit = session.started_at
      }
    })

    // Get gym details
    const gymIds = Object.keys(gymVisits)
    const { data: gyms } = await supabase
      .from('gyms')
      .select('id, name')
      .in('id', gymIds)

    if (!gyms) return []

    // Calculate rankings
    const totalVisits = sessions.length
    const rankings = gyms.map(gym => {
      const visits = gymVisits[gym.id]
      const lastVisitDate = new Date(visits.lastVisit)
      const now = new Date()
      const daysDiff = Math.floor((now.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24))
      
      let lastVisitText = ''
      if (daysDiff === 0) lastVisitText = '今日'
      else if (daysDiff === 1) lastVisitText = '昨日'
      else if (daysDiff < 7) lastVisitText = `${daysDiff}日前`
      else if (daysDiff < 30) lastVisitText = `${Math.floor(daysDiff / 7)}週間前`
      else lastVisitText = `${Math.floor(daysDiff / 30)}ヶ月前`

      return {
        name: gym.name,
        visits: visits.count,
        percentage: Math.round((visits.count / totalVisits) * 1000) / 10,
        lastVisit: lastVisitText
      }
    })

    // Sort by visit count and limit
    rankings.sort((a, b) => b.visits - a.visits)
    return rankings.slice(0, limit)
  } catch (error) {
    console.error('Error fetching gym rankings:', error)
    return []
  }
}

// Get recent gym visits
export async function getRecentGymVisits(userId: string, limit = 5) {
  try {
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select(`
        id,
        started_at,
        ended_at,
        gym:gym_id(id, name),
        exercises:workout_exercises(exercise_name, sets)
      `)
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(limit)

    if (!sessions) return []

    return sessions.map(session => {
      const duration = session.ended_at
        ? Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / (1000 * 60))
        : 0

      const hours = Math.floor(duration / 60)
      const minutes = duration % 60
      const durationText = hours > 0 ? `${hours}時間${minutes}分` : `${minutes}分`

      // Calculate total weight for the session
      let totalWeight = 0
      if (session.exercises) {
        session.exercises.forEach((exercise: any) => {
          if (exercise.sets && Array.isArray(exercise.sets)) {
            exercise.sets.forEach((set: any) => {
              if (set.weight && set.reps) {
                totalWeight += set.weight * set.reps
              }
            })
          }
        })
      }

      // Format date
      const date = new Date(session.started_at)
      const dateText = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`

      const gymName = Array.isArray((session as any).gym)
        ? (session as any).gym[0]?.name
        : (session as any).gym?.name

      return {
        id: session.id,
        gymName: gymName || '不明なジム',
        date: dateText,
        duration: durationText,
        exercises: session.exercises?.map((e: any) => e.exercise_name) || [],
        totalWeight,
        crowd: 'normal' as const // This would need actual crowd data
      }
    })
  } catch (error) {
    console.error('Error fetching recent visits:', error)
    return []
  }
}

// Get weekly pattern
export async function getWeeklyPattern(userId: string) {
  try {
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('started_at')
      .eq('user_id', userId)

    if (!sessions) return []

    // Count visits by day of week
    const dayCount: Record<number, number> = {
      0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0
    }

    sessions.forEach(session => {
      const day = new Date(session.started_at).getDay()
      dayCount[day]++
    })

    // Calculate weekly averages (assuming data spans multiple weeks)
    const weeksOfData = Math.max(1, Math.ceil(sessions.length / 7))
    
    const days = ['日', '月', '火', '水', '木', '金', '土']
    return days.map((day, index) => ({
      day,
      visits: dayCount[index],
      avg: Math.round((dayCount[index] / weeksOfData) * 10) / 10
    }))
  } catch (error) {
    console.error('Error fetching weekly pattern:', error)
    return []
  }
}

// Get time distribution
export async function getTimeDistribution(userId: string) {
  try {
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('started_at')
      .eq('user_id', userId)

    if (!sessions) return []

    // Count visits by time of day
    const timeSlots = {
      '早朝 (5-8時)': { range: [5, 8], count: 0 },
      '午前 (8-12時)': { range: [8, 12], count: 0 },
      '午後 (12-17時)': { range: [12, 17], count: 0 },
      '夜 (17-22時)': { range: [17, 22], count: 0 },
      '深夜 (22-5時)': { range: [22, 5], count: 0 }
    }

    sessions.forEach(session => {
      const hour = new Date(session.started_at).getHours()
      
      for (const [label, slot] of Object.entries(timeSlots)) {
        if (slot.range[1] > slot.range[0]) {
          // Normal range (e.g., 5-8)
          if (hour >= slot.range[0] && hour < slot.range[1]) {
            slot.count++
            break
          }
        } else {
          // Overnight range (22-5)
          if (hour >= slot.range[0] || hour < slot.range[1]) {
            slot.count++
            break
          }
        }
      }
    })

    const total = sessions.length
    return Object.entries(timeSlots).map(([time, slot]) => ({
      time,
      percentage: total > 0 ? Math.round((slot.count / total) * 100) : 0,
      visits: slot.count
    }))
  } catch (error) {
    console.error('Error fetching time distribution:', error)
    return []
  }
}

// Get achievement progress
export async function getAchievementProgress(userId: string) {
  try {
    const stats = await getUserWorkoutStatistics(userId)
    
    // Define achievements and calculate progress
    const achievements = [
      {
        name: '100日連続',
        current: stats.currentStreak,
        target: 100,
        percentage: Math.min(100, (stats.currentStreak / 100) * 100)
      },
      {
        name: '月間20回訪問',
        current: stats.monthlyVisits,
        target: 20,
        percentage: Math.min(100, (stats.monthlyVisits / 20) * 100)
      },
      {
        name: '総重量200t',
        current: stats.totalWeight / 1000, // Convert to tons
        target: 200,
        percentage: Math.min(100, ((stats.totalWeight / 1000) / 200) * 100)
      }
    ]

    return achievements
  } catch (error) {
    console.error('Error fetching achievement progress:', error)
    return []
  }
}
