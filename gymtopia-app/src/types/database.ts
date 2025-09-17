// =============================================
// Database Schema Types for GYMTOPIA 2.0
// Auto-generated types for Supabase tables
// =============================================

// Base Database Types
export interface DatabaseRow {
  id: string;
  created_at: string;
  updated_at: string;
}

// ========================================
// User & Authentication
// ========================================

export interface DatabaseUser {
  id: string;
  email: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_seen_at: string | null;
}

export interface DatabaseUserProfile {
  user_id: string;
  gym_experience_years: number | null;
  training_frequency: string | null;
  training_goals: string[] | null;
  preferred_training_time: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  body_fat_percentage: number | null;
  profile_visibility: string;
  show_stats: boolean;
  created_at: string;
  updated_at: string;
}

// ========================================
// Gym & Location
// ========================================

export interface DatabaseGym {
  id: string;
  name: string;
  area: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  opening_hours: Record<string, any> | null;
  facilities: string[] | null;
  image_urls: string[] | null;
  rating: number | null;
  users_count: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface DatabaseGymReview {
  id: string;
  gym_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  facilities_rating: number | null;
  cleanliness_rating: number | null;
  staff_rating: number | null;
  equipment_rating: number | null;
  created_at: string;
  updated_at: string;
}

// ========================================
// Equipment & Machines
// ========================================

export interface DatabaseEquipment {
  id: string;
  gym_id: string;
  equipment_type: string;
  brand: string | null;
  model: string | null;
  muscle_groups: string[] | null;
  condition: string;
  last_maintenance: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseMachine {
  id: string;
  name: string;
  category: string;
  muscle_groups: string[] | null;
  description: string | null;
  image_url: string | null;
  instruction_url: string | null;
  created_at: string;
  updated_at: string;
}

// ========================================
// Workouts & Training
// ========================================

export interface DatabaseWorkoutSession {
  id: string;
  user_id: string;
  gym_id: string | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  total_sets: number | null;
  total_reps: number | null;
  total_weight_kg: number | null;
  calories_burned: number | null;
  notes: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseExercise {
  id: string;
  workout_session_id: string;
  machine_id: string | null;
  exercise_name: string;
  muscle_groups: string[] | null;
  sets: number;
  reps: number[];
  weight_kg: number[];
  rest_seconds: number[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabasePersonalRecord {
  id: string;
  user_id: string;
  exercise_name: string;
  record_type: string; // '1rm' | '3rm' | '5rm' | '10rm' | 'max_reps'
  weight_kg: number | null;
  reps: number | null;
  volume_kg: number | null;
  duration_seconds: number | null;
  distance_meters: number | null;
  calories_burned: number | null;
  achieved_at: string;
  gym_id: string | null;
  notes: string | null;
  created_at: string;
}

// ========================================
// Social Features
// ========================================

export interface DatabaseGymPost {
  id: string;
  user_id: string;
  workout_session_id: string | null;
  content: string;
  image_urls: string[] | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabasePostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface DatabasePostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}


export interface DatabaseFavoriteGym {
  id: string;
  user_id: string;
  gym_id: string;
  created_at: string;
}

// ========================================
// Achievements & Statistics
// ========================================

export interface DatabaseAchievement {
  id: string;
  user_id: string;
  achievement_type: string; // 'streak' | 'personal_record' | 'consistency' | 'milestone'
  title: string;
  description: string | null;
  badge_icon: string | null;
  earned_at: string;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface DatabaseUserStatistics {
  id: string;
  user_id: string;
  workout_count: number;
  workout_streak: number;
  total_weight_kg: number;
  total_duration_minutes: number;
  avg_workout_duration: number | null;
  favorite_exercises: string[] | null;
  last_workout_date: string | null;
  calculated_at: string;
  created_at: string;
  updated_at: string;
}

// ========================================
// Notifications
// ========================================

export interface DatabaseNotification {
  id: string;
  user_id: string;
  type: string; // 'follow' | 'like' | 'comment' | 'friend_request' | 'achievement'
  title: string;
  message: string;
  related_id: string | null; // post_id, user_id, etc.
  is_read: boolean;
  created_at: string;
}

// ========================================
// Admin & Management
// ========================================

export interface DatabaseGymOwner {
  id: string;
  user_id: string;
  gym_id: string;
  role: string; // 'owner' | 'manager' | 'staff'
  permissions: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseOwnerApplication {
  id: string;
  user_id: string;
  gym_name: string;
  gym_address: string;
  business_license_number: string | null;
  contact_phone: string;
  website: string | null;
  description: string | null;
  documents_urls: string[] | null;
  status: string; // 'pending' | 'approved' | 'rejected'
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

// ========================================
// Union Types for Tables
// ========================================

export type DatabaseTables = {
  users: DatabaseUser;
  user_profiles: DatabaseUserProfile;
  gyms: DatabaseGym;
  gym_reviews: DatabaseGymReview;
  equipment: DatabaseEquipment;
  machines: DatabaseMachine;
  workout_sessions: DatabaseWorkoutSession;
  exercises: DatabaseExercise;
  personal_records: DatabasePersonalRecord;
  gym_posts: DatabaseGymPost;
  post_likes: DatabasePostLike;
  post_comments: DatabasePostComment;
  follows: DatabaseFollow;
  favorite_gyms: DatabaseFavoriteGym;
  achievements: DatabaseAchievement;
  user_statistics: DatabaseUserStatistics;
  notifications: DatabaseNotification;
  gym_owners: DatabaseGymOwner;
  owner_applications: DatabaseOwnerApplication;
};

// Type helpers for database operations
export type TableName = keyof DatabaseTables;
export type TableRow<T extends TableName> = DatabaseTables[T];

// Insert types (without id, created_at, updated_at)
export type DatabaseInsert<T extends TableName> = Omit<
  DatabaseTables[T],
  'id' | 'created_at' | 'updated_at'
>;

// Update types (optional fields except id)
export type DatabaseUpdate<T extends TableName> = Partial<
  Omit<DatabaseTables[T], 'id' | 'created_at'>
> & {
  id: string;
};