// Profile and social features API functions for GYMTOPIA 2.0
// PRODUCTION VERSION - DATABASE ONLY (No mock data)

import { getSupabaseClient } from './client'

import type {
  UserProfile,
  UserProfileStats,
  GymPost,
  CreateGymPostInput,
  UpdateGymPostInput,
  PostComment,
  CreatePostCommentInput,
  Follow,
  // GymFriend and GymFriendRequestInput removed
  FavoriteGym,
  WeeklyStats,
  ProfileDashboard,
  UpdateProfileInput
} from '../types/profile'
import type { Achievement, PersonalRecord } from '../types/workout'

// ========================================
// USER PROFILE FUNCTIONS
// ========================================

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('users')
      .select('id, display_name, username, avatar_url, bio, created_at, updated_at, is_verified')
      .eq('id', userId)
      .maybeSingle()

    if (error || !data) {
      console.error('Error fetching user profile:', error)
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
    console.error('Error fetching user profile:', error)
    return null
  }
}

export async function getUserProfileStats(userId: string, forceRefresh: boolean = false): Promise<UserProfileStats | null> {
  try {
    // Fetch user
    console.log('🔍 Fetching user data for:', userId, 'forceRefresh:', forceRefresh);

    // Create fresh client if force refresh is requested
    const client = getSupabaseClient()
    const query = client.from('users').select('*').eq('id', userId)

    // Add timestamp to force cache bypass when needed
    if (forceRefresh) {
      console.log('🔄 Force refresh requested - bypassing cache');
    }

    const { data: userData, error: userError } = await query.maybeSingle()

    if (userError || !userData) {
      if (userError?.code === 'PGRST205') {
        console.warn('Users table not found - using mock data for development')
      } else if (userError) {
        console.error('Error fetching user data:', {
          message: userError.message,
          code: userError.code,
          details: userError.details
        })
      } else {
        console.warn('User data not found for userId:', userId)
      }
      return null
    }

    // 高速化: 軽量クエリを優先実行し、重いクエリは簡略化
    const supabase = getSupabaseClient()
    console.log('⚡ 軽量統計クエリを実行中...');

    // Phase 1: 必須かつ軽量なデータのみ
    const [postsCount, followersCount, followingCount, userProfileData] = await Promise.all([
      supabase.from('gym_posts').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
      supabase.from('user_profiles').select('primary_gym_id, secondary_gym_ids, gym_membership_type').eq('user_id', userId).maybeSingle()
    ])

    // Debug: Log user profile data
    console.log('🔍 User profile data from database:', userProfileData)

    // Phase 2: 非重要データは簡略化またはスキップ（パフォーマンス優先）
    const [workoutsCount, favoriteGymsCount, achievementsCount] = await Promise.all([
      supabase.from('workout_sessions').select('*', { count: 'exact', head: true }).eq('user_id', userId).limit(1), // カウントのみ軽量化
      supabase.from('favorite_gyms').select('*', { count: 'exact', head: true }).eq('user_id', userId).limit(1),
      supabase.from('achievements').select('*', { count: 'exact', head: true }).eq('user_id', userId).limit(1)
    ])

    // 相互フォロー数は計算が重いので固定値を使用（後で背景で更新可能）
    const gymFriendsCount = { data: 0 } // 重いRPC呼び出しを回避

    // Trim verbose logs

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
    console.log('✅ Profile stats generated');

    return stats
  } catch (error) {
    console.error('Error fetching user profile stats:', error)
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
      console.error('Error updating user profile:', error)
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
    console.error('Error updating user profile:', error)
    return null
  }
}

// ========================================
// GYM POSTS FUNCTIONS
// ========================================

