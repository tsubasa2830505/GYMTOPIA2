/**
 * User Information Configuration
 * ユーザー情報設定管理
 */

import { UserInfoConfig, UserInfoSection } from './types'

export function getUserPrivilegeLevel(user: any): number {
  if (!user) return 0 // 未認証

  const adminEmails = [
    'tsubasa.a.283.0505@gmail.com',
    process.env.NEXT_PUBLIC_ADMIN_EMAIL_1,
    process.env.NEXT_PUBLIC_ADMIN_EMAIL_2,
  ].filter(Boolean)

  if (adminEmails.includes(user.email)) {
    return 100 // 管理者レベル
  }

  return 50 // 一般認証ユーザー
}

export function createUserInfoConfig(user: any): UserInfoConfig {
  const privilegeLevel = getUserPrivilegeLevel(user)
  const isDevelopment = process.env.NODE_ENV === 'development'

  return {
    displayLevel: privilegeLevel >= 100 ? 'admin' : privilegeLevel >= 50 ? 'authenticated' : 'public',
    environment: (process.env.NODE_ENV || 'development') as 'development' | 'staging' | 'production',
    privilegeLevel,
    features: {
      showDetailedStats: privilegeLevel >= 50,
      showDebugInfo: isDevelopment && privilegeLevel >= 100,
      showAdminPanel: privilegeLevel >= 100,
      showDeveloperTools: isDevelopment && privilegeLevel >= 100,
    }
  }
}

export function getAvailableSections(config: UserInfoConfig, user: any): UserInfoSection[] {
  const sections: UserInfoSection[] = []

  // 基本情報セクション（全ユーザー）
  sections.push({
    id: 'basic-info',
    title: 'ユーザー基本情報',
    description: 'プロフィール、アカウント設定など',
    icon: '👤',
    isVisible: true,
  })

  // 統計情報（認証済みユーザー）
  if (config.privilegeLevel >= 50) {
    sections.push({
      id: 'statistics',
      title: '活動統計',
      description: 'ジム活動、投稿、フォロワー統計',
      icon: '📊',
      isVisible: true,
    })
  }

  // 活動履歴（認証済みユーザー）
  if (config.privilegeLevel >= 50) {
    sections.push({
      id: 'activities',
      title: '最近の活動',
      description: 'ワークアウト、投稿、実績など',
      icon: '🏃‍♂️',
      isVisible: true,
    })
  }

  // システム情報（管理者）
  if (config.privilegeLevel >= 100) {
    sections.push({
      id: 'system-info',
      title: 'システム情報',
      description: 'アカウント設定、権限、セッション情報',
      icon: '⚙️',
      isVisible: true,
      requiredPrivilege: 100,
    })
  }

  // 開発者ツール（開発環境の管理者）
  if (config.features.showDeveloperTools) {
    sections.push({
      id: 'developer-tools',
      title: '開発者ツール',
      description: 'デバッグ情報、テスト機能',
      icon: '🛠️',
      isVisible: true,
      requiredPrivilege: 100,
      environment: ['development'],
    })
  }

  return sections
}

export function getCustomUserConfig(email?: string): Partial<UserInfoConfig> {
  // 特定ユーザーのカスタム設定
  if (email === 'tsubasa.a.283.0505@gmail.com') {
    return {
      features: {
        showDetailedStats: true,
        showDebugInfo: true,
        showAdminPanel: true,
        showDeveloperTools: true,
      }
    }
  }

  return {}
}