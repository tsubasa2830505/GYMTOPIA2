import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getGymById, getGymMachines, getGymFreeWeights } from '@/lib/supabase/gyms'
import { supabase } from '@/lib/supabase/client'
import type { GymDetailModalState, GymData } from '../types'

const sampleGymData: GymData = {
  id: 'gym_rogue_shinjuku',
  name: 'ROGUEクロストレーニング新宿',
  tags: ['ROGUE', 'クロスフィット', 'チョークOK', 'パワーラック6台'],
  location: { area: '新宿', walkingMinutes: 7, lat: 35.0, lng: 139.0 },
  businessHours: [{ open: '05:00', close: '24:00', days: [0, 1, 2, 3, 4, 5, 6] }],
  isOpenNow: true,
  likesCount: 94,
  likedByMe: false,
  images: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=800&h=600&fit=crop'
  ],
  pricingPlans: [
    { id: 'monthly', title: '月額会員', priceJPY: 14800, link: 'https://example.com/monthly' },
    { id: 'visitor', title: 'ドロップイン（ビジター）', priceJPY: 3800, link: 'https://example.com/visitor' }
  ],
  freeWeights: [
    { name: 'パワーラック', brand: 'ROGUE RML-490', count: 6 },
    { name: 'スクワットラック', brand: 'ROGUE SML-2', count: 4 },
    { name: 'オリンピックバー', brand: 'ROGUE オハイオバー', count: 8 },
    { name: 'アジャスタブルベンチ', brand: 'ROGUE', count: 4 },
    { name: 'ダンベル', brand: 'IVANKO', range: '1-50kg' },
    { name: 'ケトルベル', brand: 'ROGUE', range: '4-48kg' }
  ],
  machines: [
    { name: 'ラットプルダウン', brand: 'Hammer Strength', count: 2 },
    { name: 'レッグプレス', brand: 'Hammer Strength', count: 2 },
    { name: 'チェストプレス', brand: 'Life Fitness', count: 3 },
    { name: 'ケーブルマシン', brand: 'Life Fitness', count: 4 },
    { name: 'トレッドミル', brand: 'TECHNOGYM', count: 10 },
    { name: 'エアロバイク', brand: 'TECHNOGYM', count: 8 }
  ],
  facilities: {
    '24hours': false,
    'shower': true,
    'parking': true,
    'locker': true,
    'wifi': true,
    'chalk': true,
    'belt_rental': true,
    'personal_training': true,
    'group_lesson': true,
    'studio': true,
    'sauna': true,
    'pool': false,
    'jacuzzi': false,
    'massage_chair': true,
    'cafe': true,
    'women_only': false,
    'barrier_free': true,
    'kids_room': false,
    'english_support': true,
    'drop_in': true
  },
  contact: { phone: '03-1234-5678', website: 'https://example.com' },
  reviews: [
    { author: '筋トレ愛好家', date: '2024-01-15', body: 'ROGUEのパワーラックが6台もあって最高です！混雑時でも待ち時間が少なく、効率的にトレーニングできます。' },
    { author: 'ベンチプレスサー', date: '2024-01-10', body: 'Hammer Strengthのマシンが充実していて、フリーウェイトエリアも広々。初心者から上級者まで満足できるジムです。' }
  ],
  assets: { heroImages: ['/gym-hero.jpg'] }
}

