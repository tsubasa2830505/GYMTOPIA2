import { supabase } from './client'



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
  gym_friends_count?: number
  is_gym_friend?: boolean
  is_following_back?: boolean
  mutual_friends_count?: number
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
    const { data, error } = await supabase
      .from('follows')
      .select(`
        *,
        follower:follower_id (
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
        const { data: followBack } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', userId)
          .eq('following_id', follower.id)
          .single()

        // Check if they are gym friends
        const { data: gymFriend } = await supabase
          .from('gym_friends')
          .select('id')
          .or(`and(user1_id.eq.${userId},user2_id.eq.${follower.id}),and(user2_id.eq.${userId},user1_id.eq.${follower.id})`)
          .eq('friendship_status', 'accepted')
          .limit(1)
          .single()

        // Get posts count
        const { count: postsCount } = await supabase
          .from('gym_posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', follower.id)

        // Get mutual friends count
        const { data: userFollowing } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', userId)

        const { data: followerFollowing } = await supabase
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
          is_gym_friend: !!gymFriend,
          posts_count: postsCount || 0,
          mutual_friends_count: mutualCount
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
    const { data, error } = await supabase
      .from('follows')
      .select(`
        *,
        following:following_id (
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
      .eq('follower_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get additional stats for each following user
    const followingWithStats = await Promise.all(
      (data || []).map(async (follow) => {
        const following = follow.following as any
        
        // Check if they are gym friends
        const { data: gymFriend } = await supabase
          .from('gym_friends')
          .select('id')
          .or(`and(user1_id.eq.${userId},user2_id.eq.${following.id}),and(user2_id.eq.${userId},user1_id.eq.${following.id})`)
          .eq('friendship_status', 'accepted')
          .limit(1)
          .single()

        // Get posts count
        const { count: postsCount } = await supabase
          .from('gym_posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', following.id)

        // Get mutual friends count
        const { data: userFollowing } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', userId)

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
          is_gym_friend: !!gymFriend,
          posts_count: postsCount || 0,
          mutual_friends_count: mutualCount
        }
      })
    )

    return { data: followingWithStats, error: null }
  } catch (error) {
    console.error('Error fetching following:', error)
    return { data: null, error }
  }
}

// Get follower and following counts
export async function getFollowCounts(userId: string) {
  try {
    const [followersResult, followingResult] = await Promise.all([
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId),
      supabase
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
    const { data, error } = await supabase
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: followingId
      })
      .select()
      .single()

    if (error) throw error

    // Create notification for the followed user
    await supabase
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
    const { error } = await supabase
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
    const { data, error } = await supabase
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
      supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', userId1),
      supabase
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

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .in('id', mutualIds)

    return { data, error }
  } catch (error) {
    console.error('Error fetching mutual followers:', error)
    return { data: null, error }
  }
}
