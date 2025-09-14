import { supabase } from './client'

// 投稿の型定義
export interface Post {
  id: string
  user_id: string
  content?: string
  image_url?: string | null
  images?: string[]
  post_type?: 'normal' | 'workout' | 'check_in' | 'achievement'
<<<<<<< HEAD
  workout_session_id?: string
  gym_id?: string
  checkin_id?: string
  achievement_type?: string
  achievement_data?: any
  visibility?: 'public' | 'followers' | 'private'
=======
  achievement_data?: any
  workout_session_id?: string | null
  gym_id?: string | null
  is_public: boolean
>>>>>>> 38df0b724fb3d2bd7e182e6009474159e417fad7
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
<<<<<<< HEAD
    console.log('getFeedPosts: Starting to fetch posts')
    
    // まず基本的な接続をテスト
    const { data: testData, error: testError } = await supabase
      .from('gym_posts')
      .select('id')
      .limit(1)
    
    console.log('getFeedPosts: Basic connection test:', { testData, testError })
    
    if (testError) {
      console.error('getFeedPosts: Basic connection failed:', testError)
      // テーブルが存在しない場合はサンプルデータを返す
      return getSampleFeedPosts()
    }

    const { data: { user } } = await supabase.auth.getUser()
    console.log('getFeedPosts: User auth status:', user ? 'authenticated' : 'not authenticated')
=======
    // Use mock user if no user authenticated
    const actualUserId = userId || '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'
>>>>>>> 38df0b724fb3d2bd7e182e6009474159e417fad7
    
    let query = supabase
      .from('gym_posts')
      .select(`
        *,
<<<<<<< HEAD
        users:user_id (
          id,
          display_name,
          username,
          avatar_url
        ),
        gyms:gym_id (
          name
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    console.log('getFeedPosts: Executing main query')
    const { data, error } = await query

    if (error) {
      console.error('getFeedPosts: Main query error:', error)
      throw error
    }

    console.log('getFeedPosts: Query successful, data length:', data?.length || 0)

    // gym_posts テーブルに合わせたマッピング（実際のユーザー情報を使用）
    const posts = (data || []).map(post => ({
      id: post.id,
      user_id: post.user_id,
      content: post.content,
      images: post.images || [],
      gym_id: post.gym_id,
      workout_type: post.workout_type,
      muscle_groups_trained: post.muscle_groups_trained,
      duration_minutes: post.duration_minutes,
      crowd_status: post.crowd_status,
      visibility: post.visibility,
      likes_count: post.likes_count || post.like_count || 0,
      comments_count: post.comments_count || post.comment_count || 0,
      created_at: post.created_at,
      is_liked: false,
      user: post.users ? {
        id: post.users.id,
        display_name: post.users.display_name || 'ユーザー',
        username: post.users.username || 'user',
        avatar_url: post.users.avatar_url
      } : {
        id: post.user_id,
        display_name: 'ユーザー',
        username: 'user',
        avatar_url: null
      },
      gym: post.gyms ? { name: post.gyms.name } : undefined
    })) as Post[]
=======
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
      return []
    }

    if (!data || data.length === 0) {
      return []
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
>>>>>>> 38df0b724fb3d2bd7e182e6009474159e417fad7

    return postsWithCounts as Post[]
  } catch (error) {
<<<<<<< HEAD
    console.error('Error fetching feed posts:', error)
    return getSampleFeedPosts()
=======
    console.error('Error in getFeedPosts:', error)
    return []
>>>>>>> 38df0b724fb3d2bd7e182e6009474159e417fad7
  }
}

// サンプルフィードデータを生成する関数
function getSampleFeedPosts(): Post[] {
  return [
    {
      id: 'sample-1',
      user_id: 'sample-user-1',
      gym_id: 'sample-gym-1',
      content: '今日も良いトレーニングができました！ベンチプレス100kg達成🔥',
      created_at: new Date().toISOString(),
      is_liked: false,
      user: {
        id: 'sample-user-1',
        display_name: 'サンプルユーザー',
        username: 'sample_user',
        avatar_url: null
      },
      gym: {
        name: 'サンプルジム'
      }
    },
    {
      id: 'sample-2',
      user_id: 'sample-user-2',
      gym_id: 'sample-gym-2',
      content: '駅近の新しいジムに行ってみました。設備が充実していて満足です！',
      created_at: new Date(Date.now() - 3600000).toISOString(), // 1時間前
      is_liked: false,
      user: {
        id: 'sample-user-2',
        display_name: 'フィットネス太郎',
        username: 'fitness_taro',
        avatar_url: null
      },
      gym: {
        name: 'エクサイズジム渋谷'
      }
    }
  ]
}

// ユーザーの投稿を取得
export async function getUserPosts(userId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
<<<<<<< HEAD
      .from('posts')
      .select('*')
=======
      .from('gym_posts')
      .select(`
        *,
        user:users(id, display_name, username, avatar_url),
        gym:gyms(name),
        likes:post_likes!post_id(user_id)
      `)
>>>>>>> 38df0b724fb3d2bd7e182e6009474159e417fad7
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    const posts = (data || []).map(post => ({
      ...post,
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
  visibility?: 'public' | 'followers' | 'private'
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('gym_posts')
      .insert({
<<<<<<< HEAD
        user_id: user.id,
        gym_id: post.gym_id,
        content: post.content || '',
        image_urls: post.images || [],
        training_details: post.achievement_data || null,
        crowd_status: post.achievement_data?.crowd_status || null
=======
        content: post.content,
        image_url: post.images?.[0] || null,
        user_id: user.id,
        workout_session_id: post.workout_session_id,
        gym_id: post.gym_id || null,
        is_public: (post.visibility ?? 'public') === 'public',
>>>>>>> 38df0b724fb3d2bd7e182e6009474159e417fad7
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
<<<<<<< HEAD
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('いいね機能はログインが必要です')
      return null
    }
=======
    // Use mock user for development
    const actualUserId = '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'
>>>>>>> 38df0b724fb3d2bd7e182e6009474159e417fad7

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
    return null
  }
}

// いいねを削除
export async function unlikePost(postId: string) {
  try {
<<<<<<< HEAD
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('いいね解除機能はログインが必要です')
      return false
    }
=======
    // Use mock user for development
    const actualUserId = '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'
>>>>>>> 38df0b724fb3d2bd7e182e6009474159e417fad7

    const { error } = await supabase
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
    const { data, error } = await supabase
<<<<<<< HEAD
      .from('comments')
      .select('*')
=======
      .from('post_comments')
      .select(`
        *,
        user:user_id(display_name, username, avatar_url)
      `)
>>>>>>> 38df0b724fb3d2bd7e182e6009474159e417fad7
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
<<<<<<< HEAD
      .select('*')
=======
      .select(`
        *,
        user:user_id(display_name, username, avatar_url)
      `)
>>>>>>> 38df0b724fb3d2bd7e182e6009474159e417fad7
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
