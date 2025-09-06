import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 投稿の型定義
export interface Post {
  id: string
  user_id: string
  content?: string
  images?: string[]
  post_type: 'normal' | 'workout' | 'check_in' | 'achievement'
  workout_session_id?: string
  gym_id?: string
  checkin_id?: string
  achievement_type?: string
  achievement_data?: any
  visibility: 'public' | 'followers' | 'private'
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
export async function getFeedPosts(limit = 20, offset = 0) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    let query = supabase
      .from('posts')
      .select(`
        *,
        user:users(id, display_name, username, avatar_url),
        gym:gyms(name),
        likes!left(user_id)
      `)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) throw error

    // is_likedフラグを追加
    const posts = data?.map(post => ({
      ...post,
      is_liked: user ? post.likes?.some((like: any) => like.user_id === user.id) : false,
      likes: undefined // likesデータは削除
    })) || []

    return posts as Post[]
  } catch (error) {
    console.error('Error fetching feed posts:', error)
    return []
  }
}

// ユーザーの投稿を取得
export async function getUserPosts(userId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users(id, display_name, username, avatar_url),
        gym:gyms(name),
        likes!left(user_id)
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
      .from('posts')
      .insert({
        ...post,
        user_id: user.id,
        visibility: post.visibility || 'public'
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
      .from('posts')
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
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('likes')
      .insert({
        user_id: user.id,
        post_id: postId
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error liking post:', error)
    throw error
  }
}

// いいねを削除
export async function unlikePost(postId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', user.id)
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
      .from('comments')
      .select(`
        *,
        user:users(display_name, username, avatar_url)
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
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('comments')
      .insert({
        ...comment,
        user_id: user.id
      })
      .select(`
        *,
        user:users(display_name, username, avatar_url)
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
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting comment:', error)
    throw error
  }
}