'use client'

import { Play, Pause, RotateCcw, Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { WorkoutSession, getCurrentWorkout, startWorkoutSession, endWorkoutSession } from '@/lib/supabase/workouts'
import { getCurrentUser } from '@/lib/supabase/auth'

export default function WorkoutPage() {
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutSession | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [loading, setLoading] = useState(true)
  const [startingWorkout, setStartingWorkout] = useState(false)
  const [endingWorkout, setEndingWorkout] = useState(false)

  useEffect(() => {
    loadCurrentWorkout()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && currentWorkout) {
      interval = setInterval(() => {
        const started = new Date(currentWorkout.started_at).getTime()
        const now = new Date().getTime()
        setTimeElapsed(Math.floor((now - started) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, currentWorkout])

  const loadCurrentWorkout = async () => {
    try {
      const workout = await getCurrentWorkout()
      setCurrentWorkout(workout)
      setIsRunning(!!workout)
      if (workout) {
        const started = new Date(workout.started_at).getTime()
        const now = new Date().getTime()
        setTimeElapsed(Math.floor((now - started) / 1000))
      }
    } catch (error) {
      console.error('Failed to load current workout:', error)
    } finally {
      setLoading(false)
    }
  }

  const startWorkout = async () => {
    try {
      setStartingWorkout(true)
      const session = await startWorkoutSession({
        name: '今日のワークアウト',
        target_muscles: ['胸部', '三頭筋']
      })
      setCurrentWorkout(session)
      setIsRunning(true)
      setTimeElapsed(0)
    } catch (error) {
      console.error('Failed to start workout:', error)
    } finally {
      setStartingWorkout(false)
    }
  }

  const endWorkout = async () => {
    if (!currentWorkout) return
    
    try {
      setEndingWorkout(true)
      await endWorkoutSession(currentWorkout.id, 'good')
      setCurrentWorkout(null)
      setIsRunning(false)
      setTimeElapsed(0)
    } catch (error) {
      console.error('Failed to end workout:', error)
    } finally {
      setEndingWorkout(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentWorkout ? currentWorkout.name : '今日のワークアウト'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {currentWorkout 
              ? `開始時刻: ${new Date(currentWorkout.started_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`
              : 'ワークアウトを開始してください'
            }
          </p>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        <section className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              ワークアウトタイマー
            </h2>
            <div className="flex gap-2">
              {!currentWorkout ? (
                <button
                  onClick={startWorkout}
                  disabled={startingWorkout}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {startingWorkout ? '開始中...' : 'ワークアウト開始'}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsRunning(!isRunning)}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {isRunning ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-900 dark:text-white">
              {formatTime(timeElapsed)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              経過時間
            </p>
          </div>
        </section>

        {currentWorkout && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                エクササイズ
              </h2>
              <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus size={20} />
              </button>
            </div>
            
            {currentWorkout.exercises && currentWorkout.exercises.length > 0 ? (
              <div className="space-y-3">
                {currentWorkout.exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
                  >
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      {exercise.exercise_name}
                    </h3>
                    {exercise.machine && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {exercise.machine.name} - {exercise.machine.target_category}
                      </p>
                    )}
                    <div className="space-y-2">
                      {exercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Set {setIndex + 1}
                          </span>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              {set.reps} reps
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {set.weight} kg
                            </span>
                            {set.rest_seconds && (
                              <span className="text-gray-600 dark:text-gray-400">
                                休憩 {set.rest_seconds}秒
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {exercise.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        メモ: {exercise.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  まだエクササイズが追加されていません
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  エクササイズを追加
                </button>
              </div>
            )}
          </section>
        )}

        {currentWorkout && (
          <button 
            onClick={endWorkout}
            disabled={endingWorkout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {endingWorkout ? '完了中...' : 'ワークアウト完了'}
          </button>
        )}

        {!currentWorkout && (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              ワークアウトを開始してトレーニングを記録しましょう
            </p>
            <button
              onClick={startWorkout}
              disabled={startingWorkout}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {startingWorkout ? '開始中...' : 'ワークアウト開始'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}