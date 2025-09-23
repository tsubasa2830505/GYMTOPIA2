import { supabase } from './client'

export interface GymImage {
  url: string
  path: string
  name: string
}

export async function uploadGymImage(gymId: string, file: File): Promise<GymImage | null> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${gymId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    // Upload to storage
    const { data, error } = await supabase.storage
      .from('gym-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('gym-images')
      .getPublicUrl(fileName)

    return {
      url: publicUrl,
      path: data.path,
      name: file.name
    }
  } catch (error) {
    console.error('Error uploading gym image:', error)
    return null
  }
}

export async function deleteGymImage(path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('gym-images')
      .remove([path])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting gym image:', error)
    return false
  }
}

export async function updateGymImages(gymId: string, imageUrls: string[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('gyms')
      .update({ images: imageUrls })
      .eq('id', gymId)

    if (error) {
      console.error('Update error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating gym images:', error)
    return false
  }
}

export async function getGymImages(gymId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('gyms')
      .select('images')
      .eq('id', gymId)
      .single()

    if (error) {
      console.error('Fetch error:', error)
      return []
    }

    return data?.images || []
  } catch (error) {
    console.error('Error fetching gym images:', error)
    return []
  }
}