'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin, Star, Users, Heart, Clock, Phone, Globe, Instagram, Twitter, MessageSquare } from 'lucide-react'
import Header from '@/components/Header'
import { enrichGymWithStationInfo } from '@/lib/utils/distance'
import { getGymDetail, checkFavoriteStatus, toggleFavorite } from '@/lib/supabase/gym-detail'
import { getCurrentUser } from '@/lib/supabase/auth'

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

export default function GymDetailPage() {
  const params = useParams()
  const router = useRouter()
  const gymId = params.id as string
  const [gymDetail, setGymDetail] = useState<GymDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  // 駅からの距離情報を計算
  const stationInfo = useMemo(() => {
    if (!gymDetail) return null
    return enrichGymWithStationInfo({
      address: gymDetail.address,
      latitude: typeof gymDetail.latitude === 'number' ? gymDetail.latitude : parseFloat(gymDetail.latitude || '0'),
      longitude: typeof gymDetail.longitude === 'number' ? gymDetail.longitude : parseFloat(gymDetail.longitude || '0')
    })
  }, [gymDetail])

  // 認証状態を確認
  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setIsLoadingUser(false)
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    async function fetchGymDetail() {
      try {
        // データベースからジムデータを取得
        const { data, error } = await getGymDetail(gymId)

        if (error || !data) {
          console.log('Database fetch failed for gym ID:', gymId)
          // データが見つからない場合はnullのまま（404扱い）
          setGymDetail(null)
        } else {
          // データベースから正常に取得できた場合
          setGymDetail(data)
        }

        // お気に入り状態を確認（ログインユーザーのみ）
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
    if (!user || isLoadingUser) {
      // ユーザー情報が読み込み中、またはログインしていない場合は何もしない
      console.log('User not authenticated or still loading')
      return
    }

    // 楽観的更新
    setIsFavorite(!isFavorite)

    // データベースを更新
    const { success } = await toggleFavorite(gymId, user.id, isFavorite)

    if (!success) {
      // 失敗した場合は元に戻す
      setIsFavorite(isFavorite)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[color:var(--background)]">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-64 bg-[rgba(254,255,250,0.9)] rounded-lg mb-4"></div>
            <div className="h-8 bg-[rgba(254,255,250,0.9)] rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-[rgba(254,255,250,0.9)] rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!gymDetail) {
    return (
      <div className="min-h-screen bg-[color:var(--background)]">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-[color:var(--foreground)] mb-4">ジムが見つかりません</h1>
          <p className="text-[color:var(--text-muted)] mb-8">指定されたジムは存在しないか、削除された可能性があります。</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[color:var(--gt-primary)] text-white rounded-lg hover:bg-[color:var(--gt-primary-strong)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[color:var(--background)]">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-[color:var(--text-muted)] hover:text-[color:var(--foreground)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            戻る
          </button>
        </div>

        {/* Hero Image */}
        <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden mb-8">
          <Image
            src={gymDetail.image_url}
            alt={gymDetail.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />

          {/* Favorite Button */}
          {user && (
            <button
              onClick={handleFavoriteToggle}
              className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isFavorite
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 text-gray-600 hover:bg-white'
              }`}
            >
              <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Title & Rating */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[color:var(--foreground)] mb-2">
                {gymDetail.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-[color:var(--text-muted)]">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{gymDetail.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{gymDetail.users_count}人が利用</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{gymDetail.prefecture} {gymDetail.city}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[color:var(--foreground)] mb-3">
                ジムについて
              </h2>
              <p className="text-[color:var(--text-subtle)] leading-relaxed">
                {gymDetail.description}
              </p>
            </div>

            {/* Equipment */}
            {gymDetail.equipment && gymDetail.equipment.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[color:var(--foreground)] mb-3">
                  設備・器具
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {gymDetail.equipment.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[rgba(186,122,103,0.26)]"
                    >
                      <div className="w-2 h-2 bg-[color:var(--gt-primary)] rounded-full"></div>
                      <span className="text-[color:var(--foreground)]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {gymDetail.amenities && gymDetail.amenities.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[color:var(--foreground)] mb-3">
                  アメニティ・サービス
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {gymDetail.amenities.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[rgba(186,122,103,0.26)]"
                    >
                      <div className="w-2 h-2 bg-[color:var(--gt-secondary)] rounded-full"></div>
                      <span className="text-[color:var(--foreground)]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 口コミ・レビュー（ジム活フィード） */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[color:var(--foreground)]">
                  口コミ・レビュー
                </h2>
                <Link
                  href={`/gyms/${gymId}/feed`}
                  className="text-sm text-[color:var(--gt-primary)] hover:text-[color:var(--gt-primary-strong)] transition-colors font-medium"
                >
                  すべて見る →
                </Link>
              </div>

              <div className="bg-white rounded-xl border border-[rgba(186,122,103,0.26)] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-5 h-5 text-[color:var(--gt-primary)]" />
                  <h3 className="font-semibold text-[color:var(--foreground)]">
                    利用者のジム活レポート
                  </h3>
                </div>

                <p className="text-sm text-[color:var(--text-subtle)] mb-4">
                  このジムを利用した方々の実際のトレーニング体験やレビューをご覧いただけます。
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-[color:var(--text-muted)]">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>リアルな利用者の声</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      <span>トレーニング詳細</span>
                    </div>
                  </div>

                  <Link
                    href={`/gyms/${gymId}/feed`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[color:var(--gt-primary)] text-white rounded-lg hover:bg-[color:var(--gt-primary-strong)] transition-colors text-sm font-medium"
                  >
                    <MessageSquare className="w-4 h-4" />
                    ジム活を見る
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Info Card */}
              <div className="bg-white rounded-2xl border border-[rgba(186,122,103,0.26)] p-6 mb-6">
                <h3 className="text-lg font-semibold text-[color:var(--foreground)] mb-4">
                  基本情報
                </h3>

                <div className="space-y-4">
                  {/* Hours */}
                  {(gymDetail.opening_hours || gymDetail.business_hours) && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-[color:var(--gt-primary)] mt-0.5" />
                      <div>
                        <div className="font-medium text-[color:var(--foreground)]">営業時間</div>
                        <div className="text-sm text-[color:var(--text-muted)]">
                          {gymDetail.opening_hours || JSON.stringify(gymDetail.business_hours)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[color:var(--gt-primary)] mt-0.5" />
                    <div>
                      <div className="font-medium text-[color:var(--foreground)]">住所</div>
                      <div className="text-sm text-[color:var(--text-muted)]">
                        {gymDetail.address}
                      </div>
                      {stationInfo && (
                        <div className="text-xs text-[color:var(--gt-secondary)] mt-1">
                          {stationInfo.nearestStation.name}駅から{stationInfo.distanceFromStation}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Phone */}
                  {gymDetail.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-[color:var(--gt-primary)] mt-0.5" />
                      <div>
                        <div className="font-medium text-[color:var(--foreground)]">電話番号</div>
                        <div className="text-sm text-[color:var(--text-muted)]">
                          {gymDetail.phone}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Website */}
                  {gymDetail.website && (
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-[color:var(--gt-primary)] mt-0.5" />
                      <div>
                        <div className="font-medium text-[color:var(--foreground)]">ウェブサイト</div>
                        <a
                          href={gymDetail.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[color:var(--gt-primary)] hover:underline"
                        >
                          公式サイトを見る
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Social Media */}
                  {(gymDetail.instagram || gymDetail.twitter) && (
                    <div className="border-t border-[rgba(186,122,103,0.26)] pt-4">
                      <div className="font-medium text-[color:var(--foreground)] mb-2">SNS</div>
                      <div className="flex gap-3">
                        {gymDetail.instagram && (
                          <a
                            href={`https://instagram.com/${gymDetail.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-[color:var(--gt-primary)] hover:underline"
                          >
                            <Instagram className="w-4 h-4" />
                            Instagram
                          </a>
                        )}
                        {gymDetail.twitter && (
                          <a
                            href={`https://twitter.com/${gymDetail.twitter.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-[color:var(--gt-primary)] hover:underline"
                          >
                            <Twitter className="w-4 h-4" />
                            Twitter
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing */}
              {gymDetail.membership_fee && (
                <div className="bg-white rounded-2xl border border-[rgba(186,122,103,0.26)] p-6">
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)] mb-4">
                    料金プラン
                  </h3>

                  <div className="space-y-3">
                    {gymDetail.membership_fee.monthly && (
                      <div className="flex justify-between items-center">
                        <span className="text-[color:var(--text-subtle)]">月会費</span>
                        <span className="font-semibold text-[color:var(--foreground)]">
                          {gymDetail.membership_fee.monthly}
                        </span>
                      </div>
                    )}
                    {gymDetail.membership_fee.daily && (
                      <div className="flex justify-between items-center">
                        <span className="text-[color:var(--text-subtle)]">ビジター料金</span>
                        <span className="font-semibold text-[color:var(--foreground)]">
                          {gymDetail.membership_fee.daily}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}