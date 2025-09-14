'use client'

import { useState, useEffect } from 'react'
import {
  MapPin, Clock, Heart, Phone, Globe, X,
  Share2, Users, Dumbbell, Building, Activity, MessageSquare,
  Star, ChevronRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getGymById, getGymMachines, getGymFreeWeights, type Gym } from '@/lib/supabase/gyms'
import { supabase } from '@/lib/supabase/client'
import GymDetailedInfoDisplay from '@/components/GymDetailedInfoDisplay'

interface GymDetailModalProps {
  isOpen: boolean
  onClose: () => void
  gymId: string
}

// サンプルデータ（フォールバック用）
const sampleGymData = {
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
  // フリーウェイト設備
  freeWeights: [
    { name: 'パワーラック', brand: 'ROGUE RML-490', count: 6 },
    { name: 'スクワットラック', brand: 'ROGUE SML-2', count: 4 },
    { name: 'オリンピックバー', brand: 'ROGUE オハイオバー', count: 8 },
    { name: 'アジャスタブルベンチ', brand: 'ROGUE', count: 4 },
    { name: 'ダンベル', brand: 'IVANKO', range: '1-50kg' },
    { name: 'ケトルベル', brand: 'ROGUE', range: '4-48kg' }
  ],
  // マシン設備
  machines: [
    { name: 'ラットプルダウン', brand: 'Hammer Strength', count: 2 },
    { name: 'レッグプレス', brand: 'Hammer Strength', count: 2 },
    { name: 'チェストプレス', brand: 'Life Fitness', count: 3 },
    { name: 'ケーブルマシン', brand: 'Life Fitness', count: 4 },
    { name: 'トレッドミル', brand: 'TECHNOGYM', count: 10 },
    { name: 'エアロバイク', brand: 'TECHNOGYM', count: 8 }
  ],
  // その他施設
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
    'drop_in': true  // ドロップイン対応
  },
  contact: { phone: '03-1234-5678', website: 'https://example.com' },
  reviews: [
    { author: '筋トレ愛好家', date: '2024-01-15', body: 'ROGUEのパワーラックが6台もあって最高です！混雑時でも待ち時間が少なく、効率的にトレーニングできます。' },
    { author: 'ベンチプレスサー', date: '2024-01-10', body: 'Hammer Strengthのマシンが充実していて、フリーウェイトエリアも広々。初心者から上級者まで満足できるジムです。' }
  ],
  assets: { heroImages: ['/gym-hero.jpg'] }
}

