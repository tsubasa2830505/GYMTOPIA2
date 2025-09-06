'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  MapPin, Clock, Heart, Phone, Globe, ChevronLeft, 
  Share2, Users, Dumbbell, Building, Activity, MessageSquare,
  Star, ChevronRight
} from 'lucide-react'
// import Image from 'next/image'

// サンプルデータ
const gymData = {
  id: 'gym_rogue_shinjuku',
  name: 'ROGUEクロストレーニング新宿',
  tags: ['ROGUE', 'クロスフィット', 'チョークOK'],
  location: { area: '新宿', walkingMinutes: 7, lat: 35.0, lng: 139.0 },
  businessHours: [{ open: '05:00', close: '24:00', days: [0, 1, 2, 3, 4, 5, 6] }],
  isOpenNow: true,
  likesCount: 94,
  likedByMe: false,
  pricingPlans: [
    { id: 'monthly', title: '月額会員', priceJPY: 14800, link: 'https://example.com/monthly' },
    { id: 'visitor', title: 'ビジター利用', priceJPY: 3800, link: 'https://example.com/visitor' }
  ],
  equipment: [
    { name: 'RML-490 パワーラック', brand: 'ROGUE', count: 6, condition: '優良' },
    { name: 'SML-2 スクワットラック', brand: 'ROGUE', count: 4, condition: '優良' },
    { name: 'オハイオバー（オリンピックバー）', brand: 'ROGUE', count: 8, condition: '優良' },
    { name: 'オリンピックプレートセット', brand: 'Eleiko', count: 1, condition: '優良' },
    { name: 'アジャスタブルベンチ', brand: 'ROGUE', count: 4, condition: '優良' }
  ],
  contact: { phone: '03-1234-5678', website: 'https://example.com' },
  reviews: [
    { author: '筋トレ愛好家', date: '2024-01-15', body: 'ROGUEのパワーラックが6台もあって最高です！混雑時でも待ち時間が少なく、効率的にトレーニングできます。' },
    { author: 'ベンチプレスサー', date: '2024-01-10', body: 'Hammer Strengthのマシンが充実していて、フリーウェイトエリアも広々。初心者から上級者まで満足できるジムです。' }
  ],
  assets: { heroImages: ['/gym-hero.jpg'] }
}

export default function GymDetailPage() {
  // const params = useParams() // 未使用のため一時的にコメントアウト
  const router = useRouter()
  const [liked, setLiked] = useState(gymData.likedByMe)
  const [likesCount, setLikesCount] = useState(gymData.likesCount)
  const [activeTab, setActiveTab] = useState('equipment')

  const handleToggleLike = () => {
    setLiked(!liked)
    setLikesCount(liked ? likesCount - 1 : likesCount + 1)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price)
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case '優良': return 'text-green-600 bg-green-50'
      case '良好': return 'text-blue-600 bg-blue-50'
      case '可': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-white pb-20 sm:pb-0">
      {/* Header with Hero Image */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-br from-blue-500 to-purple-600">
        <button 
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg z-10"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900" />
        </button>
        <button className="absolute top-4 right-4 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg z-10">
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 -mt-8 sm:-mt-12 relative">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
          {gymData.tags.map((tag) => (
            <span 
              key={tag}
              className="px-3 py-1 sm:px-4 sm:py-1.5 bg-white rounded-full text-xs sm:text-sm font-medium text-slate-700 shadow-md"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 sm:mb-6">
          {gymData.name}
        </h1>

        {/* Info Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 p-3 sm:p-4 bg-slate-50 rounded-2xl">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
            <div>
              <p className="text-sm sm:text-base font-semibold text-slate-900">{gymData.location.area}</p>
              <p className="text-xs sm:text-sm text-slate-600">徒歩{gymData.location.walkingMinutes}分</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 sm:p-4 bg-slate-50 rounded-2xl">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
            <div>
              <p className="text-sm sm:text-base font-semibold text-slate-900">
                {gymData.businessHours[0].open}–{gymData.businessHours[0].close}
              </p>
              <p className={`text-xs sm:text-sm font-medium ${gymData.isOpenNow ? 'text-green-600' : 'text-red-600'}`}>
                {gymData.isOpenNow ? '営業中' : '営業時間外'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 sm:p-4 bg-slate-50 rounded-2xl">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
            <div>
              <p className="text-sm sm:text-base font-semibold text-slate-900">{likesCount}人</p>
              <p className="text-xs sm:text-sm text-slate-600">イキタイ</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={handleToggleLike}
            className={`flex items-center justify-center gap-2 py-3 sm:py-4 rounded-2xl font-medium transition-all ${
              liked 
                ? 'bg-red-500 text-white' 
                : 'bg-white border-2 border-slate-200 text-slate-900'
            }`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-white' : ''}`} />
            <span className="text-sm sm:text-base">{liked ? 'イキタイ済み' : 'イキタイ'}</span>
          </button>
          <button 
            onClick={() => router.push(`/posts/new?gymId=${gymData.id}`)}
            className="flex items-center justify-center gap-2 py-3 sm:py-4 bg-blue-500 text-white rounded-2xl font-medium"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm sm:text-base">ジム活を投稿</span>
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {gymData.pricingPlans.map((plan) => (
            <a
              key={plan.id}
              href={plan.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl hover:shadow-lg transition-shadow"
            >
              <p className="text-sm sm:text-base font-medium text-slate-700 mb-2">{plan.title}</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                {formatPrice(plan.priceJPY)}
              </p>
              <div className="flex items-center justify-end mt-3">
                <span className="text-xs sm:text-sm text-blue-600 font-medium">詳細を見る</span>
                <ChevronRight className="w-4 h-4 text-blue-600 ml-1" />
              </div>
            </a>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl mb-4 sm:mb-6 overflow-x-auto">
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
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600'
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
            {gymData.equipment.map((item, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-2xl"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                      {item.name}
                    </h3>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                      {item.brand}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600">
                    <span>{item.count}台設置</span>
                    <span>•</span>
                    <span className={`px-2 py-0.5 rounded-lg font-medium ${getConditionColor(item.condition)}`}>
                      状態: {item.condition}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact */}
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">アクセス・お問い合わせ</h2>
          <div className="space-y-3">
            <a 
              href={`tel:${gymData.contact.phone}`}
              className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-shadow"
            >
              <Phone className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm sm:text-base font-medium text-slate-900">{gymData.contact.phone}</p>
                <p className="text-xs sm:text-sm text-slate-600">電話で問い合わせ</p>
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
                <p className="text-sm sm:text-base font-medium text-slate-900">公式サイト</p>
                <p className="text-xs sm:text-sm text-slate-600">詳細情報を見る</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Reviews */}
        <div className="mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">口コミ・レビュー</h2>
          <div className="space-y-3">
            {gymData.reviews.map((review, index) => (
              <div key={index} className="p-4 bg-white border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full" />
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
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{review.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}