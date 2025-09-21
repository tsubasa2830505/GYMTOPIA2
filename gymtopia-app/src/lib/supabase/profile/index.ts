// Modular profile API exports
export * from './user-profile'

// Re-export all original functions for backward compatibility
import { getSupabaseClient } from '../client'
import { logger } from '../../utils/logger'
import type {
  GymPost,
  CreateGymPostInput,
  UpdateGymPostInput,
  PostComment,
  CreatePostCommentInput,
  Follow,
  FavoriteGym,
  WeeklyStats,
  ProfileDashboard
} from '../../types/profile'
import type { Achievement, PersonalRecord } from '../../types/workout'

// ========================================
// POSTS FUNCTIONS (from original profile.ts)
// ========================================

export async function getUserPosts(
  userId: string,
  page: number = 0,
  limit: number = 10
): Promise<GymPost[]> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('gym_posts')
      .select(`
        *,
        gym:gyms!gym_id(id, name, address),
        user:users!user_id(id, display_name, username, avatar_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    if (error) {
      logger.error('Error fetching user posts:', error)
      return []
    }

    return data || []
  } catch (error) {
    logger.error('Error fetching user posts:', error)
    return []
  }
}

export async function createGymPost(input: CreateGymPostInput): Promise<GymPost | null> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('gym_posts')
      .insert(input)
      .select(`
        *,
        gym:gyms!gym_id(id, name, address),
        user:users!user_id(id, display_name, username, avatar_url)
      `)
      .single()

    if (error) {
      logger.error('Error creating gym post:', error)
      return null
    }

    return data
  } catch (error) {
    logger.error('Error creating gym post:', error)
    return null
  }
}

export async function updateGymPost(postId: string, updates: UpdateGymPostInput): Promise<GymPost | null> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('gym_posts')
      .update(updates)
      .eq('id', postId)
      .select(`
        *,
        gym:gyms!gym_id(id, name, address),
        user:users!user_id(id, display_name, username, avatar_url)
      `)
      .single()

    if (error) {
      logger.error('Error updating gym post:', error)
      return null
    }

    return data
  } catch (error) {
    logger.error('Error updating gym post:', error)
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
      logger.error('Error deleting gym post:', error)
      return false
    }

    return true
  } catch (error) {
    logger.error('Error deleting gym post:', error)
    return false
  }
}

export async function likePost(userId: string, postId: string): Promise<boolean> {
  try {
    const { error } = await getSupabaseClient()
      .from('post_likes')
      .insert({ user_id: userId, post_id: postId })

    if (error) {
      logger.error('Error liking post:', error)
      return false
    }

    return true
  } catch (error) {
    logger.error('Error liking post:', error)
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
      logger.error('Error unliking post:', error)
      return false
    }

    return true
  } catch (error) {
    logger.error('Error unliking post:', error)
    return false
  }
}

// ========================================
// COMMENTS FUNCTIONS
// ========================================

export async function getPostComments(
  postId: string,
  page: number = 0,
  limit: number = 20
): Promise<PostComment[]> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('post_comments')
      .select(`
        *,
        user:users!user_id(id, display_name, username, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .range(page * limit, (page + 1) * limit - 1)

    if (error) {
      logger.error('Error fetching post comments:', error)
      return []
    }

    return data || []
  } catch (error) {
    logger.error('Error fetching post comments:', error)
    return []
  }
}

export async function createComment(input: CreatePostCommentInput): Promise<PostComment | null> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('post_comments')
      .insert(input)
      .select(`
        *,
        user:users!user_id(id, display_name, username, avatar_url)
      `)
      .single()

    if (error) {
      logger.error('Error creating comment:', error)
      return null
    }

    return data
  } catch (error) {
    logger.error('Error creating comment:', error)
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
      .insert({ follower_id: followerId, following_id: followingId })

    if (error) {
      logger.error('Error following user:', error)
      return false
    }

    return true
  } catch (error) {
    logger.error('Error following user:', error)
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
      logger.error('Error unfollowing user:', error)
      return false
    }

    return true
  } catch (error) {
    logger.error('Error unfollowing user:', error)
    return false
  }
}

export async function getUserFollowers(
  userId: string,
  page: number = 0,
  limit: number = 20
): Promise<Follow[]> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('follows')
      .select(`
        *,
        follower:users!follower_id(id, display_name, username, avatar_url)
      `)
      .eq('following_id', userId)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    if (error) {
      logger.error('Error fetching followers:', error)
      return []
    }

    return data || []
  } catch (error) {
    logger.error('Error fetching followers:', error)
    return []
  }
}

