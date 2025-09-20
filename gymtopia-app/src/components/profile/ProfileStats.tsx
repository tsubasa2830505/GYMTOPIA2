'use client'

import { Users, Heart, MessageCircle, Target } from 'lucide-react'

interface ProfileStatsProps {
  stats: {
    followers_count: number
    following_count: number
    posts_count: number
    workout_count: number
    workout_streak: number
  }
  showWorkoutStats?: boolean
}

export default function ProfileStats({
  stats,
  showWorkoutStats = true
}: ProfileStatsProps) {
  const statItems = [
    {
      label: 'フォロワー',
      value: stats.followers_count,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      label: 'フォロー中',
      value: stats.following_count,
      icon: Heart,
      color: 'text-red-600'
    },
    {
      label: '投稿',
      value: stats.posts_count,
      icon: MessageCircle,
      color: 'text-green-600'
    }
  ]

  if (showWorkoutStats) {
    statItems.push(
      {
        label: 'ワークアウト',
        value: stats.workout_count,
        icon: Target,
        color: 'text-purple-600'
      }
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon
        return (
          <div
            key={item.label}
            className="text-center p-4 bg-white rounded-lg border border-[rgba(231,103,76,0.2)] hover:shadow-md transition-shadow"
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 mb-2`}>
              <Icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <div className="text-xl font-bold text-[color:var(--foreground)]">
              {item.value.toLocaleString()}
            </div>
            <div className="text-sm text-[color:var(--text-muted)]">
              {item.label}
            </div>
          </div>
        )
      })}

      {showWorkoutStats && stats.workout_streak > 0 && (
        <div className="md:col-span-2 lg:col-span-1 text-center p-4 bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white rounded-lg">
          <div className="text-2xl font-bold">🔥</div>
          <div className="text-xl font-bold">{stats.workout_streak}</div>
          <div className="text-sm opacity-90">連続日数</div>
        </div>
      )}
    </div>
  )
}