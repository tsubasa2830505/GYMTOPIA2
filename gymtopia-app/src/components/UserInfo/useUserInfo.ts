'use client'

/**
 * useUserInfo Hook
 * ユーザー情報を管理するカスタムフック
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  createUserInfoConfig,
  getAvailableSections,
  getCustomUserConfig
} from '@/lib/userInfo/config'
import { fetchUserInfo } from '@/lib/userInfo/dataService'
import { UserInfoData, UserInfoConfig, UserInfoSection } from '@/lib/userInfo/types'

interface UseUserInfoOptions {
  /** 自動更新間隔（ミリ秒） */
  refreshInterval?: number
  /** 表示セクションの指定 */
  sections?: string[]
  /** エラー時のリトライ回数 */
  maxRetries?: number
}

interface UseUserInfoReturn {
  /** ユーザー情報データ */
  userInfo: UserInfoData | null
  /** 設定オブジェクト */
  config: UserInfoConfig | null
  /** 利用可能なセクション */
  availableSections: UserInfoSection[]
  /** ローディング状態 */
  isLoading: boolean
  /** エラー状態 */
  error: string | null
  /** データをリフレッシュする関数 */
  refresh: () => Promise<void>
  /** 特定セクションのみ更新する関数 */
  refreshSection: (sectionId: string) => Promise<void>
  /** エラーをクリアする関数 */
  clearError: () => void
}

export default function useUserInfo(options: UseUserInfoOptions = {}): UseUserInfoReturn {
  const {
    refreshInterval,
    sections: requestedSections,
    maxRetries = 3
  } = options

  const { user, isAuthenticated } = useAuth()

  const [userInfo, setUserInfo] = useState<UserInfoData | null>(null)
  const [config, setConfig] = useState<UserInfoConfig | null>(null)
  const [availableSections, setAvailableSections] = useState<UserInfoSection[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // 設定とセクションの初期化
  useEffect(() => {
    if (!user) {
      setConfig(null)
      setAvailableSections([])
      return
    }

    const baseConfig = createUserInfoConfig(user)
    const customConfig = getCustomUserConfig(user.email)
    const mergedConfig = { ...baseConfig, ...customConfig }

    setConfig(mergedConfig)

    const sections = getAvailableSections(mergedConfig, user)
    const filteredSections = requestedSections
      ? sections.filter(section => requestedSections.includes(section.id))
      : sections

    setAvailableSections(filteredSections)
  }, [user, requestedSections])

  // データ取得関数
  const fetchData = useCallback(async (retryOnError = true): Promise<void> => {
    if (!config || !user) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchUserInfo(user, config)
      setUserInfo(data)
      setRetryCount(0) // 成功時はリトライカウントをリセット
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'データの取得に失敗しました'
      setError(errorMessage)

      // リトライ処理
      if (retryOnError && retryCount < maxRetries) {
        setRetryCount(prev => prev + 1)
        setTimeout(() => fetchData(false), 1000 * Math.pow(2, retryCount)) // 指数バックオフ
      }
    } finally {
      setIsLoading(false)
    }
  }, [config, user, retryCount, maxRetries])

  // 初回データ取得
  useEffect(() => {
    if (config && user) {
      fetchData()
    }
  }, [config, user, fetchData])

  // 自動更新の設定
  useEffect(() => {
    if (!refreshInterval || !config || !user) return

    const interval = setInterval(() => {
      fetchData()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval, config, user, fetchData])

  // 手動リフレッシュ関数
  const refresh = useCallback(async (): Promise<void> => {
    setRetryCount(0) // リトライカウントをリセット
    await fetchData()
  }, [fetchData])

  // セクション別リフレッシュ（将来の拡張用）
  const refreshSection = useCallback(async (sectionId: string): Promise<void> => {
    // 現在は全体リフレッシュを実行
    // 将来的に個別セクションの更新機能を追加可能
    await refresh()
  }, [refresh])

  // エラークリア関数
  const clearError = useCallback(() => {
    setError(null)
    setRetryCount(0)
  }, [])

  return {
    userInfo,
    config,
    availableSections,
    isLoading,
    error,
    refresh,
    refreshSection,
    clearError
  }
}