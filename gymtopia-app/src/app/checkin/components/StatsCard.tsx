import { memo } from 'react'
import { Trophy, Calendar, Users, MapPin } from 'lucide-react'
import type { StatsCardProps } from '../types'

const StatsCard = memo(function StatsCard({
  stats,
  loading
}: StatsCardProps) {
  if (loading) {
    return (
      <div className="gt-card p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="gt-card p-4 sm:p-6">
        <h3 className="font-bold text-lg mb-4 text-[color:var(--foreground)]">チェックイン統計</h3>
        <p className="text-[color:var(--text-muted)]">統計データを読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="gt-card p-4 sm:p-6">
      <h3 className="font-bold text-lg mb-4 text-[color:var(--foreground)]">チェックイン統計</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gradient-to-br from-[var(--gt-primary)] to-[var(--gt-primary-strong)] rounded-xl text-white">
          <div className="flex items-center justify-center mb-2">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold">{stats.streak}</div>
          <div className="text-xs opacity-90">連続日数</div>
        </div>

        <div className="text-center p-3 bg-gradient-to-br from-[var(--gt-secondary)] to-[var(--gt-secondary-strong)] rounded-xl text-white">
          <div className="flex items-center justify-center mb-2">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold">{stats.thisWeek}</div>
          <div className="text-xs opacity-90">今週</div>
        </div>

        <div className="text-center p-3 bg-gradient-to-br from-[var(--gt-tertiary)] to-[var(--gt-tertiary-strong)] rounded-xl text-white">
          <div className="flex items-center justify-center mb-2">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold">{stats.uniqueGyms}</div>
          <div className="text-xs opacity-90">ユニークジム</div>
        </div>

        <div className="text-center p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold">{stats.totalCheckIns}</div>
          <div className="text-xs opacity-90">総チェックイン</div>
        </div>
      </div>
    </div>
  )
})

export default StatsCard