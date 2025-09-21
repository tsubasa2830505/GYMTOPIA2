'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, TrendingUp, TrendingDown, Calendar, Clock, MapPin,
  Activity, Award, Target, PieChart, Settings,
  Dumbbell, Flame, ChevronRight
} from 'lucide-react'
import {
  getUserWorkoutStatistics,
  getGymVisitRankings,
  getRecentGymVisits,
  getWeeklyPattern,
  getTimeDistribution,
  getAchievementProgress
} from '@/lib/supabase/statistics'
import {
  getBig3MaxWeights,
  getExerciseFrequencyRanking,
  getPersonalRecords,
  getBodyPartBreakdown,
  getEquipmentBreakdown,
  getEstimatedCalories,
  getWeeklyGoalProgress,
  getPeriodComparison,
  getTodayExerciseSummary,
  getTodaySetProgression,
  getWeeklyVolumeProgression,
  getWorkoutStreakHeatmap,
  getBodyPartProgression
} from '@/lib/supabase/exercise-stats'
import { useAuth } from '@/contexts/AuthContext'

interface GymVisit {
  id: string
  gymName: string
  date: string
  duration: string
  exercises: string[]
  totalWeight: number
  crowd: 'empty' | 'normal' | 'crowded'
}

interface GymRanking {
  name: string
  visits: number
  percentage: number
  lastVisit: string
}

interface StatisticsData {
  totalVisits: number
  currentStreak: number
  longestStreak: number
  totalWeight: number
  totalDurationHours: number
  monthlyVisits: number
  weeklyVisits: number
  yearlyVisits: number
  periodVisits: number
  periodDurationHours: number
  periodWeight: number
  periodAvgDurationMinutes: number
  avgDurationMinutes: number
}

