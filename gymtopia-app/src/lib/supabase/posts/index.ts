// Modular posts API - Re-exports from original posts.ts for backward compatibility
import { getSupabaseClient } from '../client'
import type { GymPost as Post, PostComment as Comment } from '@/lib/types/profile'
import { getRecentCheckinForGym } from '../checkin'
import { logger } from '../../utils/logger'
import { scheduleDelayedPost } from '../delayed-posts'

// Re-export the types for backward compatibility
export type { Post, Comment }

// フィードの投稿を取得
export async function getFeedPosts(
  limit = 20,
  offset = 0,
  filter: 'all' | 'following' | 'mutual' | 'same-gym' = 'all',
  userId?: string
) {
  try {
    logger.log('getFeedPosts: Fetching posts with filter:', filter, 'userId:', userId);

    const { data: { user } } = await getSupabaseClient().auth.getUser()
    // Use provided userId or authenticated user
    const actualUserId = userId || user?.id

    if (!actualUserId && filter !== 'all') {
      logger.log('getFeedPosts: No user ID available for filtered feed, returning all posts');
      filter = 'all'; // フィルターには認証が必要
    }

    let query = getSupabaseClient()
      .from('gym_posts')
      .select(`
        *,
        likes_count:post_likes(count),
        comments_count:post_comments(count),
        user:users!gym_posts_user_id_fkey (
          id,
          display_name,
          username,
          avatar_url
        ),
        gym:gyms!gym_posts_gym_id_fkey (
          id,
          name,
          address
        )
      `)

    // フィルター処理
    if (actualUserId) {
      if (filter === 'following') {
        // フォロー中のユーザーの投稿のみを取得
        const { data: followingData } = await getSupabaseClient()
          .from('follows')
          .select('following_id')
          .eq('follower_id', actualUserId)

        if (followingData && followingData.length > 0) {
          const followingIds = followingData.map(f => f.following_id)
          query = query.in('user_id', followingIds)
        } else {
          return [] // フォローしているユーザーがいない場合は空を返す
        }
      } else if (filter === 'mutual') {
        // 相互フォローのユーザーの投稿のみを取得
        const { data: mutualData } = await getSupabaseClient()
          .rpc('get_mutual_friends', { user_id: actualUserId })

        if (mutualData && mutualData.length > 0) {
          const mutualIds = mutualData.map((m: any) => m.user_id)
          query = query.in('user_id', mutualIds)
        } else {
          return [] // 相互フォローユーザーがいない場合は空を返す
        }
      } else if (filter === 'same-gym') {
        // 同じジムの投稿のみを取得
        // まずユーザーのホームジム設定を取得
        const { data: userProfile } = await getSupabaseClient()
          .from('user_profiles')
          .select('primary_gym_id, secondary_gym_ids')
          .eq('user_id', actualUserId)
          .maybeSingle()

        let gymIds: string[] = []

        if (userProfile?.primary_gym_id) {
          // ホームジム（primary_gym_id）を最優先で追加
          gymIds.push(userProfile.primary_gym_id)
        }

        if (userProfile?.secondary_gym_ids && Array.isArray(userProfile.secondary_gym_ids)) {
          // セカンダリジムも追加
          gymIds.push(...userProfile.secondary_gym_ids)
        }

        if (gymIds.length === 0) {
          // ホームジム設定がない場合は、最近の投稿からジムを取得
          const { data: recentPosts } = await getSupabaseClient()
            .from('gym_posts')
            .select('gym_id')
            .eq('user_id', actualUserId)
            .order('created_at', { ascending: false })
            .limit(10)

          if (recentPosts && recentPosts.length > 0) {
            const recentGymIds = [...new Set(recentPosts.map(p => p.gym_id).filter(Boolean))]
            gymIds.push(...recentGymIds)
          }
        }

        if (gymIds.length > 0) {
          query = query.in('gym_id', gymIds)
        } else {
          // ジムの関連がない場合はすべて表示
          logger.log('getFeedPosts: No gym associations found, showing all posts');
        }
      }
    }

    // ソートとページネーション
    const { data: posts, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logger.error('getFeedPosts: Error fetching posts:', error)
      return []
    }

    if (!posts) {
      return []
    }

    // 投稿データの正規化とlike状態の確認
    const postsWithLikes = await Promise.all(
      posts.map(async (post: any) => {
        // ユーザーがいいねしているかチェック
        let isLiked = false
        if (actualUserId) {
          const { data: likeData } = await getSupabaseClient()
            .from('post_likes')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', actualUserId)
            .maybeSingle()

          isLiked = !!likeData
        }

        return {
          id: post.id,
          user_id: post.user_id,
          gym_id: post.gym_id,
          content: post.content,
          images: Array.isArray(post.images) ? post.images : (post.images ? [post.images] : []),
          created_at: post.created_at,
          likes_count: Array.isArray(post.likes_count) ? post.likes_count.length : 0,
          comments_count: Array.isArray(post.comments_count) ? post.comments_count.length : 0,
          is_liked: isLiked,
          user: post.user ? {
            id: post.user.id,
            display_name: post.user.display_name,
            username: post.user.username,
            avatar_url: post.user.avatar_url
          } : null,
          gym: post.gym ? {
            id: post.gym.id,
            name: post.gym.name,
            address: post.gym.address
          } : null
        }
      })
    )

    logger.log('getFeedPosts: Successfully fetched', postsWithLikes.length, 'posts');
    return postsWithLikes

  } catch (error) {
    logger.error('getFeedPosts: Unexpected error:', error)
    return []
  }
}

