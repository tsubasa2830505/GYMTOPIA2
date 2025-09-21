'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dumbbell, Clock, Calendar, Plus, X, Save,
  TrendingUp, Target, Activity, ChevronRight,
  Trash2, Edit2, Check
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getSupabaseClient } from '@/lib/supabase/client'

interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  weight: number
  notes?: string
}

interface WorkoutSession {
  id: string
  date: string
  duration: number
  exercises: Exercise[]
  totalVolume: number
  notes?: string
}

export default function WorkoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'record' | 'history'>('record')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([])
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [workoutNotes, setWorkoutNotes] = useState('')
  const [showExerciseForm, setShowExerciseForm] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // フォーム用の状態
  const [exerciseName, setExerciseName] = useState('')
  const [sets, setSets] = useState('3')
  const [reps, setReps] = useState('10')
  const [weight, setWeight] = useState('')
  const [exerciseNotes, setExerciseNotes] = useState('')

  // タイマー機能
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, startTime])

  // ワークアウト履歴を取得
  useEffect(() => {
    if (user) {
      fetchWorkoutHistory()
    }
  }, [user])

  const fetchWorkoutHistory = async () => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(10)

      if (error) throw error
      setWorkoutHistory(data || [])
    } catch (error) {
      console.error('Error fetching workout history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startWorkout = () => {
    setStartTime(new Date())
    setIsTimerRunning(true)
  }

  const stopWorkout = () => {
    setIsTimerRunning(false)
  }

  const addExercise = () => {
    if (!exerciseName || !sets || !reps || !weight) return

    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: exerciseName,
      sets: parseInt(sets),
      reps: parseInt(reps),
      weight: parseFloat(weight),
      notes: exerciseNotes
    }

    if (editingExercise) {
      setExercises(exercises.map(ex =>
        ex.id === editingExercise.id ? newExercise : ex
      ))
      setEditingExercise(null)
    } else {
      setExercises([...exercises, newExercise])
    }

    // フォームリセット
    setExerciseName('')
    setSets('3')
    setReps('10')
    setWeight('')
    setExerciseNotes('')
    setShowExerciseForm(false)
  }

  const deleteExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id))
  }

  const editExercise = (exercise: Exercise) => {
    setEditingExercise(exercise)
    setExerciseName(exercise.name)
    setSets(exercise.sets.toString())
    setReps(exercise.reps.toString())
    setWeight(exercise.weight.toString())
    setExerciseNotes(exercise.notes || '')
    setShowExerciseForm(true)
  }

  const calculateTotalVolume = () => {
    return exercises.reduce((total, ex) =>
      total + (ex.sets * ex.reps * ex.weight), 0
    )
  }

  const saveWorkout = async () => {
    if (!user || exercises.length === 0) return

    try {
      const supabase = getSupabaseClient()
      const workoutData = {
        user_id: user.id,
        date: new Date().toISOString(),
        duration: elapsedTime,
        exercises: exercises,
        total_volume: calculateTotalVolume(),
        notes: workoutNotes
      }

      const { error } = await supabase
        .from('workout_sessions')
        .insert(workoutData)

      if (error) throw error

      // リセット
      setExercises([])
      setWorkoutNotes('')
      setElapsedTime(0)
      setIsTimerRunning(false)
      setStartTime(null)

      // 履歴を更新
      fetchWorkoutHistory()

      // 履歴タブに切り替え
      setActiveTab('history')
    } catch (error) {
      console.error('Error saving workout:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-24">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Dumbbell className="w-7 h-7 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">ワークアウト</h1>
            </div>
            {isTimerRunning && (
              <div className="flex items-center gap-2 bg-blue-100 px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700 font-mono font-semibold">
                  {formatTime(elapsedTime)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* タブ */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setActiveTab('record')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'record'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            記録する
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            履歴
          </button>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        {activeTab === 'record' ? (
          <div className="space-y-4">
            {/* タイマーコントロール */}
            {!isTimerRunning && !startTime ? (
              <button
                onClick={startWorkout}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Activity className="w-5 h-5" />
                ワークアウトを開始
              </button>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">経過時間</p>
                    <p className="text-3xl font-bold text-gray-900 font-mono">
                      {formatTime(elapsedTime)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {isTimerRunning ? (
                      <button
                        onClick={stopWorkout}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        一時停止
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsTimerRunning(true)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        再開
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* エクササイズリスト */}
            {(isTimerRunning || startTime) && (
              <>
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">エクササイズ</h2>
                    <button
                      onClick={() => setShowExerciseForm(true)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      追加
                    </button>
                  </div>

                  {exercises.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      エクササイズを追加してください
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {exercises.map((exercise) => (
                        <div key={exercise.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{exercise.name}</h3>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                <span>{exercise.sets}セット</span>
                                <span>{exercise.reps}回</span>
                                <span>{exercise.weight}kg</span>
                              </div>
                              {exercise.notes && (
                                <p className="text-xs text-gray-500 mt-1">{exercise.notes}</p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => editExercise(exercise)}
                                className="p-1.5 text-gray-400 hover:text-blue-600"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteExercise(exercise.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* メモ */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">メモ</h2>
                  <textarea
                    value={workoutNotes}
                    onChange={(e) => setWorkoutNotes(e.target.value)}
                    placeholder="今日のワークアウトについてメモを残す..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                {/* 統計 */}
                {exercises.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-4 text-white">
                    <h2 className="text-lg font-semibold mb-3">統計</h2>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-blue-100 text-sm">総重量</p>
                        <p className="text-2xl font-bold">{calculateTotalVolume()}kg</p>
                      </div>
                      <div>
                        <p className="text-blue-100 text-sm">種目数</p>
                        <p className="text-2xl font-bold">{exercises.length}</p>
                      </div>
                      <div>
                        <p className="text-blue-100 text-sm">セット数</p>
                        <p className="text-2xl font-bold">
                          {exercises.reduce((total, ex) => total + ex.sets, 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 保存ボタン */}
                {exercises.length > 0 && (
                  <button
                    onClick={saveWorkout}
                    className="w-full bg-green-600 text-white py-4 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Save className="w-5 h-5" />
                    ワークアウトを保存
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          /* 履歴タブ */
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">読み込み中...</p>
              </div>
            ) : workoutHistory.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">まだワークアウトの記録がありません</p>
              </div>
            ) : (
              workoutHistory.map((session) => (
                <div key={session.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-600">
                        {new Date(session.date).toLocaleDateString('ja-JP', {
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short'
                        })}
                      </p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        総重量: {session.totalVolume}kg
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{formatTime(session.duration)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {session.exercises.map((exercise: Exercise, index: number) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{exercise.name}</span>
                        <span className="text-gray-600">
                          {exercise.sets} × {exercise.reps} @ {exercise.weight}kg
                        </span>
                      </div>
                    ))}
                  </div>

                  {session.notes && (
                    <p className="text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100">
                      {session.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* エクササイズ追加フォーム */}
      {showExerciseForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingExercise ? 'エクササイズを編集' : 'エクササイズを追加'}
              </h2>
              <button
                onClick={() => {
                  setShowExerciseForm(false)
                  setEditingExercise(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  種目名
                </label>
                <input
                  type="text"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  placeholder="例: ベンチプレス"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    セット数
                  </label>
                  <input
                    type="number"
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    回数
                  </label>
                  <input
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    重量 (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メモ（任意）
                </label>
                <textarea
                  value={exerciseNotes}
                  onChange={(e) => setExerciseNotes(e.target.value)}
                  placeholder="フォームの注意点など..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              <button
                onClick={addExercise}
                disabled={!exerciseName || !sets || !reps || !weight}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                {editingExercise ? '更新する' : '追加する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}