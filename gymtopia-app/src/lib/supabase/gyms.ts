import { supabase } from './client'
import { logger } from '../utils/logger'


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
  condition?: string
  created_at?: string
  updated_at?: string
  updated_by?: string
}

export interface GymReview {
  id: string
  gym_id: string
  user_id: string
  rating: number
  title?: string
  content?: string
  equipment_rating?: number
  cleanliness_rating?: number
  staff_rating?: number
  accessibility_rating?: number
  created_at: string
  user?: {
    display_name: string
    username: string
    avatar_url?: string
  }
}

// いいね（イキタイ）の件数を取得（compat view: gym_likes -> favorite_gyms）
export async function getGymLikesCount(gymId: string) {
  try {
    const { count, error } = await supabase
      .from('gym_likes')
      .select('*', { count: 'exact', head: true })
      .eq('gym_id', gymId)

    if (error) throw error
    return count || 0
  } catch (error) {
    logger.error('Error fetching gym likes count:', error)
    return 0
  }
}

export async function getGymReviewStats(gymId: string): Promise<{ average: number; count: number }> {
  try {
    const { data: avgData } = await supabase
      .from('gym_reviews')
      .select('avg:avg(rating)')
      .eq('gym_id', gymId)
      .single()

    const { count } = await supabase
      .from('gym_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('gym_id', gymId)

    const avg = (avgData as any)?.avg ? Number((avgData as any).avg) : 0
    return { average: isNaN(avg) ? 0 : Math.round(avg * 10) / 10, count: count || 0 }
  } catch (error) {
    logger.error('Error fetching review stats:', error)
    return { average: 0, count: 0 }
  }
}

export async function getGymEquipmentStats(gymId: string): Promise<{ types: number; totalUnits: number }> {
  try {
    const { count: types } = await supabase
      .from('gym_machines')
      .select('machine_id', { count: 'exact', head: true })
      .eq('gym_id', gymId)

    const { data: sumData } = await supabase
      .from('gym_machines')
      .select('sum:sum(quantity)')
      .eq('gym_id', gymId)
      .single()

    const totalUnits = (sumData as any)?.sum ? Number((sumData as any).sum) : 0
    return { types: types || 0, totalUnits: isNaN(totalUnits) ? 0 : totalUnits }
  } catch (error) {
    logger.error('Error fetching equipment stats:', error)
    return { types: 0, totalUnits: 0 }
  }
}

// ジム一覧を取得
export async function getGyms(filters?: {
  prefecture?: string
  city?: string
  search?: string
  facilities?: FacilityKey[]
  // Accept flexible shapes from UI: either string[] of names/ids or { name, count }[]
  machines?: Array<string | { name: string; count?: number }>
  freeWeights?: Array<string | { name: string; count?: number }>
  machineTypes?: Array<string | { name: string; count?: number }>
  makers?: string[]
  categories?: string[] // target_category values
}) {
  try {
    const baseSelect = 'id, name, prefecture, city, address, latitude, longitude, images, facilities, rating, review_count, verified, description, equipment_types'
    // Include related counts for UI if needed
    let query = supabase
      .from('gyms')
      .select(baseSelect)
      .eq('status', 'active')
      .order('rating', { ascending: false })

    if (filters?.prefecture) {
      query = query.eq('prefecture', filters.prefecture)
    }
    if (filters?.city) {
      query = query.eq('city', filters.city)
    }
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }
    if (filters?.facilities && filters.facilities.length > 0) {
      // Filter gyms whose facilities JSONB contains all requested flags set to true
      const containsObj = filters.facilities.reduce((acc, key) => {
        acc[key] = true
        return acc
      }, {} as Partial<GymFacilities>)
      query = query.contains('facilities', containsObj)
    }

    // Machine-based filters
    if (filters?.machines?.length) {
      // UIから string(id|name|"id:count") or {name,count} が来るケースに対応
      const tokens = (filters.machines as any[])
        .map(m => (typeof m === 'string' ? m : m?.name))
        .filter((v: any) => typeof v === 'string' && v.trim().length > 0) as string[]
      if (tokens.length > 0) {
        // id:count → id に分解
        const ids: string[] = []
        const names: string[] = []
        tokens.forEach(t => {
          const [a, b] = t.split(':')
          if (a && b && /^\d+$/.test(b) === true) {
            ids.push(a)
          } else {
            // 不明なら両方に候補として入れる（ID一致 or name一致）
            ids.push(t)
            names.push(t)
          }
        })

        const gymIdSet = new Set<string>()
        const addIds = (rows?: any[] | null) => {
          if (rows) rows.forEach(r => r?.gym_id && gymIdSet.add(r.gym_id))
        }
        const promises: Promise<any>[] = []
        if (ids.length) promises.push(supabase.from('gym_machines').select('gym_id').in('machine_id', ids).then(r => r))
        if (names.length) promises.push(supabase.from('gym_machines').select('gym_id').in('name', names).then(r => r))
        const results = await Promise.allSettled(promises)
        results.forEach(r => {
          if (r.status === 'fulfilled') addIds((r.value as any).data)
        })
        const uniqueGymIds = [...gymIdSet]
        if (uniqueGymIds.length > 0) {
          query = query.in('id', uniqueGymIds)
        } else {
          return []
        }
      }
    }

    // Free weight-based filters (accept either freeWeights or machineTypes for backward-compat)
    const fwList = (filters?.freeWeights || filters?.machineTypes) as any[] | undefined
    if (fwList && fwList.length) {
      const fwNames = fwList
        .map((w: any) => (typeof w === 'string' ? w : w?.name))
        .filter((v: any) => typeof v === 'string' && v.trim().length > 0)
      if (fwNames.length > 0) {
        const { data: fwGymIds, error: fwErr } = await supabase
          .from('gym_free_weights')
          .select('gym_id')
          .in('name', fwNames)
        if (!fwErr && fwGymIds && fwGymIds.length > 0) {
          const uniqueGymIds = [...new Set(fwGymIds.map(g => g.gym_id))]
          query = query.in('id', uniqueGymIds)
        } else {
          return []
        }
      }
    }

    const { data, error } = await query

    if (data && !error) {
      return data as Gym[]
    }
  } catch (error) {
    logger.log('gyms table not found, using mock data')
  }
  
  // Return mock gym data
  const mockGyms: Gym[] = [
    {
      id: 'gym-1',
      name: 'ハンマーストレングス渋谷',
      name_kana: 'はんまーすとれんぐすしぶや',
      description: 'プロフェッショナル向けの本格的なトレーニング施設。最新のHammer Strengthマシンを完備。',
      latitude: 35.6598,
      longitude: 139.7006,
      address: '東京都渋谷区道玄坂1-10-8',
      prefecture: '東京都',
      city: '渋谷区',
      business_hours: {
        weekdays: '06:00-23:00',
        weekends: '08:00-21:00'
      },
      facilities: ['24時間営業', 'シャワー', 'ロッカー', 'パーキング'],
      equipment_types: ['フリーウェイト', 'マシン', 'カーディオ'],
      machine_brands: ['Hammer Strength', 'Life Fitness'],
      rating: 4.8,
      review_count: 156,
      verified: true
    },
    {
      id: 'gym-2',
      name: 'ROGUEクロストレーニング新宿',
      name_kana: 'ろーぐくろすとれーにんぐしんじゅく',
      description: 'クロスフィット専門の最新設備を完備したトレーニングジム。',
      latitude: 35.6895,
      longitude: 139.6917,
      address: '東京都新宿区西新宿2-8-1',
      prefecture: '東京都',
      city: '新宿区',
      business_hours: {
        weekdays: '05:00-24:00',
        weekends: '07:00-22:00'
      },
      facilities: ['24時間営業', 'シャワー', 'ロッカー', 'サウナ'],
      equipment_types: ['クロストレーニング', 'フリーウェイト', 'ファンクショナル'],
      machine_brands: ['ROGUE', 'Concept2'],
      rating: 4.6,
      review_count: 89,
      verified: true
    },
    {
      id: 'gym-3',
      name: 'プレミアムフィットネス銀座',
      name_kana: 'ぷれみあむふぃっとねすぎんざ',
      description: '高級感あふれる都心のプレミアムジム。パーソナルトレーニングも充実。',
      latitude: 35.6762,
      longitude: 139.7653,
      address: '東京都中央区銀座4-6-16',
      prefecture: '東京都',
      city: '中央区',
      business_hours: {
        weekdays: '06:30-22:30',
        weekends: '08:00-20:00'
      },
      facilities: ['プール', 'スパ', 'サウナ', 'ロッカー', 'パーキング'],
      equipment_types: ['フリーウェイト', 'マシン', 'カーディオ', 'プール'],
      machine_brands: ['Technogym', 'Matrix'],
      rating: 4.9,
      review_count: 203,
      verified: true
    },
    {
      id: 'gym-4',
      name: 'スーパーパワージム池袋',
      name_kana: 'すーぱーぱわーじむいけぶくろ',
      description: 'パワーリフティング専門ジム。重量挙げに特化した設備とコミュニティ。',
      latitude: 35.7295,
      longitude: 139.7109,
      address: '東京都豊島区南池袋1-28-1',
      prefecture: '東京都',
      city: '豊島区',
      business_hours: {
        weekdays: '24時間',
        weekends: '24時間'
      },
      facilities: ['24時間営業', 'シャワー', 'ロッカー'],
      equipment_types: ['パワーリフティング', 'フリーウェイト', 'ストロングマン'],
      machine_brands: ['Eleiko', 'Rogue'],
      rating: 4.7,
      review_count: 127,
      verified: true
    }
  ]

  return mockGyms.filter((gym) => {
    // Apply filters to mock data
    if (filters?.search && !gym.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters?.prefecture && gym.prefecture !== filters.prefecture) {
      return false
    }
    if (filters?.city && gym.city !== filters.city) {
      return false
    }
    return true
  })
}

