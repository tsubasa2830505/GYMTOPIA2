import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ジム詳細情報の型定義
export interface GymDetailedInfo {
  id?: string
  gym_id: string
  pricing_details?: string | null
  membership_plans?: string | null
  business_hours_details?: string | null
  staff_hours?: string | null
  rules_and_regulations?: string | null
  dress_code?: string | null
  beginner_support?: string | null
  trial_info?: string | null
  access_details?: string | null
  parking_details?: string | null
  special_programs?: string | null
  announcements?: string | null
  additional_info?: string | null
  created_at?: string
  updated_at?: string
  updated_by?: string
}

/**
 * ジム詳細情報を取得
 */
export async function getGymDetailedInfo(gymId: string): Promise<GymDetailedInfo | null> {
  try {
    const { data, error } = await supabase
      .from('gym_detailed_info')
      .select('*')
      .eq('gym_id', gymId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching gym detailed info:', error)
      return null
    }

    return data as GymDetailedInfo
  } catch (error) {
    console.error('Error in getGymDetailedInfo:', error)
    return null
  }
}

/**
 * ジム詳細情報を保存（作成/更新）
 */
export async function saveGymDetailedInfo(
  gymId: string,
  info: Partial<Omit<GymDetailedInfo, 'id' | 'gym_id' | 'created_at' | 'updated_at' | 'updated_by'>>
): Promise<{ success: boolean; error?: string; data?: GymDetailedInfo }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'ログインが必要です' }
    }

    // 既存の詳細情報があるか確認
    const existing = await getGymDetailedInfo(gymId)

    if (existing) {
      // 更新
      const { data, error } = await supabase
        .from('gym_detailed_info')
        .update({
          ...info,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        })
        .eq('gym_id', gymId)
        .select()
        .single()

      if (error) {
        console.error('Error updating gym detailed info:', error)
        return { success: false, error: '詳細情報の更新に失敗しました' }
      }

      return { success: true, data: data as GymDetailedInfo }
    } else {
      // 新規作成
      const { data, error } = await supabase
        .from('gym_detailed_info')
        .insert({
          gym_id: gymId,
          ...info,
          updated_by: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating gym detailed info:', error)
        return { success: false, error: '詳細情報の作成に失敗しました' }
      }

      return { success: true, data: data as GymDetailedInfo }
    }
  } catch (error) {
    console.error('Error in saveGymDetailedInfo:', error)
    return { success: false, error: '予期しないエラーが発生しました' }
  }
}

/**
 * ジム詳細情報を削除
 */
export async function deleteGymDetailedInfo(gymId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'ログインが必要です' }
    }

    const { error } = await supabase
      .from('gym_detailed_info')
      .delete()
      .eq('gym_id', gymId)

    if (error) {
      console.error('Error deleting gym detailed info:', error)
      return { success: false, error: '詳細情報の削除に失敗しました' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in deleteGymDetailedInfo:', error)
    return { success: false, error: '予期しないエラーが発生しました' }
  }
}