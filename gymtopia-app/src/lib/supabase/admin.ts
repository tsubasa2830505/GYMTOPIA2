import { supabase } from './client'

// ユーザーが管理するジムを取得
export async function getUserManagedGyms() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    console.log('Getting managed gyms for user:', user?.id, user?.email)
    
    if (!user) {
      console.log('No authenticated user found')
      throw new Error('Not authenticated')
    }

    // まずgym_ownersを取得
    const { data: ownerData, error: ownerError } = await supabase
      .from('gym_owners')
      .select('*')
      .eq('user_id', user.id)

    if (ownerError) {
      console.error('Database error:', ownerError)
      throw ownerError
    }

    if (!ownerData || ownerData.length === 0) {
      console.log('No gyms found for user')
      return []
    }

    // gym_idのリストを作成
    const gymIds = ownerData.map(o => o.gym_id)

    // gymsテーブルから該当するジムを取得（imagesフィールドを明示的に含める）
    const { data: gymsData, error: gymsError } = await supabase
      .from('gyms')
      .select('*, images')
      .in('id', gymIds)

    if (gymsError) {
      console.error('Error fetching gyms:', gymsError)
      throw gymsError
    }

    console.log('[getUserManagedGyms] Gyms data:', gymsData)
    console.log('[getUserManagedGyms] First gym images:', gymsData?.[0]?.images)

    // データを結合
    const data = ownerData.map(owner => ({
      ...owner,
      gym: gymsData?.find(g => g.id === owner.gym_id) || null
    }))

    console.log('Gym owners query result:', { data })
    console.log('Managed gyms found:', data?.length || 0)
    return data || []
  } catch (error) {
    console.error('Error fetching managed gyms:', error instanceof Error ? error.message : JSON.stringify(error))
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
export async function updateGymBasicInfo(gymId: string, updates: {
  name?: string,
  city?: string,
  address?: string,
  business_hours?: any,
  price_info?: any,
  facilities?: any
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // オーナー権限チェック
    const isOwner = await isGymOwner(gymId)
    if (!isOwner) throw new Error('Permission denied')

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // 許可されたフィールドのみ更新
    if (updates.name) updateData.name = updates.name
    if (updates.city) updateData.city = updates.city
    if (updates.address) updateData.address = updates.address
    if (updates.business_hours) updateData.business_hours = updates.business_hours
    if (updates.price_info) updateData.price_info = updates.price_info
    if (updates.facilities) {
      // facilitiesフィールドの統一（has_24h, has_showerなどをfacilitiesオブジェクトに移行）
      updateData.facilities = updates.facilities
      // 旧フィールドも更新（互換性のため）
      updateData.has_24h = updates.facilities['24hours']
      updateData.has_shower = updates.facilities.shower
      updateData.has_parking = updates.facilities.parking
      updateData.has_locker = updates.facilities.locker
      updateData.has_sauna = updates.facilities.sauna
    }

    const { data, error } = await supabase
      .from('gyms')
      .update(updateData)
      .eq('id', gymId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating gym:', error instanceof Error ? error.message : JSON.stringify(error))
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
        // 互換: name列がある環境ではnameも保存（安全）
        name: (details && details.name) ? details.name : undefined,
        ...details
      } as any)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error adding machine:', error instanceof Error ? error.message : JSON.stringify(error))
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

    // Try delete by machine_id first (normalized path), then fallback to row id
    const { error } = await supabase
      .from('gym_machines')
      .delete()
      .eq('gym_id', gymId)
      .eq('machine_id', machineId)

    if (error) {
      const { error: fallbackErr } = await supabase
        .from('gym_machines')
        .delete()
        .eq('gym_id', gymId)
        .eq('id', machineId)
      if (fallbackErr) throw fallbackErr
    }
    return true
  } catch (error) {
    console.error('Error removing machine:', error instanceof Error ? error.message : JSON.stringify(error))
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

    // gym_review_repliesテーブルに返信を追加
    const { data, error } = await supabase
      .from('gym_review_replies')
      .insert({
        review_id: reviewId,
        responder_user_id: user.id,
        role: 'owner',
        content: reply
      } as any)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error replying to review:', error instanceof Error ? error.message : JSON.stringify(error))
    throw error
  }
}

// ジムのレビューを取得（返信付き）
export async function getGymReviews(gymId: string) {
  try {
    const { data, error } = await supabase
      .from('gym_reviews')
      .select(`
        *,
        user:users(id, username, display_name, avatar_url),
        replies:gym_review_replies(
          *,
          responder:users(id, username, display_name)
        )
      `)
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching gym reviews:', error instanceof Error ? error.message : JSON.stringify(error))
    return []
  }
}

