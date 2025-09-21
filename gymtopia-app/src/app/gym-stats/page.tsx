'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, TrendingUp, Calendar, Clock, MapPin,
  Activity, Award,
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
    avgDurationMinutes: 0
  })

  const [gymRankings, setGymRankings] = useState<GymRanking[]>([])
  const [recentVisits, setRecentVisits] = useState<GymVisit[]>([])
  const [weeklyPattern, setWeeklyPattern] = useState<any[]>([])
  const [timeDistribution, setTimeDistribution] = useState<any[]>([])
  const [achievements, setAchievements] = useState<any[]>([])

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
        achievementData
      ] = await Promise.all([
        getUserWorkoutStatistics(user.id),
        getGymVisitRankings(user.id, 5, selectedPeriod),
        getRecentGymVisits(user.id, 5, selectedPeriod),
        getWeeklyPattern(user.id),
        getTimeDistribution(user.id),
        getAchievementProgress(user.id)
      ])

      console.log('📈 Statistics loaded successfully:', {
        totalVisits: userStats.totalVisits,
        weeklyVisits: userStats.weeklyVisits,
        monthlyVisits: userStats.monthlyVisits,
        yearlyVisits: userStats.yearlyVisits,
        totalWeight: userStats.totalWeight,
        currentStreak: userStats.currentStreak
      })

      setStats(userStats)
      setGymRankings(rankings)
      setRecentVisits(visits)
      setWeeklyPattern(pattern)
      setTimeDistribution(timeDist)
      setAchievements(achievementData)
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
        avgDurationMinutes: 0
      })
      setGymRankings([])
      setRecentVisits([])
      setWeeklyPattern([])
      setTimeDistribution([])
      setAchievements([])
    } finally {
      setLoading(false)
    }
  }

  // Get period-specific visits
  const getPeriodVisits = () => {
    switch(selectedPeriod) {
      case 'week': return stats.weeklyVisits
      case 'month': return stats.monthlyVisits
      case 'year': return stats.yearlyVisits
      default: return stats.totalVisits
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
              {getPeriodVisits()}回
            </span>
          </div>
          
          {/* Period Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === 'week' 
                  ? 'bg-gradient-to-r from-accent to-accent-secondary text-[color:var(--gt-on-primary)] shadow-[0_12px_30px_-18px_rgba(189,101,78,0.46)]' 
                  : 'bg-[rgba(254,255,250,0.92)] text-[color:var(--text-subtle)] hover:bg-[rgba(254,255,250,0.96)]'
              }`}
            >
              週
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === 'month' 
                  ? 'bg-gradient-to-r from-accent to-accent-secondary text-[color:var(--gt-on-primary)] shadow-[0_12px_30px_-18px_rgba(189,101,78,0.46)]' 
                  : 'bg-[rgba(254,255,250,0.92)] text-[color:var(--text-subtle)] hover:bg-[rgba(254,255,250,0.96)]'
              }`}
            >
              月
            </button>
            <button
              onClick={() => setSelectedPeriod('year')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === 'year' 
                  ? 'bg-gradient-to-r from-accent to-accent-secondary text-[color:var(--gt-on-primary)] shadow-[0_12px_30px_-18px_rgba(189,101,78,0.46)]' 
                  : 'bg-[rgba(254,255,250,0.92)] text-[color:var(--text-subtle)] hover:bg-[rgba(254,255,250,0.96)]'
              }`}
            >
              年
            </button>
          </div>
          </div>
        </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-[rgba(254,255,250,0.96)] to-[rgba(231,103,76,0.08)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[color:var(--text-subtle)]">総訪問回数</span>
              <Activity className="w-5 h-5 text-[color:var(--gt-primary-strong)]" />
            </div>
            <div className="text-2xl font-bold text-[color:var(--foreground)]">{stats.totalVisits}回</div>
            <div className="text-xs text-[color:var(--text-muted)] mt-1">月平均: {stats.monthlyVisits}回</div>
          </div>
          
          <div className="bg-gradient-to-br from-[rgba(254,255,250,0.96)] to-[rgba(231,103,76,0.06)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[color:var(--text-subtle)]">現在の連続記録</span>
              <Flame className="w-5 h-5 text-[color:var(--gt-secondary-strong)]" />
            </div>
            <div className="text-2xl font-bold text-[color:var(--foreground)]">{stats.currentStreak}日</div>
            <div className="text-xs text-[color:var(--text-muted)] mt-1">最長: {stats.longestStreak}日</div>
          </div>
          
          <div className="bg-gradient-to-br from-[rgba(254,255,250,0.96)] to-[rgba(231,103,76,0.08)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[color:var(--text-subtle)]">総重量</span>
              <Dumbbell className="w-5 h-5 text-[color:var(--gt-secondary-strong)]" />
            </div>
            <div className="text-2xl font-bold text-[color:var(--foreground)]">{(stats.totalWeight/1000).toFixed(1)}t</div>
            <div className="text-xs text-[color:var(--text-muted)] mt-1">平均: {stats.totalVisits > 0 ? Math.round(stats.totalWeight / stats.totalVisits) : 0}kg/回</div>
          </div>
          
          <div className="bg-gradient-to-br from-[rgba(254,255,250,0.96)] to-[rgba(231,103,76,0.08)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[color:var(--text-subtle)]">総時間</span>
              <Clock className="w-5 h-5 text-[color:var(--gt-tertiary-strong)]" />
            </div>
            <div className="text-2xl font-bold text-[color:var(--foreground)]">{stats.totalDurationHours}時間</div>
            <div className="text-xs text-[color:var(--text-muted)] mt-1">平均: {(stats.avgDurationMinutes / 60).toFixed(1)}時間/回</div>
          </div>
        </div>

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
          </div>

          {/* Right Column */}
          <div className="space-y-6">
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

            {/* Achievement Progress */}
            <div className="gt-card p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[color:var(--gt-tertiary-strong)]" />
                達成間近
              </h3>
              <div className="space-y-3">
                {achievements.map((achievement: any, index: number) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[color:var(--text-subtle)]">{achievement.name}</span>
                      <span className="text-xs text-[color:var(--text-muted)]">
                        {Math.round(achievement.current)}/{achievement.target}
                      </span>
                    </div>
                    <div className="h-2 bg-[rgba(254,255,250,0.92)] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-accent to-accent-secondary rounded-full" 
                        style={{ width: `${achievement.percentage}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Training Tips */}
            <div className="bg-gradient-to-br from-[rgba(254,255,250,0.96)] to-[rgba(231,103,76,0.08)] rounded-xl p-6">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-[color:var(--foreground)]">
                <TrendingUp className="w-5 h-5 text-[color:var(--gt-tertiary-strong)]" />
                インサイト
              </h3>
              <div className="space-y-2 text-sm text-[color:var(--text-subtle)]">
                {weeklyPattern.length > 0 && (
                  <p>• {weeklyPattern.reduce((max: any, day: any) => day.visits > max.visits ? day : max, weeklyPattern[0]).day}曜日の訪問が最も多いです</p>
                )}
                {timeDistribution.length > 0 && (
                  <p>• {timeDistribution.reduce((max: any, time: any) => time.percentage > max.percentage ? time : max, timeDistribution[0]).time}が{timeDistribution[0].percentage}%を占めています</p>
                )}
                {gymRankings.length > 0 && (
                  <p>• {gymRankings[0].name}が最頻訪問ジムです</p>
                )}
                <p>• 平均滞在時間は{(stats.avgDurationMinutes / 60).toFixed(1)}時間です</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  )
}
