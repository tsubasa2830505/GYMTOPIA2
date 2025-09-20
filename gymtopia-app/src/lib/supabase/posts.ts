import { getSupabaseClient } from './client'
import type { GymPost as Post, PostComment as Comment } from '@/lib/types/profile'

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
    console.log('getFeedPosts: Fetching posts with filter:', filter, 'userId:', userId);

    const { data: { user } } = await getSupabaseClient().auth.getUser()
    // Use provided userId or authenticated user
    const actualUserId = userId || user?.id

    if (!actualUserId && filter !== 'all') {
      console.log('getFeedPosts: No user ID available for filtered feed, returning all posts');
      filter = 'all'; // フィルターには認証が必要
    }

    let query = getSupabaseClient()
      .from('gym_posts_with_counts')
      .select(`
        *,
        user:users!user_id (
          id,
          display_name,
          username,
          avatar_url
        ),
        gym:gyms!gym_id (
          id,
          name
        )
      `)

    // フィルター処理
    if (actualUserId) {
      if (filter === 'following') {
        // フォロー中のユーザーの投稿のみを取得
        const { data: followingData } = await getSupabaseClient()
          .from('follows')
          .select('following_id')
          .eq('follower_id', actualUserId);

        if (followingData && followingData.length > 0) {
          const followingIds = followingData.map(f => f.following_id);
          query = query.in('user_id', followingIds);
          console.log('getFeedPosts: Filtering by following users:', followingIds.length);
        } else {
          console.log('getFeedPosts: User not following anyone, returning empty');
          return [];
        }
      } else if (filter === 'mutual') {
        // 相互フォローのユーザーの投稿のみを取得
        const { data: followingData } = await getSupabaseClient()
          .from('follows')
          .select('following_id')
          .eq('follower_id', actualUserId);

        const { data: followersData } = await getSupabaseClient()
          .from('follows')
          .select('follower_id')
          .eq('following_id', actualUserId);

        if (followingData && followersData) {
          const followingIds = new Set(followingData.map(f => f.following_id));
          const followerIds = new Set(followersData.map(f => f.follower_id));
          const mutualIds = Array.from(followingIds).filter(id => followerIds.has(id));

          if (mutualIds.length > 0) {
            query = query.in('user_id', mutualIds);
            console.log('getFeedPosts: Filtering by mutual follows:', mutualIds.length);
          } else {
            console.log('getFeedPosts: No mutual follows found, returning empty');
            return [];
          }
        } else {
          return [];
        }
      } else if (filter === 'same-gym') {
        // 同じジムの投稿のみを取得
        // まずユーザーの最近のジムを取得
        const { data: userGyms } = await getSupabaseClient()
          .from('gym_posts')
          .select('gym_id')
          .eq('user_id', actualUserId)
          .not('gym_id', 'is', null)
          .order('created_at', { ascending: false })
          .limit(10);

        if (userGyms && userGyms.length > 0) {
          const gymIds = [...new Set(userGyms.map(g => g.gym_id))];
          query = query.in('gym_id', gymIds);
          console.log('getFeedPosts: Filtering by same gyms:', gymIds);
        } else {
          console.log('getFeedPosts: User has no gym posts, returning all');
          // ジムの投稿がない場合はすべて表示
        }
      }
    }

    // ソートとページネーション
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error } = await query

    if (error) {
      console.error('getFeedPosts: Query error:', error)
      throw error
    }


    // gym_posts テーブルに合わせたマッピング（実際のユーザー情報を使用）
    const posts: Post[] = (data || []).map(post => ({
      id: post.id,
      user_id: post.user_id,
      content: post.content || null,
      images: post.images || post.image_urls || [],
      gym_id: post.gym_id,
      post_type: 'normal' as const,
      workout_session_id: post.workout_session_id || null,
      visibility: post.visibility || 'public' as const,
      likes_count: post.likes_count_live || post.likes_count || post.like_count || 0,
      comments_count: post.comments_count_live || post.comments_count || post.comment_count || 0,
      shares_count: 0,
      is_public: true,
      is_liked: false,
      is_verified: false,
      check_in_id: null,
      verification_method: null,
      distance_from_gym: null,
      created_at: post.created_at,
      updated_at: post.updated_at || post.created_at,
      training_details: post.training_details,
      user: post.user ? {
        id: post.user.id,
        display_name: post.user.display_name || undefined,
        username: post.user.username || undefined,
        avatar_url: post.user.avatar_url || undefined,
        bio: undefined,
        location: undefined,
        joined_at: post.user.created_at || new Date().toISOString(),
        is_verified: false,
        workout_streak: 0,
        total_workouts: 0,
        created_at: post.user.created_at || new Date().toISOString(),
        updated_at: post.user.updated_at || new Date().toISOString()
      } : undefined,
      gym: post.gym ? {
        id: post.gym.id || post.gym_id,
        name: post.gym.name,
        area: post.gym.area || null,
        city: post.gym.city || null,
        prefecture: post.gym.prefecture || null,
        images: post.gym.images || null
      } : undefined
    }))

    return posts
  } catch (error) {
    console.error('Error fetching feed posts:', error)
    console.error('getFeedPosts: Final error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })

    // エラーを再スローして、フィードページで適切にハンドリングする
    throw error
  }
}


