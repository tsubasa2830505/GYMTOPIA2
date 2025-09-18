'use client'

import { useState, useEffect } from 'react'
import { getUserWorkoutStatistics } from '@/lib/supabase/statistics'

export default function GymStatsTestPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        console.log('🧪 Testing stats loading with hardcoded user ID...')
        const userId = '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'
        const result = await getUserWorkoutStatistics(userId)

        console.log('📊 Stats result:', result)
        setStats(result)
        setLoading(false)
      } catch (err: any) {
        console.error('❌ Error loading stats:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgba(254,255,250,0.96)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[color:var(--gt-primary-strong)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[color:var(--text-subtle)]">テスト中: 統計データを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[rgba(254,255,250,0.96)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[color:var(--gt-primary-strong)]">エラー: {typeof error === 'string' ? error : JSON.stringify(error)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[rgba(254,255,250,0.96)] p-8">
      <h1 className="text-2xl font-bold mb-6">統計テストページ</h1>

      <div className="gt-card p-6">
        <h2 className="text-lg font-bold mb-4">統計データ</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[rgba(231,103,76,0.12)] p-4 rounded">
            <div className="text-sm text-[color:var(--text-subtle)]">総訪問回数</div>
            <div className="text-2xl font-bold">{stats?.totalVisits || 0}回</div>
          </div>

          <div className="bg-[rgba(240,142,111,0.1)] p-4 rounded">
            <div className="text-sm text-[color:var(--text-subtle)]">総重量</div>
            <div className="text-2xl font-bold">{((stats?.totalWeight || 0) / 1000).toFixed(1)}t</div>
          </div>

          <div className="bg-[rgba(242,178,74,0.12)] p-4 rounded">
            <div className="text-sm text-[color:var(--text-subtle)]">現在の連続記録</div>
            <div className="text-2xl font-bold">{stats?.currentStreak || 0}日</div>
          </div>

          <div className="bg-[rgba(245,177,143,0.12)] p-4 rounded">
            <div className="text-sm text-[color:var(--text-subtle)]">総時間</div>
            <div className="text-2xl font-bold">{stats?.totalDurationHours || 0}時間</div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-bold mb-2">生データ:</h3>
          <pre className="bg-[rgba(254,255,250,0.92)] p-4 rounded text-sm overflow-auto">
            {JSON.stringify(stats, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}