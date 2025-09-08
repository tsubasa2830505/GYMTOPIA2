import { supabase } from './client'


export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string | null
  related_user_id: string | null
  related_post_id: string | null
  related_gym_id: string | null
  is_read: boolean
  created_at: string
  related_user?: any
  related_post?: any
  related_gym?: any
}

// Get user's notifications
export async function getUserNotifications(
  userId: string,
  unreadOnly = false,
  limit = 20,
  offset = 0
) {
  try {
    let query = supabase
      .from('notifications')
      .select(`
        *,
        related_user:related_user_id(id, username, display_name, avatar_url),
        related_post:related_post_id(id, content),
        related_gym:related_gym_id(id, name)
      `)
      .eq('user_id', userId)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return { data: null, error }
  }
}

// Get unread notification count
export async function getUnreadNotificationCount(userId: string) {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) throw error
    return { count: count || 0, error: null }
  } catch (error) {
    console.error('Error fetching unread notification count:', error)
    return { count: 0, error }
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return { data: null, error }
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return { success: false, error }
  }
}

// Delete notification
export async function deleteNotification(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting notification:', error)
    return { success: false, error }
  }
}

// Delete all read notifications
export async function deleteReadNotifications(userId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('is_read', true)

    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting read notifications:', error)
    return { success: false, error }
  }
}

// Create notification
export async function createNotification(
  notification: {
    user_id: string
    type: string
    title: string
    message?: string
    related_user_id?: string
    related_post_id?: string
    related_gym_id?: string
  }
) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        is_read: false
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating notification:', error)
    return { data: null, error }
  }
}

// Create bulk notifications (for announcements)
export async function createBulkNotifications(
  userIds: string[],
  notification: {
    type: string
    title: string
    message?: string
    related_gym_id?: string
  }
) {
  try {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      ...notification,
      is_read: false
    }))

    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating bulk notifications:', error)
    return { data: null, error }
  }
}

// Get notification preferences (if implemented)
export async function getNotificationPreferences(userId: string) {
  // This would be implemented if there's a user_preferences table
  // For now, return default preferences
  return {
    data: {
      likes: true,
      comments: true,
      follows: true,
      gym_friends: true,
      workout_reminders: true,
      achievements: true,
      gym_updates: true
    },
    error: null
  }
}

// Update notification preferences (if implemented)
export async function updateNotificationPreferences(
  userId: string,
  preferences: Record<string, boolean>
) {
  // This would be implemented if there's a user_preferences table
  // For now, just return success
  return { success: true, error: null }
}