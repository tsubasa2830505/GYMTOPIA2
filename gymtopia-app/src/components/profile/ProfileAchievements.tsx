'use client';

import { Achievement } from '@/lib/types/workout';

interface ProfileAchievementsProps {
  achievements: Achievement[];
  isLoading: boolean;
}

export default function ProfileAchievements({ achievements, isLoading }: ProfileAchievementsProps) {
  if (isLoading) {
    return <div className="text-center py-8">­¼-...</div>;
  }

  if (achievements.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[color:var(--text-muted)]">~`Ÿ>LBŠ~[“</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          className="bg-white rounded-lg border border-[rgba(231,103,76,0.2)] p-4"
        >
          <div className="text-3xl mb-2">{achievement.badge_icon}</div>
          <h3 className="font-semibold text-sm mb-1">{achievement.title}</h3>
          <p className="text-xs text-[color:var(--text-muted)]">
            {achievement.description}
          </p>
          <p className="text-xs text-[color:var(--text-subtle)] mt-2">
            {new Date(achievement.earned_at).toLocaleDateString('ja-JP')}
          </p>
        </div>
      ))}
    </div>
  );
}