export const useGymDetailData = (isOpen: boolean, gymId: string) => {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  const [state, setState] = useState<GymDetailModalState>({
    gymData: sampleGymData,
    loading: true,
    liked: false,
    likesCount: 0,
    activeTab: 'freeweights',
    gym: null,
    machines: [],
    isProcessingLike: false
  })

  const updateState = (updates: Partial<GymDetailModalState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  const loadGymData = async () => {
    updateState({ loading: true })
    try {
      const gym = await getGymById(gymId)
      if (gym) {
        const [machines, freeWeights, favoriteCount, userFavorite] = await Promise.all([
          getGymMachines(gymId),
          getGymFreeWeights(gymId),
          supabase
            .from('favorite_gyms')
            .select('id', { count: 'exact', head: true })
            .eq('gym_id', gymId),
          supabase
            .from('favorite_gyms')
            .select('id')
            .eq('gym_id', gymId)
            .eq('user_id', user?.id)
            .maybeSingle()
        ])

        const actualLikesCount = favoriteCount.count || 0
        const isLikedByUser = userFavorite.data !== null && !userFavorite.error

        const fullGymData: GymData = {
          ...gym,
          tags: gym.equipment_types || [],
          location: {
            area: gym.city || gym.prefecture || '未設定',
            walkingMinutes: 7
          },
          businessHours: gym.business_hours || [{ open: '09:00', close: '22:00', days: [0, 1, 2, 3, 4, 5, 6] }],
          isOpenNow: true,
          likesCount: actualLikesCount,
          likedByMe: isLikedByUser,
          images: gym.images && gym.images.length > 0 ? gym.images : [
            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&h=600&fit=crop'
          ],
          pricingPlans: gym.price_info || [
            { id: 'monthly', title: '月額会員', priceJPY: 10000, link: '#' },
            { id: 'visitor', title: 'ドロップイン', priceJPY: 3000, link: '#' }
          ],
          machines: machines.map(m => ({
            name: m.name,
            brand: m.brand || '',
            count: m.count || 1,
          })),
          freeWeights: freeWeights.map(fw => ({
            name: fw.name,
            brand: fw.brand || '',
            count: fw.count,
            range: fw.weight_range,
          })),
          facilities: gym.facilities || {},
          contact: {
            phone: gym.phone || '',
            website: gym.website || ''
          },
          reviews: []
        }

        updateState({
          gymData: fullGymData,
          liked: fullGymData.likedByMe,
          likesCount: fullGymData.likesCount
        })
      } else {
        updateState({ gymData: sampleGymData })
      }
    } catch (error) {
      console.error('Failed to load gym data:', error)
      updateState({ gymData: sampleGymData })
    } finally {
      updateState({ loading: false })
    }
  }

  const handleToggleLike = async () => {
    if (state.isProcessingLike) {
      return
    }

    if (!isAuthenticated || !user) {
      alert('ログインが必要です')
      return
    }

    updateState({ isProcessingLike: true })

    try {
      if (state.liked) {
        const { error } = await supabase
          .from('favorite_gyms')
          .delete()
          .eq('user_id', user?.id)
          .eq('gym_id', gymId)

        if (error) {
          console.error('Error removing like:', error)
          alert('いきたいの解除に失敗しました: ' + error.message)
        } else {
          const newCount = Math.max(0, state.likesCount - 1)
          updateState({
            liked: false,
            likesCount: newCount,
            gymData: {
              ...state.gymData,
              likedByMe: false,
              likesCount: newCount
            }
          })
        }
      } else {
        const { error } = await supabase
          .from('favorite_gyms')
          .insert({
            user_id: user?.id,
            gym_id: gymId
          })

        if (error) {
          if (error.code === '23505') {
            updateState({ liked: true })
          } else {
            console.error('Error adding like:', error)
            alert('いきたいの追加に失敗しました: ' + (error?.message || JSON.stringify(error)))
          }
        } else {
          const newCount = state.likesCount + 1
          updateState({
            liked: true,
            likesCount: newCount,
            gymData: {
              ...state.gymData,
              likedByMe: true,
              likesCount: newCount
            }
          })
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      alert('エラーが発生しました: ' + error.message)
    } finally {
      updateState({ isProcessingLike: false })
    }
  }

  const handlePostActivity = () => {
    router.push(`/add?gymId=${state.gymData.id}&gymName=${encodeURIComponent(state.gymData.name)}`)
  }

  const setActiveTab = (tab: string) => {
    updateState({ activeTab: tab })
  }

  // ジムデータを取得
  useEffect(() => {
    if (isOpen && gymId) {
      loadGymData()
    } else if (!isOpen) {
      updateState({
        liked: false,
        likesCount: 0,
        gymData: sampleGymData,
        loading: true
      })
    }
  }, [isOpen, gymId])

  // Body scroll lock
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'unset'
      }
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen])

  return {
    state,
    handleToggleLike,
    handlePostActivity,
    setActiveTab
  }
}