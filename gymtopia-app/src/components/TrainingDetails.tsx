'use client'

import { useState } from 'react'

interface Exercise {
  name?: string
  weight?: number | number[]
  sets?: number
  reps?: number | number[]
}

interface TrainingDetailsProps {
  exercises?: Exercise[]
  crowdStatus?: string
  isExpanded: boolean
  onToggle: () => void
}

export default function TrainingDetails({
  exercises = [],
  crowdStatus,
  isExpanded,
  onToggle
}: TrainingDetailsProps) {
  if (!exercises || exercises.length === 0) return null

  return (
    <div className="px-4 sm:px-6 pb-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <button
          onClick={onToggle}
          className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 border-b border-slate-200 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-slate-700">トレーニング詳細</span>
              <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                {exercises.length}種目
              </span>
            </div>
            <svg
              className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </div>
        </button>

        {isExpanded && (
          <div className="p-4 border-t border-slate-200">
            <div className="grid gap-3">
              {exercises.map((exercise, index) => {
                const weight = Array.isArray(exercise.weight) ? exercise.weight[0] : exercise.weight
                const reps = Array.isArray(exercise.reps) ? exercise.reps[0] : exercise.reps

                return (
                  <div key={index} className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900">{exercise.name || '種目名不明'}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        <span className="font-semibold text-blue-600">
                          {(weight ?? 0) > 0 ? `${weight}kg` : '自重'}
                        </span>
                      </span>
                      <span className="text-gray-600">
                        <span className="font-semibold text-indigo-600">{exercise.sets ?? 0}</span>セット
                      </span>
                      <span className="text-gray-600">
                        <span className="font-semibold text-purple-600">{reps ?? 0}</span>回
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
            {crowdStatus && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.988 1.988 0 0 0 18 7h-2c-.8 0-1.54.5-1.84 1.25l-1.92 5.77-2.39-2.39A2.002 2.002 0 0 0 8.41 11H6c-.8 0-1.54.5-1.84 1.25L2 18h2v3.5c0 .28.22.5.5.5s.5-.22.5-.5V18h2v3.5c0 .28.22.5.5.5s.5-.22.5-.5V18h10z"/>
                  </svg>
                  <span>混雑状況: {crowdStatus}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}