// ジム詳細を取得
export async function getGymById(id: string) {
  try {
    // UUID形式のチェック
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      logger.warn('Invalid UUID format for gym id:', id)
      return null
    }

    const { data, error } = await supabase
      .from('gyms')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      logger.error('Error fetching gym:', error.message || error)
      return null
    }

    if (!data) {
      logger.error('Gym not found with id:', id)
      return null
    }

    return data as Gym
  } catch (error) {
    logger.error('Error fetching gym:', error instanceof Error ? error.message : error)
    return null
  }
}

// ジムのマシン一覧を取得
export async function getGymMachines(gymId: string): Promise<GymMachine[]> {
  try {
    const { data, error } = await supabase
      .from('gym_machines')
      .select('*')
      .eq('gym_id', gymId)

    if (error) throw error

    const rows = (data || []).map((row: any) => ({
      id: row.id,
      gym_id: row.gym_id,
      name: row.name,
      brand: row.brand || undefined,
      count: row.count || 1,
      condition: row.condition || undefined,
    }))
    return rows
  } catch (error) {
    logger.error('Error fetching gym machines:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      gymId
    })
    return []
  }
}

// ジムのフリーウェイト一覧を取得
export async function getGymFreeWeights(gymId: string): Promise<GymFreeWeight[]> {
  try {
    const { data, error } = await supabase
      .from('gym_free_weights')
      .select('*')
      .eq('gym_id', gymId)

    if (error) throw error

    const rows = (data || []).map((row: any) => ({
      id: row.id,
      gym_id: row.gym_id,
      name: row.name,
      brand: row.brand || undefined,
      count: row.count || 1,
      weight_range: row.weight_range || undefined,
      condition: row.condition || undefined,
    }))
    return rows
  } catch (error) {
    logger.error('Error fetching gym free weights:', error)
    return []
  }
}

