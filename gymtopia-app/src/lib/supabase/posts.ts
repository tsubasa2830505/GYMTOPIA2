import { supabase } from './client'

// 投稿の型定義
export interface Post {
  id: string
  user_id: string
  content?: string
  image_url?: string | null
  images?: string[]
  post_type?: 'normal' | 'workout' | 'check_in' | 'achievement'
  workout_session_id?: string | null
  gym_id?: string | null
  checkin_id?: string
  achievement_type?: string
  achievement_data?: any
  visibility?: 'public' | 'followers' | 'private'
  is_public?: boolean
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

    // Use mock user if no user authenticated
    const actualUserId = userId || user?.id || '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'
    
    let query = supabase
      .from('gym_posts')
      .select(`
        *,
        user:users!user_id (
          id,
          display_name,
          username,
          avatar_url
        ),
        gym:gyms!gym_id (
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
      images: post.image_urls || post.images || [],
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
      user: post.user ? {
        id: post.user.id,
        display_name: post.user.display_name || 'ユーザー',
        username: post.user.username || 'user',
        avatar_url: post.user.avatar_url
      } : {
        id: post.user_id,
        display_name: 'ユーザー',
        username: 'user',
        avatar_url: undefined
      },
      gym: post.gym ? { name: post.gym.name } : undefined
    })) as Post[]

    return posts
  } catch (error) {
    console.error('Error fetching feed posts:', error)
    return getSampleFeedPosts()
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
      likes_count: 0,
      comments_count: 0,
      is_liked: false,
      user: {
        id: 'sample-user-1',
        display_name: 'サンプルユーザー',
        username: 'sample_user',
        avatar_url: undefined
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
      likes_count: 0,
      comments_count: 0,
      is_liked: false,
      user: {
        id: 'sample-user-2',
        display_name: 'フィットネス太郎',
        username: 'fitness_taro',
        avatar_url: undefined
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
      .from('gym_posts')
      .select(`
        *,
        users:user_id(id, display_name, username, avatar_url),
        gyms:gym_id(name)
      `)
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
        user_id: user.id,
        gym_id: post.gym_id,
        content: post.content || '',
        image_urls: post.images || [],
        training_details: post.achievement_data || null,
        crowd_status: post.achievement_data?.crowd_status || null,
        workout_session_id: post.workout_session_id,
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
    const { data: { user } } = await supabase.auth.getUser()
    const actualUserId = user?.id || '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'

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
    const { data: { user } } = await supabase.auth.getUser()
    const actualUserId = user?.id || '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'

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
    const { data: { user } } = await supabase.auth.getUser()
    const actualUserId = user?.id || '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'

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
