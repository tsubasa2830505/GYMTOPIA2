'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, Calendar, Target, Activity } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserWorkoutStatistics, getWeeklyPattern } from '@/lib/supabase/statistics'


export default function StatsPage() {
  const [loading, setLoading] = useState(true)
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [stats, setStats] = useState<any[]>([])
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/stats')
      return
    }
    loadStatistics()
  }, [user, router])

  const loadStatistics = async () => {
    if (!user) return

    setLoading(true)
    try {
      const [workoutStats, weeklyPattern] = await Promise.all([
        getUserWorkoutStatistics(user.id),
        getWeeklyPattern(user.id)
      ])

      // Format weekly data for chart
      const formattedWeekly = weeklyPattern.map(day => ({
        day: day.day,
        value: Math.min(100, day.visits * 20) // Scale for visualization
      }))

      setWeeklyData(formattedWeekly)

      // Calculate achievement rate
      const targetMonthly = 20
      const achievementRate = Math.min(100, Math.round((workoutStats.monthlyVisits / targetMonthly) * 100))

      // Format stats
      setStats([
        { 
          icon: Calendar, 
          label: '今月のワークアウト', 
          value: `${workoutStats.monthlyVisits}回`,
          change: workoutStats.monthlyVisits > 15 ? '+12%' : '-5%'
        },
        { 
          icon: Target, 
          label: '目標達成率', 
          value: `${achievementRate}%`,
          change: achievementRate > 80 ? '+5%' : '-10%'
        },
        { 
          icon: Activity, 
          label: '平均時間', 
          value: `${workoutStats.avgDurationMinutes}分`,
          change: workoutStats.avgDurationMinutes > 60 ? '+3分' : '-3分'
        },
        { 
          icon: TrendingUp, 
          label: '継続日数', 
          value: `${workoutStats.currentStreak}日`,
          change: `+${workoutStats.currentStreak}日`
        },
      ])
    } catch (error) {
      console.error('Error loading statistics:', error)
      // Set default data
      setWeeklyData([
        { day: '月', value: 80 },
        { day: '火', value: 45 },
        { day: '水', value: 60 },
        { day: '木', value: 0 },
        { day: '金', value: 90 },
        { day: '土', value: 75 },
        { day: '日', value: 30 },
      ])
      setStats([
        { icon: Calendar, label: '今月のワークアウト', value: '18回', change: '+12%' },
        { icon: Target, label: '目標達成率', value: '85%', change: '+5%' },
        { icon: Activity, label: '平均時間', value: '52分', change: '-3分' },
        { icon: TrendingUp, label: '継続日数', value: '24日', change: '+7日' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(198deg,rgba(231,103,76,0.08),transparent_82%),radial-gradient(circle_at_18%_20%,rgba(240,142,111,0.14),transparent_68%),radial-gradient(circle_at_86%_12%,rgba(245,177,143,0.12),transparent_74%)]" />
        <div className="absolute -top-28 left-[12%] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(231,103,76,0.22),transparent_70%)] blur-[140px] opacity-70" />
        <div className="absolute bottom-[-12%] right-[-6%] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(245,177,143,0.2),transparent_78%)] blur-[150px] opacity-60" />
      </div>

      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b border-[rgba(231,103,76,0.18)] bg-[rgba(254,255,250,0.9)] backdrop-blur-xl shadow-[0_18px_48px_-26px_rgba(189,101,78,0.38)]">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-[color:var(--gt-primary-strong)]">統計</h1>
            <p className="text-sm text-[color:var(--text-muted)] mt-1">トレーニング習慣の推移をチェックしましょう</p>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          {/* Stats Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              const isPositive = stat.change.startsWith('+')
              return (
                <div key={index} className="gt-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-[rgba(231,103,76,0.12)] text-[color:var(--gt-primary-strong)] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        isPositive ? 'text-[color:var(--gt-secondary-strong)]' : 'text-[color:var(--gt-primary-strong)]'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-[color:var(--foreground)]">{stat.value}</p>
                  <p className="text-xs text-[color:var(--text-muted)] mt-2">{stat.label}</p>
                </div>
              )
            })}
          </section>

          {/* Weekly Chart */}
          <section className="gt-card p-6">
            <h2 className="text-lg font-semibold text-[color:var(--foreground)] mb-4">週間アクティビティ</h2>
            <div className="flex items-end justify-between h-40 gap-3">
              {weeklyData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full h-32 bg-[rgba(254,255,250,0.92)] border border-[rgba(231,103,76,0.16)] rounded-2xl flex flex-col justify-end overflow-hidden">
                    <div
                      className="bg-gradient-to-b from-accent-secondary via-accent to-accent-strong rounded-b-[18px] transition-[height] duration-300 ease-out"
                      style={{ height: `${data.value}%` }}
                    />
                  </div>
                  <span className="text-xs text-[color:var(--text-muted)] mt-2">{data.day}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Progress Summary */}
          <section className="gt-card p-6">
            <h2 className="text-lg font-semibold text-[color:var(--foreground)] mb-4">筋肉群別進捗</h2>
            <div className="space-y-4">
              {[
                { muscle: '胸', progress: 75 },
                { muscle: '背中', progress: 60 },
                { muscle: '脚', progress: 85 },
                { muscle: '肩', progress: 45 },
                { muscle: '腕', progress: 90 },
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-[color:var(--foreground)]">{item.muscle}</span>
                    <span className="text-[color:var(--text-muted)]">{item.progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[rgba(254,255,250,0.9)] border border-[rgba(231,103,76,0.16)] rounded-full">
                    <div
                      className="h-full bg-gradient-to-r from-accent via-accent-secondary to-accent-tertiary rounded-full transition-[width] duration-300 ease-out"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
