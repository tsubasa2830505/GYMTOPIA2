// =============================================
// Enums and Constants for GYMTOPIA 2.0
// Centralized enum definitions and constants
// =============================================

// ========================================
// User & Profile Enums
// ========================================

export enum TrainingFrequency {
  DAILY = 'daily',
  WEEKLY_1_2 = 'weekly_1-2',
  WEEKLY_3_4 = 'weekly_3-4',
  WEEKLY_5_PLUS = 'weekly_5+',
  OCCASIONAL = 'occasional'
}

export enum TrainingGoal {
  MUSCLE_GAIN = 'muscle_gain',
  WEIGHT_LOSS = 'weight_loss',
  STRENGTH = 'strength',
  ENDURANCE = 'endurance',
  FLEXIBILITY = 'flexibility',
  GENERAL_FITNESS = 'general_fitness'
}

export enum PreferredTrainingTime {
  EARLY_MORNING = 'early_morning',
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
  NIGHT = 'night',
  FLEXIBLE = 'flexible'
}

export enum ProfileVisibility {
  PUBLIC = 'public',
  FRIENDS = 'friends',
  PRIVATE = 'private'
}

// ========================================
// Equipment & Machine Enums
// ========================================

export enum MuscleGroup {
  CHEST = 'chest',
  BACK = 'back',
  SHOULDERS = 'shoulders',
  BICEPS = 'biceps',
  TRICEPS = 'triceps',
  FOREARMS = 'forearms',
  ABS = 'abs',
  LEGS = 'legs',
  QUADRICEPS = 'quadriceps',
  HAMSTRINGS = 'hamstrings',
  CALVES = 'calves',
  GLUTES = 'glutes',
  FULL_BODY = 'full_body'
}

export enum EquipmentType {
  CARDIO = 'cardio',
  STRENGTH = 'strength',
  FREE_WEIGHTS = 'free_weights',
  FUNCTIONAL = 'functional',
  STRETCHING = 'stretching'
}

export enum MachineCategory {
  TREADMILL = 'treadmill',
  STATIONARY_BIKE = 'stationary_bike',
  ELLIPTICAL = 'elliptical',
  ROWING_MACHINE = 'rowing_machine',
  CHEST_PRESS = 'chest_press',
  LEG_PRESS = 'leg_press',
  LAT_PULLDOWN = 'lat_pulldown',
  SHOULDER_PRESS = 'shoulder_press',
  LEG_EXTENSION = 'leg_extension',
  LEG_CURL = 'leg_curl',
  CABLE_MACHINE = 'cable_machine',
  SMITH_MACHINE = 'smith_machine',
  POWER_RACK = 'power_rack',
  DUMBBELLS = 'dumbbells',
  BARBELLS = 'barbells',
  KETTLEBELLS = 'kettlebells',
  RESISTANCE_BANDS = 'resistance_bands',
  MEDICINE_BALLS = 'medicine_balls',
  TRX = 'trx',
  YOGA_MATS = 'yoga_mats'
}

export enum EquipmentCondition {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  NEEDS_MAINTENANCE = 'needs_maintenance',
  OUT_OF_ORDER = 'out_of_order'
}

// ========================================
// Workout & Exercise Enums
// ========================================

export enum RecordType {
  ONE_RM = '1rm',
  THREE_RM = '3rm',
  FIVE_RM = '5rm',
  TEN_RM = '10rm',
  MAX_REPS = 'max_reps',
  MAX_WEIGHT = 'max_weight',
  MAX_DURATION = 'max_duration',
  MAX_DISTANCE = 'max_distance'
}

export enum WorkoutIntensity {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

export enum ExerciseType {
  COMPOUND = 'compound',
  ISOLATION = 'isolation',
  CARDIO = 'cardio',
  FLEXIBILITY = 'flexibility',
  BALANCE = 'balance',
  PLYOMETRIC = 'plyometric'
}

// ========================================
// Social Features Enums
// ========================================

export enum FriendshipStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  BLOCKED = 'blocked',
  REJECTED = 'rejected'
}

export enum PostVisibility {
  PUBLIC = 'public',
  FRIENDS = 'friends',
  PRIVATE = 'private'
}

export enum NotificationType {
  FOLLOW = 'follow',
  LIKE = 'like',
  COMMENT = 'comment',
  FRIEND_REQUEST = 'friend_request',
  ACHIEVEMENT = 'achievement',
  PERSONAL_RECORD = 'personal_record',
  WORKOUT_REMINDER = 'workout_reminder',
  GYM_CHECK_IN = 'gym_check_in'
}

// ========================================
// Achievement Enums
// ========================================

export enum AchievementType {
  STREAK = 'streak',
  PERSONAL_RECORD = 'personal_record',
  CONSISTENCY = 'consistency',
  MILESTONE = 'milestone',
  SOCIAL = 'social',
  EXPLORATION = 'exploration',
  CHALLENGE = 'challenge'
}

export enum BadgeLevel {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond'
}

// ========================================
// Admin & Management Enums
// ========================================

export enum UserRole {
  USER = 'user',
  GYM_OWNER = 'gym_owner',
  GYM_MANAGER = 'gym_manager',
  GYM_STAFF = 'gym_staff',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export enum ApplicationStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REQUIRES_INFO = 'requires_info'
}

export enum GymVerificationStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  SUSPENDED = 'suspended'
}

// ========================================
// UI & System Enums
// ========================================

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto'
}

