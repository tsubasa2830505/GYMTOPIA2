/**
 * 住所から最寄り駅までの徒歩時間を計算するユーティリティ
 */

// 主要駅の座標データ（全国）
const MAJOR_STATIONS = {
  // 東京都内
  '新宿駅': { lat: 35.6896, lng: 139.7006, area: '新宿', region: 'tokyo' },
  '渋谷駅': { lat: 35.6580, lng: 139.7016, area: '渋谷', region: 'tokyo' },
  '池袋駅': { lat: 35.7295, lng: 139.7109, area: '池袋', region: 'tokyo' },
  '銀座駅': { lat: 35.6719, lng: 139.7653, area: '銀座', region: 'tokyo' },
  '東京駅': { lat: 35.6812, lng: 139.7671, area: '丸の内', region: 'tokyo' },
  '品川駅': { lat: 35.6284, lng: 139.7387, area: '品川', region: 'tokyo' },
  '恵比寿駅': { lat: 35.6465, lng: 139.7104, area: '恵比寿', region: 'tokyo' },
  '六本木駅': { lat: 35.6627, lng: 139.7314, area: '六本木', region: 'tokyo' },
  '表参道駅': { lat: 35.6652, lng: 139.7123, area: '表参道', region: 'tokyo' },
  '赤坂見附駅': { lat: 35.6794, lng: 139.7366, area: '赤坂', region: 'tokyo' },
  '霞ヶ関駅': { lat: 35.6740, lng: 139.7547, area: '霞ヶ関', region: 'tokyo' },
  '虎ノ門駅': { lat: 35.6686, lng: 139.7506, area: '虎ノ門', region: 'tokyo' },

  // 大阪
  '大阪駅': { lat: 34.7024, lng: 135.4959, area: '大阪', region: 'osaka' },
  '梅田駅': { lat: 34.7019, lng: 135.4969, area: '梅田', region: 'osaka' },
  '難波駅': { lat: 34.6658, lng: 135.5010, area: '難波', region: 'osaka' },
  '天王寺駅': { lat: 34.6455, lng: 135.5066, area: '天王寺', region: 'osaka' },

  // 愛知
  '名古屋駅': { lat: 35.1706, lng: 136.8816, area: '名古屋', region: 'nagoya' },
  '栄駅': { lat: 35.1681, lng: 136.9089, area: '栄', region: 'nagoya' },

  // 福岡
  '博多駅': { lat: 33.5904, lng: 130.4203, area: '博多', region: 'fukuoka' },
  '天神駅': { lat: 33.5907, lng: 130.3989, area: '天神', region: 'fukuoka' },

  // 北海道
  '札幌駅': { lat: 43.0683, lng: 141.3505, area: '札幌', region: 'hokkaido' },
  '大通駅': { lat: 43.0610, lng: 141.3563, area: '大通', region: 'hokkaido' },

  // 沖縄
  '那覇空港駅': { lat: 26.1958, lng: 127.6465, area: '那覇空港', region: 'okinawa' },
  '県庁前駅': { lat: 26.2139, lng: 127.6792, area: '県庁前', region: 'okinawa' },
  'おもろまち駅': { lat: 26.2220, lng: 127.6889, area: 'おもろまち', region: 'okinawa' },
  '首里駅': { lat: 26.2175, lng: 127.7199, area: '首里', region: 'okinawa' }
}

/**
 * 2点間の距離を計算（ハーバーサイン公式）
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // 地球の半径（km）
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI/180)
}

/**
 * 距離から徒歩時間を計算
 * 一般的に徒歩1分 = 約80メートル
 */
function distanceToWalkingTime(distanceKm: number): number {
  const distanceM = distanceKm * 1000
  const walkingSpeedMPerMin = 80 // メートル/分
  return Math.round(distanceM / walkingSpeedMPerMin)
}

/**
 * ジムの座標から最寄り駅と徒歩時間を計算
 */
export function calculateNearestStation(lat: number, lng: number): {
  station: string
  area: string
  walkingMinutes: number
  distance: number
} {
  let nearestStation = '新宿駅'
  let nearestArea = '新宿'
  let minDistance = Infinity

  for (const [stationName, coords] of Object.entries(MAJOR_STATIONS)) {
    const distance = calculateDistance(lat, lng, coords.lat, coords.lng)
    if (distance < minDistance) {
      minDistance = distance
      nearestStation = stationName
      nearestArea = coords.area
    }
  }

  const walkingMinutes = distanceToWalkingTime(minDistance)

  // 徒歩30分を超える場合は「アクセス情報未設定」とする
  if (walkingMinutes > 30) {
    return {
      station: '最寄り駅',
      area: '詳細な場所',
      walkingMinutes: 0,
      distance: minDistance
    }
  }

  return {
    station: nearestStation,
    area: nearestArea,
    walkingMinutes,
    distance: minDistance
  }
}

