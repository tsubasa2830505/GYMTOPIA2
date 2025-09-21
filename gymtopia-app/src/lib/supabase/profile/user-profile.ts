// User profile management functions
import { getSupabaseClient } from '../client'
import { logger } from '../../utils/logger'
import type { UserProfile, UserProfileStats, UpdateProfileInput } from '../../types/profile'

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('users')
      .select('id, display_name, username, avatar_url, bio, created_at, updated_at, is_verified')
      .eq('id', userId)
      .maybeSingle()

    if (error || !data) {
      logger.error('Error fetching user profile:', error)
      return null
    }

    const profile: UserProfile = {
      id: data.id,
      display_name: data.display_name || data.username,
      username: data.username || undefined,
      avatar_url: data.avatar_url || undefined,
      bio: data.bio || undefined,
      joined_at: data.created_at,
      is_verified: !!data.is_verified,
      workout_streak: 0,
      total_workouts: 0,
      created_at: data.created_at,
      updated_at: data.updated_at
    }

    return profile
  } catch (error) {
    logger.error('Error fetching user profile:', error)
    return null
  }
}

export async function getUserProfileStats(userId: string, forceRefresh: boolean = false): Promise<UserProfileStats | null> {
  try {
    // Fetch user
    logger.log('🔍 Fetching user data for:', userId, 'forceRefresh:', forceRefresh);

    // Create fresh client if force refresh is requested
    const client = getSupabaseClient()
    const query = client.from('users').select('*').eq('id', userId)

    // Add timestamp to force cache bypass when needed
    if (forceRefresh) {
      logger.log('🔄 Force refresh requested - bypassing cache');
    }

    const { data: userData, error: userError } = await query.maybeSingle()

    if (userError || !userData) {
      if (userError?.code === 'PGRST205') {
        logger.warn('Users table not found - using mock data for development')
      } else if (userError) {
        logger.error('Error fetching user data:', {
          message: userError.message,
          code: userError.code,
          details: userError.details
        })
      } else {
        logger.warn('User data not found for userId:', userId)
      }
      return null
    }

    // 高速化: 軽量クエリを優先実行し、重いクエリは簡略化
    const supabase = getSupabaseClient()
    logger.log('⚡ 軽量統計クエリを実行中...');

    // Phase 1: 必須かつ軽量なデータのみ
    const [postsCount, followersCount, followingCount, userProfileData] = await Promise.all([
      supabase.from('gym_posts').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
      supabase.from('user_profiles').select('primary_gym_id, secondary_gym_ids, gym_membership_type').eq('user_id', userId).maybeSingle()
    ])

    // Debug: Log user profile data
    logger.log('🔍 User profile data from database:', userProfileData)

    // Phase 2: 非重要データは簡略化またはスキップ（パフォーマンス優先）
    const [workoutsCount, favoriteGymsCount, achievementsCount] = await Promise.all([
      supabase.from('gym_posts').select('*', { count: 'exact', head: true }).eq('user_id', userId).limit(1), // 投稿データからワークアウト回数を計算
      supabase.from('favorite_gyms').select('*', { count: 'exact', head: true }).eq('user_id', userId).limit(1),
      supabase.from('achievements').select('*', { count: 'exact', head: true }).eq('user_id', userId).limit(1)
    ])

    // 相互フォロー数は計算が重いので固定値を使用（後で背景で更新可能）
    const gymFriendsCount = { data: 0 } // 重いRPC呼び出しを回避

    // Build stats object (align with types/profile.ts)
    const stats: UserProfileStats = {
      user_id: userData.id,
      display_name: userData.display_name || userData.username,
      username: userData.username || undefined,
      avatar_url: userData.avatar_url || undefined,
      bio: userData.bio || '',
      location: undefined, // Location is stored in users table, not user_profiles
      joined_at: userData.created_at,
      is_verified: !!userData.is_verified,
      workout_count: workoutsCount.count || 0,
      workout_streak: 0,
      followers_count: followersCount.count || 0,
      following_count: followingCount.count || 0,
      mutual_follows_count: gymFriendsCount.data || 0,  // Changed from gym_friends_count
      posts_count: postsCount.count || 0,
      achievements_count: achievementsCount.count || 0,
      favorite_gyms_count: favoriteGymsCount.count || 0,
      primary_gym_id: userProfileData.data?.primary_gym_id || undefined,
      secondary_gym_ids: userProfileData.data?.secondary_gym_ids || [],
      gym_membership_type: userProfileData.data?.gym_membership_type || undefined
    }

    // Return stats object
    logger.log('✅ Profile stats generated');

    return stats
  } catch (error) {
    logger.error('Error fetching user profile stats:', error)
    return null
  }
}

export async function updateUserProfile(
  userId: string,
  updates: UpdateProfileInput
): Promise<UserProfile | null> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('users')
      .update({
        display_name: updates.display_name,
        username: updates.username,
        avatar_url: updates.avatar_url,
        bio: updates.bio,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('id, display_name, username, avatar_url, bio, created_at, updated_at, is_verified')
      .single()

    if (error) {
      logger.error('Error updating user profile:', error)
      return null
    }

    const profile: UserProfile = {
      id: data.id,
      display_name: data.display_name || data.username,
      username: data.username || undefined,
      avatar_url: data.avatar_url || undefined,
      bio: data.bio || undefined,
      joined_at: data.created_at,
      is_verified: !!data.is_verified,
      workout_streak: 0,
      total_workouts: 0,
      created_at: data.created_at,
      updated_at: data.updated_at
    }
    return profile
  } catch (error) {
    logger.error('Error updating user profile:', error)
    return null
  }
}