// ユーザーの投稿を取得
export async function getUserPosts(userId: string, page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit

    const { data, error } = await getSupabaseClient()
      .from('gym_posts')
      .select(`
        *,
        user:users!gym_posts_user_id_fkey(id, display_name, username, avatar_url),
        gym:gyms!gym_posts_gym_id_fkey(id, name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    const posts = (data || []).map(post => ({
      ...post,
      user: post.user || { id: userId, display_name: 'ユーザー', username: 'user' },
      gym: post.gym || null,
      is_liked: false
    }))

    return posts as Post[]
  } catch (error) {
    console.error('Error fetching user posts:', error)
    return []
  }
}

// 投稿を作成
export async function createPost(post: {
  content?: string
  images?: string[]
  post_type: 'normal' | 'workout' | 'check_in' | 'achievement'
  workout_session_id?: string
  gym_id?: string
  checkin_id?: string
  achievement_type?: string
  achievement_data?: any
  training_details?: {
    gym_name?: string
    exercises?: {
      name: string
      weight: number
      sets: number
      reps: number
    }[]
    crowd_status?: string
  } | null
  visibility?: 'public' | 'followers' | 'private'
}) {
  try {
    const { data: { user } } = await getSupabaseClient().auth.getUser()

    if (!user?.id) {
      throw new Error('ログインが必要です')
    }
    const actualUserId = user.id

    const { data, error } = await getSupabaseClient()
      .from('gym_posts')
      .insert({
        user_id: actualUserId,
        gym_id: post.gym_id,
        content: post.content || '',
        images: post.images || [],
        training_details: post.training_details || null,
        crowd_status: post.achievement_data?.crowd_status || post.training_details?.crowd_status || 'normal',
        visibility: post.visibility || 'public',
        is_public: (post.visibility ?? 'public') === 'public'
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating post:', error)
    throw error
  }
}

// 投稿を更新
export async function updatePost(postId: string, updates: {
  content?: string
  images?: string[]
  training_details?: {
    gym_name?: string
    exercises?: {
      name: string
      weight: number
      sets: number
      reps: number
    }[]
    crowd_status?: string
  } | null
  workout_started_at?: string
  workout_ended_at?: string
}) {
  try {
    const { data: { user } } = await getSupabaseClient().auth.getUser()
    if (!user?.id) {
      throw new Error('ログインが必要です')
    }
    const actualUserId = user.id

    // 投稿の所有者確認
    const { data: existingPost, error: fetchError } = await getSupabaseClient()
      .from('gym_posts')
      .select('user_id')
      .eq('id', postId)
      .single()

    if (fetchError) throw fetchError
    if (!existingPost) throw new Error('Post not found')

    // 所有者のみが編集可能
    if (existingPost.user_id !== actualUserId) {
      console.error('Unauthorized: User does not own this post')
      throw new Error('投稿の編集権限がありません')
    }

    // サンプルデータの場合はモック更新を返す
    if (postId.startsWith('sample-')) {
      return { id: postId, ...updates }
    }

    // データベース更新用のオブジェクトを構築
    const updateData: any = {}

    if (updates.content !== undefined) updateData.content = updates.content
    if (updates.images !== undefined) updateData.images = updates.images
    if (updates.training_details !== undefined) updateData.training_details = updates.training_details
    if (updates.workout_started_at !== undefined) updateData.workout_started_at = updates.workout_started_at
    if (updates.workout_ended_at !== undefined) updateData.workout_ended_at = updates.workout_ended_at

    // workout_duration_calculatedを計算
    if (updates.workout_started_at && updates.workout_ended_at) {
      const [startHour, startMin] = updates.workout_started_at.split(':').map(Number)
      const [endHour, endMin] = updates.workout_ended_at.split(':').map(Number)
      const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin)
      updateData.workout_duration_calculated = duration > 0 ? duration : 0
    }


    const { data, error } = await getSupabaseClient()
      .from('gym_posts')
      .update(updateData)
      .eq('id', postId)
      .select()
      .maybeSingle()

    if (error || !data) throw error || new Error('Post not found')

    return data
  } catch (error) {
    console.error('Error updating post:', error)
    throw error
  }
}

// 投稿を削除
export async function deletePost(postId: string) {
  try {
    const { data: { user } } = await getSupabaseClient().auth.getUser()
    if (!user?.id) {
      throw new Error('ログインが必要です')
    }
    const actualUserId = user.id

    // 投稿の所有者確認
    const { data: existingPost, error: fetchError } = await getSupabaseClient()
      .from('gym_posts')
      .select('user_id')
      .eq('id', postId)
      .single()

    if (fetchError) throw fetchError
    if (!existingPost) throw new Error('Post not found')

    // 所有者のみが削除可能
    if (existingPost.user_id !== actualUserId) {
      console.error('Unauthorized: User does not own this post')
      throw new Error('投稿の削除権限がありません')
    }

    const { error } = await getSupabaseClient()
      .from('gym_posts')
      .delete()
      .eq('id', postId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting post:', error)
    throw error
  }
}

// いいねを追加
export async function likePost(postId: string) {
  try {
    const { data: { user } } = await getSupabaseClient().auth.getUser()
    if (!user?.id) {
      throw new Error('ログインが必要です')
    }
    const actualUserId = user.id

    const { data, error } = await getSupabaseClient()
      .from('post_likes')
      .insert({
        user_id: actualUserId,
        post_id: postId
      })
      .select()
      .single()

    if (error && error.code !== '23505') throw error // Ignore duplicate key error
    return data
  } catch (error) {
    console.error('Error liking post:', error)
    return null
  }
}

// いいねを削除
export async function unlikePost(postId: string) {
  try {
    const { data: { user } } = await getSupabaseClient().auth.getUser()
    if (!user?.id) {
      throw new Error('ログインが必要です')
    }
    const actualUserId = user.id

    const { error } = await getSupabaseClient()
      .from('post_likes')
      .delete()
      .eq('user_id', actualUserId)
      .eq('post_id', postId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error unliking post:', error)
    return false
  }
}

// コメントを取得
export async function getPostComments(postId: string) {
  try {
    const { data, error } = await getSupabaseClient()
      .from('post_comments')
      .select(`
        *,
        user:user_id(display_name, username, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data as Comment[]
  } catch (error) {
    console.error('Error fetching comments:', error)
    return []
  }
}

// コメントを投稿
export async function createComment(comment: {
  post_id: string
  content: string
  parent_comment_id?: string
}) {
  try {
    const { data: { user } } = await getSupabaseClient().auth.getUser()
    if (!user?.id) {
      throw new Error('ログインが必要です')
    }
    const actualUserId = user.id

    const { data, error } = await getSupabaseClient()
      .from('post_comments')
      .insert({
        ...comment,
        user_id: actualUserId
      })
      .select(`
        *,
        user:user_id(display_name, username, avatar_url)
      `)
      .single()

    if (error) throw error
    return data as Comment
  } catch (error) {
    console.error('Error creating comment:', error)
    throw error
  }
}

// コメントを削除
export async function deleteComment(commentId: string) {
  try {
    const { error } = await getSupabaseClient()
      .from('post_comments')
      .delete()
      .eq('id', commentId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting comment:', error)
    throw error
  }
}
