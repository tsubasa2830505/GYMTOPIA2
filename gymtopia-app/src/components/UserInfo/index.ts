/**
 * User Information Components Export
 * ユーザー情報表示コンポーネントのエクスポート
 */

export { default as UserInfoDashboard } from './UserInfoDashboard'
export { default as useUserInfo } from './useUserInfo'

// 型のエクスポート
export type {
  UserInfoConfig,
  UserInfoData,
  UserInfoSection,
  DashboardStats,
  UserActivity,
  SystemInfo
} from '@/lib/userInfo/types'