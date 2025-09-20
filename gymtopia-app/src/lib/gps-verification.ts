/**
 * GPS位置情報認証システム
 * ジムステータス証明のためのGPS座標認証機能
 */

export interface Coordinates {
  latitude: number
  longitude: number
  accuracy?: number
  timestamp?: number
}

export interface DistanceVerificationResult {
  isValid: boolean
  distance: number
  maxAllowedDistance: number
  accuracy: number
  confidenceLevel: 'high' | 'medium' | 'low'
}

export interface LocationVerificationOptions {
  maxDistance: number // メートル単位
  requiredAccuracy: number // メートル単位
  timeoutMs: number
  enableHighAccuracy: boolean
}

// デフォルト設定
export const DEFAULT_VERIFICATION_OPTIONS: LocationVerificationOptions = {
  maxDistance: 100, // 100m以内
  requiredAccuracy: 50, // 50m以下の精度が必要
  timeoutMs: 10000, // 10秒
  enableHighAccuracy: true
}

/**
 * 2つの座標間の距離を計算（Haversine formula）
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371e3 // 地球の半径（メートル）
  const φ1 = coord1.latitude * Math.PI / 180
  const φ2 = coord2.latitude * Math.PI / 180
  const Δφ = (coord2.latitude - coord1.latitude) * Math.PI / 180
  const Δλ = (coord2.longitude - coord1.longitude) * Math.PI / 180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c // メートル単位
}

/**
 * 高精度GPS位置情報を取得
 */
export function getCurrentPosition(options: Partial<LocationVerificationOptions> = {}): Promise<Coordinates> {
  const config = { ...DEFAULT_VERIFICATION_OPTIONS, ...options }

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        }

        // 精度チェック
        if (coords.accuracy && coords.accuracy > config.requiredAccuracy) {
          reject(new Error(`GPS accuracy too low: ${coords.accuracy}m (required: ${config.requiredAccuracy}m)`))
          return
        }

        resolve(coords)
      },
      (error) => {
        let errorMessage = 'Unknown GPS error'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'GPS permission denied by user'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'GPS position unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'GPS timeout'
            break
        }
        reject(new Error(errorMessage))
      },
      {
        enableHighAccuracy: config.enableHighAccuracy,
        timeout: config.timeoutMs,
        maximumAge: 0 // キャッシュを使わない
      }
    )
  })
}

/**
 * 位置情報を複数回取得して平均化（精度向上）
 */
export async function getAccuratePosition(
  attempts: number = 3,
  options: Partial<LocationVerificationOptions> = {}
): Promise<Coordinates> {
  const positions: Coordinates[] = []

  for (let i = 0; i < attempts; i++) {
    try {
      const pos = await getCurrentPosition(options)
      positions.push(pos)

      // 少し間隔を空ける
      if (i < attempts - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.warn(`GPS attempt ${i + 1} failed:`, error)
      if (i === attempts - 1 && positions.length === 0) {
        throw error
      }
    }
  }

  if (positions.length === 0) {
    throw new Error('Could not get any GPS positions')
  }

  // 平均座標を計算
  const avgLat = positions.reduce((sum, pos) => sum + pos.latitude, 0) / positions.length
  const avgLng = positions.reduce((sum, pos) => sum + pos.longitude, 0) / positions.length
  const avgAccuracy = positions.reduce((sum, pos) => sum + (pos.accuracy || 0), 0) / positions.length

  return {
    latitude: avgLat,
    longitude: avgLng,
    accuracy: avgAccuracy,
    timestamp: Date.now()
  }
}

/**
 * ジムとの距離認証
 */
export function verifyDistanceToGym(
  userLocation: Coordinates,
  gymLocation: Coordinates,
  options: Partial<LocationVerificationOptions> = {}
): DistanceVerificationResult {
  const config = { ...DEFAULT_VERIFICATION_OPTIONS, ...options }
  const distance = calculateDistance(userLocation, gymLocation)
  const accuracy = userLocation.accuracy || 999

  // 信頼度レベルを計算
  let confidenceLevel: 'high' | 'medium' | 'low' = 'low'
  if (accuracy <= 10) confidenceLevel = 'high'
  else if (accuracy <= 30) confidenceLevel = 'medium'

  // 認証成功判定（精度が悪い場合は許容距離を拡大）
  const adjustedMaxDistance = config.maxDistance + Math.min(accuracy, 50)
  const isValid = distance <= adjustedMaxDistance

  return {
    isValid,
    distance,
    maxAllowedDistance: adjustedMaxDistance,
    accuracy,
    confidenceLevel
  }
}

/**
 * デバイス情報を取得（不正防止のため）
 */
export function getDeviceInfo(): Record<string, any> {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    hardwareConcurrency: navigator.hardwareConcurrency,
    maxTouchPoints: navigator.maxTouchPoints,
    vendor: navigator.vendor,
    timestamp: Date.now(),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth
  }
}

/**
 * 位置情報の偽装チェック（基本的な検出）
 */
export function detectLocationSpoofing(position: Coordinates): {
  suspicious: boolean
  reasons: string[]
} {
  const reasons: string[] = []

  // 精度が異常に高い（通常のGPSでは1-5m以下は困難）
  if (position.accuracy && position.accuracy < 1) {
    reasons.push('GPS accuracy too perfect')
  }

  // 座標が整数値すぎる（偽装ツールは小数点以下が少ない傾向）
  const latDecimals = (position.latitude.toString().split('.')[1] || '').length
  const lngDecimals = (position.longitude.toString().split('.')[1] || '').length
  if (latDecimals < 4 || lngDecimals < 4) {
    reasons.push('Coordinates lack precision')
  }

  // 有名な偽装座標をチェック
  const commonFakeCoords = [
    { lat: 0, lng: 0 }, // 原点
    { lat: 37.7749, lng: -122.4194 }, // サンフランシスコ（VPNでよく使われる）
    { lat: 40.7128, lng: -74.0060 }, // ニューヨーク
  ]

  for (const fake of commonFakeCoords) {
    const distance = calculateDistance(position, { latitude: fake.lat, longitude: fake.lng })
    if (distance < 10) {
      reasons.push('Matches known fake coordinates')
    }
  }

  return {
    suspicious: reasons.length > 0,
    reasons
  }
}

/**
 * ジムのレア度を判定
 */
export function calculateGymRarity(gymData: any): {
  rarity: 'common' | 'rare' | 'legendary' | 'mythical'
  score: number
  factors: string[]
} {
  let score = 0
  const factors: string[] = []

  // 有名ジムかどうか
  if (gymData.name?.includes('Gold\'s Gym')) {
    score += 50
    factors.push('Gold\'s Gym chain')
  }
  if (gymData.name?.includes('Muscle Beach')) {
    score += 60
    factors.push('Muscle Beach location')
  }

  // 海外かどうか（簡易判定）
  if (gymData.country && gymData.country !== 'Japan') {
    score += 30
    factors.push('International location')
  }

  // 設備の充実度
  if (gymData.equipment_count && gymData.equipment_count > 50) {
    score += 20
    factors.push('Premium equipment')
  }

  // レア度判定
  let rarity: 'common' | 'rare' | 'legendary' | 'mythical' = 'common'
  if (score >= 80) rarity = 'mythical'
  else if (score >= 60) rarity = 'legendary'
  else if (score >= 30) rarity = 'rare'

  return { rarity, score, factors }
}

export default {
  calculateDistance,
  getCurrentPosition,
  getAccuratePosition,
  verifyDistanceToGym,
  getDeviceInfo,
  detectLocationSpoofing,
  calculateGymRarity,
  DEFAULT_VERIFICATION_OPTIONS
}