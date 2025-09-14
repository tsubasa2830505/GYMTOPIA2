// Profile and social features API functions for GYMTOPIA 2.0
// PRODUCTION VERSION - DATABASE ONLY (No mock data)

import { supabase } from './client'

import type {
  UserProfile,
  UserProfileStats,
  GymPost,
  CreateGymPostInput,
  UpdateGymPostInput,
  PostComment,
  CreatePostCommentInput,
  Follow,
  GymFriend,
  GymFriendRequestInput,
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
    const { data, error } = await supabase
      .from('users')
      .select('id, display_name, username, avatar_url, bio, created_at, updated_at, is_verified')
      .eq('id', userId)
      .single()

    if (error) {
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

export async function getUserProfileStats(userId: string): Promise<UserProfileStats | null> {
  try {
    // Get user data with profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        user_profiles(*)
      `)
      .eq('id', userId)
      .single()

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

    // Get stats from various tables
    const [postsCount, followersCount, followingCount, workoutsCount] = await Promise.all([
      supabase.from('gym_posts').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
      supabase.from('workout_sessions').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    ])
    
    // Build stats object (align with types/profile.ts)
    const stats: UserProfileStats = {
      user_id: userData.id,
      display_name: userData.display_name || userData.username,
      username: userData.username || undefined,
      avatar_url: userData.avatar_url || undefined,
      bio: userData.bio || '',
      location: userData.user_profiles?.[0]?.location || undefined,
      joined_at: userData.created_at,
      is_verified: !!userData.is_verified,
      workout_count: workoutsCount.count || 0,
      workout_streak: 0,
      followers_count: followersCount.count || 0,
      following_count: followingCount.count || 0,
      gym_friends_count: 0,
      posts_count: postsCount.count || 0,
      achievements_count: 0,
      favorite_gyms_count: 0
    }
    
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from('gym_posts')
      .select(`
        *,
        user:users!gym_posts_user_id_fkey(id, display_name, username, avatar_url),
        gym:gyms!gym_posts_gym_id_fkey(id, name)
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
      workout_session_id: post.workout_session_id || undefined,
      content: post.content || '',
      image_url: post.image_url || undefined,
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      shares_count: 0,
      is_public: (post.visibility || 'public') === 'public',
      created_at: post.created_at,
      updated_at: post.updated_at,
      training_details: {
        exercises: [],
        duration_minutes: post.duration_minutes || 0,
        total_weight: post.total_weight_lifted || 0
      },
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { error } = await supabase
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
    const { error } = await supabase
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
    const { error } = await supabase
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

    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { error } = await supabase
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
    const { error } = await supabase
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

    const { data, error } = await supabase
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

    const { data, error } = await supabase
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
// GYM FRIENDS FUNCTIONS
// ========================================

export async function sendGymFriendRequest(
  requestData: GymFriendRequestInput
): Promise<GymFriend | null> {
  try {
    const { data, error } = await supabase
      .from('gym_friends')
      .insert(requestData)
      .select(`
        *,
        user1:users!user1_id(id, display_name, username, avatar_url),
        user2:users!user2_id(id, display_name, username, avatar_url),
        gym:gyms(id, name, area)
      `)
      .single()

    if (error) {
      console.error('Error sending gym friend request:', error)
      return null
    }
    
    return data as GymFriend
  } catch (error) {
    console.error('Error sending gym friend request:', error)
    return null
  }
}

export async function acceptGymFriendRequest(
  requestId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('gym_friends')
      .update({
        friendship_status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', requestId)

    if (error) {
      console.error('Error accepting gym friend request:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error accepting gym friend request:', error)
    return false
  }
}

export async function getUserGymFriends(userId: string): Promise<GymFriend[]> {
  try {
    const { data, error } = await supabase
      .from('gym_friends')
      .select(`
        *,
        user1:users!user1_id(id, display_name, username, avatar_url),
        user2:users!user2_id(id, display_name, username, avatar_url),
        gym:gyms(id, name, area)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('friendship_status', 'accepted')

    if (error) {
      // テーブルが存在しない場合（PGRST205エラー）は警告レベルでログ出力
      if (error.code === 'PGRST205') {
        console.warn('Gym friends table not found - returning empty array')
      } else {
        console.error('Error fetching gym friends:', error)
      }
      return []
    }
    
    return data as GymFriend[]
  } catch (error) {
    console.error('Error fetching gym friends:', error)
    return []
  }
}

// ========================================
// FAVORITE GYMS FUNCTIONS
// ========================================

export async function getFavoriteGyms(userId: string): Promise<FavoriteGym[]> {
  try {
    const { data, error } = await supabase
      .from('favorite_gyms')
      .select(`
        *,
        gym:gyms!favorite_gyms_gym_id_fkey(
          id,
          name,
          prefecture,
          city,
          address,
          description,
          area,
          users_count
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      // テーブルが存在しない場合（PGRST205エラー）は警告レベルでログ出力
      if (error.code === 'PGRST205') {
        console.warn('Favorite gyms table not found - returning empty array')
      } else {
        console.error('Error fetching favorite gyms:', error)
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
    const { error } = await supabase
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
    const { error } = await supabase
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
// STATISTICS FUNCTIONS
// ========================================

export async function getWeeklyStats(userId: string): Promise<WeeklyStats | null> {
  try {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', userId)
      .order('achieved_at', { ascending: false })

    if (error) {
      // テーブルが存在しない場合（PGRST205エラー）は静かに空配列を返す
      if (error.code === 'PGRST205') {
        // テーブルが存在しないだけなのでログ出力は不要
        return []
      } else {
        console.error('Error fetching personal records:', {
          message: error.message,
          code: error.code,
          details: error.details
        })
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