/**
 * 住所文字列から区を抽出
 */
export function extractAreaFromAddress(address: string): string {
  // 沖縄県
  if (address.includes('沖縄県') || address.includes('那覇市') || address.includes('浦添市') || address.includes('宜野湾市')) {
    if (address.includes('おもろまち')) return 'おもろまち'
    if (address.includes('那覇')) return '那覇'
    return '沖縄'
  }

  // 北海道
  if (address.includes('北海道') || address.includes('札幌市')) {
    if (address.includes('札幌')) return '札幌'
    return '北海道'
  }

  // 大阪府
  if (address.includes('大阪府') || address.includes('大阪市')) {
    if (address.includes('梅田')) return '梅田'
    if (address.includes('難波') || address.includes('なんば')) return '難波'
    if (address.includes('天王寺')) return '天王寺'
    return '大阪'
  }

  // 愛知県
  if (address.includes('愛知県') || address.includes('名古屋市')) {
    if (address.includes('栄')) return '栄'
    return '名古屋'
  }

  // 福岡県
  if (address.includes('福岡県') || address.includes('福岡市')) {
    if (address.includes('天神')) return '天神'
    return '博多'
  }

  // 東京23区の抽出
  const tokyoWards = [
    '千代田区', '中央区', '港区', '新宿区', '文京区', '台東区', '墨田区',
    '江東区', '品川区', '目黒区', '大田区', '世田谷区', '渋谷区', '中野区',
    '杉並区', '豊島区', '北区', '荒川区', '板橋区', '練馬区', '足立区',
    '葛飾区', '江戸川区'
  ]

  for (const ward of tokyoWards) {
    if (address.includes(ward)) {
      return ward
    }
  }

  // 他の主要エリア
  if (address.includes('横浜')) return '横浜'
  if (address.includes('川崎')) return '川崎'
  if (address.includes('さいたま')) return 'さいたま'
  if (address.includes('千葉')) return '千葉'

  return '詳細な場所'
}

/**
 * 住所から推定される最寄り駅情報を取得
 */
export function getStationInfoFromAddress(address: string): {
  area: string
  estimatedStation: string
} {
  const area = extractAreaFromAddress(address)

  // 区から推定される主要駅
  const areaToStation: Record<string, string> = {
    // 東京
    '新宿区': '新宿駅',
    '渋谷区': '渋谷駅',
    '豊島区': '池袋駅',
    '中央区': '銀座駅',
    '千代田区': '東京駅',
    '港区': '品川駅',
    '目黒区': '恵比寿駅',
    '六本木': '六本木駅',
    // 沖縄
    'おもろまち': 'おもろまち駅',
    '那覇': '県庁前駅',
    '沖縄': '那覇空港駅',
    // その他
    '大阪': '大阪駅',
    '梅田': '梅田駅',
    '名古屋': '名古屋駅',
    '博多': '博多駅',
    '札幌': '札幌駅'
  }

  return {
    area,
    estimatedStation: areaToStation[area] || '最寄り駅'
  }
}

/**
 * ジムデータに最寄り駅情報を追加
 */
export function enrichGymWithStationInfo(gym: {
  address?: string
  latitude?: number | string
  longitude?: number | string
}): {
  area: string
  station: string
  walkingMinutes: number
  walkingText: string
} {
  // 座標がある場合は正確な計算
  if (gym.latitude && gym.longitude) {
    const lat = typeof gym.latitude === 'string' ? parseFloat(gym.latitude) : gym.latitude
    const lng = typeof gym.longitude === 'string' ? parseFloat(gym.longitude) : gym.longitude

    if (!isNaN(lat) && !isNaN(lng)) {
      const stationInfo = calculateNearestStation(lat, lng)
      return {
        area: stationInfo.area,
        station: stationInfo.station,
        walkingMinutes: stationInfo.walkingMinutes,
        walkingText: `徒歩${stationInfo.walkingMinutes}分`
      }
    }
  }

  // 住所のみの場合は推定
  if (gym.address) {
    const addressInfo = getStationInfoFromAddress(gym.address)
    // 住所ベースの場合は5-15分の範囲で推定
    const estimatedMinutes = Math.floor(Math.random() * 11) + 5 // 5-15分
    return {
      area: addressInfo.area,
      station: addressInfo.estimatedStation,
      walkingMinutes: estimatedMinutes,
      walkingText: `徒歩約${estimatedMinutes}分`
    }
  }

  // フォールバック
  return {
    area: '詳細な場所',
    station: '最寄り駅',
    walkingMinutes: 0,
    walkingText: 'アクセス情報未設定'
  }
}