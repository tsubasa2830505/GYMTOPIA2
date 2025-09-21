// Modular gyms API - Re-exports from original gyms.ts for backward compatibility
import { supabase } from '../client'
import { logger } from '../../utils/logger'

// ジムの型定義
import type { GymFacilities, FacilityKey } from '@/types/facilities'
export interface Gym {
  id: string
  name: string
  name_kana?: string
  description?: string
  latitude?: number
  longitude?: number
  address?: string
  prefecture?: string
  city?: string
  business_hours?: Record<string, unknown>
  facilities?: GymFacilities
  equipment_types?: string[]
  machine_brands?: string[]
  rating?: number
  review_count?: number
  verified?: boolean
  images?: string[]  // 画像配列を追加
  phone?: string
  website?: string
  price_info?: Record<string, unknown>
}

// マシン設備
export interface GymMachine {
  id: string
  gym_id: string
  name: string
  brand?: string
  count?: number
  condition?: string
  created_at?: string
  updated_at?: string
  updated_by?: string
}

// フリーウェイト設備
export interface GymFreeWeight {
  id: string
  gym_id: string
  name: string
  brand?: string
  count?: number
  weight_range?: string
  created_at?: string
  updated_at?: string
  updated_by?: string
}

// レビュー
export interface GymReview {
  id: string
  gym_id: string
  user_id: string
  rating: number
  content: string
  created_at: string
  user?: {
    id: string
    display_name: string
    username: string
    avatar_url?: string
  }
  replies?: Array<{
    id: string
    content: string
    created_at: string
    user: {
      display_name: string
      avatar_url?: string
    }
  }>
}

// Statistics functions
export async function getGymLikesCount(gymId: string) {
  try {
    const { count, error } = await supabase
      .from('favorite_gyms')
      .select('*', { count: 'exact', head: true })
      .eq('gym_id', gymId)

    if (error) throw error
    return count || 0
  } catch (error) {
    logger.error('Error getting gym likes count:', error)
    return 0
  }
}

export async function getGymReviewStats(gymId: string): Promise<{ average: number; count: number }> {
  try {
    const { data, error } = await supabase
      .from('gym_reviews')
      .select('rating')
      .eq('gym_id', gymId)

    if (error) throw error

    if (!data || data.length === 0) {
      return { average: 0, count: 0 }
    }

    const average = data.reduce((sum, review) => sum + review.rating, 0) / data.length
    return { average: Math.round(average * 10) / 10, count: data.length }
  } catch (error) {
    logger.error('Error getting gym review stats:', error)
    return { average: 0, count: 0 }
  }
}

export async function getGymEquipmentStats(gymId: string): Promise<{ types: number; totalUnits: number }> {
  try {
    const [machinesResult, freeWeightsResult] = await Promise.all([
      supabase.from('gym_machines').select('count').eq('gym_id', gymId),
      supabase.from('gym_free_weights').select('count').eq('gym_id', gymId)
    ])

    const machineTypes = machinesResult.data?.length || 0
    const freeWeightTypes = freeWeightsResult.data?.length || 0
    const totalMachineUnits = machinesResult.data?.reduce((sum, m) => sum + (m.count || 1), 0) || 0
    const totalFreeWeightUnits = freeWeightsResult.data?.reduce((sum, fw) => sum + (fw.count || 1), 0) || 0

    return {
      types: machineTypes + freeWeightTypes,
      totalUnits: totalMachineUnits + totalFreeWeightUnits
    }
  } catch (error) {
    logger.error('Error getting gym equipment stats:', error)
    return { types: 0, totalUnits: 0 }
  }
}

// Core gym functions
export async function getGyms(filters?: {
  prefecture?: string
  city?: string
  facilities?: FacilityKey[]
  equipment_types?: string[]
  lat?: number
  lng?: number
  radius?: number
  search?: string
  limit?: number
  offset?: number
}): Promise<Gym[]> {
  try {
    let query = supabase.from('gyms').select(`
      id,
      name,
      name_kana,
      description,
      latitude,
      longitude,
      address,
      prefecture,
      city,
      business_hours,
      facilities,
      equipment_types,
      machine_brands,
      rating,
      review_count,
      verified,
      images,
      phone,
      website,
      price_info
    `)

    // フィルター適用
    if (filters?.prefecture) {
      query = query.eq('prefecture', filters.prefecture)
    }

    if (filters?.city) {
      query = query.eq('city', filters.city)
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,address.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters?.equipment_types && filters.equipment_types.length > 0) {
      query = query.overlaps('equipment_types', filters.equipment_types)
    }

    // ページネーション
    if (filters?.limit) {
      const offset = filters.offset || 0
      query = query.range(offset, offset + filters.limit - 1)
    }

    const { data, error } = await query.order('name')

    if (error) {
      logger.error('Error fetching gyms:', error)
      return []
    }

    let gyms = data || []

    // 位置ベースフィルタリング
    if (filters?.lat && filters?.lng && filters?.radius) {
      gyms = gyms.filter(gym => {
        if (!gym.latitude || !gym.longitude) return false
        const distance = calculateDistance(
          filters.lat!,
          filters.lng!,
          gym.latitude,
          gym.longitude
        )
        return distance <= (filters.radius || 10)
      })
    }

    // 施設フィルタリング
    if (filters?.facilities && filters.facilities.length > 0) {
      gyms = gyms.filter(gym => {
        if (!gym.facilities) return false
        return filters.facilities!.every(facility =>
          gym.facilities && gym.facilities[facility] === true
        )
      })
    }

    return gyms
  } catch (error) {
    logger.error('Error in getGyms:', error)
    return []
  }
}

