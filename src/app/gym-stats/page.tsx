'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, TrendingUp, Calendar, Clock, MapPin, 
  Activity, Target, Award, BarChart3, Users, 
  Dumbbell, Flame, ChevronRight
} from 'lucide-react'

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
  const [selectedMetric, setSelectedMetric] = useState<'visits' | 'weight' | 'duration'>('visits')

  // ダミーデータ
  const totalVisits = 108
  const currentStreak = 5
  const longestStreak = 23
  const totalWeight = 145680 // kg
  const totalDuration = 162 // hours

  const gymRankings: GymRanking[] = [
    { name: 'ハンマーストレングス渋谷', visits: 45, percentage: 41.7, lastVisit: '2日前' },
    { name: 'ROGUEクロストレーニング新宿', visits: 28, percentage: 25.9, lastVisit: '昨日' },
    { name: 'プレミアムフィットネス銀座', visits: 20, percentage: 18.5, lastVisit: '5日前' },
    { name: 'GOLD\'S GYM 渋谷', visits: 10, percentage: 9.3, lastVisit: '1週間前' },
    { name: 'エニタイムフィットネス新宿', visits: 5, percentage: 4.6, lastVisit: '2週間前' },
  ]

  const recentVisits: GymVisit[] = [
    {
      id: '1',
      gymName: 'ROGUEクロストレーニング新宿',
      date: '2024年1月20日',
      duration: '1時間45分',
      exercises: ['スクワット', 'デッドリフト', 'レッグプレス'],
      totalWeight: 3450,
      crowd: 'normal'
    },
    {
      id: '2',
      gymName: 'ハンマーストレングス渋谷',
      date: '2024年1月19日',
      duration: '2時間10分',
      exercises: ['ベンチプレス', 'インクライン', 'ダンベルフライ'],
      totalWeight: 2890,
      crowd: 'crowded'
    },
    {
      id: '3',
      gymName: 'ハンマーストレングス渋谷',
      date: '2024年1月18日',
      duration: '1時間30分',
      exercises: ['ラットプルダウン', 'バーベルロウ', 'デッドリフト'],
      totalWeight: 3200,
      crowd: 'empty'
    }
  ]

  const weeklyPattern = [
    { day: '月', visits: 2, avg: 1.8 },
    { day: '火', visits: 1, avg: 1.5 },
    { day: '水', visits: 3, avg: 2.2 },
    { day: '木', visits: 2, avg: 1.9 },
    { day: '金', visits: 4, avg: 2.8 },
    { day: '土', visits: 3, avg: 3.1 },
    { day: '日', visits: 2, avg: 2.4 },
  ]

  const timeDistribution = [
    { time: '早朝 (5-8時)', percentage: 15, visits: 16 },
    { time: '午前 (8-12時)', percentage: 10, visits: 11 },
    { time: '午後 (12-17時)', percentage: 20, visits: 22 },
    { time: '夜 (17-22時)', percentage: 45, visits: 49 },
    { time: '深夜 (22-5時)', percentage: 10, visits: 10 },
  ]

  const getCrowdIcon = (crowd: string) => {
    switch(crowd) {
      case 'empty': return '😊'
      case 'crowded': return '😰'
      default: return '😐'
    }
  }

  const getCrowdColor = (crowd: string) => {
    switch(crowd) {
      case 'empty': return 'text-green-600'
      case 'crowded': return 'text-red-600'
      default: return 'text-yellow-600'
    }
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
              {totalVisits}回
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
            <div className="text-2xl font-bold text-slate-900">{totalVisits}回</div>
            <div className="text-xs text-slate-600 mt-1">月平均: 9回</div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-700">現在の連続記録</span>
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{currentStreak}日</div>
            <div className="text-xs text-slate-600 mt-1">最長: {longestStreak}日</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-700">総重量</span>
              <Dumbbell className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{(totalWeight/1000).toFixed(1)}t</div>
            <div className="text-xs text-slate-600 mt-1">平均: 1,347kg/回</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-700">総時間</span>
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalDuration}時間</div>
            <div className="text-xs text-slate-600 mt-1">平均: 1.5時間/回</div>
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
                          style={{ width: `${(day.visits / 4) * 100}%` }}
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
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-700">100日連続</span>
                    <span className="text-xs text-slate-600">95/100</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full" style={{ width: '95%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-700">月間20回訪問</span>
                    <span className="text-xs text-slate-600">18/20</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full" style={{ width: '90%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-700">総重量200t</span>
                    <span className="text-xs text-slate-600">145.7/200</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: '72.85%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Training Tips */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-slate-900">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                インサイト
              </h3>
              <div className="space-y-2 text-sm text-slate-700">
                <p>• 金曜日の訪問が最も多いです</p>
                <p>• 夜の時間帯(17-22時)が45%を占めています</p>
                <p>• ハンマーストレングス渋谷が最頻訪問ジムです</p>
                <p>• 平均滞在時間は1.5時間で理想的です</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}