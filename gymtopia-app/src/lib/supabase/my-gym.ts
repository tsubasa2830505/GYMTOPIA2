import { supabase } from './client'
import type { Gym } from '@/lib/types/gym'

// ユーザーのジム選択データを取得
export async function getUserGymSelections(userId: string): Promise<{
  primaryGym: Gym | null
  secondaryGyms: Gym[]
}> {
  try {
    // プライマリジムを取得
    const { data: primaryData, error: primaryError } = await supabase
      .from('user_primary_gyms')
      .select(`
        gym_id,
        gyms!inner (
          id,
          name,
          address,
          phone,
          images,
          latitude,
          longitude,
          business_hours,
          website,
          description
        )
      `)
      .eq('user_id', userId)
      .single()

    let primaryGym: Gym | null = null
    if (!primaryError && primaryData?.gyms) {
      primaryGym = primaryData.gyms as Gym
    }

    // セカンダリジムを取得
    const { data: secondaryData, error: secondaryError } = await supabase
      .from('user_secondary_gyms')
      .select(`
        gym_id,
        gyms!inner (
          id,
          name,
          address,
          phone,
          images,
          latitude,
          longitude,
          business_hours,
          website,
          description
        )
      `)
      .eq('user_id', userId)

    let secondaryGyms: Gym[] = []
    if (!secondaryError && secondaryData) {
      secondaryGyms = secondaryData.map(item => item.gyms as Gym)
    }

    return {
      primaryGym,
      secondaryGyms
    }
  } catch (error) {
    console.error('Error fetching user gym selections:', error instanceof Error ? error.message : JSON.stringify(error))
    return {
      primaryGym: null,
      secondaryGyms: []
    }
  }
}

// ユーザーのプライマリジムを更新
export async function updateUserPrimaryGym(userId: string, gymId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_primary_gyms')
      .upsert({
        user_id: userId,
        gym_id: gymId,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('Error updating primary gym:', error instanceof Error ? error.message : JSON.stringify(error))
      return false
    }

    return true
  } catch (error) {
    console.error('Error in updateUserPrimaryGym:', error instanceof Error ? error.message : JSON.stringify(error))
    return false
  }
}

// セカンダリジムを追加
export async function addSecondaryGym(userId: string, gymId: string): Promise<boolean> {
  try {
    // 既に追加されているかチェック
    const { data: existing } = await supabase
      .from('user_secondary_gyms')
      .select('id')
      .eq('user_id', userId)
      .eq('gym_id', gymId)
      .single()

    if (existing) {
      console.log('Gym already added as secondary')
      return true
    }

    const { error } = await supabase
      .from('user_secondary_gyms')
      .insert({
        user_id: userId,
        gym_id: gymId,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error adding secondary gym:', error instanceof Error ? error.message : JSON.stringify(error))
      return false
    }

    return true
  } catch (error) {
    console.error('Error in addSecondaryGym:', error instanceof Error ? error.message : JSON.stringify(error))
    return false
  }
}

// セカンダリジムを削除
export async function removeSecondaryGym(userId: string, gymId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_secondary_gyms')
      .delete()
      .eq('user_id', userId)
      .eq('gym_id', gymId)

    if (error) {
      console.error('Error removing secondary gym:', error instanceof Error ? error.message : JSON.stringify(error))
      return false
    }

    return true
  } catch (error) {
    console.error('Error in removeSecondaryGym:', error instanceof Error ? error.message : JSON.stringify(error))
    return false
  }
}

// 利用可能なジム一覧を取得
export async function getAvailableGyms(): Promise<Gym[]> {
  try {
    const { data, error } = await supabase
      .from('gyms')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching available gyms:', error instanceof Error ? error.message : JSON.stringify(error))
      return []
    }

    return data as Gym[]
  } catch (error) {
    console.error('Error in getAvailableGyms:', error instanceof Error ? error.message : JSON.stringify(error))
    return []
  }
}