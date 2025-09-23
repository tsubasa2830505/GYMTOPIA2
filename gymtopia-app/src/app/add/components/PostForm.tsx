import { memo } from 'react'
import { Save, MapPin, Calendar, Clock, MessageSquare, Plus, Minus, Camera, ImageIcon, Users } from 'lucide-react'
import Image from 'next/image'
import WorkoutTimeSection from './WorkoutTimeSection'
import ExerciseForm from './ExerciseForm'
import type { PostFormProps, Exercise } from '../types'

const PostForm = memo(function PostForm({
  state,
  onStateChange,
  onSubmit,
  onImageSelect,
  onRemoveImage,
  onExerciseAdd,
  onExerciseEdit,
  onExerciseRemove,
  currentDate,
  currentTime
}: PostFormProps) {
  const handleExerciseFormSubmit = () => {
    onExerciseAdd()
  }

  const handleExerciseFormCancel = () => {
    onStateChange({
      showExerciseForm: false,
      currentExercise: { id: '', name: '', weight: '', sets: '', reps: '' }
    })
  }

  return (
    <form id="post-form" onSubmit={onSubmit} className="space-y-6">
      {/* チェックインからの投稿バナー */}
      {state.checkInGymName && (
        <div className="bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium opacity-90">Check-In</p>
              <p className="text-lg font-bold">{state.checkInGymName}</p>
            </div>
          </div>
          <p className="text-xs mt-2 opacity-80">
            このジムでのトレーニングを記録しましょう！
          </p>
        </div>
      )}

      {/* 日時表示とワークアウト時間 */}
      <WorkoutTimeSection
        workoutStartTime={state.workoutStartTime}
        workoutEndTime={state.workoutEndTime}
        onStartTimeChange={(time) => onStateChange({ workoutStartTime: time })}
        onEndTimeChange={(time) => onStateChange({ workoutEndTime: time })}
        currentDate={currentDate}
        currentTime={currentTime}
      />

      {/* ジム選択 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <label className="block text-sm font-bold text-[color:var(--foreground)] mb-3">
          <MapPin className="w-4 h-4 inline mr-2" />
          ジムを選択 <span className="text-[color:var(--gt-primary)]">*</span>
        </label>
        <select
          value={state.gymName}
          onChange={(e) => onStateChange({ gymName: e.target.value })}
          className="w-full px-4 py-3 bg-[rgba(254,255,250,0.96)] border border-[rgba(231,103,76,0.16)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-[color:var(--foreground)]"
          required
        >
          <option value="">ジムを選択してください</option>
          {state.gymList.map((gym, index) => (
            <option key={`${gym}-${index}`} value={gym}>{gym}</option>
          ))}
        </select>
      </div>

      {/* 投稿内容 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <label className="block text-sm font-bold text-[color:var(--foreground)] mb-3">
          <MessageSquare className="w-4 h-4 inline mr-2" />
          投稿内容 <span className="text-[color:var(--gt-primary)]">*</span>
        </label>
        <textarea
          value={state.content}
          onChange={(e) => onStateChange({ content: e.target.value })}
          placeholder="今日のトレーニングはどうでしたか？"
          className="w-full px-4 py-3 bg-[rgba(254,255,250,0.96)] border border-[rgba(231,103,76,0.16)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-[color:var(--foreground)] placeholder-[color:var(--text-muted)] min-h-[120px] resize-none"
          required
        />
      </div>

      {/* 混雑状況 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <label className="block text-sm font-bold text-[color:var(--foreground)] mb-3">
          <Users className="w-4 h-4 inline mr-2" />
          混雑状況
        </label>
        <div className="flex gap-3">
          {[
            { value: 'empty', label: '空いている', color: 'bg-green-100 text-green-800 border-green-200' },
            { value: 'normal', label: '普通', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
            { value: 'crowded', label: '混雑', color: 'bg-red-100 text-red-800 border-red-200' }
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onStateChange({ crowdStatus: option.value as any })}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-colors ${
                state.crowdStatus === option.value
                  ? option.color
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 画像選択 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <label className="block text-sm font-bold text-[color:var(--foreground)] mb-3">
          <Camera className="w-4 h-4 inline mr-2" />
          画像を追加
        </label>
        <div className="space-y-4">
          {state.selectedImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {state.selectedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={URL.createObjectURL(image)}
                    alt={`選択された画像 ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveImage(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {state.selectedImages.length < 5 && (
            <label className="block">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={onImageSelect}
                className="hidden"
              />
              <div className="border-2 border-dashed border-[rgba(231,103,76,0.26)] rounded-lg p-6 text-center hover:border-[var(--gt-primary)] transition-colors cursor-pointer">
                <ImageIcon className="w-8 h-8 text-[color:var(--text-muted)] mx-auto mb-2" />
                <p className="text-sm text-[color:var(--text-muted)]">
                  クリックして画像を選択 (最大5枚)
                </p>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* 運動記録 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-bold text-[color:var(--foreground)]">
            <MessageSquare className="w-4 h-4 inline mr-2" />
            運動記録
          </label>
          <button
            type="button"
            onClick={() => onStateChange({ showExerciseForm: !state.showExerciseForm })}
            className="flex items-center gap-2 px-3 py-1.5 bg-[var(--gt-primary)] text-white rounded-lg hover:bg-[var(--gt-primary-strong)] transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            種目を追加
          </button>
        </div>

        {state.showExerciseForm && (
          <div className="mb-4">
            <ExerciseForm
              exercise={state.currentExercise}
              onExerciseChange={(exercise) => onStateChange({ currentExercise: exercise })}
              onSave={handleExerciseFormSubmit}
              onCancel={handleExerciseFormCancel}
            />
          </div>
        )}

        {state.exercises.length > 0 && (
          <div className="space-y-3">
            {state.exercises.map((exercise, index) => (
              <div key={exercise.id} className="flex items-center justify-between p-3 bg-[rgba(254,255,250,0.8)] border border-[rgba(231,103,76,0.16)] rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-[color:var(--foreground)]">{exercise.name}</div>
                  <div className="text-sm text-[color:var(--text-muted)]">
                    {exercise.weight}kg × {exercise.reps}回 × {exercise.sets}セット
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onExerciseEdit(exercise, index)}
                    className="p-1 text-[color:var(--text-muted)] hover:text-[var(--gt-primary)] transition-colors"
                  >
                    編集
                  </button>
                  <button
                    type="button"
                    onClick={() => onExerciseRemove(exercise.id)}
                    className="p-1 text-[color:var(--text-muted)] hover:text-red-500 transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 投稿設定 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-bold text-[color:var(--foreground)] flex items-center gap-2">
            <Clock className="w-4 h-4" />
            遅延投稿
          </label>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={state.isDelayedPost}
              onChange={(e) => onStateChange({ isDelayedPost: e.target.checked })}
              className="w-4 h-4 text-[color:var(--gt-primary)] bg-white border-[rgba(231,103,76,0.26)] rounded focus:ring-[color:var(--gt-primary)] focus:ring-2"
            />
          </div>
        </div>

        {state.isDelayedPost && (
          <div className="space-y-4">
            {/* 遅延時間選択 */}
            <div>
              <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
                投稿タイミング
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 5, label: '5分後' },
                  { value: 15, label: '15分後' },
                  { value: 30, label: '30分後' },
                  { value: 60, label: '1時間後' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onStateChange({ delayMinutes: option.value })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      state.delayMinutes === option.value
                        ? 'bg-[color:var(--gt-primary)] text-white'
                        : 'bg-[rgba(231,103,76,0.12)] text-[color:var(--gt-primary-strong)] hover:bg-[rgba(231,103,76,0.18)]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 共有レベル設定 */}
            <div>
              <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
                共有レベル
              </label>
              <select
                value={state.shareLevel}
                onChange={(e) => onStateChange({ shareLevel: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-[rgba(231,103,76,0.16)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-sm"
              >
                <option value="badge_only">バッジのみ</option>
                <option value="gym_name">ジム名</option>
                <option value="gym_with_area">ジム名+エリア</option>
                <option value="none">非表示</option>
              </select>
            </div>

            {/* 公開範囲設定 */}
            <div>
              <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
                公開範囲
              </label>
              <select
                value={state.audience}
                onChange={(e) => onStateChange({ audience: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-[rgba(231,103,76,0.16)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-sm"
              >
                <option value="public">公開</option>
                <option value="friends">フレンドのみ</option>
                <option value="private">非公開</option>
              </select>
            </div>

            {/* 予告表示 */}
            <div className="bg-[rgba(231,103,76,0.08)] rounded-lg p-3">
              <p className="text-sm text-[color:var(--gt-primary-strong)]">
                {state.delayMinutes}分後に自動投稿されます
              </p>
              <p className="text-xs text-[color:var(--text-muted)] mt-1">
                予定時刻: {new Date(Date.now() + state.delayMinutes * 60 * 1000).toLocaleString('ja-JP')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 投稿ボタン */}
      <div className="sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border border-[rgba(231,103,76,0.16)]">
        <button
          type="submit"
          disabled={state.isSubmitting || state.uploadingImages}
          className={`w-full py-4 px-6 rounded-lg font-bold text-white transition-all ${
            state.isSubmitting || state.uploadingImages
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] hover:from-[var(--gt-primary-strong)] hover:to-[var(--gt-tertiary)] shadow-lg hover:shadow-xl'
          }`}
        >
          {state.isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              投稿中...
            </div>
          ) : state.uploadingImages ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              画像アップロード中...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Save className="w-5 h-5" />
              {state.isDelayedPost ? `${state.delayMinutes}分後に投稿` : '投稿する'}
            </div>
          )}
        </button>
      </div>
    </form>
  )
})

export default PostForm