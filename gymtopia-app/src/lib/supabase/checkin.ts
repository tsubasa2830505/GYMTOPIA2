/**
 * GPS チェックイン機能のSupabaseクライアント関数
 */

import { getSupabaseClient } from './client'
import {
  calculateDistance,
  verifyDistanceToGym,
  getDeviceInfo,
  detectLocationSpoofing,
  type Coordinates,
  type DistanceVerificationResult
} from '../gps-verification'
import { createCheckinPost } from './posts'
import { logger } from '../utils/logger'

export interface GymCheckInData {
  gym_id: string
  user_latitude: number
  user_longitude: number
  distance_to_gym: number
  location_verified: boolean
  device_info: any
  crowd_level?: 'empty' | 'normal' | 'crowded'
  photo_url?: string
}

export interface CheckInResult {
  success: boolean
  checkin_id?: string
  verification: DistanceVerificationResult
  badges_earned?: BadgeEarned[]
  error?: string
}

export interface BadgeEarned {
  badge_type: string
  badge_name: string
  badge_description: string
  badge_icon: string
  rarity: 'common' | 'rare' | 'legendary' | 'mythical'
}

/**
 * GPS認証付きチェックイン実行
 */
export async function performGPSCheckin(
  userId: string,
  gymId: string,
  userLocation: Coordinates,
  options: {
    crowdLevel?: 'empty' | 'normal' | 'crowded'
    photoUrl?: string
    note?: string
    autoPost?: {
      shareLevel: 'badge_only' | 'gym_name' | 'gym_with_area' | 'none'
      delayMinutes: number
      audience: 'public' | 'friends' | 'private'
    }
  } = {}
): Promise<CheckInResult> {
  const supabase = getSupabaseClient()

  try {
    // 1. ジムの位置情報を取得
    const { data: gym, error: gymError } = await supabase
      .from('gyms')
      .select('id, name, latitude, longitude, address')
      .eq('id', gymId)
      .single()

    if (gymError || !gym) {
      return { success: false, error: 'Gym not found', verification: {} as any }
    }

    if (!gym.latitude || !gym.longitude) {
      return { success: false, error: 'Gym location not available', verification: {} as any }
    }

    // 2. 距離認証
    const gymLocation: Coordinates = {
      latitude: gym.latitude,
      longitude: gym.longitude
    }

    const verification = verifyDistanceToGym(userLocation, gymLocation)

    // 3. 位置偽装チェック（強化版）
    const spoofCheck = detectLocationSpoofing(userLocation)
    if (spoofCheck.suspicious) {
      logger.warn('Suspicious location detected:', spoofCheck.reasons, 'Risk level:', spoofCheck.riskLevel)

      // 高リスクの場合はチェックインを拒否
      if (spoofCheck.riskLevel === 'high') {
        return {
          success: false,
          error: 'Location verification failed: High risk of spoofing detected',
          verification: { riskLevel: spoofCheck.riskLevel, reasons: spoofCheck.reasons } as any
        }
      }
    }

    // 4. デバイス情報取得
    const deviceInfo = getDeviceInfo()

    // 5. チェックインデータ準備
    const checkinData: GymCheckInData = {
      gym_id: gymId,
      user_latitude: userLocation.latitude,
      user_longitude: userLocation.longitude,
      distance_to_gym: verification.distance,
      location_verified: verification.isValid,
      device_info: deviceInfo,
      crowd_level: options.crowdLevel,
      photo_url: options.photoUrl
    }

    // 6. チェックイン実行
    const { data: checkin, error: checkinError } = await supabase
      .from('gym_checkins')
      .insert({
        user_id: userId,
        ...checkinData
      })
      .select('id')
      .single()

    if (checkinError || !checkin) {
      logger.error('Checkin error:', checkinError)
      return {
        success: false,
        error: `Failed to save check-in: ${checkinError?.message || 'Unknown error'}`,
        verification
      }
    }

    // 7. 認証ログを保存
    await supabase.from('checkin_verifications').insert({
      checkin_id: checkin.id,
      verification_type: 'gps_distance',
      verification_status: verification.isValid ? 'approved' : 'rejected',
      verification_data: {
        distance: verification.distance,
        accuracy: verification.accuracy,
        confidence_level: verification.confidenceLevel,
        spoofing_check: spoofCheck,
        device_info: deviceInfo
      }
    })

    // 8. バッジ獲得チェック
    const badgesEarned = await checkAndAwardBadges(userId, gymId, checkin.id, gym)

    // 9. GPS認証情報を保存（投稿は作成しない）
    logger.log('GPS check-in completed with verification data saved')

    return {
      success: true,
      checkin_id: checkin.id,
      verification,
      badges_earned: badgesEarned
    }

  } catch (error) {
    logger.error('GPS check-in error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      verification: {} as any
    }
  }
}

/**
 * バッジ獲得判定と付与
 */
