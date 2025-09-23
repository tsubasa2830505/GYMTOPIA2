'use client'

import { useState, useEffect, useRef, useCallback, useMemo, type ReactNode, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import { getUserProfileStats, getWeeklyStats, getUserPosts, getUserAchievements, getUserPersonalRecords, getFavoriteGyms } from '@/lib/supabase/profile'
import { getSupabaseClient } from '@/lib/supabase/client'
import PostCard from '@/components/PostCard'
import CheckinBadges from '@/components/CheckinBadges'
import type { Post } from '@/lib/supabase/posts'
import type { UserProfileStats, WeeklyStats, GymPost, FavoriteGym } from '@/lib/types/profile'
import type { Achievement, PersonalRecord } from '@/lib/types/workout'

// Extracted helpers and utilities
const formatPostDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTrainingDetails = (post: GymPost): string | null => {
  if (!post.workout_session_id || !post.training_details?.exercises) return null

  return post.training_details.exercises
    .map(exercise => `${exercise.name} ${exercise.weight[0] || 0}kg × ${exercise.reps[0] || 0}回 × ${exercise.sets}セット`)
    .join(' • ')
}

const getAchievementIcon = (badgeIcon: string | null | undefined, achievementType: string): ReactNode => {
  const baseClasses = "w-8 h-8"

  if (badgeIcon === '🏆') {
    return (
      <svg className={`${baseClasses} text-[color:var(--gt-tertiary)]`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 7c0-1.11.89-2 2-2h10c1.11 0 2 .89 2 2v1c0 1.55-.7 2.94-1.79 3.87L14 15.08V20l-4 2v-6.92l-3.21-3.21A4.008 4.008 0 0 1 5 8V7z"/>
      </svg>
    )
  }

  if (badgeIcon === '🔥') {
    return (
      <svg className={`${baseClasses} text-[color:var(--gt-tertiary)]`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/>
      </svg>
    )
  }

  if (badgeIcon === '💪') {
    return (
      <svg className={`${baseClasses} text-[color:var(--gt-secondary)]`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"/>
      </svg>
    )
  }

  const colorClass = achievementType === 'streak' ? 'text-[color:var(--gt-tertiary)]' :
                     achievementType === 'personal_record' ? 'text-[color:var(--gt-secondary)]' :
                     'text-[color:var(--gt-primary)]'

  return (
    <svg className={`${baseClasses} ${colorClass}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"/>
    </svg>
  )
}

// Custom hook for profile data management
const useProfileData = (userId: string | undefined) => {
  const [activeTab, setActiveTab] = useState('gym-activity')
  const [userType, setUserType] = useState('user')
  const [profileData, setProfileData] = useState<UserProfileStats | null>(null)
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null)
  const [userPosts, setUserPosts] = useState<GymPost[]>([])
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([])
  const [userPersonalRecords, setUserPersonalRecords] = useState<PersonalRecord[]>([])
  const [favoriteGyms, setFavoriteGyms] = useState<FavoriteGym[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadUserData = useCallback(async (forceRefresh = false) => {
    if (!userId) return

    try {
      if (forceRefresh) setIsRefreshing(true)
      setIsLoading(true)
      setError(null)

      const [profileStats, weeklyStatsData, postsData, achievementsData, personalRecordsData, favoriteGymsData] = await Promise.all([
        getUserProfileStats(userId, forceRefresh),
        getWeeklyStats(userId),
        getUserPosts(userId, 0, 10),
        getUserAchievements(userId),
        getUserPersonalRecords(userId),
        getFavoriteGyms(userId)
      ])

      setProfileData(profileStats)
      setWeeklyStats(weeklyStatsData)
      setUserPosts(postsData)
      setUserAchievements(achievementsData)
      setUserPersonalRecords(personalRecordsData)
      setFavoriteGyms(favoriteGymsData)
    } catch (error) {
      console.error('Failed to load user data:', error)
      setError('データの読み込みに失敗しました')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [userId])

  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  return {
    activeTab,
    setActiveTab,
    userType,
    setUserType,
    profileData,
    weeklyStats,
    userPosts,
    userAchievements,
    userPersonalRecords,
    favoriteGyms,
    isLoading,
    error,
    isRefreshing,
    loadUserData
  }
}

// Profile Header Component
const ProfileHeader = ({ profileData, isLoading }: { profileData: UserProfileStats | null, isLoading: boolean }) => {
  if (isLoading || !profileData) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(186,122,103,0.26)] animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(186,122,103,0.26)]">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          {profileData.avatar_url ? (
            <Image
              src={profileData.avatar_url}
              alt={profileData.display_name}
              width={80}
              height={80}
              className="rounded-full border-4 border-white shadow-md"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-[var(--gt-secondary)] to-[var(--gt-primary)] rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {profileData.display_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[color:var(--foreground)]">{profileData.display_name}</h1>
          {profileData.username && (
            <p className="text-[color:var(--text-muted)]">@{profileData.username}</p>
          )}
          {profileData.bio && (
            <p className="text-[color:var(--text-subtle)] mt-2">{profileData.bio}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 text-center">
        <div className="p-3 bg-[rgba(254,255,250,0.8)] rounded-lg">
          <div className="text-2xl font-bold text-[color:var(--gt-primary)]">{profileData.workout_count}</div>
          <div className="text-xs text-[color:var(--text-muted)]">ワークアウト</div>
        </div>
        <div className="p-3 bg-[rgba(254,255,250,0.8)] rounded-lg">
          <div className="text-2xl font-bold text-[color:var(--gt-secondary)]">{profileData.followers_count}</div>
          <div className="text-xs text-[color:var(--text-muted)]">フォロワー</div>
        </div>
        <div className="p-3 bg-[rgba(254,255,250,0.8)] rounded-lg">
          <div className="text-2xl font-bold text-[color:var(--gt-secondary)]">{profileData.following_count}</div>
          <div className="text-xs text-[color:var(--text-muted)]">フォロー中</div>
        </div>
        <div className="p-3 bg-[rgba(254,255,250,0.8)] rounded-lg">
          <div className="text-2xl font-bold text-[color:var(--gt-tertiary)]">{profileData.achievements_count}</div>
          <div className="text-xs text-[color:var(--text-muted)]">達成記録</div>
        </div>
      </div>
    </div>
  )
}

// Tab Navigation Component
const TabNavigation = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
  const tabs = [
    { id: 'gym-activity', label: 'ジム活動', icon: '🏃‍♂️' },
    { id: 'achievements', label: '達成記録', icon: '🏆' },
    { id: 'personal-records', label: 'PR記録', icon: '💪' },
    { id: 'favorite-gyms', label: 'お気に入りジム', icon: '❤️' }
  ]

  return (
    <div className="bg-white rounded-xl p-2 shadow-sm border border-[rgba(186,122,103,0.26)]">
      <div className="grid grid-cols-4 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`p-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[var(--gt-primary)] text-white shadow-md'
                : 'text-[color:var(--text-muted)] hover:bg-[rgba(254,255,250,0.8)]'
            }`}
          >
            <div className="text-lg mb-1">{tab.icon}</div>
            <div>{tab.label}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

// Tab Content Components
const GymActivityTab = ({ userPosts, isLoading }: { userPosts: GymPost[], isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(186,122,103,0.26)] animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (userPosts.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-[rgba(186,122,103,0.26)] text-center">
        <div className="text-6xl mb-4">🏋️‍♂️</div>
        <h3 className="text-lg font-semibold text-[color:var(--foreground)] mb-2">まだ投稿がありません</h3>
        <p className="text-[color:var(--text-muted)]">ジムでのトレーニングを記録してみましょう！</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {userPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

const AchievementsTab = ({ userAchievements, isLoading }: { userAchievements: Achievement[], isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(186,122,103,0.26)] animate-pulse">
            <div className="h-8 w-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (userAchievements.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-[rgba(186,122,103,0.26)] text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-lg font-semibold text-[color:var(--foreground)] mb-2">達成記録がありません</h3>
        <p className="text-[color:var(--text-muted)]">トレーニングを続けて新しい記録を達成しましょう！</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {userAchievements.map((achievement) => (
        <div key={achievement.id} className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(186,122,103,0.26)]">
          <div className="flex items-center gap-3 mb-3">
            {getAchievementIcon(achievement.badge_icon, achievement.type)}
            <div>
              <h3 className="font-semibold text-[color:var(--foreground)]">{achievement.title}</h3>
              <p className="text-sm text-[color:var(--text-muted)]">
                {new Date(achievement.achieved_at).toLocaleDateString('ja-JP')}
              </p>
            </div>
          </div>
          <p className="text-[color:var(--text-subtle)]">{achievement.description}</p>
        </div>
      ))}
    </div>
  )
}

// Main Profile Content Component
function ProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const refreshTriggered = useRef(false)

  const {
    activeTab,
    setActiveTab,
    profileData,
    weeklyStats,
    userPosts,
    userAchievements,
    userPersonalRecords,
    favoriteGyms,
    isLoading,
    error,
    isRefreshing,
    loadUserData
  } = useProfileData(user?.id)

  // Handle refresh parameter
  useEffect(() => {
    const refresh = searchParams.get('refresh')
    if (refresh === 'true' && !refreshTriggered.current) {
      refreshTriggered.current = true
      loadUserData(true)
      router.replace('/profile', { scroll: false })
    }
  }, [searchParams, loadUserData, router])

  if (error) {
    return (
      <div className="min-h-screen bg-[rgba(254,255,250,0.95)]">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-red-700 mb-2">エラーが発生しました</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => loadUserData(true)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[rgba(254,255,250,0.95)]">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Header */}
        <ProfileHeader profileData={profileData} isLoading={isLoading} />

        {/* Weekly Stats & Checkin Badges */}
        {weeklyStats && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(186,122,103,0.26)]">
            <h2 className="text-lg font-semibold text-[color:var(--foreground)] mb-4">今週の活動</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[color:var(--gt-primary)]">{weeklyStats.workouts || 0}</div>
                <div className="text-sm text-[color:var(--text-muted)]">ワークアウト</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[color:var(--gt-secondary)]">{weeklyStats.checkins || 0}</div>
                <div className="text-sm text-[color:var(--text-muted)]">チェックイン</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[color:var(--gt-tertiary)]">{weeklyStats.streak || 0}</div>
                <div className="text-sm text-[color:var(--text-muted)]">連続日数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[color:var(--gt-primary)]">{weeklyStats.total_duration || 0}</div>
                <div className="text-sm text-[color:var(--text-muted)]">分間</div>
              </div>
            </div>
          </div>
        )}

        {/* Checkin Badges */}
        <CheckinBadges userId={user?.id} />

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'gym-activity' && (
            <GymActivityTab userPosts={userPosts} isLoading={isLoading} />
          )}
          {activeTab === 'achievements' && (
            <AchievementsTab userAchievements={userAchievements} isLoading={isLoading} />
          )}
          {activeTab === 'personal-records' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(186,122,103,0.26)]">
              <h2 className="text-lg font-semibold text-[color:var(--foreground)] mb-4">パーソナルレコード</h2>
              {userPersonalRecords.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">💪</div>
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)] mb-2">PRが記録されていません</h3>
                  <p className="text-[color:var(--text-muted)]">新しい記録を設定してみましょう！</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userPersonalRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 bg-[rgba(254,255,250,0.8)] rounded-lg">
                      <div>
                        <h3 className="font-semibold text-[color:var(--foreground)]">{record.exercise}</h3>
                        <p className="text-sm text-[color:var(--text-muted)]">
                          {new Date(record.set_at).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[color:var(--gt-primary)]">{record.weight}kg</div>
                        <div className="text-sm text-[color:var(--text-muted)]">{record.reps}回</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 'favorite-gyms' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(186,122,103,0.26)]">
              <h2 className="text-lg font-semibold text-[color:var(--foreground)] mb-4">お気に入りジム</h2>
              {favoriteGyms.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">❤️</div>
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)] mb-2">お気に入りジムがありません</h3>
                  <p className="text-[color:var(--text-muted)]">素敵なジムを見つけてお気に入りに追加しましょう！</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favoriteGyms.map((favorite) => (
                    <Link key={favorite.id} href={`/gyms/${favorite.gym.id}`}>
                      <div className="p-4 border border-[rgba(186,122,103,0.26)] rounded-lg hover:shadow-md transition-shadow">
                        <h3 className="font-semibold text-[color:var(--foreground)] mb-1">{favorite.gym.name}</h3>
                        <div className="flex items-center gap-1 text-[color:var(--text-muted)] text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>{favorite.gym.address}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--gt-primary)] mx-auto mb-4"></div>
          <p className="text-[color:var(--text-muted)]">読み込み中...</p>
        </div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  )
}