'use client'

/**
 * User Information Dashboard Component
 * 長期運用対応のユーザー情報ダッシュボード
 */

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  createUserInfoConfig,
  getAvailableSections,
  getCustomUserConfig
} from '@/lib/userInfo/config'
import { fetchUserInfo } from '@/lib/userInfo/dataService'
import { UserInfoData, UserInfoConfig, UserInfoSection } from '@/lib/userInfo/types'
import {
  User,
  Activity,
  BarChart3,
  Settings,
  Shield,
  Code,
  RefreshCw,
  Clock,
  Users,
  TrendingUp,
  Heart,
  Zap,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface UserInfoDashboardProps {
  className?: string
  showSections?: string[]
  minimal?: boolean
}

export default function UserInfoDashboard({
  className = '',
  showSections,
  minimal = false
}: UserInfoDashboardProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [userInfo, setUserInfo] = useState<UserInfoData | null>(null)
  const [config, setConfig] = useState<UserInfoConfig | null>(null)
  const [availableSections, setAvailableSections] = useState<UserInfoSection[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 設定とセクションの初期化
  useEffect(() => {
    if (!user) return

    const baseConfig = createUserInfoConfig(user)
    const customConfig = getCustomUserConfig(user.email)
    const mergedConfig = { ...baseConfig, ...customConfig }

    setConfig(mergedConfig)

    const sections = getAvailableSections(mergedConfig, user)
    const filteredSections = showSections
      ? sections.filter(section => showSections.includes(section.id))
      : sections

    setAvailableSections(filteredSections)
  }, [user, showSections])

  // ユーザー情報の取得
  useEffect(() => {
    if (!config || !user) return

    const loadUserInfo = async () => {
      setDataLoading(true)
      setError(null)

      try {
        const data = await fetchUserInfo(user, config)
        setUserInfo(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました')
      } finally {
        setDataLoading(false)
      }
    }

    loadUserInfo()
  }, [config, user])

  // 手動リフレッシュ
  const handleRefresh = async () => {
    if (!config || !user) return

    setDataLoading(true)
    try {
      const data = await fetchUserInfo(user, config)
      setUserInfo(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'リフレッシュに失敗しました')
    } finally {
      setDataLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg p-6 shadow-sm border-2 border-[rgba(186,122,103,0.26)] ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-[rgba(254,255,250,0.9)] rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-[rgba(254,255,250,0.9)] rounded"></div>
            <div className="h-3 bg-[rgba(254,255,250,0.9)] rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className={`bg-[rgba(231,103,76,0.08)] rounded-lg p-6 border-2 border-[rgba(231,103,76,0.22)] ${className}`}>
        <div className="text-center">
          <User className="w-12 h-12 text-[color:var(--gt-primary)] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[color:var(--gt-primary-strong)] mb-2">ログインが必要です</h3>
          <p className="text-[color:var(--gt-secondary-strong)]">詳細な情報を表示するにはログインしてください。</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-[rgba(231,103,76,0.08)] rounded-lg p-6 border-2 border-[rgba(231,103,76,0.26)] ${className}`}>
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-[color:var(--gt-primary)]" />
          <div>
            <h3 className="text-lg font-semibold text-[color:var(--gt-primary-strong)] mb-1">エラーが発生しました</h3>
            <p className="text-[color:var(--gt-primary-strong)]">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 px-4 py-2 bg-[rgba(231,103,76,0.08)] text-white rounded-lg hover:bg-[color:var(--gt-primary-strong)] transition-colors"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!userInfo || !config) {
    return (
      <div className={`bg-white rounded-lg p-6 shadow-sm border-2 border-[rgba(186,122,103,0.26)] ${className}`}>
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-[rgba(68,73,73,0.6)] mx-auto mb-4 animate-spin" />
          <p className="text-[color:var(--text-muted)]">データを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-[rgba(231,103,76,0.08)] to-[rgba(245,177,143,0.12)] rounded-lg p-6 border-2 border-[rgba(231,103,76,0.22)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[color:var(--foreground)]">
                {userInfo.user.displayName || userInfo.user.username || 'ユーザー'}
              </h2>
              <p className="text-[color:var(--text-muted)]">
                {config.displayLevel === 'admin' && '👑 管理者 • '}
                {config.displayLevel === 'developer' && '💻 開発者 • '}
                権限レベル: {config.privilegeLevel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {dataLoading && <RefreshCw className="w-4 h-4 text-[color:var(--gt-primary)] animate-spin" />}
            <button
              onClick={handleRefresh}
              disabled={dataLoading}
              className="p-2 rounded-lg hover:bg-[rgba(240,142,111,0.14)] transition-colors disabled:opacity-50"
              title="データを更新"
            >
              <RefreshCw className="w-4 h-4 text-[color:var(--gt-secondary-strong)]" />
            </button>
          </div>
        </div>
      </div>

      {/* セクション表示 */}
      <div className="grid gap-6">
        {availableSections.map(section => (
          <UserInfoSection
            key={section.id}
            section={section}
            userInfo={userInfo}
            config={config}
            minimal={minimal}
          />
        ))}
      </div>

      {/* メタデータ（開発者向け） */}
      {config.features.showDebugInfo && (
        <div className="bg-[rgba(254,255,250,0.97)] rounded-lg p-4 border-2 border-[rgba(186,122,103,0.26)]">
          <h3 className="text-sm font-semibold text-[color:var(--text-subtle)] mb-2">デバッグ情報</h3>
          <div className="text-xs text-[color:var(--text-muted)] space-y-1">
            <p>データソース: {userInfo.metadata.source}</p>
            <p>取得時刻: {new Date(userInfo.metadata.fetchedAt).toLocaleString('ja-JP')}</p>
            <p>キャッシュ期限: {new Date(userInfo.metadata.cacheExpiry).toLocaleString('ja-JP')}</p>
            <p>環境: {config.environment}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// 個別セクションコンポーネント
function UserInfoSection({
  section,
  userInfo,
  config,
  minimal
}: {
  section: UserInfoSection
  userInfo: UserInfoData
  config: UserInfoConfig
  minimal: boolean
}) {
  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'stats': return <BarChart3 className="w-5 h-5" />
      case 'activity': return <Activity className="w-5 h-5" />
      case 'profile': return <User className="w-5 h-5" />
      case 'admin': return <Shield className="w-5 h-5" />
      case 'debug': return <Code className="w-5 h-5" />
      case 'system': return <Settings className="w-5 h-5" />
      default: return <User className="w-5 h-5" />
    }
  }

  const renderSectionContent = () => {
    switch (section.id) {
      case 'profile':
        return <ProfileSection userInfo={userInfo} minimal={minimal} />
      case 'basic-stats':
        return <BasicStatsSection userInfo={userInfo} minimal={minimal} />
      case 'detailed-stats':
        return <DetailedStatsSection userInfo={userInfo} minimal={minimal} />
      case 'recent-activity':
        return <RecentActivitySection userInfo={userInfo} minimal={minimal} />
      case 'live-activity':
        return <LiveActivitySection userInfo={userInfo} minimal={minimal} />
      case 'system-info':
        return <SystemInfoSection userInfo={userInfo} config={config} minimal={minimal} />
      case 'admin-panel':
        return <AdminPanelSection userInfo={userInfo} minimal={minimal} />
      case 'developer-tools':
        return <DeveloperToolsSection userInfo={userInfo} config={config} minimal={minimal} />
      default:
        return <div className="text-[color:var(--text-muted)]">このセクションはまだ実装されていません。</div>
    }
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-[rgba(186,122,103,0.26)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-[color:var(--gt-secondary-strong)]">{getSectionIcon(section.type)}</div>
        <h3 className="text-lg font-semibold text-[color:var(--foreground)]">{section.title}</h3>
      </div>
      {renderSectionContent()}
    </div>
  )
}

// セクション実装
function ProfileSection({ userInfo, minimal }: { userInfo: UserInfoData, minimal: boolean }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-[color:var(--text-muted)]">メールアドレス</label>
          <p className="text-[color:var(--foreground)]">{userInfo.user.email}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-[color:var(--text-muted)]">ユーザー名</label>
          <p className="text-[color:var(--foreground)]">{userInfo.user.username || '未設定'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-[color:var(--text-muted)]">登録日</label>
          <p className="text-[color:var(--foreground)]">{new Date(userInfo.user.joinDate).toLocaleDateString('ja-JP')}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-[color:var(--text-muted)]">最終アクティブ</label>
          <p className="text-[color:var(--foreground)]">{new Date(userInfo.user.lastActive).toLocaleDateString('ja-JP')}</p>
        </div>
      </div>
    </div>
  )
}

function BasicStatsSection({ userInfo, minimal }: { userInfo: UserInfoData, minimal: boolean }) {
  const stats = userInfo.stats.basic

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <StatCard icon={<TrendingUp />} label="投稿数" value={stats.totalPosts} />
      <StatCard icon={<Zap />} label="ワークアウト" value={stats.totalWorkouts} />
      <StatCard icon={<Users />} label="フォロワー" value={stats.followers} />
      <StatCard icon={<Heart />} label="フォロー中" value={stats.following} />
      <StatCard icon={<Users />} label="ジム訪問" value={stats.gymVisits} />
    </div>
  )
}

function DetailedStatsSection({ userInfo, minimal }: { userInfo: UserInfoData, minimal: boolean }) {
  const detailed = userInfo.stats.detailed
  if (!detailed) return null

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-md font-semibold text-[color:var(--foreground)] mb-3">週間統計</h4>
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="今週の投稿" value={detailed.weeklyStats.postsThisWeek} />
          <StatCard label="今週のワークアウト" value={detailed.weeklyStats.workoutsThisWeek} />
          <StatCard label="平均セッション時間" value={`${detailed.weeklyStats.avgSessionTime}分`} />
        </div>
      </div>

      <div>
        <h4 className="text-md font-semibold text-[color:var(--foreground)] mb-3">個人記録 (PR)</h4>
        <div className="space-y-2">
          {detailed.personalRecords.map((record, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-[rgba(254,255,250,0.97)] rounded-lg">
              <span className="font-medium">{record.exercise}</span>
              <span className="text-[color:var(--text-muted)]">{record.weight}kg</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RecentActivitySection({ userInfo, minimal }: { userInfo: UserInfoData, minimal: boolean }) {
  return (
    <div className="space-y-3">
      {userInfo.activity.recentActivity.map((activity) => (
        <div key={activity.id} className="flex items-center gap-3 p-3 bg-[rgba(254,255,250,0.97)] rounded-lg">
          <ActivityIcon type={activity.type} />
          <div className="flex-1">
            <p className="text-[color:var(--foreground)]">{activity.title}</p>
            <p className="text-sm text-[color:var(--text-muted)]">{new Date(activity.timestamp).toLocaleString('ja-JP')}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function LiveActivitySection({ userInfo, minimal }: { userInfo: UserInfoData, minimal: boolean }) {
  const liveActivity = userInfo.activity.liveActivity
  if (!liveActivity) return null

  return (
    <div className="space-y-3">
      {liveActivity.map((activity) => (
        <div key={activity.id} className="flex items-center gap-3 p-3 bg-[rgba(231,103,76,0.08)] rounded-lg border border-[rgba(231,103,76,0.22)]">
          <div className="w-2 h-2 bg-[color:var(--gt-primary)] rounded-full animate-pulse"></div>
          <div className="flex-1">
            <p className="text-[color:var(--foreground)]">{activity.content}</p>
            <p className="text-sm text-[color:var(--text-muted)]">{new Date(activity.timestamp).toLocaleString('ja-JP')}</p>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full ${
            activity.priority === 'high' ? 'bg-[rgba(231,103,76,0.12)] text-[color:var(--gt-primary-strong)]' :
            activity.priority === 'medium' ? 'bg-[rgba(245,177,143,0.14)] text-[color:var(--gt-tertiary-strong)]' :
            'bg-[rgba(254,255,250,0.95)] text-[color:var(--text-subtle)]'
          }`}>
            {activity.priority}
          </span>
        </div>
      ))}
    </div>
  )
}

