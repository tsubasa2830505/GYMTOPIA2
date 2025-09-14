import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ジムノートの型定義
export interface GymNote {
  id: string
  gym_id: string
  user_id: string
  note: string
  is_private: boolean
  created_at: string
  updated_at: string
  user?: {
    display_name?: string
    username?: string
    avatar_url?: string
  }
}

/**
 * ユーザーの個人メモを取得
 */
export async function getUserGymNote(gymId: string): Promise<GymNote | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('gym_notes')
      .select('*')
      .eq('gym_id', gymId)
      .eq('user_id', user.id)
      .eq('is_private', true)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching gym note:', error)
      return null
    }

    return data as GymNote
  } catch (error) {
    console.error('Error in getUserGymNote:', error)
    return null
  }
}

/**
 * ジムの公開コメントを取得
 */
export async function getGymPublicComments(gymId: string): Promise<GymNote[]> {
  try {
    const { data, error } = await supabase
      .from('gym_notes')
      .select(`
        *,
        user:users(display_name, username, avatar_url)
      `)
      .eq('gym_id', gymId)
      .eq('is_private', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching public comments:', error)
      return []
    }

    return data as GymNote[]
  } catch (error) {
    console.error('Error in getGymPublicComments:', error)
    return []
  }
}

/**
 * ジムメモを保存（作成/更新）
 */
export async function saveGymNote(
  gymId: string,
  note: string,
  isPrivate: boolean = true
): Promise<{ success: boolean; error?: string; data?: GymNote }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'ログインが必要です' }
    }

    // 既存のメモがあるか確認（プライベートメモの場合のみ）
    if (isPrivate) {
      const existingNote = await getUserGymNote(gymId)

      if (existingNote) {
        // 更新
        const { data, error } = await supabase
          .from('gym_notes')
          .update({ note, updated_at: new Date().toISOString() })
          .eq('id', existingNote.id)
          .select()
          .single()

        if (error) {
          console.error('Error updating gym note:', error)
          return { success: false, error: 'メモの更新に失敗しました' }
        }

        return { success: true, data: data as GymNote }
      }
    }

    // 新規作成
    const { data, error } = await supabase
      .from('gym_notes')
      .insert({
        gym_id: gymId,
        user_id: user.id,
        note,
        is_private: isPrivate
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating gym note:', error)
      return { success: false, error: 'メモの作成に失敗しました' }
    }

    return { success: true, data: data as GymNote }
  } catch (error) {
    console.error('Error in saveGymNote:', error)
    return { success: false, error: '予期しないエラーが発生しました' }
  }
}

/**
 * ジムメモを削除
 */
export async function deleteGymNote(noteId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'ログインが必要です' }
    }

    const { error } = await supabase
      .from('gym_notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting gym note:', error)
      return { success: false, error: 'メモの削除に失敗しました' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in deleteGymNote:', error)
    return { success: false, error: '予期しないエラーが発生しました' }
  }
}

/**
 * ユーザーのすべてのジムメモを取得
 */
export async function getAllUserGymNotes(): Promise<GymNote[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('gym_notes')
      .select(`
        *,
        gym:gyms(id, name, address)
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching all user notes:', error)
      return []
    }

    return data as GymNote[]
  } catch (error) {
    console.error('Error in getAllUserGymNotes:', error)
    return []
  }
}