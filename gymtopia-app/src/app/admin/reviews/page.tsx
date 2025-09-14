'use client'

import { useState, useEffect } from 'react'
import { Star, Users, Calendar, MessageCircle, Filter, Search, Eye, EyeOff } from 'lucide-react'
import { getGyms, getGymReviews } from '@/lib/supabase/gyms'

interface ReviewWithGym {
  id: string
  rating: number
  title?: string
  content: string
  created_at: string
  gym_name: string
  gym_id: string
  user_display_name: string
  equipment_rating?: number
  cleanliness_rating?: number
  staff_rating?: number
  accessibility_rating?: number
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithGym[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGym, setSelectedGym] = useState<string>('all')
  const [gyms, setGyms] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)
  const [showRatings, setShowRatings] = useState(true) // 管理者が評価を表示するかどうか

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // ジム一覧を取得
      const gymsData = await getGyms()
      setGyms(gymsData)

      // 全ジムのレビューを取得
      const allReviews: ReviewWithGym[] = []
      for (const gym of gymsData) {
        const gymReviews = await getGymReviews(gym.id)
        const reviewsWithGym = gymReviews.map(review => ({
          ...review,
          gym_name: gym.name,
          gym_id: gym.id,
          user_display_name: review.user?.display_name || 'Anonymous'
        }))
        allReviews.push(...reviewsWithGym)
      }

      // 日付順でソート
      allReviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setReviews(allReviews)
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReviews = reviews.filter(review => {
    const matchesGym = selectedGym === 'all' || review.gym_id === selectedGym
    const matchesSearch = !searchQuery ||
      review.gym_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.user_display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRating = ratingFilter === null || review.rating === ratingFilter

    return matchesGym && matchesSearch && matchesRating
  })

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const getAverageRating = () => {
    if (filteredReviews.length === 0) return 0
    const sum = filteredReviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / filteredReviews.length).toFixed(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">レビュー管理</h1>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                管理者専用
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MessageCircle className="w-4 h-4" />
                <span>{filteredReviews.length}件のレビュー</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>平均 {getAverageRating()}</span>
              </div>
              <button
                onClick={() => setShowRatings(!showRatings)}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  showRatings
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {showRatings ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {showRatings ? '星評価表示中' : '星評価非表示'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 管理者向け説明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">管理者向け機能について</h3>
              <p className="text-sm text-blue-800">
                ユーザーは星評価を入力できますが、一般ユーザーには個別の評価は表示されません。
                このページでは管理者のみがユーザーの詳細な評価を確認できます。
                右上の「星評価表示/非表示」ボタンで表示を切り替えられます。
              </p>
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ジムで絞り込み
              </label>
              <select
                value={selectedGym}
                onChange={(e) => setSelectedGym(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">すべてのジム</option>
                {gyms.map(gym => (
                  <option key={gym.id} value={gym.id}>{gym.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                評価で絞り込み
              </label>
              <select
                value={ratingFilter || ''}
                onChange={(e) => setRatingFilter(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">すべての評価</option>
                <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                <option value="4">⭐⭐⭐⭐ (4)</option>
                <option value="3">⭐⭐⭐ (3)</option>
                <option value="2">⭐⭐ (2)</option>
                <option value="1">⭐ (1)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                検索
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="ジム名、ユーザー名、レビュー内容で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* レビュー一覧 */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{review.user_display_name}</h3>
                    <p className="text-sm text-gray-600">{review.gym_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  {showRatings && (
                    <div className="flex items-center gap-2 mb-1">
                      {renderStars(review.rating)}
                      <span className="text-sm font-medium text-gray-900">
                        {review.rating}/5
                      </span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium ml-2">
                        管理者のみ表示
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(review.created_at).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {review.title && (
                <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
              )}

              <p className="text-gray-700 mb-4 leading-relaxed">{review.content}</p>

              {/* 詳細評価（管理者のみ表示） */}
              {showRatings && (review.equipment_rating || review.cleanliness_rating || review.staff_rating || review.accessibility_rating) && (
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-sm font-medium text-gray-700">詳細評価</p>
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                      管理者のみ表示
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {review.equipment_rating && (
                      <div>
                        <span className="text-gray-600">設備: </span>
                        <span className="font-medium">{review.equipment_rating}/5</span>
                      </div>
                    )}
                    {review.cleanliness_rating && (
                      <div>
                        <span className="text-gray-600">清潔さ: </span>
                        <span className="font-medium">{review.cleanliness_rating}/5</span>
                      </div>
                    )}
                    {review.staff_rating && (
                      <div>
                        <span className="text-gray-600">スタッフ: </span>
                        <span className="font-medium">{review.staff_rating}/5</span>
                      </div>
                    )}
                    {review.accessibility_rating && (
                      <div>
                        <span className="text-gray-600">アクセス: </span>
                        <span className="font-medium">{review.accessibility_rating}/5</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 一般ユーザー向け表示の説明 */}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Eye className="w-3 h-3" />
                  <span>一般ユーザーには星評価は表示されず、レビュー内容のみが表示されます</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">条件に一致するレビューがありません</p>
          </div>
        )}
      </main>
    </div>
  )
}