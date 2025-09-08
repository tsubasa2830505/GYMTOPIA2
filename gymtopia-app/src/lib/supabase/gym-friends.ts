import { createClient } from '@supabase/supabase-js'

// Supabaseクライアントを関数内で初期化
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration is missing')
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

export interface GymFriend {
  id: string
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
  accepted_at: string | null
  user?: any
  friend?: any
}

// Get user's gym friends
export async function getGymFriends(userId: string, status?: 'pending' | 'accepted' | 'blocked') {
  try {
    const supabase = getSupabaseClient()
    let query = supabase
      .from('gym_friends')
      .select(`
        *,
        friend:friend_id(id, username, display_name, avatar_url, bio),
        user:user_id(id, username, display_name, avatar_url, bio)
      `)
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    // Format the data to always show the other person as "friend"
    const formattedData = data?.map(item => {
      const isUser = item.user_id === userId
      return {
        ...item,
        friend: isUser ? item.friend : item.user,
        is_requester: isUser
      }
    })

    return { data: formattedData, error: null }
  } catch (error) {
    console.error('Error fetching gym friends:', error)
    return { data: null, error }
  }
}

// Send gym friend request
export async function sendGymFriendRequest(userId: string, friendId: string) {
  try {
    const supabase = getSupabaseClient()
    // Check if request already exists
    const { data: existing } = await supabase
      .from('gym_friends')
      .select('id')
      .or(`user_id.eq.${userId},friend_id.eq.${friendId}`)
      .or(`user_id.eq.${friendId},friend_id.eq.${userId}`)
      .single()

    if (existing) {
      return { data: null, error: { message: 'Friend request already exists' } }
    }

    const { data, error } = await supabase
      .from('gym_friends')
      .insert({
        user_id: userId,
        friend_id: friendId,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: friendId,
        type: 'gym_friend_request',
        title: 'ジム友達リクエスト',
        message: 'ジム友達のリクエストが届きました',
        related_user_id: userId,
        is_read: false
      })

    return { data, error: null }
  } catch (error) {
    console.error('Error sending gym friend request:', error)
    return { data: null, error }
  }
}

// Accept gym friend request
export async function acceptGymFriendRequest(requestId: string) {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('gym_friends')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single()

    if (error) throw error

    // Create notification for the requester
    if (data) {
      await supabase
        .from('notifications')
        .insert({
          user_id: data.user_id,
          type: 'gym_friend_accept',
          title: 'ジム友達承認',
          message: 'ジム友達リクエストが承認されました',
          related_user_id: data.friend_id,
          is_read: false
        })
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error accepting gym friend request:', error)
    return { data: null, error }
  }
}

// Reject gym friend request
export async function rejectGymFriendRequest(requestId: string) {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('gym_friends')
      .delete()
      .eq('id', requestId)

    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Error rejecting gym friend request:', error)
    return { success: false, error }
  }
}

// Remove gym friend
export async function removeGymFriend(userId: string, friendId: string) {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('gym_friends')
      .delete()
      .or(`user_id.eq.${userId},friend_id.eq.${friendId}`)
      .or(`user_id.eq.${friendId},friend_id.eq.${userId}`)

    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Error removing gym friend:', error)
    return { success: false, error }
  }
}

// Block user
export async function blockUser(userId: string, blockedUserId: string) {
  try {
    const supabase = getSupabaseClient()
    // Check if relationship exists
    const { data: existing } = await supabase
      .from('gym_friends')
      .select('id')
      .or(`user_id.eq.${userId},friend_id.eq.${blockedUserId}`)
      .or(`user_id.eq.${blockedUserId},friend_id.eq.${userId}`)
      .single()

    if (existing) {
      // Update existing relationship
      const { data, error } = await supabase
        .from('gym_friends')
        .update({ status: 'blocked' })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } else {
      // Create new blocked relationship
      const { data, error } = await supabase
        .from('gym_friends')
        .insert({
          user_id: userId,
          friend_id: blockedUserId,
          status: 'blocked'
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    }
  } catch (error) {
    console.error('Error blocking user:', error)
    return { data: null, error }
  }
}

// Unblock user
export async function unblockUser(userId: string, blockedUserId: string) {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('gym_friends')
      .delete()
      .eq('status', 'blocked')
      .or(`user_id.eq.${userId},friend_id.eq.${blockedUserId}`)
      .or(`user_id.eq.${blockedUserId},friend_id.eq.${userId}`)

    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Error unblocking user:', error)
    return { success: false, error }
  }
}

// Check if users are gym friends
export async function areGymFriends(userId1: string, userId2: string) {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('gym_friends')
      .select('id, status')
      .or(`user_id.eq.${userId1},friend_id.eq.${userId2}`)
      .or(`user_id.eq.${userId2},friend_id.eq.${userId1}`)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return {
      areFriends: data?.status === 'accepted',
      isPending: data?.status === 'pending',
      isBlocked: data?.status === 'blocked',
      error: null
    }
  } catch (error) {
    console.error('Error checking gym friend status:', error)
    return { areFriends: false, isPending: false, isBlocked: false, error }
  }
}

// Get gym friend suggestions
export async function getGymFriendSuggestions(userId: string, limit = 10) {
  try {
    const supabase = getSupabaseClient()
    // Get user's current friends and pending requests
    const { data: existingRelations } = await supabase
      .from('gym_friends')
      .select('friend_id, user_id')
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)

    const excludedIds = [userId]
    if (existingRelations) {
      existingRelations.forEach(rel => {
        excludedIds.push(rel.user_id === userId ? rel.friend_id : rel.user_id)
      })
    }

    // Get users who go to the same gyms
    const { data: userGyms } = await supabase
      .from('workout_sessions')
      .select('gym_id')
      .eq('user_id', userId)
      .not('gym_id', 'is', null)
      .limit(10)

    if (!userGyms || userGyms.length === 0) {
      // If no gym data, just get random users
      const { data: suggestions } = await supabase
        .from('users')
        .select('id, username, display_name, avatar_url, bio')
        .not('id', 'in', `(${excludedIds.join(',')})`)
        .limit(limit)

      return { data: suggestions, error: null }
    }

    const gymIds = [...new Set(userGyms.map(g => g.gym_id))]

    // Find other users who go to the same gyms
    const { data: gymGoers } = await supabase
      .from('workout_sessions')
      .select('user_id')
      .in('gym_id', gymIds)
      .not('user_id', 'in', `(${excludedIds.join(',')})`)

    if (!gymGoers || gymGoers.length === 0) {
      // If no other gym goers, get random users
      const { data: suggestions } = await supabase
        .from('users')
        .select('id, username, display_name, avatar_url, bio')
        .not('id', 'in', `(${excludedIds.join(',')})`)
        .limit(limit)

      return { data: suggestions, error: null }
    }

    // Count frequency of gym overlap
    const userFrequency = gymGoers.reduce((acc, g) => {
      acc[g.user_id] = (acc[g.user_id] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Sort by frequency and get top users
    const topUserIds = Object.entries(userFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([id]) => id)

    // Get user details
    const { data: suggestions } = await supabase
      .from('users')
      .select('id, username, display_name, avatar_url, bio')
      .in('id', topUserIds)

    return { data: suggestions, error: null }
  } catch (error) {
    console.error('Error getting gym friend suggestions:', error)
    return { data: null, error }
  }
}