function SystemInfoSection({ userInfo, config, minimal }: { userInfo: UserInfoData, config: UserInfoConfig, minimal: boolean }) {
  const system = userInfo.system

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-md font-semibold text-[color:var(--foreground)] mb-3">公開情報</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-[color:var(--text-muted)]">バージョン</label>
            <p className="text-[color:var(--foreground)]">{system.public.version}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-[color:var(--text-muted)]">ステータス</label>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[color:var(--gt-secondary)]" />
              <span className="text-[color:var(--foreground)]">{system.public.status}</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-[color:var(--text-muted)]">最終更新</label>
            <p className="text-[color:var(--foreground)]">{new Date(system.public.lastUpdate).toLocaleDateString('ja-JP')}</p>
          </div>
        </div>
      </div>

      {system.developer && (
        <div>
          <h4 className="text-md font-semibold text-[color:var(--foreground)] mb-3">開発者情報</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-medium text-[color:var(--text-muted)]">ビルド時刻</label>
              <p className="text-[color:var(--foreground)]">{new Date(system.developer.buildTime).toLocaleString('ja-JP')}</p>
            </div>
            <div>
              <label className="font-medium text-[color:var(--text-muted)]">コミットハッシュ</label>
              <p className="text-[color:var(--foreground)] font-mono">{system.developer.commitHash.substring(0, 8)}</p>
            </div>
            <div>
              <label className="font-medium text-[color:var(--text-muted)]">Node.js バージョン</label>
              <p className="text-[color:var(--foreground)]">{system.developer.nodeVersion}</p>
            </div>
            <div>
              <label className="font-medium text-[color:var(--text-muted)]">環境</label>
              <p className="text-[color:var(--foreground)]">{system.developer.environment}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AdminPanelSection({ userInfo, minimal }: { userInfo: UserInfoData, minimal: boolean }) {
  const admin = userInfo.stats.admin
  if (!admin) return null

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Users />} label="総ユーザー数" value={admin.totalUsers} />
        <StatCard icon={<Activity />} label="アクティブユーザー" value={admin.activeUsers} />
        <StatCard
          icon={<CheckCircle />}
          label="システム健全性"
          value={admin.systemHealth}
          valueColor={admin.systemHealth === 'good' ? 'text-[color:var(--gt-secondary-strong)]' : 'text-[color:var(--gt-primary-strong)]'}
        />
        <StatCard icon={<BarChart3 />} label="DB クエリ数" value={admin.dbQueries} />
      </div>
    </div>
  )
}

function DeveloperToolsSection({ userInfo, config, minimal }: { userInfo: UserInfoData, config: UserInfoConfig, minimal: boolean }) {
  return (
    <div className="space-y-4">
      <div className="bg-[rgba(254,255,250,0.95)] rounded-lg p-4">
        <h4 className="text-md font-semibold text-[color:var(--foreground)] mb-3">設定情報</h4>
        <pre className="text-xs text-[color:var(--text-subtle)] overflow-x-auto">
          {JSON.stringify(config, null, 2)}
        </pre>
      </div>
    </div>
  )
}

// ヘルパーコンポーネント
function StatCard({
  icon,
  label,
  value,
  valueColor = 'text-[color:var(--foreground)]'
}: {
  icon?: React.ReactNode
  label: string
  value: string | number
  valueColor?: string
}) {
  return (
    <div className="text-center p-3 bg-[rgba(254,255,250,0.97)] rounded-lg">
      {icon && <div className="text-[color:var(--gt-secondary-strong)] mb-2 flex justify-center">{icon}</div>}
      <p className="text-sm font-medium text-[color:var(--text-muted)]">{label}</p>
      <p className={`text-lg font-bold ${valueColor}`}>{value}</p>
    </div>
  )
}

function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case 'post': return <TrendingUp className="w-4 h-4 text-[color:var(--gt-primary)]" />
    case 'workout': return <Zap className="w-4 h-4 text-[color:var(--gt-secondary)]" />
    case 'follow': return <Users className="w-4 h-4 text-[color:var(--gt-secondary)]" />
    case 'achievement': return <CheckCircle className="w-4 h-4 text-[color:var(--gt-tertiary)]" />
    default: return <Activity className="w-4 h-4 text-[color:var(--text-muted)]" />
  }
}