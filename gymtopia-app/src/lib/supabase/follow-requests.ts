import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface FollowRequest {
  id: string
  requester_id: string
  target_user_id: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  requester?: {
    id: string
    username: string
    display_name: string
    avatar_url: string
  }
  target_user?: {
    id: string
    username: string
    display_name: string
    avatar_url: string
  }
}

// フォローリクエストを送信
export async function sendFollowRequest(targetUserId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClientComponentClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'ログインが必要です' }
    }

    // 既存のリクエストをチェック
    const { data: existingRequest } = await supabase
      .from('follow_requests')
      .select('id, status')
      .eq('requester_id', user.id)
      .eq('target_user_id', targetUserId)
      .single()

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return { success: false, error: 'すでにリクエストを送信済みです' }
      }
      if (existingRequest.status === 'rejected') {
        // 拒否されたリクエストを再送信
        const { error } = await supabase
          .from('follow_requests')
          .update({ status: 'pending', updated_at: new Date().toISOString() })
          .eq('id', existingRequest.id)

        if (error) throw error
        return { success: true }
      }
    }

    // 新規リクエストを作成
    const { error } = await supabase
      .from('follow_requests')
      .insert({
        requester_id: user.id,
        target_user_id: targetUserId,
        status: 'pending'
      })

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('フォローリクエスト送信エラー:', error)
    return { success: false, error: 'リクエストの送信に失敗しました' }
  }
}

// 受信したフォローリクエストを取得
export async function getReceivedFollowRequests(): Promise<FollowRequest[]> {
  const supabase = createClientComponentClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('follow_requests')
      .select(`
        *,
        requester:requester_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('target_user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('受信リクエスト取得エラー:', error)
    return []
  }
}

// 送信したフォローリクエストを取得
export async function getSentFollowRequests(): Promise<FollowRequest[]> {
  const supabase = createClientComponentClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('follow_requests')
      .select(`
        *,
        target_user:target_user_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('requester_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('送信リクエスト取得エラー:', error)
    return []
  }
}

// フォローリクエストを承認
export async function approveFollowRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClientComponentClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'ログインが必要です' }
    }

    // リクエストを承認
    const { data: request, error: updateError } = await supabase
      .from('follow_requests')
      .update({ status: 'approved' })
      .eq('id', requestId)
      .eq('target_user_id', user.id)
      .select('requester_id')
      .single()

    if (updateError) throw updateError

    // フォロー関係を作成
    const { error: followError } = await supabase
      .from('follows')
      .insert({
        follower_id: request.requester_id,
        following_id: user.id
      })

    if (followError && followError.code !== '23505') { // 重複エラー以外
      throw followError
    }

    return { success: true }
  } catch (error) {
    console.error('リクエスト承認エラー:', error)
    return { success: false, error: '承認処理に失敗しました' }
  }
}

// フォローリクエストを拒否
export async function rejectFollowRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClientComponentClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'ログインが必要です' }
    }

    const { error } = await supabase
      .from('follow_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId)
      .eq('target_user_id', user.id)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('リクエスト拒否エラー:', error)
    return { success: false, error: '拒否処理に失敗しました' }
  }
}

// フォローリクエストをキャンセル
export async function cancelFollowRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClientComponentClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'ログインが必要です' }
    }

    const { error } = await supabase
      .from('follow_requests')
      .delete()
      .eq('id', requestId)
      .eq('requester_id', user.id)
      .eq('status', 'pending')

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('リクエストキャンセルエラー:', error)
    return { success: false, error: 'キャンセル処理に失敗しました' }
  }
}

// ユーザーが非公開アカウントかチェック
export async function checkIsPrivateUser(userId: string): Promise<boolean> {
  const supabase = createClientComponentClient()

  try {
    const { data, error } = await supabase
      .from('users')
      .select('is_private')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data?.is_private || false
  } catch (error) {
    console.error('非公開チェックエラー:', error)
    return false
  }
}