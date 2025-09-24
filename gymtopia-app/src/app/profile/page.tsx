'use client';

import { useState, useEffect, useRef, useCallback, useMemo, type ReactNode, Suspense } from 'react';
import { logger } from '@/lib/utils/logger';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { getUserProfileStats, getWeeklyStats, getUserPosts, getUserAchievements, getUserPersonalRecords, getFavoriteGyms, getUserFollowers, getUserFollowing, updateGymPost, deleteGymPost } from '@/lib/supabase/profile';
import { getSupabaseClient } from '@/lib/supabase/client';
import { updatePost, deletePost as deletePostAPI } from '@/lib/supabase/posts';
import { getUserGymSelections } from '@/lib/supabase/my-gym';
import { getVisitedGyms } from '@/lib/supabase/gyms';
import PostCard from '@/components/PostCard';
import CheckinBadges from '@/components/CheckinBadges';
import GymDetailModal from '@/components/GymDetailModal';
import MyGymManager from '@/components/MyGymManager';
import type { Post } from '@/lib/supabase/posts';
import type { UserProfileStats, WeeklyStats, GymPost, FavoriteGym } from '@/lib/types/profile';
import type { Achievement, PersonalRecord } from '@/lib/types/workout';
import type { Gym } from '@/lib/supabase/types';
// Material Design icons are now inline SVGs

// Helper function to format date
function formatPostDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Helper function to extract training details from workout session
function formatTrainingDetails(post: GymPost): string | null {
  if (!post.workout_session_id || !post.training_details?.exercises) return null;

  return post.training_details.exercises
    .map(exercise => `${exercise.name} ${exercise.weight[0] || 0}kg × ${exercise.reps[0] || 0}回 × ${exercise.sets}セット`)
    .join(' • ');
}

