import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ジムの型定義
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
  business_hours?: any
  facilities?: any
  equipment_types?: string[]
  machine_brands?: string[]
  rating?: number
  review_count?: number
  verified?: boolean
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

// ジム一覧を取得
export async function getGyms(filters?: {
  prefecture?: string
  city?: string
  search?: string
}) {
  try {
    let query = supabase
      .from('gyms')
      .select('*')
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

    const { data, error } = await query

    if (data && !error) {
      return data as Gym[]
    }
  } catch (error) {
    console.log('gyms table not found, using mock data')
  }
  
  // Return mock gym data
  return [
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
  ].filter((gym) => {
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
  }) as Gym[]
}

// ジム詳細を取得
export async function getGymById(id: string) {
  try {
    const { data, error } = await supabase
      .from('gyms')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Gym
  } catch (error) {
    console.error('Error fetching gym:', error)
    return null
  }
}

// ジムのマシン一覧を取得
export async function getGymMachines(gymId: string) {
  try {
    const { data, error } = await supabase
      .from('gym_machines')
      .select(`
        *,
        machine:machines(*)
      `)
      .eq('gym_id', gymId)
      .order('machine(target_category)')

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching gym machines:', error)
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
    console.error('Error fetching gym reviews:', error)
    return []
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
    console.error('Error creating review:', error)
    throw error
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
    console.error('Error adding favorite gym:', error)
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
    console.error('Error removing favorite gym:', error)
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
    console.error('Error fetching favorite gyms:', error)
    return []
  }
}

// ジムにチェックイン
export async function checkInToGym(gymId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('gym_checkins')
      .insert({
        user_id: user.id,
        gym_id: gymId
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error checking in:', error)
    throw error
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
    console.error('Error checking out:', error)
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
    console.error('Error fetching current checkin:', error)
    return null
  }
}