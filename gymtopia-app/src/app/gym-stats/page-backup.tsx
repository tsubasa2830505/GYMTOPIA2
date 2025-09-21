'use client'

import { useState, useEffect } from 'react'
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

export default function GymStatsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [loading, setLoading] = useState(true)

  // Statistics state
  const [stats, setStats] = useState({
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

  useEffect(() => {
    console.log('🔍 GymStatsPage useEffect:', { authLoading, user: user?.id, selectedPeriod })
    if (!authLoading && user) {
      console.log('✅ Starting to load statistics for user:', user.id)
      loadStatistics()
    } else {
      console.log('⏳ Waiting for auth or user is null', { authLoading, hasUser: !!user })
    }
  }, [selectedPeriod, user, authLoading])

  const loadStatistics = async () => {
    console.log('📊 loadStatistics called with user:', user?.id)
    if (!user?.id) {
      console.log('❌ No user ID, cannot load statistics')
      return
    }

    setLoading(true)
    console.log('🔄 Loading statistics...')
    try {
      // Load all statistics in parallel
      const [
        userStats,
        rankings,
        visits,
        pattern,
        timeDist,
        achievementData,
        big3,
        exerciseRank,
        prRecords,
        bodyPartData,
        equipmentData,
        caloriesData,
        weeklyGoalData,
        comparisonData,
        todayExercisesData,
        setProgressionData,
        weeklyVolumeData,
        streakHeatmapData,
        bodyPartProgressionData
      ] = await Promise.all([
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

      console.log('📈 Statistics loaded successfully:', {
        selectedPeriod,
        totalVisits: userStats.totalVisits,
        weeklyVisits: userStats.weeklyVisits,
        monthlyVisits: userStats.monthlyVisits,
        yearlyVisits: userStats.yearlyVisits,
        totalWeight: userStats.totalWeight,
        currentStreak: userStats.currentStreak
      })

      const periodInfo = {
        week: userStats.weeklyVisits,
        month: userStats.monthlyVisits,
        year: userStats.yearlyVisits
      }

      console.log('🎯 Period filtering result:', {
        selectedPeriod,
        periodInfo,
        currentPeriodVisits: periodInfo[selectedPeriod],
        rankingsCount: rankings.length,
        recentVisitsCount: visits.length
      })

      setStats(userStats)
      setGymRankings(rankings)
      setRecentVisits(visits)
      setWeeklyPattern(pattern)
      setTimeDistribution(timeDist)
      setAchievements(achievementData)
      setBig3Weights(big3)
      setExerciseRanking(exerciseRank)
      setPersonalRecords(prRecords)
      setBodyPartBreakdown(bodyPartData)
      setEquipmentBreakdown(equipmentData)
      setEstimatedCalories(caloriesData)
      setWeeklyGoals(weeklyGoalData)
      setPeriodComparison(comparisonData)
      setTodayExercises(todayExercisesData)
      setSetProgression(setProgressionData)
      setWeeklyVolumeProgression(weeklyVolumeData)
      setStreakHeatmap(streakHeatmapData)
      setBodyPartProgression(bodyPartProgressionData)
    } catch (error) {
      console.error('Error loading statistics:', error)
      // エラー時は空のデータを設定（ハードコーディングを避ける）
      setStats({
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
      setGymRankings([])
      setRecentVisits([])
      setWeeklyPattern([])
      setTimeDistribution([])
      setAchievements([])
      setBig3Weights({ benchPress: 0, squat: 0, deadlift: 0 })
      setExerciseRanking([])
      setPersonalRecords([])
      setBodyPartBreakdown([])
      setEquipmentBreakdown([])
      setEstimatedCalories({
        totalCalories: 0,
        metsCalories: 0,
        volumeCalories: 0,
        estimatedTimeMinutes: 0
      })
      setWeeklyGoals({
        weeklyVisits: { current: 0, target: 3, percentage: 0 },
        weeklyTime: { current: 0, target: 300, percentage: 0 },
        weeklyVolume: { current: 0, target: 5000, percentage: 0 },
        overallProgress: 0
      })
      setPeriodComparison({
        current: { visits: 0, volume: 0, time: 0 },
        previous: { visits: 0, volume: 0, time: 0 },
        changes: { visits: 0, volume: 0, time: 0 },
        period: 'month' as const
      })
      setTodayExercises([])
      setSetProgression({
        progression: [],
        maintenanceRate: 0
      })
      setWeeklyVolumeProgression([])
      setStreakHeatmap([])
      setBodyPartProgression([])
    } finally {
      setLoading(false)
    }
  }

  // Get period-specific visits
  const getPeriodVisits = () => {
    // Use the new periodVisits field that is dynamically set based on selectedPeriod
    return stats.periodVisits
  }

  // Get period-specific title and dynamic count
  const getPeriodInfo = () => {
    const periodVisits = getPeriodVisits()
    const periodTitles = {
      week: '今週',
      month: '今月',
      year: '今年'
    }
    return {
      title: periodTitles[selectedPeriod] || '',
      visits: periodVisits
    }
  }

  const getCrowdIcon = (crowd: string) => {
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
  }

  const getCrowdColor = (crowd: string) => {
    switch(crowd) {
      case 'empty':
        return 'text-[color:var(--gt-secondary-strong)]'
      case 'crowded':
        return 'text-[color:var(--gt-primary-strong)]'
      default:
        return 'text-[color:var(--gt-tertiary-strong)]'
    }
  }

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
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(202deg,rgba(231,103,76,0.08),transparent_84%),radial-gradient(circle_at_18%_22%,rgba(240,142,111,0.14),transparent_68%),radial-gradient(circle_at_86%_16%,rgba(245,177,143,0.12),transparent_76%)]" />
        <div className="absolute -top-24 left-14 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(231,103,76,0.32),transparent_72%)] blur-[150px] opacity-68" />
        <div className="absolute bottom-[-10%] right-[-6%] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(245, 177, 143,0.22),transparent_80%)] blur-[150px] opacity-56" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-[rgba(231,103,76,0.18)] bg-[rgba(247,250,255,0.9)] backdrop-blur-xl shadow-[0_18px_48px_-26px_rgba(189,101,78,0.4)]">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-[rgba(254,255,250,0.98)] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-[color:var(--foreground)]">ジム通い統計</h1>
            <span className="px-2 py-1 bg-[rgba(231,103,76,0.14)] text-[color:var(--gt-primary-strong)] text-xs rounded-full font-medium">
              {getPeriodInfo().title}: {getPeriodInfo().visits}回
            </span>
          </div>
          
          </div>
        </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 統合ダッシュボード */}
        <div className="space-y-8">
          {/* Hero Analytics Section */}
          <div className="gt-shell bg-[rgba(254,255,250,0.95)] backdrop-blur-2xl border border-[rgba(231,103,76,0.2)] shadow-[0_32px_64px_-12px_rgba(189,101,78,0.3)]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[var(--gt-primary)] to-[var(--gt-secondary)] rounded-xl shadow-lg">
                  <Dumbbell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[color:var(--foreground)]">今日のトレーニング</h3>
                  <p className="text-sm text-[color:var(--text-muted)]">Today's Workout Summary</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-[rgba(231,103,76,0.15)] text-[color:var(--gt-primary-strong)] text-sm rounded-full font-medium">
                  {todayExercises.length}種目完了
                </div>
                <div className="text-xs text-[color:var(--text-muted)]">
                  {new Date().toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>

            {todayExercises.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {todayExercises.map((exercise, index) => (
                  <div key={index} className="group bg-white/60 backdrop-blur-sm border border-[rgba(231,103,76,0.15)] rounded-2xl p-5 hover:shadow-[0_20px_40px_-12px_rgba(189,101,78,0.3)] hover:border-[rgba(231,103,76,0.25)] transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[var(--gt-primary)] to-[var(--gt-secondary)] rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-[color:var(--foreground)] text-base group-hover:text-[color:var(--gt-primary)] transition-colors">{exercise.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-1 bg-gradient-to-r from-[rgba(231,103,76,0.1)] to-[rgba(245,177,143,0.1)] text-[color:var(--gt-primary-strong)] text-xs rounded-full font-medium">
                              {exercise.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="text-xs text-[color:var(--gt-primary)] hover:text-[color:var(--gt-primary-strong)] transition-colors opacity-0 group-hover:opacity-100">
                        詳細
                      </button>
                    </div>

                    <div className="bg-gradient-to-r from-[rgba(254,255,250,0.8)] to-[rgba(254,255,250,0.4)] rounded-xl p-3 mb-3">
                      <div className="flex flex-wrap gap-2 text-sm">
                        {exercise.sets.map((set: any, setIndex: number) => (
                          <span key={setIndex} className="px-2 py-1 bg-white/70 rounded-lg text-[color:var(--foreground)] font-medium">
                            {set.weight}×{set.reps}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-[color:var(--foreground)]">{exercise.totalVolume.toLocaleString()}</div>
                          <div className="text-xs text-[color:var(--text-muted)]">kg</div>
                        </div>
                        <div className="w-px h-8 bg-[rgba(231,103,76,0.2)]"></div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-[color:var(--gt-primary)]">{exercise.estimatedCalories}</div>
                          <div className="text-xs text-[color:var(--text-muted)]">kcal</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-[rgba(231,103,76,0.1)] to-[rgba(245,177,143,0.1)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Dumbbell className="w-8 h-8 text-[color:var(--gt-primary)]" />
                </div>
                <h3 className="text-lg font-semibold text-[color:var(--foreground)] mb-2">今日はまだトレーニングしていません</h3>
                <p className="text-[color:var(--text-muted)] text-sm">新しいワークアウトを記録して統計を開始しましょう</p>
              </div>
            )}
          </div>

          {/* パフォーマンス分析セクション */}
          <div className="gt-shell bg-[rgba(254,255,250,0.95)] backdrop-blur-2xl border border-[rgba(231,103,76,0.2)] shadow-[0_32px_64px_-12px_rgba(189,101,78,0.3)]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[var(--gt-secondary)] to-[var(--gt-tertiary)] rounded-xl shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[color:var(--foreground)]">パフォーマンス分析</h3>
                  <p className="text-sm text-[color:var(--text-muted)]">Set Progression & Maintenance</p>
                </div>
              </div>
              {setProgression.maintenanceRate > 0 && (
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-[rgba(231,103,76,0.15)]">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      setProgression.maintenanceRate >= 80 ? 'text-green-600' :
                      setProgression.maintenanceRate >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {setProgression.maintenanceRate}%
                    </div>
                    <div className="text-xs text-[color:var(--text-muted)] font-medium">維持率</div>
                  </div>
                </div>
              )}
            </div>

            {setProgression.progression.length > 0 ? (
              <div>
                <div className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm rounded-2xl p-6 border border-[rgba(231,103,76,0.1)]">
                  <div className="flex items-end gap-2 h-24 mb-4 overflow-x-auto">
                    {setProgression.progression.map((set: any, index) => {
                      const maxVolume = Math.max(...setProgression.progression.map((s: any) => s.volume))
                      const height = Math.max(12, (set.volume / maxVolume) * 80)
                      const isLast = index === setProgression.progression.length - 1
                      const isPeak = set.volume === maxVolume

                      return (
                        <div key={index} className="flex flex-col items-center min-w-[24px] group">
                          <div
                            className={`w-4 rounded-lg transition-all duration-300 hover:scale-110 ${
                              isPeak
                                ? 'bg-gradient-to-t from-[var(--gt-primary)] via-[var(--gt-secondary)] to-yellow-400 shadow-lg'
                                : isLast
                                  ? 'bg-gradient-to-t from-[var(--gt-secondary)] to-[var(--gt-tertiary)]'
                                  : 'bg-gradient-to-t from-[var(--gt-primary)] to-[var(--gt-secondary)]'
                            }`}
                            style={{ height: `${height}px` }}
                            title={`セット${index + 1}: ${set.volume}kg・rep`}
                          />
                          <span className={`text-xs mt-2 transition-colors ${
                            isPeak ? 'text-[color:var(--gt-primary)] font-bold' : 'text-[color:var(--text-muted)]'
                          }`}>
                            {index + 1}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-[color:var(--text-muted)]">
                      総セット数: <span className="font-semibold text-[color:var(--foreground)]">{setProgression.progression.length}</span>
                    </div>
                    {setProgression.maintenanceRate < 70 && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <span className="text-yellow-500">💡</span>
                        <span className="text-yellow-700 text-sm font-medium">休憩時間を延長推奨</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-[rgba(231,103,76,0.1)] to-[rgba(245,177,143,0.1)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-[color:var(--gt-secondary)]" />
                </div>
                <h3 className="text-lg font-semibold text-[color:var(--foreground)] mb-2">セット記録がありません</h3>
                <p className="text-[color:var(--text-muted)] text-sm">トレーニングを開始すると、セット推移が表示されます</p>
              </div>
            )}
          </div>

          {/* 週総ボリューム推移グラフ */}
          <div className="gt-shell bg-[rgba(254,255,250,0.92)] backdrop-blur-xl border border-[rgba(231,103,76,0.18)] shadow-[0_20px_44px_-30px_rgba(189,101,78,0.46)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[color:var(--foreground)] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[color:var(--gt-primary)]" />
                週総ボリューム推移（過去12週間）
              </h3>
              {weeklyVolumeProgression.length > 0 && (
                <div className="text-sm text-[color:var(--text-muted)]">
                  最新: {weeklyVolumeProgression[weeklyVolumeProgression.length - 1]?.volume.toLocaleString()}kg
                </div>
              )}
            </div>

            {weeklyVolumeProgression.length > 0 ? (
              <div>
                {/* チャートエリア */}
                <div className="h-48 mb-4 relative overflow-x-auto">
                  <div className="flex items-end gap-2 h-full min-w-[800px] px-2">
                    {weeklyVolumeProgression.map((week, index) => {
                      const maxVolume = Math.max(...weeklyVolumeProgression.map(w => w.volume))
                      const height = maxVolume > 0 ? Math.max(8, (week.volume / maxVolume) * 160) : 8

                      return (
                        <div key={index} className="flex flex-col items-center flex-1 min-w-[60px]">
                          <div
                            className="w-8 bg-gradient-to-t from-[var(--gt-primary)] to-[var(--gt-secondary)] rounded-t transition-all hover:shadow-lg"
                            style={{ height: `${height}px` }}
                            title={`${week.weekLabel}: ${week.volume.toLocaleString()}kg (${week.sessionCount}回)`}
                          />
                          <div className="mt-2 text-center">
                            <div className="text-xs text-[color:var(--text-muted)] font-medium">
                              {week.weekLabel}
                            </div>
                            <div className="text-xs text-[color:var(--gt-primary)] font-bold">
                              {week.volume.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 統計情報 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[rgba(231,103,76,0.12)]">
                  <div className="text-center">
                    <div className="text-sm text-[color:var(--text-muted)]">平均</div>
                    <div className="font-bold text-[color:var(--foreground)]">
                      {Math.round(weeklyVolumeProgression.reduce((sum, w) => sum + w.volume, 0) / weeklyVolumeProgression.length).toLocaleString()}kg
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-[color:var(--text-muted)]">最高</div>
                    <div className="font-bold text-green-600">
                      {Math.max(...weeklyVolumeProgression.map(w => w.volume)).toLocaleString()}kg
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-[color:var(--text-muted)]">最低</div>
                    <div className="font-bold text-[color:var(--text-muted)]">
                      {Math.min(...weeklyVolumeProgression.map(w => w.volume)).toLocaleString()}kg
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-[color:var(--text-muted)]">総回数</div>
                    <div className="font-bold text-[color:var(--gt-primary)]">
                      {weeklyVolumeProgression.reduce((sum, w) => sum + w.sessionCount, 0)}回
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-[color:var(--text-muted)] mx-auto mb-4 opacity-50" />
                <p className="text-[color:var(--text-muted)]">
                  週ボリュームデータがありません
                </p>
              </div>
            )}
          </div>

          {/* 連続記録ヒートマップ */}
          <div className="gt-shell bg-[rgba(254,255,250,0.92)] backdrop-blur-xl border border-[rgba(231,103,76,0.18)] shadow-[0_20px_44px_-30px_rgba(189,101,78,0.46)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[color:var(--foreground)] flex items-center gap-2">
                <Activity className="w-5 h-5 text-[color:var(--gt-primary)]" />
                連続記録ヒートマップ（過去365日）
              </h3>
              {streakHeatmap.length > 0 && (
                <div className="text-sm text-[color:var(--text-muted)]">
                  {streakHeatmap.filter(day => day.intensity > 0).length}日活動
                </div>
              )}
            </div>

            {streakHeatmap.length > 0 ? (
              <div>
                {/* ヒートマップグリッド */}
                <div className="mb-4 overflow-x-auto">
                  <div className="min-w-[900px]">
                    {/* 月ラベル */}
                    <div className="flex text-xs text-[color:var(--text-muted)] mb-2">
                      {Array.from({ length: 12 }, (_, i) => {
                        const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
                        const currentMonth = new Date().getMonth()
                        const monthIndex = (currentMonth - 11 + i + 12) % 12
                        return (
                          <div key={i} className="w-[75px] text-center">
                            {monthNames[monthIndex]}
                          </div>
                        )
                      })}
                    </div>

                    {/* 週ラベル + ヒートマップ */}
                    <div className="flex">
                      {/* 曜日ラベル */}
                      <div className="flex flex-col text-xs text-[color:var(--text-muted)] mr-2">
                        <div className="h-3"></div>
                        <div className="h-3">月</div>
                        <div className="h-3"></div>
                        <div className="h-3">水</div>
                        <div className="h-3"></div>
                        <div className="h-3">金</div>
                        <div className="h-3"></div>
                      </div>

                      {/* ヒートマップセル */}
                      <div className="grid grid-rows-7 grid-flow-col gap-1">
                        {Array.from({ length: 53 }, (_, weekIndex) => (
                          Array.from({ length: 7 }, (_, dayIndex) => {
                            const dayData = streakHeatmap[weekIndex * 7 + dayIndex]
                            if (!dayData) return <div key={`${weekIndex}-${dayIndex}`} className="w-3 h-3"></div>

                            const intensityColors = [
                              'bg-gray-100', // 0: No activity
                              'bg-green-200', // 1: Light activity
                              'bg-green-300', // 2: Moderate activity
                              'bg-green-500', // 3: High activity
                              'bg-green-700'  // 4: Very high activity
                            ]

                            return (
                              <div
                                key={`${weekIndex}-${dayIndex}`}
                                className={`w-3 h-3 rounded-sm ${intensityColors[dayData.intensity]} hover:ring-2 hover:ring-[var(--gt-primary)] hover:ring-opacity-50 transition-all cursor-pointer`}
                                title={`${dayData.date}: ${dayData.sessions}回のワークアウト${dayData.totalDuration > 0 ? ` (${dayData.totalDuration}分)` : ''}`}
                              />
                            )
                          })
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 凡例と統計 */}
                <div className="flex items-center justify-between pt-4 border-t border-[rgba(231,103,76,0.12)]">
                  <div className="flex items-center gap-2 text-xs text-[color:var(--text-muted)]">
                    <span>活動度:</span>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
                      <span>少</span>
                      <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
                      <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                      <div className="w-3 h-3 bg-green-700 rounded-sm"></div>
                      <span>多</span>
                    </div>
                  </div>

                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-[color:var(--foreground)]">
                        {streakHeatmap.filter(day => day.intensity > 0).length}
                      </div>
                      <div className="text-xs text-[color:var(--text-muted)]">活動日</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-[color:var(--gt-primary)]">
                        {Math.round((streakHeatmap.filter(day => day.intensity > 0).length / 365) * 100)}%
                      </div>
                      <div className="text-xs text-[color:var(--text-muted)]">活動率</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-[color:var(--text-muted)] mx-auto mb-4 opacity-50" />
                <p className="text-[color:var(--text-muted)]">
                  ヒートマップデータがありません
                </p>
              </div>
            )}
          </div>

          {/* 部位配分推移グラフ */}
          <div className="gt-shell bg-[rgba(254,255,250,0.92)] backdrop-blur-xl border border-[rgba(231,103,76,0.18)] shadow-[0_20px_44px_-30px_rgba(189,101,78,0.46)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[color:var(--foreground)] flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[color:var(--gt-primary)]" />
                部位配分推移（過去12週間）
              </h3>
              {bodyPartProgression.length > 0 && (
                <div className="text-sm text-[color:var(--text-muted)]">
                  部位別トレーニング配分の変化
                </div>
              )}
            </div>

            {bodyPartProgression.length > 0 ? (
              <div>
                {/* トレンドグラフ */}
                <div className="mb-6 overflow-x-auto">
                  <div className="min-w-[800px] h-64 relative">
                    {/* 主要部位のトレンドライン */}
                    {(() => {
                      const mainBodyParts = ['胸', '背中', '脚', '肩', '腕']
                      const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']

                      return mainBodyParts.map((bodyPart, index) => {
                        const dataPoints = bodyPartProgression.map((week, weekIndex) => {
                          const percentage = week.bodyPartPercentages[bodyPart] || 0
                          return {
                            x: (weekIndex / (bodyPartProgression.length - 1)) * 100,
                            y: 100 - (percentage * 2), // 0-50%を画面の高さにマップ
                            percentage
                          }
                        })

                        const pathData = dataPoints
                          .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x}% ${point.y}%`)
                          .join(' ')

                        return (
                          <div key={bodyPart} className="absolute inset-0">
                            <svg className="w-full h-full">
                              <path
                                d={pathData}
                                stroke={colors[index]}
                                strokeWidth="2"
                                fill="none"
                                className="drop-shadow-sm"
                              />
                              {dataPoints.map((point, pointIndex) => (
                                <circle
                                  key={pointIndex}
                                  cx={`${point.x}%`}
                                  cy={`${point.y}%`}
                                  r="3"
                                  fill={colors[index]}
                                  className="hover:r-5 transition-all cursor-pointer"
                                  title={`${bodyPart}: ${point.percentage}%`}
                                />
                              ))}
                            </svg>
                          </div>
                        )
                      })
                    })()}

                    {/* 週ラベル */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-[color:var(--text-muted)]">
                      {bodyPartProgression.map((week, index) => (
                        <div key={index} className="text-center">
                          {week.weekLabel}
                        </div>
                      ))}
                    </div>

                    {/* Y軸ラベル */}
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-[color:var(--text-muted)] -ml-8">
                      <span>50%</span>
                      <span>25%</span>
                      <span>0%</span>
                    </div>
                  </div>
                </div>

                {/* 凡例と最新データ */}
                <div className="space-y-4">
                  {/* 凡例 */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {['胸', '背中', '脚', '肩', '腕'].map((bodyPart, index) => {
                      const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
                      const latestWeek = bodyPartProgression[bodyPartProgression.length - 1]
                      const percentage = latestWeek?.bodyPartPercentages[bodyPart] || 0

                      return (
                        <div key={bodyPart} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: colors[index] }}
                          />
                          <span className="text-[color:var(--foreground)]">{bodyPart}</span>
                          <span className="font-bold text-[color:var(--gt-primary)]">{percentage}%</span>
                        </div>
                      )
                    })}
                  </div>

                  {/* 配分バランス分析 */}
                  <div className="pt-4 border-t border-[rgba(231,103,76,0.12)]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-[color:var(--foreground)]">
                          {(() => {
                            const latestWeek = bodyPartProgression[bodyPartProgression.length - 1]
                            const percentages = Object.values(latestWeek?.bodyPartPercentages || {})
                            const variance = percentages.length > 0
                              ? Math.round(Math.sqrt(percentages.reduce((sum, p) => sum + Math.pow(p - 20, 2), 0) / percentages.length))
                              : 0
                            return variance
                          })()}
                        </div>
                        <div className="text-xs text-[color:var(--text-muted)]">バランス度</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-[color:var(--gt-primary)]">
                          {(() => {
                            const latestWeek = bodyPartProgression[bodyPartProgression.length - 1]
                            const maxPart = Object.entries(latestWeek?.bodyPartPercentages || {})
                              .sort(([,a], [,b]) => b - a)[0]
                            return maxPart ? maxPart[0] : '-'
                          })()}
                        </div>
                        <div className="text-xs text-[color:var(--text-muted)]">重点部位</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-[color:var(--foreground)]">
                          {bodyPartProgression.reduce((sum, week) => sum + week.totalVolume, 0).toLocaleString()}kg
                        </div>
                        <div className="text-xs text-[color:var(--text-muted)]">総ボリューム</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <PieChart className="w-12 h-12 text-[color:var(--text-muted)] mx-auto mb-4 opacity-50" />
                <p className="text-[color:var(--text-muted)]">
                  部位配分データがありません
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 統計概要カード */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-[rgba(254,255,250,0.96)] to-[rgba(231,103,76,0.08)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[color:var(--text-subtle)]">{getPeriodInfo().title}の訪問</span>
              <Activity className="w-5 h-5 text-[color:var(--gt-primary-strong)]" />
            </div>
            <div className="text-2xl font-bold text-[color:var(--foreground)]">{stats.periodVisits}回</div>
            <div className="text-xs text-[color:var(--text-muted)] mt-1">総計: {stats.totalVisits}回</div>
          </div>
          
          <div className="bg-gradient-to-br from-[rgba(254,255,250,0.96)] to-[rgba(231,103,76,0.06)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[color:var(--text-subtle)]">BIG3最大重量</span>
              <Flame className="w-5 h-5 text-[color:var(--gt-secondary-strong)]" />
            </div>
            <div className="text-2xl font-bold text-[color:var(--foreground)]">{big3Weights.benchPress + big3Weights.squat + big3Weights.deadlift}kg</div>
            <div className="text-xs text-[color:var(--text-muted)] mt-1">B{big3Weights.benchPress} S{big3Weights.squat} D{big3Weights.deadlift}</div>
          </div>
          
          <div className="bg-gradient-to-br from-[rgba(254,255,250,0.96)] to-[rgba(231,103,76,0.08)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[color:var(--text-subtle)]">{getPeriodInfo().title}の重量</span>
              <Dumbbell className="w-5 h-5 text-[color:var(--gt-secondary-strong)]" />
            </div>
            <div className="text-2xl font-bold text-[color:var(--foreground)]">{(stats.periodWeight/1000).toFixed(1)}t</div>
            <div className="text-xs text-[color:var(--text-muted)] mt-1">平均: {stats.periodVisits > 0 ? Math.round(stats.periodWeight / stats.periodVisits) : 0}kg/回</div>
          </div>
          
          <div className="bg-gradient-to-br from-[rgba(254,255,250,0.96)] to-[rgba(231,103,76,0.08)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[color:var(--text-subtle)]">{getPeriodInfo().title}の時間</span>
              <Clock className="w-5 h-5 text-[color:var(--gt-tertiary-strong)]" />
            </div>
            <div className="text-2xl font-bold text-[color:var(--foreground)]">{stats.periodDurationHours}時間</div>
            <div className="text-xs text-[color:var(--text-muted)] mt-1">平均: {(stats.periodAvgDurationMinutes / 60).toFixed(1)}時間/回</div>
          </div>

          <div className="bg-gradient-to-br from-[rgba(254,255,250,0.96)] to-[rgba(231,103,76,0.08)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[color:var(--text-subtle)]">連続日数</span>
              <Target className="w-5 h-5 text-[color:var(--gt-primary-strong)]" />
            </div>
            <div className="text-2xl font-bold text-[color:var(--foreground)]">{stats.currentStreak}日</div>
            <div className="text-xs text-[color:var(--text-muted)] mt-1">最長: {stats.longestStreak}日</div>
          </div>
        </div>

        {/* メイン統計セクション */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gym Rankings */}
            <div className="gt-card p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[color:var(--gt-primary-strong)]" />
                よく行くジム TOP5
              </h3>
              <div className="space-y-3">
                {gymRankings.map((gym, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-[rgba(254,255,250,0.98)] rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[rgba(231,103,76,0.14)] text-[color:var(--gt-primary-strong)] rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-[color:var(--foreground)]">{gym.name}</div>
                        <div className="text-xs text-[color:var(--text-muted)]">最終訪問: {gym.lastVisit}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[color:var(--foreground)]">{gym.visits}回</div>
                      <div className="text-xs text-[color:var(--text-muted)]">{gym.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Exercise Frequency Ranking */}
            <div className="gt-card p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[color:var(--gt-primary-strong)]" />
                種目別頻度 TOP5
              </h3>
              {exerciseRanking.length > 0 ? (
                <div className="space-y-3">
                  {exerciseRanking.map((exercise, index) => (
                    <div key={exercise.name} className="flex items-center justify-between p-3 bg-[rgba(254,255,250,0.92)] rounded-lg hover:bg-[rgba(254,255,250,0.96)] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0 ? 'bg-gradient-to-r from-accent to-accent-secondary text-[color:var(--gt-on-primary)]' :
                          index === 1 ? 'bg-[rgba(231,103,76,0.2)] text-[color:var(--gt-primary-strong)]' :
                          index === 2 ? 'bg-[rgba(231,103,76,0.15)] text-[color:var(--gt-primary)]' :
                          'bg-[rgba(231,103,76,0.08)] text-[color:var(--text-subtle)]'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-[color:var(--foreground)]">{exercise.name}</div>
                          <div className="text-xs text-[color:var(--text-muted)]">最大: {exercise.maxWeight}kg</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[color:var(--gt-primary-strong)]">{exercise.count}回</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[color:var(--text-muted)]">
                  データがありません
                </div>
              )}
            </div>

            {/* Weekly Pattern */}
            <div className="gt-card p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[color:var(--gt-secondary-strong)]" />
                曜日別パターン
              </h3>
              <div className="space-y-3">
                {weeklyPattern.map((day) => (
                  <div key={day.day} className="flex items-center gap-3">
                    <div className="w-8 text-center font-medium text-[color:var(--text-subtle)]">{day.day}</div>
                    <div className="flex-1">
                      <div className="relative h-8 bg-[rgba(254,255,250,0.92)] rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent to-accent-secondary rounded-full"
                          style={{ width: `${Math.min(100, (day.visits / Math.max(...weeklyPattern.map((d: any) => d.visits)) * 100))}%` }}
                        />
                        <div className="absolute inset-0 flex items-center px-3">
                          <span className="text-xs font-medium text-[color:var(--text-subtle)]">
                            {day.visits}回
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-[color:var(--text-muted)]">
                      平均: {day.avg}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Distribution */}
            <div className="gt-card p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[color:var(--gt-tertiary-strong)]" />
                時間帯分布
              </h3>
              <div className="space-y-3">
                {timeDistribution.map((time) => (
                  <div key={time.time} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-[color:var(--text-subtle)] w-28">{time.time}</div>
                      <div className="flex-1">
                        <div className="relative h-6 bg-[rgba(254,255,250,0.92)] rounded-full overflow-hidden">
                          <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent-secondary to-accent-tertiary rounded-full"
                            style={{ width: `${time.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-[color:var(--foreground)] w-12 text-right">
                      {time.visits}回
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Period Comparison Cards */}
            <div className="gt-card p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[color:var(--gt-primary-strong)]" />
                前回比較
                <span className="text-xs bg-[rgba(231,103,76,0.14)] text-[color:var(--gt-primary-strong)] px-1.5 py-0.5 rounded-full font-medium">
                  {periodComparison.period === 'week' ? '前週比' : periodComparison.period === 'month' ? '前月比' : '前年比'}
                </span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Visits Comparison */}
                <div className="bg-[rgba(254,255,250,0.92)] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[color:var(--foreground)]">訪問回数</span>
                    <div className="flex items-center gap-1">
                      {periodComparison.changes.visits > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : periodComparison.changes.visits < 0 ? (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                      <span className={`text-sm font-bold ${
                        periodComparison.changes.visits > 0 ? 'text-green-500' :
                        periodComparison.changes.visits < 0 ? 'text-red-500' :
                        'text-[color:var(--text-muted)]'
                      }`}>
                        {periodComparison.changes.visits > 0 ? '+' : ''}{periodComparison.changes.visits}%
                      </span>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-[color:var(--gt-primary-strong)] mb-1">
                    {periodComparison.current.visits}回
                  </div>
                  <div className="text-xs text-[color:var(--text-muted)]">
                    前回: {periodComparison.previous.visits}回
                  </div>
                </div>

                {/* Volume Comparison */}
                <div className="bg-[rgba(254,255,250,0.92)] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[color:var(--foreground)]">総ボリューム</span>
                    <div className="flex items-center gap-1">
                      {periodComparison.changes.volume > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : periodComparison.changes.volume < 0 ? (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                      <span className={`text-sm font-bold ${
                        periodComparison.changes.volume > 0 ? 'text-green-500' :
                        periodComparison.changes.volume < 0 ? 'text-red-500' :
                        'text-[color:var(--text-muted)]'
                      }`}>
                        {periodComparison.changes.volume > 0 ? '+' : ''}{periodComparison.changes.volume}%
                      </span>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-[color:var(--gt-secondary-strong)] mb-1">
                    {(periodComparison.current.volume/1000).toFixed(1)}t
                  </div>
                  <div className="text-xs text-[color:var(--text-muted)]">
                    前回: {(periodComparison.previous.volume/1000).toFixed(1)}t
                  </div>
                </div>

                {/* Time Comparison */}
                <div className="bg-[rgba(254,255,250,0.92)] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[color:var(--foreground)]">総時間</span>
                    <div className="flex items-center gap-1">
                      {periodComparison.changes.time > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : periodComparison.changes.time < 0 ? (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                      <span className={`text-sm font-bold ${
                        periodComparison.changes.time > 0 ? 'text-green-500' :
                        periodComparison.changes.time < 0 ? 'text-red-500' :
                        'text-[color:var(--text-muted)]'
                      }`}>
                        {periodComparison.changes.time > 0 ? '+' : ''}{periodComparison.changes.time}%
                      </span>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-[color:var(--gt-tertiary-strong)] mb-1">
                    {Math.round(periodComparison.current.time/60*10)/10}時間
                  </div>
                  <div className="text-xs text-[color:var(--text-muted)]">
                    前回: {Math.round(periodComparison.previous.time/60*10)/10}時間
                  </div>
                </div>
              </div>

              {/* Summary Message */}
              <div className="mt-4 text-xs text-center text-[color:var(--text-muted)] bg-[rgba(254,255,250,0.92)] p-2 rounded-lg">
                {(() => {
                  const improvements = [periodComparison.changes.visits, periodComparison.changes.volume, periodComparison.changes.time].filter(change => change > 0).length
                  const declines = [periodComparison.changes.visits, periodComparison.changes.volume, periodComparison.changes.time].filter(change => change < 0).length

                  if (improvements >= 2) {
                    return "📈 前回より向上している項目が多いです！"
                  } else if (declines >= 2) {
                    return "📉 前回より下がっている項目があります。次回頑張りましょう！"
                  } else {
                    return "➡️ 前回とほぼ同等のパフォーマンスです。"
                  }
                })()}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Weekly Goal Progress */}
            <div className="gt-card p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-[color:var(--gt-primary-strong)]" />
                週間目標達成度
              </h3>

              {/* Overall Progress Ring */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32">
                  {/* Background Ring */}
                  <svg className="absolute inset-0 transform -rotate-90" width="128" height="128" viewBox="0 0 128 128">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="rgba(231,103,76,0.1)"
                      strokeWidth="8"
                    />
                    {/* Progress Ring */}
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="url(#goalGradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(weeklyGoals.overallProgress / 100) * 351.86} 351.86`}
                      className="transition-all duration-500 ease-out"
                    />
                    <defs>
                      <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--gt-primary)" />
                        <stop offset="100%" stopColor="var(--gt-secondary)" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Center Content */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[color:var(--gt-primary-strong)]">{weeklyGoals.overallProgress}%</div>
                      <div className="text-xs text-[color:var(--text-muted)]">達成度</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Goal Details */}
              <div className="space-y-4">
                {/* Visits Goal */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[color:var(--foreground)]">週間訪問</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-[color:var(--gt-primary-strong)]">{weeklyGoals.weeklyVisits.current}</span>
                      <span className="text-xs text-[color:var(--text-muted)]">/{weeklyGoals.weeklyVisits.target}回</span>
                    </div>
                  </div>
                  <div className="relative h-2 bg-[rgba(254,255,250,0.92)] rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-[color:var(--gt-primary)] to-[color:var(--gt-secondary)] rounded-full transition-all duration-300"
                      style={{ width: `${weeklyGoals.weeklyVisits.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Time Goal */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[color:var(--foreground)]">週間時間</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-[color:var(--gt-secondary-strong)]">{Math.round(weeklyGoals.weeklyTime.current/60*10)/10}</span>
                      <span className="text-xs text-[color:var(--text-muted)]">/{Math.round(weeklyGoals.weeklyTime.target/60*10)/10}時間</span>
                    </div>
                  </div>
                  <div className="relative h-2 bg-[rgba(254,255,250,0.92)] rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-[color:var(--gt-secondary)] to-[color:var(--gt-tertiary)] rounded-full transition-all duration-300"
                      style={{ width: `${weeklyGoals.weeklyTime.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Volume Goal */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[color:var(--foreground)]">週間ボリューム</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-[color:var(--gt-tertiary-strong)]">{(weeklyGoals.weeklyVolume.current/1000).toFixed(1)}</span>
                      <span className="text-xs text-[color:var(--text-muted)]">/{(weeklyGoals.weeklyVolume.target/1000).toFixed(1)}t</span>
                    </div>
                  </div>
                  <div className="relative h-2 bg-[rgba(254,255,250,0.92)] rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-[color:var(--gt-tertiary)] to-[color:var(--gt-primary)] rounded-full transition-all duration-300"
                      style={{ width: `${weeklyGoals.weeklyVolume.percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Motivation Message */}
              <div className="mt-4 text-xs text-center text-[color:var(--text-muted)] bg-[rgba(254,255,250,0.92)] p-2 rounded-lg">
                {weeklyGoals.overallProgress >= 100 ?
                  "🎉 今週の目標達成おめでとうございます！" :
                  weeklyGoals.overallProgress >= 75 ?
                  "💪 あと少しで目標達成です！" :
                  weeklyGoals.overallProgress >= 50 ?
                  "🔥 順調に進んでいます！" :
                  "📈 今週も頑張りましょう！"
                }
              </div>
            </div>

            {/* Recent Visits */}
            <div className="gt-card p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[color:var(--gt-secondary-strong)]" />
                最近の訪問
              </h3>
              <div className="space-y-3">
                {recentVisits.map((visit) => (
                  <div key={visit.id} className="border-l-4 border-[color:var(--gt-primary-strong)] pl-3 py-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-sm text-[color:var(--foreground)]">{visit.gymName}</div>
                        <div className="text-xs text-[color:var(--text-muted)] mt-1">{visit.date}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-[color:var(--text-muted)]">{visit.duration}</span>
                          <span className={`text-xs ${getCrowdColor(visit.crowd)}`}>
                            {getCrowdIcon(visit.crowd)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[rgba(231,103,76,0.32)]" />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {visit.exercises.slice(0, 2).map((exercise, i) => (
                        <span key={i} className="px-2 py-0.5 bg-[rgba(254,255,250,0.92)] text-[color:var(--text-subtle)] text-xs rounded-full">
                          {exercise}
                        </span>
                      ))}
                      {visit.exercises.length > 2 && (
                        <span className="px-2 py-0.5 bg-[rgba(254,255,250,0.92)] text-[color:var(--text-subtle)] text-xs rounded-full">
                          +{visit.exercises.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 bg-[rgba(254,255,250,0.92)] text-[color:var(--text-subtle)] rounded-lg text-sm font-medium hover:bg-[rgba(254,255,250,0.98)] transition-colors">
                すべて見る
              </button>
            </div>

            {/* Body Part Breakdown */}
            <div className="gt-card p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[color:var(--gt-primary-strong)]" />
                部位別内訳
              </h3>
              {bodyPartBreakdown.length > 0 ? (
                <div className="space-y-4">
                  {/* Simple donut chart representation */}
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-8 border-[rgba(254,255,250,0.92)]"></div>
                    {bodyPartBreakdown.slice(0, 5).map((part, index) => {
                      const colors = [
                        'border-[color:var(--gt-primary)]',
                        'border-[color:var(--gt-secondary)]',
                        'border-[color:var(--gt-tertiary)]',
                        'border-[rgba(231,103,76,0.6)]',
                        'border-[rgba(231,103,76,0.4)]'
                      ]
                      return (
                        <div
                          key={part.name}
                          className={`absolute inset-0 rounded-full border-8 ${colors[index]}`}
                          style={{
                            clipPath: `polygon(50% 50%, 50% 0%, ${50 + part.percentage/2}% 0%, 50% 50%)`
                          }}
                        />
                      )
                    })}
                    <div className="absolute inset-4 bg-[rgba(254,255,250,0.96)] rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-[color:var(--foreground)]">部位別</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="space-y-2">
                    {bodyPartBreakdown.slice(0, 5).map((part, index) => {
                      const colors = [
                        'bg-[color:var(--gt-primary)]',
                        'bg-[color:var(--gt-secondary)]',
                        'bg-[color:var(--gt-tertiary)]',
                        'bg-[rgba(231,103,76,0.6)]',
                        'bg-[rgba(231,103,76,0.4)]'
                      ]
                      return (
                        <div key={part.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${colors[index]}`}></div>
                            <span className="text-sm text-[color:var(--foreground)]">{part.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-[color:var(--gt-primary-strong)]">{part.percentage}%</div>
                            <div className="text-xs text-[color:var(--text-muted)]">{(part.volume/1000).toFixed(1)}t</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-[color:var(--text-muted)]">
                  データがありません
                </div>
              )}
            </div>

            {/* Estimated Calories (B-level confidence) */}
            <div className="gt-card p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-[color:var(--gt-secondary-strong)]" />
                推定消費カロリー
                <span className="text-xs bg-[rgba(231,103,76,0.14)] text-[color:var(--gt-primary-strong)] px-1.5 py-0.5 rounded-full font-medium">B確度</span>
              </h3>
              {estimatedCalories.totalCalories > 0 ? (
                <div className="space-y-4">
                  {/* Total Calories Display */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[color:var(--gt-primary-strong)] mb-1">
                      {estimatedCalories.totalCalories}
                    </div>
                    <div className="text-sm text-[color:var(--text-muted)]">kcal</div>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[color:var(--foreground)]">METs基準</span>
                      <div className="text-right">
                        <div className="font-bold text-[color:var(--gt-secondary-strong)]">{estimatedCalories.metsCalories}kcal</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[color:var(--foreground)]">ボリューム基準</span>
                      <div className="text-right">
                        <div className="font-bold text-[color:var(--gt-tertiary-strong)]">{estimatedCalories.volumeCalories}kcal</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[rgba(231,103,76,0.18)]">
                      <div className="flex items-center justify-between text-xs text-[color:var(--text-muted)]">
                        <span>推定時間</span>
                        <span>{estimatedCalories.estimatedTimeMinutes}分</span>
                      </div>
                    </div>
                  </div>

                  {/* Estimation Note */}
                  <div className="text-xs text-[color:var(--text-muted)] bg-[rgba(254,255,250,0.92)] p-2 rounded-lg">
                    ※ 体重70kg、筋トレMETs6.0で推定。実際の消費量とは異なる場合があります。
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-[color:var(--text-muted)]">
                  データがありません
                </div>
              )}
            </div>

            {/* Equipment Breakdown */}
            <div className="gt-card p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-[color:var(--gt-secondary-strong)]" />
                器具タイプ内訳
              </h3>
              {equipmentBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {equipmentBreakdown.slice(0, 5).map((equipment, index) => (
                    <div key={equipment.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[color:var(--foreground)]">{equipment.name}</span>
                        <div className="text-right">
                          <div className="text-sm font-bold text-[color:var(--gt-secondary-strong)]">{equipment.volumePercentage}%</div>
                          <div className="text-xs text-[color:var(--text-muted)]">{equipment.setCount}セット</div>
                        </div>
                      </div>
                      <div className="relative h-2 bg-[rgba(254,255,250,0.92)] rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[color:var(--gt-secondary)] to-[color:var(--gt-tertiary)] rounded-full transition-all duration-300"
                          style={{ width: `${equipment.volumePercentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-[color:var(--text-muted)]">
                        <span>ボリューム: {(equipment.volume/1000).toFixed(1)}t</span>
                        <span>セット比: {equipment.setPercentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[color:var(--text-muted)]">
                  データがありません
                </div>
              )}
            </div>

            {/* Personal Records */}
            <div className="gt-card p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[color:var(--gt-tertiary-strong)]" />
                パーソナルレコード
              </h3>
              {personalRecords.length > 0 ? (
                <div className="space-y-3">
                  {personalRecords.slice(0, 6).map((record, index) => (
                    <div key={`${record.exercise}-${index}`} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[color:var(--foreground)]">{record.exercise}</div>
                        <div className="text-xs text-[color:var(--text-muted)]">{record.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[color:var(--gt-primary-strong)]">{record.weight}kg</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[color:var(--text-muted)]">
                  記録がありません
                </div>
              )}
            </div>


          </div>
        </div>
      </main>
      </div>
    </div>
  )
}
