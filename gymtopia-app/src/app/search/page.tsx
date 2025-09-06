'use client'

import { Search, Filter } from 'lucide-react'
import { useState } from 'react'

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const exercises = [
    { name: 'ベンチプレス', category: '胸', equipment: 'バーベル' },
    { name: 'スクワット', category: '脚', equipment: 'バーベル' },
    { name: 'デッドリフト', category: '背中', equipment: 'バーベル' },
    { name: 'ショルダープレス', category: '肩', equipment: 'ダンベル' },
    { name: 'ラットプルダウン', category: '背中', equipment: 'マシン' },
    { name: 'レッグプレス', category: '脚', equipment: 'マシン' },
  ]

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.category.includes(searchQuery) ||
    exercise.equipment.includes(searchQuery)
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="エクササイズを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Filter className="text-gray-400 w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        <div className="grid gap-4">
          {filteredExercises.map((exercise, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {exercise.name}
              </h3>
              <div className="flex gap-2 mt-2">
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">
                  {exercise.category}
                </span>
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                  {exercise.equipment}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}