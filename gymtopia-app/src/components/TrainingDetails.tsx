'use client'

import { Dumbbell, Activity } from 'lucide-react'

interface Exercise {
  name?: string
  weight?: number | number[]
  sets?: number
  reps?: number | number[]
  mets?: number | null
  category?: string | null
  duration?: number | null
  distance?: number | null
  speed?: number | null
}

interface TrainingDetailsProps {
  details?: {
    exercises?: Exercise[]
    crowd_status?: string
  }
  postId: string
  isExpanded: boolean
  onToggle?: () => void
}

export default function TrainingDetails({
  details,
  postId,
  isExpanded,
  onToggle
}: TrainingDetailsProps) {
  const exercises = details?.exercises || []
  const crowdStatus = details?.crowd_status

  if (!exercises || exercises.length === 0) return null

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 border-b border-gray-200 transition-all duration-200"
        disabled={!onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-gray-700">トレーニング詳細</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {exercises.length}種目
            </span>
          </div>
          <div className="text-gray-400">
            {isExpanded ? '▲' : '▼'}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          {/* 筋トレ・ウェイトトレーニング */}
          {exercises.filter(ex => ex.category !== 'cardio').length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-blue-600" />
                筋トレ・ウェイトトレーニング
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-700">種目</th>
                      <th className="text-center py-2 px-3 font-medium text-gray-700">重量</th>
                      <th className="text-center py-2 px-3 font-medium text-gray-700">セット</th>
                      <th className="text-center py-2 px-3 font-medium text-gray-700">回数</th>
                      <th className="text-center py-2 px-3 font-medium text-gray-700">METs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exercises.filter(ex => ex.category !== 'cardio').map((exercise, index) => {
                      const weight = Array.isArray(exercise.weight) ? exercise.weight[0] : exercise.weight
                      const reps = Array.isArray(exercise.reps) ? exercise.reps[0] : exercise.reps

                      return (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{exercise.name || '種目名不明'}</div>
                                {exercise.category && (
                                  <div className="text-xs text-gray-500">
                                    {exercise.category === 'chest' ? '胸' :
                                     exercise.category === 'back' ? '背中' :
                                     exercise.category === 'legs' ? '脚' :
                                     exercise.category === 'shoulders' ? '肩' :
                                     exercise.category === 'arms' ? '腕' :
                                     exercise.category === 'abs' ? '腹筋' :
                                     exercise.category === 'glutes' ? '臀筋' : exercise.category}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-3 px-3">
                            <span className="font-semibold text-gray-900">
                              {(weight ?? 0) > 0 ? `${weight}kg` : '自重'}
                            </span>
                          </td>
                          <td className="text-center py-3 px-3">
                            <span className="font-semibold text-gray-900">
                              {exercise.sets ?? 0}
                            </span>
                          </td>
                          <td className="text-center py-3 px-3">
                            <span className="font-semibold text-gray-900">
                              {reps ?? 0}
                            </span>
                          </td>
                          <td className="text-center py-3 px-3">
                            {exercise.mets && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
                                {exercise.mets}
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 有酸素運動 */}
          {exercises.filter(ex => ex.category === 'cardio').length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-600" />
                有酸素運動
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-700">種目</th>
                      <th className="text-center py-2 px-3 font-medium text-gray-700">時間</th>
                      <th className="text-center py-2 px-3 font-medium text-gray-700">距離</th>
                      <th className="text-center py-2 px-3 font-medium text-gray-700">速度</th>
                      <th className="text-center py-2 px-3 font-medium text-gray-700">METs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exercises.filter(ex => ex.category === 'cardio').map((exercise, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{exercise.name || '種目名不明'}</div>
                              <div className="text-xs text-gray-500">有酸素</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-3 px-3">
                          <span className="font-semibold text-gray-900">
                            {exercise.duration ? `${exercise.duration}分` : '-'}
                          </span>
                        </td>
                        <td className="text-center py-3 px-3">
                          <span className="font-semibold text-gray-900">
                            {exercise.distance ? `${exercise.distance}km` : '-'}
                          </span>
                        </td>
                        <td className="text-center py-3 px-3">
                          <span className="font-semibold text-gray-900">
                            {exercise.speed ? `${exercise.speed}km/h` : '-'}
                          </span>
                        </td>
                        <td className="text-center py-3 px-3">
                          {exercise.mets && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
                              {exercise.mets}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {crowdStatus && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>👥</span>
                <span>混雑状況: {crowdStatus}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}