'use client'

import { Play, Pause, RotateCcw, Plus } from 'lucide-react'
import { useState } from 'react'

export default function WorkoutPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [selectedExercises, setSelectedExercises] = useState([
    { name: 'ベンチプレス', sets: 3, reps: 10, weight: 60 },
    { name: 'インクラインダンベルプレス', sets: 3, reps: 12, weight: 20 },
    { name: 'ケーブルフライ', sets: 3, reps: 15, weight: 15 },
  ])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            今日のワークアウト
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            胸・三頭筋の日
          </p>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        <section className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              タイマー
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isRunning ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                <RotateCcw size={20} />
              </button>
            </div>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-900 dark:text-white">
              00:00
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              経過時間
            </p>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              エクササイズ
            </h2>
            <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus size={20} />
            </button>
          </div>
          
          <div className="space-y-3">
            {selectedExercises.map((exercise, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  {exercise.name}
                </h3>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">セット</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {exercise.sets}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">レップ</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {exercise.reps}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">重量(kg)</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {exercise.weight}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  {[...Array(exercise.sets)].map((_, setIndex) => (
                    <button
                      key={setIndex}
                      className="flex-1 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors text-sm"
                    >
                      Set {setIndex + 1}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
          ワークアウト完了
        </button>
      </main>
    </div>
  )
}