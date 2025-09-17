'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfileStats, getWeeklyStats, getUserPosts, getUserAchievements, getUserPersonalRecords, getFavoriteGyms } from '@/lib/supabase/profile';
import { getSupabaseClient } from '@/lib/supabase/client';
import PostCard from '@/components/PostCard';
import type { Post } from '@/lib/supabase/posts';
import type { UserProfileStats, WeeklyStats, GymPost, FavoriteGym } from '@/lib/types/profile';
import type { Achievement, PersonalRecord } from '@/lib/types/workout';

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

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('gym-activity');
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
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCheckingFollow, setIsCheckingFollow] = useState(false);

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

  // Get user ID from params
  const userId = params?.id as string;
  const currentUserId = user?.id;
  const isOwnProfile = userId === currentUserId;

  // Check if following this user
  useEffect(() => {
    if (!userId || !currentUserId || isOwnProfile) return;

    const checkFollowStatus = async () => {
      setIsCheckingFollow(true);
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', currentUserId)
          .eq('following_id', userId)
          .maybeSingle();

        if (data) {
          setIsFollowing(true);
        } else {
          setIsFollowing(false);
        }
      } catch (error) {
        console.error('Error checking follow status:', error);
        setIsFollowing(false);
      } finally {
        setIsCheckingFollow(false);
      }
    };

    checkFollowStatus();
  }, [userId, currentUserId, isOwnProfile]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!userId || !currentUserId || isOwnProfile) return;

    // ログインしていない場合はアラート
    if (!user) {
      alert('フォローするにはログインが必要です');
      return;
    }

    setIsCheckingFollow(true);
    try {
      const supabase = getSupabaseClient();

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', userId);

        if (error) throw error;
        setIsFollowing(false);

        // フォロワー数を減らす
        if (profileData) {
          setProfileData({
            ...profileData,
            followers_count: Math.max(0, (profileData.followers_count || 0) - 1)
          });
        }
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: currentUserId,
            following_id: userId
          });

        if (error) throw error;
        setIsFollowing(true);

        // フォロワー数を増やす
        if (profileData) {
          setProfileData({
            ...profileData,
            followers_count: (profileData.followers_count || 0) + 1
          });
        }
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      alert('フォロー操作に失敗しました');
      // エラーの場合は状態を元に戻す
      const checkFollowStatus = async () => {
        try {
          const supabase = getSupabaseClient();
          const { data } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', currentUserId)
            .eq('following_id', userId)
            .maybeSingle();

          setIsFollowing(!!data);
        } catch (e) {
          console.error('Error rechecking follow status:', e);
        }
      };
      checkFollowStatus();
    } finally {
      setIsCheckingFollow(false);
    }
  };

  useEffect(() => {
    let isActive = true;
    let retryCount = 0;
    const maxRetries = 3;

    async function loadProfileData() {
      if (!isActive || !userId) return;

      try {
        console.log('🔄 ユーザーデータ取得中...', userId);
        setIsLoading(true);

        // Supabaseから実際のデータを取得
        const [profileStats, weeklyData, posts, achievements, personalRecords, favoriteGyms] = await Promise.all([
          getUserProfileStats(userId).catch((error) => {
            console.error('プロフィール取得エラー:', error);
            return null;
          }),
          getWeeklyStats(userId).catch(() => null),
          getUserPosts(userId, 1, POSTS_PER_PAGE).catch(() => []),
          getUserAchievements(userId).catch(() => []),
          getUserPersonalRecords(userId).catch(() => []),
          getFavoriteGyms(userId).catch(() => [])
        ]);

        if (!isActive) return;

        console.log('📊 取得したプロフィール:', profileStats);

        // データベースから取得したデータを設定
        setProfileData(profileStats);
        setWeeklyStats(weeklyData);
        setUserPosts(posts || []);
        setUserAchievements(achievements || []);
        setUserPersonalRecords(personalRecords || []);
        setUserFavoriteGyms(favoriteGyms || []);

        // 投稿のページネーション設定
        setHasMorePosts((posts || []).length === POSTS_PER_PAGE);
        setCurrentPostPage(1);

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
    if (!hasMorePosts || isLoadingMorePosts || !userId) return;

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
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
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
                <p className="text-xs text-slate-600">ユーザープロフィール</p>
              </div>
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
                    router.push('/profile')
                    setMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <span className="text-sm font-medium text-slate-700">マイプロフィール</span>
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
                {isOwnProfile ? (
                  <button
                    onClick={() => router.push('/profile/edit')}
                    className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-600 hover:bg-blue-200 text-xs sm:text-sm rounded-full font-medium transition-colors cursor-pointer"
                  >
                    プロフィール編集
                  </button>
                ) : (
                  <button
                    onClick={handleFollowToggle}
                    disabled={isCheckingFollow}
                    className={`px-3 sm:px-4 py-1 text-xs sm:text-sm rounded-full font-medium transition-colors cursor-pointer ${
                      isFollowing
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {isCheckingFollow ? '...' : isFollowing ? 'フォロー中' : 'フォロー'}
                  </button>
                )}
              </div>
              <div className="flex flex-row items-center justify-center sm:justify-start gap-3 text-slate-700 mb-1 sm:mb-3">
                <p className="text-xs sm:text-base text-slate-700 font-medium">
                  {isLoading ? '...' : (profileData?.username ? `@${profileData.username}` : '@user')}
                </p>
                <span className="text-slate-400">•</span>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                  </svg>
                  <span className="text-xs sm:text-sm">
                    {isLoading ? '...' : (profileData?.joined_at ? new Date(profileData.joined_at).toLocaleDateString('ja-JP', {year: 'numeric', month: 'long'}) : '不明')}
                  </span>
                </div>
                <span className="text-slate-400">•</span>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span className="text-xs sm:text-sm">
                    {isLoading ? '...' : (profileData?.location || '未設定')}
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-900 mb-2 sm:mb-4 px-4 sm:px-0">
                {isLoading ? '読み込み中...' : (profileData?.bio || '')}
              </p>

              {/* Stats */}
              <div className="flex gap-4 sm:gap-8 w-full sm:w-auto justify-center sm:justify-start">
                <div className="flex flex-col items-center min-w-[60px]">
                  <span className="text-xl sm:text-2xl font-bold text-slate-900">
                    {isLoading ? '...' : (profileData?.workout_count || 0)}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">ジム通い</span>
                </div>
                <div className="flex flex-col items-center min-w-[60px]">
                  <span className="text-xl sm:text-2xl font-bold text-slate-900">
                    {isLoading ? '...' : (profileData?.mutual_follows_count || 0)}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">相互</span>
                </div>
                <div className="flex flex-col items-center min-w-[60px]">
                  <span className="text-xl sm:text-2xl font-bold text-slate-900">
                    {isLoading ? '...' : (profileData?.following_count || 0)}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">フォロー</span>
                </div>
                <div className="flex flex-col items-center min-w-[60px]">
                  <span className="text-xl sm:text-2xl font-bold text-slate-900">
                    {isLoading ? '...' : (profileData?.followers_count || 0)}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">フォロワー</span>
                </div>
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
            {isLoading ? (
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="animate-pulse">
                  <div className="flex gap-3 mb-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                </div>
              </div>
            ) : userPosts.length === 0 ? (
              <div className="bg-white rounded-lg p-8 shadow-sm text-center">
                <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                <p className="text-slate-600 mb-2">投稿がまだありません</p>
              </div>
            ) : (
              userPosts.map((post) => {
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
                    currentUserId={currentUserId}
                    showActions={true}
                    onToggleTraining={() => toggleTrainingDetails(post.id)}
                    expandedTraining={expandedTraining}
                  />
                );
              })
            )}

            {/* Load More Posts Button */}
            {hasMorePosts && userPosts.length > 0 && (
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
                    <p className="text-slate-600">パーソナルレコードがまだありません</p>
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
                    <p className="text-slate-600">達成記録がまだありません</p>
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
                <p className="text-slate-600">お気に入りジムがまだありません</p>
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