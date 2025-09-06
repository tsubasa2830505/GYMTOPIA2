// Workout and fitness tracking types for GYMTOPIA 2.0

// ========================================
// EXERCISE & TEMPLATES
// ========================================

export interface ExerciseTemplate {
  id: string
  name: string
  category: 'strength' | 'cardio' | 'flexibility' | 'balance'
  target_muscles: string[]
  equipment_needed: string[]
  instructions: string
  form_tips?: string
  difficulty_level: 1 | 2 | 3 | 4 | 5
  estimated_calories_per_minute: number
  created_at: string
}

export interface WorkoutRoutine {
  id: string
  user_id: string
  name: string
  description?: string
  goal: 'strength' | 'muscle_gain' | 'weight_loss' | 'endurance' | 'general_fitness'
  difficulty_level: 1 | 2 | 3 | 4 | 5
  estimated_duration_minutes: number
  frequency_per_week: number
  is_public: boolean
  likes_count: number
  times_used: number
  created_at: string
  updated_at: string
}

export interface RoutineExercise {
  id: string
  routine_id: string
  exercise_template_id: string
  order_in_routine: number
  target_sets: number
  target_reps: number
  target_weight?: number
  rest_seconds: number
  notes?: string
  created_at: string
  exercise_template?: ExerciseTemplate
}

// ========================================
// WORKOUT SESSIONS
// ========================================

export interface WorkoutSession {
  id: string
  user_id: string
  gym_id?: string
  started_at: string
  ended_at?: string
  notes?: string
  total_weight_lifted: number
  exercises_count: number
  created_at: string
  gym?: {
    id: string
    name: string
    area: string
  }
}

export interface WorkoutExercise {
  id: string
  session_id: string
  equipment_id?: string
  exercise_template_id?: string
  exercise_name: string
  sets?: number
  reps?: number[]
  weight?: number[]
  rest_seconds?: number
  superset_group?: number
  difficulty_rating?: number // 1-10
  perceived_exertion?: number // 1-10 (RPE)
  form_rating?: number // 1-5
  notes?: string
  created_at: string
  exercise_template?: ExerciseTemplate
  exercise_sets?: ExerciseSet[]
}

export interface ExerciseSet {
  id: string
  workout_exercise_id: string
  set_number: number
  reps?: number
  weight?: number
  rest_seconds?: number
  is_failure: boolean
  is_warmup: boolean
  notes?: string
  created_at: string
}

// ========================================
// PERSONAL RECORDS
// ========================================

export interface PersonalRecord {
  id: string
  user_id: string
  exercise_name: string
  record_type: '1rm' | '3rm' | '5rm' | '10rm' | 'max_reps'
  weight?: number
  reps?: number
  volume_kg?: number // total weight moved
  duration_seconds?: number // for time-based exercises
  distance_meters?: number // for cardio
  calories_burned?: number
  achieved_at: string
  gym_id?: string
  notes?: string
  created_at: string
}

// ========================================
// BODY COMPOSITION & MEASUREMENTS
// ========================================

export interface BodyMeasurement {
  id: string
  user_id: string
  measured_at: string
  weight_kg?: number
  body_fat_percentage?: number
  muscle_mass_kg?: number
  visceral_fat_level?: number
  bmr_calories?: number
  // Circumference measurements in cm
  neck_cm?: number
  chest_cm?: number
  waist_cm?: number
  hip_cm?: number
  thigh_cm?: number
  bicep_cm?: number
  forearm_cm?: number
  notes?: string
  created_at: string
}

export interface ProgressPhoto {
  id: string
  user_id: string
  image_url: string
  photo_type: 'front' | 'back' | 'side' | 'other'
  taken_at: string
  weight_kg?: number
  notes?: string
  is_public: boolean
  created_at: string
}

// ========================================
// NUTRITION
// ========================================

export interface NutritionLog {
  id: string
  user_id: string
  log_date: string
  calories_consumed?: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
  water_liters?: number
  notes?: string
  created_at: string
  updated_at: string
}

// ========================================
// GOALS & ACHIEVEMENTS
// ========================================

export interface FitnessGoal {
  id: string
  user_id: string
  goal_type: 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'body_fat' | 'measurement'
  title: string
  description?: string
  target_value: number
  current_value: number
  unit: string // 'kg', '%', 'cm', 'minutes', 'reps'
  target_date?: string
  is_achieved: boolean
  achieved_at?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

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

// ========================================
// ANALYTICS & SUMMARIES
// ========================================

export interface WorkoutSummary {
  id: string
  user_id: string
  period_type: 'week' | 'month' | 'quarter' | 'year'
  period_start: string
  period_end: string
  total_workouts: number
  total_duration_minutes: number
  total_weight_lifted_kg: number
  total_calories_burned: number
  avg_workout_duration: number
  most_trained_muscle_groups: string[]
  workout_frequency: number // workouts per week
  created_at: string
  updated_at: string
}

// ========================================
// INPUT TYPES FOR FORMS
// ========================================

export interface CreateWorkoutSessionInput {
  gym_id?: string
  started_at?: string
  notes?: string
}

export interface UpdateWorkoutSessionInput {
  ended_at?: string
  notes?: string
}

export interface CreateExerciseInput {
  exercise_template_id?: string
  exercise_name: string
  equipment_id?: string
  superset_group?: number
}

export interface CreateSetInput {
  reps?: number
  weight?: number
  rest_seconds?: number
  is_failure?: boolean
  is_warmup?: boolean
  notes?: string
}

export interface CreateBodyMeasurementInput {
  weight_kg?: number
  body_fat_percentage?: number
  muscle_mass_kg?: number
  visceral_fat_level?: number
  bmr_calories?: number
  neck_cm?: number
  chest_cm?: number
  waist_cm?: number
  hip_cm?: number
  thigh_cm?: number
  bicep_cm?: number
  forearm_cm?: number
  notes?: string
}

export interface CreateFitnessGoalInput {
  goal_type: 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'body_fat' | 'measurement'
  title: string
  description?: string
  target_value: number
  current_value?: number
  unit: string
  target_date?: string
  is_public?: boolean
}

// ========================================
// ANALYTICS TYPES
// ========================================

export interface WorkoutStats {
  total_workouts: number
  total_duration_minutes: number
  total_weight_lifted_kg: number
  avg_workout_duration: number
  current_streak_days: number
  longest_streak_days: number
  favorite_exercises: Array<{
    name: string
    count: number
  }>
  muscle_group_distribution: Array<{
    muscle_group: string
    percentage: number
  }>
  strength_progress: Array<{
    exercise_name: string
    records: Array<{
      date: string
      weight: number
      reps: number
    }>
  }>
}

export interface ProgressMetrics {
  weight_change_kg?: number
  body_fat_change_percent?: number
  muscle_mass_change_kg?: number
  strength_improvements: Array<{
    exercise: string
    improvement_percent: number
  }>
  consistency_score: number // 0-100
  goal_completion_rate: number // 0-100
}

// ========================================
// UTILITY TYPES
// ========================================

export type MuscleGroup = 
  | '胸' | '背中' | '肩' | '腕' | '脚' | '体幹'
  | 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core'

export type ExerciseCategory = 'strength' | 'cardio' | 'flexibility' | 'balance'

export type GoalType = 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'body_fat' | 'measurement'

export type RecordType = '1rm' | '3rm' | '5rm' | '10rm' | 'max_reps'

export type PhotoType = 'front' | 'back' | 'side' | 'other'

export type AchievementType = 'streak' | 'personal_record' | 'consistency' | 'milestone'