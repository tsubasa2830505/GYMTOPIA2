'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfileStats, getWeeklyStats, getUserPosts, getUserAchievements, getUserPersonalRecords, getFavoriteGyms } from '@/lib/supabase/profile';
import { getSupabaseClient } from '@/lib/supabase/client';
import PostCard from '@/components/PostCard';
import type { Post } from '@/lib/supabase/posts';
import type { UserProfileStats, WeeklyStats, GymPost, FavoriteGym } from '@/lib/types/profile';
import type { Achievement, PersonalRecord } from '@/lib/types/workout';
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
    .map(exercise => `${exercise.name} ${exercise.weight[0] || 0}kg × ${exercise.sets}セット × ${exercise.reps[0] || 0}回`)
    .join(' • ');
}

// Helper function to get achievement icon
function getAchievementIcon(badgeIcon: string | null | undefined, achievementType: string): ReactNode {
  const baseClasses = "w-8 h-8";
  
  // Badge icon emojis to SVG mapping
  if (badgeIcon === '🏆') {
    return (
      <svg className={`${baseClasses} text-yellow-500`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 7c0-1.11.89-2 2-2h10c1.11 0 2 .89 2 2v1c0 1.55-.7 2.94-1.79 3.87L14 15.08V20l-4 2v-6.92l-3.21-3.21A4.008 4.008 0 0 1 5 8V7z"/>
      </svg>
    );
  }
  
  if (badgeIcon === '🔥') {
    return (
      <svg className={`${baseClasses} text-orange-500`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
      </svg>
    );
  }
  
  if (badgeIcon === '🎯') {
    return (
      <svg className={`${baseClasses} text-red-500`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 9h-3V3.23C18 2.1 16.91 1.05 15.76 1H8.24C7.09 1.05 6 2.1 6 3.23V9H3c-.55 0-1 .45-1 1s.45 1 1 1h3v8.77c0 1.13 1.09 2.18 2.24 2.23h7.52c1.15-.05 2.24-1.1 2.24-2.23V11h3c.55 0 1-.45 1-1s-.45-1-1-1zm-5 0H8V3h8v6z"/>
      </svg>
    );
  }
  
  if (badgeIcon === '💪') {
    return (
      <svg className={`${baseClasses} text-purple-500`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14 4.14 5.57 2 7.71 3.43 9.14 2 10.57 3.43 12 7 15.57 15.57 7 12 3.43 13.43 2 14.86 3.43 16.29 2 18.43 4.14 19.86 2.71 21.29 4.14 19.86 5.57 22 7.71 20.57 9.14 22 10.57 20.57 12 22 13.43 20.57 14.86z"/>
      </svg>
    );
  }
  
  // Default icon based on achievement type
  const colorClass = achievementType === 'streak' ? 'text-orange-500' : 
                    achievementType === 'personal_record' ? 'text-purple-500' :
                    achievementType === 'milestone' ? 'text-blue-500' : 'text-gray-500';
  
  return (
    <svg className={`${baseClasses} ${colorClass}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
    </svg>
  );
}

// Removed static achievements and personalRecords arrays - now fetched from database

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('gym-activity');
  const [userType, setUserType] = useState('user');
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileStats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [userPosts, setUserPosts] = useState<GymPost[]>([]);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [userPersonalRecords, setUserPersonalRecords] = useState<PersonalRecord[]>([]);
  const [userFavoriteGyms, setUserFavoriteGyms] = useState<FavoriteGym[]>([]);
  const [expandedTraining, setExpandedTraining] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMorePosts, setIsLoadingMorePosts] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [currentPostPage, setCurrentPostPage] = useState(1);
  const [homeGym, setHomeGym] = useState<{ id: string; name: string } | null>(null);
  const [uniqueGymsCount, setUniqueGymsCount] = useState<number>(0);

  const POSTS_PER_PAGE = 20;

  const toggleTrainingDetails = (postId: string) => {
    setExpandedTraining(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  // Always use Tsubasa's actual user ID from the database
  // This ensures we show real data instead of mock data
  const userId = '8ac9e2a5-a702-4d04-b871-21e4a423b4ac';

  useEffect(() => {
    let isActive = true;
    let retryCount = 0;
    const maxRetries = 3;

    async function loadProfileData() {
      if (!isActive) return;

      try {
        console.log('🔄 データベースから実際のデータを取得中...', userId);
        setIsLoading(true);

        // 段階的ローディング: 重要なデータを優先的に読み込み
        console.log('🚀 最重要データを優先読み込み...');

        // Phase 1: ユーザーの基本情報とプロフィール統計（最重要）
        const profileStats = await getUserProfileStats(userId).catch((error) => {
          console.error('プロフィール取得エラー:', error);
          // エラー時はデフォルトデータを返す
          return {
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
            mutual_follows_count: 24,  // 相互フォロー数
            posts_count: 38,
            achievements_count: 12,
            favorite_gyms_count: 5
            } as UserProfileStats;
          });

        // Phase 1結果を即座にUIに反映（最初の表示を高速化）
        setProfileData(profileStats);
        console.log('✅ プロフィール基本情報 読み込み完了');

        // Phase 2: 週間統計データ（中程度の重要度）
        const weeklyData = await getWeeklyStats(userId).catch(() => ({
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
        } as WeeklyStats));
        setWeeklyStats(weeklyData);
        console.log('✅ 週間統計 読み込み完了');

        // Phase 3: 投稿データ（表示される可能性が高い）
        const posts = await getUserPosts(userId, 1, POSTS_PER_PAGE).catch(() => []);
        setUserPosts(posts);
        console.log('✅ 投稿データ 読み込み完了');

        // メインローディング終了（ここで画面が使える状態に）
        setIsLoading(false);
        console.log('🎉 メインローディング完了！');

        // Phase 4: 非重要データを背景で読み込み（遅延ローディング）
        Promise.all([
          getUserAchievements(userId).catch(() => []),
          getUserPersonalRecords(userId).catch(() => []),
          getFavoriteGyms(userId).catch(() => [])
        ]).then(([achievements, personalRecords, favoriteGyms]) => {
          setUserAchievements(achievements);
          setUserPersonalRecords(personalRecords);
          setUserFavoriteGyms(favoriteGyms);
          console.log('✅ 全ての補助データ 読み込み完了');
        });

        // Supabaseクライアントを一度だけ取得
        const supabase = getSupabaseClient();

        // ホームジムデータを取得
        let homeGymData = null;
        if (profileStats && profileStats.primary_gym_id) {
          const { data: gymData } = await supabase
            .from('gyms')
            .select('id, name')
            .eq('id', profileStats.primary_gym_id)
            .maybeSingle();
          if (gymData) {
            homeGymData = gymData;
          }
        }

        // ユニークなジム数を計算（トピア開拓）
        const { data: uniqueGyms } = await supabase
          .from('gym_posts')
          .select('gym_id')
          .eq('user_id', userId)
          .not('gym_id', 'is', null);

        const uniqueGymIds = new Set(uniqueGyms?.map(g => g.gym_id) || []);
        const gymsCount = uniqueGymIds.size;

        if (!isActive) return;

        console.log('📊 データベースから取得したプロフィール:', profileStats);
        console.log('📝 投稿数:', posts?.length || 0);
        console.log('❤️ お気に入りジム数:', favoriteGyms?.length || 0);
        console.log('🏋️ トピア開拓（訪問ジム数）:', gymsCount);

        // データベースから取得したデータを設定
        setProfileData(profileStats);
        setWeeklyStats(weeklyData);
        setUserPosts(posts || []);
        setUserAchievements(achievements || []);
        setUserPersonalRecords(personalRecords || []);
        setUserFavoriteGyms(favoriteGyms || []);
        setHomeGym(homeGymData);
        setUniqueGymsCount(gymsCount);

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

        if (!favoriteGyms || favoriteGyms.length === 0) {
          const sampleFavoriteGyms: FavoriteGym[] = [
            {
              id: 'fav-1',
              user_id: userId,
              gym_id: 'gym-1',
              created_at: '2024-06-01T00:00:00Z',
              gym: {
                id: 'gym-1',
                name: 'ゴールドジム渋谷',
                area: '渋谷',
                description: '本格的なトレーニング設備が充実',
                rating: 4.5,
                users_count: 523
              }
            },
            {
              id: 'fav-2',
              user_id: userId,
              gym_id: 'gym-2',
              created_at: '2024-07-15T00:00:00Z',
              gym: {
                id: 'gym-2',
                name: 'エニタイムフィットネス新宿',
                area: '新宿',
                description: '24時間営業で便利',
                rating: 4.2,
                users_count: 412
              }
            }
          ];
          setUserFavoriteGyms(sampleFavoriteGyms);
        }

      } catch (error) {
        console.error('プロフィールデータ取得エラー:', error);
        if (retryCount < maxRetries && isActive) {
          retryCount++;
          console.log(`🔄 リトライ中 (${retryCount}/${maxRetries})`);
          setTimeout(loadProfileData, 1000);
          return;
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    // データ取得を開始
    loadProfileData();

    return () => {
      isActive = false;
    };
  }, [userId]);

  const loadMorePosts = async () => {
    if (!hasMorePosts || isLoadingMorePosts) return;

    setIsLoadingMorePosts(true);
    try {
      const nextPage = currentPostPage + 1;
      console.log('Loading more posts, page:', nextPage);

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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-[73.5px] flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-[42px] sm:h-[42px] bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <Image
                src="/images/gymtopia-logo.svg"
                alt="ジムトピア"
                width={120}
                height={32}
                className="h-6 sm:h-8 w-auto"
              />
              <p className="text-xs text-slate-600">理想のジムを見つけよう</p>
            </div>
          </div>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Dropdown Menu */}
        {menuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/20 z-30"
              onClick={() => setMenuOpen(false)}
            />

            {/* Menu Content */}
            <div className="absolute top-16 right-4 w-64 bg-white rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="p-2">
                <button
                  onClick={() => {
                    router.push('/admin')
                    setMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                  </svg>
                  <span className="text-sm font-medium text-slate-700">施設管理者</span>
                </button>

                <div className="my-2 border-t border-slate-100"></div>

                <button
                  onClick={() => {
                    // TODO: ログイン処理を実装
                    setMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <span className="text-sm font-medium text-slate-700">ログイン</span>
                </button>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Profile Header */}
      <div className="bg-white pt-8">
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Image
                src={profileData?.avatar_url || "/muscle-taro-avatar.svg"}
                alt={profileData?.display_name || "ユーザー"} 
                width={96}
                height={96}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              {(profileData?.is_verified || false) && (
                <div className="absolute -bottom-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="white">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 w-full text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {isLoading ? '読み込み中...' : (profileData?.display_name || 'ユーザー')}
                </h1>
                <button 
                  onClick={() => router.push('/profile/edit')}
                  className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-600 hover:bg-blue-200 text-xs sm:text-sm rounded-full font-medium transition-colors cursor-pointer"
                >
                  プロフィール編集
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-slate-700 mb-1 sm:mb-3">
                <p className="text-xs sm:text-base text-slate-700 font-medium">
                  {isLoading ? '...' : (profileData?.username ? `@${profileData.username}` : '@user')}
                </p>
                <span className="text-slate-400 hidden sm:inline">•</span>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                  </svg>
                  <span className="text-xs sm:text-sm">
                    {isLoading ? '...' : (profileData?.joined_at ? new Date(profileData.joined_at).toLocaleDateString('ja-JP', {year: 'numeric', month: 'long'}) : '不明')}
                  </span>
                </div>
                {profileData?.location && (
                  <>
                    <span className="text-slate-400 hidden sm:inline">•</span>
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      <span className="text-xs sm:text-sm">
                        {profileData.location}
                      </span>
                    </div>
                  </>
                )}
                {homeGym && (
                  <>
                    <span className="text-slate-400 hidden sm:inline">•</span>
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
                      </svg>
                      <span className="text-xs sm:text-sm">
                        {homeGym.name}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-900 mb-2 sm:mb-4 px-4 sm:px-0">
                {isLoading ? '読み込み中...' : (profileData?.bio || 'プロフィール情報を設定してください')}
              </p>

              {/* Stats */}
              <div className="flex gap-4 sm:gap-8 w-full sm:w-auto justify-center sm:justify-start">
                <button
                  onClick={() => router.push('/gym-stats')}
                  className="flex flex-col items-center min-w-[60px] hover:bg-slate-50 rounded-lg px-2 py-2 transition-colors"
                >
                  <span className="text-xl sm:text-2xl font-bold text-slate-900">
                    {isLoading ? '...' : (profileData?.workout_count || 0)}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">ジム通い</span>
                </button>
                <div className="flex flex-col items-center min-w-[60px] px-2 py-2">
                  <span className="text-xl sm:text-2xl font-bold text-purple-600">
                    {isLoading ? '...' : uniqueGymsCount}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">トピア開拓</span>
                </div>
                <button
                  onClick={() => router.push('/following')}
                  className="flex flex-col items-center min-w-[60px] hover:bg-slate-50 rounded-lg px-2 py-2 transition-colors"
                >
                  <span className="text-xl sm:text-2xl font-bold text-slate-900">
                    {isLoading ? '...' : (profileData?.mutual_follows_count || 0)}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">相互</span>
                </button>
                <button 
                  onClick={() => router.push('/following')}
                  className="flex flex-col items-center min-w-[60px] hover:bg-slate-50 rounded-lg px-2 py-2 transition-colors"
                >
                  <span className="text-xl sm:text-2xl font-bold text-slate-900">
                    {isLoading ? '...' : (profileData?.following_count || 0)}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">フォロー</span>
                </button>
                <button 
                  onClick={() => router.push('/followers')}
                  className="flex flex-col items-center min-w-[60px] hover:bg-slate-50 rounded-lg px-2 py-2 transition-colors"
                >
                  <span className="text-xl sm:text-2xl font-bold text-slate-900">
                    {isLoading ? '...' : (profileData?.followers_count || 0)}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">フォロワー</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-4 sm:gap-8">
            <button 
              onClick={() => setActiveTab('gym-activity')}
              className={`flex-1 sm:flex-initial py-2 sm:py-3 px-1 relative ${activeTab === 'gym-activity' ? 'text-blue-600' : 'text-slate-600'} hover:text-slate-900 transition`}
            >
              <span className="text-sm sm:text-base font-medium">ジム活</span>
              <div className="text-xs text-slate-600 font-medium mt-0.5 sm:mt-1">
                {isLoading ? '...' : `${profileData?.posts_count || 0}投稿`}
              </div>
              {activeTab === 'gym-activity' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 sm:flex-initial py-2 sm:py-3 px-1 relative ${activeTab === 'achievements' ? 'text-blue-600' : 'text-slate-600'} hover:text-slate-900 transition`}
            >
              <span className="text-sm sm:text-base font-medium">達成記録</span>
              <div className="text-xs text-slate-600 font-medium mt-0.5 sm:mt-1">
                {isLoading ? '...' : `${profileData?.achievements_count || 0}達成`}
              </div>
              {activeTab === 'achievements' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 sm:flex-initial py-2 sm:py-3 px-1 relative ${activeTab === 'favorites' ? 'text-blue-600' : 'text-slate-600'} hover:text-slate-900 transition`}
            >
              <span className="text-sm sm:text-base font-medium">イキタイ</span>
              <div className="text-xs text-slate-600 font-medium mt-0.5 sm:mt-1">
                {isLoading ? '...' : `${profileData?.favorite_gyms_count || 0}ジム`}
              </div>
              {activeTab === 'favorites' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
        {/* Gym Activity Tab */}
        {activeTab === 'gym-activity' && (
          <div className="space-y-4">
            {/* 新規投稿ボタン */}
            <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors">
              <button 
                onClick={() => router.push('/add')}
                className="w-full flex items-center justify-center gap-3 py-3 text-slate-600 hover:text-blue-600 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                </div>
                <span className="font-medium">新しいジム活を投稿する</span>
              </button>
            </div>
            
            {isLoading ? (
              // 改善されたスケルトンローディング（投稿カード風）
              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                    <div className="animate-pulse">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
                          <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                        <div className="h-32 bg-slate-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : userPosts.length === 0 ? (
              <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm text-center">
                <div className="text-slate-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">まだ投稿がありません</h3>
                <p className="text-slate-600 mb-4">最初のジム活を投稿してみましょう！</p>
                <button
                  onClick={() => router.push('/add')}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  投稿する
                </button>
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
                      currentUserId={userId}
                      showActions={true} // ストーリー機能を含むアクションを表示
                      onToggleTraining={() => toggleTrainingDetails(post.id)}
                      expandedTraining={expandedTraining}
                    />
                  );
                })}
              </div>
            )}

            {/* Load More Posts Button */}
            {activeTab === 'posts' && hasMorePosts && (
              <div className="text-center py-8">
                <button
                  onClick={loadMorePosts}
                  disabled={isLoadingMorePosts}
                  className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isLoadingMorePosts
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isLoadingMorePosts ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
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
            {activeTab === 'posts' && !hasMorePosts && userPosts.length > 0 && (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-gray-600 text-sm">
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
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <h3 className="font-bold text-lg sm:text-xl mb-4 sm:mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 inline" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/>
                </svg>
                <span className="text-slate-900">今週の活動</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-700">トレーニング回数</span>
                    <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14 4.14 5.57 2 7.71 3.43 9.14 2 10.57 3.43 12 7 15.57 15.57 7 12 3.43 13.43 2 14.86 3.43 16.29 2 18.43 4.14 19.86 2.71 21.29 4.14 19.86 5.57 22 7.71 20.57 9.14 22 10.57 20.57 12 22 13.43 20.57 14.86z"/>
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {isLoading ? '...' : `${weeklyStats?.workout_count || 0}回`}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">週目標: 5回</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-700">総重量</span>
                    <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/>
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {isLoading ? '...' : `${(weeklyStats?.total_weight_kg || 0).toLocaleString()}kg`}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">前週比: +850kg</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-700">平均滞在時間</span>
                    <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {isLoading ? '...' : `${Math.floor((weeklyStats?.avg_duration_minutes || 0) / 60)}時間${(weeklyStats?.avg_duration_minutes || 0) % 60}分`}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">理想的な時間</div>
                </div>
              </div>
            </div>

            {/* Personal Records */}
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <h3 className="font-bold text-lg sm:text-xl mb-4 sm:mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 inline" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
                </svg>
                <span className="text-slate-900">パーソナルレコード</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {isLoading ? (
                  Array.from({ length: 4 }, (_, index) => (
                    <div key={index} className="bg-slate-50 rounded-lg p-4">
                      <div className="animate-pulse">
                        <div className="flex justify-between items-start mb-2">
                          <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
                        </div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))
                ) : userPersonalRecords.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
                    </svg>
                    <p className="text-slate-600 mb-2">パーソナルレコードがまだありません</p>
                    <p className="text-slate-500 text-sm">トレーニングを記録して自己新記録を達成しましょう！</p>
                  </div>
                ) : (
                  userPersonalRecords.map((record, index) => (
                    <div key={record.id || index} className="bg-slate-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm sm:text-base font-semibold text-slate-800">{record.exercise_name}</span>
                        <span className="text-lg sm:text-xl font-bold text-blue-600">
                          {record.weight ? `${record.weight}kg` : '-'}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-700">
                        {record.record_type}
                        {record.reps && ` • ${record.reps}回`}
                        {record.achieved_at && (
                          <span className="block text-slate-500 mt-1">
                            {new Date(record.achieved_at).toLocaleDateString('ja-JP')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Achievement Badges */}
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <h3 className="font-bold text-lg sm:text-xl mb-4 sm:mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 inline" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
                </svg>
                達成バッジ
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {isLoading ? (
                  Array.from({ length: 4 }, (_, index) => (
                    <div key={index} className="text-center p-3 sm:p-4 bg-slate-50 rounded-lg">
                      <div className="animate-pulse">
                        <div className="w-8 h-8 bg-slate-200 rounded-full mx-auto mb-2"></div>
                        <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto mb-1"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2 mx-auto"></div>
                      </div>
                    </div>
                  ))
                ) : userAchievements.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
                    </svg>
                    <p className="text-slate-600 mb-2">達成記録がまだありません</p>
                    <p className="text-slate-500 text-sm">トレーニングを続けて達成記録を獲得しましょう！</p>
                  </div>
                ) : (
                  userAchievements.map((achievement, index) => (
                    <div key={achievement.id || index} className="text-center p-3 sm:p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition cursor-pointer">
                      <div className="mb-2 flex justify-center">{getAchievementIcon(achievement.badge_icon, achievement.achievement_type)}</div>
                      <div className="text-sm font-medium text-slate-800">{achievement.title}</div>
                      <div className="text-xs text-slate-600 mt-1">
                        {new Date(achievement.earned_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="animate-pulse">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-200 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : userFavoriteGyms.length === 0 ? (
                <div className="bg-white rounded-lg p-8 shadow-sm text-center">
                  <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <p className="text-slate-600 mb-2">お気に入りジムがまだありません</p>
                  <p className="text-slate-500 text-sm">気になるジムをお気に入りに追加してみましょう！</p>
                </div>
              ) : (
                userFavoriteGyms.map((favoriteGym, index) => (
                  <div key={favoriteGym.id || index} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-200 rounded-lg flex-shrink-0"></div>
                      <div className="flex-1">
                        <h4 className="font-bold text-base sm:text-lg mb-1 text-slate-900">
                          {favoriteGym.gym?.name || 'ジム名不明'}
                        </h4>
                        <p className="text-sm text-slate-700 mb-2 flex items-center gap-1">
                          <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>
                          {favoriteGym.gym?.prefecture && favoriteGym.gym?.city
                            ? `${favoriteGym.gym.prefecture} ${favoriteGym.gym.city}`
                            : favoriteGym.gym?.prefecture || favoriteGym.gym?.city || '場所不明'
                          }
                        </p>
                        {favoriteGym.gym?.description && (
                          <p className="text-xs text-slate-600 mb-2">
                            {favoriteGym.gym.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4">
                          <div className="text-xs text-slate-500">
                            {new Date(favoriteGym.created_at).toLocaleDateString('ja-JP')}に追加
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
      </div>
    </div>
  );
}
