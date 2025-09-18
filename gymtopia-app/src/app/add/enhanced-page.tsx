'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MapPin, Camera, ChevronDown, CheckCircle, AlertCircle, Clock, Shield } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'

interface RecentCheckIn {
  id: string
  gym_id: string
  gym_name: string
  checked_in_at: string
  distance_from_gym: number
  verified: boolean
}

interface GymOption {
  id: string
  name: string
  address: string
  lastVisited?: string
  isVerified?: boolean
}

export default function EnhancedAddPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const checkInId = searchParams.get('checkInId')

  const [content, setContent] = useState('')
  const [selectedGym, setSelectedGym] = useState<string>('')
  const [recentCheckIns, setRecentCheckIns] = useState<RecentCheckIn[]>([])
  const [allGyms, setAllGyms] = useState<GymOption[]>([])
  const [showGymDropdown, setShowGymDropdown] = useState(false)
  const [postType, setPostType] = useState<'verified' | 'unverified' | null>(null)
  const [selectedCheckIn, setSelectedCheckIn] = useState<RecentCheckIn | null>(null)
  const [showVerificationWarning, setShowVerificationWarning] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // タイムリミット（チェックインから24時間以内なら認証済み投稿可能）
  const CHECK_IN_TIME_LIMIT = 24 * 60 * 60 * 1000 // 24時間

  useEffect(() => {
    loadRecentCheckIns()
    loadAllGyms()

    // URLパラメータからチェックインIDがある場合
    if (checkInId) {
      loadCheckInData(checkInId)
    }
  }, [checkInId])

  // 最近のチェックインを取得（24時間以内）
  const loadRecentCheckIns = async () => {
    try {
      const supabase = getSupabaseClient()
      const demoUserId = '0ab7b9a0-fbf6-447c-9af5-ff5b12e92fa8'
      const timeLimit = new Date(Date.now() - CHECK_IN_TIME_LIMIT)

      const { data, error } = await supabase
        .from('check_ins')
        .select(`
          *,
          gyms (name, address)
        `)
        .eq('user_id', demoUserId)
        .gte('checked_in_at', timeLimit.toISOString())
        .order('checked_in_at', { ascending: false })

      if (error) throw error

      const checkIns = (data || []).map((c: any) => ({
        id: c.id,
        gym_id: c.gym_id,
        gym_name: c.gyms?.name || 'Unknown Gym',
        checked_in_at: c.checked_in_at,
        distance_from_gym: c.distance_from_gym || 0,
        verified: c.distance_from_gym ? c.distance_from_gym <= 100 : false
      }))

      setRecentCheckIns(checkIns)
    } catch (error) {
      console.error('Error loading recent check-ins:', error)
    }
  }

  // 全ジムリストを取得
  const loadAllGyms = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('gyms')
        .select('id, name, address, prefecture, city')
        .limit(100)
        .order('name')

      if (error) throw error

      const gyms = (data || []).map((g: any) => ({
        id: g.id,
        name: g.name,
        address: g.address || `${g.prefecture} ${g.city}`
      }))

      setAllGyms(gyms)
    } catch (error) {
      console.error('Error loading gyms:', error)
    }
  }

  // 特定のチェックインデータを読み込み
  const loadCheckInData = async (checkInId: string) => {
    const checkIn = recentCheckIns.find(c => c.id === checkInId)
    if (checkIn) {
      setSelectedCheckIn(checkIn)
      setSelectedGym(checkIn.gym_id)
      setPostType('verified')
    }
  }

  // チェックインからの時間を計算
  const getTimeSinceCheckIn = (checkInTime: string): string => {
    const diff = Date.now() - new Date(checkInTime).getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (minutes < 60) return `${minutes}分前`
    if (hours < 24) return `${hours}時間前`
    return '24時間以上前'
  }

  // チェックインが有効期限内か確認
  const isCheckInValid = (checkInTime: string): boolean => {
    const diff = Date.now() - new Date(checkInTime).getTime()
    return diff <= CHECK_IN_TIME_LIMIT
  }

  // 投稿を送信
  const handleSubmit = async () => {
    if (!content.trim() || !selectedGym) {
      alert('ジムと内容を入力してください')
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = getSupabaseClient()
      const demoUserId = '0ab7b9a0-fbf6-447c-9af5-ff5b12e92fa8'

      // 投稿データを作成
      const postData = {
        user_id: demoUserId,
        gym_id: selectedGym,
        content: content.trim(),
        images: images,
        is_verified: postType === 'verified',
        check_in_id: selectedCheckIn?.id || null,
        verification_method: postType === 'verified' ? 'check_in' : 'manual',
        posted_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single()

      if (error) throw error

      // 成功したらフィードページへ
      router.push('/feed')
    } catch (error) {
      console.error('Error creating post:', error)
      alert('投稿の作成に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">ジム活動を投稿</h1>

        {/* チェックイン選択セクション */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            最近のチェックイン（24時間以内）
          </h2>

          {recentCheckIns.length > 0 ? (
            <div className="space-y-2">
              {recentCheckIns.map((checkIn) => {
                const isValid = isCheckInValid(checkIn.checked_in_at)
                const isSelected = selectedCheckIn?.id === checkIn.id

                return (
                  <button
                    key={checkIn.id}
                    onClick={() => {
                      if (isValid) {
                        setSelectedCheckIn(checkIn)
                        setSelectedGym(checkIn.gym_id)
                        setPostType('verified')
                        setShowVerificationWarning(false)
                      }
                    }}
                    disabled={!isValid}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-green-500 bg-green-50'
                        : isValid
                        ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{checkIn.gym_name}</div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-600">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {getTimeSinceCheckIn(checkIn.checked_in_at)}
                          </span>
                          {checkIn.verified && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              位置認証済み
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              24時間以内のチェックインがありません
            </p>
          )}

          {/* チェックインなしで投稿する選択肢 */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setSelectedCheckIn(null)
                setPostType('unverified')
                setShowVerificationWarning(true)
                setShowGymDropdown(true)
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              チェックインなしで投稿する →
            </button>
          </div>
        </div>

        {/* 警告メッセージ */}
        {showVerificationWarning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">位置認証なしの投稿</p>
              <p>チェックインがない投稿は、位置認証マークが付きません。信頼性を高めるには、ジムでチェックインしてから投稿することをお勧めします。</p>
            </div>
          </div>
        )}

        {/* ジム選択（チェックインなしの場合） */}
        {postType === 'unverified' && (
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ジムを選択
            </label>
            <div className="relative">
              <button
                onClick={() => setShowGymDropdown(!showGymDropdown)}
                className="w-full p-3 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-blue-400"
              >
                <span className={selectedGym ? 'text-gray-900' : 'text-gray-500'}>
                  {selectedGym
                    ? allGyms.find(g => g.id === selectedGym)?.name
                    : 'ジムを選択してください'
                  }
                </span>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>

              {showGymDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {allGyms.map((gym) => (
                    <button
                      key={gym.id}
                      onClick={() => {
                        setSelectedGym(gym.id)
                        setShowGymDropdown(false)
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      <div className="font-medium text-gray-900">{gym.name}</div>
                      <div className="text-xs text-gray-600">{gym.address}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 選択されたジム情報 */}
        {selectedGym && (
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">投稿先のジム</p>
                <p className="font-bold text-gray-900">
                  {allGyms.find(g => g.id === selectedGym)?.name ||
                   recentCheckIns.find(c => c.gym_id === selectedGym)?.gym_name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {postType === 'verified' ? (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    位置認証済み
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                    手動選択
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 投稿内容入力 */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            今日のトレーニング内容
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="今日はどんなトレーニングをしましたか？"
            className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* 写真追加（将来実装） */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center gap-2">
            <Camera className="w-5 h-5" />
            写真を追加（オプション）
          </button>
        </div>

        {/* 投稿ボタン */}
        <button
          onClick={handleSubmit}
          disabled={!selectedGym || !content.trim() || isSubmitting}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
            !selectedGym || !content.trim() || isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg'
          }`}
        >
          {isSubmitting ? '投稿中...' : '投稿する'}
        </button>

        {/* 投稿ポリシー */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            {postType === 'verified'
              ? '✓ この投稿は位置認証済みとして表示されます'
              : '位置認証なしの投稿として表示されます'
            }
          </p>
        </div>
      </div>
    </div>
  )
}