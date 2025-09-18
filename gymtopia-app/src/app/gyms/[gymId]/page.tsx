'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  MapPin, Clock, Heart, Phone, Globe, ChevronLeft,
  Share2, Users, Dumbbell, Building, Activity, MessageSquare,
  Star, ChevronRight
} from 'lucide-react'
import dynamic from 'next/dynamic'
// import Image from 'next/image'

// Dynamic import Leaflet to avoid SSR issues
const LeafletMap = dynamic(() => import('@/components/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[rgba(254,255,250,0.95)]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--gt-primary)] mx-auto mb-4"></div>
        <p className="text-[color:var(--text-subtle)]">地図を読み込み中...</p>
      </div>
    </div>
  )
})

// フォールバックデータ（DBにジムが見つからない場合のエラー表示用）
const fallbackGym = {
  id: '',
  name: 'ジム情報を読み込めませんでした',
  tags: [],
  location: { area: '', walkingMinutes: 0, lat: 0, lng: 0 },
  businessHours: [{ open: '', close: '', days: [] }],
  isOpenNow: false,
  likesCount: 0,
  likedByMe: false,
  pricingPlans: [],
  equipment: [],
  contact: { phone: '', website: '' },
  reviews: [],
  assets: { heroImages: [] }
}

import { getGymById, getGymMachines, getGymReviews, getGymReviewCount } from '@/lib/supabase/gyms'

