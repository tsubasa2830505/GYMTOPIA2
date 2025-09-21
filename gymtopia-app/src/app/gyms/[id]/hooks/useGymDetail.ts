import { useState, useEffect } from 'react'
import { getGymDetail, checkFavoriteStatus, toggleFavorite } from '@/lib/supabase/gym-detail'
import { getSampleGyms } from '../utils/sampleGyms'

interface GymDetail {
  id: string
  name: string
  description: string
  prefecture: string
  city: string
  address: string
  latitude?: string | number
  longitude?: string | number
  image_url: string
  images?: string[]
  rating: number
  users_count: number
  opening_hours?: string
  business_hours?: string
  holidays?: string
  phone?: string
  website?: string
  instagram?: string
  twitter?: string
  equipment?: string[]
  amenities?: string[]
  facilities?: Record<string, boolean>
  has_24h?: boolean
  has_parking?: boolean
  has_shower?: boolean
  has_locker?: boolean
  has_sauna?: boolean
  price_info?: any
  membership_fee?: {
    monthly?: string
    daily?: string
  }
}

interface UseGymDetailReturn {
  gymDetail: GymDetail | null
  isLoading: boolean
  isFavorite: boolean
  handleFavoriteToggle: () => Promise<void>
}

export function useGymDetail(gymId: string, user: any): UseGymDetailReturn {
  const [gymDetail, setGymDetail] = useState<GymDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    async function fetchGymDetail() {
      try {
        const { data, error } = await getGymDetail(gymId)

        if (error || !data) {
          const sampleGyms = getSampleGyms()
          const gym = sampleGyms[gymId]
          if (gym) {
            setGymDetail(gym)
          }
        } else {
          setGymDetail(data)
        }

        if (user) {
          const { isFavorite: favStatus } = await checkFavoriteStatus(gymId, user.id)
          setIsFavorite(favStatus)
        }
      } catch (error) {
        console.error('Error fetching gym detail:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGymDetail()
  }, [gymId, user])

  const handleFavoriteToggle = async () => {
    if (!user) {
      return
    }

    setIsFavorite(!isFavorite)

    const { success } = await toggleFavorite(gymId, user.id, isFavorite)

    if (!success) {
      setIsFavorite(isFavorite)
      console.error('Failed to toggle favorite')
    }
  }

  return {
    gymDetail,
    isLoading,
    isFavorite,
    handleFavoriteToggle
  }
}