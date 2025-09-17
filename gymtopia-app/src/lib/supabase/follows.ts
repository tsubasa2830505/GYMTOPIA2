import { getSupabaseClient } from './client'



export interface FollowUser {
  id: string
  email: string
  username: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  created_at: string
  is_active: boolean
  last_seen_at: string | null
  posts_count?: number
  is_mutual_follow?: boolean  // 相互フォロー状態
  is_following_back?: boolean
  mutual_follows_count?: number  // 共通の相互フォロー数
}

export interface FollowRelation {
  follower_id: string
  following_id: string
  created_at: string
  follower?: FollowUser
  following?: FollowUser
}

// Get followers for a specific user
export async function getFollowers(userId: string) {
  try {
    // TSUBASAユーザーIDのフォールバック
    const actualUserId = userId || '8ac9e2a5-a702-4d04-b871-21e4a423b4ac';

    const { data, error } = await getSupabaseClient()
      .from('follows')
      .select(`
        *,
        follower:users!follower_id (
          id,
          email,
          username,
          display_name,
          avatar_url,
          bio,
          created_at,
          is_active,
          last_seen_at
        )
      `)
      .eq('following_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get additional stats for each follower
    const followersWithStats = await Promise.all(
      (data || []).map(async (follow) => {
        const follower = follow.follower as any
        
        // Check if current user is following back
        const { data: followBack } = await getSupabaseClient()
          .from('follows')
          .select('id')
          .eq('follower_id', actualUserId)
          .eq('following_id', follower.id)
          .single()

        // Check if it's a mutual follow (相互フォロー)
        const isMutualFollow = !!followBack

        // Get posts count
        const { count: postsCount } = await getSupabaseClient()
          .from('gym_posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', follower.id)

        // Get mutual friends count
        const { data: userFollowing } = await getSupabaseClient()
          .from('follows')
          .select('following_id')
          .eq('follower_id', actualUserId)

        const { data: followerFollowing } = await getSupabaseClient()
          .from('follows')
          .select('following_id')
          .eq('follower_id', follower.id)

        const userFollowingIds = userFollowing?.map(f => f.following_id) || []
        const followerFollowingIds = followerFollowing?.map(f => f.following_id) || []
        const mutualCount = userFollowingIds.filter(id => followerFollowingIds.includes(id)).length

        return {
          ...follower,
          follow_date: follow.created_at,
          is_following_back: !!followBack,
          is_mutual_follow: isMutualFollow,
          posts_count: postsCount || 0,
          mutual_follows_count: mutualCount
        }
      })
    )

    return { data: followersWithStats, error: null }
  } catch (error) {
    console.error('Error fetching followers:', error)
    return { data: null, error }
  }
}

// Get users that a specific user is following
export async function getFollowing(userId: string) {
  try {
    // TSUBASAユーザーIDのフォールバック
    const actualUserId = userId || '8ac9e2a5-a702-4d04-b871-21e4a423b4ac';

    if (!actualUserId) {
      return { data: [], error: null }
    }

    const { data, error } = await getSupabaseClient()
      .from('follows')
      .select(`
        *,
        following:users!following_id (
          id,
          email,
          username,
          display_name,
          avatar_url,
          bio,
          created_at,
          is_active,
          last_seen_at
        )
      `)
      .eq('follower_id', actualUserId)
      .order('created_at', { ascending: false })

    if (error) throw error

    if (!data || data.length === 0) {
      return { data: [], error: null }
    }

    // Get additional stats for each following user
    const followingWithStats = await Promise.all(
      (data || []).map(async (follow) => {
        const following = follow.following as any

        // Check if they follow back (mutual follow)
        const { data: followsBack } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', following.id)
          .eq('following_id', actualUserId)
          .single()

        const isMutualFollow = !!followsBack

        // Get posts count
        const { count: postsCount } = await getSupabaseClient()
          .from('gym_posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', following.id)

        // Get mutual friends count
        const { data: userFollowing } = await getSupabaseClient()
          .from('follows')
          .select('following_id')
          .eq('follower_id', actualUserId)

        const { data: targetFollowing } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', following.id)

        const userFollowingIds = userFollowing?.map(f => f.following_id) || []
        const targetFollowingIds = targetFollowing?.map(f => f.following_id) || []
        const mutualCount = userFollowingIds.filter(id => targetFollowingIds.includes(id)).length

        return {
          ...following,
          follow_date: follow.created_at,
          is_mutual_follow: isMutualFollow,
          posts_count: postsCount || 0,
          mutual_follows_count: mutualCount
        }
      })
    )

    return { data: followingWithStats, error: null }
  } catch (error) {
    console.error('Error fetching following:', error)
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get follower and following counts
export async function getFollowCounts(userId: string) {
  try {
    const [followersResult, followingResult] = await Promise.all([
      getSupabaseClient()
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId),
      getSupabaseClient()
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId)
    ])

    return {
      followers: followersResult.count || 0,
      following: followingResult.count || 0,
      error: null
    }
  } catch (error) {
    console.error('Error fetching follow counts:', error)
    return { followers: 0, following: 0, error }
  }
}

// Follow a user
export async function followUser(followerId: string, followingId: string) {
  try {
    const { data, error } = await getSupabaseClient()
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: followingId
      })
      .select()
      .single()

    if (error) throw error

    // Create notification for the followed user
    await getSupabaseClient()
      .from('notifications')
      .insert({
        user_id: followingId,
        type: 'follow',
        title: '新しいフォロワー',
        message: 'あなたをフォローしました',
        related_user_id: followerId,
        is_read: false
      })

    return { data, error: null }
  } catch (error) {
    console.error('Error following user:', error)
    return { data: null, error }
  }
}

// Unfollow a user
export async function unfollowUser(followerId: string, followingId: string) {
  try {
    const { error } = await getSupabaseClient()
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId)

    if (error) throw error

    return { success: true, error: null }
  } catch (error) {
    console.error('Error unfollowing user:', error)
    return { success: false, error }
  }
}

// Check if user A is following user B
export async function isFollowing(followerId: string, followingId: string) {
  try {
    const { data, error } = await getSupabaseClient()
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return { isFollowing: !!data, error: null }
  } catch (error) {
    console.error('Error checking follow status:', error)
    return { isFollowing: false, error }
  }
}

// Get mutual followers (people who follow both users)
export async function getMutualFollowers(userId1: string, userId2: string) {
  try {
    const [followers1, followers2] = await Promise.all([
      getSupabaseClient()
        .from('follows')
        .select('follower_id')
        .eq('following_id', userId1),
      getSupabaseClient()
        .from('follows')
        .select('follower_id')
        .eq('following_id', userId2)
    ])

    const followers1Ids = followers1.data?.map(f => f.follower_id) || []
    const followers2Ids = followers2.data?.map(f => f.follower_id) || []
    
    const mutualIds = followers1Ids.filter(id => followers2Ids.includes(id))

    if (mutualIds.length === 0) {
      return { data: [], error: null }
    }

    const { data, error } = await getSupabaseClient()
      .from('users')
      .select('*')
      .in('id', mutualIds)

    return { data, error }
  } catch (error) {
    console.error('Error fetching mutual followers:', error)
    return { data: null, error }
  }
}
