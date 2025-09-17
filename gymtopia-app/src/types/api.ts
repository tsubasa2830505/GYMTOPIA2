// =============================================
// API Types for GYMTOPIA 2.0
// Request/Response interfaces and API utilities
// =============================================

// ========================================
// Base API Types
// ========================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
  code?: string;
  details?: Record<string, any>;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T = any> extends ApiSuccessResponse<T[]> {
  pagination: PaginationMeta;
}

// ========================================
// Authentication API
// ========================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
  displayName?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ConfirmPasswordResetRequest {
  token: string;
  newPassword: string;
}

// ========================================
// User & Profile API
// ========================================

export interface UpdateUserProfileRequest {
  displayName?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UpdateUserPreferencesRequest {
  gymExperienceYears?: number;
  trainingFrequency?: string;
  trainingGoals?: string[];
  preferredTrainingTime?: string;
  heightCm?: number;
  weightKg?: number;
  bodyFatPercentage?: number;
  profileVisibility?: string;
  showStats?: boolean;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  isVerified: boolean;
  createdAt: string;
  profile?: {
    gymExperienceYears?: number;
    trainingFrequency?: string;
    trainingGoals?: string[];
    preferredTrainingTime?: string;
    heightCm?: number;
    weightKg?: number;
    bodyFatPercentage?: number;
    profileVisibility: string;
    showStats: boolean;
  };
  statistics?: {
    workoutCount: number;
    workoutStreak: number;
    totalWeightKg: number;
    avgWorkoutDuration: number;
    followersCount: number;
    followingCount: number;
    gymFriendsCount: number;
    postsCount: number;
    achievementsCount: number;
  };
}

// ========================================
// Gym & Search API
// ========================================

export interface SearchGymsRequest {
  query?: string;
  area?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
  facilities?: string[];
  rating?: number; // minimum rating
  page?: number;
  limit?: number;
}

export interface GymSearchResult {
  id: string;
  name: string;
  area: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  facilities?: string[];
  imageUrls?: string[];
  rating?: number;
  usersCount: number;
  distance?: number; // in kilometers if location provided
  isFavorite?: boolean;
}

export interface GymDetailResponse extends GymSearchResult {
  openingHours?: Record<string, { open: string; close: string; closed?: boolean }>;
  equipment?: Array<{
    id: string;
    type: string;
    brand?: string;
    model?: string;
    muscleGroups?: string[];
    condition: string;
    isAvailable: boolean;
  }>;
  recentReviews?: Array<{
    id: string;
    rating: number;
    comment?: string;
    user: {
      id: string;
      displayName?: string;
      avatarUrl?: string;
    };
    createdAt: string;
  }>;
  statistics?: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<string, number>;
    busyHours?: Record<string, number>;
  };
}

export interface CreateGymReviewRequest {
  gymId: string;
  rating: number;
  comment?: string;
  facilitiesRating?: number;
  cleanlinessRating?: number;
  staffRating?: number;
  equipmentRating?: number;
}

// ========================================
// Workout & Exercise API
// ========================================

export interface StartWorkoutRequest {
  gymId?: string;
}

export interface EndWorkoutRequest {
  workoutSessionId: string;
  totalSets?: number;
  totalReps?: number;
  totalWeightKg?: number;
  caloriesBurned?: number;
  notes?: string;
}

export interface AddExerciseRequest {
  workoutSessionId: string;
  machineId?: string;
  exerciseName: string;
  muscleGroups?: string[];
  sets: number;
  reps: number[];
  weightKg: number[];
  restSeconds?: number[];
  notes?: string;
}

export interface WorkoutSessionResponse {
  id: string;
  userId: string;
  gymId?: string;
  startedAt: string;
  endedAt?: string;
  durationMinutes?: number;
  totalSets?: number;
  totalReps?: number;
  totalWeightKg?: number;
  caloriesBurned?: number;
  notes?: string;
  isPublic: boolean;
  gym?: {
    id: string;
    name: string;
    area: string;
  };
  exercises?: Array<{
    id: string;
    exerciseName: string;
    muscleGroups?: string[];
    sets: number;
    reps: number[];
    weightKg: number[];
    notes?: string;
  }>;
}

export interface SearchMachinesRequest {
  query?: string;
  category?: string;
  muscleGroups?: string[];
  gymId?: string;
  page?: number;
  limit?: number;
}