async function checkAndAwardBadges(
  userId: string,
  gymId: string,
  checkinId: string,
  gym: any
): Promise<BadgeEarned[]> {
  const supabase = getSupabaseClient()
  const badgesEarned: BadgeEarned[] = []

  try {
    // ユーザーの総チェックイン数を取得
    const { data: checkinStats } = await supabase
      .from('gym_checkins')
      .select('id, gym_id')
      .eq('user_id', userId)

    const totalCheckins = checkinStats?.length || 0
    const uniqueGyms = new Set(checkinStats?.map(c => c.gym_id)).size

    // ジムの希少度を取得
    const { data: gymRarity } = await supabase
      .from('gym_rarities')
      .select('*')
      .eq('gym_id', gymId)
      .single()

    const badges: Partial<BadgeEarned>[] = []

    // 初回チェックインバッジ
    if (totalCheckins === 1) {
      badges.push({
        badge_type: 'first_checkin',
        badge_name: 'First Step',
        badge_description: '初回チェックインを完了しました',
        badge_icon: '🎯'
      })
    }

    // チェックイン回数マイルストーン
    const milestones = [10, 25, 50, 100, 250, 500, 1000]
    if (milestones.includes(totalCheckins)) {
      badges.push({
        badge_type: 'checkin_milestone',
        badge_name: `${totalCheckins} Check-ins`,
        badge_description: `${totalCheckins}回のチェックインを達成しました`,
        badge_icon: totalCheckins >= 100 ? '🏆' : totalCheckins >= 50 ? '🥇' : '⭐'
      })
    }

    // ジムエクスプローラーバッジ
    const explorerMilestones = [5, 10, 25, 50, 100]
    if (explorerMilestones.includes(uniqueGyms)) {
      badges.push({
        badge_type: 'gym_explorer',
        badge_name: `Explorer Level ${uniqueGyms}`,
        badge_description: `${uniqueGyms}箇所のジムを開拓しました`,
        badge_icon: uniqueGyms >= 50 ? '🗺️' : uniqueGyms >= 25 ? '🧭' : '🔍'
      })
    }

    // レアジムバッジ
    if (gymRarity) {
      if (gymRarity.rarity_level === 'legendary') {
        badges.push({
          badge_type: 'legendary_gym',
          badge_name: 'Legend Visitor',
          badge_description: `伝説のジム「${gym.name}」を訪問しました`,
          badge_icon: '👑',
          rarity: 'legendary'
        })
      } else if (gymRarity.rarity_level === 'mythical') {
        badges.push({
          badge_type: 'mythical_gym',
          badge_name: 'Myth Hunter',
          badge_description: `神話級ジム「${gym.name}」を制覇しました`,
          badge_icon: '💎',
          rarity: 'mythical'
        })
      }
    }

    // バッジをデータベースに保存（UPSERT使用で重複防止）
    for (const badge of badges) {
      try {
        // UPSERT操作で原子的に重複防止
        const { data: upsertedBadge, error: upsertError } = await supabase
          .from('checkin_badges')
          .upsert({
            user_id: userId,
            gym_id: badge.badge_type?.includes('gym') ? gymId : null,
            badge_type: badge.badge_type!,
            badge_name: badge.badge_name!,
            badge_description: badge.badge_description!,
            badge_icon: badge.badge_icon!,
            metadata: {
              checkin_id: checkinId,
              gym_name: gym.name,
              total_checkins: totalCheckins,
              unique_gyms: uniqueGyms,
              last_earned: new Date().toISOString()
            },
            earned_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,badge_type,gym_id',
            ignoreDuplicates: true
          })
          .select('*')
          .single()

        // 新しいバッジが作成された場合のみ配列に追加
        if (upsertedBadge && !upsertError) {
          // earned_atが最近の場合のみ「新規獲得」として扱う
          const earnedTime = new Date(upsertedBadge.earned_at).getTime()
          const now = Date.now()

          if (now - earnedTime < 5000) { // 5秒以内に作成された場合
            badgesEarned.push({
              ...badge,
              rarity: badge.rarity || 'common'
            } as BadgeEarned)
          }
        }
      } catch (error) {
        logger.error(`Badge upsert error for ${badge.badge_type}:`, error)
        // エラーが発生してもバッジ処理は継続
      }
    }

    return badgesEarned

  } catch (error) {
    logger.error('Badge check error:', error)
    return badgesEarned
  }
}

/**
 * ユーザーのチェックイン履歴を取得
 */
export async function getUserCheckinHistory(
  userId: string,
  limit: number = 20
) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('gym_checkins')
    .select(`
      id,
      checked_in_at,
      distance_to_gym,
      location_verified,
      crowd_level,
      photo_url,
      gyms (
        id,
        name,
        address,
        latitude,
        longitude
      ),
      gym_rarities (
        rarity_level,
        rarity_tags
      )
    `)
    .eq('user_id', userId)
    .order('checked_in_at', { ascending: false })
    .limit(limit)

  return { data, error }
}

/**
 * ユーザーのバッジ一覧を取得
 */
export async function getUserBadges(userId: string) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('checkin_badges')
    .select('*')
    .eq('user_id', userId)
    .eq('is_public', true)
    .order('earned_at', { ascending: false })

  return { data, error }
}

/**
 * 近隣のジムを検索（GPS座標ベース）
 */
export async function findNearbyGyms(
  userLocation: Coordinates,
  radiusKm: number = 5,
  limit: number = 20
) {
  const supabase = getSupabaseClient()

  // PostgreSQLのST_DWithin関数を使用した地理的検索
  const { data, error } = await supabase
    .rpc('find_gyms_within_radius', {
      user_lat: userLocation.latitude,
      user_lng: userLocation.longitude,
      radius_km: radiusKm,
      max_results: limit
    })

  return { data, error }
}

/**
 * ユーザーの直近のチェックイン情報を取得（GPS認証投稿用）
 */
export async function getRecentCheckinForGym(
  userId: string,
  gymId: string,
  hoursAgo: number = 24
) {
  const supabase = getSupabaseClient()

  const timeThreshold = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('gym_checkins')
    .select(`
      id,
      location_verified,
      distance_to_gym,
      checked_in_at,
      verification_status:checkin_verifications(verification_status)
    `)
    .eq('user_id', userId)
    .eq('gym_id', gymId)
    .eq('location_verified', true)
    .gte('checked_in_at', timeThreshold)
    .order('checked_in_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return { data, error }
}