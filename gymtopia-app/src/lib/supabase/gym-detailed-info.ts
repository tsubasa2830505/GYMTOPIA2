import { supabase } from './client'

// 型定義
export interface PricingSystem {
  membership_plans?: Array<{
    name: string
    price: number
    duration: string
    description: string
    features: string[]
  }>
  day_passes?: {
    price: number
    description: string
  }
  personal_training?: {
    available: boolean
    price_range: string
    description: string
  }
  additional_fees?: Array<{
    name: string
    price: number
    description: string
  }>
  payment_methods?: string[]
  cancellation_policy?: string
}

export interface OperatingHours {
  regular_hours?: {
    monday?: { open: string; close: string; closed: boolean }
    tuesday?: { open: string; close: string; closed: boolean }
    wednesday?: { open: string; close: string; closed: boolean }
    thursday?: { open: string; close: string; closed: boolean }
    friday?: { open: string; close: string; closed: boolean }
    saturday?: { open: string; close: string; closed: boolean }
    sunday?: { open: string; close: string; closed: boolean }
  }
  holiday_hours?: string
  special_hours?: Array<{
    date: string
    hours: string
    description: string
  }>
  staff_hours?: string
  note?: string
}

export interface RulesAndPolicies {
  general_rules?: string[]
  dress_code?: {
    required: string[]
    prohibited: string[]
    notes: string
  }
  equipment_rules?: string[]
  safety_guidelines?: string[]
  behavior_policy?: string
  guest_policy?: string
  age_restrictions?: string
  other_policies?: string[]
}

export interface BeginnerSupport {
  orientation_available?: boolean
  orientation_details?: string
  free_consultation?: boolean
  personal_training?: {
    available: boolean
    trial_session: boolean
    pricing: string
  }
  group_classes?: {
    beginner_friendly: boolean
    classes: string[]
  }
  equipment_introduction?: boolean
  staff_support?: string
  resources?: string[]
  trial_membership?: {
    available: boolean
    duration: string
    price: string
  }
}

export interface AccessInformation {
  address_details?: string
  nearest_station?: string
  walking_time?: string
  bus_access?: string
  car_access?: string
  parking?: {
    available: boolean
    capacity: number
    pricing: string
    time_limit: string
    notes: string
  }
  bicycle_parking?: {
    available: boolean
    notes: string
  }
  accessibility?: {
    wheelchair_accessible: boolean
    elevator: boolean
    notes: string
  }
}

export interface OtherInformation {
  special_programs?: string[]
  events?: string[]
  announcements?: string[]
  contact_info?: {
    inquiry_email: string
    inquiry_phone: string
    response_time: string
  }
  social_media?: {
    website: string
    instagram: string
    facebook: string
    twitter: string
  }
  amenities?: string[]
  unique_features?: string[]
  additional_notes?: string
}

export interface GymDetailedInfo {
  id: string
  gym_id: string
  pricing_system: PricingSystem
  operating_hours: OperatingHours
  rules_and_policies: RulesAndPolicies
  beginner_support: BeginnerSupport
  access_information: AccessInformation
  other_information: OtherInformation
  last_updated_by?: string
  content_status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
}