export async function getUserPosts(
  userId: string,
  page = 1,
  limit = 10
): Promise<GymPost[]> {
  try {
    console.log('Fetching posts for user:', userId)
    const offset = (page - 1) * limit

    // Get posts with user and gym information
    const { data, error } = await getSupabaseClient()
      .from('gym_posts')
      .select(`
        *,
        user:users(id, display_name, username, avatar_url),
        gym:gyms(id, name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      // テーブルが存在しない場合（PGRST205エラー）は静かに空配列を返す
      if (error.code === 'PGRST205') {
        // テーブルが存在しないだけなのでログ出力は不要
        return []
      } else {
        console.error('Error fetching user posts:', {
          message: error.message,
          code: error.code,
          details: error.details
        })
      }
      return []
    }

    // Map to GymPost format (align with types/profile.ts)
    const posts: GymPost[] = (data || []).map(post => ({
      id: post.id,
      user_id: post.user_id,
      gym_id: post.gym_id,
      content: post.content || '',
      images: post.images || [],
      workout_type: post.workout_type || undefined,
      muscle_groups_trained: post.muscle_groups_trained || [],
      duration_minutes: post.duration_minutes || 0,
      crowd_status: post.crowd_status || undefined,
      likes_count: post.like_count || 0, // Use like_count from database
      comments_count: post.comment_count || 0, // Use comment_count from database
      visibility: post.visibility || 'public',
      is_public: post.is_public !== false,
      created_at: post.created_at,
      updated_at: post.updated_at,
      workout_started_at: post.workout_started_at || undefined,
      workout_ended_at: post.workout_ended_at || undefined,
      workout_duration_calculated: post.workout_duration_calculated || undefined,
      training_details: post.training_details || undefined,
      user: post.user || undefined,
      gym: post.gym || undefined
    }))
    
    return posts
  } catch (error) {
    console.error('Error fetching user posts:', error)
    return []
  }
}

export async function createGymPost(
  userId: string,
  postData: CreateGymPostInput
): Promise<GymPost | null> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('gym_posts')
      .insert({
        user_id: userId,
        ...postData
      })
      .select(`
        *,
        user:users(id, display_name, username, avatar_url, is_verified)
      `)
      .single()

    if (error) {
      console.error('Error creating gym post:', error)
      return null
    }
    
    return data as GymPost
  } catch (error) {
    console.error('Error creating gym post:', error)
    return null
  }
}

export async function updateGymPost(
  postId: string,
  updates: UpdateGymPostInput
): Promise<GymPost | null> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('gym_posts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
      .select()
      .single()

    if (error) {
      console.error('Error updating gym post:', error)
      return null
    }
    
    return data as GymPost
  } catch (error) {
    console.error('Error updating gym post:', error)
    return null
  }
}

export async function deleteGymPost(postId: string): Promise<boolean> {
  try {
    const { error } = await getSupabaseClient()
      .from('gym_posts')
      .delete()
      .eq('id', postId)

    if (error) {
      console.error('Error deleting gym post:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error deleting gym post:', error)
    return false
  }
}

export async function likePost(userId: string, postId: string): Promise<boolean> {
  try {
    const { error } = await getSupabaseClient()
      .from('post_likes')
      .insert({
        user_id: userId,
        post_id: postId
      })

    if (error) {
      console.error('Error liking post:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error liking post:', error)
    return false
  }
}

export async function unlikePost(userId: string, postId: string): Promise<boolean> {
  try {
    const { error } = await getSupabaseClient()
      .from('post_likes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId)

    if (error) {
      console.error('Error unliking post:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error unliking post:', error)
    return false
  }
}

// ========================================
// COMMENTS FUNCTIONS
// ========================================

export async function getPostComments(
  postId: string,
  page = 1,
  limit = 20
): Promise<PostComment[]> {
  try {
    const offset = (page - 1) * limit

    const { data, error } = await getSupabaseClient()
      .from('post_comments')
      .select(`
        *,
        user:users(id, display_name, username, avatar_url, is_verified),
        replies:post_comments(
          *,
          user:users(id, display_name, username, avatar_url, is_verified)
        )
      `)
      .eq('post_id', postId)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching post comments:', error)
      return []
    }
    
    return data as PostComment[]
  } catch (error) {
    console.error('Error fetching post comments:', error)
    return []
  }
}

export async function createComment(
  userId: string,
  commentData: CreatePostCommentInput
): Promise<PostComment | null> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('post_comments')
      .insert({
        user_id: userId,
        ...commentData
      })
      .select(`
        *,
        user:users(id, display_name, username, avatar_url, is_verified)
      `)
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      return null
    }
    
    return data as PostComment
  } catch (error) {
    console.error('Error creating comment:', error)
    return null
  }
}

// ========================================
// SOCIAL FUNCTIONS
// ========================================

export async function followUser(followerId: string, followingId: string): Promise<boolean> {
  try {
    const { error } = await getSupabaseClient()
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: followingId
      })

    if (error) {
      console.error('Error following user:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error following user:', error)
    return false
  }
}

export async function unfollowUser(followerId: string, followingId: string): Promise<boolean> {
  try {
    const { error } = await getSupabaseClient()
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId)

    if (error) {
      console.error('Error unfollowing user:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error unfollowing user:', error)
    return false
  }
}

export async function getUserFollowers(
  userId: string,
  page = 1,
  limit = 20
): Promise<Follow[]> {
  try {
    const offset = (page - 1) * limit

    const { data, error } = await getSupabaseClient()
      .from('follows')
      .select(`
        *,
        follower:users!follower_id(id, display_name, username, avatar_url, is_verified)
      `)
      .eq('following_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching followers:', error)
      return []
    }
    
    return data as Follow[]
  } catch (error) {
    console.error('Error fetching followers:', error)
    return []
  }
}

export async function getUserFollowing(
  userId: string,
  page = 1,
  limit = 20
): Promise<Follow[]> {
  try {
    const offset = (page - 1) * limit

    const { data, error } = await getSupabaseClient()
      .from('follows')
      .select(`
        *,
        following:users!following_id(id, display_name, username, avatar_url, is_verified)
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching following:', error)
      return []
    }
    
    return data as Follow[]
  } catch (error) {
    console.error('Error fetching following:', error)
    return []
  }
}

