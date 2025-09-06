// =============================================
// User related type definitions
// =============================================

// Training frequency options
export type TrainingFrequency = 
  | 'daily' 
  | 'weekly_1-2' 
  | 'weekly_3-4' 
  | 'weekly_5+' 
  | 'occasional';

// Training goals
export type TrainingGoal = 
  | 'muscle_gain' 
  | 'weight_loss' 
  | 'strength' 
  | 'endurance' 
  | 'flexibility' 
  | 'general_fitness';

// Preferred training time
export type PreferredTrainingTime = 
  | 'early_morning' 
  | 'morning' 
  | 'afternoon' 
  | 'evening' 
  | 'night' 
  | 'flexible';

// Profile visibility
export type ProfileVisibility = 
  | 'public' 
  | 'friends' 
  | 'private';

// Base user interface (maps to public.users table)
export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastSeenAt?: string;
}

// Extended user profile (maps to public.user_profiles table)
export interface UserProfile {
  userId: string;
  gymExperienceYears?: number;
  trainingFrequency?: TrainingFrequency;
  trainingGoals?: TrainingGoal[];
  preferredTrainingTime?: PreferredTrainingTime;
  heightCm?: number;
  weightKg?: number;
  bodyFatPercentage?: number;
  profileVisibility: ProfileVisibility;
  showStats: boolean;
  createdAt: string;
  updatedAt: string;
}

// Combined user data (joined tables)
export interface UserWithProfile extends User {
  profile?: UserProfile;
}

// User registration data
export interface UserRegistrationData {
  email: string;
  password: string;
  username?: string;
  displayName?: string;
}

// User login data
export interface UserLoginData {
  email: string;
  password: string;
}

// User update data
export interface UserUpdateData {
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
}

// Profile update data
export interface UserProfileUpdateData {
  gymExperienceYears?: number;
  trainingFrequency?: TrainingFrequency;
  trainingGoals?: TrainingGoal[];
  preferredTrainingTime?: PreferredTrainingTime;
  heightCm?: number;
  weightKg?: number;
  bodyFatPercentage?: number;
  profileVisibility?: ProfileVisibility;
  showStats?: boolean;
}

// Session user (simplified for auth context)
export interface SessionUser {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
}

// Auth state
export interface AuthState {
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Database response types
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