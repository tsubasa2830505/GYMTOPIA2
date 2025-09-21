import { memo } from 'react'
import { Users, Activity, Heart } from 'lucide-react'

interface StatsSectionProps {
  stats: any
  timeDistribution: any[]
  frequentPosters: any[]
}

const StatsSection = memo(function StatsSection({
  stats,
  timeDistribution,
  frequentPosters
}: StatsSectionProps) {
  if (!stats) {
    return (
      <div className="bg-white border border-[rgba(186,122,103,0.26)] rounded-[14.5px] p-[22px]">
        <div className="text-center py-8 text-[color:var(--text-muted)] text-[12.3px]">
          統計データを読み込み中...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[rgba(186,122,103,0.26)] rounded-[14.5px] p-[22px]">
      <h3 className="text-[14px] font-bold text-[color:var(--foreground)] mb-4">統計情報</h3>

      {/* 概要統計 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-[rgba(254,255,250,0.5)] border border-[rgba(186,122,103,0.15)] rounded-[8.5px]">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-4 h-4 text-[var(--gt-primary)]" />
            <span className="text-[12.3px] font-bold text-[color:var(--foreground)]">総ユーザー数</span>
          </div>
          <div className="text-[20px] font-bold text-[var(--gt-primary)]">
            {stats.totalUsers?.toLocaleString() || 0}
          </div>
        </div>

        <div className="p-4 bg-[rgba(254,255,250,0.5)] border border-[rgba(186,122,103,0.15)] rounded-[8.5px]">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-4 h-4 text-[var(--gt-secondary)]" />
            <span className="text-[12.3px] font-bold text-[color:var(--foreground)]">総投稿数</span>
          </div>
          <div className="text-[20px] font-bold text-[var(--gt-secondary)]">
            {stats.totalPosts?.toLocaleString() || 0}
          </div>
        </div>

        <div className="p-4 bg-[rgba(254,255,250,0.5)] border border-[rgba(186,122,103,0.15)] rounded-[8.5px]">
          <div className="flex items-center space-x-2 mb-2">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-[12.3px] font-bold text-[color:var(--foreground)]">総いいね数</span>
          </div>
          <div className="text-[20px] font-bold text-red-500">
            {stats.totalLikes?.toLocaleString() || 0}
          </div>
        </div>
      </div>

      {/* 時間帯別投稿数 */}
      <div className="mb-6">
        <h4 className="text-[12.3px] font-bold text-[color:var(--foreground)] mb-3">時間帯別投稿数</h4>
        <div className="grid grid-cols-12 gap-1">
          {Array.from({ length: 24 }, (_, hour) => {
            const data = timeDistribution.find(d => d.hour === hour)
            const count = data?.count || 0
            const maxCount = Math.max(...timeDistribution.map(d => d.count || 0), 1)
            const height = Math.max(4, (count / maxCount) * 40)

            return (
              <div key={hour} className="flex flex-col items-center">
                <div className="text-[9px] text-[color:var(--text-muted)] mb-1">
                  {hour}h
                </div>
                <div
                  className="w-full bg-[var(--gt-primary)] rounded-t-sm min-h-[4px]"
                  style={{ height: `${height}px` }}
                  title={`${hour}時: ${count}投稿`}
                />
                <div className="text-[8px] text-[color:var(--text-muted)] mt-1">
                  {count}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 投稿頻度上位ユーザー */}
      <div>
        <h4 className="text-[12.3px] font-bold text-[color:var(--foreground)] mb-3">投稿頻度上位ユーザー</h4>
        {frequentPosters.length === 0 ? (
          <div className="text-center py-4 text-[color:var(--text-muted)] text-[11px]">
            データがありません
          </div>
        ) : (
          <div className="space-y-2">
            {frequentPosters.slice(0, 10).map((user, index) => (
              <div
                key={user.user_id}
                className="flex items-center justify-between p-2 bg-[rgba(254,255,250,0.3)] border border-[rgba(186,122,103,0.1)] rounded-[6px]"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-[var(--gt-primary)] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    {index + 1}
                  </div>
                  <span className="text-[11px] text-[color:var(--foreground)]">
                    {user.display_name || `ユーザー${user.user_id.slice(0, 8)}`}
                  </span>
                </div>
                <div className="text-[11px] text-[color:var(--text-muted)]">
                  {user.post_count}投稿
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

export default StatsSection