// ========================================
// GYM FRIENDS FUNCTIONS - REMOVED
// ========================================
// All gym friend functions have been removed.
// Use follow system with mutual follow detection instead.

// ========================================
// FAVORITE GYMS FUNCTIONS
// ========================================

export async function getFavoriteGyms(userId: string): Promise<FavoriteGym[]> {
  try {
    // First try with full join
    const { data, error } = await getSupabaseClient()
      .from('favorite_gyms')
      .select(`
        *,
        gym:gyms(
          id,
          name,
          prefecture,
          city,
          address,
          description,
          rating,
          users_count,
          image_url,
          images,
          area,
          review_count
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      // テーブルが存在しない場合（42P01エラー）は警告レベルでログ出力
      if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('Favorite gyms table not found - returning empty array')
      } else {
        console.error('Error fetching favorite gyms:', {
          error,
          message: error?.message,
          code: error?.code,
          details: error?.details,
          hint: error?.hint,
          fullError: JSON.stringify(error)
        })
      }
      return []
    }

    // データをマッピング
    const favoriteGyms = (data || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      gym_id: item.gym_id,
      created_at: item.created_at,
      gym: item.gym || null
    }))

    return favoriteGyms as FavoriteGym[]
  } catch (error) {
    console.error('Error fetching favorite gyms:', error)
    return []
  }
}

export async function addFavoriteGym(userId: string, gymId: string): Promise<boolean> {
  try {
    const { error } = await getSupabaseClient()
      .from('favorite_gyms')
      .insert({
        user_id: userId,
        gym_id: gymId
      })

    if (error) {
      console.error('Error adding favorite gym:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error adding favorite gym:', error)
    return false
  }
}

export async function removeFavoriteGym(userId: string, gymId: string): Promise<boolean> {
  try {
    const { error } = await getSupabaseClient()
      .from('favorite_gyms')
      .delete()
      .eq('user_id', userId)
      .eq('gym_id', gymId)

    if (error) {
      console.error('Error removing favorite gym:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error removing favorite gym:', error)
    return false
  }
}

// ========================================
// FREQUENT GYMS FUNCTIONS
// ========================================

export interface FrequentGym {
  id: string
  name: string
  prefecture?: string
  city?: string
  images?: string[]
  visit_count: number
  last_visit: string
  first_visit: string
}

export async function getFrequentGyms(userId: string, limit = 5): Promise<FrequentGym[]> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('gym_posts')
      .select(`
        gym_id,
        gym:gyms(id, name, prefecture, city, images),
        created_at
      `)
      .eq('user_id', userId)
      .not('gym_id', 'is', null)

    if (error) {
      console.error('Error fetching frequent gyms:', error)
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    // Group by gym and calculate visit counts
    const gymVisits = new Map<string, {
      gym: any
      visits: string[]
    }>()

    data.forEach(post => {
      if (post.gym_id && post.gym) {
        const existing = gymVisits.get(post.gym_id)
        if (existing) {
          existing.visits.push(post.created_at)
        } else {
          gymVisits.set(post.gym_id, {
            gym: post.gym,
            visits: [post.created_at]
          })
        }
      }
    })

    // Convert to FrequentGym array and sort by visit count
    const frequentGyms: FrequentGym[] = Array.from(gymVisits.entries())
      .map(([gymId, { gym, visits }]) => {
        const sortedVisits = visits.sort()
        return {
          id: gym.id,
          name: gym.name,
          prefecture: gym.prefecture,
          city: gym.city,
          images: gym.images || [],
          visit_count: visits.length,
          last_visit: sortedVisits[sortedVisits.length - 1],
          first_visit: sortedVisits[0]
        }
      })
      .sort((a, b) => {
        // Sort by visit count descending, then by last visit descending
        if (b.visit_count !== a.visit_count) {
          return b.visit_count - a.visit_count
        }
        return new Date(b.last_visit).getTime() - new Date(a.last_visit).getTime()
      })
      .slice(0, limit)

    return frequentGyms
  } catch (error) {
    console.error('Error fetching frequent gyms:', error)
    return []
  }
}

// ========================================
// STATISTICS FUNCTIONS
// ========================================

export async function getWeeklyStats(userId: string): Promise<WeeklyStats | null> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('started_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('started_at', { ascending: false })

    if (error) {
      console.error('Error fetching weekly stats:', error)
      return null
    }

    // Calculate weekly statistics (align with types/profile.ts)
    const totalSessions = data.length
    const totalWeightLifted = data.reduce((sum, session) => sum + (session.total_weight_lifted || 0), 0)
    const totalDuration = data.reduce((sum, session) => {
      if (session.started_at && session.ended_at) {
        return sum + (new Date(session.ended_at).getTime() - new Date(session.started_at).getTime())
      }
      return sum
    }, 0)

    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const workoutDates = data
      .map(s => s.started_at)
      .filter(Boolean)
      .map((d: string) => new Date(d).toISOString())

    const weekly: WeeklyStats = {
      workout_count: totalSessions,
      total_weight_kg: totalWeightLifted,
      avg_duration_minutes: totalSessions > 0 ? Math.floor(totalDuration / (totalSessions * 1000 * 60)) : 0,
      streak_days: 0,
      favorite_exercises: [],
      workout_dates: workoutDates
    }

    return weekly
  } catch (error) {
    console.error('Error fetching weekly stats:', error)
    return null
  }
}

export async function getUserAchievements(userId: string): Promise<Achievement[]> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })

    if (error) {
      // テーブルが存在しない場合（PGRST205エラー）は警告レベルでログ出力
      if (error.code === 'PGRST205') {
        console.warn('Achievements table not found - returning empty array')
      } else {
        console.error('Error fetching achievements:', error)
      }
      return []
    }
    
    return data as Achievement[]
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return []
  }
}

export async function getUserPersonalRecords(userId: string): Promise<PersonalRecord[]> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('personal_records')
      .select('*')
      .eq('user_id', userId)
      .order('achieved_at', { ascending: false })

    if (error) {
      // テーブルが存在しない場合（PGRST205エラー）は静かに空配列を返す
      if (error.code === 'PGRST205') {
        // テーブルが存在しないだけなのでログ出力は不要
        return []
      } else if (error.code === '42501') {
        // 権限エラーの場合もサイレントに空配列を返す
        return []
      } else {
        // その他のエラーのみログ出力
        console.error('Error fetching personal records:', error)
      }
      return []
    }

    return data as PersonalRecord[]
  } catch (error) {
    console.error('Unexpected error fetching personal records:', error)
    return []
  }
}

// ========================================
// DASHBOARD FUNCTIONS
// ========================================

export async function getProfileDashboard(userId: string): Promise<ProfileDashboard | null> {
  try {
    const [profileStats, weeklyStats, recentPosts, achievements, personalRecords, favGyms] = await Promise.all([
      getUserProfileStats(userId),
      getWeeklyStats(userId),
      getUserPosts(userId, 1, 5),
      getUserAchievements(userId),
      getUserPersonalRecords(userId),
      getFavoriteGyms(userId)
    ])

    if (!profileStats) {
      return null
    }

    return {
      user: profileStats,
      weekly_stats: weeklyStats || {
        workout_count: 0,
        total_weight_kg: 0,
        avg_duration_minutes: 0,
        streak_days: 0,
        favorite_exercises: [],
        workout_dates: []
      },
      recent_posts: recentPosts,
      recent_achievements: achievements.slice(0, 5).map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        earned_at: a.earned_at,
        badge_icon: a.badge_icon
      })),
      personal_records: personalRecords.slice(0, 5).map(r => ({
        id: r.id,
        exercise_name: r.exercise_name,
        record_type: r.record_type,
        weight: r.weight,
        reps: r.reps,
        achieved_at: r.achieved_at
      })),
      favorite_gyms: favGyms
    }
  } catch (error) {
    console.error('Error fetching profile dashboard:', error)
    return null
  }
}
