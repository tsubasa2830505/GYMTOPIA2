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
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [loading, setLoading] = useState(true)
  
  // Use mock user ID for development
  const userId = '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'

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
    loadStatistics()
  }, [selectedPeriod])

  const loadStatistics = async () => {
    setLoading(true)
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
        getUserWorkoutStatistics(userId),
        getGymVisitRankings(userId),
        getRecentGymVisits(userId),
        getWeeklyPattern(userId),
        getTimeDistribution(userId),
        getAchievementProgress(userId)
      ])

      setStats(userStats)
      setGymRankings(rankings)
      setRecentVisits(visits)
      setWeeklyPattern(pattern)
      setTimeDistribution(timeDist)
      setAchievements(achievementData)
    } catch (error) {
      console.error('Error loading statistics:', error)
      // Set default data if error
      setStats({
        totalVisits: 108,
        currentStreak: 5,
        longestStreak: 23,
        totalWeight: 145680,
        totalDurationHours: 162,
        monthlyVisits: 9,
        weeklyVisits: 3,
        yearlyVisits: 108,
        avgDurationMinutes: 90
      })
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
      case 'empty': return 'text-green-600'
      case 'crowded': return 'text-red-600'
      default: return 'text-yellow-600'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">統計データを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-slate-900">ジム通い統計</h1>
            <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full font-medium">
              {getPeriodVisits()}回
            </span>
          </div>
          
          {/* Period Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === 'week' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              週
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === 'month' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              月
            </button>
            <button
              onClick={() => setSelectedPeriod('year')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === 'year' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              年
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-700">総訪問回数</span>
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.totalVisits}回</div>
            <div className="text-xs text-slate-600 mt-1">月平均: {stats.monthlyVisits}回</div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-700">現在の連続記録</span>
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.currentStreak}日</div>
            <div className="text-xs text-slate-600 mt-1">最長: {stats.longestStreak}日</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-700">総重量</span>
              <Dumbbell className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{(stats.totalWeight/1000).toFixed(1)}t</div>
            <div className="text-xs text-slate-600 mt-1">平均: {stats.totalVisits > 0 ? Math.round(stats.totalWeight / stats.totalVisits) : 0}kg/回</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-700">総時間</span>
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.totalDurationHours}時間</div>
            <div className="text-xs text-slate-600 mt-1">平均: {(stats.avgDurationMinutes / 60).toFixed(1)}時間/回</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gym Rankings */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                よく行くジム TOP5
              </h3>
              <div className="space-y-3">
                {gymRankings.map((gym, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{gym.name}</div>
                        <div className="text-xs text-slate-600">最終訪問: {gym.lastVisit}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">{gym.visits}回</div>
                      <div className="text-xs text-slate-600">{gym.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Pattern */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-500" />
                曜日別パターン
              </h3>
              <div className="space-y-3">
                {weeklyPattern.map((day) => (
                  <div key={day.day} className="flex items-center gap-3">
                    <div className="w-8 text-center font-medium text-slate-700">{day.day}</div>
                    <div className="flex-1">
                      <div className="relative h-8 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                          style={{ width: `${Math.min(100, (day.visits / Math.max(...weeklyPattern.map((d: any) => d.visits)) * 100))}%` }}
                        />
                        <div className="absolute inset-0 flex items-center px-3">
                          <span className="text-xs font-medium text-slate-700">
                            {day.visits}回
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600">
                      平均: {day.avg}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Distribution */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" />
                時間帯分布
              </h3>
              <div className="space-y-3">
                {timeDistribution.map((time) => (
                  <div key={time.time} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-slate-700 w-28">{time.time}</div>
                      <div className="flex-1">
                        <div className="relative h-6 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
                            style={{ width: `${time.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-slate-900 w-12 text-right">
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
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-orange-500" />
                最近の訪問
              </h3>
              <div className="space-y-3">
                {recentVisits.map((visit) => (
                  <div key={visit.id} className="border-l-4 border-blue-500 pl-3 py-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-sm text-slate-900">{visit.gymName}</div>
                        <div className="text-xs text-slate-600 mt-1">{visit.date}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-600">{visit.duration}</span>
                          <span className={`text-xs ${getCrowdColor(visit.crowd)}`}>
                            {getCrowdIcon(visit.crowd)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {visit.exercises.slice(0, 2).map((exercise, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-full">
                          {exercise}
                        </span>
                      ))}
                      {visit.exercises.length > 2 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-full">
                          +{visit.exercises.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
                すべて見る
              </button>
            </div>

            {/* Achievement Progress */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                達成間近
              </h3>
              <div className="space-y-3">
                {achievements.map((achievement: any, index: number) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-700">{achievement.name}</span>
                      <span className="text-xs text-slate-600">
                        {Math.round(achievement.current)}/{achievement.target}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full" 
                        style={{ width: `${achievement.percentage}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Training Tips */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-slate-900">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                インサイト
              </h3>
              <div className="space-y-2 text-sm text-slate-700">
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
  )
}