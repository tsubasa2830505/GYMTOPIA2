import { supabase } from './client'

// ジムのimagesを直接取得する関数
export async function fetchGymImages(gymId: string): Promise<string[]> {
  try {
    console.log('[fetchGymImages] Fetching images for gym:', gymId)

    const { data, error } = await supabase
      .from('gyms')
      .select('images')
      .eq('id', gymId)
      .single()

    if (error) {
      console.error('[fetchGymImages] Error:', error)
      return []
    }

    console.log('[fetchGymImages] Data from DB:', data)
    console.log('[fetchGymImages] Images array:', data?.images)

    return data?.images || []
  } catch (error) {
    console.error('[fetchGymImages] Unexpected error:', error)
    return []
  }
}