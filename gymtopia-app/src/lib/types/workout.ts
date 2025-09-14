// Workout-related types used across profile and feed

export interface Achievement {
  id: string
  user_id: string
  achievement_type: 'streak' | 'personal_record' | 'consistency' | 'milestone'
  title: string
  description?: string
  badge_icon?: string
  earned_at: string
  metadata?: Record<string, any>
}

export interface PersonalRecord {
  id: string
  user_id: string
  exercise_name: string
  record_type: '1rm' | '3rm' | '5rm' | '10rm' | 'max_reps'
  weight?: number
  reps?: number
  volume_kg?: number
  duration_seconds?: number
  distance_meters?: number
  calories_burned?: number
  achieved_at: string
  gym_id?: string
  notes?: string
  created_at: string
}

