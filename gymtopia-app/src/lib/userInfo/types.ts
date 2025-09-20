export type UserInfoDisplayLevel = 'admin' | 'authenticated' | 'public'

export type UserInfoEnvironment = 'development' | 'staging' | 'production'

export interface UserInfoFeatureFlags {
  showDetailedStats: boolean
  showDebugInfo: boolean
  showAdminPanel: boolean
  showDeveloperTools: boolean
}

export interface UserInfoConfig {
  displayLevel: UserInfoDisplayLevel
  environment: UserInfoEnvironment
  privilegeLevel: number
  features: UserInfoFeatureFlags
}

export interface UserInfoSection {
  id: string
  title: string
  description: string
  icon?: string
  isVisible: boolean
  requiredPrivilege?: number
  environment?: UserInfoEnvironment[]
}

export interface UserSummary {
  id: string
  email: string
  displayName: string
  username: string
  avatarUrl?: string | null
  createdAt: string
  lastActiveAt: string
}

export interface DashboardStats {
  totalPosts: number
  totalWorkouts: number
  totalFollowers: number
  totalFollowing: number
  weeklyWorkouts: number
  monthlyWorkouts: number
}

export type UserActivityType = 'post' | 'workout' | 'achievement' | 'checkin' | 'system'

export interface UserActivity {
  id: string
  type: UserActivityType
  title: string
  description: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface SystemDebugInfo {
  userId: string
  privilegeLevel: number
  features: UserInfoFeatureFlags
  mockDataActive?: boolean
  timestamp?: string
}

export interface SystemInfo {
  environment: UserInfoEnvironment
  version: string
  lastLogin: string
  sessionDuration: string
  permissions: string[]
  debugInfo?: SystemDebugInfo
}

export interface UserInfoData {
  user: UserSummary
  stats: DashboardStats
  activities: UserActivity[]
  systemInfo: SystemInfo
  sections: UserInfoSection[]
}