// ジムの設備情報を取得
export async function getGymEquipment(gymId: string) {
  try {
    // まず基本的な設備情報を取得
    const { data: machines, error: machinesError } = await supabase
      .from('gym_machines')
      .select('*')
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false })

    const { data: freeWeights, error: freeWeightsError } = await supabase
      .from('gym_free_weights')
      .select('*')
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false })

    if (machinesError || freeWeightsError) {
      console.error('Database error:', { machinesError, freeWeightsError })
      throw machinesError || freeWeightsError
    }

    // 作成者情報が必要な設備のcreated_byを収集
    const creatorIds = [
      ...(machines || []).map(m => m.created_by).filter(Boolean),
      ...(freeWeights || []).map(f => f.created_by).filter(Boolean)
    ]

    // 作成者情報を取得（重複を除去）
    let creatorsMap: Record<string, any> = {}
    if (creatorIds.length > 0) {
      const uniqueCreatorIds = [...new Set(creatorIds)]
      const { data: creators } = await supabase
        .from('users')
        .select('id, display_name, username, email')
        .in('id', uniqueCreatorIds)

      if (creators) {
        creatorsMap = creators.reduce((acc, creator) => {
          acc[creator.id] = creator
          return acc
        }, {} as Record<string, any>)
      }
    }

    // 設備データに作成者情報を追加
    const machinesWithCreators = (machines || []).map(m => ({
      ...m,
      creator: m.created_by ? creatorsMap[m.created_by] : null
    }))

    const freeWeightsWithCreators = (freeWeights || []).map(f => ({
      ...f,
      creator: f.created_by ? creatorsMap[f.created_by] : null
    }))

    console.log('Equipment loaded successfully:', {
      machines: machinesWithCreators.length,
      freeWeights: freeWeightsWithCreators.length
    })

    return {
      machines: machinesWithCreators,
      freeWeights: freeWeightsWithCreators
    }
  } catch (error) {
    console.error('Error fetching gym equipment:', error instanceof Error ? error.message : JSON.stringify(error))
    return { machines: [], freeWeights: [] }
  }
}

// ジムの設備を追加（新しい実装）
export async function addGymEquipment(gymId: string, equipment: {
  type: 'machine' | 'freeweight',
  name: string,
  brand?: string,
  count?: number,
  weight_range?: string,
  condition?: string
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const isOwner = await isGymOwner(gymId)
    if (!isOwner) throw new Error('Permission denied')

    const table = equipment.type === 'machine' ? 'gym_machines' : 'gym_free_weights'
    const insertData: any = {
      gym_id: gymId,
      name: equipment.name,
      brand: equipment.brand,
      count: equipment.count || 1,
      condition: equipment.condition || '良好',
      created_by: user.id,
      updated_by: user.id
    }

    if (equipment.type === 'freeweight' && equipment.weight_range) {
      insertData.weight_range = equipment.weight_range
    }

    const { data, error } = await supabase
      .from(table)
      .insert(insertData as any)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error adding equipment:', error instanceof Error ? error.message : JSON.stringify(error))
    throw error
  }
}

// ジムの設備を追加（一般ユーザー用）
export async function suggestGymEquipment(gymId: string, equipment: {
  type: 'machine' | 'freeweight',
  name: string,
  brand?: string,
  count?: number,
  weight_range?: string,
  condition?: string
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('ログインが必要です')

    const table = equipment.type === 'machine' ? 'gym_machines' : 'gym_free_weights'
    const insertData: any = {
      gym_id: gymId,
      name: equipment.name,
      brand: equipment.brand,
      count: equipment.count || 1,
      condition: equipment.condition || '良好',
      created_by: user.id,
      updated_by: user.id
    }

    if (equipment.type === 'freeweight' && equipment.weight_range) {
      insertData.weight_range = equipment.weight_range
    }

    const { data, error } = await supabase
      .from(table)
      .insert(insertData as any)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error suggesting equipment:', error instanceof Error ? error.message : JSON.stringify(error))
    throw error
  }
}

// ジムの設備を削除
export async function deleteGymEquipment(gymId: string, equipmentId: string, type: 'machine' | 'freeweight') {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const isOwner = await isGymOwner(gymId)
    if (!isOwner) throw new Error('Permission denied')

    const table = type === 'machine' ? 'gym_machines' : 'gym_free_weights'

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', equipmentId)
      .eq('gym_id', gymId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting equipment:', error instanceof Error ? error.message : JSON.stringify(error))
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
      } as any)
      .select()
      .single()

    if (error) throw error

    // ユーザーのロールも更新
    await supabase
      .from('users')
      .update({
        is_gym_owner: true,
        role: 'gym_owner'
      } as any)
      .eq('id', userId)

    return data
  } catch (error) {
    console.error('Error assigning gym owner:', error instanceof Error ? error.message : JSON.stringify(error))
    throw error
  }
}
