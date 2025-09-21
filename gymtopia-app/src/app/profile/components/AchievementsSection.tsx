import { memo } from 'react'
import { getAchievementIcon } from '../utils/helpers.tsx'
import type { Achievement, PersonalRecord } from '@/lib/types/workout'

interface AchievementsSectionProps {
  userAchievements: Achievement[]
  personalRecords: PersonalRecord[]
  isLoadingAchievements: boolean
}

const AchievementsSection = memo(function AchievementsSection({
  userAchievements,
  personalRecords,
  isLoadingAchievements
}: AchievementsSectionProps) {
  if (isLoadingAchievements) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--gt-primary)] mx-auto"></div>
        <p className="text-[color:var(--text-muted)] mt-4">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Achievements */}
      <div>
        <h3 className="text-lg font-semibold text-[color:var(--foreground)] mb-4">
          獲得バッジ
        </h3>
        {userAchievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-white rounded-lg p-4 border border-[rgba(186,122,103,0.1)] hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{getAchievementIcon(achievement.badge_icon, achievement.achievement_type)}</span>
                  <div>
                    <h4 className="font-medium text-[color:var(--foreground)]">
                      {achievement.name}
                    </h4>
                    <p className="text-xs text-[color:var(--text-muted)]">
                      {new Date(achievement.earned_at).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-[color:var(--text-muted)]">
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-[color:var(--text-muted)]">まだバッジを獲得していません</p>
            <p className="text-sm text-[color:var(--text-muted)] mt-1">
              トレーニングを続けてバッジを獲得しましょう！
            </p>
          </div>
        )}
      </div>

      {/* Personal Records */}
      <div>
        <h3 className="text-lg font-semibold text-[color:var(--foreground)] mb-4">
          個人記録 (PR)
        </h3>
        {personalRecords.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personalRecords.map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-lg p-4 border border-[rgba(186,122,103,0.1)] hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-[color:var(--foreground)]">
                    {record.exercise_name}
                  </h4>
                  <span className="text-lg font-bold text-[color:var(--gt-primary)]">
                    {record.weight}kg
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-[color:var(--text-muted)]">
                  <span>{record.reps}回 × {record.sets}セット</span>
                  <span>{new Date(record.achieved_at).toLocaleDateString('ja-JP')}</span>
                </div>
                {record.notes && (
                  <p className="text-sm text-[color:var(--text-muted)] mt-2 italic">
                    {record.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-[color:var(--text-muted)]">まだ個人記録がありません</p>
            <p className="text-sm text-[color:var(--text-muted)] mt-1">
              トレーニングで新しい記録に挑戦しましょう！
            </p>
          </div>
        )}
      </div>
    </div>
  )
})

export default AchievementsSection
