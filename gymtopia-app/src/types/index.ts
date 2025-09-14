// =============================================
// Unified Type Exports for GYMTOPIA 2.0
// Central export point for all type definitions
// =============================================

// Database types
export * from './database';

// API types
export * from './api';

// UI component types
export * from './ui';

// Enums and constants
export * from './enums';

// ========================================
// Legacy Type Compatibility
// Re-export existing types for smooth migration
// ========================================

// User types from lib/types/user.ts
export type {
  User,
  UserProfile,
  UserWithProfile,
  UserRegistrationData,
  UserLoginData,
  UserUpdateData,
  UserProfileUpdateData,
  SessionUser,
  AuthState
} from '../lib/types/user';

// Profile types from lib/types/profile.ts
export type {
  UserProfile as LegacyUserProfile,
  UserProfileStats,
  Follow,
  GymFriend,
  GymPost,
  PostLike,
  PostComment,
  FavoriteGym,
  UpdateProfileInput,
  CreateGymPostInput,
  UpdateGymPostInput,
  CreatePostCommentInput,
  FollowUserInput,
  GymFriendRequestInput,
  AddFavoriteGymInput,
  WeeklyStats,
  MonthlyStats,
  ProfileDashboard,
  ProfileApiResponse,
  PostsApiResponse,
  DashboardApiResponse,
  FriendshipStatus as LegacyFriendshipStatus,
  PostVisibility as LegacyPostVisibility,
  NotificationType as LegacyNotificationType,
  Notification,
  FeedItem
} from '../lib/types/profile';

// Workout types from lib/types/workout.ts
// export type {
//   WorkoutSession,
//   Exercise,
//   Set,
//   PersonalRecord,
//   Achievement,
//   WorkoutPlan,
//   ExerciseTemplate,
//   CreateWorkoutSessionInput,
//   UpdateWorkoutSessionInput,
//   AddExerciseInput,
//   UpdateExerciseInput,
//   CreatePersonalRecordInput,
//   WorkoutStatistics,
//   ExerciseStatistics
// } from '../lib/types/workout';

// Muscle parts types
export type {
  MusclePart
  // MuscleGroup as LegacyMuscleGroup
} from '../lib/types/muscle-parts';

// ========================================
// Utility Types
// ========================================

// Generic utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// API utility types
export type ApiRequestOptions = {
  timeout?: number;
  signal?: AbortSignal;
  headers?: Record<string, string>;
};

export type PaginatedRequest = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

// Form utility types
export type FormErrors<T> = Partial<Record<keyof T, string>>;
export type FormTouched<T> = Partial<Record<keyof T, boolean>>;
export type FormState<T> = {
  values: T;
  errors: FormErrors<T>;
  touched: FormTouched<T>;
  isSubmitting: boolean;
  isValid: boolean;
};

// Component prop utility types
export type WithClassName<T = {}> = T & { className?: string };
export type WithChildren<T = {}> = T & { children?: React.ReactNode };
export type WithTestId<T = {}> = T & { 'data-testid'?: string };

// Event handler types
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;
export type ValueChangeHandler<T> = (value: T) => void;

// ========================================
// Brand Types for Type Safety
// ========================================

// Use these for domain-specific string types to prevent mixing
export type UserId = string & { __brand: 'UserId' };
export type GymId = string & { __brand: 'GymId' };
export type PostId = string & { __brand: 'PostId' };
export type WorkoutSessionId = string & { __brand: 'WorkoutSessionId' };
export type NotificationId = string & { __brand: 'NotificationId' };

// Helper functions to create branded types
export const createUserId = (id: string): UserId => id as UserId;
export const createGymId = (id: string): GymId => id as GymId;
export const createPostId = (id: string): PostId => id as PostId;
export const createWorkoutSessionId = (id: string): WorkoutSessionId => id as WorkoutSessionId;
export const createNotificationId = (id: string): NotificationId => id as NotificationId;

// ========================================
// Type Guards
// ========================================

export const isString = (value: unknown): value is string => typeof value === 'string';
export const isNumber = (value: unknown): value is number => typeof value === 'number' && !isNaN(value);
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
export const isArray = (value: unknown): value is unknown[] => Array.isArray(value);

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// ========================================
// Date & Time Utilities
// ========================================

export type DateString = string; // ISO 8601 date string
export type TimeStamp = number; // Unix timestamp

export const isValidDateString = (date: string): boolean => {
  return !isNaN(Date.parse(date));
};

// ========================================
// Geographic Utilities
// ========================================

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type BoundingBox = {
  northeast: Coordinates;
  southwest: Coordinates;
};

export const isValidCoordinates = (coords: Coordinates): boolean => {
  return (
    coords.latitude >= -90 &&
    coords.latitude <= 90 &&
    coords.longitude >= -180 &&
    coords.longitude <= 180
  );
};

// ========================================
// Error Types
// ========================================

export interface AppError {
  name: string;
  message: string;
  code?: string;
  stack?: string;
  cause?: Error;
}

export class ValidationError extends Error implements AppError {
  name = 'ValidationError';
  cause?: Error;
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message);
  }
}

export class ApiError extends Error implements AppError {
  name = 'ApiError';
  cause?: Error;
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public response?: any
  ) {
    super(message);
  }
}

export class AuthenticationError extends Error implements AppError {
  name = 'AuthenticationError';
  cause?: Error;
  constructor(message: string = '認証が必要です', public code?: string) {
    super(message);
  }
}

export class AuthorizationError extends Error implements AppError {
  name = 'AuthorizationError';
  cause?: Error;
  constructor(message: string = 'この操作を実行する権限がありません', public code?: string) {
    super(message);
  }
}

// ========================================
// Feature Flag Types
// ========================================

export type FeatureFlag = keyof typeof import('./enums').FEATURES;

export interface FeatureFlags {
  [key: string]: boolean;
}

// ========================================
// Environment Types
// ========================================

export type Environment = 'development' | 'staging' | 'production';

export interface AppConfig {
  environment: Environment;
  apiBaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  features: FeatureFlags;
  analytics: {
    enabled: boolean;
    trackingId?: string;
  };
  maps: {
    provider: 'google' | 'mapbox' | 'leaflet';
    apiKey?: string;
  };
}

// ========================================
// Theme Types
// ========================================

export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
}

export interface ThemeConfig {
  colors: ThemeColors;
  spacing: Record<string, string>;
  typography: Record<string, any>;
  breakpoints: Record<string, string>;
  shadows: Record<string, string>;
  borderRadius: Record<string, string>;
}

// ========================================
// Performance Types
// ========================================

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  apiResponseTime: number;
  memoryUsage?: number;
  bundleSize?: number;
}

// ========================================
// Analytics Types
// ========================================

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

export interface UserAnalytics {
  userId: string;
  sessionCount: number;
  lastActiveAt: string;
  totalTimeSpent: number;
  pagesViewed: string[];
  features: string[];
}