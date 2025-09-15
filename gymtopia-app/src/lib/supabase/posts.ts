import { getSupabaseClient } from './client'

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
    const { data: testData, error: testError } = await getSupabaseClient()
      .from('gym_posts')
      .select('id')
      .limit(1)

    console.log('getFeedPosts: Basic connection test:', { testData, testError })

    if (testError) {
      console.error('getFeedPosts: Basic connection failed:', testError)
      // エラーの詳細をコンソールに出力
      console.error('getFeedPosts: Error details:', {
        message: testError.message,
        details: testError.details,
        hint: testError.hint,
        code: testError.code
      })
      // エラーが発生した場合も実際のクエリを試行する
    }

    const { data: { user } } = await getSupabaseClient().auth.getUser()
    console.log('getFeedPosts: User auth status:', user ? 'authenticated' : 'not authenticated')

    // Use provided userId or authenticated user
    const actualUserId = userId || user?.id

    let query = getSupabaseClient()
      .from('gym_posts')
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
          name
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    console.log('getFeedPosts: Executing main query')
    const { data, error } = await query

    if (error) {
      console.error('getFeedPosts: Main query error:', error)
      console.error('getFeedPosts: Main query error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      // エラーが発生しても空の配列を返すのではなく、エラーを投げる
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
      training_details: post.training_details, // トレーニング詳細を追加
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

    console.log('getFeedPosts: Successfully returning', posts.length, 'posts from database')
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
export async function getUserPosts(userId: string, page = 1, limit = 10) {
  try {
    const { data: { user } } = await getSupabaseClient().auth.getUser()
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

    // モック環境での開発用: 認証ユーザーがいない場合はTSUBASAユーザーIDを使用
    const actualUserId = user?.id || '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'

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
        is_public: (post.visibility ?? 'public') === 'public',
        like_count: 0,
        comment_count: 0,
        likes_count: 0,
        comments_count: 0
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
    const actualUserId = user?.id || '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'

    // 投稿の所有者確認
    const { data: existingPost, error: fetchError } = await getSupabaseClient()
      .from('gym_posts')
      .select('user_id')
      .eq('id', postId)
      .single()

    if (fetchError) throw fetchError
    if (!existingPost) throw new Error('Post not found')

    // サンプルデータの場合はモック更新を返す
    if (postId.startsWith('sample-')) {
      console.log('Mock update for sample post:', postId, updates)
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

    console.log('Updating post in database:', postId, updateData)

    const { data, error } = await getSupabaseClient()
      .from('gym_posts')
      .update(updateData)
      .eq('id', postId)
      .select()
      .single()

    if (error) throw error

    console.log('Post updated successfully:', data)
    return data
  } catch (error) {
    console.error('Error updating post:', error)
    throw error
  }
}

// 投稿を削除
export async function deletePost(postId: string) {
  try {
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
    const actualUserId = user?.id || '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'

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
    const actualUserId = user?.id || '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'

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
    const actualUserId = user?.id || '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'

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
