'use client';

import { useState, useEffect, useRef, useCallback, useMemo, type ReactNode } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
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

  if (badgeIcon === '💪') {
    return (
      <svg className={`${baseClasses} text-blue-500`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    );
  }

  // Default based on achievement type
  switch (achievementType) {
    case 'first_workout':
      return (
        <svg className={`${baseClasses} text-green-500`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      );
    case 'streak':
      return (
        <svg className={`${baseClasses} text-orange-500`} viewBox="0 0 24 24" fill="currentColor">
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

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileStats, setProfileStats] = useState<UserProfileStats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [userPosts, setUserPosts] = useState<GymPost[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [favoriteGyms, setFavoriteGyms] = useState<FavoriteGym[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const supabase = getSupabaseClient();

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            setError('ユーザーが見つかりません');
          } else {
            setError('プロフィールの取得に失敗しました');
          }
          return;
        }

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
              *,
              gym:gym_id (
                id,
                name,
                location,
                image_url
              ),
              user:user_id (
                id,
                username,
                display_name,
                avatar_url
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
              gym:gym_id (
                id,
                name,
                location,
                image_url
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

        // Set posts
        if (postsResult.data) {
          setUserPosts(postsResult.data);
        }

        // Set achievements
        if (achievementsResult.data) {
          setAchievements(achievementsResult.data);
        }

        // Set personal records
        if (recordsResult.data) {
          setPersonalRecords(recordsResult.data);
        }

        // Set favorite gyms
        if (gymsResult.data) {
          setFavoriteGyms(gymsResult.data);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-[color:var(--text-subtle)]">プロフィールを読み込んでいます...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-[#e0707a]">{error || 'ユーザーが見つかりません'}</p>
            <button
              onClick={() => router.push('/feed')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              フィードに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-[rgba(31,79,255,0.22)]/50 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
              {userProfile.avatar_url ? (
                <Image
                  src={userProfile.avatar_url}
                  alt={userProfile.display_name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {userProfile.display_name.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[color:var(--foreground)]">{userProfile.display_name}</h1>
              <p className="text-[color:var(--text-subtle)]">@{userProfile.username}</p>
              {userProfile.bio && (
                <p className="mt-2 text-[color:var(--text-subtle)]">{userProfile.bio}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-[color:var(--text-subtle)]">
                {userProfile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{userProfile.location}</span>
                  </div>
                )}
                <span>参加日: {new Date(userProfile.created_at).toLocaleDateString('ja-JP')}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[rgba(31,79,255,0.22)]/50">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{profileStats?.total_posts || 0}</div>
              <div className="text-sm text-[color:var(--text-subtle)]">投稿</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{achievements.length}</div>
              <div className="text-sm text-[color:var(--text-subtle)]">実績</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{personalRecords.length}</div>
              <div className="text-sm text-[color:var(--text-subtle)]">記録</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{favoriteGyms.length}</div>
              <div className="text-sm text-[color:var(--text-subtle)]">お気に入りジム</div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Posts */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-[rgba(31,79,255,0.22)]/50 p-6">
              <h2 className="text-xl font-bold text-[color:var(--foreground)] mb-4">最近の投稿</h2>

              {userPosts.length === 0 ? (
                <div className="text-center py-8 text-[color:var(--text-muted)]">
                  まだ投稿がありません
                </div>
              ) : (
                <div className="space-y-4">
                  {userPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post as unknown as Post}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-[rgba(31,79,255,0.22)]/50 p-6">
                <h3 className="text-lg font-bold text-[color:var(--foreground)] mb-4">実績</h3>
                <div className="space-y-3">
                  {achievements.slice(0, 5).map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl">
                      {getAchievementIcon(achievement.badge_icon, achievement.achievement_type)}
                      <div>
                        <div className="font-medium text-[color:var(--foreground)]">{achievement.title}</div>
                        <div className="text-sm text-[color:var(--text-subtle)]">{achievement.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Favorite Gyms */}
            {favoriteGyms.length > 0 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-[rgba(31,79,255,0.22)]/50 p-6">
                <h3 className="text-lg font-bold text-[color:var(--foreground)] mb-4">お気に入りジム</h3>
                <div className="space-y-3">
                  {favoriteGyms.slice(0, 3).map((favoriteGym) => (
                    <div key={favoriteGym.id} className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                        {favoriteGym.gym?.image_url ? (
                          <Image
                            src={favoriteGym.gym.image_url}
                            alt={favoriteGym.gym.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-[color:var(--foreground)]">{favoriteGym.gym?.name}</div>
                        <div className="text-sm text-[color:var(--text-subtle)]">{favoriteGym.gym?.location}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}