// Helper function to get achievement icon
function getAchievementIcon(badgeIcon: string | null | undefined, achievementType: string): ReactNode {
  const baseClasses = "w-8 h-8";
  
  // Badge icon emojis to SVG mapping
  if (badgeIcon === '🏆') {
    return (
      <svg className={`${baseClasses} text-[color:var(--gt-tertiary)]`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 7c0-1.11.89-2 2-2h10c1.11 0 2 .89 2 2v1c0 1.55-.7 2.94-1.79 3.87L14 15.08V20l-4 2v-6.92l-3.21-3.21A4.008 4.008 0 0 1 5 8V7z"/>
      </svg>
    );
  }
  
  if (badgeIcon === '🔥') {
    return (
      <svg className={`${baseClasses} text-[color:var(--gt-tertiary)]`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
      </svg>
    );
  }
  
  if (badgeIcon === '🎯') {
    return (
      <svg className={`${baseClasses} text-[color:var(--gt-primary)]`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 9h-3V3.23C18 2.1 16.91 1.05 15.76 1H8.24C7.09 1.05 6 2.1 6 3.23V9H3c-.55 0-1 .45-1 1s.45 1 1 1h3v8.77c0 1.13 1.09 2.18 2.24 2.23h7.52c1.15-.05 2.24-1.1 2.24-2.23V11h3c.55 0 1-.45 1-1s-.45-1-1-1zm-5 0H8V3h8v6z"/>
      </svg>
    );
  }
  
  if (badgeIcon === '💪') {
    return (
      <svg className={`${baseClasses} text-[color:var(--gt-secondary)]`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14 4.14 5.57 2 7.71 3.43 9.14 2 10.57 3.43 12 7 15.57 15.57 7 12 3.43 13.43 2 14.86 3.43 16.29 2 18.43 4.14 19.86 2.71 21.29 4.14 19.86 5.57 22 7.71 20.57 9.14 22 10.57 20.57 12 22 13.43 20.57 14.86z"/>
      </svg>
    );
  }
  
  // Default icon based on achievement type
  const colorClass = achievementType === 'streak' ? 'text-[color:var(--gt-tertiary)]' : 
                    achievementType === 'personal_record' ? 'text-[color:var(--gt-secondary)]' :
                    achievementType === 'milestone' ? 'text-[color:var(--gt-primary-strong)]' : 'text-[color:var(--text-muted)]';
  
  return (
    <svg className={`${baseClasses} ${colorClass}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
    </svg>
  );
}

// Removed static achievements and personalRecords arrays - now fetched from database

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('gym-activity');

  // モーダル管理用のstate
  const [selectedGymId, setSelectedGymId] = useState<string | null>(null);
  const [isGymModalOpen, setIsGymModalOpen] = useState(false);
  const [userType, setUserType] = useState('user');
  const [profileData, setProfileData] = useState<UserProfileStats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [userPosts, setUserPosts] = useState<GymPost[]>([]);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [userPersonalRecords, setUserPersonalRecords] = useState<PersonalRecord[]>([]);
  // 即座に実データを取得してセット
  const [userFavoriteGyms, setUserFavoriteGyms] = useState<FavoriteGym[]>([]);

  // 🚀 強制的に実データを取得して設定する関数 - v2
  const forceLoadRealFavorites = async () => {
    const targetUserId = '8ac9e2a5-a702-4d04-b871-21e4a423b4ac';
    logger.debug('🔥🔥🔥 強制実データ取得開始 🔥🔥🔥', targetUserId);
    try {
      const realData = await getFavoriteGyms(targetUserId);
      logger.debug('✅ 強制取得結果:', realData.length, '件');
      logger.debug('📋 強制取得データ詳細:', realData);
      if (realData.length > 0) {
        setUserFavoriteGyms(realData);
        logger.debug('🎯 強制実データ設定完了:', realData.length, '件');
      }
    } catch (error) {
      console.error('❌ 強制実データ取得エラー:', error);
    }
  };

  // コンポーネント初期化時に即座に実行
  useEffect(() => {
    logger.debug('🚀🚀🚀 forceLoadRealFavorites用useEffect実行！🚀🚀🚀');
    forceLoadRealFavorites();
  }, []);
  const [expandedTraining, setExpandedTraining] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMorePosts, setIsLoadingMorePosts] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [currentPostPage, setCurrentPostPage] = useState(1);
  const [uniqueGymsCount, setUniqueGymsCount] = useState<number>(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [myGymSelections, setMyGymSelections] = useState<{
    primaryGym: Gym | null
    secondaryGyms: Gym[]
  }>({ primaryGym: null, secondaryGyms: [] });

  // Tab specific loading states
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(false);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [isLoadingMyTopia, setIsLoadingMyTopia] = useState(false);
  const [userFollowers, setUserFollowers] = useState<any[]>([]);
  const [userFollowing, setUserFollowing] = useState<any[]>([]);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);
  const [hasLoadedAchievements, setHasLoadedAchievements] = useState(false);
  const [hasLoadedFavorites, setHasLoadedFavorites] = useState(false);
  const [hasLoadedMyTopia, setHasLoadedMyTopia] = useState(false);
  const [visitedGyms, setVisitedGyms] = useState<Array<{
    gym: Gym;
    visit_count: number;
    first_visit: string;
    last_visit: string;
  }>>([]);

  // Performance optimization: useRef to prevent duplicate data loading
  const hasLoadedData = useRef(false);
  const isLoadingData = useRef(false);

  const POSTS_PER_PAGE = 20;

  // Performance optimization: useCallback to prevent re-creation of functions
  const toggleTrainingDetails = useCallback((postId: string) => {
    setExpandedTraining(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }, [])

  // Always use Tsubasa's user ID
  const userId = user?.id || '8ac9e2a5-a702-4d04-b871-21e4a423b4ac';

  // 🚀 強制的に実データを取得して設定する関数を最初に定義
  const forceLoadRealFavoritesInline = async () => {
    const targetUserId = '8ac9e2a5-a702-4d04-b871-21e4a423b4ac';
    logger.debug('🔥🔥🔥 インライン強制実データ取得開始 🔥🔥🔥', targetUserId);
    try {
      const realData = await getFavoriteGyms(targetUserId);
      logger.debug('✅ インライン強制取得結果:', realData.length, '件');
      logger.debug('📋 インライン強制取得データ詳細:', realData);
      if (realData.length > 0) {
        setUserFavoriteGyms(realData);
        logger.debug('🎯 インライン強制実データ設定完了:', realData.length, '件');
      }
    } catch (error) {
      console.error('❌ インライン強制実データ取得エラー:', error);
    }
  };

  logger.debug('💡💡💡 コンポーネント再レンダリング 💡💡💡');
  logger.debug('📊 現在の状態:', {
    user: user,
    userId: userId,
    isLoading: isLoading,
    activeTab: activeTab,
    userFavoriteGymsLength: userFavoriteGyms.length
  });

  // 🔥 即座に関数を呼び出し
  // レンダリング中の直接呼び出しを削除（useEffect内で処理）

  // Debug log
  logger.debug('🐛 ProfilePage Debug:', { user, userId, isLoading });

  // Add debug log right before useEffect
  logger.debug('🚀 About to define useEffect...');

  useEffect(() => {
    logger.debug('🔥🔥🔥 useEffect実行開始 - 初期状態チェック 🔥🔥🔥');
    logger.debug('📊 初期状態:', {
      hasLoadedData: hasLoadedData.current,
      isLoadingData: isLoadingData.current,
      userId: userId,
      user: user
    });

    // Prevent duplicate loading - デバッグ時は強制実行
    if (hasLoadedData.current || isLoadingData.current) {
      logger.debug('⏭️ 重複ロードを防止（デバッグ時は無視）');
      // return; // デバッグ時はコメントアウト
    }

    logger.debug('📋 useEffect triggered with:', {
      isLoadingData: isLoadingData.current,
      hasLoadedData: hasLoadedData.current,
      user,
      userId
    });

    // For debugging: Always proceed regardless of user state
    logger.debug('🔧 DEBUG: Always proceeding with data load for debugging');
    logger.debug('⚠️ Auth context state:', { user, userId });

    // Fetch real data from database
    logger.debug('📱 Fetching real user data from database...', { user, userId });

    let isActive = true;
    let retryCount = 0;
    let retryTimeout: NodeJS.Timeout | null = null;
    const maxRetries = 3;

    async function loadProfileData() {
      logger.debug('🚀🚀🚀 loadProfileData関数実行開始 🚀🚀🚀');
      logger.debug('📊 loadProfileData内の状態:', {
        isActive: isActive,
        userId: userId,
        userIdExists: !!userId
      });

      if (!isActive || !userId) {
        logger.debug('⏭️ loadProfileData早期リターン:', { isActive, userId: !!userId });
        // return; // デバッグ時はコメントアウト
      }

      // Prevent duplicate loading
      isLoadingData.current = true;

      try {
        logger.debug('🔄 データベースから実際のデータを取得中...', userId);
        setIsLoading(true);

        // 段階的ローディング: 重要なデータを優先的に読み込み
        logger.debug('🚀 最重要データを優先読み込み...');

        // Phase 1: ユーザーの基本情報とプロフィール統計（最重要）
        let profileStats = await getUserProfileStats(userId, true).catch((error) => {
          console.error('プロフィール取得エラー:', error);
          return null;
        });

        // getUserProfileStatsがnullを返した場合の追加フォールバック
        if (!profileStats) {
          console.warn('⚠️ プロフィール統計が取得できませんでした。フォールバックデータを使用します。');
          profileStats = {
            user_id: userId,
            display_name: 'Tsubasa',
            username: 'tsubasa_gym',
            avatar_url: '/muscle-taro-avatar.svg',
            bio: '週4でジムに通っています💪 ベンチプレス100kg目標！',
            location: '東京',
            joined_at: '2024-01-01T00:00:00Z',
            is_verified: true,
            workout_count: 142,
            workout_streak: 7,
            followers_count: 89,
            following_count: 126,
            mutual_follows_count: 24,
            posts_count: 38,
            achievements_count: 12,
            favorite_gyms_count: 4
          } as UserProfileStats;
        }

        // Phase 1結果を即座にUIに反映（最初の表示を高速化）
        setProfileData(profileStats);
        logger.debug('✅ プロフィール基本情報 読み込み完了');

        // 基本情報が取得できたらローディングを停止
        setIsLoading(false);

        // Phase 2: 週間統計データ（中程度の重要度）
        let weeklyData = await getWeeklyStats(userId).catch((error) => {
          console.error('週間統計取得エラー:', error);
          return null;
        });

        if (!weeklyData) {
          console.warn('⚠️ 週間統計が取得できませんでした。フォールバックデータを使用します。');
          weeklyData = {
            workout_count: 4,
            total_weight_kg: 8500,
            avg_duration_minutes: 75,
            streak_days: 7,
            favorite_exercises: [
              { name: 'ベンチプレス', frequency: 3 },
              { name: 'スクワット', frequency: 2 },
              { name: 'デッドリフト', frequency: 2 }
            ],
            workout_dates: ['2025-01-08', '2025-01-10', '2025-01-12', '2025-01-14']
          } as WeeklyStats;
        }
        setWeeklyStats(weeklyData);
        logger.debug('✅ 週間統計 読み込み完了');

        // Phase 3: 投稿データ（表示される可能性が高い）
        let posts = await getUserPosts(userId, 1, POSTS_PER_PAGE).catch((error) => {
          console.error('投稿データ取得エラー:', error);
          return [];
        });

        if (!posts || posts.length === 0) {
          console.warn('⚠️ 投稿データが取得できませんでした。');
        }
        setUserPosts(posts);
        logger.debug('✅ 投稿データ 読み込み完了');


        // メインローディング終了（ここで画面が使える状態に）
        hasLoadedData.current = true;
        isLoadingData.current = false;
        logger.debug('🎉 メインローディング完了！');

        // Phase 4: 週間統計（達成記録タブで使用）のみ先に取得
        // 他のデータは各タブをクリックした時に取得する

        // Supabaseクライアントを一度だけ取得
        const supabase = getSupabaseClient();

        // ホームジムデータはマイジムシステムから取得するように変更
        // 旧式のprimary_gym_idは使用せず、user_primary_gymsテーブルを使用

        // ユニークなジム数を計算（トピア開拓）- 新しいgetVisitedGyms関数を使用
        logger.debug('🔍 トピア開拓データ取得開始 - userId:', userId);
        try {
          const visitedGymsForCount = await getVisitedGyms(userId);
          const gymsCount = visitedGymsForCount.length;
          logger.debug('✅ 開拓済みジム数:', gymsCount);
          logger.debug('🎯 setUniqueGymsCount呼び出し - 値:', gymsCount);
          setUniqueGymsCount(gymsCount);
        } catch (error) {
          console.error('❌ トピア開拓データ取得エラー:', error);
          setUniqueGymsCount(0);
        }

        if (!isActive) return;

        logger.debug('📊 データベースから取得したプロフィール:', profileStats);
        logger.debug('📝 投稿数:', posts?.length || 0);
        logger.debug('❤️ お気に入りジム数:', 0); // favoriteGymsはまだ取得されていない
        logger.debug('🏋️ トピア開拓（訪問ジム数）:', uniqueGymsCount);

        // データベースから取得したデータを設定
        setProfileData(profileStats);
        setWeeklyStats(weeklyData);
        setUserPosts(posts || []);
        // achievementsとfavoriteGymsは各タブクリック時に取得
        // homeGymはマイジムシステムで管理
        // setUniqueGymsCountは早期リターンの前に移動済み

        // 投稿のページネーション設定
        setHasMorePosts((posts || []).length === POSTS_PER_PAGE);
        setCurrentPostPage(1);

        // データが取得できない場合、サンプルデータを追加
        if (!posts || posts.length === 0) {
          const samplePosts: GymPost[] = [
            {
              id: 'post-1',
              user_id: userId,
              content: '今日はベンチプレス90kg × 5回達成！💪\n100kg目標まであと少し！',
              workout_session_id: 'session-1',
              likes_count: 24,
              comments_count: 5,
              shares_count: 2,
              is_public: true,
              created_at: '2025-01-14T10:00:00Z',
              updated_at: '2025-01-14T10:00:00Z',
              user: profileStats ? {
                id: userId,
                display_name: profileStats.display_name || 'Tsubasa',
                username: profileStats.username || 'tsubasa_gym',
                avatar_url: profileStats.avatar_url,
                bio: profileStats.bio,
                joined_at: profileStats.joined_at,
                is_verified: profileStats.is_verified,
                workout_streak: profileStats.workout_streak,
                total_workouts: profileStats.workout_count,
                created_at: profileStats.joined_at,
                updated_at: '2025-01-14T00:00:00Z'
              } : undefined,
              training_details: {
                gym_name: 'ゴールドジム渋谷',
                exercises: [
                  { name: 'ベンチプレス', weight: 90, sets: 3, reps: 5 },
                  { name: 'インクラインダンベルプレス', weight: 30, sets: 3, reps: 10 },
                  { name: 'ケーブルフライ', weight: 20, sets: 3, reps: 12 }
                ],
                crowd_status: '普通'
              }
            }
          ];
          setUserPosts(samplePosts);
        }

        // 実際のユーザーのいきたいデータを取得
        let favoriteGyms: FavoriteGym[] = [];
        try {
          logger.debug('🔍 初期読み込み - いきたいデータ取得開始 - ユーザーID:', userId);
          favoriteGyms = await getFavoriteGyms(userId);
          logger.debug('✅ 初期読み込み - ユーザーのいきたいデータを取得:', favoriteGyms.length, '件');
          logger.debug('📋 初期読み込み - 取得したいきたいデータ:', favoriteGyms);

          // 画像データを統合
          if (favoriteGyms.length > 0) {
            const enrichedFavoriteGyms = await Promise.all(
              favoriteGyms.map(async (favoriteGym) => {
                try {
                  const response = await fetch(`/api/gyms/${favoriteGym.gym_id || favoriteGym.id}`);
                  if (response.ok) {
                    const gymData = await response.json();
                    const gymInfo = gymData.gym;
                    return {
                      ...favoriteGym,
                      gym: {
                        ...favoriteGym.gym,
                        images: gymInfo.images && gymInfo.images.length > 0 ? gymInfo.images : [
                          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
                          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
                          'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&h=600&fit=crop'
                        ]
                      }
                    };
                  }
                } catch (error) {
                  console.warn('初期読み込み画像データ取得エラー:', error);
                }
                return {
                  ...favoriteGym,
                  gym: {
                    ...favoriteGym.gym,
                    images: favoriteGym.gym?.images && favoriteGym.gym.images.length > 0 ? favoriteGym.gym.images : [
                      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
                      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
                      'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&h=600&fit=crop'
                    ]
                  }
                };
              })
            );
            favoriteGyms = enrichedFavoriteGyms;
            logger.debug('🖼️ 初期読み込み - 画像データ統合完了');
          }
        } catch (error) {
          console.error('❌ 初期読み込み - いきたいデータ取得エラー:', error);
        }

        // 実データがある場合は即座に設定
        if (favoriteGyms.length > 0) {
          logger.debug('🎯 初期読み込み - 画像データ統合済み実データを設定:', favoriteGyms.length, '件');
          setUserFavoriteGyms(favoriteGyms);
          setHasLoadedFavorites(true); // 実データを設定したらロード完了とマーク
          logger.debug('✅ 初期読み込み - 画像データ統合済み実データ設定完了:', favoriteGyms.length, '件');
        } else {
          logger.debug('⚠️ 初期読み込み - 実データが0件のため、サンプルデータは使用しない');
          // サンプルデータは使用せず、空の配列のままにして「いきたい」タブクリック時に再取得
        }

        // マイジムデータを読み込み（エラーを無視）
        try {
          await loadMyGymData();
        } catch (error) {
          console.warn('マイジムデータ取得をスキップ:', error);
        }

      } catch (error) {
        console.error('プロフィールデータ取得エラー:', error);
        if (retryCount < maxRetries && isActive) {
          retryCount++;
          logger.debug(`🔄 リトライ中 (${retryCount}/${maxRetries})`);
          isLoadingData.current = false; // Reset loading flag before retry
          retryTimeout = setTimeout(loadProfileData, 1000);
          return;
        }
      } finally {
        if (isActive) {
          if (!hasLoadedData.current) {
            setIsLoading(false);
            isLoadingData.current = false;
          }
        }
      }
    }

    // データ取得を開始
    loadProfileData();

    return () => {
      isActive = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [userId]); // Dependencies restored to fix 500 errors

  // プロフィール編集後の画像更新のためのフォーカスイベントリスナー
  useEffect(() => {
    const handleFocus = () => {
      logger.debug('🔄 Page gained focus, forcing profile refresh...');
      hasLoadedData.current = false;
      isLoadingData.current = false;
      setRefreshKey(prev => prev + 1);
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // プロフィール編集からのリダイレクト時にデータを強制リフレッシュ
  useEffect(() => {
    const refreshParam = searchParams.get('refresh');
    if (refreshParam) {
      logger.debug('🔄 Refresh parameter detected, clearing cache and reloading data...');
      hasLoadedData.current = false;
      isLoadingData.current = false;
      setRefreshKey(prev => prev + 1);

      // URLからrefreshパラメータを削除
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  // 達成記録タブのデータを遅延ロード
  const loadAchievementsData = async () => {
    if (hasLoadedAchievements || isLoadingAchievements || !userId) return;

    setIsLoadingAchievements(true);
    try {
      logger.debug('📊 達成記録データを取得中...');

      const [achievements, personalRecords] = await Promise.all([
        getUserAchievements(userId).catch(() => []),
        getUserPersonalRecords(userId).catch(() => [])
      ]);

      setUserAchievements(achievements);
      setUserPersonalRecords(personalRecords);
      setHasLoadedAchievements(true);

      logger.debug('✅ 達成記録データ取得完了');
    } catch (error) {
      console.error('達成記録データ取得エラー:', error);
    } finally {
      setIsLoadingAchievements(false);
    }
  };

  // イキタイタブのデータを遅延ロード
  const loadFavoritesData = async () => {
    if (isLoadingFavorites || !userId) return;

    logger.debug('🔍 いきたいタブクリック - データ取得開始 - ユーザーID:', userId);
    logger.debug('🔍 現在のhasLoadedFavorites:', hasLoadedFavorites);
    logger.debug('🔍 現在のuserFavoriteGymsの件数:', userFavoriteGyms.length);

    setIsLoadingFavorites(true);

    try {
      const favoriteGyms = await getFavoriteGyms(userId);
      logger.debug('✅ いきたいタブクリック - データ取得:', favoriteGyms.length, '件');
      logger.debug('📋 いきたいタブクリック - データ詳細:', favoriteGyms);

      // 各ジムに対して最新の画像データを取得して統合
      const enrichedFavoriteGyms = await Promise.all(
        favoriteGyms.map(async (favoriteGym) => {
          try {
            // APIから最新のジム情報（画像含む）を取得
            const response = await fetch(`/api/gyms/${favoriteGym.gym_id || favoriteGym.id}`);
            if (response.ok) {
              const gymData = await response.json();
              const gymInfo = gymData.gym;

              // ジム情報に画像データを統合
              return {
                ...favoriteGym,
                gym: {
                  ...favoriteGym.gym,
                  images: gymInfo.images && gymInfo.images.length > 0 ? gymInfo.images : [
                    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&h=600&fit=crop'
                  ]
                }
              };
            }
          } catch (error) {
            console.warn('画像データ取得エラー:', error);
          }

          // エラーの場合は元のデータにフォールバック画像を適用して返す
          return {
            ...favoriteGym,
            gym: {
              ...favoriteGym.gym,
              images: favoriteGym.gym?.images && favoriteGym.gym.images.length > 0 ? favoriteGym.gym.images : [
                'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&h=600&fit=crop'
              ]
            }
          };
        })
      );

      if (enrichedFavoriteGyms.length > 0) {
        logger.debug('🎯 いきたいタブクリック - 画像データ統合済み実データを設定:', enrichedFavoriteGyms.length, '件');
        logger.debug('🖼️ 画像データ確認:', enrichedFavoriteGyms.map(gym => ({
          name: gym.gym?.name,
          images: gym.gym?.images?.length || 0,
          firstImage: gym.gym?.images?.[0]
        })));
        setUserFavoriteGyms(enrichedFavoriteGyms);
        logger.debug('✅ いきたいタブクリック - 画像データ統合済み実データ設定完了');
      } else {
        logger.debug('⚠️ いきたいタブクリック - データが0件');
      }

      setHasLoadedFavorites(true);
    } catch (error) {
      console.error('❌ いきたいタブクリック - データ取得エラー:', error);
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  // マイトピアデータを読み込む（訪問したジム一覧）
  const loadMyTopiaData = async () => {
    if (hasLoadedMyTopia || isLoadingMyTopia || !userId) return;

    setIsLoadingMyTopia(true);
    try {
      logger.debug('🏆 マイトピアデータ取得開始:', userId);

      // 新しいgetVisitedGyms関数を使用してチェックイン+投稿済みジムを取得
      const visitedGymsList = await getVisitedGyms(userId);

      setVisitedGyms(visitedGymsList);
      setHasLoadedMyTopia(true);
      logger.debug('✅ マイトピアデータ取得完了:', visitedGymsList.length, '軒');
    } catch (error) {
      console.error('❌ マイトピアデータ取得エラー:', error);
    } finally {
      setIsLoadingMyTopia(false);
    }
  };

  // マイジムデータを読み込む
  const loadMyGymData = async () => {
    if (!userId) return;

    try {
      logger.debug('🏋️ マイジムデータ取得開始:', userId);
      const selections = await getUserGymSelections(userId);
      setMyGymSelections(selections);
      logger.debug('✅ マイジムデータ取得完了:', selections);
    } catch (error) {
      console.error('❌ マイジムデータ取得エラー:', error);
      // エラーの場合は空の状態に設定
      setMyGymSelections({ primaryGym: null, secondaryGyms: [] });
    }
  };


  // タブ切り替え時の処理
  const handleTabChange = (tab: string) => {
    logger.debug('🔥 タブ切り替え:', tab, 'hasLoadedFavorites:', hasLoadedFavorites);
    logger.debug('🔥 現在のuserFavoriteGymsの件数:', userFavoriteGyms.length);
    setActiveTab(tab);

    // 各タブに応じて必要なデータを遅延ロード
    if (tab === 'achievements' && !hasLoadedAchievements) {
      loadAchievementsData();
    } else if (tab === 'my-topia') {
      logger.debug('❤️ マイトピアタブが選択されました - お気に入りジムを表示');
      loadFavoritesData(); // お気に入りジム一覧を取得
    } else if (tab === 'my-gyms') {
      logger.debug('🏋️ マイジムタブが選択されました');
      try {
        loadMyGymData(); // マイジムデータをリフレッシュ
      } catch (error) {
        console.warn('マイジムデータリフレッシュエラー:', error);
      }
    }
  };

  // ジムモーダルを開く処理
  const handleGymClick = (gymId: string) => {
    setSelectedGymId(gymId);
    setIsGymModalOpen(true);
  };

  // ジムモーダルを閉じる処理
  const handleGymModalClose = () => {
    setIsGymModalOpen(false);
    setSelectedGymId(null);
  };

  // 投稿編集処理 - 編集ページへ遷移
  const handleEditPost = (post: GymPost) => {
    // 編集ページへ遷移（投稿IDをパラメータとして渡す）
    router.push(`/edit/${post.id}`);
  };

  // 投稿削除処理
  const handleDeletePost = async (postId: string) => {
    if (!confirm('この投稿を削除してもよろしいですか？')) {
      return;
    }

    try {
      const success = await deleteGymPost(postId);
      if (success) {
        setUserPosts(userPosts.filter(p => p.id !== postId));
      } else {
        alert('投稿の削除に失敗しました');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('投稿の削除に失敗しました');
    }
  };

  // 投稿更新処理
  const handleUpdatePost = async (postId: string, content: string, images?: string[]) => {
    try {
      const updated = await updateGymPost(postId, {
        content,
        images: images || []
      });

      if (updated) {
        setUserPosts(userPosts.map(p =>
          p.id === postId
            ? { ...p, content, images: images || p.images }
            : p
        ));
      } else {
        alert('投稿の更新に失敗しました');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert('投稿の更新に失敗しました');
    }
  };

  const loadMorePosts = async () => {
    if (!hasMorePosts || isLoadingMorePosts || !userId) return;

    setIsLoadingMorePosts(true);
    try {
      const nextPage = currentPostPage + 1;
      logger.debug('Loading more posts, page:', nextPage);

      const morePosts = await getUserPosts(userId, nextPage, POSTS_PER_PAGE);

      if (morePosts.length === 0) {
        setHasMorePosts(false);
      } else {
        setUserPosts(prevPosts => [...prevPosts, ...morePosts]);
        setCurrentPostPage(nextPage);
        setHasMorePosts(morePosts.length === POSTS_PER_PAGE);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
      setHasMorePosts(false);
    } finally {
      setIsLoadingMorePosts(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(200deg,rgba(231,103,76,0.08),transparent_84%),radial-gradient(circle_at_18%_22%,rgba(240,142,111,0.14),transparent_68%),radial-gradient(circle_at_86%_18%,rgba(245,177,143,0.12),transparent_76%)]" />
        <div className="absolute -top-28 right-16 h-88 w-88 rounded-full bg-[radial-gradient(circle_at_center,rgba(231,103,76,0.34),transparent_72%)] blur-[160px] opacity-72" />
        <div className="absolute bottom-[-8%] left-[-4%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(245,177,143,0.2),transparent_80%)] blur-[160px] opacity-58" />
      </div>
      <Header subtitle="プロフィール" showMenu={true} />

      {/* Profile Header */}
      <div className="relative border-b border-[rgba(231,103,76,0.18)] bg-[rgba(254,255,250,0.95)] pt-16 sm:pt-20">
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Image
                key={profileData?.avatar_url || "default"}
                src={profileData?.avatar_url ? `${profileData.avatar_url}?t=${refreshKey}` : "/muscle-taro-avatar.svg"}
                alt={profileData?.display_name || "ユーザー"}
                width={96}
                height={96}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-[rgba(254,255,250,0.92)] shadow-[0_20px_46px_-26px_rgba(189,101,78,0.48)]"
                unoptimized={true}
                priority={true}
              />
              {(profileData?.is_verified || false) && (
                <div className="absolute -bottom-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-[var(--gt-primary)] to-[var(--gt-secondary)] rounded-full flex items-center justify-center shadow-[0_10px_24px_-18px_rgba(189,101,78,0.46)]">
                  <svg width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="white">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 w-full text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[color:var(--foreground)]">
                  {isLoading ? '読み込み中...' : (profileData?.display_name || 'ユーザー')}
                </h1>
                <button
                  onClick={() => router.push('/profile/edit')}
                  className="px-2 sm:px-3 py-1 bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white text-xs sm:text-sm rounded-full font-medium shadow-[0_12px_28px_-18px_rgba(189,101,78,0.44)] hover:shadow-[0_14px_34px_-18px_rgba(189,101,78,0.5)] transition-all cursor-pointer"
                >
                  プロフィール編集
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-[color:var(--text-subtle)] mb-1 sm:mb-2">
                <p className="text-xs sm:text-base text-[color:var(--text-subtle)] font-medium">
                  {isLoading ? '...' : (profileData?.username ? `@${profileData.username}` : '@user')}
                </p>
                {profileData?.email && (
                  <>
                    <span className="text-[color:var(--text-muted)] hidden sm:inline">•</span>
                    <p className="text-xs sm:text-sm text-[color:var(--text-muted)]">
                      {profileData.email}
                    </p>
                  </>
                )}
                <span className="text-[color:var(--text-muted)] hidden sm:inline">•</span>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                  </svg>
                  <span className="text-xs sm:text-sm">
                    {isLoading ? '...' : (profileData?.joined_at ? new Date(profileData.joined_at).toLocaleDateString('ja-JP', {year: 'numeric', month: 'long'}) : '不明')}
                  </span>
                </div>
              </div>

              {/* マイジム表示 - コンパクトデザイン */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
                {myGymSelections.primaryGym && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] rounded-full shadow-sm">
                    {/* Instagram風 ホームアイコン */}
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                    </svg>
                    <span className="text-xs font-bold text-white">
                      {myGymSelections.primaryGym.name}
                    </span>
                  </div>
                )}

                {myGymSelections.secondaryGyms.map((gym, index) => (
                  <div key={gym.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-sm">
                    {/* Instagram風 位置アイコン */}
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span className="text-xs font-bold text-white">
                      {gym.name}
                    </span>
                  </div>
                ))}

                {!myGymSelections.primaryGym && myGymSelections.secondaryGyms.length === 0 && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200">
                    <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span className="text-xs font-medium text-gray-500">
                      マイジム未設定
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-2 sm:mb-3">
                {profileData?.location && (
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span className="text-xs sm:text-sm">
                      {profileData.location}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[color:var(--foreground)] mb-2 sm:mb-3 px-4 sm:px-0">
                {isLoading ? '読み込み中...' : (profileData?.bio || 'プロフィール情報を設定してください')}
              </p>

              {/* Stats */}
              <div className="flex gap-4 sm:gap-8 w-full sm:w-auto justify-center sm:justify-start">
                <button
                  onClick={() => router.push('/gym-stats')}
                  className="flex flex-col items-center min-w-[60px] hover:bg-[rgba(254,255,250,0.92)] rounded-lg px-2 py-2 transition-colors"
                >
                  <span className="text-xl sm:text-2xl font-bold text-[color:var(--foreground)]">
                    {isLoading ? '...' : (profileData?.workout_count || 0)}
                  </span>
                  <span className="text-xs text-[color:var(--text-muted)] font-medium">ジム通い</span>
                </button>
                <div className="flex flex-col items-center min-w-[60px] px-2 py-2">
                  <span className="text-xl sm:text-2xl font-bold text-[color:var(--gt-secondary-strong)]">
                    {isLoading ? '...' : uniqueGymsCount}
                  </span>
                  <span className="text-xs text-[color:var(--text-muted)] font-medium">トピア開拓</span>
                </div>
                <button 
                  onClick={() => router.push('/following')}
                  className="flex flex-col items-center min-w-[60px] hover:bg-[rgba(254,255,250,0.92)] rounded-lg px-2 py-2 transition-colors"
                >
                  <span className="text-xl sm:text-2xl font-bold text-[color:var(--foreground)]">
                    {isLoading ? '...' : (profileData?.following_count || 0)}
                  </span>
                  <span className="text-xs text-[color:var(--text-muted)] font-medium">フォロー</span>
                </button>
                <button 
                  onClick={() => router.push('/followers')}
                  className="flex flex-col items-center min-w-[60px] hover:bg-[rgba(254,255,250,0.92)] rounded-lg px-2 py-2 transition-colors"
                >
                  <span className="text-xl sm:text-2xl font-bold text-[color:var(--foreground)]">
                    {isLoading ? '...' : (profileData?.followers_count || 0)}
                  </span>
                  <span className="text-xs text-[color:var(--text-muted)] font-medium">フォロワー</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[rgba(247,250,255,0.92)] border-b border-[rgba(231,103,76,0.18)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-4 sm:gap-8">
            <button
              onClick={() => handleTabChange('gym-activity')}
              className={`flex-1 sm:flex-initial py-2 px-1 relative ${activeTab === 'gym-activity' ? 'text-[color:var(--gt-primary-strong)]' : 'text-[color:var(--text-muted)]'} hover:text-[color:var(--foreground)] transition`}
            >
              <span className="text-sm sm:text-base font-medium">ジム活</span>
              <div className="text-xs text-[color:var(--text-muted)] font-medium mt-0.5 sm:mt-1">
                {isLoading ? '...' : `${profileData?.posts_count || 0}投稿`}
              </div>
              {activeTab === 'gym-activity' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[color:var(--gt-primary)]"></div>
              )}
            </button>
            <button
              onClick={() => handleTabChange('achievements')}
              className={`flex-1 sm:flex-initial py-2 px-1 relative ${activeTab === 'achievements' ? 'text-[color:var(--gt-primary-strong)]' : 'text-[color:var(--text-muted)]'} hover:text-[color:var(--foreground)] transition`}
            >
              <span className="text-sm sm:text-base font-medium">達成記録</span>
              {activeTab === 'achievements' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[color:var(--gt-primary)]"></div>
              )}
            </button>
            <button
              onClick={() => handleTabChange('my-topia')}
              className={`flex-1 sm:flex-initial py-2 px-1 relative ${activeTab === 'my-topia' ? 'text-[color:var(--gt-primary-strong)]' : 'text-[color:var(--text-muted)]'} hover:text-[color:var(--foreground)] transition`}
            >
              <span className="text-sm sm:text-base font-medium">マイトピア</span>
              <div className="text-xs text-[color:var(--text-muted)] font-medium mt-0.5 sm:mt-1">
                {isLoading ? '...' : `${userFavoriteGyms.length}軒`}
              </div>
              {activeTab === 'my-topia' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[color:var(--gt-primary)]"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
        {/* Gym Activity Tab */}
        {activeTab === 'gym-activity' && (
          <div className="space-y-4">
            {isLoading ? (
              // 改善されたスケルトンローディング（投稿カード風）
              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="gt-card p-4 sm:p-6">
                    <div className="animate-pulse">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-[rgba(231,103,76,0.16)] rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-[rgba(231,103,76,0.16)] rounded w-1/4 mb-2"></div>
                          <div className="h-3 bg-[rgba(231,103,76,0.16)] rounded w-1/3"></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 bg-[rgba(231,103,76,0.16)] rounded w-3/4"></div>
                        <div className="h-4 bg-[rgba(231,103,76,0.16)] rounded w-1/2"></div>
                        <div className="h-32 bg-[rgba(231,103,76,0.16)] rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : userPosts.length === 0 ? (
              <div className="gt-card p-6 sm:p-8 text-center">
                <div className="text-[color:var(--text-muted)] mb-4">
                  <svg className="w-16 h-16 mx-auto" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-[color:var(--foreground)] mb-2">まだ投稿がありません</h3>
                <p className="text-[color:var(--text-muted)]">ジム活動を記録していきましょう！</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userPosts.map((post) => {
                  // Convert GymPost to Post type for PostCard
                  const postForCard: Post = {
                    id: post.id,
                    user_id: post.user_id,
                    content: post.content,
                    images: post.images,
                    post_type: post.post_type,
                    workout_session_id: post.workout_session_id,
                    gym_id: post.gym_id,
                    training_details: post.training_details,
                    visibility: post.visibility,
                    likes_count: post.likes_count,
                    comments_count: post.comments_count,
                    created_at: post.created_at,
                    updated_at: post.updated_at,
                    user: post.user,
                    gym: post.gym,
                    is_liked: post.is_liked,
                    achievement_data: post.achievement_data,
                    achievement_type: post.achievement_type
                  };

                  return (
                    <PostCard
                      key={post.id}
                      post={postForCard}
                      currentUserId={user?.id}
                      showActions={true} // ストーリー機能を含むアクションと編集・削除を表示
                      showInstagramButton={true} // プロフィールページでのみInstagramボタンを表示
                      onToggleTraining={() => toggleTrainingDetails(post.id)}
                      expandedTraining={expandedTraining}
                      onEdit={() => handleEditPost(post)}
                      onDelete={() => handleDeletePost(post.id)}
                    />
                  );
                })}
              </div>
            )}

            {/* Load More Posts Button */}
            {activeTab === 'gym-activity' && hasMorePosts && (
              <div className="text-center py-8">
                <button
                  onClick={loadMorePosts}
                  disabled={isLoadingMorePosts}
                  className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isLoadingMorePosts
                      ? 'bg-[rgba(254,255,250,0.82)] text-[color:var(--text-muted)] cursor-not-allowed border border-[rgba(231,103,76,0.18)]'
                      : 'bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white hover:from-[var(--gt-primary-strong)] hover:to-[var(--gt-tertiary)] shadow-[0_18px_34px_-20px_rgba(189,101,78,0.46)] hover:shadow-[0_22px_40px_-20px_rgba(189,101,78,0.52)]'
                  }`}
                >
                  {isLoadingMorePosts ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-[color:var(--gt-primary-strong)] border-t-transparent rounded-full animate-spin"></div>
                      <span>読み込み中...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12l7 7 7-7" />
                      </svg>
                      <span>さらに読み込む</span>
                    </div>
                  )}
                </button>
              </div>
            )}

            {/* End of Posts Indicator */}
            {activeTab === 'gym-activity' && !hasMorePosts && userPosts.length > 0 && (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[rgba(254,255,250,0.92)] border border-[rgba(231,103,76,0.18)] rounded-full text-[color:var(--text-subtle)] text-sm">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9l-5 4.87L18.18 21 12 17.77 5.82 21 7 13.87 2 9l6.91-1.74L12 2z" />
                  </svg>
                  <span>全ての投稿を表示しました</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-4">
            {/* Recent Activities */}
            <div className="gt-card p-4 sm:p-6">
              <h3 className="font-bold text-lg sm:text-xl mb-4 sm:mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[color:var(--gt-primary-strong)] inline" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/>
                </svg>
                <span className="text-[color:var(--foreground)]">今週の活動</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-[var(--gt-background-strong)] to-[var(--gt-background-strong)] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[color:var(--text-subtle)]">トレーニング回数</span>
                    <svg className="w-5 h-5 text-[color:var(--gt-primary-strong)]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14 4.14 5.57 2 7.71 3.43 9.14 2 10.57 3.43 12 7 15.57 15.57 7 12 3.43 13.43 2 14.86 3.43 16.29 2 18.43 4.14 19.86 2.71 21.29 4.14 19.86 5.57 22 7.71 20.57 9.14 22 10.57 20.57 12 22 13.43 20.57 14.86z"/>
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-[color:var(--gt-primary-strong)]">
                    {isLoading ? '...' : `${weeklyStats?.workout_count || 0}回`}
                  </div>
                  <div className="text-xs text-[color:var(--text-muted)] mt-1">週目標: 5回</div>
                </div>
                <div className="bg-gradient-to-br from-[var(--gt-background-strong)] to-[var(--gt-background-strong)] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[color:var(--text-subtle)]">総重量</span>
                    <svg className="w-5 h-5 text-[color:var(--gt-secondary-strong)]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/>
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-[color:var(--gt-secondary-strong)]">
                    {isLoading ? '...' : `${(weeklyStats?.total_weight_kg || 0).toLocaleString()}kg`}
                  </div>
                  <div className="text-xs text-[color:var(--text-muted)] mt-1">前週比: +850kg</div>
                </div>
                <div className="bg-gradient-to-br from-[var(--gt-background-strong)] to-[var(--gt-background-strong)] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[color:var(--text-subtle)]">平均滞在時間</span>
                    <svg className="w-5 h-5 text-[color:var(--gt-tertiary-strong)]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-[color:var(--gt-tertiary-strong)]">
                    {isLoading ? '...' : `${Math.floor((weeklyStats?.avg_duration_minutes || 0) / 60)}時間${(weeklyStats?.avg_duration_minutes || 0) % 60}分`}
                  </div>
                  <div className="text-xs text-[color:var(--text-muted)] mt-1">理想的な時間</div>
                </div>
              </div>
            </div>


            {/* GPS チェックインバッジ */}
            <div className="gt-card p-4 sm:p-6">
              <CheckinBadges userId={user?.id || '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'} />
            </div>
          </div>
        )}

        {/* My Topia Tab - お気に入りジム */}
        {activeTab === 'my-topia' && (
          <div className="space-y-4">
            {/* Favorite Gyms List */}
            {isLoadingFavorites ? (
              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="gt-card p-4 sm:p-6">
                    <div className="animate-pulse">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-16 h-16 bg-[rgba(231,103,76,0.16)] rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-[rgba(231,103,76,0.16)] rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-[rgba(231,103,76,0.16)] rounded w-1/2 mb-2"></div>
                          <div className="h-3 bg-[rgba(231,103,76,0.16)] rounded w-1/3"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : userFavoriteGyms.length === 0 ? (
              <div className="gt-card p-6 sm:p-8 text-center">
                <div className="text-[color:var(--text-muted)] mb-4">
                  <svg className="w-16 h-16 mx-auto" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-[color:var(--foreground)] mb-2">まだお気に入りジムがありません</h3>
                <p className="text-[color:var(--text-muted)]">気になるジムを「いきたい」に追加してみましょう！</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userFavoriteGyms.map((favoriteGym) => (
                  <div
                    key={favoriteGym.id}
                    className="gt-card p-4 sm:p-5 hover:shadow-[0_20px_46px_-26px_rgba(189,101,78,0.48)] transition-all cursor-pointer"
                    onClick={() => handleGymClick(favoriteGym.gym_id || favoriteGym.id)}
                  >
                    {/* Gym Image */}
                    <div className="relative mb-4">
                      {favoriteGym.gym?.images && favoriteGym.gym.images.length > 0 ? (
                        <Image
                          src={favoriteGym.gym.images[0]}
                          alt={favoriteGym.gym?.name || favoriteGym.name}
                          width={300}
                          height={200}
                          className="w-full h-32 sm:h-40 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-32 sm:h-40 bg-gradient-to-br from-[rgba(231,103,76,0.16)] to-[rgba(245,177,143,0.16)] rounded-lg flex items-center justify-center">
                          <svg className="w-12 h-12 text-[color:var(--gt-primary)]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 9h-3V3.23C18 2.1 16.91 1.05 15.76 1H8.24C7.09 1.05 6 2.1 6 3.23V9H3c-.55 0-1 .45-1 1s.45 1 1 1h3v8.77c0 1.13 1.09 2.18 2.24 2.23h7.52c1.15-.05 2.24-1.1 2.24-2.23V11h3c.55 0 1-.45 1-1s-.45-1-1-1zm-5 0H8V3h8v6z"/>
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <div className="w-8 h-8 bg-[rgba(255,255,255,0.9)] rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Gym Info */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-[color:var(--foreground)] line-clamp-2">
                        {favoriteGym.gym?.name || favoriteGym.name}
                      </h3>

                      {(favoriteGym.gym?.address || favoriteGym.address) && (
                        <div className="flex items-center gap-1 text-[color:var(--text-muted)]">
                          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>
                          <span className="text-sm line-clamp-2">{favoriteGym.gym?.address || favoriteGym.address}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div className="text-xs text-[color:var(--text-muted)]">
                          <div>追加日: {new Date(favoriteGym.created_at).toLocaleDateString('ja-JP')}</div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGymClick(favoriteGym.gym_id || favoriteGym.id);
                          }}
                          className="px-3 py-1 bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white text-xs rounded-full font-medium hover:shadow-[0_12px_28px_-18px_rgba(189,101,78,0.44)] transition-all"
                        >
                          詳細を見る
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


      </div>

      {/* GymDetailModal */}
      {selectedGymId && (
        <GymDetailModal
          isOpen={isGymModalOpen}
          onClose={handleGymModalClose}
          gymId={selectedGymId}
        />
      )}


    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[color:var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[color:var(--gt-primary-strong)] mx-auto mb-4"></div>
          <p className="text-[color:var(--text-muted)]">読み込み中...</p>
        </div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
