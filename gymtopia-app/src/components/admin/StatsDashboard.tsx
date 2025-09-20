'use client'

import { Users, TrendingUp, Activity, Heart } from 'lucide-react'

interface StatsDashboardProps {
  stats: {
    totalUsers: number
    totalPosts: number
    totalLikes: number
    totalGyms: number
  } | null
  timeDistribution: Array<{
    hour: number
    post_count: number
  }>
  frequentPosters: Array<{
    user_id: string
    display_name: string
    post_count: number
  }>
  isLoading?: boolean
}

export default function StatsDashboard({
  stats,
  timeDistribution,
  frequentPosters,
  isLoading = false
}: StatsDashboardProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-[rgba(231,103,76,0.1)] rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-[rgba(231,103,76,0.1)] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[color:var(--foreground)]">統計情報</h3>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">総ユーザー数</p>
              <p className="text-2xl font-bold text-blue-800">{stats?.totalUsers || 0}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">総投稿数</p>
              <p className="text-2xl font-bold text-green-800">{stats?.totalPosts || 0}</p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">総いいね数</p>
              <p className="text-2xl font-bold text-red-800">{stats?.totalLikes || 0}</p>
            </div>
            <Heart className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">総ジム数</p>
              <p className="text-2xl font-bold text-purple-800">{stats?.totalGyms || 0}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* 時間別投稿分布 */}
      <div className="bg-white p-6 rounded-lg border border-[rgba(231,103,76,0.2)]">
        <h4 className="text-md font-medium text-[color:var(--foreground)] mb-4">時間別投稿分布</h4>

        {timeDistribution.length === 0 ? (
          <p className="text-[color:var(--text-muted)] text-center py-4">データがありません</p>
        ) : (
          <div className="space-y-2">
            {timeDistribution.map((item) => (
              <div key={item.hour} className="flex items-center gap-4">
                <div className="w-12 text-sm text-[color:var(--text-muted)]">
                  {item.hour}:00
                </div>
                <div className="flex-1">
                  <div className="bg-[rgba(231,103,76,0.1)] rounded-full h-4 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(5, (item.post_count / Math.max(...timeDistribution.map(t => t.post_count))) * 100)}%`
                      }}
                    />
                  </div>
                </div>
                <div className="w-12 text-sm text-[color:var(--foreground)] text-right">
                  {item.post_count}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* アクティブユーザー */}
      <div className="bg-white p-6 rounded-lg border border-[rgba(231,103,76,0.2)]">
        <h4 className="text-md font-medium text-[color:var(--foreground)] mb-4">アクティブユーザー（投稿数順）</h4>

        {frequentPosters.length === 0 ? (
          <p className="text-[color:var(--text-muted)] text-center py-4">データがありません</p>
        ) : (
          <div className="space-y-3">
            {frequentPosters.slice(0, 10).map((user, index) => (
              <div key={user.user_id} className="flex items-center justify-between p-3 rounded-lg hover:bg-[rgba(231,103,76,0.05)] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-[color:var(--foreground)]">
                      {user.display_name || 'ユーザー'}
                    </p>
                    <p className="text-sm text-[color:var(--text-muted)]">
                      {user.user_id}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[color:var(--foreground)]">
                    {user.post_count}投稿
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}