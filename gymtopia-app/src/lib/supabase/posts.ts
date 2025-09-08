import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 投稿の型定義
export interface Post {
  id: string
  user_id: string
  content?: string
  image_url?: string | null
  workout_session_id?: string | null
  gym_id?: string | null
  is_public: boolean
  likes_count: number
  comments_count: number
  created_at: string
  user?: {
    id: string
    display_name: string
    username: string
    avatar_url?: string
  }
  gym?: {
    name: string
  }
  is_liked?: boolean
}

export interface Comment {
  id: string
  user_id: string
  post_id: string
  content: string
  parent_comment_id?: string
  created_at: string
  user?: {
    display_name: string
    username: string
    avatar_url?: string
  }
}

// フィードの投稿を取得
export async function getFeedPosts(
  limit = 20,
  offset = 0,
  filter: 'all' | 'following' | 'gym-friends' | 'same-gym' = 'all',
  userId?: string
) {
  try {
    // Use mock user if no user authenticated
    const actualUserId = userId || '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'
    
    let query = supabase
      .from('gym_posts')
      .select(`
        *,
        user:user_id(id, display_name, username, avatar_url),
        gym:gym_id(name)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters based on type
    if (filter !== 'all' && actualUserId) {
      if (filter === 'following') {
        // Get posts from users the current user follows
        const { data: following } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', actualUserId)

        if (following && following.length > 0) {
          const followingIds = following.map(f => f.following_id)
          query = query.in('user_id', followingIds)
        } else {
          // No following, return empty
          return []
        }
      } else if (filter === 'gym-friends') {
        // Get posts from gym friends
        const { data: friends } = await supabase
          .from('gym_friends')
          .select('user1_id, user2_id, friendship_status')
          .or(`user1_id.eq.${actualUserId},user2_id.eq.${actualUserId}`)
          .eq('friendship_status', 'accepted')

        if (friends && friends.length > 0) {
          const friendIds = friends.map((f: any) => 
            f.user1_id === actualUserId ? f.user2_id : f.user1_id
          )
          query = query.in('user_id', friendIds)
        } else {
          // No gym friends, return empty
          return []
        }
      } else if (filter === 'same-gym') {
        // Get posts from users who go to the same gyms
        const { data: userGyms } = await supabase
          .from('workout_sessions')
          .select('gym_id')
          .eq('user_id', actualUserId)
          .not('gym_id', 'is', null)
          .limit(10)

        if (userGyms && userGyms.length > 0) {
          const gymIds = [...new Set(userGyms.map(g => g.gym_id))]
          query = query.in('gym_id', gymIds)
        } else {
          // No gyms, return empty
          return []
        }
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching posts:', error)
      // Return mock data if error
      return getMockFeedPosts()
    }

    if (!data || data.length === 0) {
      // Return mock data if no posts
      return getMockFeedPosts()
    }

    // Get likes and comments counts
    const postIds = data.map(p => p.id)
    
    // Get likes
    const { data: likes } = await supabase
      .from('post_likes')
      .select('post_id, user_id')
      .in('post_id', postIds)

    // Get comments count
    const { data: comments } = await supabase
      .from('post_comments')
      .select('post_id')
      .in('post_id', postIds)

    // Count likes and comments per post
    const likeCountMap: Record<string, number> = {}
    const commentCountMap: Record<string, number> = {}
    const userLikedMap: Record<string, boolean> = {}

    likes?.forEach(like => {
      likeCountMap[like.post_id] = (likeCountMap[like.post_id] || 0) + 1
      if (like.user_id === actualUserId) {
        userLikedMap[like.post_id] = true
      }
    })

    comments?.forEach(comment => {
      commentCountMap[comment.post_id] = (commentCountMap[comment.post_id] || 0) + 1
    })

    // Map posts with counts
    const postsWithCounts = data.map(post => ({
      ...post,
      likes_count: likeCountMap[post.id] || 0,
      comments_count: commentCountMap[post.id] || 0,
      is_liked: userLikedMap[post.id] || false
    }))

    return postsWithCounts as Post[]
  } catch (error) {
    console.error('Error in getFeedPosts:', error)
    return getMockFeedPosts()
  }
}

// Mock feed posts helper
function getMockFeedPosts(): Post[] {
  return [
    {
      id: 'mock-post-1',
      user_id: 'mock-user-1',
      content: '今日は胸トレ完了！新しいHammer Strengthのマシンが最高でした。フォームが安定して重量も上がった感じです。',
      post_type: 'workout' as const,
      gym_id: 'gym-1',
      visibility: 'public' as const,
      likes_count: 15,
      comments_count: 3,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      user: {
        id: 'mock-user-1',
        display_name: '筋トレマニア太郎',
        username: 'muscle_taro',
        avatar_url: '/muscle-taro-avatar.svg'
      },
      gym: {
        name: 'ハンマーストレングス渋谷'
      },
      is_liked: false
    },
    {
      id: 'mock-post-2',
      user_id: 'mock-user-2',
      content: 'スクワット100kg×5達成！ずっと目標にしていた重量です。ROGUEのパワーラックで安心してトレーニングできました。',
      post_type: 'achievement' as const,
      achievement_data: {
        exercise: 'スクワット',
        weight: 100,
        reps: 5
      },
      gym_id: 'gym-2',
      visibility: 'public' as const,
      likes_count: 42,
      comments_count: 8,
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      user: {
        id: 'mock-user-2',
        display_name: 'フィットネス花子',
        username: 'fitness_hanako',
        avatar_url: '/fitness-hanako-avatar.svg'
      },
      gym: {
        name: 'ROGUEクロストレーニング新宿'
      },
      is_liked: true
    },
    {
      id: 'mock-post-3',
      user_id: 'mock-user-3',
      content: '朝トレ最高！24時間営業だから早朝も利用できるのが嬉しい。朝の時間帯は空いていて集中できました。',
      post_type: 'check_in' as const,
      gym_id: 'gym-3',
      visibility: 'public' as const,
      likes_count: 28,
      comments_count: 5,
      created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      user: {
        id: 'mock-user-3',
        display_name: 'トレーニング次郎',
        username: 'training_jiro',
        avatar_url: '/training-jiro-avatar.svg'
      },
      gym: {
        name: 'プレミアムフィットネス銀座'
      },
      is_liked: false
    }
  ]
}

// ユーザーの投稿を取得
export async function getUserPosts(userId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('gym_posts')
      .select(`
        *,
        user:users(id, display_name, username, avatar_url),
        gym:gyms(name),
        likes:post_likes!post_id(user_id)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    const posts = data?.map(post => ({
      ...post,
      is_liked: user ? post.likes?.some((like: any) => like.user_id === user.id) : false,
      likes: undefined
    })) || []

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
  visibility?: 'public' | 'followers' | 'private'
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('gym_posts')
      .insert({
        content: post.content,
        image_url: post.images?.[0] || null,
        user_id: user.id,
        workout_session_id: post.workout_session_id,
        gym_id: post.gym_id || null,
        is_public: (post.visibility ?? 'public') === 'public',
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

// 投稿を削除
export async function deletePost(postId: string) {
  try {
    const { error } = await supabase
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
    // Use mock user for development
    const actualUserId = '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'

    const { data, error } = await supabase
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
    throw error
  }
}

// いいねを削除
export async function unlikePost(postId: string) {
  try {
    // Use mock user for development
    const actualUserId = '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'

    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('user_id', actualUserId)
      .eq('post_id', postId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error unliking post:', error)
    throw error
  }
}

// コメントを取得
export async function getPostComments(postId: string) {
  try {
    const { data, error } = await supabase
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
    // Use mock user for development
    const actualUserId = '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'

    const { data, error } = await supabase
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
    const { error } = await supabase
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