// Helper function to calculate distance
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export async function getGymById(id: string): Promise<Gym | null> {
  try {
    const { data, error } = await supabase
      .from('gyms')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      logger.error('Error fetching gym by ID:', error)
      return null
    }

    return data
  } catch (error) {
    logger.error('Error in getGymById:', error)
    return null
  }
}

// Equipment functions
export async function getGymMachines(gymId: string): Promise<GymMachine[]> {
  try {
    const { data, error } = await supabase
      .from('gym_machines')
      .select('*')
      .eq('gym_id', gymId)
      .order('name')

    if (error) {
      logger.error('Error fetching gym machines:', error)
      return []
    }

    return data || []
  } catch (error) {
    logger.error('Error in getGymMachines:', error)
    return []
  }
}

export async function getGymFreeWeights(gymId: string): Promise<GymFreeWeight[]> {
  try {
    const { data, error } = await supabase
      .from('gym_free_weights')
      .select('*')
      .eq('gym_id', gymId)
      .order('name')

    if (error) {
      logger.error('Error fetching gym free weights:', error)
      return []
    }

    return data || []
  } catch (error) {
    logger.error('Error in getGymFreeWeights:', error)
    return []
  }
}

// Review functions
export async function getGymReviews(gymId: string): Promise<GymReview[]> {
  try {
    const { data, error } = await supabase
      .from('gym_reviews')
      .select(`
        *,
        user:users(id, display_name, username, avatar_url)
      `)
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    logger.error('Error fetching gym reviews:', error)
    return []
  }
}

export async function getGymReviewCount(gymId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('gym_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('gym_id', gymId)

    if (error) throw error
    return count || 0
  } catch (error) {
    logger.error('Error getting gym review count:', error)
    return 0
  }
}

export async function createGymReview(review: {
  gym_id: string
  user_id: string
  rating: number
  content: string
}): Promise<GymReview | null> {
  try {
    const { data, error } = await supabase
      .from('gym_reviews')
      .insert(review)
      .select(`
        *,
        user:users(id, display_name, username, avatar_url)
      `)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    logger.error('Error creating gym review:', error)
    return null
  }
}

export async function addGymReviewReply(reviewId: string, content: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase
      .from('gym_review_replies')
      .insert({ review_id: reviewId, user_id: user.id, content })

    return !error
  } catch (error) {
    logger.error('Error adding review reply:', error)
    return false
  }
}

export async function getGymReviewReplies(reviewIds: string[]): Promise<Record<string, any[]>> {
  try {
    const { data, error } = await supabase
      .from('gym_review_replies')
      .select(`
        *,
        user:users(display_name, avatar_url)
      `)
      .in('review_id', reviewIds)
      .order('created_at')

    if (error) throw error

    const grouped = (data || []).reduce((acc, reply) => {
      if (!acc[reply.review_id]) acc[reply.review_id] = []
      acc[reply.review_id].push(reply)
      return acc
    }, {} as Record<string, any[]>)

    return grouped
  } catch (error) {
    logger.error('Error fetching review replies:', error)
    return {}
  }
}

// Favorites functions
export async function addFavoriteGym(gymId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase
      .from('favorite_gyms')
      .insert({ user_id: user.id, gym_id: gymId })

    if (error && error.code !== '23505') { // Ignore duplicate key errors
      throw error
    }

    return true
  } catch (error) {
    logger.error('Error adding favorite gym:', error)
    return false
  }
}

export async function removeFavoriteGym(gymId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase
      .from('favorite_gyms')
      .delete()
      .eq('user_id', user.id)
      .eq('gym_id', gymId)

    return !error
  } catch (error) {
    logger.error('Error removing favorite gym:', error)
    return false
  }
}

export async function getUserFavoriteGyms(): Promise<Gym[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('favorite_gyms')
      .select(`
        gym:gyms(*)
      `)
      .eq('user_id', user.id)

    if (error) throw error
    return data?.map(item => item.gym).filter(Boolean) || []
  } catch (error) {
    logger.error('Error fetching user favorite gyms:', error)
    return []
  }
}

// Checkin function
export async function checkOutFromGym(checkinId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('gym_checkins')
      .update({ checked_out_at: new Date().toISOString() })
      .eq('id', checkinId)

    return !error
  } catch (error) {
    logger.error('Error checking out from gym:', error)
    return false
  }
}