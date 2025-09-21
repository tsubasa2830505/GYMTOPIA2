'use client'

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic'

import {
  Save, X, MapPin, Camera, Plus, Minus, Users,
  Calendar, Clock, Dumbbell, MessageSquare, Image as ImageIcon,
  Settings, Package, Building, AlertCircle, Search
} from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import FreeWeightSelector from '@/components/FreeWeightSelector'
import MachineSelector from '@/components/MachineSelector'
import ExerciseSelector from '@/components/ExerciseSelector'
import { upsertGymFacilities } from '@/lib/supabase/facilities'
import type { Exercise as ExerciseType } from '@/data/exercise-master'
import type { FacilityFormData } from '@/types/facilities'
import { createPost } from '@/lib/supabase/posts'
import { useAuth } from '@/contexts/AuthContext'
import { getGyms } from '@/lib/supabase/gyms'
import { getSupabaseClient } from '@/lib/supabase/client'

interface Exercise {
  id: string
  name: string
  weight: string
  sets: string
  reps: string
  mets?: number
  category?: string
  // 有酸素運動用のフィールド
  duration?: string  // 時間（分）
  distance?: string  // 距離（km）
  speed?: string     // 速度（km/h）
}

import { Suspense } from 'react'

function AddGymPostContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'post' | 'equipment'>('post')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [gymName, setGymName] = useState('')
  const [content, setContent] = useState('')
  const [checkInId, setCheckInId] = useState<string | null>(null)
  const [checkInGymName, setCheckInGymName] = useState<string | null>(null)
  const [crowdStatus, setCrowdStatus] = useState<'empty' | 'normal' | 'crowded'>('normal')
  const [workoutStartTime, setWorkoutStartTime] = useState('')
  const [workoutEndTime, setWorkoutEndTime] = useState('')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [showExerciseForm, setShowExerciseForm] = useState(false)
  const [showExerciseSelector, setShowExerciseSelector] = useState(false)
  const [currentExercise, setCurrentExercise] = useState<Exercise>({
    id: '',
    name: '',
    weight: '',
    sets: '',
    reps: '',
    duration: '',
    distance: '',
    speed: ''
  })
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  
  // 画像処理関数
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // 最大5枚まで
    const newFiles = [...selectedImages, ...files].slice(0, 5)
    setSelectedImages(newFiles)

    // プレビューURL生成
    newFiles.forEach((file, index) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreviewUrls(prev => {
          const newUrls = [...prev]
          newUrls[index] = result
          return newUrls
        })
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImagesToSupabase = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return []

    setUploadingImages(true)
    const uploadedUrls: string[] = []

    try {
      const supabase = getSupabaseClient()
      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `posts/${fileName}`

        const { data, error } = await supabase.storage
          .from('gym-posts')
          .upload(filePath, file)

        if (error) {
          console.error('画像アップロードエラー:', error)
          throw error
        }

        // パブリックURLを取得
        const { data: urlData } = supabase.storage
          .from('gym-posts')
          .getPublicUrl(filePath)

        uploadedUrls.push(urlData.publicUrl)
      }
      return uploadedUrls
    } catch (error) {
      console.error('画像アップロード失敗:', error)
      throw error
    } finally {
      setUploadingImages(false)
    }
  }

  // 機器登録用の状態
  const [equipmentGymName, setEquipmentGymName] = useState('')
  const [selectedFreeWeights, setSelectedFreeWeights] = useState<Set<string>>(new Set())
  const [selectedMachines, setSelectedMachines] = useState<Map<string, number>>(new Map())
  const [showEquipmentConfirmation, setShowEquipmentConfirmation] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ジムリスト（Supabaseから取得）
  const [gymList, setGymList] = useState<string[]>([])
  const [gymData, setGymData] = useState<any[]>([])

  // URLパラメータからジム情報とチェックイン情報を取得
  useEffect(() => {
    const checkInIdParam = searchParams.get('checkInId')
    const gymIdParam = searchParams.get('gymId')
    const gymNameParam = searchParams.get('gymName')

    if (checkInIdParam) {
      setCheckInId(checkInIdParam)
    }

    if (gymNameParam) {
      const decodedGymName = decodeURIComponent(gymNameParam)
      setGymName(decodedGymName)
      setCheckInGymName(decodedGymName)
    }

    // ジムリストを読み込み
    loadGyms()
  }, [searchParams])

  const loadGyms = async () => {
    try {
      const gyms = await getGyms()
      setGymData(gyms)
      setGymList(gyms.map(gym => gym.name))
    } catch (error) {
      console.error('Error loading gyms:', error)
      // フォールバック
      setGymList([
        'ハンマーストレングス渋谷',
        'ROGUEクロストレーニング新宿',
        'プレミアムフィットネス銀座',
        'GOLD\'S GYM 渋谷',
        'エニタイムフィットネス新宿',
        'ティップネス池袋',
        'コナミスポーツクラブ品川',
      ])
    }
  }

  const crowdOptions = [
    { value: 'empty' as const, label: '空いている', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 6c1.93 0 3.5 1.57 3.5 3.5S13.93 14 12 14s-3.5-1.57-3.5-3.5S10.07 8 12 8zm0 10c-2.03 0-4.43-.82-6.14-2.88C7.55 14.8 9.68 14 12 14s4.45.8 6.14 2.12C16.43 17.18 14.03 18 12 18z"/>
      </svg>
    ), color: 'bg-[rgba(231,103,76,0.12)] text-[color:var(--gt-primary-strong)]' },
    { value: 'normal' as const, label: '普通', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
      </svg>
    ), color: 'bg-[rgba(245,177,143,0.14)] text-[color:var(--gt-tertiary-strong)]' },
    { value: 'crowded' as const, label: '混雑', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-2 .13-2.87.4-.59.18-1.13.9-1.13 1.6v3H5V16h-.97c-.02-.49-.39-.94-.88-1.1zM12 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-2 .13-2.87.4-.59.18-1.13.9-1.13 1.6v3H15V16h-.97c-.02-.49-.39-.94-.88-1.1zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-2 .13-2.87.4-.59.18-1.13.9-1.13 1.6v3H23V16h-.97c-.02-.49-.39-.94-.88-1.1z"/>
      </svg>
    ), color: 'bg-[rgba(231,103,76,0.12)] text-[color:var(--gt-primary-strong)]' }
  ]

  const handleAddExercise = () => {
    // 有酸素運動かどうかチェック
    const isCardio = currentExercise.category === 'cardio'

    if (isCardio) {
      // 有酸素運動の場合は時間が必須
      if (currentExercise.name.trim() && currentExercise.duration?.trim()) {
        setExercises([...exercises, { ...currentExercise, id: Date.now().toString() }])
        setCurrentExercise({ id: '', name: '', weight: '', sets: '', reps: '', duration: '', distance: '', speed: '' })
        setShowExerciseForm(false)
      } else {
        alert('種目名と時間を入力してください')
      }
    } else {
      // 筋トレの場合は従来通り
      if (currentExercise.name.trim() && currentExercise.weight.trim() && currentExercise.sets.trim() && currentExercise.reps.trim()) {
        setExercises([...exercises, { ...currentExercise, id: Date.now().toString() }])
        setCurrentExercise({ id: '', name: '', weight: '', sets: '', reps: '', duration: '', distance: '', speed: '' })
        setShowExerciseForm(false)
      } else {
        alert('すべての項目を入力してください')
      }
    }
  }

  const handleExerciseSelect = (exercise: ExerciseType) => {
    setCurrentExercise({
      ...currentExercise,
      name: exercise.name,
      mets: exercise.base_mets,
      category: exercise.category
    })
    setShowExerciseSelector(false)
  }

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (!content.trim()) {
      alert('投稿内容を入力してください')
      return
    }

    setIsSubmitting(true)

    try {
      // 画像をアップロード
      let imageUrls: string[] = []
      if (selectedImages.length > 0) {
        imageUrls = await uploadImagesToSupabase(selectedImages)
      }

      // 選択したジムのIDを取得
      const selectedGym = gymData.find(gym => gym.name === gymName)

      // 投稿データを作成
      const postData = {
        content: content.trim(),
        post_type: exercises.length > 0 ? 'workout' as const : 'normal' as const,
        gym_id: selectedGym?.id, // ジムIDを追加
        checkin_id: checkInId || undefined, // チェックインIDを追加（checkin_idに修正）
        images: imageUrls, // 画像URLを追加
        workout_started_at: workoutStartTime || undefined,
        workout_ended_at: workoutEndTime || undefined,
        // exercises があれば training_details に含める
        training_details: exercises.length > 0 ? {
          exercises: exercises.map(ex => ({
            name: ex.name,
            weight: ex.category === 'cardio' ? 0 : (parseFloat(ex.weight) || 0),
            sets: ex.category === 'cardio' ? 1 : (parseInt(ex.sets) || 1),
            reps: ex.category === 'cardio' ? 1 : (parseInt(ex.reps) || 1),
            mets: ex.mets || null,
            category: ex.category || null,
            duration: ex.duration ? parseInt(ex.duration) : null,
            distance: ex.distance ? parseFloat(ex.distance) : null,
            speed: ex.speed ? parseFloat(ex.speed) : null
          })),
          gym_name: gymName,
          crowd_status: crowdStatus
        } : null,
        visibility: 'public' as const
      }

      await createPost(postData)
      
      // 投稿成功
      alert('投稿しました！')
      router.push('/feed')
    } catch (error) {
      console.error('投稿エラー:', error)
      alert('投稿に失敗しました。もう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleEquipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const formData: FacilityFormData = {
        gymName: equipmentGymName,
        freeWeights: selectedFreeWeights,
        machines: selectedMachines
      }

      const result = await upsertGymFacilities(formData)

      if (result.success) {
        setShowEquipmentConfirmation(true)
        // 2秒後に画面遷移
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else {
        setError(result.error || '登録に失敗しました')
      }
    } catch (err) {
      setError('予期しないエラーが発生しました')
      console.error('Equipment registration error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentDate = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  })

  const currentTime = new Date().toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className="min-h-screen bg-[rgba(254,255,250,0.96)]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-[rgba(254,255,250,0.92)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <Image
                src="/images/gymtopia.png"
                alt="ジムトピア"
                width={80}
                height={24}
                className="h-5 w-auto"
                style={{
                  filter: 'brightness(0) saturate(100%) invert(45%) sepia(93%) saturate(1352%) hue-rotate(333deg) brightness(95%) contrast(96%)'
                }}
              />
              <span className="text-[rgba(231,103,76,0.36)]">|</span>
              <h1 className="text-xl font-bold text-[color:var(--foreground)]">
                {activeTab === 'post' ? 'ジム活を投稿' : 'ジム機器を登録'}
              </h1>
            </div>
            {activeTab === 'post' ? (
              <button
                type="submit"
                form="post-form"
                disabled={!gymName || !content || isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-[0_14px_32px_-20px_rgba(189,101,78,0.46)] hover:shadow-[0_18px_38px_-20px_rgba(189,101,78,0.5)] transition-all"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    投稿中
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    投稿する
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleEquipmentSubmit}
                disabled={!equipmentGymName || (selectedFreeWeights.size === 0 && selectedMachines.size === 0) || isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-[0_14px_32px_-20px_rgba(189,101,78,0.46)] hover:shadow-[0_18px_38px_-20px_rgba(189,101,78,0.5)] transition-all"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    登録中...
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4" />
                    登録する
                  </>
                )}
              </button>
            )}
          </div>
          
          {/* タブ */}
          <div className="flex border-t border-[rgba(231,103,76,0.16)]">
            <button
              onClick={() => setActiveTab('post')}
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === 'post'
                  ? 'border-[rgba(231,103,76,0.3)] text-[color:var(--gt-primary-strong)] font-medium'
                  : 'border-transparent text-[color:var(--text-subtle)] hover:text-[color:var(--foreground)]'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              ジム活投稿
            </button>
            <button
              onClick={() => setActiveTab('equipment')}
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === 'equipment'
                  ? 'border-[rgba(231,103,76,0.3)] text-[color:var(--gt-secondary-strong)] font-medium'
                  : 'border-transparent text-[color:var(--text-subtle)] hover:text-[color:var(--foreground)]'
              }`}
            >
              <Package className="w-4 h-4" />
              機器登録
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* 登録完了メッセージ */}
        {showEquipmentConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-sm mx-4 shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-[rgba(231,103,76,0.12)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-[color:var(--gt-secondary-strong)]" />
                </div>
                <h2 className="text-xl font-bold text-[color:var(--foreground)] mb-2">登録完了！</h2>
                <p className="text-[color:var(--text-subtle)]">ジム機器の登録が完了しました</p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'post' ? (
          <form id="post-form" onSubmit={handleSubmit} className="space-y-6">
          {/* チェックインからの投稿バナー */}
          {checkInGymName && (
            <div className="bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium opacity-90">Check-In</p>
                  <p className="text-lg font-bold">{checkInGymName}</p>
                </div>
              </div>
              <p className="text-xs mt-2 opacity-80">
                このジムでのトレーニングを記録しましょう！
              </p>
            </div>
          )}

          {/* 日時表示とワークアウト時間 */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-4 text-sm text-[color:var(--text-subtle)] mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{currentDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{currentTime}</span>
              </div>
            </div>
            
            {/* ワークアウト時間入力 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[color:var(--foreground)] mb-1">
                  開始時間
                </label>
                <input
                  type="time"
                  value={workoutStartTime}
                  onChange={(e) => setWorkoutStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[rgba(254,255,250,0.96)] border border-[rgba(231,103,76,0.16)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[color:var(--foreground)] mb-1">
                  終了時間
                </label>
                <input
                  type="time"
                  value={workoutEndTime}
                  onChange={(e) => setWorkoutEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[rgba(254,255,250,0.96)] border border-[rgba(231,103,76,0.16)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-sm"
                />
              </div>
            </div>
            {workoutStartTime && workoutEndTime && (
              <div className="mt-2 text-xs text-[color:var(--text-subtle)]">
                ワークアウト時間: {(() => {
                  const start = new Date(`2000-01-01T${workoutStartTime}`);
                  const end = new Date(`2000-01-01T${workoutEndTime}`);
                  const diff = Math.floor((end.getTime() - start.getTime()) / 60000);
                  if (diff > 0) {
                    const hours = Math.floor(diff / 60);
                    const minutes = diff % 60;
                    return hours > 0 ? `${hours}時間${minutes}分` : `${minutes}分`;
                  }
                  return '計算中...';
                })()}
              </div>
            )}
          </div>

          {/* ジム選択 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-bold text-[color:var(--foreground)] mb-3">
              <MapPin className="w-4 h-4 inline mr-2" />
              ジムを選択 <span className="text-[color:var(--gt-primary)]">*</span>
            </label>
            <select
              value={gymName}
              onChange={(e) => setGymName(e.target.value)}
              className="w-full px-4 py-3 bg-[rgba(254,255,250,0.96)] border border-[rgba(231,103,76,0.16)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-[color:var(--foreground)]"
              required
            >
              <option value="">ジムを選択してください</option>
              {gymList.map((gym, index) => (
                <option key={`${gym}-${index}`} value={gym}>{gym}</option>
              ))}
            </select>
          </div>

          {/* 投稿内容 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-bold text-[color:var(--foreground)] mb-3">
              <MessageSquare className="w-4 h-4 inline mr-2" />
              投稿内容 <span className="text-[color:var(--gt-primary)]">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="今日のトレーニングはどうでしたか？&#10;新しい発見、達成した目標、感想などを共有しましょう！"
              rows={4}
              className="w-full px-4 py-3 bg-[rgba(254,255,250,0.96)] border border-[rgba(231,103,76,0.16)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-[color:var(--foreground)] resize-none"
              required
            />
            <p className="text-xs text-[color:var(--text-muted)] mt-2">{content.length} / 500文字</p>
          </div>

          {/* トレーニング詳細 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[color:var(--foreground)] flex items-center gap-2">
                <Dumbbell className="w-4 h-4" />
                トレーニング詳細
                <span className="text-xs text-[color:var(--text-muted)] font-normal">（オプション）</span>
              </h3>
              {!showExerciseForm && (
                <button
                  type="button"
                  onClick={() => {
                    console.log('種目追加ボタンがクリックされました')
                    setShowExerciseForm(true)
                  }}
                  className="px-3 py-1 bg-[rgba(231,103,76,0.14)] text-[color:var(--gt-primary-strong)] rounded-lg text-sm font-medium hover:bg-[rgba(231,103,76,0.22)] transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  種目を追加
                </button>
              )}
              {showExerciseForm && (
                <button
                  type="button"
                  onClick={() => setShowExerciseForm(false)}
                  className="px-3 py-1 bg-[rgba(231,103,76,0.12)] text-[color:var(--gt-primary-strong)] rounded-lg text-sm font-medium hover:bg-[rgba(231,103,76,0.18)] transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  フォームを閉じる
                </button>
              )}
            </div>

            {/* 追加済みの種目リスト */}
            {exercises.length > 0 && (
              <div className="space-y-2 mb-4">
                {exercises.map((exercise) => (
                  <div key={exercise.id} className="flex items-center justify-between p-3 bg-[rgba(254,255,250,0.96)] rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[color:var(--foreground)]">{exercise.name}</p>
                        {exercise.mets && (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                            METs: {exercise.mets}
                          </span>
                        )}
                        {exercise.category && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                            {exercise.category}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[color:var(--text-subtle)]">
                        {exercise.category === 'cardio' ? (
                          <>
                            {exercise.duration && `${exercise.duration}分`}
                            {exercise.distance && ` / ${exercise.distance}km`}
                            {exercise.speed && ` / ${exercise.speed}km/h`}
                          </>
                        ) : (
                          `${exercise.weight}kg × ${exercise.sets}セット × ${exercise.reps}回`
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(exercise.id)}
                      className="p-1 text-[color:var(--gt-primary)] hover:bg-[rgba(224,112,122,0.12)] rounded-lg transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <p className="text-xs text-[color:var(--text-muted)] mt-2">
                  合計: {exercises.length}種目
                </p>
              </div>
            )}

            {/* 種目追加フォーム */}
            {showExerciseForm && (
              <div className="space-y-3 p-4 bg-[rgba(254,255,250,0.96)] rounded-lg">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="種目名を入力または選択"
                    value={currentExercise.name}
                    onChange={(e) => setCurrentExercise({ ...currentExercise, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[rgba(231,103,76,0.16)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowExerciseSelector(true)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[rgba(231,103,76,0.08)] rounded-lg transition-colors"
                    title="種目を選択"
                  >
                    <Search className="w-4 h-4 text-[color:var(--gt-primary)]" />
                  </button>
                </div>
                {/* 有酸素運動と筋トレで入力フィールドを切り替え */}
                {currentExercise.category === 'cardio' ? (
                  /* 有酸素運動用の入力フィールド */
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        placeholder="時間(分) *"
                        value={currentExercise.duration}
                        onChange={(e) => {
                          const duration = e.target.value
                          const distance = currentExercise.distance
                          // 時間と距離から速度を自動計算
                          if (duration && distance) {
                            const speed = (parseFloat(distance) / (parseFloat(duration) / 60)).toFixed(1)
                            setCurrentExercise({ ...currentExercise, duration, speed })
                          } else {
                            setCurrentExercise({ ...currentExercise, duration })
                          }
                        }}
                        className="px-3 py-2 bg-white border border-[rgba(231,103,76,0.16)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-sm"
                      />
                      <input
                        type="number"
                        placeholder="距離(km)"
                        value={currentExercise.distance}
                        onChange={(e) => {
                          const distance = e.target.value
                          const duration = currentExercise.duration
                          // 時間と距離から速度を自動計算
                          if (duration && distance) {
                            const speed = (parseFloat(distance) / (parseFloat(duration) / 60)).toFixed(1)
                            setCurrentExercise({ ...currentExercise, distance, speed })
                          } else {
                            setCurrentExercise({ ...currentExercise, distance })
                          }
                        }}
                        className="px-3 py-2 bg-white border border-[rgba(231,103,76,0.16)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-sm"
                      />
                      <input
                        type="number"
                        placeholder="速度(km/h)"
                        value={currentExercise.speed}
                        onChange={(e) => setCurrentExercise({ ...currentExercise, speed: e.target.value })}
                        className="px-3 py-2 bg-white border border-[rgba(231,103,76,0.16)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-sm bg-gray-50"
                        readOnly={!!currentExercise.duration && !!currentExercise.distance}
                        title={currentExercise.duration && currentExercise.distance ? "時間と距離から自動計算されます" : "時間と距離を入力すると自動計算されます"}
                      />
                    </div>
                    <p className="text-xs text-[color:var(--text-muted)]">
                      ※ 時間は必須です。速度は時間と距離から自動計算されます
                    </p>
                  </div>
                ) : (
                  /* 筋トレ用の入力フィールド */
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      placeholder="重量(kg)"
                      value={currentExercise.weight}
                      onChange={(e) => setCurrentExercise({ ...currentExercise, weight: e.target.value })}
                      className="px-3 py-2 bg-white border border-[rgba(231,103,76,0.16)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-sm"
                    />
                    <input
                      type="number"
                      placeholder="セット数"
                      value={currentExercise.sets}
                      onChange={(e) => setCurrentExercise({ ...currentExercise, sets: e.target.value })}
                      className="px-3 py-2 bg-white border border-[rgba(231,103,76,0.16)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-sm"
                    />
                    <input
                      type="number"
                      placeholder="回数"
                      value={currentExercise.reps}
                      onChange={(e) => setCurrentExercise({ ...currentExercise, reps: e.target.value })}
                      className="px-3 py-2 bg-white border border-[rgba(231,103,76,0.16)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-sm"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddExercise}
                    className="flex-1 px-3 py-2 bg-[color:var(--gt-primary)] text-white rounded-lg text-sm font-medium hover:bg-[color:var(--gt-primary-strong)] transition-colors"
                  >
                    追加
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowExerciseForm(false)
                      setCurrentExercise({ id: '', name: '', weight: '', sets: '', reps: '', duration: '', distance: '', speed: '' })
                    }}
                    className="flex-1 px-3 py-2 bg-[rgba(231,103,76,0.12)] text-[color:var(--foreground)] rounded-lg text-sm font-medium hover:bg-[rgba(231,103,76,0.16)] transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 混雑状況 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-bold text-[color:var(--foreground)] mb-3">
              <Users className="w-4 h-4 inline mr-2" />
              混雑状況 <span className="text-[color:var(--gt-primary)]">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {crowdOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCrowdStatus(option.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    crowdStatus === option.value
                      ? 'border-[rgba(231,103,76,0.3)] bg-[rgba(231,103,76,0.12)]'
                      : 'border-[rgba(231,103,76,0.16)] hover:border-[rgba(231,103,76,0.2)]'
                  }`}
                >
                  <div className="mb-1">{option.icon}</div>
                  <p className={`text-sm font-medium ${
                    crowdStatus === option.value ? 'text-[color:var(--gt-primary-strong)]' : 'text-[color:var(--foreground)]'
                  }`}>
                    {option.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 写真追加 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-bold text-[color:var(--foreground)] mb-3">
              <Camera className="w-4 h-4 inline mr-2" />
              写真を追加
              <span className="text-xs text-[color:var(--text-muted)] font-normal ml-2">（最大5枚）</span>
            </label>

            {/* 画像プレビュー */}
            {imagePreviewUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`プレビュー ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-[rgba(224,112,122,0.12)] text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-[color:var(--gt-primary-strong)] transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* アップロードエリア */}
            {selectedImages.length < 5 && (
              <div className="border-2 border-dashed border-[rgba(231,103,76,0.2)] rounded-lg p-8 text-center hover:border-[color:var(--gt-primary)] transition-colors cursor-pointer">
                <label className="cursor-pointer block">
                  <ImageIcon className="w-12 h-12 text-[rgba(231,103,76,0.36)] mx-auto mb-3" />
                  <p className="text-sm text-[color:var(--text-subtle)]">クリックして写真を選択</p>
                  <p className="text-xs text-[color:var(--text-muted)] mt-1">JPEG, PNG, WebP対応</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* 投稿ボタン（モバイル用） */}
          <button
            type="submit"
            disabled={!gymName || !content || isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:hidden border-2 border-transparent"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                投稿中...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                ジム活を投稿する
              </>
            )}
          </button>
          </form>
        ) : (
          <form onSubmit={handleEquipmentSubmit} className="space-y-6">
            {/* エラーメッセージ */}
            {error && (
              <div className="bg-[rgba(224,112,122,0.12)] border border-[rgba(231,103,76,0.26)] rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[color:var(--gt-primary)] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[color:var(--gt-primary-strong)]">登録エラー</p>
                  <p className="text-sm text-[color:var(--gt-primary-strong)] mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* ジム選択（機器登録用） */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <label className="block text-sm font-bold text-[color:var(--foreground)] mb-3">
                <Building className="w-4 h-4 inline mr-2" />
                登録するジム <span className="text-[color:var(--gt-primary)]">*</span>
              </label>
              <select
                value={equipmentGymName}
                onChange={(e) => setEquipmentGymName(e.target.value)}
                className="w-full px-4 py-3 bg-[rgba(254,255,250,0.96)] border border-[rgba(231,103,76,0.16)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-[color:var(--foreground)]"
                required
              >
                <option value="">ジムを選択してください</option>
                {gymList.map((gym, index) => (
                  <option key={`${gym}-admin-${index}`} value={gym}>{gym}</option>
                ))}
              </select>
              <p className="text-xs text-[color:var(--text-muted)] mt-2">
                ジムオーナーまたは管理者の方のみ登録をお願いします
              </p>
            </div>
            
            {/* フリーウェイト選択 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[color:var(--foreground)] mb-4 flex items-center gap-2">
                <Dumbbell className="w-4 h-4" />
                フリーウェイト機器
                <span className="text-xs text-[color:var(--text-muted)] font-normal">（該当するものを選択）</span>
              </h3>
              <FreeWeightSelector
                selectedFreeWeights={selectedFreeWeights}
                onSelectionChange={setSelectedFreeWeights}
              />
            </div>
            
            {/* マシン選択 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[color:var(--foreground)] mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                トレーニングマシン
                <span className="text-xs text-[color:var(--text-muted)] font-normal">（3軸フィルターで絞り込み）</span>
              </h3>
              <MachineSelector
                selectedMachines={selectedMachines}
                onSelectionChange={setSelectedMachines}
              />
            </div>
            
            {/* 登録ボタン（モバイル用） */}
            <button
              type="submit"
              disabled={!equipmentGymName || (selectedFreeWeights.size === 0 && selectedMachines.size === 0) || isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-[var(--gt-secondary)] to-[var(--gt-primary)] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:hidden border-2 border-transparent"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  登録処理中...
                </>
              ) : (
                <>
                  <Settings className="w-5 h-5" />
                  ジム機器を登録する
                </>
              )}
            </button>
          </form>
        )}
      </main>

      {/* 種目選択モーダル */}
      {showExerciseSelector && (
        <ExerciseSelector
          onSelect={handleExerciseSelect}
          onClose={() => setShowExerciseSelector(false)}
        />
      )}
    </div>
  )
}

export default function AddGymPostPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[rgba(254,255,250,0.96)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[color:var(--gt-primary-strong)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[color:var(--text-subtle)]">読み込み中...</p>
        </div>
      </div>
    }>
      <AddGymPostContent />
    </Suspense>
  )
}
