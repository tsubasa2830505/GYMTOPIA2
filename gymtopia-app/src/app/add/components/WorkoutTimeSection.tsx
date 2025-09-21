import { memo } from 'react'
import { Calendar, Clock } from 'lucide-react'
import type { WorkoutTimeProps } from '../types'

const WorkoutTimeSection = memo(function WorkoutTimeSection({
  workoutStartTime,
  workoutEndTime,
  onStartTimeChange,
  onEndTimeChange,
  currentDate,
  currentTime
}: WorkoutTimeProps) {
  const calculateWorkoutDuration = () => {
    if (!workoutStartTime || !workoutEndTime) return '計算中...'

    const start = new Date(`2000-01-01T${workoutStartTime}`)
    const end = new Date(`2000-01-01T${workoutEndTime}`)
    const diff = Math.floor((end.getTime() - start.getTime()) / 60000)

    if (diff > 0) {
      const hours = Math.floor(diff / 60)
      const minutes = diff % 60
      return hours > 0 ? `${hours}時間${minutes}分` : `${minutes}分`
    }
    return '計算中...'
  }

  return (
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
            onChange={(e) => onStartTimeChange(e.target.value)}
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
            onChange={(e) => onEndTimeChange(e.target.value)}
            className="w-full px-3 py-2 bg-[rgba(254,255,250,0.96)] border border-[rgba(231,103,76,0.16)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-sm"
          />
        </div>
      </div>

      {workoutStartTime && workoutEndTime && (
        <div className="mt-2 text-xs text-[color:var(--text-subtle)]">
          ワークアウト時間: {calculateWorkoutDuration()}
        </div>
      )}
    </div>
  )
})

export default WorkoutTimeSection