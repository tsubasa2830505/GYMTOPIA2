/**
 * User Information Data Service
 * ユーザー情報データサービス
 */

import { getSupabaseClient } from '@/lib/supabase/client'
import { UserInfoData, UserInfoConfig, DashboardStats, UserActivity, SystemInfo } from './types'

export async function fetchUserInfo(user: any, config: UserInfoConfig): Promise<UserInfoData> {
  try {
    // 開発環境またはモックデータ使用が指定されている場合
    if (config.environment === 'development' || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      return generateMockUserInfo(user, config)
    }

    // 実際のデータ取得（Supabaseから）
    const supabase = getSupabaseClient()

    // 並行してデータを取得
    const [statsResult, activitiesResult] = await Promise.all([
      fetchUserStats(user.id),
      fetchUserActivities(user.id)
    ])

    const systemInfo: SystemInfo = {
      environment: config.environment,
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      lastLogin: new Date().toISOString(),
      sessionDuration: '00:45:32',
      permissions: config.privilegeLevel >= 100 ? ['admin', 'write', 'read'] : ['read'],
      debugInfo: config.features.showDebugInfo ? {
        userId: user.id,
        privilegeLevel: config.privilegeLevel,
        features: config.features
      } : undefined
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName || user.username || 'ユーザー',
        username: user.username || `user_${user.id.slice(0, 8)}`,
        avatarUrl: user.avatarUrl,
        createdAt: user.created_at || new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      },
      stats: statsResult,
      activities: activitiesResult,
      systemInfo,
      sections: []
    }
  } catch (error) {
    console.error('データ取得エラー:', error)
    // エラー時はモックデータを返す
    return generateMockUserInfo(user, config)
  }
}

async function fetchUserStats(userId: string): Promise<DashboardStats> {
  try {
    const supabase = getSupabaseClient()

    // 投稿数を取得
    const { count: postsCount } = await supabase
      .from('gym_posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // フォロワー・フォロー数を取得
    const { count: followersCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)

    const { count: followingCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId)

    // ワークアウト数を取得（ここでは投稿数をベースに計算）
    const totalWorkouts = Math.floor((postsCount || 0) * 1.5)

    return {
      totalPosts: postsCount || 0,
      totalWorkouts,
      totalFollowers: followersCount || 0,
      totalFollowing: followingCount || 0,
      weeklyWorkouts: Math.min(7, totalWorkouts),
      monthlyWorkouts: Math.min(30, totalWorkouts)
    }
  } catch (error) {
    console.error('統計データ取得エラー:', error)
    return {
      totalPosts: 0,
      totalWorkouts: 0,
      totalFollowers: 0,
      totalFollowing: 0,
      weeklyWorkouts: 0,
      monthlyWorkouts: 0
    }
  }
}

async function fetchUserActivities(userId: string): Promise<UserActivity[]> {
  try {
    const supabase = getSupabaseClient()

    // 最近の投稿を取得
    const { data: posts } = await supabase
      .from('gym_posts')
      .select('id, content, created_at, post_type')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    const activities: UserActivity[] = (posts || []).map(post => ({
      id: post.id,
      type: 'post' as const,
      title: 'ジム活投稿',
      description: post.content?.substring(0, 50) + '...' || '投稿しました',
      timestamp: post.created_at,
      metadata: { postType: post.post_type }
    }))

    return activities
  } catch (error) {
    console.error('アクティビティ取得エラー:', error)
    return []
  }
}

export function generateMockUserInfo(user: any, config: UserInfoConfig): UserInfoData {
  const isTargetUser = user?.email === 'tsubasa.a.283.0505@gmail.com'

  const mockStats: DashboardStats = {
    totalPosts: isTargetUser ? 42 : 8,
    totalWorkouts: isTargetUser ? 156 : 23,
    totalFollowers: isTargetUser ? 89 : 12,
    totalFollowing: isTargetUser ? 134 : 34,
    weeklyWorkouts: isTargetUser ? 5 : 2,
    monthlyWorkouts: isTargetUser ? 18 : 8
  }

  const mockActivities: UserActivity[] = [
    {
      id: '1',
      type: 'workout',
      title: '筋トレ完了',
      description: 'ベンチプレス 80kg x 3セット',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'post',
      title: 'ジム活投稿',
      description: '今日もがんばりました！',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      type: 'achievement',
      title: '新記録達成',
      description: 'デッドリフト 120kg達成！',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    }
  ]

  const systemInfo: SystemInfo = {
    environment: config.environment,
    version: '2.0.0',
    lastLogin: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    sessionDuration: '01:15:42',
    permissions: config.privilegeLevel >= 100 ? ['admin', 'write', 'read'] : ['read'],
    debugInfo: config.features.showDebugInfo ? {
      userId: user?.id || 'mock-user-id',
      privilegeLevel: config.privilegeLevel,
      features: config.features,
      mockDataActive: true,
      timestamp: new Date().toISOString()
    } : undefined
  }

  return {
    user: {
      id: user?.id || 'mock-user-id',
      email: user?.email || 'mock@example.com',
      displayName: user?.displayName || user?.username || 'モックユーザー',
      username: user?.username || 'mock_user',
      avatarUrl: user?.avatarUrl,
      createdAt: user?.created_at || new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    },
    stats: mockStats,
    activities: mockActivities,
    systemInfo,
    sections: []
  }
}