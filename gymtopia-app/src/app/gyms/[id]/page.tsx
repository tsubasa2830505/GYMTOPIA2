'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin, Star, Users, Heart, Clock, Phone, Globe, Instagram, Twitter } from 'lucide-react'
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
          'gym-1': {
            id: 'gym-1',
            name: 'ゴールドジム渋谷',
            description: '本格的なトレーニング設備が充実した、日本最大級のフィットネスジム。初心者から上級者まで、すべてのトレーニーのニーズに応える設備とサービスを提供しています。',
            prefecture: '東京都',
            city: '渋谷区',
            address: '東京都渋谷区渋谷1-23-16 ココチビル4F',
            latitude: 35.659025,
            longitude: 139.703473,
            image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=600&fit=crop&q=80',
            rating: 4.5,
            users_count: 523,
            opening_hours: '平日 7:00-23:00 / 土日祝 9:00-20:00',
            phone: '03-1234-5678',
            website: 'https://www.goldsgym.jp/shop/13120',
            instagram: '@goldsgym_shibuya',
            twitter: '@goldsgym_shibuya',
            equipment: ['パワーラック', 'スミスマシン', 'ダンベル(1kg~50kg)', 'ケーブルマシン', 'レッグプレス', 'チェストプレス'],
            amenities: ['シャワールーム', 'ロッカー', 'プロテインバー', 'パーソナルトレーニング', '駐車場'],
            membership_fee: {
              monthly: '¥11,000',
              daily: '¥2,750'
            }
          },
          'gym-2': {
            id: 'gym-2',
            name: 'エニタイムフィットネス新宿',
            description: '24時間365日営業で、いつでもトレーニング可能。世界中のエニタイムフィットネスが利用できるグローバルパスポート付き。',
            prefecture: '東京都',
            city: '新宿区',
            address: '東京都新宿区西新宿1-10-1 新宿ビル2F',
            latitude: 35.689634,
            longitude: 139.700566,
            image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop&q=80',
            rating: 4.2,
            users_count: 412,
            opening_hours: '24時間営業',
            phone: '03-9876-5432',
            website: 'https://www.anytimefitness.co.jp/shinjuku/',
            instagram: '@anytime_shinjuku',
            equipment: ['フリーウェイトエリア', 'マシンエリア', 'カーディオエリア', 'ストレッチエリア'],
            amenities: ['シャワールーム', 'セキュリティ完備', '更衣室', 'AED設置'],
            membership_fee: {
              monthly: '¥8,800'
            }
          },
          'gym-3': {
            id: 'gym-3',
            name: 'コナミスポーツクラブ池袋',
            description: 'プール・スタジオ・ジムが完備された総合スポーツクラブ。多彩なプログラムで、楽しみながら健康的な体づくりをサポート。',
            prefecture: '東京都',
            city: '豊島区',
            address: '東京都豊島区東池袋3-1-4 サンシャインシティ文化会館5F',
            latitude: 35.729503,
            longitude: 139.719874,
            image_url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1200&h=600&fit=crop&q=80',
            rating: 4.3,
            users_count: 342,
            opening_hours: '平日 9:00-23:00 / 土 9:00-22:00 / 日祝 9:00-20:00',
            phone: '03-5555-1234',
            website: 'https://www.konami.com/sportsclub/ikebukuro/',
            twitter: '@konami_ikebukuro',
            equipment: ['最新マシン完備', 'プール(25m×6レーン)', 'スタジオ3面', 'サウナ・ジャグジー'],
            amenities: ['温浴施設', 'パウダールーム', 'ラウンジ', 'キッズスクール', '無料駐車場'],
            membership_fee: {
              monthly: '¥13,200',
              daily: '¥2,640'
            }
          },
          'gym-4': {
            id: 'gym-4',
            name: 'JOYFIT24四谷三丁目',
            description: '24時間年中無休のフィットネスジム。充実のマシンラインナップと、セキュリティ完備で女性も安心してトレーニングできる環境を提供。四谷三丁目駅から徒歩1分の好立地。',
            prefecture: '東京都',
            city: '新宿区',
            address: '東京都新宿区四谷3-5-1 四谷三丁目ビル3F',
            latitude: 35.688437,
            longitude: 139.720523,
            image_url: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=1200&h=600&fit=crop&q=80',
            rating: 4.4,
            users_count: 387,
            opening_hours: '24時間営業',
            phone: '03-6380-5678',
            website: 'https://joyfit.jp/yotsuya/',
            instagram: '@joyfit24_yotsuya',
            equipment: ['パワーラック', 'スミスマシン', 'ダンベル(1kg~40kg)', 'ケーブルマシン', '有酸素マシン30台以上'],
            amenities: ['シャワールーム', '個室更衣室', '契約ロッカー', '水素水サーバー', 'セキュリティカード'],
            membership_fee: {
              monthly: '¥7,920',
              daily: '¥2,200'
            }
          },
          'gym-5': {
            id: 'gym-5',
            name: 'カーブス四谷',
            description: '女性専用の30分フィットネス。予約不要で気軽に通える、筋トレと有酸素運動を組み合わせた効率的なサーキットトレーニングを提供。',
            prefecture: '東京都',
            city: '新宿区',
            address: '東京都新宿区四谷1-8-14 四谷一丁目ビル2F',
            latitude: 35.686854,
            longitude: 139.729476,
            image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&h=600&fit=crop&q=80',
            rating: 4.6,
            users_count: 256,
            opening_hours: '平日 10:00-19:00 / 土 10:00-13:00 / 日祝休み',
            phone: '03-3355-7890',
            website: 'https://www.curves.co.jp/search/kanto/tokyo/yotsuya/',
            equipment: ['油圧式マシン12台', 'ストレッチエリア', 'ステップボード'],
            amenities: ['更衣室', '血圧計', '体組成計', 'AED設置', '女性スタッフ常駐'],
            membership_fee: {
              monthly: '¥6,270'
            }
          },
          'gym-6': {
            id: 'gym-6',
            name: 'ティップネス四谷',
            description: 'プール・スタジオ・ジムを完備した総合フィットネスクラブ。ヨガ、ピラティス、ダンスなど豊富なスタジオプログラムが魅力。四谷駅直結でアクセス抜群。',
            prefecture: '東京都',
            city: '新宿区',
            address: '東京都新宿区四谷1-6-1 コモレ四谷 4F',
            latitude: 35.685693,
            longitude: 139.730234,
            image_url: 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=1200&h=600&fit=crop&q=80',
            rating: 4.3,
            users_count: 498,
            opening_hours: '平日 7:00-23:00 / 土 9:00-22:00 / 日祝 9:00-20:00',
            phone: '03-5360-2345',
            website: 'https://www.tipness.co.jp/shop/yotsuya/',
            twitter: '@tipness_yotsuya',
            instagram: '@tipness_yotsuya',
            equipment: ['最新トレーニングマシン', 'プール(25m×4レーン)', 'スタジオ2面', 'ホットヨガスタジオ'],
            amenities: ['大浴場', 'サウナ', 'ジャグジー', 'エステサロン', 'プロショップ', '無料駐車場'],
            membership_fee: {
              monthly: '¥14,300',
              daily: '¥3,300'
            }
          },
          'gym-7': {
            id: 'gym-7',
            name: 'パーソナルジムRIZAP四谷店',
            description: '完全個室のマンツーマントレーニングで、確実な結果にコミット。専属トレーナーと管理栄養士による徹底サポートで理想の体型を実現。',
            prefecture: '東京都',
            city: '新宿区',
            address: '東京都新宿区四谷2-2-2 四谷二丁目ビル6F',
            latitude: 35.687234,
            longitude: 139.726543,
            image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=600&fit=crop&q=80',
            rating: 4.7,
            users_count: 145,
            opening_hours: '7:00-23:00',
            phone: '0120-700-900',
            website: 'https://www.rizap.jp/gym/yotsuya/',
            equipment: ['パワーラック', 'ダンベル各種', 'バランスボール', 'TRX'],
            amenities: ['個室トレーニングルーム', 'シャワールーム', 'アメニティ完備', '無料ウェアレンタル'],
            membership_fee: {
              monthly: '2ヶ月 ¥327,800〜'
            }
          },
          'gym-8': {
            id: 'gym-8',
            name: 'JOYFIT24 四谷',
            description: '四谷駅徒歩3分。24時間営業で、仕事帰りでも早朝でも自分のペースでトレーニング可能。最新のマシンと充実の設備で、初心者から上級者まで満足できる環境。',
            prefecture: '東京都',
            city: '新宿区',
            address: '東京都新宿区四谷1-15 アーバンビルサカス8 B1F',
            latitude: 35.686123,
            longitude: 139.728956,
            image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=600&fit=crop&q=80',
            rating: 4.5,
            users_count: 425,
            opening_hours: '24時間営業',
            phone: '03-6273-1234',
            website: 'https://joyfit.jp/yotsuya-main/',
            instagram: '@joyfit24_yotsuya_main',
            twitter: '@joyfit_yotsuya',
            equipment: ['パワーラック×3', 'スミスマシン×2', 'ダンベル(1kg~50kg)', 'プレートローディングマシン', 'カーディオマシン40台'],
            amenities: ['男女別シャワールーム', '個別ロッカー', 'タンニングマシン', '体組成計', 'プロテインバー', 'Wi-Fi完備'],
            membership_fee: {
              monthly: '¥8,379',
              daily: '¥2,500'
            }
          }
        }

        // サンプルIDまたは無効なUUIDの場合はサンプルデータを使用
        if (!uuidRegex.test(gymId)) {
          console.log('Using sample data for gym ID:', gymId)
          const gym = sampleGyms[gymId]
          if (gym) {
            setGymDetail(gym)
          } else {
            console.log('Sample gym not found for ID:', gymId)
          }
        } else {
          // UUIDが有効な場合はデータベースから取得
          const { data, error } = await getGymDetail(gymId)

          if (error || !data) {
            console.log('Database fetch failed, falling back to sample data')
            // エラーまたはデータがない場合はサンプルデータにフォールバック
            const gym = sampleGyms[gymId]
            if (gym) {
              setGymDetail(gym)
            }
          } else {
            // データベースから正常に取得できた場合
            setGymDetail(data)
          }
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
      // 失敗したら元に戻す
      setIsFavorite(isFavorite)
      console.error('Failed to toggle favorite')
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
          <p className="text-[color:var(--text-muted)] mb-4">ジムが見つかりませんでした</p>
          <Link href="/search" className="text-[color:var(--gt-secondary-strong)] hover:underline">
            ジムを検索する
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[color:var(--background)]">
      <Header />

      {/* Hero Section */}
      <div className="relative h-64 sm:h-96">
        <Image
          src={gymDetail.image_url}
          alt={gymDetail.name}
          fill
          className="object-cover"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{gymDetail.name}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                {stationInfo ?
                  `${stationInfo.station}から${stationInfo.walkingText}` :
                  `${gymDetail.prefecture} ${gymDetail.city}`
                }
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-[color:var(--gt-tertiary)]" />
              <span className="text-sm">{gymDetail.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">{gymDetail.users_count}人が利用中</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="gt-card p-6">
              <h2 className="text-lg font-bold mb-4 text-[color:var(--foreground)]">ジムについて</h2>
              <p className="text-[color:var(--text-subtle)] leading-relaxed">
                {gymDetail.description}
              </p>
            </div>

            {/* Equipment */}
            {gymDetail.equipment && (
              <div className="gt-card p-6">
                <h2 className="text-lg font-bold mb-4 text-[color:var(--foreground)]">設備・器具</h2>
                <div className="flex flex-wrap gap-2">
                  {gymDetail.equipment.map((item, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[rgba(231,103,76,0.08)] text-[color:var(--gt-secondary-strong)] rounded-full text-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {gymDetail.amenities && (
              <div className="gt-card p-6">
                <h2 className="text-lg font-bold mb-4 text-[color:var(--foreground)]">設備・サービス</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {gymDetail.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[color:var(--gt-primary)] rounded-full" />
                      <span className="text-sm text-[color:var(--text-subtle)]">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="gt-card p-4">
              <button
                onClick={handleFavoriteToggle}
                disabled={isLoadingUser}
                className={`w-full py-3 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                  isLoadingUser
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : isFavorite
                    ? 'bg-[rgba(231,103,76,0.08)] text-[color:var(--gt-primary-strong)] hover:bg-[rgba(231,103,76,0.12)]'
                    : 'bg-[color:var(--gt-primary)] text-white hover:bg-[color:var(--gt-primary-strong)]'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                {isLoadingUser ? '読み込み中...' : isFavorite ? 'イキタイ登録済み' : 'イキタイに追加'}
              </button>
            </div>

            {/* Basic Info */}
            <div className="gt-card p-6 space-y-4">
              <h3 className="font-bold text-[color:var(--foreground)]">基本情報</h3>

              {gymDetail.opening_hours && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[color:var(--text-muted)] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[color:var(--foreground)]">営業時間</p>
                    <p className="text-sm text-[color:var(--text-subtle)]">{gymDetail.opening_hours}</p>
                  </div>
                </div>
              )}

              {stationInfo && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[color:var(--text-muted)] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[color:var(--foreground)]">アクセス</p>
                    <p className="text-sm text-[color:var(--text-subtle)]">
                      {stationInfo.station}から{stationInfo.walkingText}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[color:var(--text-muted)] mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[color:var(--foreground)]">住所</p>
                  <p className="text-sm text-[color:var(--text-subtle)]">{gymDetail.address}</p>
                </div>
              </div>

              {gymDetail.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[color:var(--text-muted)] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[color:var(--foreground)]">電話番号</p>
                    <p className="text-sm text-[color:var(--text-subtle)]">{gymDetail.phone}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Membership Fee */}
            {gymDetail.membership_fee && (
              <div className="gt-card p-6">
                <h3 className="font-bold text-[color:var(--foreground)] mb-4">料金プラン</h3>
                <div className="space-y-3">
                  {gymDetail.membership_fee.monthly && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[color:var(--text-subtle)]">月額会員</span>
                      <span className="font-bold text-[color:var(--foreground)]">{gymDetail.membership_fee.monthly}</span>
                    </div>
                  )}
                  {gymDetail.membership_fee.daily && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[color:var(--text-subtle)]">ビジター利用</span>
                      <span className="font-bold text-[color:var(--foreground)]">{gymDetail.membership_fee.daily}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Social Links */}
            <div className="gt-card p-6">
              <h3 className="font-bold text-[color:var(--foreground)] mb-4">公式リンク</h3>
              <div className="space-y-3">
                {gymDetail.website && (
                  <a
                    href={gymDetail.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-[color:var(--gt-secondary-strong)] hover:underline"
                  >
                    <Globe className="w-4 h-4" />
                    公式サイト
                  </a>
                )}
                {gymDetail.instagram && (
                  <a
                    href={`https://instagram.com/${gymDetail.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-[color:var(--gt-secondary-strong)] hover:underline"
                  >
                    <Instagram className="w-4 h-4" />
                    {gymDetail.instagram}
                  </a>
                )}
                {gymDetail.twitter && (
                  <a
                    href={`https://twitter.com/${gymDetail.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-[color:var(--gt-secondary-strong)] hover:underline"
                  >
                    <Twitter className="w-4 h-4" />
                    {gymDetail.twitter}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}