// Supabaseクライアント設定
import { createClient } from '@supabase/supabase-js'

// 環境変数から取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Supabaseクライアントの作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// =====================================================
// 認証関連の関数
// =====================================================

export const auth = {
  // サインアップ
  async signUp(email: string, password: string, username: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    })
    
    if (error) throw error
    
    // プロファイル作成
    if (data.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          username,
          display_name: username,
        })
      
      if (profileError) throw profileError
    }
    
    return data
  },

  // サインイン
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    return data
  },

  // サインアウト
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // 現在のユーザー取得
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },
}

// =====================================================
// データベース操作関数
// =====================================================

export const db = {
  // ジム検索
  async searchGyms(params: {
    keyword?: string
    machines?: string[]
    freeWeights?: string[]
    lat?: number
    lng?: number
    radius?: number
  }) {
    // 位置情報がある場合は近傍検索（他条件は今後の拡張でRPCへ統合）
    if (params.lat && params.lng) {
      const { data: nearbyGyms, error: locationError } = await supabase
        .rpc('find_nearby_gyms', {
          user_lat: params.lat,
          user_lng: params.lng,
          radius_km: params.radius || 5
        })
      
      if (locationError) throw locationError
      return nearbyGyms
    }

    // 正規化テーブルに基づくJOIN検索（タイプベース）
    const types: string[] = []
    if (params.machines && params.machines.length > 0) types.push('machine')
    if (params.freeWeights && params.freeWeights.length > 0) types.push('free_weight')

    if (types.length > 0) {
      // gyms ←(inner) gym_equipment ←(inner) equipment
      // PostgRESTの埋め込みリレーションを利用
      let geQuery = supabase
        .from('gyms')
        .select('id,name,area,address,latitude,longitude,facilities, gym_equipment!inner(equipment!inner(type))')
        .in('gym_equipment.equipment.type', types)

      if (params.keyword) {
        geQuery = geQuery.or(`name.ilike.%${params.keyword}%,address.ilike.%${params.keyword}%,area.ilike.%${params.keyword}%`)
      }

      const { data: gymsByJoin, error: geError } = await geQuery
      if (geError) {
        // フォールバック: JSON facilities contains（後方互換）
        let fb = supabase.from('gyms').select('*')
        if (params.keyword) {
          fb = fb.or(`name.ilike.%${params.keyword}%,address.ilike.%${params.keyword}%`)
        }
        if (types.includes('machine')) {
          fb = fb.contains('facilities', { machines: params.machines || [] })
        }
        if (types.includes('free_weight')) {
          fb = fb.contains('facilities', { free_weights: params.freeWeights || [] })
        }
        const { data: fbData, error: fbError } = await fb
        if (fbError) throw fbError
        return fbData
      }
      return gymsByJoin
    }

    // タイプ指定がない場合は基本のキーワード検索
    let query = supabase.from('gyms').select('*')
    if (params.keyword) {
      query = query.or(`name.ilike.%${params.keyword}%,address.ilike.%${params.keyword}%,area.ilike.%${params.keyword}%`)
    }
    const { data, error } = await query
    if (error) throw error
    return data
  },

  // フィード取得
  async getFeed(params: {
    userId: string
    feedType?: 'all' | 'following' | 'gym_friends' | 'same_gym'
    limit?: number
    offset?: number
  }) {
    const { data, error } = await supabase
      .rpc('get_personalized_feed', {
        current_user_id: params.userId,
        feed_type: params.feedType || 'all',
        limit_count: params.limit || 20,
        offset_count: params.offset || 0
      })
    
    if (error) throw error
    return data
  },

  // 投稿作成
  async createPost(params: {
    userId: string
    gymId: string
    content: string
    crowdStatus?: 'empty' | 'normal' | 'crowded'
    trainingDetails?: Record<string, unknown>
    imageUrls?: string[]
  }) {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: params.userId,
        gym_id: params.gymId,
        content: params.content,
        crowd_status: params.crowdStatus,
        training_details: params.trainingDetails,
        image_urls: params.imageUrls || []
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // いいね追加/削除
  async toggleLike(postId: string, userId: string) {
    // 既存のいいねをチェック
    const { data: existing } = await supabase
      .from('likes')
      .select()
      .match({ post_id: postId, user_id: userId })
      .single()
    
    if (existing) {
      // いいね削除
      const { error } = await supabase
        .from('likes')
        .delete()
        .match({ post_id: postId, user_id: userId })
      
      if (error) throw error
      return false
    } else {
      // いいね追加
      const { error } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: userId })
      
      if (error) throw error
      return true
    }
  },

  // コメント追加
  async addComment(postId: string, userId: string, content: string) {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // フォロー/アンフォロー
  async toggleFollow(followerId: string, followingId: string) {
    // 既存のフォローをチェック
    const { data: existing } = await supabase
      .from('follows')
      .select()
      .match({ follower_id: followerId, following_id: followingId })
      .single()
    
    if (existing) {
      // アンフォロー
      const { error } = await supabase
        .from('follows')
        .delete()
        .match({ follower_id: followerId, following_id: followingId })
      
      if (error) throw error
      return false
    } else {
      // フォロー
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: followerId, following_id: followingId })
      
      if (error) throw error
      return true
    }
  },

  // お気に入りジム追加/削除
  async toggleFavoriteGym(userId: string, gymId: string) {
    // 既存のお気に入りをチェック
    const { data: existing } = await supabase
      .from('favorite_gyms')
      .select()
      .match({ user_id: userId, gym_id: gymId })
      .single()
    
    if (existing) {
      // お気に入り削除
      const { error } = await supabase
        .from('favorite_gyms')
        .delete()
        .match({ user_id: userId, gym_id: gymId })
      
      if (error) throw error
      return false
    } else {
      // お気に入り追加
      const { error } = await supabase
        .from('favorite_gyms')
        .insert({ user_id: userId, gym_id: gymId })
      
      if (error) throw error
      return true
    }
  },

  // プロファイル更新
  async updateProfile(userId: string, updates: {
    display_name?: string
    bio?: string
    avatar_url?: string
    personal_records?: Record<string, unknown>
  }) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
}

// =====================================================
// リアルタイム機能
// =====================================================

export const realtime = {
  // 投稿のリアルタイム購読
  subscribeToFeed(callback: (payload: Record<string, unknown>) => void) {
    return supabase
      .channel('feed_posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        callback
      )
      .subscribe()
  },

  // いいねのリアルタイム購読
  subscribesToLikes(postId: string, callback: (payload: Record<string, unknown>) => void) {
    return supabase
      .channel(`likes:${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `post_id=eq.${postId}`
        },
        callback
      )
      .subscribe()
  },

  // チャット/コメントのリアルタイム購読
  subscribeToComments(postId: string, callback: (payload: Record<string, unknown>) => void) {
    return supabase
      .channel(`comments:${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        callback
      )
      .subscribe()
  },

  // 購読解除
  unsubscribe(channel: ReturnType<typeof supabase.channel>) {
    supabase.removeChannel(channel)
  },
}

// =====================================================
// ストレージ操作
// =====================================================

export const storage = {
  // 画像アップロード
  async uploadImage(file: File, bucket: string = 'post-images') {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file)

    if (error) throw error

    // 公開URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return publicUrl
  },

  // 画像削除
  async deleteImage(url: string, bucket: string = 'post-images') {
    const fileName = url.split('/').pop()
    if (!fileName) throw new Error('Invalid file URL')

    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName])

    if (error) throw error
  },
}
