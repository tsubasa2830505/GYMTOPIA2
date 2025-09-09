import { supabase } from './client'

// ユーザーが管理するジムを取得
export async function getUserManagedGyms() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('gym_owners')
      .select(`
        *,
        gym:gyms(*)
      `)
      .eq('user_id', user.id)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching managed gyms:', error)
    return []
  }
}

// ユーザーが特定のジムのオーナーかチェック
export async function isGymOwner(gymId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase
      .from('gym_owners')
      .select('id')
      .eq('user_id', user.id)
      .eq('gym_id', gymId)
      .single()

    return !error && !!data
  } catch (error) {
    return false
  }
}

// ジムの基本情報を更新（オーナーのみ）
export async function updateGymBasicInfo(gymId: string, updates: any) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // オーナー権限チェック
    const isOwner = await isGymOwner(gymId)
    if (!isOwner) throw new Error('Permission denied')

    const { data, error } = await supabase
      .from('gyms')
      .update(updates)
      .eq('id', gymId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating gym:', error)
    throw error
  }
}

// ジムのマシンを追加（オーナーのみ）
export async function addGymMachine(gymId: string, machineId: string, details?: any) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const isOwner = await isGymOwner(gymId)
    if (!isOwner) throw new Error('Permission denied')

    const { data, error } = await supabase
      .from('gym_machines')
      .insert({
        gym_id: gymId,
        machine_id: machineId,
        ...details
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error adding machine:', error)
    throw error
  }
}

// ジムのマシンを削除（オーナーのみ）
export async function removeGymMachine(gymId: string, machineId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const isOwner = await isGymOwner(gymId)
    if (!isOwner) throw new Error('Permission denied')

    const { error } = await supabase
      .from('gym_machines')
      .delete()
      .eq('gym_id', gymId)
      .eq('machine_id', machineId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error removing machine:', error)
    throw error
  }
}

// レビューに返信（オーナーのみ）
export async function replyToReview(gymId: string, reviewId: string, reply: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const isOwner = await isGymOwner(gymId)
    if (!isOwner) throw new Error('Permission denied')

    const { data, error } = await supabase
      .from('gym_reviews')
      .update({
        owner_reply: reply,
        owner_reply_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .eq('gym_id', gymId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error replying to review:', error)
    throw error
  }
}

// ユーザーをジムオーナーとして登録（管理者機能）
export async function assignGymOwner(userId: string, gymId: string, role = 'owner') {
  try {
    const { data, error } = await supabase
      .from('gym_owners')
      .insert({
        user_id: userId,
        gym_id: gymId,
        role: role
      })
      .select()
      .single()

    if (error) throw error

    // ユーザーのロールも更新
    await supabase
      .from('users')
      .update({ 
        is_gym_owner: true,
        role: 'gym_owner'
      })
      .eq('id', userId)

    return data
  } catch (error) {
    console.error('Error assigning gym owner:', error)
    throw error
  }
}