export default function GymStatsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Optimized state management with proper typing
  const [stats, setStats] = useState<StatisticsData>({
    totalVisits: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalWeight: 0,
    totalDurationHours: 0,
    monthlyVisits: 0,
    weeklyVisits: 0,
    yearlyVisits: 0,
    periodVisits: 0,
    periodDurationHours: 0,
    periodWeight: 0,
    periodAvgDurationMinutes: 0,
    avgDurationMinutes: 0
  })

  const [gymRankings, setGymRankings] = useState<GymRanking[]>([])
  const [recentVisits, setRecentVisits] = useState<GymVisit[]>([])
  const [weeklyPattern, setWeeklyPattern] = useState<any[]>([])
  const [timeDistribution, setTimeDistribution] = useState<any[]>([])
  const [achievements, setAchievements] = useState<any[]>([])
  const [big3Weights, setBig3Weights] = useState({ benchPress: 0, squat: 0, deadlift: 0 })
  const [exerciseRanking, setExerciseRanking] = useState<any[]>([])
  const [personalRecords, setPersonalRecords] = useState<any[]>([])
  const [bodyPartBreakdown, setBodyPartBreakdown] = useState<any[]>([])
  const [equipmentBreakdown, setEquipmentBreakdown] = useState<any[]>([])
  const [estimatedCalories, setEstimatedCalories] = useState({
    totalCalories: 0,
    metsCalories: 0,
    volumeCalories: 0,
    estimatedTimeMinutes: 0
  })
  const [weeklyGoals, setWeeklyGoals] = useState({
    weeklyVisits: { current: 0, target: 3, percentage: 0 },
    weeklyTime: { current: 0, target: 300, percentage: 0 },
    weeklyVolume: { current: 0, target: 5000, percentage: 0 },
    overallProgress: 0
  })
  const [periodComparison, setPeriodComparison] = useState({
    current: { visits: 0, volume: 0, time: 0 },
    previous: { visits: 0, volume: 0, time: 0 },
    changes: { visits: 0, volume: 0, time: 0 },
    period: 'month' as const
  })
  const [todayExercises, setTodayExercises] = useState<any[]>([])
  const [setProgression, setSetProgression] = useState({
    progression: [],
    maintenanceRate: 0
  })
  const [weeklyVolumeProgression, setWeeklyVolumeProgression] = useState<any[]>([])
  const [streakHeatmap, setStreakHeatmap] = useState<any[]>([])
  const [bodyPartProgression, setBodyPartProgression] = useState<any[]>([])

  // Optimized data loading with error handling and memoization
  const loadStatistics = useCallback(async () => {
    if (!user?.id) {
      console.log('❌ No user ID, cannot load statistics')
      return
    }

    setLoading(true)
    setError(null)
    console.log('🔄 Loading statistics for user:', user.id, 'period:', selectedPeriod)

    try {
      // Load all statistics in parallel with optimized Promise.allSettled
      const results = await Promise.allSettled([
        getUserWorkoutStatistics(user.id, selectedPeriod),
        getGymVisitRankings(user.id, 5, selectedPeriod),
        getRecentGymVisits(user.id, 5, selectedPeriod),
        getWeeklyPattern(user.id),
        getTimeDistribution(user.id),
        getAchievementProgress(user.id),
        getBig3MaxWeights(user.id, selectedPeriod),
        getExerciseFrequencyRanking(user.id, selectedPeriod, 5),
        getPersonalRecords(user.id),
        getBodyPartBreakdown(user.id, selectedPeriod),
        getEquipmentBreakdown(user.id, selectedPeriod),
        getEstimatedCalories(user.id, selectedPeriod),
        getWeeklyGoalProgress(user.id),
        getPeriodComparison(user.id, selectedPeriod),
        getTodayExerciseSummary(user.id),
        getTodaySetProgression(user.id),
        getWeeklyVolumeProgression(user.id),
        getWorkoutStreakHeatmap(user.id),
        getBodyPartProgression(user.id)
      ])

      // Process results with error handling for individual API calls
      const [
        userStatsResult, rankingsResult, visitsResult, patternResult,
        timeDistResult, achievementResult, big3Result, exerciseRankResult,
        prRecordsResult, bodyPartResult, equipmentResult, caloriesResult,
        weeklyGoalResult, comparisonResult, todayExercisesResult,
        setProgressionResult, weeklyVolumeResult, streakHeatmapResult,
        bodyPartProgressionResult
      ] = results

      // Set data with fallback values for failed requests
      if (userStatsResult.status === 'fulfilled') {
        setStats(userStatsResult.value)
        console.log('📈 User stats loaded:', userStatsResult.value)
      } else {
        console.error('Failed to load user stats:', userStatsResult.reason)
      }

      if (rankingsResult.status === 'fulfilled') setGymRankings(rankingsResult.value)
      if (visitsResult.status === 'fulfilled') setRecentVisits(visitsResult.value)
      if (patternResult.status === 'fulfilled') setWeeklyPattern(patternResult.value)
      if (timeDistResult.status === 'fulfilled') setTimeDistribution(timeDistResult.value)
      if (achievementResult.status === 'fulfilled') setAchievements(achievementResult.value)
      if (big3Result.status === 'fulfilled') setBig3Weights(big3Result.value)
      if (exerciseRankResult.status === 'fulfilled') setExerciseRanking(exerciseRankResult.value)
      if (prRecordsResult.status === 'fulfilled') setPersonalRecords(prRecordsResult.value)
      if (bodyPartResult.status === 'fulfilled') setBodyPartBreakdown(bodyPartResult.value)
      if (equipmentResult.status === 'fulfilled') setEquipmentBreakdown(equipmentResult.value)
      if (caloriesResult.status === 'fulfilled') setEstimatedCalories(caloriesResult.value)
      if (weeklyGoalResult.status === 'fulfilled') setWeeklyGoals(weeklyGoalResult.value)
      if (comparisonResult.status === 'fulfilled') setPeriodComparison(comparisonResult.value)
      if (todayExercisesResult.status === 'fulfilled') setTodayExercises(todayExercisesResult.value)
      if (setProgressionResult.status === 'fulfilled') setSetProgression(setProgressionResult.value)
      if (weeklyVolumeResult.status === 'fulfilled') setWeeklyVolumeProgression(weeklyVolumeResult.value)
      if (streakHeatmapResult.status === 'fulfilled') setStreakHeatmap(streakHeatmapResult.value)
      if (bodyPartProgressionResult.status === 'fulfilled') setBodyPartProgression(bodyPartProgressionResult.value)

      console.log('✅ Statistics loaded successfully')
    } catch (error) {
      console.error('❌ Error loading statistics:', error)
      setError('統計データの読み込み中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }, [user?.id, selectedPeriod])

  // Optimized effect with dependency tracking
  useEffect(() => {
    if (!authLoading && user?.id) {
      loadStatistics()
    }
  }, [authLoading, user?.id, loadStatistics])

  // Memoized computed values for better performance
  const periodInfo = useMemo(() => {
    const periodTitles = {
      week: '今週',
      month: '今月',
      year: '今年'
    }
    return {
      title: periodTitles[selectedPeriod],
      visits: stats.periodVisits
    }
  }, [selectedPeriod, stats.periodVisits])

  const getCrowdIcon = useCallback((crowd: string) => {
    switch(crowd) {
      case 'empty': return (
        <svg className="w-4 h-4 inline" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 6c1.93 0 3.5 1.57 3.5 3.5S13.93 14 12 14s-3.5-1.57-3.5-3.5S10.07 8 12 8zm0 10c-2.03 0-4.43-.82-6.14-2.88C7.55 14.8 9.68 14 12 14s4.45.8 6.14 2.12C16.43 17.18 14.03 18 12 18z"/>
        </svg>
      )
      case 'crowded': return (
        <svg className="w-4 h-4 inline" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-2 .13-2.87.4-.59.18-1.13.9-1.13 1.6v3H5V16h-.97c-.02-.49-.39-.94-.88-1.1zM12 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-2 .13-2.87.4-.59.18-1.13.9-1.13 1.6v3H15V16h-.97c-.02-.49-.39-.94-.88-1.1zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-2 .13-2.87.4-.59.18-1.13.9-1.13 1.6v3H23V16h-.97c-.02-.49-.39-.94-.88-1.1z"/>
        </svg>
      )
      default: return (
        <svg className="w-4 h-4 inline" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
      )
    }
  }, [])

  const getCrowdColor = useCallback((crowd: string) => {
    switch(crowd) {
      case 'empty': return 'text-[color:var(--gt-secondary-strong)]'
      case 'crowded': return 'text-[color:var(--gt-primary-strong)]'
      default: return 'text-[color:var(--gt-tertiary-strong)]'
    }
  }, [])

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[rgba(254,255,250,0.96)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[color:var(--gt-primary-strong)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[color:var(--text-muted)]">統計データを読み込み中...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[rgba(254,255,250,0.96)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => loadStatistics()}
            className="px-4 py-2 bg-gradient-to-r from-accent to-accent-secondary text-white rounded-lg hover:from-accent-strong hover:to-accent-tertiary transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    )
  }

  // Authentication check
  if (!user) {
    return (
      <div className="min-h-screen bg-[rgba(254,255,250,0.96)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[color:var(--text-muted)] mb-4">ログインしてください</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-gradient-to-r from-accent to-accent-secondary text-[color:var(--gt-on-primary)] shadow-[0_12px_30px_-18px_rgba(189,101,78,0.46)] rounded-lg hover:from-accent-strong hover:to-accent-tertiary transition-colors"
          >
            ログインへ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(202deg,rgba(231,103,76,0.08),transparent_84%),radial-gradient(circle_at_18%_22%,rgba(240,142,111,0.14),transparent_68%),radial-gradient(circle_at_86%_16%,rgba(245,177,143,0.12),transparent_76%)]" />
        <div className="absolute -top-24 left-14 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(231,103,76,0.32),transparent_72%)] blur-[150px] opacity-68" />
        <div className="absolute bottom-[-10%] right-[-6%] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(245, 177, 143,0.22),transparent_80%)] blur-[150px] opacity-56" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-[rgba(231,103,76,0.18)] bg-[rgba(247,250,255,0.9)] backdrop-blur-xl shadow-[0_18px_48px_-26px_rgba(189,101,78,0.4)]">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-[rgba(254,255,250,0.98)] rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg sm:text-xl font-bold text-[color:var(--foreground)] truncate">ジム通い統計</h1>
              <span className="hidden sm:inline-flex px-2 py-1 bg-[rgba(231,103,76,0.14)] text-[color:var(--gt-primary-strong)] text-xs rounded-full font-medium">
                {periodInfo.title}: {periodInfo.visits}回
              </span>
            </div>

            {/* Period selector */}
            <div className="flex bg-white/60 backdrop-blur-sm border border-[rgba(231,103,76,0.15)] rounded-lg p-1 flex-shrink-0">
              {['week', 'month', 'year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period as 'week' | 'month' | 'year')}
                  className={`px-2 sm:px-3 py-1 text-sm rounded-md transition-all ${
                    selectedPeriod === period
                      ? 'bg-[var(--gt-primary)] text-white shadow-lg'
                      : 'text-[color:var(--text-muted)] hover:text-[color:var(--foreground)]'
                  }`}
                >
                  {period === 'week' ? '週' : period === 'month' ? '月' : '年'}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile period info */}
          <div className="sm:hidden px-4 pb-2">
            <span className="inline-flex px-2 py-1 bg-[rgba(231,103,76,0.14)] text-[color:var(--gt-primary-strong)] text-xs rounded-full font-medium">
              {periodInfo.title}: {periodInfo.visits}回
            </span>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <div className="space-y-6 sm:space-y-8">
            {/* Key Statistics Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-[rgba(254,255,250,0.96)] to-[rgba(231,103,76,0.08)] rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm text-[color:var(--text-subtle)]">{periodInfo.title}の訪問</span>
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-[color:var(--gt-primary-strong)]" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-[color:var(--foreground)]">{stats.periodVisits}回</div>
                <div className="text-xs text-[color:var(--text-muted)] mt-1">総計: {stats.totalVisits}回</div>
              </div>

              <div className="bg-gradient-to-br from-[rgba(254,255,250,0.96)] to-[rgba(231,103,76,0.06)] rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm text-[color:var(--text-subtle)]">BIG3最大重量</span>
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-[color:var(--gt-secondary-strong)]" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-[color:var(--foreground)]">{big3Weights.benchPress + big3Weights.squat + big3Weights.deadlift}kg</div>
                <div className="text-xs text-[color:var(--text-muted)] mt-1">B{big3Weights.benchPress} S{big3Weights.squat} D{big3Weights.deadlift}</div>
              </div>

              <div className="bg-gradient-to-br from-[rgba(254,255,250,0.96)] to-[rgba(231,103,76,0.08)] rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm text-[color:var(--text-subtle)]">{periodInfo.title}の重量</span>
                  <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-[color:var(--gt-secondary-strong)]" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-[color:var(--foreground)]">{(stats.periodWeight/1000).toFixed(1)}t</div>
                <div className="text-xs text-[color:var(--text-muted)] mt-1">平均: {stats.periodVisits > 0 ? Math.round(stats.periodWeight / stats.periodVisits) : 0}kg/回</div>
              </div>

              <div className="bg-gradient-to-br from-[rgba(254,255,250,0.96)] to-[rgba(231,103,76,0.08)] rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm text-[color:var(--text-subtle)]">{periodInfo.title}の時間</span>
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[color:var(--gt-tertiary-strong)]" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-[color:var(--foreground)]">{stats.periodDurationHours}時間</div>
                <div className="text-xs text-[color:var(--text-muted)] mt-1">平均: {(stats.periodAvgDurationMinutes / 60).toFixed(1)}時間/回</div>
              </div>

              <div className="bg-gradient-to-br from-[rgba(254,255,250,0.96)] to-[rgba(231,103,76,0.08)] rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm text-[color:var(--text-subtle)]">連続日数</span>
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-[color:var(--gt-primary-strong)]" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-[color:var(--foreground)]">{stats.currentStreak}日</div>
                <div className="text-xs text-[color:var(--text-muted)] mt-1">最長: {stats.longestStreak}日</div>
              </div>
            </div>

            {/* Message for empty data */}
            {stats.totalVisits === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-[rgba(231,103,76,0.1)] to-[rgba(245,177,143,0.1)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-[color:var(--gt-primary)]" />
                </div>
                <h3 className="text-lg font-semibold text-[color:var(--foreground)] mb-2">まだトレーニング記録がありません</h3>
                <p className="text-[color:var(--text-muted)] text-sm">ワークアウトを記録して統計を開始しましょう</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}