// ジムのレビューを取得
export async function getGymReviews(gymId: string) {
  try {
    const { data, error } = await supabase
      .from('gym_reviews')
      .select(`
        *,
        user:users(display_name, username, avatar_url)
      `)
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as GymReview[]
  } catch (error) {
    logger.error('Error fetching gym reviews:', error)
    return []
  }
}

// ジムのレビュー数を取得
export async function getGymReviewCount(gymId: string) {
  try {
    const { count, error } = await supabase
      .from('gym_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('gym_id', gymId)

    if (error) throw error
    return count || 0
  } catch (error) {
    logger.error('Error fetching review count:', error)
    return 0
  }
}

// レビューを投稿
export async function createGymReview(review: {
  gym_id: string
  rating: number
  title?: string
  content?: string
  equipment_rating?: number
  cleanliness_rating?: number
  staff_rating?: number
  accessibility_rating?: number
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('gym_reviews')
      .insert({
        ...review,
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    logger.error('Error creating review:', error)
    throw error
  }
}

// ===============================
// Review replies
// ===============================

export async function addGymReviewReply(reviewId: string, content: string) {
  try {
    const { data, error } = await supabase
      .from('gym_review_replies')
      .insert({ review_id: reviewId, content })
      .select()
      .single()
    if (error) throw error
    return data
  } catch (error) {
    logger.error('Error adding review reply:', error)
    return null
  }
}

export async function getGymReviewReplies(reviewIds: string[]) {
  try {
    if (!reviewIds.length) return []
    const { data, error } = await supabase
      .from('gym_review_replies')
      .select('*')
      .in('review_id', reviewIds)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (error) {
    logger.error('Error fetching review replies:', error)
    return []
  }
}

// お気に入りジムを追加
export async function addFavoriteGym(gymId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('favorite_gyms')
      .insert({
        user_id: user.id,
        gym_id: gymId
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    logger.error('Error adding favorite gym:', error)
    throw error
  }
}

// お気に入りジムを削除
export async function removeFavoriteGym(gymId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('favorite_gyms')
      .delete()
      .eq('user_id', user.id)
      .eq('gym_id', gymId)

    if (error) throw error
    return true
  } catch (error) {
    logger.error('Error removing favorite gym:', error)
    throw error
  }
}

// ユーザーのお気に入りジムを取得
export async function getUserFavoriteGyms() {
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
    return data?.map(item => item.gym) || []
  } catch (error) {
    logger.error('Error fetching favorite gyms:', error)
    return []
  }
}

// チェックアウト
export async function checkOutFromGym(checkinId: string) {
  try {
    const { data, error } = await supabase
      .from('gym_checkins')
      .update({
        checked_out_at: new Date().toISOString()
      })
      .eq('id', checkinId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    logger.error('Error checking out:', error)
    throw error
  }
}

// 現在チェックイン中のジムを取得
export async function getCurrentCheckin() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('gym_checkins')
      .select(`
        *,
        gym:gyms(*)
      `)
      .eq('user_id', user.id)
      .is('checked_out_at', null)
      .order('checked_in_at', { ascending: false })
      .limit(1)
      .single()

    if (error) return null
    return data
  } catch (error) {
    logger.error('Error fetching current checkin:', error)
    return null
  }
}
