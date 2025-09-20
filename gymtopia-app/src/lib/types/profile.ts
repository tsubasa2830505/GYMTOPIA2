// Profile and social features types for GYMTOPIA 2.0

// ========================================
// USER PROFILE
// ========================================

export interface UserProfile {
  id: string
  display_name?: string
  username?: string
  avatar_url?: string
  bio?: string
  location?: string
  joined_at: string
  is_verified: boolean
  workout_streak: number
  total_workouts: number
  created_at: string
  updated_at: string
}

export interface UserProfileStats {
  user_id: string
  email?: string
  display_name?: string
  username?: string
  avatar_url?: string
  bio?: string
  location?: string
  joined_at: string
  is_verified: boolean
  
  // Workout stats
  workout_count: number
  workout_streak: number
  
  // Social stats
  followers_count: number
  following_count: number
  mutual_follows_count: number  // 相互フォロー数
  
  // Content stats
  posts_count: number
  achievements_count: number
  favorite_gyms_count: number

  // Home gym
  primary_gym_id?: string
  secondary_gym_ids?: string[]
  gym_membership_type?: string
}

// ========================================
// SOCIAL FEATURES
// ========================================

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
  follower?: UserProfile
  following?: UserProfile
}

// GymFriend interface removed - using mutual follows instead

// ========================================
// GYM POSTS
// ========================================

export interface GymPost {
  id: string
  user_id: string
  workout_session_id?: string | null
  gym_id?: string | null
  content: string | null
  image_url?: string | null
  images?: string[] | null
  post_type?: 'normal' | 'workout' | 'check_in' | 'achievement' | string | null
  likes_count: number
  comments_count: number
  shares_count?: number
  visibility?: 'public' | 'followers' | 'private'
  is_public?: boolean
  is_liked?: boolean
  check_in_id?: string | null
  is_verified?: boolean
  verification_method?: 'check_in' | 'manual' | null
  distance_from_gym?: number | null
  created_at: string
  updated_at: string

  // Relations
  user?: UserProfile & {
    username?: string
  }
  workout_session?: {
    id: string
    started_at: string
    ended_at?: string
    gym?: {
      id: string
      name: string
      area: string
    }
  }
  training_details?: {
    gym_name?: string
    exercises?: Array<{
      name: string
      weight: number | number[]
      sets: number
      reps: number | number[]
    }>
    crowd_status?: string
  }
  gym?: {
    id: string
    name: string
    area?: string | null
    city?: string | null
    prefecture?: string | null
    images?: string[] | null
  }
  achievement_type?: string | null
  achievement_data?: Record<string, unknown> | null
}

export interface PostLike {
  id: string
  post_id: string
  user_id: string
  created_at: string
  user?: UserProfile
}

export interface PostComment {
  id: string
  post_id: string
  user_id: string
  content: string
  parent_comment_id?: string
  created_at: string
  updated_at: string
  user?: UserProfile
  replies?: PostComment[]
}

// ========================================
// FAVORITE GYMS
// ========================================

export interface FavoriteGym {
  id: string
  user_id: string
  gym_id: string
  created_at: string
  gym?: {
    id: string
    name: string
    area?: string
    description?: string
    rating?: number
    users_count?: number
    image_url?: string
    prefecture?: string
    city?: string
    images?: string[] | null
  }
}

// ========================================
// INPUT TYPES FOR FORMS
// ========================================

export interface UpdateProfileInput {
  display_name?: string
  username?: string
  bio?: string
  location?: string
  avatar_url?: string
}

export interface CreateGymPostInput {
  content: string
  workout_session_id?: string
  image_url?: string
  is_public?: boolean
}

export interface UpdateGymPostInput {
  content?: string
  image_url?: string
  is_public?: boolean
}

export interface CreatePostCommentInput {
  content: string
  parent_comment_id?: string
}

export interface FollowUserInput {
  following_id: string
}

// GymFriendRequestInput removed - using follow system

export interface AddFavoriteGymInput {
  gym_id: string
}

// ========================================
// WEEKLY STATISTICS
// ========================================

export interface WeeklyStats {
  workout_count: number
  total_weight_kg: number
  avg_duration_minutes: number
  streak_days: number
  favorite_exercises: Array<{
    name: string
    frequency: number
  }>
  workout_dates: string[]
}

export interface MonthlyStats {
  workout_count: number
  total_weight_kg: number
  avg_duration_minutes: number
  consistency_percentage: number
  strength_progress: Array<{
    exercise: string
    weight_increase_kg: number
    volume_increase_kg: number
  }>
}

// ========================================
// DASHBOARD DATA
// ========================================

export interface ProfileDashboard {
  user: UserProfileStats
  recent_posts: GymPost[]
  recent_achievements: Array<{
    id: string
    title: string
    description?: string
    earned_at: string
    badge_icon?: string
  }>
  personal_records: Array<{
    id: string
    exercise_name: string
    record_type: '1rm' | '3rm' | '5rm' | '10rm' | 'max_reps'
    weight?: number
    reps?: number
    achieved_at: string
  }>
  weekly_stats: WeeklyStats
  favorite_gyms: FavoriteGym[]
}

// ========================================
// API RESPONSE TYPES
// ========================================

export interface ProfileApiResponse {
  success: boolean
  data?: UserProfileStats
  error?: string
}

export interface PostsApiResponse {
  success: boolean
  data?: GymPost[]
  pagination?: {
    page: number
    limit: number
    total: number
    has_next: boolean
  }
  error?: string
}

export interface DashboardApiResponse {
  success: boolean
  data?: ProfileDashboard
  error?: string
}

// ========================================
// UTILITY TYPES
// ========================================

// FriendshipStatus removed - using follow system
export type PostVisibility = 'public' | 'friends' | 'private'
export type NotificationType = 'follow' | 'like' | 'comment' | 'achievement'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  related_id?: string // post_id, user_id, etc.
  is_read: boolean
  created_at: string
}

// ========================================
// FEED TYPES
// ========================================

export interface FeedItem {
  id: string
  type: 'post' | 'achievement' | 'personal_record'
  user: UserProfile
  timestamp: string
  content: GymPost | Achievement | PersonalRecord
}

// Achievement type from workout.ts
interface Achievement {
  id: string
  user_id: string
  achievement_type: 'streak' | 'personal_record' | 'consistency' | 'milestone'
  title: string
  description?: string
  badge_icon?: string
  earned_at: string
  metadata?: Record<string, any>
}

// Personal Record type from workout.ts
interface PersonalRecord {
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
