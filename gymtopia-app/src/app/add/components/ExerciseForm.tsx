import { memo } from 'react'
import { Save, X } from 'lucide-react'
import type { ExerciseFormProps } from '../types'

const ExerciseForm = memo(function ExerciseForm({
  exercise,
  onExerciseChange,
  onSave,
  onCancel
}: ExerciseFormProps) {
  const handleInputChange = (field: keyof typeof exercise, value: string) => {
    onExerciseChange({ ...exercise, [field]: value })
  }

  return (
    <div className="bg-[rgba(254,255,250,0.96)] rounded-lg p-4 border border-[rgba(231,103,76,0.16)] space-y-3">
      <div>
        <label className="block text-xs font-medium text-[color:var(--foreground)] mb-1">
          種目名
        </label>
        <input
          type="text"
          value={exercise.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="例: ベンチプレス"
          className="w-full px-3 py-2 bg-white border border-[rgba(231,103,76,0.16)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-sm"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-[color:var(--foreground)] mb-1">
            重量 (kg)
          </label>
          <input
            type="number"
            value={exercise.weight}
            onChange={(e) => handleInputChange('weight', e.target.value)}
            placeholder="80"
            className="w-full px-3 py-2 bg-white border border-[rgba(231,103,76,0.16)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-sm"
            step="0.25"
            min="0"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[color:var(--foreground)] mb-1">
            セット数
          </label>
          <input
            type="number"
            value={exercise.sets}
            onChange={(e) => handleInputChange('sets', e.target.value)}
            placeholder="3"
            className="w-full px-3 py-2 bg-white border border-[rgba(231,103,76,0.16)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-sm"
            min="1"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[color:var(--foreground)] mb-1">
            回数
          </label>
          <input
            type="number"
            value={exercise.reps}
            onChange={(e) => handleInputChange('reps', e.target.value)}
            placeholder="10"
            className="w-full px-3 py-2 bg-white border border-[rgba(231,103,76,0.16)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-sm"
            min="1"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onSave}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[var(--gt-primary)] text-white rounded-lg hover:bg-[var(--gt-primary-strong)] transition-colors text-sm font-medium"
        >
          <Save className="w-4 h-4" />
          保存
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
        >
          <X className="w-4 h-4" />
          キャンセル
        </button>
      </div>
    </div>
  )
})

export default ExerciseForm