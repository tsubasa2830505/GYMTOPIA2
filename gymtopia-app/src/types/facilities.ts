// Central definition for facility keys and types used across the app

export type FacilityKey =
  | '24hours'
  | 'shower'
  | 'parking'
  | 'locker'
  | 'wifi'
  | 'chalk'
  | 'belt_rental'
  | 'personal_training'
  | 'group_lesson'
  | 'studio'
  | 'sauna'
  | 'pool'
  | 'jacuzzi'
  | 'massage_chair'
  | 'cafe'
  | 'women_only'
  | 'barrier_free'
  | 'kids_room'
  | 'english_support'
  | 'drop_in'

// Strongly-typed facilities payload stored per gym (JSONB in DB)
export type GymFacilities = Record<FacilityKey, boolean>

// Helper: list of all keys (useful for validation/mapping)
export const FACILITY_KEYS: readonly FacilityKey[] = [
  '24hours',
  'shower',
  'parking',
  'locker',
  'wifi',
  'chalk',
  'belt_rental',
  'personal_training',
  'group_lesson',
  'studio',
  'sauna',
  'pool',
  'jacuzzi',
  'massage_chair',
  'cafe',
  'women_only',
  'barrier_free',
  'kids_room',
  'english_support',
  'drop_in',
] as const

// Labels and category metadata without UI icon dependencies
export type FacilityCategoryId = 'basic' | 'training' | 'amenity' | 'special'

export interface FacilityMeta {
  id: FacilityKey
  name: string
  description?: string
  category: FacilityCategoryId
}

export const FACILITY_META: readonly FacilityMeta[] = [
  { id: '24hours', name: '24時間営業', description: '深夜・早朝も利用可能', category: 'basic' },
  { id: 'shower', name: 'シャワー', description: 'シャワールーム完備', category: 'basic' },
  { id: 'parking', name: '駐車場', description: '無料/有料駐車場あり', category: 'basic' },
  { id: 'locker', name: 'ロッカー', description: '鍵付きロッカー', category: 'basic' },
  { id: 'wifi', name: 'WiFi', description: '無料WiFi利用可能', category: 'basic' },
  { id: 'drop_in', name: 'ドロップイン', description: 'ビジター利用可能', category: 'basic' },

  { id: 'chalk', name: 'チョーク利用可', description: 'パワーリフティング対応', category: 'training' },
  { id: 'belt_rental', name: 'ベルト貸出', description: 'トレーニングベルト無料貸出', category: 'training' },
  { id: 'personal_training', name: 'パーソナルトレーニング', description: '専属トレーナー', category: 'training' },
  { id: 'group_lesson', name: 'グループレッスン', description: 'ヨガ・エアロビクス等', category: 'training' },
  { id: 'studio', name: 'スタジオ', description: 'グループレッスン用スタジオ', category: 'training' },

  { id: 'sauna', name: 'サウナ', description: 'サウナ・水風呂完備', category: 'amenity' },
  { id: 'pool', name: 'プール', description: '温水プール', category: 'amenity' },
  { id: 'jacuzzi', name: 'ジャグジー', description: 'リラクゼーション', category: 'amenity' },
  { id: 'massage_chair', name: 'マッサージチェア', description: '疲労回復', category: 'amenity' },
  { id: 'cafe', name: 'カフェ/売店', description: 'プロテインバー', category: 'amenity' },

  { id: 'women_only', name: '女性専用エリア', description: '女性専用トレーニングエリア', category: 'special' },
  { id: 'barrier_free', name: 'バリアフリー', description: '車椅子対応', category: 'special' },
  { id: 'kids_room', name: 'キッズルーム', description: '子供預かりサービス', category: 'special' },
  { id: 'english_support', name: '英語対応', description: 'English speaking staff', category: 'special' },
] as const

// Group meta by category to simplify UI mapping without icons
export const FACILITY_CATEGORIES_NO_ICON: Record<FacilityCategoryId, { id: FacilityCategoryId; name: string; description: string; items: FacilityMeta[] }> = {
  basic: {
    id: 'basic',
    name: '基本設備',
    description: '営業時間・基本サービス',
    items: FACILITY_META.filter(m => m.category === 'basic')
  },
  training: {
    id: 'training',
    name: 'トレーニング環境',
    description: 'トレーニングに関する設備',
    items: FACILITY_META.filter(m => m.category === 'training')
  },
  amenity: {
    id: 'amenity',
    name: 'アメニティ',
    description: 'リラクゼーション・快適設備',
    items: FACILITY_META.filter(m => m.category === 'amenity')
  },
  special: {
    id: 'special',
    name: '特別対応',
    description: '特別なニーズへの対応',
    items: FACILITY_META.filter(m => m.category === 'special')
  },
}

// Factory: empty facilities object (all false)
export function createEmptyFacilities(): GymFacilities {
  return FACILITY_KEYS.reduce((acc, key) => {
    acc[key] = false
    return acc
  }, {} as GymFacilities)
}

// フリーウェイト機器の情報
export interface FreeWeightItem {
  name: string      // 機器名（例: "ダンベル", "バーベル"）
  count?: number    // 数量（ダンベルの場合は最大重量、その他は個数）
}

// マシン機器の情報
export interface MachineItem {
  name: string      // マシン名
  count: number     // 台数
}

// データベースに保存するジム施設情報
export interface GymFacility {
  id: string
  gym_id: string
  free_weights?: FreeWeightItem[]  // フリーウェイト機器のリスト
  machines?: MachineItem[]          // マシンのリスト（個数付き）
  created_at: string
  updated_at: string
  updated_by: string               // 最終更新者のユーザーID
}

// フォームから送信される施設情報
export interface FacilityFormData {
  gymName: string
  freeWeights: Map<string, number>
  machines: Map<string, number>     // Set<string>からMap<string, number>に変更
}

// 施設検索用のフィルター
export interface FacilityFilter {
  freeWeights?: string[]    // 必要なフリーウェイト機器名
  machines?: string[]       // 必要なマシン名
}

