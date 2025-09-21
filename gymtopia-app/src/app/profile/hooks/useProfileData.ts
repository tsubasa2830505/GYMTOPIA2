import { useState, useEffect } from 'react'
import { getUserProfileStats, getWeeklyStats, getUserPosts, getUserAchievements, getUserPersonalRecords, getFavoriteGyms } from '@/lib/supabase/profile'
import type { UserProfileStats, WeeklyStats, GymPost, FavoriteGym } from '@/lib/types/profile'
import type { Achievement, PersonalRecord } from '@/lib/types/workout'

interface ProfileDataState {
  profileData: UserProfileStats | null
  weeklyStats: WeeklyStats | null
  userPosts: GymPost[]
  userAchievements: Achievement[]
  personalRecords: PersonalRecord[]
  favoriteGyms: FavoriteGym[]
  loading: boolean
  error: string | null
}

interface UseProfileDataReturn extends ProfileDataState {
  refreshProfileData: () => Promise<void>
  refreshPosts: () => Promise<void>
  refreshAchievements: () => Promise<void>
  refreshPersonalRecords: () => Promise<void>
  refreshFavoriteGyms: () => Promise<void>
}

export function useProfileData(userId: string | undefined): UseProfileDataReturn {
  const [state, setState] = useState<ProfileDataState>({
    profileData: null,
    weeklyStats: null,
    userPosts: [],
    userAchievements: [],
    personalRecords: [],
    favoriteGyms: [],
    loading: true,
    error: null
  })

  const refreshProfileData = async () => {
    if (!userId) return

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const [profileData, weeklyStats] = await Promise.all([
        getUserProfileStats(userId),
        getWeeklyStats(userId)
      ])

      setState(prev => ({
        ...prev,
        profileData,
        weeklyStats,
        loading: false
      }))
    } catch (error) {
      console.error('Error loading profile data:', error)
      setState(prev => ({
        ...prev,
        error: 'プロフィールデータの読み込みに失敗しました',
        loading: false
      }))
    }
  }

  const refreshPosts = async () => {
    if (!userId) return

    try {
      const userPosts = await getUserPosts(userId)
      setState(prev => ({ ...prev, userPosts }))
    } catch (error) {
      console.error('Error loading posts:', error)
      setState(prev => ({
        ...prev,
        error: '投稿の読み込みに失敗しました'
      }))
    }
  }

  const refreshAchievements = async () => {
    if (!userId) return

    try {
      const userAchievements = await getUserAchievements(userId)
      setState(prev => ({ ...prev, userAchievements }))
    } catch (error) {
      console.error('Error loading achievements:', error)
      setState(prev => ({
        ...prev,
        error: 'アチーブメントの読み込みに失敗しました'
      }))
    }
  }

  const refreshPersonalRecords = async () => {
    if (!userId) return

    try {
      const personalRecords = await getUserPersonalRecords(userId)
      setState(prev => ({ ...prev, personalRecords }))
    } catch (error) {
      console.error('Error loading personal records:', error)
      setState(prev => ({
        ...prev,
        error: '個人記録の読み込みに失敗しました'
      }))
    }
  }

  const refreshFavoriteGyms = async () => {
    if (!userId) return

    try {
      const favoriteGyms = await getFavoriteGyms(userId)
      setState(prev => ({ ...prev, favoriteGyms }))
    } catch (error) {
      console.error('Error loading favorite gyms:', error)
      setState(prev => ({
        ...prev,
        error: 'お気に入りジムの読み込みに失敗しました'
      }))
    }
  }

  // 初期データ読み込み
  useEffect(() => {
    if (userId) {
      refreshProfileData()
      refreshPosts() // Load posts initially
    }
  }, [userId])

  return {
    ...state,
    refreshProfileData,
    refreshPosts,
    refreshAchievements,
    refreshPersonalRecords,
    refreshFavoriteGyms
  }
}