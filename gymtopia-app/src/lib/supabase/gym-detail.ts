import { supabase } from './client'

export async function getGymDetail(gymId: string) {
  try {
    const { data, error } = await supabase
      .from('gyms')
      .select(`
        *,
        reviews:gym_reviews(
          id,
          rating,
          comment,
          created_at,
          user:user_id(
            id,
            username,
            display_name,
            avatar_url
          )
        )
      `)
      .eq('id', gymId)
      .single()

    if (error) throw error

    // データ形式を整形
    if (data) {
      const formatted = {
        ...data,
        // business_hoursをopening_hoursにマップ
        opening_hours: data.business_hours,
        // imagesの最初の画像をimage_urlとして使用
        image_url: data.images?.[0] || '/images/gym-placeholder.jpg',
        // facilitiesから設備とアメニティを抽出
        equipment: data.equipment_types?.map((type: string) => {
          const equipmentMap: Record<string, string> = {
            'machine': 'マシン',
            'free_weight': 'フリーウェイト',
            'cardio': '有酸素マシン'
          }
          return equipmentMap[type] || type
        }),
        amenities: data.facilities ? Object.entries(data.facilities)
          .filter(([_, value]) => value === true)
          .map(([key, _]) => {
            const amenityMap: Record<string, string> = {
              'shower': 'シャワールーム',
              'locker': 'ロッカー',
              'parking': '駐車場',
              'sauna': 'サウナ',
              'pool': 'プール',
              'studio': 'スタジオ',
              'jacuzzi': 'ジャグジー',
              'wifi': 'Wi-Fi',
              'women_only': '女性専用',
              'personal_training': 'パーソナルトレーニング',
              'group_lesson': 'グループレッスン',
              '24hours': '24時間営業',
              'cafe': 'カフェ',
              'massage_chair': 'マッサージチェア'
            }
            return amenityMap[key] || key
          }) : [],
        // review_countをusers_countとして使用（仮）
        users_count: data.review_count || 0
      }

      return { data: formatted, error: null }
    }

    return { data: null, error: 'Gym not found' }
  } catch (error) {
    console.error('Error fetching gym detail:', error)
    return { data: null, error }
  }
}

// お気に入り状態を確認
export async function checkFavoriteStatus(gymId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_gym_favorites')
      .select('id')
      .eq('gym_id', gymId)
      .eq('user_id', userId)
      .single()

    return { isFavorite: !!data, error: error?.code === 'PGRST116' ? null : error }
  } catch (error) {
    console.error('Error checking favorite status:', error)
    return { isFavorite: false, error }
  }
}

// お気に入りの追加/削除
export async function toggleFavorite(gymId: string, userId: string, currentStatus: boolean) {
  try {
    if (currentStatus) {
      // お気に入りから削除
      const { error } = await supabase
        .from('user_gym_favorites')
        .delete()
        .eq('gym_id', gymId)
        .eq('user_id', userId)

      if (error) throw error
      return { success: true, error: null }
    } else {
      // お気に入りに追加
      const { error } = await supabase
        .from('user_gym_favorites')
        .insert({
          gym_id: gymId,
          user_id: userId
        })

      if (error) throw error
      return { success: true, error: null }
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return { success: false, error }
  }
}