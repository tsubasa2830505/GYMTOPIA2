import type { GymPost } from '@/lib/types/profile'

/**
 * 投稿日時をフォーマットする
 */
export function formatPostDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 60) {
      return `${diffInMinutes}分前`
    } else if (diffInHours < 24) {
      return `${diffInHours}時間前`
    } else if (diffInDays < 7) {
      return `${diffInDays}日前`
    } else {
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  } catch (error) {
    console.error('Error formatting date:', error)
    return '不明'
  }
}

/**
 * トレーニング詳細をフォーマットする
 */
export function formatTrainingDetails(post: GymPost): string | null {
  try {
    if (!post) return null

    const details: string[] = []

    // トレーニング時間
    if (post.training_duration) {
      const hours = Math.floor(post.training_duration / 60)
      const minutes = post.training_duration % 60
      if (hours > 0) {
        details.push(`${hours}時間${minutes}分`)
      } else {
        details.push(`${minutes}分`)
      }
    }

    // 種目数
    if (post.exercises_count && post.exercises_count > 0) {
      details.push(`${post.exercises_count}種目`)
    }

    // 総セット数
    if (post.total_sets && post.total_sets > 0) {
      details.push(`${post.total_sets}セット`)
    }

    // 消費カロリー
    if (post.calories_burned && post.calories_burned > 0) {
      details.push(`${post.calories_burned}kcal`)
    }

    // ボリューム（重量×回数の合計）
    if (post.total_volume && post.total_volume > 0) {
      details.push(`ボリューム: ${post.total_volume}kg`)
    }

    // タグ
    if (post.tags && Array.isArray(post.tags) && post.tags.length > 0) {
      details.push(`タグ: ${post.tags.join(', ')}`)
    }

    return details.length > 0 ? details.join(' • ') : null
  } catch (error) {
    console.error('Error formatting training details:', error)
    return null
  }
}

/**
 * アチーブメントアイコンを取得する（文字列として）
 */
export function getAchievementIcon(badgeIcon: string | null | undefined, achievementType: string): string {
  // Badge icon emojis
  if (badgeIcon === '🏆' || badgeIcon === 'trophy') {
    return '🏆'
  }

  if (badgeIcon === '🔥' || badgeIcon === 'fire') {
    return '🔥'
  }

  if (badgeIcon === '🎯' || badgeIcon === 'target') {
    return '🎯'
  }

  if (badgeIcon === '💪' || badgeIcon === 'muscle') {
    return '💪'
  }

  if (badgeIcon === '⭐' || badgeIcon === 'star') {
    return '⭐'
  }

  if (badgeIcon === '🥇' || badgeIcon === 'medal') {
    return '🥇'
  }

  // Default icon based on achievement type
  switch (achievementType?.toLowerCase()) {
    case 'workout_streak':
    case 'streak':
      return '🔥'
    case 'total_workouts':
    case 'milestone':
      return '🎯'
    case 'personal_record':
    case 'pr':
      return '🏆'
    case 'gym_visits':
      return '💪'
    default:
      return '🥇'
  }
}