export async function getUserFollowing(
  userId: string,
  page: number = 0,
  limit: number = 20
): Promise<Follow[]> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('follows')
      .select(`
        *,
        following:users!following_id(id, display_name, username, avatar_url)
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    if (error) {
      logger.error('Error fetching following:', error)
      return []
    }

    return data || []
  } catch (error) {
    logger.error('Error fetching following:', error)
    return []
  }
}

// ========================================
// FAVORITES FUNCTIONS
// ========================================

export async function getFavoriteGyms(userId: string): Promise<FavoriteGym[]> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('favorite_gyms')
      .select(`
        *,
        gym:gyms!gym_id(
          id,
          name,
          address,
          phone,
          website,
          latitude,
          longitude,
          business_hours,
          price_info,
          images,
          facilities,
          equipment_types,
          prefecture,
          city
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching favorite gyms:', error)
      return []
    }

    return data || []
  } catch (error) {
    logger.error('Error fetching favorite gyms:', error)
    return []
  }
}

export async function addFavoriteGym(userId: string, gymId: string): Promise<boolean> {
  try {
    const { error } = await getSupabaseClient()
      .from('favorite_gyms')
      .insert({ user_id: userId, gym_id: gymId })

    if (error) {
      logger.error('Error adding favorite gym:', error)
      return false
    }

    return true
  } catch (error) {
    logger.error('Error adding favorite gym:', error)
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
      logger.error('Error removing favorite gym:', error)
      return false
    }

    return true
  } catch (error) {
    logger.error('Error removing favorite gym:', error)
    return false
  }
}

// ========================================
// STATS AND ACHIEVEMENTS
// ========================================

export async function getWeeklyStats(userId: string): Promise<WeeklyStats | null> {
  try {
    // 過去7日間の開始日を計算
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)
    weekStart.setHours(0, 0, 0, 0)

    // gym_postsから過去7日分のデータを取得
    const { data: posts, error } = await getSupabaseClient()
      .from('gym_posts')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', weekStart.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching gym posts for weekly stats:', error)
      return null
    }

    if (!posts || posts.length === 0) {
      return {
        user_id: userId,
        workout_count: 0,
        total_weight_kg: 0,
        avg_duration_minutes: 0,
        week_start: weekStart.toISOString(),
        week_end: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }

    // 実際のexercisesデータから重量を計算
    const totalWeightLifted = posts.reduce((sum, post) => {
      if (post.exercises && Array.isArray(post.exercises)) {
        const postWeight = post.exercises.reduce((exerciseSum: number, exercise: any) => {
          if (exercise.sets && Array.isArray(exercise.sets)) {
            return exerciseSum + exercise.sets.reduce((setSum: number, set: any) => {
              return setSum + ((set.weight || 0) * (set.reps || 1))
            }, 0)
          }
          return exerciseSum
        }, 0)
        return sum + postWeight
      }
      return sum
    }, 0)

    // 平均時間の計算（簡略化）
    const avgDuration = posts.reduce((sum, post) => {
      return sum + (post.duration_minutes || 0)
    }, 0) / posts.length

    return {
      user_id: userId,
      workout_count: posts.length,
      total_weight_kg: Math.round(totalWeightLifted),
      avg_duration_minutes: Math.round(avgDuration),
      week_start: weekStart.toISOString(),
      week_end: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    logger.error('Error calculating weekly stats:', error)
    return null
  }
}

export async function getUserAchievements(userId: string): Promise<Achievement[]> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('achieved_at', { ascending: false })

    if (error) {
      logger.error('Error fetching achievements:', error)
      return []
    }

    return data || []
  } catch (error) {
    logger.error('Error fetching achievements:', error)
    return []
  }
}

export async function getUserPersonalRecords(userId: string): Promise<PersonalRecord[]> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('personal_records')
      .select('*')
      .eq('user_id', userId)
      .order('set_at', { ascending: false })

    if (error) {
      logger.error('Error fetching personal records:', error)
      return []
    }

    return data || []
  } catch (error) {
    logger.error('Error fetching personal records:', error)
    return []
  }
}

export async function getProfileDashboard(userId: string): Promise<ProfileDashboard | null> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('profile_dashboards')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      logger.error('Error fetching profile dashboard:', error)
      return null
    }

    return data
  } catch (error) {
    logger.error('Error fetching profile dashboard:', error)
    return null
  }
}