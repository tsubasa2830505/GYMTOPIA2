'use client'

import React, { useState, useEffect } from 'react'
import { Search, X, Dumbbell, Activity } from 'lucide-react'
import { getExercises, type ExerciseMaster } from '@/lib/supabase/exercises'
import {
  getCategoryDisplayName,
  getEquipmentDisplayName,
  getIntensityLevel,
  type ExerciseCategory,
  type Exercise
} from '@/data/exercise-master'

interface ExerciseSelectorProps {
  onSelect: (exercise: Exercise) => void
  onClose: () => void
}

export default function ExerciseSelector({ onSelect, onClose }: ExerciseSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'all'>('all')
  const [exercises, setExercises] = useState<ExerciseMaster[]>([])
  const [filteredExercises, setFilteredExercises] = useState<ExerciseMaster[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const categories: Array<ExerciseCategory | 'all'> = [
    'all',
    'chest',
    'back',
    'legs',
    'shoulders',
    'arms',
    'abs',
    'glutes',
    'cardio'
  ]

  // データベースから種目データを取得
  useEffect(() => {
    loadExercises()
  }, [])

  const loadExercises = async () => {
    setIsLoading(true)
    try {
      const data = await getExercises()
      setExercises(data)
      setFilteredExercises(data)
    } catch (error) {
      console.error('Failed to load exercises:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let filtered = exercises

    // カテゴリフィルタ
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ex => ex.category === selectedCategory)
    }

    // 検索フィルタ
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        ex =>
          ex.name.toLowerCase().includes(query) ||
          ex.description?.toLowerCase().includes(query) ||
          getEquipmentDisplayName(ex.equipment_type as any).toLowerCase().includes(query)
      )
    }

    setFilteredExercises(filtered)
  }, [searchQuery, selectedCategory, exercises])

  const getCategoryIcon = (category: ExerciseCategory | 'all') => {
    // マテリアルデザインアイコン（SVGパス）を返す
    if (category === 'all') {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
        </svg>
      )
    }

    const icons: Record<ExerciseCategory, JSX.Element> = {
      chest: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      back: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
        </svg>
      ),
      legs: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
        </svg>
      ),
      shoulders: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
        </svg>
      ),
      arms: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
        </svg>
      ),
      abs: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l-5.5 9h11z M12 22l5.5-9h-11z"/>
        </svg>
      ),
      glutes: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>
        </svg>
      ),
      cardio: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
        </svg>
      )
    }
    return icons[category] || (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
      </svg>
    )
  }

  const getIntensityColor = (mets: number) => {
    const level = getIntensityLevel(mets)
    switch (level) {
      case '軽強度':
        return 'bg-green-100 text-green-800 border-green-200'
      case '中強度':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case '高強度':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case '超高強度':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-3xl max-h-[85vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-6 h-6 text-[color:var(--gt-primary)]" />
              <h2 className="text-xl font-bold text-gray-900">トレーニング種目を選択</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* 検索バー */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="種目名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] focus:border-transparent"
            />
          </div>

          {/* カテゴリセレクタボタン */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 font-medium text-sm ${
                  selectedCategory === category
                    ? 'bg-[color:var(--gt-primary)] text-white border-[color:var(--gt-primary)]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[color:var(--gt-primary)] hover:bg-[rgba(231,103,76,0.04)]'
                }`}
              >
                <span className={selectedCategory === category ? 'text-white' : 'text-gray-600'}>
                  {getCategoryIcon(category)}
                </span>
                <span>
                  {category === 'all' ? 'すべて' : getCategoryDisplayName(category as ExerciseCategory)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 種目リスト */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--gt-primary)] border-t-transparent mb-4"></div>
              <p className="text-gray-500">種目データを読み込み中...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* カテゴリ別に種目をグループ表示 */}
              {selectedCategory === 'all' ? (
                // 全カテゴリ表示
                categories.filter(cat => cat !== 'all').map((category) => {
                  const categoryExercises = filteredExercises.filter(ex => ex.category === category)
                  if (categoryExercises.length === 0) return null

                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                        <span className="text-[color:var(--gt-primary)]">
                          {getCategoryIcon(category as ExerciseCategory)}
                        </span>
                        <h3 className="font-bold text-gray-900">
                          {getCategoryDisplayName(category as ExerciseCategory)}
                        </h3>
                        <span className="text-sm text-gray-500">({categoryExercises.length}種目)</span>
                      </div>
                      <div className="space-y-2">
                        {categoryExercises.map((exercise) => (
                          <ExerciseCard key={exercise.id} exercise={exercise} onSelect={onSelect} />
                        ))}
                      </div>
                    </div>
                  )
                })
              ) : (
                // 特定カテゴリのみ表示
                <div className="space-y-2">
                  {filteredExercises.length > 0 ? (
                    filteredExercises.map((exercise) => (
                      <ExerciseCard key={exercise.id} exercise={exercise} onSelect={onSelect} />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">該当する種目が見つかりません</p>
                      <p className="text-sm text-gray-400 mt-2">検索条件を変更してください</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredExercises.length}種目が見つかりました
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 種目カードコンポーネント
function ExerciseCard({ exercise, onSelect }: { exercise: ExerciseMaster; onSelect: (exercise: Exercise) => void }) {
  const getIntensityColor = (mets: number) => {
    const level = getIntensityLevel(mets)
    switch (level) {
      case '軽強度':
        return 'bg-green-100 text-green-800 border-green-200'
      case '中強度':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case '高強度':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case '超高強度':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <button
      onClick={() => onSelect({
        name: exercise.name,
        base_mets: exercise.base_mets,
        equipment_type: exercise.equipment_type as any,
        category: exercise.category as any,
        description: exercise.description
      })}
      className="w-full p-4 bg-white border border-gray-200 rounded-lg hover:border-[var(--gt-primary)] hover:bg-[rgba(231,103,76,0.04)] transition-all text-left group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900 group-hover:text-[color:var(--gt-primary)]">
              {exercise.name}
            </h3>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getIntensityColor(exercise.base_mets)}`}>
              {getIntensityLevel(exercise.base_mets)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{exercise.description}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-[var(--gt-secondary)] rounded-full"></span>
              {getEquipmentDisplayName(exercise.equipment_type as any)}
            </span>
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              METs: {exercise.base_mets}
            </span>
          </div>
        </div>
        <div className="ml-4 text-gray-400 group-hover:text-[color:var(--gt-primary)]">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
      </div>
    </button>
  )
}