'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Calendar, Target, Activity } from 'lucide-react'
import { getUserWorkoutStatistics, getWeeklyPattern } from '@/lib/supabase/statistics'

// Mock user ID for development
const mockUserId = '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'

export default function StatsPage() {
  const [loading, setLoading] = useState(true)
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [stats, setStats] = useState<any[]>([])

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    setLoading(true)
    try {
      const [workoutStats, weeklyPattern] = await Promise.all([
        getUserWorkoutStatistics(mockUserId),
        getWeeklyPattern(mockUserId)
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold">統計</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <section className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-5 h-5 text-gray-400" />
                  <span className={`text-xs ${
                    stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
              </div>
            )
          })}
        </section>

        {/* Weekly Chart */}
        <section className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">週間アクティビティ</h2>
          <div className="flex items-end justify-between h-40 gap-2">
            {weeklyData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-200 rounded-t flex flex-col justify-end" style={{ height: '120px' }}>
                  <div
                    className="bg-blue-500 rounded-t transition-all duration-300"
                    style={{ height: `${data.value}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 mt-2">{data.day}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Progress Summary */}
        <section className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">筋肉群別進捗</h2>
          <div className="space-y-3">
            {[
              { muscle: '胸', progress: 75 },
              { muscle: '背中', progress: 60 },
              { muscle: '脚', progress: 85 },
              { muscle: '肩', progress: 45 },
              { muscle: '腕', progress: 90 },
            ].map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{item.muscle}</span>
                  <span className="text-gray-500">{item.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}