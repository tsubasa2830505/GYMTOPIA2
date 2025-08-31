'use client'

import { 
  Save, X, MapPin, Camera, Plus, Minus, Users, 
  Calendar, Clock, Dumbbell, MessageSquare, Image as ImageIcon,
  Settings, Package, Building
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import FreeWeightSelector from '@/components/FreeWeightSelector'
import MachineSelector from '@/components/MachineSelector'

interface Exercise {
  id: string
  name: string
  weight: string
  sets: string
  reps: string
}

import { Suspense } from 'react'

function AddGymPostContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'post' | 'equipment'>('post')
  const [gymName, setGymName] = useState('')
  const [content, setContent] = useState('')
  const [crowdStatus, setCrowdStatus] = useState<'empty' | 'normal' | 'crowded'>('normal')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [showExerciseForm, setShowExerciseForm] = useState(false)
  const [currentExercise, setCurrentExercise] = useState<Exercise>({
    id: '',
    name: '',
    weight: '',
    sets: '',
    reps: ''
  })
  
  // 機器登録用の状態
  const [equipmentGymName, setEquipmentGymName] = useState('')
  const [selectedFreeWeights, setSelectedFreeWeights] = useState<Map<string, number>>(new Map())
  const [selectedMachines, setSelectedMachines] = useState<Set<string>>(new Set())
  const [showEquipmentConfirmation, setShowEquipmentConfirmation] = useState(false)

  // ジムリスト（実際はAPIから取得）
  const gymList = [
    'ハンマーストレングス渋谷',
    'ROGUEクロストレーニング新宿',
    'プレミアムフィットネス銀座',
    'GOLD\'S GYM 渋谷',
    'エニタイムフィットネス新宿',
    'ティップネス池袋',
    'コナミスポーツクラブ品川',
  ]

  // URLパラメータからジム情報を取得
  useEffect(() => {
    const gymNameParam = searchParams.get('gymName')
    if (gymNameParam) {
      setGymName(decodeURIComponent(gymNameParam))
    }
  }, [searchParams])

  const crowdOptions = [
    { value: 'empty' as const, label: '空いている', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 6c1.93 0 3.5 1.57 3.5 3.5S13.93 14 12 14s-3.5-1.57-3.5-3.5S10.07 8 12 8zm0 10c-2.03 0-4.43-.82-6.14-2.88C7.55 14.8 9.68 14 12 14s4.45.8 6.14 2.12C16.43 17.18 14.03 18 12 18z"/>
      </svg>
    ), color: 'bg-green-100 text-green-700' },
    { value: 'normal' as const, label: '普通', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
      </svg>
    ), color: 'bg-yellow-100 text-yellow-700' },
    { value: 'crowded' as const, label: '混雑', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-2 .13-2.87.4-.59.18-1.13.9-1.13 1.6v3H5V16h-.97c-.02-.49-.39-.94-.88-1.1zM12 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-2 .13-2.87.4-.59.18-1.13.9-1.13 1.6v3H15V16h-.97c-.02-.49-.39-.94-.88-1.1zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-2 .13-2.87.4-.59.18-1.13.9-1.13 1.6v3H23V16h-.97c-.02-.49-.39-.94-.88-1.1z"/>
      </svg>
    ), color: 'bg-red-100 text-red-700' }
  ]

  const handleAddExercise = () => {
    if (currentExercise.name && currentExercise.weight && currentExercise.sets && currentExercise.reps) {
      setExercises([...exercises, { ...currentExercise, id: Date.now().toString() }])
      setCurrentExercise({ id: '', name: '', weight: '', sets: '', reps: '' })
      setShowExerciseForm(false)
    }
  }

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // ここで投稿処理を実装
    console.log({
      gymName,
      content,
      crowdStatus,
      exercises,
      timestamp: new Date().toISOString()
    })
    router.push('/feed')
  }
  
  const handleEquipmentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // ここで機器登録処理を実装
    console.log({
      gymName: equipmentGymName,
      freeWeights: Array.from(selectedFreeWeights.entries()),
      machines: Array.from(selectedMachines),
      timestamp: new Date().toISOString()
    })
    setShowEquipmentConfirmation(true)
    // 2秒後に画面遷移
    setTimeout(() => {
      router.push('/search')
    }, 2000)
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.back()}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-slate-900">
                {activeTab === 'post' ? 'ジム活を投稿' : 'ジム機器を登録'}
              </h1>
            </div>
            {activeTab === 'post' ? (
              <button
                onClick={handleSubmit}
                disabled={!gymName || !content}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <Save className="w-4 h-4" />
                投稿する
              </button>
            ) : (
              <button
                onClick={handleEquipmentSubmit}
                disabled={!equipmentGymName || (selectedFreeWeights.size === 0 && selectedMachines.size === 0)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <Settings className="w-4 h-4" />
                登録する
              </button>
            )}
          </div>
          
          {/* タブ */}
          <div className="flex border-t border-slate-200">
            <button
              onClick={() => setActiveTab('post')}
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === 'post'
                  ? 'border-blue-500 text-blue-600 font-medium'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              ジム活投稿
            </button>
            <button
              onClick={() => setActiveTab('equipment')}
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === 'equipment'
                  ? 'border-green-500 text-green-600 font-medium'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
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
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">登録完了！</h2>
                <p className="text-slate-600">ジム機器の登録が完了しました</p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'post' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* 日時表示 */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{currentDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{currentTime}</span>
              </div>
            </div>
          </div>

          {/* ジム選択 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-bold text-slate-900 mb-3">
              <MapPin className="w-4 h-4 inline mr-2" />
              ジムを選択 <span className="text-red-500">*</span>
            </label>
            <select
              value={gymName}
              onChange={(e) => setGymName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              required
            >
              <option value="">ジムを選択してください</option>
              {gymList.map((gym) => (
                <option key={gym} value={gym}>{gym}</option>
              ))}
            </select>
          </div>

          {/* 投稿内容 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-bold text-slate-900 mb-3">
              <MessageSquare className="w-4 h-4 inline mr-2" />
              今日のジム活 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="今日のトレーニングはどうでしたか？&#10;新しい発見、達成した目標、感想などを共有しましょう！"
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 resize-none"
              required
            />
            <p className="text-xs text-slate-500 mt-2">{content.length} / 500文字</p>
          </div>

          {/* トレーニング詳細 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Dumbbell className="w-4 h-4" />
                トレーニング詳細
                <span className="text-xs text-slate-500 font-normal">（オプション）</span>
              </h3>
              {!showExerciseForm && (
                <button
                  type="button"
                  onClick={() => setShowExerciseForm(true)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  種目を追加
                </button>
              )}
            </div>

            {/* 追加済みの種目リスト */}
            {exercises.length > 0 && (
              <div className="space-y-2 mb-4">
                {exercises.map((exercise) => (
                  <div key={exercise.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{exercise.name}</p>
                      <p className="text-sm text-slate-600">
                        {exercise.weight}kg × {exercise.sets}セット × {exercise.reps}回
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(exercise.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <p className="text-xs text-slate-500 mt-2">
                  合計: {exercises.length}種目
                </p>
              </div>
            )}

            {/* 種目追加フォーム */}
            {showExerciseForm && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                <input
                  type="text"
                  placeholder="種目名（例：ベンチプレス）"
                  value={currentExercise.name}
                  onChange={(e) => setCurrentExercise({ ...currentExercise, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="重量(kg)"
                    value={currentExercise.weight}
                    onChange={(e) => setCurrentExercise({ ...currentExercise, weight: e.target.value })}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="セット数"
                    value={currentExercise.sets}
                    onChange={(e) => setCurrentExercise({ ...currentExercise, sets: e.target.value })}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="回数"
                    value={currentExercise.reps}
                    onChange={(e) => setCurrentExercise({ ...currentExercise, reps: e.target.value })}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddExercise}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    追加
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowExerciseForm(false)
                      setCurrentExercise({ id: '', name: '', weight: '', sets: '', reps: '' })
                    }}
                    className="flex-1 px-3 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 混雑状況 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-bold text-slate-900 mb-3">
              <Users className="w-4 h-4 inline mr-2" />
              混雑状況 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {crowdOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCrowdStatus(option.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    crowdStatus === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="mb-1">{option.icon}</div>
                  <p className={`text-sm font-medium ${
                    crowdStatus === option.value ? 'text-blue-700' : 'text-slate-700'
                  }`}>
                    {option.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 写真追加 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-bold text-slate-900 mb-3">
              <Camera className="w-4 h-4 inline mr-2" />
              写真を追加
              <span className="text-xs text-slate-500 font-normal ml-2">（オプション）</span>
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm text-slate-600">クリックして写真を選択</p>
              <p className="text-xs text-slate-500 mt-1">または、ドラッグ&ドロップ</p>
              <input type="file" accept="image/*" className="hidden" />
            </div>
          </div>

          {/* 投稿ボタン（モバイル用） */}
          <button
            type="submit"
            disabled={!gymName || !content}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:hidden"
          >
            <Save className="w-5 h-5" />
            ジム活を投稿する
          </button>
          </form>
        ) : (
          <form onSubmit={handleEquipmentSubmit} className="space-y-6">
            {/* ジム選択（機器登録用） */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <label className="block text-sm font-bold text-slate-900 mb-3">
                <Building className="w-4 h-4 inline mr-2" />
                登録するジム <span className="text-red-500">*</span>
              </label>
              <select
                value={equipmentGymName}
                onChange={(e) => setEquipmentGymName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-900"
                required
              >
                <option value="">ジムを選択してください</option>
                {gymList.map((gym) => (
                  <option key={gym} value={gym}>{gym}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-2">
                ジムオーナーまたは管理者の方のみ登録をお願いします
              </p>
            </div>
            
            {/* フリーウェイト選択 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Dumbbell className="w-4 h-4" />
                フリーウェイト機器
                <span className="text-xs text-slate-500 font-normal">（該当するものを選択）</span>
              </h3>
              <FreeWeightSelector
                selectedFreeWeights={selectedFreeWeights}
                onSelectionChange={setSelectedFreeWeights}
              />
            </div>
            
            {/* マシン選択 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                トレーニングマシン
                <span className="text-xs text-slate-500 font-normal">（3軸フィルターで絞り込み）</span>
              </h3>
              <MachineSelector
                selectedMachines={selectedMachines}
                onSelectionChange={setSelectedMachines}
              />
            </div>
            
            {/* 登録ボタン（モバイル用） */}
            <button
              type="submit"
              disabled={!equipmentGymName || (selectedFreeWeights.size === 0 && selectedMachines.size === 0)}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:hidden"
            >
              <Settings className="w-5 h-5" />
              ジム機器を登録する
            </button>
          </form>
        )}
      </main>
    </div>
  )
}

export default function AddGymPostPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </div>
    }>
      <AddGymPostContent />
    </Suspense>
  )
}