export interface MachineSearchResult {
  id: string;
  name: string;
  category: string;
  muscleGroups?: string[];
  description?: string;
  imageUrl?: string;
  instructionUrl?: string;
  availability?: {
    isAvailable: boolean;
    lastUsed?: string;
    estimatedWaitTime?: number;
  };
}

// ========================================
// Social Features API
// ========================================

export interface CreatePostRequest {
  content: string;
  workoutSessionId?: string;
  imageUrls?: string[];
  isPublic?: boolean;
}

export interface UpdatePostRequest {
  postId: string;
  content?: string;
  imageUrls?: string[];
  isPublic?: boolean;
}

export interface PostResponse {
  id: string;
  userId: string;
  content: string;
  imageUrls?: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    displayName?: string;
    username?: string;
    avatarUrl?: string;
  };
  workoutSession?: {
    id: string;
    startedAt: string;
    durationMinutes?: number;
    gym?: {
      id: string;
      name: string;
      area: string;
    };
    exercises?: Array<{
      exerciseName: string;
      sets: number;
      totalReps: number;
      totalWeight: number;
    }>;
  };
  isLiked?: boolean;
}

export interface CreateCommentRequest {
  postId: string;
  content: string;
  parentCommentId?: string;
}

export interface CommentResponse {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentCommentId?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    displayName?: string;
    username?: string;
    avatarUrl?: string;
  };
  replies?: CommentResponse[];
}

export interface FollowUserRequest {
  userId: string;
}


// ========================================
// Statistics & Analytics API
// ========================================

export interface GetUserStatisticsRequest {
  userId?: string; // if not provided, gets current user stats
  period?: 'week' | 'month' | 'year' | 'all';
  startDate?: string;
  endDate?: string;
}

export interface UserStatisticsResponse {
  workoutCount: number;
  workoutStreak: number;
  totalWeightKg: number;
  totalDurationMinutes: number;
  avgWorkoutDuration?: number;
  consistencyPercentage?: number;
  favoriteExercises: Array<{
    name: string;
    frequency: number;
    totalSets: number;
    totalReps: number;
    totalWeight: number;
  }>;
  strengthProgress: Array<{
    exercise: string;
    weightIncreaseKg: number;
    volumeIncreaseKg: number;
    percentageIncrease: number;
  }>;
  workoutDates: string[];
  personalRecords: Array<{
    id: string;
    exerciseName: string;
    recordType: string;
    weightKg?: number;
    reps?: number;
    achievedAt: string;
  }>;
}

export interface GetDashboardDataRequest {
  period?: 'week' | 'month';
}

export interface DashboardResponse {
  user: UserProfileResponse;
  recentPosts: PostResponse[];
  recentAchievements: Array<{
    id: string;
    title: string;
    description?: string;
    badgeIcon?: string;
    earnedAt: string;
  }>;
  statistics: UserStatisticsResponse;
  favoriteGyms: Array<{
    id: string;
    name: string;
    area: string;
    rating?: number;
    lastVisited?: string;
  }>;
  upcomingGoals?: Array<{
    id: string;
    title: string;
    description?: string;
    targetDate?: string;
    progress: number;
  }>;
}

// ========================================
// Notification API
// ========================================

export interface GetNotificationsRequest {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: string;
}

export interface NotificationResponse {
  id: string;
  type: string;
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface MarkNotificationReadRequest {
  notificationId: string;
}

export interface MarkAllNotificationsReadRequest {
  type?: string;
}

// ========================================
// Admin API
// ========================================

export interface CreateOwnerApplicationRequest {
  gymName: string;
  gymAddress: string;
  businessLicenseNumber?: string;
  contactPhone: string;
  website?: string;
  description?: string;
  documentUrls?: string[];
}

export interface OwnerApplicationResponse {
  id: string;
  userId: string;
  gymName: string;
  gymAddress: string;
  businessLicenseNumber?: string;
  contactPhone: string;
  website?: string;
  description?: string;
  documentUrls?: string[];
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewOwnerApplicationRequest {
  applicationId: string;
  action: 'approve' | 'reject';
  rejectionReason?: string;
}

// ========================================
// File Upload API
// ========================================

export interface UploadFileRequest {
  file: File;
  bucket: 'avatars' | 'gym-images' | 'post-images' | 'documents';
  folder?: string;
}

export interface UploadFileResponse {
  url: string;
  path: string;
  bucket: string;
  size: number;
  mimeType: string;
}