export enum Language {
  JAPANESE = 'ja',
  ENGLISH = 'en'
}

export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export enum ApiStatus {
  IDLE = 'idle',
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error'
}

// ========================================
// Search & Filter Enums
// ========================================

export enum SearchType {
  GYMS = 'gyms',
  MACHINES = 'machines',
  USERS = 'users',
  POSTS = 'posts',
  EXERCISES = 'exercises'
}

export enum SortBy {
  RELEVANCE = 'relevance',
  DISTANCE = 'distance',
  RATING = 'rating',
  NAME = 'name',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  POPULARITY = 'popularity'
}

export enum FilterType {
  TEXT = 'text',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  RANGE = 'range',
  DATE = 'date',
  BOOLEAN = 'boolean',
  LOCATION = 'location'
}

// ========================================
// Map & Location Enums
// ========================================

export enum LocationPrecision {
  EXACT = 'exact',
  APPROXIMATE = 'approximate',
  CITY = 'city',
  REGION = 'region'
}

export enum MapStyle {
  STANDARD = 'standard',
  SATELLITE = 'satellite',
  TERRAIN = 'terrain',
  DARK = 'dark'
}

// ========================================
// Constant Values
// ========================================

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  [MuscleGroup.CHEST]: '胸',
  [MuscleGroup.BACK]: '背中',
  [MuscleGroup.SHOULDERS]: '肩',
  [MuscleGroup.BICEPS]: '上腕二頭筋',
  [MuscleGroup.TRICEPS]: '上腕三頭筋',
  [MuscleGroup.FOREARMS]: '前腕',
  [MuscleGroup.ABS]: '腹筋',
  [MuscleGroup.LEGS]: '脚',
  [MuscleGroup.QUADRICEPS]: '大腿四頭筋',
  [MuscleGroup.HAMSTRINGS]: 'ハムストリング',
  [MuscleGroup.CALVES]: 'ふくらはぎ',
  [MuscleGroup.GLUTES]: '臀部',
  [MuscleGroup.FULL_BODY]: '全身'
};

export const TRAINING_FREQUENCY_LABELS: Record<TrainingFrequency, string> = {
  [TrainingFrequency.DAILY]: '毎日',
  [TrainingFrequency.WEEKLY_1_2]: '週1-2回',
  [TrainingFrequency.WEEKLY_3_4]: '週3-4回',
  [TrainingFrequency.WEEKLY_5_PLUS]: '週5回以上',
  [TrainingFrequency.OCCASIONAL]: 'たまに'
};

export const TRAINING_GOAL_LABELS: Record<TrainingGoal, string> = {
  [TrainingGoal.MUSCLE_GAIN]: '筋肉量増加',
  [TrainingGoal.WEIGHT_LOSS]: '体重減少',
  [TrainingGoal.STRENGTH]: '筋力向上',
  [TrainingGoal.ENDURANCE]: '持久力向上',
  [TrainingGoal.FLEXIBILITY]: '柔軟性向上',
  [TrainingGoal.GENERAL_FITNESS]: '総合的な体力向上'
};

export const PREFERRED_TRAINING_TIME_LABELS: Record<PreferredTrainingTime, string> = {
  [PreferredTrainingTime.EARLY_MORNING]: '早朝 (5:00-7:00)',
  [PreferredTrainingTime.MORNING]: '午前 (7:00-11:00)',
  [PreferredTrainingTime.AFTERNOON]: '午後 (11:00-17:00)',
  [PreferredTrainingTime.EVENING]: '夕方 (17:00-21:00)',
  [PreferredTrainingTime.NIGHT]: '夜 (21:00-)',
  [PreferredTrainingTime.FLEXIBLE]: '時間は問わない'
};

// ========================================
// Validation Constants
// ========================================

export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9_-]+$/
  },
  DISPLAY_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50
  },
  BIO: {
    MAX_LENGTH: 500
  },
  POST_CONTENT: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 2000
  },
  COMMENT_CONTENT: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 500
  },
  GYM_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL: false
  }
} as const;

// ========================================
// API Constants
// ========================================

export const API_LIMITS = {
  POSTS_PER_PAGE: 20,
  COMMENTS_PER_PAGE: 50,
  GYMS_PER_PAGE: 20,
  USERS_PER_PAGE: 20,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGES_PER_POST: 5,
  SEARCH_DEBOUNCE_MS: 300,
  REQUEST_TIMEOUT_MS: 30000
} as const;

// ========================================
// Feature Flags
// ========================================

export const FEATURES = {
  SOCIAL_FEATURES: true,
  GYM_REVIEWS: true,
  WORKOUT_TRACKING: true,
  ACHIEVEMENTS: true,
  PUSH_NOTIFICATIONS: true,
  DARK_MODE: true,
  MAP_INTEGRATION: true,
  REAL_TIME_CHAT: false,
  PREMIUM_FEATURES: false,
  ANALYTICS: true
} as const;

// ========================================
// Default Values
// ========================================

export const DEFAULTS = {
  PROFILE_VISIBILITY: ProfileVisibility.PUBLIC,
  POST_VISIBILITY: PostVisibility.PUBLIC,
  TRAINING_FREQUENCY: TrainingFrequency.WEEKLY_3_4,
  PREFERRED_TRAINING_TIME: PreferredTrainingTime.FLEXIBLE,
  MAP_ZOOM: 13,
  SEARCH_RADIUS_KM: 10,
  THEME: Theme.AUTO,
  LANGUAGE: Language.JAPANESE
} as const;