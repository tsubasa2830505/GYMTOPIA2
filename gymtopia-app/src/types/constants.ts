// アプリケーション全体で使用する定数の型定義

export const WORKOUT_TYPES = {
  STRENGTH: 'strength',
  CARDIO: 'cardio',
  FLEXIBILITY: 'flexibility',
  FUNCTIONAL: 'functional',
  HIIT: 'hiit',
  CROSSFIT: 'crossfit',
} as const;

export type WorkoutType = typeof WORKOUT_TYPES[keyof typeof WORKOUT_TYPES];

export const MUSCLE_GROUPS = {
  CHEST: 'chest',
  BACK: 'back',
  SHOULDERS: 'shoulders',
  BICEPS: 'biceps',
  TRICEPS: 'triceps',
  LEGS: 'legs',
  CORE: 'core',
  GLUTES: 'glutes',
} as const;

export type MuscleGroup = typeof MUSCLE_GROUPS[keyof typeof MUSCLE_GROUPS];

export const CROWD_STATUS = {
  EMPTY: 'empty',
  NORMAL: 'normal',
  CROWDED: 'crowded',
  PACKED: 'packed',
} as const;

export type CrowdStatus = typeof CROWD_STATUS[keyof typeof CROWD_STATUS];

export const POST_VISIBILITY = {
  PUBLIC: 'public',
  FRIENDS: 'friends',
  PRIVATE: 'private',
} as const;

export type PostVisibility = typeof POST_VISIBILITY[keyof typeof POST_VISIBILITY];

export const ACHIEVEMENT_RARITY = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
  MYTHICAL: 'mythical',
} as const;

export type AchievementRarity = typeof ACHIEVEMENT_RARITY[keyof typeof ACHIEVEMENT_RARITY];

export const RECORD_TYPES = {
  WEIGHT: 'weight',
  REPS: 'reps',
  TIME: 'time',
  DISTANCE: 'distance',
} as const;

export type RecordType = typeof RECORD_TYPES[keyof typeof RECORD_TYPES];

export const GYM_MEMBERSHIP_TYPES = {
  SINGLE: 'single',
  CHAIN: 'chain',
  MULTIPLE: 'multiple',
  VISITOR: 'visitor',
} as const;

export type GymMembershipType = typeof GYM_MEMBERSHIP_TYPES[keyof typeof GYM_MEMBERSHIP_TYPES];

export const TRAINING_FREQUENCY = {
  DAILY: 'daily',
  WEEKLY_5_6: 'weekly_5-6',
  WEEKLY_3_4: 'weekly_3-4',
  WEEKLY_1_2: 'weekly_1-2',
  MONTHLY_FEW: 'monthly_few',
} as const;

export type TrainingFrequency = typeof TRAINING_FREQUENCY[keyof typeof TRAINING_FREQUENCY];

export const TRAINING_GOAL = {
  MUSCLE_GAIN: 'muscle_gain',
  WEIGHT_LOSS: 'weight_loss',
  STRENGTH: 'strength',
  ENDURANCE: 'endurance',
  HEALTH: 'health',
  ATHLETIC: 'athletic',
} as const;

export type TrainingGoal = typeof TRAINING_GOAL[keyof typeof TRAINING_GOAL];