export default function GymDetailModal({ isOpen, onClose, gymId }: GymDetailModalProps) {
  const router = useRouter()
  const [gymData, setGymData] = useState<any>(sampleGymData)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [activeTab, setActiveTab] = useState('freeweights')
  const [gym, setGym] = useState<any | null>(null)
  const [machines, setMachines] = useState<any[]>([])
  const [isProcessingLike, setIsProcessingLike] = useState(false)

  // ジムデータを取得
  useEffect(() => {
    if (isOpen && gymId) {
      // モーダルを開く時にデータを取得
      loadGymData()
    } else if (!isOpen) {
      // モーダルを閉じる時に状態をクリア
      setLiked(false)
      setLikesCount(0)
      setGymData(sampleGymData)
      setLoading(true)
    }
  }, [isOpen, gymId])

  // デバッグ用: 手動でいきたい状態をチェック
  const debugCheckLikeStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
      console.log('🔍 DEBUG: No authenticated user')
      return false
    }

    console.log('🔍 DEBUG: Manual like status check')
    console.log('  - Gym ID:', gymId)
    console.log('  - User ID:', user.id)

    const { data, error } = await supabase
      .from('favorite_gyms')
      .select('id')
      .eq('gym_id', gymId)
      .eq('user_id', user.id)
      .maybeSingle()

    console.log('  - Raw query result:', { data, error })
    console.log('  - Has like:', data !== null)
    return data !== null
  }

  const loadGymData = async () => {
    setLoading(true)
    try {
      // ジム情報を取得
      const gym = await getGymById(gymId)
      if (gym) {
        // マシンとフリーウェイト情報、イキタイ情報を並列取得
        const [machines, freeWeights, favoriteCount, userFavorite] = await Promise.all([
          getGymMachines(gymId),
          getGymFreeWeights(gymId),
          // イキタイ数を取得
          supabase
            .from('favorite_gyms')
            .select('id', { count: 'exact', head: true })
            .eq('gym_id', gymId),
          // 現在のユーザーがイキタイしているかチェック
          supabase
            .from('favorite_gyms')
            .select('id')
            .eq('gym_id', gymId)
            .eq('user_id', mockUserId)
            .maybeSingle()
        ])

        const actualLikesCount = favoriteCount.count || 0
        const isLikedByUser = userFavorite.data !== null && !userFavorite.error

        console.log('=== LOADING GYM DATA ===')
        console.log('Gym ID:', gymId)
        console.log('User ID:', mockUserId)
        console.log('User favorite query result:', {
          data: userFavorite.data,
          error: userFavorite.error,
          hasData: userFavorite.data !== null,
          hasError: !!userFavorite.error
        })
        console.log('Is liked by user (calculated):', isLikedByUser)
        console.log('Total likes count:', actualLikesCount)
        console.log('=======================')

        // データを統合
        const fullGymData = {
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

        setGymData(fullGymData)
        setLiked(fullGymData.likedByMe)
        setLikesCount(fullGymData.likesCount)

        console.log('🔄 STATE UPDATE:')
        console.log('  - setLiked called with:', fullGymData.likedByMe)
        console.log('  - setLikesCount called with:', fullGymData.likesCount)
        console.log('  - gymData.likedByMe set to:', fullGymData.likedByMe)
      } else {
        // データが取得できない場合はサンプルデータを使用
        setGymData(sampleGymData)
      }
    } catch (error) {
      console.error('Failed to load gym data:', error)
      setGymData(sampleGymData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // 状態変化の監視
  useEffect(() => {
    console.log('🎯 LIKED STATE CHANGED:', {
      gymId,
      liked,
      likesCount,
      timestamp: new Date().toISOString()
    })
  }, [liked, gymId])

  useEffect(() => {
    console.log('📊 LIKES COUNT CHANGED:', {
      gymId,
      likesCount,
      liked,
      timestamp: new Date().toISOString()
    })
  }, [likesCount, gymId])

  const handleToggleLike = async () => {
    // 処理中の場合は何もしない
    if (isProcessingLike) {
      console.log('Already processing like action')
      return
    }

    setIsProcessingLike(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) {
        console.log('User not authenticated - cannot toggle like')
        return
      }

      console.log('=== TOGGLE LIKE START ===')
      console.log('Current liked state:', liked)
      console.log('Current likes count:', likesCount)
      console.log('Gym ID:', gymId)
      console.log('User ID:', user.id)

      if (liked) {
        // イキタイを解除
        console.log('ACTION: Removing like for gym:', gymId)
        const { error } = await supabase
          .from('favorite_gyms')
          .delete()
          .eq('user_id', user.id)
          .eq('gym_id', gymId)

        if (error) {
          console.error('Error removing like:', error)
          alert('いきたいの解除に失敗しました: ' + error.message)
        } else {
          console.log('✅ Successfully removed like for gym:', gymId)
          console.log('Setting liked to false, count to:', Math.max(0, likesCount - 1))
          setLiked(false)
          setLikesCount(Math.max(0, likesCount - 1))

          // UIを即座に更新
          setGymData(prev => ({
            ...prev,
            likedByMe: false,
            likesCount: Math.max(0, likesCount - 1)
          }))
          console.log('=== TOGGLE LIKE END (REMOVED) ===')
        }
      } else {
        // イキタイを追加
        console.log('ACTION: Adding like for gym:', gymId)
        const { error } = await supabase
          .from('favorite_gyms')
          .insert({
            user_id: user.id,
            gym_id: gymId
          })

        if (error) {
          // 既に存在する場合のエラーを無視
          if (error.code === '23505') {
            console.log('Already liked')
            setLiked(true)
          } else {
            console.error('Error adding like:', error)
            alert('いきたいの追加に失敗しました: ' + error.message)
          }
        } else {
          console.log('✅ Successfully added like for gym:', gymId)
          console.log('Setting liked to true, count to:', likesCount + 1)
          setLiked(true)
          setLikesCount(likesCount + 1)

          // UIを即座に更新
          setGymData(prev => ({
            ...prev,
            likedByMe: true,
            likesCount: likesCount + 1
          }))
          console.log('=== TOGGLE LIKE END (ADDED) ===')
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      alert('エラーが発生しました: ' + error.message)
    } finally {
      setIsProcessingLike(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price)
  }


  if (!isOpen) return null

  // ローディング中の表示
  if (loading) {
    return (
      <>
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={onClose}
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">ジム情報を読み込み中...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
        <div
          className="bg-white w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up sm:animate-scale-in pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[90vh] sm:max-h-[85vh]">
            {/* Header with Hero Image */}
            <div className="relative h-64 sm:h-72 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
              {/* Hero Image */}
              {gymData.images && gymData.images.length > 0 && (
                <img
                  src={gymData.images[0]}
                  alt={gymData.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg z-10 hover:bg-white transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900" />
              </button>
              <button className="absolute top-4 left-4 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg z-10">
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900" />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 sm:px-6 -mt-8 sm:-mt-10 relative pb-6">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                {gymData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 sm:px-4 sm:py-1.5 bg-white/95 backdrop-blur rounded-full text-xs sm:text-sm font-semibold text-slate-900 shadow-lg border border-white/20"
                  >
                    {tag}
                  </span>
                ))}
                {gymData.facilities.drop_in && (
                  <span className="px-3 py-1 sm:px-4 sm:py-1.5 bg-green-600 text-white rounded-full text-xs sm:text-sm font-semibold shadow-lg border border-green-500 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    ドロップインOK
                  </span>
                )}
              </div>

              {/* Title */}
              <div className="mb-4 sm:mb-5">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 leading-tight"
                    style={{
                      textShadow: '3px 3px 6px rgba(255,255,255,1), 0px 0px 12px rgba(255,255,255,0.8), -1px -1px 0px rgba(255,255,255,0.8), 1px -1px 0px rgba(255,255,255,0.8), -1px 1px 0px rgba(255,255,255,0.8), 1px 1px 0px rgba(255,255,255,0.8)'
                    }}>
                  {gymData.name}
                </h1>
                <div className="flex items-center gap-2 text-slate-900">
                  <MapPin className="w-4 h-4" style={{
                    filter: 'drop-shadow(2px 2px 4px rgba(255,255,255,0.8)) drop-shadow(0px 0px 8px rgba(255,255,255,0.6))'
                  }} />
                  <span className="text-sm font-medium"
                        style={{
                          textShadow: '2px 2px 4px rgba(255,255,255,1), 0px 0px 8px rgba(255,255,255,0.8), -1px -1px 0px rgba(255,255,255,0.8), 1px -1px 0px rgba(255,255,255,0.8), -1px 1px 0px rgba(255,255,255,0.8), 1px 1px 0px rgba(255,255,255,0.8)'
                        }}>
                    {gymData.location.area} • 徒歩{gymData.location.walkingMinutes}分
                  </span>
                </div>
              </div>

              {/* Stats Row - Airbnb style */}
              <div className="flex items-center gap-1 text-sm font-medium text-slate-700 mb-6 bg-white rounded-full px-4 py-2 shadow-sm w-fit">
                <span className="text-slate-700">
                  {gymData.review_count || 0}件のレビュー
                </span>
                <span className="text-slate-500">•</span>
                <span className="font-semibold">{likesCount}人がイキタイ</span>
              </div>

              {/* Info Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 sm:mb-5">
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                  <Clock className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {gymData.businessHours[0].open}–{gymData.businessHours[0].close}
                    </p>
                    <p className={`text-xs font-medium ${gymData.isOpenNow ? 'text-green-600' : 'text-red-600'}`}>
                      {gymData.isOpenNow ? '営業中' : '営業時間外'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                  <Users className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">今日の混雑度</p>
                    <p className="text-xs text-green-600 font-medium">空いています</p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3 mb-5 sm:mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleToggleLike}
                    disabled={isProcessingLike}
                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-medium transition-all ${
                      isProcessingLike
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : liked
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-white border-2 border-slate-200 text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${liked ? 'fill-white' : ''} ${isProcessingLike ? 'animate-pulse' : ''}`} />
                    <span className="text-sm sm:text-base">
                      {isProcessingLike ? '処理中...' : liked ? 'イキタイ済み' : 'イキタイ'}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      onClose()
                      router.push(`/add?gymId=${gymData.id}&gymName=${encodeURIComponent(gymData.name)}`)
                    }}
                    className="flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-2xl font-medium"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-sm sm:text-base">ジム活を投稿</span>
                  </button>
                </div>
                {/* デバッグボタン */}
                <button
                  onClick={debugCheckLikeStatus}
                  className="w-full px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium"
                >
                  🔍 デバッグチェック
                </button>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 sm:mb-6">
                {gymData.pricingPlans.map((plan) => (
                  <a
                    key={plan.id}
                    href={plan.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl hover:shadow-lg transition-shadow"
                  >
                    <p className="text-sm font-medium text-slate-700 mb-2">{plan.title}</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatPrice(plan.priceJPY)}
                    </p>
                    <div className="flex items-center justify-end mt-3">
                      <span className="text-xs text-blue-600 font-medium">詳細を見る</span>
                      <ChevronRight className="w-4 h-4 text-blue-600 ml-1" />
                    </div>
                  </a>
                ))}
              </div>

              {/* Image Gallery (小さい画像) */}
              {gymData.images && gymData.images.length > 1 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {gymData.images.slice(1).map((image, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shadow-md"
                    >
                      <img
                        src={image}
                        alt={`${gymData.name} ${index + 2}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl mb-4 overflow-x-auto">
                {[
                  { id: 'freeweights', label: 'フリーウェイト', icon: Dumbbell },
                  { id: 'machines', label: 'マシン', icon: Activity },
                  { id: 'facilities', label: '施設', icon: Building }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-[75px] flex items-center justify-center gap-1 px-2 py-2 rounded-xl text-xs font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-600'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content - Free Weights */}
              {activeTab === 'freeweights' && (
                <div className="space-y-3 mb-5">
                  {gymData.freeWeights.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <p>フリーウェイト情報が登録されていません</p>
                      <p className="text-xs mt-2">gymId: {gymId}</p>
                    </div>
                  ) : (
                    gymData.freeWeights.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl"
                      >
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-sm font-semibold text-slate-900">
                              {item.name}
                            </h3>
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                              {item.brand}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-600">
                            {item.count && (
                              <span className="flex items-center gap-1">
                                <span className="font-bold text-purple-600">{item.count}</span>
                                <span>台設置</span>
                              </span>
                            )}
                            {item.range && <span>{item.range}</span>}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab Content - Machines */}
              {activeTab === 'machines' && (
                <div className="space-y-3 mb-5">
                  {gymData.machines.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <p>マシン情報が登録されていません</p>
                      <p className="text-xs mt-2">gymId: {gymId}</p>
                    </div>
                  ) : (
                    gymData.machines.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl"
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-sm font-semibold text-slate-900">
                              {item.name}
                            </h3>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                              {item.brand}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-600">
                            <span className="flex items-center gap-1">
                              <span className="font-bold text-blue-600">{item.count}</span>
                              <span>台設置</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab Content - Facilities */}
              {activeTab === 'facilities' && (
                <div className="space-y-3 mb-5">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: '24hours', name: '24時間営業', available: gymData.facilities['24hours'] },
                      { key: 'shower', name: 'シャワー', available: gymData.facilities.shower },
                      { key: 'parking', name: '駐車場', available: gymData.facilities.parking },
                      { key: 'locker', name: 'ロッカー', available: gymData.facilities.locker },
                      { key: 'wifi', name: 'Wi-Fi', available: gymData.facilities.wifi },
                      { key: 'chalk', name: 'チョーク利用可', available: gymData.facilities.chalk },
                      { key: 'belt_rental', name: 'ベルト貸出', available: gymData.facilities.belt_rental },
                      { key: 'personal_training', name: 'パーソナル', available: gymData.facilities.personal_training },
                      { key: 'group_lesson', name: 'グループレッスン', available: gymData.facilities.group_lesson },
                      { key: 'studio', name: 'スタジオ', available: gymData.facilities.studio },
                      { key: 'sauna', name: 'サウナ', available: gymData.facilities.sauna },
                      { key: 'pool', name: 'プール', available: gymData.facilities.pool },
                      { key: 'jacuzzi', name: 'ジャグジー', available: gymData.facilities.jacuzzi },
                      { key: 'massage_chair', name: 'マッサージチェア', available: gymData.facilities.massage_chair },
                      { key: 'cafe', name: 'カフェ/売店', available: gymData.facilities.cafe },
                      { key: 'women_only', name: '女性専用エリア', available: gymData.facilities.women_only },
                      { key: 'barrier_free', name: 'バリアフリー', available: gymData.facilities.barrier_free },
                      { key: 'kids_room', name: 'キッズルーム', available: gymData.facilities.kids_room },
                      { key: 'english_support', name: '英語対応', available: gymData.facilities.english_support },
                      { key: 'drop_in', name: 'ドロップイン', available: gymData.facilities.drop_in },
                    ].map((facility) => (
                      <div
                        key={facility.key}
                        className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl"
                      >
                        <span className="text-sm font-medium text-slate-900">{facility.name}</span>
                        <span className={`text-lg font-bold px-3 py-1 rounded-full ${
                          facility.available
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {facility.available ? '○' : '×'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ジムオーナー詳細情報 */}
              <div className="mb-5">
                <GymDetailedInfoDisplay gymId={gymId} />
              </div>

              {/* Contact */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-5">
                <h2 className="text-lg font-bold text-slate-900 mb-3">アクセス・お問い合わせ</h2>
                <div className="space-y-2">
                  <a 
                    href={`tel:${gymData.contact.phone}`}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-shadow"
                  >
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{gymData.contact.phone}</p>
                      <p className="text-xs text-slate-600">電話で問い合わせ</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </a>
                  <a 
                    href={gymData.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-shadow"
                  >
                    <Globe className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">公式サイト</p>
                      <p className="text-xs text-slate-600">詳細情報を見る</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </a>
                </div>
              </div>


              {/* Reviews */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-3">口コミ・レビュー</h2>
                <div className="space-y-3">
                  {gymData.reviews.map((review, index) => (
                    <div key={index} className="p-3 bg-white border border-slate-200 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">{review.author}</p>
                          <p className="text-xs text-slate-600">
                            {new Date(review.date).toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        {/* 個別レビューの星評価は非表示 */}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{review.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
