'use client';

import { useState, useEffect, useRef, useCallback, useMemo, type ReactNode } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { isFollowing, followUser, unfollowUser } from '@/lib/supabase/follows';
import Header from '@/components/Header';
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

  if (badgeIcon === '💪') {
    return (
      <svg className={`${baseClasses} text-[color:var(--gt-primary)]`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    );
  }

  // Default based on achievement type
  switch (achievementType) {
    case 'first_workout':
      return (
        <svg className={`${baseClasses} text-[color:var(--gt-secondary)]`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      );
    case 'streak':
      return (
        <svg className={`${baseClasses} text-[color:var(--gt-tertiary)]`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/>
        </svg>
      );
    default:
      return (
        <svg className={`${baseClasses} text-[color:var(--text-muted)]`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      );
  }
}

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  is_active: boolean;
  location?: string;
}

function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const { user: currentUser } = useAuth();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileStats, setProfileStats] = useState<UserProfileStats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [userPosts, setUserPosts] = useState<GymPost[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [favoriteGyms, setFavoriteGyms] = useState<FavoriteGym[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('gym-activity');
  const [expandedTraining, setExpandedTraining] = useState<Set<string>>(new Set());

  // フォロー関連のstate
  const [isCurrentlyFollowing, setIsCurrentlyFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followCheckLoading, setFollowCheckLoading] = useState(true);

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

  // フォロー状態をチェック
  const checkFollowStatus = useCallback(async () => {
    if (!currentUser?.id || !userId || currentUser.id === userId) {
      setFollowCheckLoading(false);
      return;
    }

    try {
      const { isFollowing: following } = await isFollowing(currentUser.id, userId);
      setIsCurrentlyFollowing(following);
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setFollowCheckLoading(false);
    }
  }, [currentUser?.id, userId]);

  // フォロー処理
  const handleFollow = useCallback(async () => {
    if (!currentUser?.id || !userId || followLoading) return;

    setFollowLoading(true);
    try {
      const { error } = await followUser(currentUser.id, userId);
      if (!error) {
        setIsCurrentlyFollowing(true);
      } else {
        console.error('Error following user:', error);
        alert('フォローに失敗しました');
      }
    } catch (error) {
      console.error('Error following user:', error);
      alert('フォローに失敗しました');
    } finally {
      setFollowLoading(false);
    }
  }, [currentUser?.id, userId, followLoading]);

  // アンフォロー処理
  const handleUnfollow = useCallback(async () => {
    if (!currentUser?.id || !userId || followLoading) return;

    setFollowLoading(true);
    try {
      const { error } = await unfollowUser(currentUser.id, userId);
      if (!error) {
        setIsCurrentlyFollowing(false);
      } else {
        console.error('Error unfollowing user:', error);
        alert('アンフォローに失敗しました');
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
      alert('アンフォローに失敗しました');
    } finally {
      setFollowLoading(false);
    }
  }, [currentUser?.id, userId, followLoading]);

  useEffect(() => {
    if (!userId) return;

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching user profile for ID:', userId);
        const supabase = getSupabaseClient();

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          if (profileError.code === 'PGRST116') {
            setError('ユーザーが見つかりません');
          } else {
            setError('プロフィールの取得に失敗しました');
          }
          return;
        }

        console.log('Profile data fetched successfully:', profileData);
        setUserProfile(profileData);

        // Fetch additional data in parallel
        const [statsResult, postsResult, achievementsResult, recordsResult, gymsResult] = await Promise.all([
          // Profile stats
          supabase
            .from('gym_posts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId),

          // User posts
          supabase
            .from('gym_posts')
            .select(`
              id,
              user_id,
              content,
              images,
              workout_type,
              muscle_groups_trained,
              duration_minutes,
              crowd_status,
              like_count,
              comment_count,
              visibility,
              created_at,
              updated_at,
              is_public,
              training_details,
              gym_id,
              gyms:gym_id (
                id,
                name,
                address,
                images
              )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20),

          // Achievements
          supabase
            .from('achievements')
            .select('*')
            .eq('user_id', userId)
            .order('earned_at', { ascending: false }),

          // Personal records
          supabase
            .from('personal_records')
            .select('*')
            .eq('user_id', userId)
            .order('achieved_at', { ascending: false }),

          // Favorite gyms
          supabase
            .from('favorite_gyms')
            .select(`
              *,
              gyms:gym_id (
                id,
                name,
                address,
                images
              )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
        ]);

        // Set profile stats
        setProfileStats({
          total_posts: statsResult.count || 0,
          total_workouts: 0, // This would need a separate query
          total_followers: 0, // This would need a separate query
          total_following: 0 // This would need a separate query
        });

        // Set posts - transform data to match expected format
        if (postsResult.data && profileData) {
          console.log('Transforming posts data:', postsResult.data);
          try {
            const transformedPosts = postsResult.data.map(post => {
              // Safe JSON parsing for training_details
              let trainingDetails = null;
              if (post.training_details) {
                try {
                  trainingDetails = typeof post.training_details === 'string'
                    ? JSON.parse(post.training_details)
                    : post.training_details;
                } catch (error) {
                  console.warn('Failed to parse training_details:', error);
                  trainingDetails = null;
                }
              }

              return {
                id: post.id,
                user_id: post.user_id,
                content: post.content || '',
                images: Array.isArray(post.images) ? post.images : [],
                post_type: post.workout_type || 'workout',
                workout_session_id: null,
                gym_id: post.gym_id,
                training_details: trainingDetails,
                visibility: post.visibility || 'public',
                likes_count: post.like_count || 0,
                comments_count: post.comment_count || 0,
                created_at: post.created_at,
                updated_at: post.updated_at,
                user: {
                  id: profileData.id,
                  display_name: profileData.display_name,
                  username: profileData.username,
                  avatar_url: profileData.avatar_url,
                  bio: profileData.bio,
                  joined_at: profileData.created_at,
                  is_verified: false,
                  workout_streak: 0,
                  total_workouts: 0,
                  created_at: profileData.created_at,
                  updated_at: profileData.created_at
                },
                gym: post.gyms ? {
                  id: post.gyms.id,
                  name: post.gyms.name,
                  location: post.gyms.address,
                  image_url: Array.isArray(post.gyms.images) && post.gyms.images.length > 0 ? post.gyms.images[0] : null
                } : null,
                is_liked: false,
                achievement_data: null,
                achievement_type: null
              };
            });
            setUserPosts(transformedPosts);
            console.log('Posts transformation successful:', transformedPosts.length);
          } catch (error) {
            console.error('Error transforming posts:', error);
            setUserPosts([]);
          }
        }

        // Set achievements
        if (achievementsResult.data) {
          setAchievements(achievementsResult.data);
        }

        // Set personal records
        if (recordsResult.data) {
          setPersonalRecords(recordsResult.data);
        }

        // Set favorite gyms - transform data to match expected format
        if (gymsResult.data) {
          console.log('Transforming favorite gyms data:', gymsResult.data);
          try {
            const transformedGyms = gymsResult.data.map(favorite => ({
              id: favorite.gym_id || favorite.id,
              name: favorite.gyms?.name || '不明なジム',
              address: favorite.gyms?.address || '',
              images: Array.isArray(favorite.gyms?.images) ? favorite.gyms.images : [],
              created_at: favorite.created_at
            }));
            setFavoriteGyms(transformedGyms);
            console.log('Favorite gyms transformation successful:', transformedGyms.length);
          } catch (error) {
            console.error('Error transforming favorite gyms:', error);
            setFavoriteGyms([]);
          }
        }

      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('プロフィールの取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  // フォロー状態をチェック
  useEffect(() => {
    checkFollowStatus();
  }, [checkFollowStatus]);

  if (loading) {
    return (
      <div className="min-h-screen pb-20 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(200deg,rgba(231,103,76,0.08),transparent_84%),radial-gradient(circle_at_18%_22%,rgba(240,142,111,0.14),transparent_68%),radial-gradient(circle_at_86%_18%,rgba(245,177,143,0.12),transparent_76%)]" />
          <div className="absolute -top-28 right-16 h-88 w-88 rounded-full bg-[radial-gradient(circle_at_center,rgba(231,103,76,0.34),transparent_72%)] blur-[160px] opacity-72" />
          <div className="absolute bottom-[-8%] left-[-4%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(245,177,143,0.2),transparent_80%)] blur-[160px] opacity-58" />
        </div>
        <Header subtitle="ユーザープロフィール" showMenu={true} />
        <div className="max-w-6xl mx-auto px-4 py-8 pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[color:var(--gt-primary-strong)] mx-auto mb-4"></div>
            <p className="text-[color:var(--text-muted)]">プロフィールを読み込んでいます...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen pb-20 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(200deg,rgba(231,103,76,0.08),transparent_84%),radial-gradient(circle_at_18%_22%,rgba(240,142,111,0.14),transparent_68%),radial-gradient(circle_at_86%_18%,rgba(245,177,143,0.12),transparent_76%)]" />
          <div className="absolute -top-28 right-16 h-88 w-88 rounded-full bg-[radial-gradient(circle_at_center,rgba(231,103,76,0.34),transparent_72%)] blur-[160px] opacity-72" />
          <div className="absolute bottom-[-8%] left-[-4%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(245,177,143,0.2),transparent_80%)] blur-[160px] opacity-58" />
        </div>
        <Header subtitle="ユーザープロフィール" showMenu={true} />
        <div className="max-w-6xl mx-auto px-4 py-8 pt-20">
          <div className="text-center">
            <p className="text-[color:var(--gt-primary-strong)] mb-4">{error || 'ユーザーが見つかりません'}</p>
            <button
              onClick={() => router.push('/feed')}
              className="px-6 py-3 bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white rounded-full font-medium hover:shadow-[0_12px_28px_-18px_rgba(189,101,78,0.44)] transition-all"
            >
              フィードに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(200deg,rgba(231,103,76,0.08),transparent_84%),radial-gradient(circle_at_18%_22%,rgba(240,142,111,0.14),transparent_68%),radial-gradient(circle_at_86%_18%,rgba(245,177,143,0.12),transparent_76%)]" />
        <div className="absolute -top-28 right-16 h-88 w-88 rounded-full bg-[radial-gradient(circle_at_center,rgba(231,103,76,0.34),transparent_72%)] blur-[160px] opacity-72" />
        <div className="absolute bottom-[-8%] left-[-4%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(245,177,143,0.2),transparent_80%)] blur-[160px] opacity-58" />
      </div>
      <Header subtitle="ユーザープロフィール" showMenu={true} />

      {/* Profile Header */}
      <div className="relative border-b border-[rgba(231,103,76,0.18)] bg-[rgba(254,255,250,0.95)] pt-16 sm:pt-20">
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Image
                src={userProfile.avatar_url || "/muscle-taro-avatar.svg"}
                alt={userProfile.display_name}
                width={96}
                height={96}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-[rgba(254,255,250,0.92)] shadow-[0_20px_46px_-26px_rgba(189,101,78,0.48)]"
                unoptimized={true}
                priority={true}
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 w-full text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[color:var(--foreground)]">
                  {userProfile.display_name}
                </h1>

                {/* フォローボタン - 認証済み && 自分以外のユーザーの場合のみ表示 */}
                {currentUser && currentUser.id !== userId && (
                  <div className="flex items-center gap-2">
                    {followCheckLoading ? (
                      <div className="px-4 py-2 bg-[rgba(254,255,250,0.82)] border border-[rgba(231,103,76,0.18)] rounded-lg">
                        <div className="w-4 h-4 border-2 border-[color:var(--gt-primary-strong)] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <button
                        onClick={isCurrentlyFollowing ? handleUnfollow : handleFollow}
                        disabled={followLoading}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isCurrentlyFollowing
                            ? 'bg-[rgba(254,255,250,0.82)] text-[color:var(--text-subtle)] border border-[rgba(231,103,76,0.18)] hover:bg-[rgba(254,255,250,0.9)]'
                            : 'bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white hover:from-[var(--gt-primary-strong)] hover:to-[var(--gt-tertiary)] shadow-[0_12px_28px_-18px_rgba(189,101,78,0.44)] hover:shadow-[0_14px_34px_-18px_rgba(189,101,78,0.5)]'
                        } ${
                          followLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        {followLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            <span>{isCurrentlyFollowing ? 'アンフォロー中...' : 'フォロー中...'}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {isCurrentlyFollowing ? (
                              <>
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                </svg>
                                <span>フォロー中</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                </svg>
                                <span>フォロー</span>
                              </>
                            )}
                          </div>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-[color:var(--text-subtle)] mb-1 sm:mb-2">
                <p className="text-xs sm:text-base text-[color:var(--text-subtle)] font-medium">
                  @{userProfile.username}
                </p>
                <span className="text-[color:var(--text-muted)] hidden sm:inline">•</span>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                  </svg>
                  <span className="text-xs sm:text-sm">
                    {new Date(userProfile.created_at).toLocaleDateString('ja-JP', {year: 'numeric', month: 'long'})}
                  </span>
                </div>
              </div>

              <div className="mb-2 sm:mb-3">
                {userProfile.location && (
                  <div className="flex items-center gap-1 justify-center sm:justify-start">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span className="text-xs sm:text-sm">
                      {userProfile.location}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[color:var(--foreground)] mb-2 sm:mb-3 px-4 sm:px-0">
                {userProfile.bio || 'プロフィール情報が設定されていません'}
              </p>

              {/* Stats */}
              <div className="flex gap-4 sm:gap-8 w-full sm:w-auto justify-center sm:justify-start">
                <div className="flex flex-col items-center min-w-[60px] px-2 py-2">
                  <span className="text-xl sm:text-2xl font-bold text-[color:var(--foreground)]">
                    {profileStats?.total_posts || userPosts.length}
                  </span>
                  <span className="text-xs text-[color:var(--text-muted)] font-medium">投稿</span>
                </div>
                <div className="flex flex-col items-center min-w-[60px] px-2 py-2">
                  <span className="text-xl sm:text-2xl font-bold text-[color:var(--gt-secondary-strong)]">
                    {achievements.length}
                  </span>
                  <span className="text-xs text-[color:var(--text-muted)] font-medium">実績</span>
                </div>
                <div className="flex flex-col items-center min-w-[60px] px-2 py-2">
                  <span className="text-xl sm:text-2xl font-bold text-[color:var(--gt-tertiary-strong)]">
                    {personalRecords.length}
                  </span>
                  <span className="text-xs text-[color:var(--text-muted)] font-medium">記録</span>
                </div>
                <div className="flex flex-col items-center min-w-[60px] px-2 py-2">
                  <span className="text-xl sm:text-2xl font-bold text-[color:var(--gt-primary-strong)]">
                    {favoriteGyms.length}
                  </span>
                  <span className="text-xs text-[color:var(--text-muted)] font-medium">お気に入り</span>
                </div>
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
              onClick={() => setActiveTab('gym-activity')}
              className={`flex-1 sm:flex-initial py-2 px-1 relative ${activeTab === 'gym-activity' ? 'text-[color:var(--gt-primary-strong)]' : 'text-[color:var(--text-muted)]'} hover:text-[color:var(--foreground)] transition`}
            >
              <span className="text-sm sm:text-base font-medium">ジム活</span>
              <div className="text-xs text-[color:var(--text-muted)] font-medium mt-0.5 sm:mt-1">
                {userPosts.length}投稿
              </div>
              {activeTab === 'gym-activity' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[color:var(--gt-primary)]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 sm:flex-initial py-2 px-1 relative ${activeTab === 'achievements' ? 'text-[color:var(--gt-primary-strong)]' : 'text-[color:var(--text-muted)]'} hover:text-[color:var(--foreground)] transition`}
            >
              <span className="text-sm sm:text-base font-medium">実績</span>
              <div className="text-xs text-[color:var(--text-muted)] font-medium mt-0.5 sm:mt-1">
                {achievements.length}件
              </div>
              {activeTab === 'achievements' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[color:var(--gt-primary)]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('favorite-gyms')}
              className={`flex-1 sm:flex-initial py-2 px-1 relative ${activeTab === 'favorite-gyms' ? 'text-[color:var(--gt-primary-strong)]' : 'text-[color:var(--text-muted)]'} hover:text-[color:var(--foreground)] transition`}
            >
              <span className="text-sm sm:text-base font-medium">お気に入り</span>
              <div className="text-xs text-[color:var(--text-muted)] font-medium mt-0.5 sm:mt-1">
                {favoriteGyms.length}軒
              </div>
              {activeTab === 'favorite-gyms' && (
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
            {userPosts.length === 0 ? (
              <div className="gt-card p-6 sm:p-8 text-center">
                <div className="text-[color:var(--text-muted)] mb-4">
                  <svg className="w-16 h-16 mx-auto" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-[color:var(--foreground)] mb-2">まだ投稿がありません</h3>
                <p className="text-[color:var(--text-muted)]">このユーザーはまだ投稿していません</p>
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
                      showActions={false} // 他ユーザーの投稿では編集・削除ボタンは表示しない
                      onToggleTraining={() => toggleTrainingDetails(post.id)}
                      expandedTraining={expandedTraining}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-4">
            {achievements.length === 0 ? (
              <div className="gt-card p-6 sm:p-8 text-center">
                <div className="text-[color:var(--text-muted)] mb-4">
                  <svg className="w-16 h-16 mx-auto" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9l-5 4.87L18.18 21 12 17.77 5.82 21 7 13.87 2 9l6.91-1.74L12 2z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-[color:var(--foreground)] mb-2">実績がありません</h3>
                <p className="text-[color:var(--text-muted)]">このユーザーはまだ実績を獲得していません</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="gt-card p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-3">
                      {getAchievementIcon(achievement.badge_icon, achievement.achievement_type)}
                      <div className="flex-1">
                        <h3 className="font-bold text-[color:var(--foreground)]">{achievement.achievement_name || achievement.title}</h3>
                        <p className="text-sm text-[color:var(--text-subtle)]">{achievement.description}</p>
                      </div>
                    </div>
                    <div className="text-xs text-[color:var(--text-muted)]">
                      獲得日: {new Date(achievement.earned_at).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Favorite Gyms Tab */}
        {activeTab === 'favorite-gyms' && (
          <div className="space-y-4">
            {favoriteGyms.length === 0 ? (
              <div className="gt-card p-6 sm:p-8 text-center">
                <div className="text-[color:var(--text-muted)] mb-4">
                  <svg className="w-16 h-16 mx-auto" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-[color:var(--foreground)] mb-2">お気に入りジムがありません</h3>
                <p className="text-[color:var(--text-muted)]">このユーザーはまだジムをお気に入りに追加していません</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteGyms.map((favoriteGym) => (
                  <div key={favoriteGym.id} className="gt-card p-4 sm:p-5">
                    {/* Gym Image */}
                    <div className="relative mb-4">
                      {favoriteGym.images && favoriteGym.images.length > 0 ? (
                        <Image
                          src={favoriteGym.images[0]}
                          alt={favoriteGym.name}
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
                        {favoriteGym.name}
                      </h3>

                      {favoriteGym.address && (
                        <div className="flex items-center gap-1 text-[color:var(--text-muted)]">
                          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>
                          <span className="text-sm line-clamp-2">{favoriteGym.address}</span>
                        </div>
                      )}

                      <div className="text-xs text-[color:var(--text-muted)] pt-2">
                        <div>追加日: {new Date(favoriteGym.created_at).toLocaleDateString('ja-JP')}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfilePage;