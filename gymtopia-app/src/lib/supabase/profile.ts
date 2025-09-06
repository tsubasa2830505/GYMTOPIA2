// Profile and social features API functions for GYMTOPIA 2.0

import { createClient } from '@supabase/supabase-js'
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ========================================
// USER PROFILE FUNCTIONS
// ========================================

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data as UserProfile
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

export async function getUserProfileStats(userId: string): Promise<UserProfileStats | null> {
  try {
    // Try to fetch from database first
    const { data, error } = await supabase
      .from('user_profile_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (data && !error) {
      return data as UserProfileStats
    }
  } catch (error) {
    // If table doesn't exist, fallback to mock data
    console.log('user_profile_stats table not found, using mock data')
  }
  
  // Return mock profile stats
  return {
    id: `mock-stats-${userId}`,
    user_id: userId,
    display_name: '筋トレマニア太郎',
    username: 'muscle_taro',
    bio: '筋トレ歴3年のフィットネス愛好家です。ベンチプレス120kgが目標！毎日の積み重ねを大切にしています💪',
    avatar_url: '/muscle-taro-avatar.svg',
    is_verified: true,
    gym_visits_count: 245,
    following_count: 128,
    followers_count: 89,
    location: '東京都渋谷区',
    joined_date: '2023-06-01T00:00:00.000Z',
    created_at: '2023-06-01T00:00:00.000Z',
    updated_at: new Date().toISOString()
  } as UserProfileStats
}

export async function updateUserProfile(
  userId: string, 
  updates: UpdateProfileInput
): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data as UserProfile
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
    const offset = (page - 1) * limit

    const { data, error } = await supabase
      .from('gym_posts')
      .select(`
        *,
        user:profiles(id, display_name, username, avatar_url, is_verified),
        workout_session:workout_sessions(
          id, started_at, ended_at,
          gym:gyms(id, name, area)
        )
      `)
      .eq('user_id', userId)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (data && !error) {
      return data as GymPost[]
    }
  } catch (error) {
    console.log('gym_posts table not found, using mock data')
  }

  // Return mock posts for testing
  return [
    {
      id: `mock-post-1-${userId}`,
      user_id: userId,
      workout_session_id: `mock-session-1-${userId}`,
      content: '今日はベンチプレス115kgが上がった！新年から絶好調💪 継続は力なり！',
      training_details: {
        exercises: [
          { name: 'ベンチプレス', weight: [115], sets: 3, reps: [5, 4, 3] },
          { name: 'インクラインプレス', weight: [85], sets: 3, reps: [8, 7, 6] }
        ]
      },
      image_url: null,
      is_public: true,
      likes_count: 15,
      comments_count: 3,
      shares_count: 2,
      created_at: '2024-01-05T19:35:00.000Z',
      updated_at: '2024-01-05T19:35:00.000Z',
      user: {
        id: userId,
        display_name: '筋トレマニア太郎',
        username: 'muscle_taro',
        avatar_url: '/muscle-taro-avatar.svg',
        is_verified: true
      },
      workout_session: {
        id: `mock-session-1-${userId}`,
        started_at: '2024-01-05T18:00:00.000Z',
        ended_at: '2024-01-05T19:30:00.000Z',
        gym: {
          id: 'mock-gym-1',
          name: 'ハンマーストレングス渋谷',
          area: '渋谷'
        }
      }
    },
    {
      id: `mock-post-2-${userId}`,
      user_id: userId,
      workout_session_id: `mock-session-2-${userId}`,
      content: '新年初トレ！ROGUEでクロストレーニング🔥 体が重いけど気合で乗り切った',
      training_details: {
        exercises: [
          { name: 'デッドリフト', weight: [140], sets: 3, reps: [3, 2, 1] },
          { name: 'スクワット', weight: [120], sets: 4, reps: [8, 6, 5, 4] }
        ]
      },
      image_url: null,
      is_public: true,
      likes_count: 12,
      comments_count: 5,
      shares_count: 1,
      created_at: '2024-01-03T20:20:00.000Z',
      updated_at: '2024-01-03T20:20:00.000Z',
      user: {
        id: userId,
        display_name: '筋トレマニア太郎',
        username: 'muscle_taro',
        avatar_url: '/muscle-taro-avatar.svg',
        is_verified: true
      },
      workout_session: {
        id: `mock-session-2-${userId}`,
        started_at: '2024-01-03T19:00:00.000Z',
        ended_at: '2024-01-03T20:15:00.000Z',
        gym: {
          id: 'mock-gym-2',
          name: 'ROGUEクロストレーニング新宿',
          area: '新宿'
        }
      }
    },
    {
      id: `mock-post-3-${userId}`,
      user_id: userId,
      workout_session_id: `mock-session-3-${userId}`,
      content: '2024年のトレーニング開始！今年も筋トレ頑張るぞ💪 目標はベンチ120kg！',
      training_details: {
        exercises: [
          { name: 'ベンチプレス', weight: [110], sets: 4, reps: [6, 5, 4, 3] },
          { name: 'ダンベルフライ', weight: [32.5], sets: 3, reps: [12, 10, 8] }
        ]
      },
      image_url: null,
      is_public: true,
      likes_count: 8,
      comments_count: 2,
      shares_count: 0,
      created_at: '2024-01-01T18:50:00.000Z',
      updated_at: '2024-01-01T18:50:00.000Z',
      user: {
        id: userId,
        display_name: '筋トレマニア太郎',
        username: 'muscle_taro',
        avatar_url: '/muscle-taro-avatar.svg',
        is_verified: true
      },
      workout_session: {
        id: `mock-session-3-${userId}`,
        started_at: '2024-01-01T17:00:00.000Z',
        ended_at: '2024-01-01T18:45:00.000Z',
        gym: {
          id: 'mock-gym-1',
          name: 'ハンマーストレングス渋谷',
          area: '渋谷'
        }
      }
    }
  ] as GymPost[]
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
        user:profiles(id, display_name, username, avatar_url, is_verified)
      `)
      .single()

    if (error) throw error
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

    if (error) throw error
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

    if (error) throw error
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

    if (error) throw error
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

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error unliking post:', error)
    return false
  }
}

// ========================================
// COMMENTS FUNCTIONS
// ========================================

export async function getPostComments(postId: string): Promise<PostComment[]> {
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        user:profiles(id, display_name, username, avatar_url)
      `)
      .eq('post_id', postId)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data as PostComment[]
  } catch (error) {
    console.error('Error fetching post comments:', error)
    return []
  }
}

export async function createPostComment(
  userId: string,
  postId: string,
  commentData: CreatePostCommentInput
): Promise<PostComment | null> {
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        user_id: userId,
        post_id: postId,
        ...commentData
      })
      .select(`
        *,
        user:profiles(id, display_name, username, avatar_url)
      `)
      .single()

    if (error) throw error
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

    if (error) throw error
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

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error unfollowing user:', error)
    return false
  }
}

export async function getFollowers(userId: string): Promise<Follow[]> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        *,
        follower:profiles!follower_id(id, display_name, username, avatar_url)
      `)
      .eq('following_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Follow[]
  } catch (error) {
    console.error('Error fetching followers:', error)
    return []
  }
}

export async function getFollowing(userId: string): Promise<Follow[]> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        *,
        following:profiles!following_id(id, display_name, username, avatar_url)
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Follow[]
  } catch (error) {
    console.error('Error fetching following:', error)
    return []
  }
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return !!data
  } catch (error) {
    console.error('Error checking follow status:', error)
    return false
  }
}

// ========================================
// GYM FRIENDS FUNCTIONS
// ========================================

export async function sendGymFriendRequest(
  userId: string,
  requestData: GymFriendRequestInput
): Promise<GymFriend | null> {
  try {
    // Ensure user1_id < user2_id for consistency
    const user1_id = userId < requestData.user2_id ? userId : requestData.user2_id
    const user2_id = userId < requestData.user2_id ? requestData.user2_id : userId

    const { data, error } = await supabase
      .from('gym_friends')
      .insert({
        user1_id,
        user2_id,
        gym_id: requestData.gym_id,
        initiated_by: userId,
        friendship_status: 'pending'
      })
      .select()
      .single()

    if (error) throw error
    return data as GymFriend
  } catch (error) {
    console.error('Error sending gym friend request:', error)
    return null
  }
}

export async function acceptGymFriendRequest(friendshipId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('gym_friends')
      .update({
        friendship_status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', friendshipId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error accepting gym friend request:', error)
    return false
  }
}

export async function getGymFriends(userId: string): Promise<GymFriend[]> {
  try {
    const { data, error } = await supabase
      .from('gym_friends')
      .select(`
        *,
        user1:profiles!user1_id(id, display_name, username, avatar_url),
        user2:profiles!user2_id(id, display_name, username, avatar_url),
        gym:gyms(id, name, area)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('friendship_status', 'accepted')
      .order('accepted_at', { ascending: false })

    if (error) throw error
    return data as GymFriend[]
  } catch (error) {
    console.error('Error fetching gym friends:', error)
    return []
  }
}

// ========================================
// FAVORITE GYMS FUNCTIONS
// ========================================

export async function addFavoriteGym(userId: string, gymId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('favorite_gyms')
      .insert({
        user_id: userId,
        gym_id: gymId
      })

    if (error) throw error
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

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error removing favorite gym:', error)
    return false
  }
}

export async function getFavoriteGyms(userId: string): Promise<FavoriteGym[]> {
  try {
    // Try to fetch from database first
    const { data, error } = await supabase
      .from('favorite_gyms')
      .select(`
        *,
        gym:gyms(id, name, area, description)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (data && !error) {
      return data as FavoriteGym[]
    }
  } catch (error) {
    // If table doesn't exist, fallback to mock data
    console.log('favorite_gyms table not found, using mock data')
  }
  
  // Return mock favorite gyms with some actual gym data from existing gyms table
  return [
    {
      id: `mock-fav-1-${userId}`,
      user_id: userId,
      gym_id: 'gym-1',
      created_at: '2023-11-01T00:00:00.000Z',
      gym: {
        id: 'gym-1',
        name: 'ハンマーストレングス渋谷',
        area: '東京都渋谷区',
        description: 'プロフェッショナル向けの本格的なトレーニング施設',
        users_count: 234
      }
    },
    {
      id: `mock-fav-2-${userId}`,
      user_id: userId,
      gym_id: 'gym-2',
      created_at: '2023-10-15T00:00:00.000Z',
      gym: {
        id: 'gym-2',
        name: 'ROGUEクロストレーニング新宿',
        area: '東京都新宿区',
        description: 'クロスフィット専門の最新設備を完備',
        users_count: 189
      }
    },
    {
      id: `mock-fav-3-${userId}`,
      user_id: userId,
      gym_id: 'gym-3',
      created_at: '2023-09-20T00:00:00.000Z',
      gym: {
        id: 'gym-3',
        name: 'プレミアムフィットネス銀座',
        area: '東京都中央区',
        description: '高級感あふれる都心のプレミアムジム',
        users_count: 456
      }
    }
  ] as FavoriteGym[]
}

// ========================================
// STATISTICS FUNCTIONS
// ========================================

export async function getWeeklyStats(userId: string): Promise<WeeklyStats | null> {
  try {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of week
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6) // End of week

    const { data: workoutSessions, error } = await supabase
      .from('workout_sessions')
      .select(`
        id, started_at, ended_at, total_weight_lifted,
        workout_exercises(exercise_name)
      `)
      .eq('user_id', userId)
      .gte('started_at', weekStart.toISOString())
      .lte('started_at', weekEnd.toISOString())
      .order('started_at', { ascending: false })

    if (workoutSessions && !error) {
      const workoutCount = workoutSessions?.length || 0
      const totalWeight = workoutSessions?.reduce((sum, session) => sum + (session.total_weight_lifted || 0), 0) || 0
      
      const durations = workoutSessions?.map(session => {
        if (session.started_at && session.ended_at) {
          return (new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / (1000 * 60)
        }
        return 0
      }).filter(d => d > 0) || []
      
      const avgDuration = durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0

      // Count exercise frequency
      const exerciseCount: { [key: string]: number } = {}
      workoutSessions?.forEach(session => {
        session.workout_exercises?.forEach(exercise => {
          exerciseCount[exercise.exercise_name] = (exerciseCount[exercise.exercise_name] || 0) + 1
        })
      })

      const favoriteExercises = Object.entries(exerciseCount)
        .map(([name, frequency]) => ({ name, frequency }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5)

      return {
        workout_count: workoutCount,
        total_weight_kg: totalWeight,
        avg_duration_minutes: Math.round(avgDuration),
        streak_days: await calculateWorkoutStreak(userId),
        favorite_exercises: favoriteExercises,
        workout_dates: workoutSessions?.map(s => s.started_at.split('T')[0]) || []
      }
    }
  } catch (error) {
    console.log('workout_sessions table not found, using mock weekly stats')
  }

  // Return mock weekly stats
  return {
    workout_count: 4,
    total_weight_kg: 12500,
    avg_duration_minutes: 85,
    streak_days: 12,
    favorite_exercises: [
      { name: 'ベンチプレス', frequency: 4 },
      { name: 'スクワット', frequency: 3 },
      { name: 'デッドリフト', frequency: 2 },
      { name: 'ショルダープレス', frequency: 2 },
      { name: 'バーベルロウ', frequency: 1 }
    ],
    workout_dates: [
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Yesterday
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
      new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
      new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]  // 6 days ago
    ]
  }
}

async function calculateWorkoutStreak(userId: string): Promise<number> {
  try {
    const { data: workoutDates, error } = await supabase
      .from('workout_sessions')
      .select('started_at')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(100) // Look at last 100 workouts

    if (error) throw error

    const uniqueDates = [...new Set(
      workoutDates?.map(session => session.started_at.split('T')[0]) || []
    )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    let streak = 0
    const today = new Date().toISOString().split('T')[0]
    let checkDate = today

    for (const workoutDate of uniqueDates) {
      if (workoutDate === checkDate) {
        streak++
        const prevDate = new Date(checkDate)
        prevDate.setDate(prevDate.getDate() - 1)
        checkDate = prevDate.toISOString().split('T')[0]
      } else {
        break
      }
    }

    return streak
  } catch (error) {
    console.error('Error calculating workout streak:', error)
    return 0
  }
}

export async function getUserAchievements(userId: string): Promise<Achievement[]> {
  try {
    // Try to fetch from database first
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })

    if (data && !error) {
      return data as Achievement[]
    }
  } catch (error) {
    // If table doesn't exist, fallback to mock data
    console.log('achievements table not found, using mock data')
  }
  
  // Return mock achievements
  return [
    {
      id: `mock-achievement-1-${userId}`,
      user_id: userId,
      achievement_type: 'milestone',
      title: '初回記録達成',
      description: '初回のワークアウトを記録しました',
      badge_icon: '🏆',
      earned_at: '2023-06-01T00:00:00.000Z',
      created_at: '2023-06-01T00:00:00.000Z'
    },
    {
      id: `mock-achievement-2-${userId}`,
      user_id: userId,
      achievement_type: 'streak',
      title: '100日連続ジム通い',
      description: '100日連続でジムに通いました',
      badge_icon: '🔥',
      earned_at: '2023-08-01T00:00:00.000Z',
      created_at: '2023-08-01T00:00:00.000Z'
    },
    {
      id: `mock-achievement-3-${userId}`,
      user_id: userId,
      achievement_type: 'milestone',
      title: 'ジム新人100突破',
      description: 'ジム利用回数が100回を突破しました',
      badge_icon: '🎯',
      earned_at: '2023-10-01T00:00:00.000Z',
      created_at: '2023-10-01T00:00:00.000Z'
    },
    {
      id: `mock-achievement-4-${userId}`,
      user_id: userId,
      achievement_type: 'personal_record',
      title: 'ベンチプレス100kg達成',
      description: 'ベンチプレスで100kgを達成しました',
      badge_icon: '💪',
      earned_at: '2023-12-01T00:00:00.000Z',
      created_at: '2023-12-01T00:00:00.000Z'
    }
  ] as Achievement[]
}

export async function getUserPersonalRecords(userId: string): Promise<PersonalRecord[]> {
  try {
    // Try to fetch from database first
    const { data, error } = await supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', userId)
      .order('achieved_at', { ascending: false })

    if (data && !error) {
      return data as PersonalRecord[]
    }
  } catch (error) {
    // If table doesn't exist, fallback to mock data
    console.log('personal_records table not found, using mock data')
  }
  
  // Return mock personal records
  return [
    {
      id: `mock-pr-1-${userId}`,
      user_id: userId,
      exercise_name: 'ベンチプレス',
      record_type: '1RM',
      weight: 120,
      reps: 1,
      achieved_at: '2023-12-01T00:00:00.000Z',
      created_at: '2023-12-01T00:00:00.000Z'
    },
    {
      id: `mock-pr-2-${userId}`,
      user_id: userId,
      exercise_name: 'スクワット',
      record_type: '3RM',
      weight: 130,
      reps: 3,
      achieved_at: '2023-11-15T00:00:00.000Z',
      created_at: '2023-11-15T00:00:00.000Z'
    },
    {
      id: `mock-pr-3-${userId}`,
      user_id: userId,
      exercise_name: 'デッドリフト',
      record_type: '1RM',
      weight: 150,
      reps: 1,
      achieved_at: '2023-10-20T00:00:00.000Z',
      created_at: '2023-10-20T00:00:00.000Z'
    },
    {
      id: `mock-pr-4-${userId}`,
      user_id: userId,
      exercise_name: 'ショルダープレス',
      record_type: '8RM',
      weight: 60,
      reps: 8,
      achieved_at: '2023-09-30T00:00:00.000Z',
      created_at: '2023-09-30T00:00:00.000Z'
    }
  ] as PersonalRecord[]
}

// ========================================
// DASHBOARD FUNCTION
// ========================================

export async function getProfileDashboard(userId: string): Promise<ProfileDashboard | null> {
  try {
    const [
      userStats,
      recentPosts,
      recentAchievements,
      personalRecords,
      weeklyStats,
      favoriteGyms
    ] = await Promise.all([
      getUserProfileStats(userId),
      getUserPosts(userId, 1, 3),
      supabase.from('achievements').select('*').eq('user_id', userId).order('earned_at', { ascending: false }).limit(4),
      supabase.from('personal_records').select('*').eq('user_id', userId).order('achieved_at', { ascending: false }).limit(4),
      getWeeklyStats(userId),
      getFavoriteGyms(userId)
    ])

    if (!userStats) return null

    return {
      user: userStats,
      recent_posts: recentPosts,
      recent_achievements: recentAchievements.data || [],
      personal_records: personalRecords.data || [],
      weekly_stats: weeklyStats || {
        workout_count: 0,
        total_weight_kg: 0,
        avg_duration_minutes: 0,
        streak_days: 0,
        favorite_exercises: [],
        workout_dates: []
      },
      favorite_gyms: favoriteGyms.slice(0, 4)
    }
  } catch (error) {
    console.error('Error fetching profile dashboard:', error)
    return null
  }
}