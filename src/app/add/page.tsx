'use client'

import { 
  Save, X, MapPin, Camera, Plus, Minus, Users, 
  Calendar, Clock, Dumbbell, MessageSquare, Image as ImageIcon 
} from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Exercise {
  id: string
  name: string
  weight: string
  sets: string
  reps: string
}

export default function AddGymPostPage() {
  const router = useRouter()
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

  const crowdOptions = [
    { value: 'empty' as const, label: '空いている', emoji: '😊', color: 'bg-green-100 text-green-700' },
    { value: 'normal' as const, label: '普通', emoji: '😐', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'crowded' as const, label: '混雑', emoji: '😰', color: 'bg-red-100 text-red-700' }
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
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-slate-900">ジム活を投稿</h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!gymName || !content}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Save className="w-4 h-4" />
            投稿する
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
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
                  <div className="text-2xl mb-1">{option.emoji}</div>
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
      </main>
    </div>
  )
}