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

// デフォルト設定（強化版）
export const DEFAULT_VERIFICATION_OPTIONS: LocationVerificationOptions = {
  maxDistance: 80, // 80m以内（より厳格）
  requiredAccuracy: 30, // 30m以下の精度が必要（より厳格）
  timeoutMs: 15000, // 15秒（より長く待機してより精度の高い結果を得る）
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
 * ジムとの距離認証（強化版）
 */
export function verifyDistanceToGym(
  userLocation: Coordinates,
  gymLocation: Coordinates,
  options: Partial<LocationVerificationOptions> = {}
): DistanceVerificationResult {
  const config = { ...DEFAULT_VERIFICATION_OPTIONS, ...options }
  const distance = calculateDistance(userLocation, gymLocation)
  const accuracy = userLocation.accuracy || 999

  // より厳格な信頼度レベル計算
  let confidenceLevel: 'high' | 'medium' | 'low' = 'low'
  if (accuracy <= 8) confidenceLevel = 'high'        // 8m以下で高信頼度
  else if (accuracy <= 20) confidenceLevel = 'medium' // 20m以下で中信頼度

  // 厳格な認証成功判定
  let adjustedMaxDistance = config.maxDistance

  // 精度による許容距離調整をより厳格に
  if (accuracy <= 10) {
    // 高精度の場合は距離をほぼそのまま
    adjustedMaxDistance = config.maxDistance + Math.min(accuracy * 0.5, 10)
  } else if (accuracy <= 30) {
    // 中精度の場合は少し緩和
    adjustedMaxDistance = config.maxDistance + Math.min(accuracy * 0.8, 25)
  } else {
    // 低精度の場合は大幅緩和するが上限を設ける
    adjustedMaxDistance = config.maxDistance + Math.min(accuracy, 40)
  }

  // 複数の条件をチェック
  const isValid = distance <= adjustedMaxDistance &&
                  accuracy <= config.requiredAccuracy &&
                  confidenceLevel !== 'low'

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
 * 位置情報の偽装チェック（強化版）
 */
export function detectLocationSpoofing(position: Coordinates): {
  suspicious: boolean
  reasons: string[]
  riskLevel: 'low' | 'medium' | 'high'
} {
  const reasons: string[] = []
  let riskScore = 0

  // 1. 精度が異常に高い（通常のGPSでは1m以下は困難）
  if (position.accuracy && position.accuracy < 0.5) {
    reasons.push('GPS accuracy suspiciously perfect')
    riskScore += 30
  } else if (position.accuracy && position.accuracy < 2) {
    reasons.push('GPS accuracy unusually high')
    riskScore += 15
  }

  // 2. 座標の精度不足（偽装ツールは小数点以下が少ない傾向）
  const latDecimals = (position.latitude.toString().split('.')[1] || '').length
  const lngDecimals = (position.longitude.toString().split('.')[1] || '').length
  if (latDecimals < 5 || lngDecimals < 5) {
    reasons.push('Coordinates lack sufficient precision')
    riskScore += 20
  }

  // 3. 座標が整数に近すぎる
  const latFraction = Math.abs(position.latitude - Math.round(position.latitude))
  const lngFraction = Math.abs(position.longitude - Math.round(position.longitude))
  if (latFraction < 0.001 || lngFraction < 0.001) {
    reasons.push('Coordinates suspiciously close to integers')
    riskScore += 25
  }

  // 4. 有名な偽装座標をチェック（拡張版）
  const commonFakeCoords = [
    { lat: 0, lng: 0 }, // 原点
    { lat: 37.7749, lng: -122.4194 }, // サンフランシスコ
    { lat: 40.7128, lng: -74.0060 }, // ニューヨーク
    { lat: 51.5074, lng: -0.1278 }, // ロンドン
    { lat: 48.8566, lng: 2.3522 }, // パリ
    { lat: 35.6762, lng: 139.6503 }, // 東京駅（テスト用によく使われる）
  ]

  for (const fake of commonFakeCoords) {
    const distance = calculateDistance(position, { latitude: fake.lat, longitude: fake.lng })
    if (distance < 50) {
      reasons.push(`Too close to known fake location (${distance.toFixed(1)}m)`)
      riskScore += 40
    }
  }

  // 5. 時刻チェック（位置情報取得からの経過時間）
  if (position.timestamp) {
    const timeDiff = Date.now() - position.timestamp
    if (timeDiff < 100) {
      reasons.push('Position timestamp too recent (possible injection)')
      riskScore += 15
    } else if (timeDiff > 60000) {
      reasons.push('Position timestamp too old (possible replay)')
      riskScore += 10
    }
  }

  // 6. 座標パターンチェック（連続した同じ値など）
  const latStr = position.latitude.toString()
  const lngStr = position.longitude.toString()
  if (latStr.includes('000') || lngStr.includes('000')) {
    reasons.push('Coordinates contain suspicious patterns')
    riskScore += 10
  }

  // リスクレベル判定
  let riskLevel: 'low' | 'medium' | 'high' = 'low'
  if (riskScore >= 50) riskLevel = 'high'
  else if (riskScore >= 25) riskLevel = 'medium'

  return {
    suspicious: reasons.length > 0,
    reasons,
    riskLevel
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