// Rest of the functions from original posts.ts
export async function getUserPosts(userId: string, page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit

    const { data: posts, error } = await getSupabaseClient()
      .from('gym_posts')
      .select(`
        *,
        likes_count:post_likes(count),
        comments_count:post_comments(count),
        user:users!gym_posts_user_id_fkey (
          id,
          display_name,
          username,
          avatar_url
        ),
        gym:gyms!gym_posts_gym_id_fkey (
          id,
          name,
          address
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logger.error('getUserPosts: Error fetching user posts:', error)
      return []
    }

    return posts || []
  } catch (error) {
    logger.error('getUserPosts: Unexpected error:', error)
    return []
  }
}

// Continue with all other original functions...
// (Keeping the original implementation for rapid deployment)

export async function createCheckinPost(
  userId: string,
  gymId: string,
  content: string,
  images?: string[],
  isWorkout: boolean = false,
  workoutDetails?: any
) {
  try {
    logger.log('createCheckinPost: Creating post for user:', userId, 'gym:', gymId);

    // Get recent checkin
    const checkin = await getRecentCheckinForGym(userId, gymId)
    const checkinId = checkin?.id || null

    const post = {
      user_id: userId,
      gym_id: gymId,
      content,
      images: images || [],
      checkin_id: checkinId,
      is_workout: isWorkout,
      workout_details: workoutDetails || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Create post
    const { data: createdPost, error: postError } = await getSupabaseClient()
      .from('gym_posts')
      .insert(post)
      .select(`
        *,
        user:users!gym_posts_user_id_fkey (
          id,
          display_name,
          username,
          avatar_url
        ),
        gym:gyms!gym_posts_gym_id_fkey (
          id,
          name,
          address
        )
      `)
      .single()

    if (postError) {
      logger.error('createCheckinPost: Error creating post:', postError)
      throw postError
    }

    logger.log('createCheckinPost: Post created successfully:', createdPost.id);

    // Schedule delayed post if configured
    if (process.env.NODE_ENV === 'production') {
      try {
        await scheduleDelayedPost(createdPost.id, new Date(Date.now() + 5 * 60 * 1000)) // 5 minutes delay
      } catch (delayError) {
        logger.warn('createCheckinPost: Failed to schedule delayed post:', delayError)
        // Continue with post creation even if scheduling fails
      }
    }

    return createdPost
  } catch (error) {
    logger.error('createCheckinPost: Unexpected error:', error)
    throw error
  }
}

// Continue with remaining functions...
export async function createPost(post: {
  user_id: string
  gym_id?: string
  content: string
  images?: string[]
  checkin_id?: string
  is_workout?: boolean
  workout_details?: any
}) {
  try {
    const { data, error } = await getSupabaseClient()
      .from('gym_posts')
      .insert({
        ...post,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        user:users!gym_posts_user_id_fkey (
          id,
          display_name,
          username,
          avatar_url
        ),
        gym:gyms!gym_posts_gym_id_fkey (
          id,
          name,
          address
        )
      `)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    logger.error('createPost: Error:', error)
    throw error
  }
}

export async function updatePost(postId: string, updates: {
  content?: string
  images?: string[]
}) {
  try {
    const { data, error } = await getSupabaseClient()
      .from('gym_posts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
      .select(`
        *,
        user:users!gym_posts_user_id_fkey (
          id,
          display_name,
          username,
          avatar_url
        ),
        gym:gyms!gym_posts_gym_id_fkey (
          id,
          name,
          address
        )
      `)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    logger.error('updatePost: Error:', error)
    throw error
  }
}

export async function deletePost(postId: string) {
  try {
    const { error } = await getSupabaseClient()
      .from('gym_posts')
      .delete()
      .eq('id', postId)

    if (error) throw error
    return true
  } catch (error) {
    logger.error('deletePost: Error:', error)
    throw error
  }
}

export async function likePost(postId: string) {
  try {
    const { data: { user } } = await getSupabaseClient().auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await getSupabaseClient()
      .from('post_likes')
      .insert({ post_id: postId, user_id: user.id })

    if (error) throw error
    return true
  } catch (error) {
    logger.error('likePost: Error:', error)
    throw error
  }
}

export async function unlikePost(postId: string) {
  try {
    const { data: { user } } = await getSupabaseClient().auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await getSupabaseClient()
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id)

    if (error) throw error
    return true
  } catch (error) {
    logger.error('unlikePost: Error:', error)
    throw error
  }
}

export async function getPostComments(postId: string) {
  try {
    const { data, error } = await getSupabaseClient()
      .from('post_comments')
      .select(`
        *,
        user:users!post_comments_user_id_fkey (
          id,
          display_name,
          username,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    logger.error('getPostComments: Error:', error)
    return []
  }
}

export async function createComment(comment: {
  post_id: string
  user_id: string
  content: string
}) {
  try {
    const { data, error } = await getSupabaseClient()
      .from('post_comments')
      .insert({
        ...comment,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        user:users!post_comments_user_id_fkey (
          id,
          display_name,
          username,
          avatar_url
        )
      `)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    logger.error('createComment: Error:', error)
    throw error
  }
}

export async function deleteComment(commentId: string) {
  try {
    const { error } = await getSupabaseClient()
      .from('post_comments')
      .delete()
      .eq('id', commentId)

    if (error) throw error
    return true
  } catch (error) {
    logger.error('deleteComment: Error:', error)
    throw error
  }
}