// ジム詳細情報を取得
export async function getGymDetailedInfo(gymId: string): Promise<GymDetailedInfo | null> {
  try {
    const { data, error } = await supabase
      .from('gym_detailed_info')
      .select('*')
      .eq('gym_id', gymId)
      .eq('content_status', 'published')
      .maybeSingle()

    if (error) {
      console.error('Error fetching gym detailed info:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getGymDetailedInfo:', error)
    return null
  }
}

// ジム詳細情報を作成または更新（オーナー用）
export async function upsertGymDetailedInfo(
  gymId: string,
  detailedInfo: Partial<Omit<GymDetailedInfo, 'id' | 'gym_id' | 'created_at' | 'updated_at'>>,
  userId: string
): Promise<GymDetailedInfo | null> {
  try {
    // ジムオーナー権限をチェック
    const { data: ownerData, error: ownerError } = await supabase
      .from('gym_owners')
      .select('id, permissions')
      .eq('gym_id', gymId)
      .eq('user_id', userId)
      .maybeSingle()

    if (ownerError || !ownerData) {
      console.error('User is not authorized to edit this gym:', { gymId, userId })
      return null
    }

    // 権限チェック
    const permissions = ownerData.permissions as any
    if (!permissions?.canEditBasicInfo) {
      console.error('User does not have permission to edit basic info:', { gymId, userId })
      return null
    }

    const updateData = {
      gym_id: gymId,
      ...detailedInfo,
      last_updated_by: userId,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('gym_detailed_info')
      .upsert(updateData, {
        onConflict: 'gym_id'
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error upserting gym detailed info:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in upsertGymDetailedInfo:', error)
    return null
  }
}

// 特定セクションのみを更新
export async function updateGymDetailedInfoSection(
  gymId: string,
  section: 'pricing_system' | 'operating_hours' | 'rules_and_policies' | 'beginner_support' | 'access_information' | 'other_information',
  sectionData: any,
  userId: string
): Promise<boolean> {
  try {
    // ジムオーナー権限をチェック
    const { data: ownerData, error: ownerError } = await supabase
      .from('gym_owners')
      .select('id, permissions')
      .eq('gym_id', gymId)
      .eq('user_id', userId)
      .maybeSingle()

    if (ownerError || !ownerData) {
      console.error('User is not authorized to edit this gym:', { gymId, userId })
      return false
    }

    const permissions = ownerData.permissions as any
    if (!permissions?.canEditBasicInfo) {
      console.error('User does not have permission to edit basic info:', { gymId, userId })
      return false
    }

    const updateData = {
      [section]: sectionData,
      last_updated_by: userId,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('gym_detailed_info')
      .upsert(
        { gym_id: gymId, ...updateData },
        { onConflict: 'gym_id' }
      )

    if (error) {
      console.error(`Error updating gym detailed info section ${section}:`, error)
      return false
    }

    return true
  } catch (error) {
    console.error(`Error in updateGymDetailedInfoSection (${section}):`, error)
    return false
  }
}

// コンテンツステータスを更新
export async function updateGymDetailedInfoStatus(
  gymId: string,
  status: 'draft' | 'published' | 'archived',
  userId: string
): Promise<boolean> {
  try {
    // ジムオーナー権限をチェック
    const { data: ownerData, error: ownerError } = await supabase
      .from('gym_owners')
      .select('id, permissions')
      .eq('gym_id', gymId)
      .eq('user_id', userId)
      .maybeSingle()

    if (ownerError || !ownerData) {
      console.error('User is not authorized to edit this gym:', { gymId, userId })
      return false
    }

    const { error } = await supabase
      .from('gym_detailed_info')
      .upsert(
        {
          gym_id: gymId,
          content_status: status,
          last_updated_by: userId,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'gym_id' }
      )

    if (error) {
      console.error('Error updating gym detailed info status:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in updateGymDetailedInfoStatus:', error)
    return false
  }
}

// ジムオーナーが管理しているジムの詳細情報を取得（下書き含む）
export async function getGymDetailedInfoForOwner(gymId: string, userId: string): Promise<GymDetailedInfo | null> {
  try {
    // ジムオーナー権限をチェック
    const { data: ownerData, error: ownerError } = await supabase
      .from('gym_owners')
      .select('id')
      .eq('gym_id', gymId)
      .eq('user_id', userId)
      .maybeSingle()

    if (ownerError || !ownerData) {
      console.error('User is not authorized to view this gym detailed info:', { gymId, userId })
      return null
    }

    const { data, error } = await supabase
      .from('gym_detailed_info')
      .select('*')
      .eq('gym_id', gymId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching gym detailed info for owner:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getGymDetailedInfoForOwner:', error)
    return null
  }
}

// 初期データを作成（空のデータ構造で）
export async function createInitialGymDetailedInfo(gymId: string, userId: string): Promise<GymDetailedInfo | null> {
  try {
    const initialData: Partial<GymDetailedInfo> = {
      gym_id: gymId,
      pricing_system: {},
      operating_hours: {},
      rules_and_policies: {},
      beginner_support: {},
      access_information: {},
      other_information: {},
      content_status: 'draft',
      last_updated_by: userId
    }

    const { data, error } = await supabase
      .from('gym_detailed_info')
      .insert(initialData)
      .select('*')
      .single()

    if (error) {
      console.error('Error creating initial gym detailed info:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in createInitialGymDetailedInfo:', error)
    return null
  }
}