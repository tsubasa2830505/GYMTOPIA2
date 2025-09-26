import type { GymPost } from '@/lib/types/profile'

// ワークアウトセッションからトレーニング詳細をフォーマット
export function formatTrainingDetails(post: GymPost): string | null {
  if (!post.workout_session_id || !post.training_details?.exercises) return null

  return post.training_details.exercises
    .map(exercise => `${exercise.name} ${exercise.weight[0] || 0}kg × ${exercise.reps[0] || 0}回 × ${exercise.sets}セット`)
    .join(' • ')
}

// 重量の合計を計算
export function calculateTotalWeight(exercises: any[]): number {
  return exercises.reduce((total, exercise) => {
    const weight = exercise.weight?.[0] || 0
    const reps = exercise.reps?.[0] || 0
    const sets = exercise.sets || 0
    return total + (weight * reps * sets)
  }, 0)
}

// セットの合計を計算
export function calculateTotalSets(exercises: any[]): number {
  return exercises.reduce((total, exercise) => {
    return total + (exercise.sets || 0)
  }, 0)
}