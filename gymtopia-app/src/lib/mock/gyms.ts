import type { Gym } from '@/lib/supabase/gyms'

const gyms: Gym[] = [
  { id: 'gym_1', name: 'プレミアムフィットネス銀座', address: '東京都中央区銀座1-1-1', prefecture: '東京都', city: '中央区', rating: 4.6, review_count: 128, verified: true, description: '高級感のある総合フィットネス', equipment_types: ['プレミアム', 'サウナ'] },
  { id: 'gym_2', name: 'GOLD\'S GYM 渋谷', address: '東京都渋谷区渋谷2-2-2', prefecture: '東京都', city: '渋谷区', rating: 4.4, review_count: 320, verified: true, description: '王道のトレーニング環境', equipment_types: ['24時間', 'プール'] },
  { id: 'gym_3', name: 'エニタイムフィットネス新宿', address: '東京都新宿区西新宿3-3-3', prefecture: '東京都', city: '新宿区', rating: 4.0, review_count: 200, verified: false, description: '24時間営業のジム', equipment_types: ['24時間営業', 'シャワー'] },
  { id: 'gym_4', name: 'ROGUEクロストレーニング新宿', address: '東京都新宿区歌舞伎町1-2-3', prefecture: '東京都', city: '新宿区', rating: 4.8, review_count: 89, verified: true, description: 'クロストレーニング特化', equipment_types: ['ROGUE', 'クロスフィット'] },
  { id: 'gym_5', name: 'ティップネス池袋', address: '東京都豊島区池袋1-1-1', prefecture: '東京都', city: '豊島区', rating: 4.1, review_count: 77, verified: true, description: 'プールとスタジオ完備', equipment_types: ['スタジオ', 'プール'] },
  { id: 'gym_6', name: 'コナミスポーツクラブ品川', address: '東京都港区港南1-2-3', prefecture: '東京都', city: '港区', rating: 3.9, review_count: 56, verified: false, description: 'ファミリー向け施設', equipment_types: ['プール'] },
  { id: 'gym_7', name: 'マッスルベース横浜', address: '神奈川県横浜市西区1-2-3', prefecture: '神奈川県', city: '横浜市', rating: 4.3, review_count: 40, verified: false, description: 'フリーウェイト充実', equipment_types: ['フリーウェイト'] },
  { id: 'gym_8', name: 'スカイフィット千葉', address: '千葉県千葉市中央区1-2-3', prefecture: '千葉県', city: '千葉市', rating: 3.8, review_count: 22, verified: false, description: '手頃な料金', equipment_types: ['24時間'] },
  { id: 'gym_9', name: 'オオサカジム梅田', address: '大阪府大阪市北区1-2-3', prefecture: '大阪府', city: '大阪市', rating: 4.2, review_count: 110, verified: true, description: '関西最大級の設備', equipment_types: ['サウナ'] },
  { id: 'gym_10', name: 'ナゴヤフィット栄', address: '愛知県名古屋市中区1-2-3', prefecture: '愛知県', city: '名古屋市', rating: 4.0, review_count: 65, verified: false, description: '駅近ジム', equipment_types: ['スタジオ'] },
]

export async function mockGetGyms(filters?: { prefecture?: string; city?: string; search?: string }) {
  let list = gyms.slice()
  if (filters?.prefecture) list = list.filter(g => g.prefecture === filters.prefecture)
  if (filters?.city) list = list.filter(g => g.city === filters.city)
  if (filters?.search) {
    const q = filters.search.toLowerCase()
    list = list.filter(g => g.name.toLowerCase().includes(q) || (g.description || '').toLowerCase().includes(q) || (g.address || '').toLowerCase().includes(q))
  }
  // 擬似的に人気順
  list.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  return list
}

export async function mockGetGymById(id: string) {
  return gyms.find(g => g.id === id) || null
}

export async function mockGetGymMachines(gymId: string) {
  return [
    { id: 'm1', gym_id: gymId, machine: { id: 'lat_pulldown', name: 'ラットプルダウン', target_category: 'back' } },
    { id: 'm2', gym_id: gymId, machine: { id: 'chest_press', name: 'チェストプレス', target_category: 'chest' } },
  ]
}

export async function mockGetGymReviews(gymId: string) {
  return [
    { id: 'r1', gym_id: gymId, user_id: 'u1', rating: 5, title: '最高', content: '設備が充実していました', created_at: new Date().toISOString(), user: { display_name: '筋トレ太郎', username: 'taro' } },
  ]
}