export default function GymDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [gym, setGym] = useState<any | null>(null)
  const [machines, setMachines] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewCount, setReviewCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const gymData = useMemo(() => {
    if (!gym) return fallbackGym

    // DBのデータ構造を画面表示用に変換
    return {
      id: gym.id,
      name: gym.name || 'ジム名未設定',
      tags: gym.tags || [],
      location: {
        area: gym.area || gym.city || '',
        walkingMinutes: gym.walk_time || 0,
        lat: gym.latitude || 0,
        lng: gym.longitude || 0
      },
      businessHours: gym.business_hours ? [{
        open: gym.business_hours.weekdays?.split('-')[0] || '',
        close: gym.business_hours.weekdays?.split('-')[1] || '',
        days: [0, 1, 2, 3, 4, 5, 6]
      }] : [],
      isOpenNow: gym.is_open_now || false,
      likesCount: gym.likes_count || 0,
      likedByMe: false,
      pricingPlans: gym.pricing_plans || [],
      equipment: gym.equipment || [],
      contact: {
        phone: gym.phone || '',
        website: gym.website || ''
      },
      reviews: [],
      assets: { heroImages: gym.images || [] }
    }
  }, [gym])

  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [activeTab, setActiveTab] = useState('equipment')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const id = Array.isArray(params?.gymId) ? params.gymId[0] : (params as any)?.gymId
        if (id) {
          const [gymRes, gm, reviewsData, count] = await Promise.all([
            getGymById(id),
            getGymMachines(id),
            getGymReviews(id),
            getGymReviewCount(id)
          ])
          if (gymRes) setGym(gymRes)
          if (Array.isArray(gm)) setMachines(gm)
          if (Array.isArray(reviewsData)) setReviews(reviewsData)
          setReviewCount(count)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleToggleLike = () => {
    setLiked(!liked)
    setLikesCount(liked ? likesCount - 1 : likesCount + 1)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price)
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case '優良': return 'text-[var(--gt-secondary-strong)] bg-[rgba(31,143,106,0.12)]'
      case '良好': return 'text-[color:var(--gt-secondary-strong)] bg-[rgba(231,103,76,0.08)]'
      case '可': return 'text-[color:var(--gt-tertiary-strong)] bg-[rgba(242,178,74,0.12)]'
      default: return 'text-[color:var(--text-subtle)] bg-[rgba(254,255,250,0.96)]'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[color:var(--text-muted)]">
        読み込み中...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-20 sm:pb-0">
      {/* Header with Hero Image */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-br from-[var(--gt-primary)] to-[var(--gt-secondary)]">
        <button 
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg z-10"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[color:var(--foreground)]" />
        </button>
        <button className="absolute top-4 right-4 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg z-10">
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-[color:var(--foreground)]" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 -mt-8 sm:-mt-12 relative">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
          {gymData.tags.map((tag: string) => (
            <span 
              key={tag}
              className="px-3 py-1 sm:px-4 sm:py-1.5 bg-white rounded-full text-xs sm:text-sm font-medium text-[color:var(--text-subtle)] shadow-md"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[color:var(--foreground)] mb-4 sm:mb-6">
          {gymData.name}
        </h1>

        {/* Info Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 p-3 sm:p-4 bg-[rgba(254,255,250,0.97)] rounded-2xl">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[color:var(--text-muted)]" />
            <div>
              <p className="text-sm sm:text-base font-semibold text-[color:var(--foreground)]">{gymData.location.area}</p>
              <p className="text-xs sm:text-sm text-[color:var(--text-muted)]">徒歩{gymData.location.walkingMinutes}分</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 sm:p-4 bg-[rgba(254,255,250,0.97)] rounded-2xl">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[color:var(--text-muted)]" />
            <div>
              <p className="text-sm sm:text-base font-semibold text-[color:var(--foreground)]">
                {gymData.businessHours && gymData.businessHours.length > 0
                  ? `${gymData.businessHours[0].open}–${gymData.businessHours[0].close}`
                  : '営業時間情報なし'}
              </p>
              <p className={`text-xs sm:text-sm font-medium ${gymData.isOpenNow ? 'text-[var(--gt-secondary-strong)]' : 'text-[color:var(--gt-primary-strong)]'}`}>
                {gymData.businessHours && gymData.businessHours.length > 0
                  ? (gymData.isOpenNow ? '営業中' : '営業時間外')
                  : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 sm:p-4 bg-[rgba(254,255,250,0.97)] rounded-2xl">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[color:var(--text-muted)]" />
            <div>
              <p className="text-sm sm:text-base font-semibold text-[color:var(--foreground)]">{likesCount}人</p>
              <p className="text-xs sm:text-sm text-[color:var(--text-muted)]">イキタイ</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={handleToggleLike}
            className={`flex items-center justify-center gap-2 py-3 sm:py-4 rounded-2xl font-medium transition-all ${
              liked 
                ? 'bg-[rgba(224,112,122,0.12)] text-white' 
                : 'bg-white border-2 border-[rgba(186,122,103,0.26)] text-[color:var(--foreground)]'
            }`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-white' : ''}`} />
            <span className="text-sm sm:text-base">{liked ? 'イキタイ済み' : 'イキタイ'}</span>
          </button>
          <button 
            onClick={() => router.push(`/posts/new?gymId=${gymData.id}`)}
            className="flex items-center justify-center gap-2 py-3 sm:py-4 bg-[color:var(--gt-primary)] text-white rounded-2xl font-medium"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm sm:text-base">ジム活を投稿</span>
          </button>
        </div>

        {/* Pricing Cards */}
        {gymData.pricingPlans && gymData.pricingPlans.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {gymData.pricingPlans.map((plan: { id: string; title: string; priceJPY: number; link?: string }) => (
              <div
                key={plan.id}
                className="block p-4 sm:p-5 bg-gradient-to-br from-[rgba(231,103,76,0.08)] to-[rgba(240,142,111,0.1)] rounded-2xl"
              >
                <p className="text-sm sm:text-base font-medium text-[color:var(--text-subtle)] mb-2">{plan.title}</p>
                <p className="text-2xl sm:text-3xl font-bold text-[color:var(--foreground)]">
                  {formatPrice(plan.priceJPY)}
                </p>
                {plan.link && (
                  <a
                    href={plan.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-end mt-3"
                  >
                    <span className="text-xs sm:text-sm text-[color:var(--gt-secondary-strong)] font-medium">詳細を見る</span>
                    <ChevronRight className="w-4 h-4 text-[color:var(--gt-secondary-strong)] ml-1" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[rgba(254,255,250,0.95)] rounded-2xl mb-4 sm:mb-6 overflow-x-auto">
          {[
            { id: 'equipment', label: '設備', icon: Dumbbell },
            { id: 'muscle', label: 'アクセス', icon: Activity },
            { id: 'facility', label: '施設', icon: Building },
            { id: 'crowding', label: '混雑', icon: Users },
            { id: 'posts', label: 'ジム活', icon: MessageSquare }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[80px] flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-[color:var(--gt-secondary-strong)] shadow-sm'
                  : 'text-[color:var(--text-muted)]'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content - Equipment */}
        {activeTab === 'equipment' && (
          <div className="space-y-3 mb-6 sm:mb-8">
            {machines.length > 0 ? (
              machines.map((gm: any) => (
                <div key={gm.id} className="flex items-start gap-3 p-4 bg-white border border-[rgba(186,122,103,0.26)] rounded-2xl">
                  <div className="w-2 h-2 bg-[color:var(--gt-primary)] rounded-full mt-2" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm sm:text-base font-semibold text-[color:var(--foreground)]">
                        {gm.machine?.name || 'マシン'}
                      </h3>
                      <span className="px-2 py-0.5 bg-[rgba(240,142,111,0.14)] text-[color:var(--gt-secondary-strong)] rounded-lg text-xs font-medium">
                        {gm.machine?.maker}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-[color:var(--text-muted)]">
                      <span>{gm.quantity || 1}台設置</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded-lg font-medium text-[color:var(--gt-secondary-strong)] bg-[rgba(231,103,76,0.08)]">
                        {gm.machine?.target_category}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-[color:var(--text-muted)]">設備情報がありません</div>
            )}
          </div>
        )}

        {/* Map Section */}
        {activeTab === 'muscle' && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-[color:var(--foreground)] mb-4">アクセス</h2>
            {gym?.latitude && gym?.longitude ? (
              <div className="rounded-2xl overflow-hidden" style={{ height: '400px' }}>
                <LeafletMap
                  gyms={[gym]}
                  center={{ lat: gym.latitude, lng: gym.longitude }}
                  zoom={16}
                  className="w-full h-full"
                  mapId={`gym-detail-${gym.id}`}
                />
              </div>
            ) : (
              <div className="p-8 bg-[rgba(254,255,250,0.96)] rounded-2xl text-center">
                <MapPin className="w-12 h-12 text-[rgba(231,103,76,0.32)] mx-auto mb-3" />
                <p className="text-[color:var(--text-subtle)]">位置情報が登録されていません</p>
              </div>
            )}
            {gym?.address && (
              <div className="mt-4 p-4 bg-white border border-[rgba(186,122,103,0.26)] rounded-2xl">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[color:var(--gt-secondary-strong)] mt-1" />
                  <div>
                    <p className="font-medium text-[color:var(--foreground)]">{gym.address}</p>
                    {gymData.location.walkingMinutes > 0 && (
                      <p className="text-sm text-[color:var(--text-muted)] mt-1">
                        最寄り駅から徒歩約 {gymData.location.walkingMinutes}分
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contact */}
        <div className="bg-[rgba(254,255,250,0.97)] rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-[color:var(--foreground)] mb-4">お問い合わせ</h2>
          <div className="space-y-3">
            {gymData.contact.phone && (
              <a
                href={`tel:${gymData.contact.phone}`}
                className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-shadow"
              >
                <Phone className="w-5 h-5 text-[color:var(--gt-secondary-strong)]" />
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-medium text-[color:var(--foreground)]">{gymData.contact.phone}</p>
                  <p className="text-xs sm:text-sm text-[color:var(--text-muted)]">電話で問い合わせ</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[rgba(68,73,73,0.6)]" />
              </a>
            )}
            {gymData.contact.website && (
              <a
                href={gymData.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-shadow"
              >
                <Globe className="w-5 h-5 text-[color:var(--gt-secondary-strong)]" />
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-medium text-[color:var(--foreground)]">公式サイト</p>
                  <p className="text-xs sm:text-sm text-[color:var(--text-muted)]">詳細情報を見る</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[rgba(68,73,73,0.6)]" />
              </a>
            )}
            {!gymData.contact.phone && !gymData.contact.website && (
              <div className="p-4 text-center text-[color:var(--text-muted)]">
                連絡先情報が登録されていません
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-[color:var(--foreground)] mb-4">
            口コミ・レビュー {reviewCount > 0 && `(${reviewCount}件)`}
          </h2>
          <div className="space-y-3">
            {reviews.length > 0 ? reviews.map((review: any) => (
              <div key={review.id} className="p-4 bg-white border border-[rgba(186,122,103,0.26)] rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  {review.user?.avatar_url ? (
                    <img
                      src={review.user.avatar_url}
                      alt={review.user.display_name || 'User'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--gt-secondary)] to-[var(--gt-primary)] rounded-full" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[color:var(--foreground)]">
                      {review.user?.display_name || review.user?.username || 'ユーザー'}
                    </p>
                    <p className="text-xs text-[color:var(--text-muted)]">
                      {new Date(review.created_at).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (review.rating || 5)
                            ? 'fill-[color:var(--gt-tertiary)] text-[color:var(--gt-tertiary)]'
                            : 'fill-[rgba(186,122,103,0.18)] text-[rgba(68,73,73,0.28)]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {review.title && (
                  <h4 className="text-sm font-semibold text-[color:var(--foreground)] mb-2">{review.title}</h4>
                )}
                <p className="text-sm text-[color:var(--text-subtle)] leading-relaxed">{review.content || review.body || ''}</p>
                {review.owner_reply && (
                  <div className="mt-3 p-3 bg-[rgba(254,255,250,0.97)] rounded-xl">
                    <p className="text-xs font-semibold text-[color:var(--text-subtle)] mb-1">オーナーからの返信</p>
                    <p className="text-xs text-[color:var(--text-muted)]">{review.owner_reply}</p>
                  </div>
                )}
              </div>
            )) : (
              <div className="p-8 text-center text-[color:var(--text-muted)]">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-[rgba(68,73,73,0.4)]" />
                <p>まだレビューがありません</p>
                <p className="text-sm mt-2">最初のレビューを投稿してみましょう！</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
