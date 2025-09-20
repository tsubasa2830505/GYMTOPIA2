'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import PostCardWithVerification from '@/components/PostCardWithVerification';
import PostEditModal from '@/components/PostEditModal';
import { getFeedPosts, likePost, unlikePost, updatePost, deletePost as deletePostAPI, type Post } from '@/lib/supabase/posts';
import { useAuth } from '@/contexts/AuthContext';

// 開発用のサンプル投稿データを生成する関数
const getSamplePosts = (): Post[] => [
  {
    id: 'sample-1',
    user_id: 'sample-user-1',
    gym_id: 'sample-gym-1',
    content: '今日も良いトレーニングができました！ベンチプレス100kg達成🔥\n\n久しぶりに新しいPRを更新できて嬉しいです。これからも頑張ります！',
    images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=1200&fit=crop&crop=center'],
    created_at: new Date().toISOString(),
    likes_count: 15,
    comments_count: 3,
    is_liked: false,
    user: {
      id: 'sample-user-1',
      display_name: 'フィットネス太郎',
      username: 'fitness_taro',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'
    },
    gym: {
      name: 'エクサイズジム渋谷'
    },
    is_verified: true,
    check_in_id: 'sample-checkin-1',
    verification_method: 'check_in',
    distance_from_gym: 25,
    training_details: {
      gym_name: 'エクサイズジム渋谷',
      exercises: [
        {
          name: 'ベンチプレス',
          weight: 100,
          sets: 3,
          reps: 8
        },
        {
          name: 'スクワット',
          weight: 80,
          sets: 4,
          reps: 12
        },
        {
          name: 'デッドリフト',
          weight: 120,
          sets: 3,
          reps: 5
        }
      ],
      crowd_status: 'normal'
    }
  },
  {
    id: 'sample-2',
    user_id: 'sample-user-2',
    gym_id: 'sample-gym-2',
    content: '今日は有酸素運動の日！30分間のランニングで汗を流しました💦\n\n天気も良くて気持ちよかったです！',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    likes_count: 8,
    comments_count: 2,
    is_liked: false,
    user: {
      id: 'sample-user-2',
      display_name: 'ランニング花子',
      username: 'running_hanako',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face'
    },
    gym: {
      name: 'フィットネスジム新宿'
    },
    is_verified: false,
    verification_method: 'manual',
    training_details: {
      gym_name: 'フィットネスジム新宿',
      exercises: [
        {
          name: 'ランニング',
          weight: 0,
          sets: 1,
          reps: 30
        }
      ],
      crowd_status: 'empty'
    }
  },
  {
    id: 'sample-3',
    user_id: 'sample-user-3',
    gym_id: 'sample-gym-3',
    content: 'チェックインしてすぐに筋トレ開始！\n\n今日は胸と背中を集中的に鍛えました。近距離チェックインで高精度認証もバッチリ✨',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    likes_count: 22,
    comments_count: 5,
    is_liked: true,
    user: {
      id: 'sample-user-3',
      display_name: 'マッスル一郎',
      username: 'muscle_ichiro',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face'
    },
    gym: {
      name: 'ゴールドジム銀座'
    },
    is_verified: true,
    check_in_id: 'sample-checkin-2',
    verification_method: 'check_in',
    distance_from_gym: 15,
    training_details: {
      gym_name: 'ゴールドジム銀座',
      exercises: [
        {
          name: 'ベンチプレス',
          weight: 120,
          sets: 4,
          reps: 6
        },
        {
          name: 'ラットプルダウン',
          weight: 90,
          sets: 3,
          reps: 10
        }
      ],
      crowd_status: 'crowded'
    }
  }
];

export default function FeedPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'following' | 'mutual' | 'same-gym'>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedTraining, setExpandedTraining] = useState<Set<string>>(new Set());
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const POSTS_PER_PAGE = 20;

  useEffect(() => {
    loadInitialPosts();
  }, [filter]); // Reload when filter changes

  const loadInitialPosts = async () => {
    setIsLoading(true);
    setCurrentPage(0);
    setHasMore(true);
    setError(null);

    try {
      console.log('FeedPage: Loading initial posts with filter:', filter);

      // 認証状態に関わらず、まずデータベースからの取得を試行
      let feedPosts: Post[] = [];

      if (user?.id) {
        console.log('FeedPage: Authenticated user, loading personalized feed');
        feedPosts = await getFeedPosts(POSTS_PER_PAGE, 0, filter, user.id);
      } else {
        console.log('FeedPage: Anonymous user, loading public feed');
        // 匿名ユーザーでも公開投稿を表示（フィルターは'all'固定）
        feedPosts = await getFeedPosts(POSTS_PER_PAGE, 0, 'all', null);
      }

      console.log('FeedPage: Database query result:', {
        count: feedPosts.length,
        isFromDatabase: feedPosts.length > 0 && !feedPosts[0].id.startsWith('sample-'),
        firstPost: feedPosts[0] || null,
        userAuthenticated: !!user?.id
      });

      // データベースから投稿を取得できた場合
      if (feedPosts.length > 0) {
        setPosts(feedPosts);
        setHasMore(feedPosts.length === POSTS_PER_PAGE);
      } else {
        // データベースに投稿がない場合の適切な処理
        console.log('FeedPage: No posts found in database');
        setPosts([]);
        setHasMore(false);

        // 本番環境では空の状態を表示、開発環境ではサンプルデータを表示
        if (process.env.NODE_ENV === 'development') {
          console.log('FeedPage: Development mode - showing sample data');
          const samplePosts = getSamplePosts();
          setPosts(samplePosts);
        }
      }
    } catch (error) {
      console.error('FeedPage: Error loading posts:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        userAuthenticated: !!user?.id
      });

      setError('投稿の読み込みに失敗しました');
      setPosts([]);
      setHasMore(false);

      // 開発環境でのみエラー時にサンプルデータを表示
      if (process.env.NODE_ENV === 'development') {
        console.log('FeedPage: Development mode - showing sample data after error');
        const samplePosts = getSamplePosts();
        setPosts(samplePosts);
        setHasMore(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      console.log('FeedPage: Loading more posts, page:', nextPage);

      if (!user?.id) {
        console.error('User not authenticated for loading more posts');
        return;
      }
      const feedPosts = await getFeedPosts(POSTS_PER_PAGE, nextPage * POSTS_PER_PAGE, filter, user.id);

      if (feedPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts(prevPosts => [...prevPosts, ...feedPosts]);
        setCurrentPage(nextPage);
        setHasMore(feedPosts.length === POSTS_PER_PAGE);
      }
    } catch (error) {
      console.error('FeedPage: Error loading more posts:', error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleLike = async (post: Post) => {
    // モック認証またはログイン済みユーザーの場合は処理を続行
    if (!user?.id) {
      console.error('User not authenticated for like action');
      return;
    }
    const currentUserId = user.id;
    console.log('いいね処理開始:', { postId: post.id, isLiked: post.is_liked, userId: currentUserId });

    try {
      if (post.is_liked) {
        await unlikePost(post.id);
        setPosts(posts.map(p =>
          p.id === post.id
            ? { ...p, is_liked: false, likes_count: p.likes_count - 1 }
            : p
        ));
        console.log('いいね削除完了');
      } else {
        await likePost(post.id);
        setPosts(posts.map(p =>
          p.id === post.id
            ? { ...p, is_liked: true, likes_count: p.likes_count + 1 }
            : p
        ));
        console.log('いいね追加完了');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const toggleTrainingDetails = (postId: string) => {
    setExpandedTraining(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedData: Partial<Post> & { workout_started_at?: string; workout_ended_at?: string }) => {
    if (!editingPost) return;

    console.log('Saving edit with data:', updatedData);
    console.log('Editing post ID:', editingPost.id);
    console.log('Images being saved:', updatedData.images);

    try {
      // サンプルデータの場合はローカルでのみ更新
      if (editingPost.id.startsWith('sample-')) {
        const updatedPosts = posts.map(p => {
          if (p.id === editingPost.id) {
            const updated: any = {
              ...p,
              content: updatedData.content !== undefined ? updatedData.content : p.content,
              images: updatedData.images !== undefined ? updatedData.images : p.images,
              training_details: updatedData.training_details !== undefined
                ? updatedData.training_details
                : p.training_details,
              workout_started_at: updatedData.workout_started_at !== undefined
                ? updatedData.workout_started_at
                : (p as any).workout_started_at,
              workout_ended_at: updatedData.workout_ended_at !== undefined
                ? updatedData.workout_ended_at
                : (p as any).workout_ended_at
            };

            // 時間が設定されている場合は時間差を計算
            if (updated.workout_started_at && updated.workout_ended_at) {
              const [startHour, startMin] = updated.workout_started_at.split(':').map(Number);
              const [endHour, endMin] = updated.workout_ended_at.split(':').map(Number);
              const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
              updated.workout_duration_calculated = duration > 0 ? duration : 0;
            }

            console.log('Updated sample post:', updated);
            return updated;
          }
          return p;
        });

        setPosts([...updatedPosts]);
        setShowEditModal(false);
        setEditingPost(null);
        return;
      }

      // データベースの更新
      const updatePayload = {
        content: updatedData.content,
        images: updatedData.images,
        training_details: updatedData.training_details,
        workout_started_at: updatedData.workout_started_at,
        workout_ended_at: updatedData.workout_ended_at
      };

      console.log('Updating post in database:', editingPost.id, updatePayload);
      const updatedPost = await updatePost(editingPost.id, updatePayload);

      // UIを更新
      const updatedPosts = posts.map(p => {
        if (p.id === editingPost.id) {
          return {
            ...p,
            ...updatedPost,
            user: p.user,
            gym: p.gym
          };
        }
        return p;
      });

      setPosts([...updatedPosts]);
      setShowEditModal(false);
      setEditingPost(null);
      console.log('Post updated successfully');
    } catch (error) {
      console.error('Error updating post:', error);
      alert('投稿の更新に失敗しました');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('この投稿を削除してもよろしいですか？')) {
      return;
    }

    try {
      await deletePostAPI(postId);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('投稿の削除に失敗しました');
    }
  };



  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(210deg,rgba(231,103,76,0.08),transparent_82%),radial-gradient(circle_at_16%_20%,rgba(240,142,111,0.14),transparent_68%),radial-gradient(circle_at_84%_14%,rgba(245,177,143,0.12),transparent_74%)]" />
        <div className="absolute -top-24 left-[14%] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(231,103,76,0.32),transparent_72%)] blur-[150px] opacity-68" />
        <div className="absolute bottom-[-6%] right-[-4%] h-[21rem] w-[21rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(245, 177, 143,0.24),transparent_78%)] blur-[150px] opacity-58" />
      </div>
      <Header />

      {/* Main Content */}
      <div className="relative max-w-4xl mx-auto px-4 pt-20 sm:pt-24 py-6 space-y-6">
        {/* Feed Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[color:var(--foreground)]">ジム活フィード</h2>
            <span className="text-sm text-[color:var(--text-muted)]">
              {posts.length}件の投稿
            </span>
          </div>

          {/* Filter Tabs - Removed mutual tab */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all flex items-center justify-center gap-1 ${filter === 'all'
                ? 'bg-gradient-to-r from-accent to-accent-secondary text-[color:var(--gt-on-primary)] shadow-[0_12px_30px_-18px_rgba(189,101,78,0.44)]'
                : 'bg-[rgba(254,255,250,0.92)] text-[color:var(--text-subtle)] border border-[rgba(231,103,76,0.18)] hover:bg-[rgba(254,255,250,1)]'
                }`}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
              </svg>
              すべて
            </button>
            <button
              onClick={() => setFilter('following')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all flex items-center justify-center gap-1 ${filter === 'following'
                ? 'bg-gradient-to-r from-accent to-accent-secondary text-[color:var(--gt-on-primary)] shadow-[0_12px_30px_-18px_rgba(189,101,78,0.44)]'
                : 'bg-[rgba(254,255,250,0.92)] text-[color:var(--text-subtle)] border border-[rgba(231,103,76,0.18)] hover:bg-[rgba(254,255,250,1)]'
                }`}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              フォロー中
            </button>
            <button
              onClick={() => setFilter('same-gym')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all flex items-center justify-center gap-1 ${filter === 'same-gym'
                ? 'bg-gradient-to-r from-accent to-accent-secondary text-[color:var(--gt-on-primary)] shadow-[0_12px_30px_-18px_rgba(189,101,78,0.44)]'
                : 'bg-[rgba(254,255,250,0.92)] text-[color:var(--text-subtle)] border border-[rgba(231,103,76,0.18)] hover:bg-[rgba(254,255,250,1)]'
                }`}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              同じジム
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="gt-card border border-[rgba(231,103,76,0.28)] bg-[rgba(254,255,250,0.96)] p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[color:var(--gt-primary)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <p className="text-sm font-semibold text-[color:var(--gt-primary-strong)]">{error}</p>
            </div>
            <button
              onClick={() => {
                setError(null);
                loadInitialPosts();
              }}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white/80 border border-[rgba(231,103,76,0.28)] text-[color:var(--gt-primary-strong)] hover:bg-white transition-colors"
            >
              再試行
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="gt-card p-10 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--gt-primary-strong)] border-t-transparent"></div>
            <p className="text-sm text-[color:var(--text-subtle)] mt-3">投稿を読み込み中...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="gt-card p-10 text-center">
            <h3 className="text-lg font-semibold text-[color:var(--foreground)]">投稿がありません</h3>
            <p className="text-sm text-[color:var(--text-subtle)] mt-2">最初のジム活をシェアしてみましょう。</p>
          </div>
        ) : (
          <>
            {/* Feed Posts */}
            <div className="space-y-4">
              {posts.map((post) => {
                // デバッグログ
                console.log('Feed post data:', {
                  id: post.id,
                  is_verified: post.is_verified,
                  checkin_id: post.checkin_id,
                  verification_method: post.verification_method,
                  distance_from_gym: post.distance_from_gym
                })

                return (
                  <PostCardWithVerification
                    key={post.id}
                    id={post.id}
                    user={{
                      id: post.user.id,
                      username: post.user.username,
                      displayName: post.user.display_name,
                      avatarUrl: post.user.avatar_url
                    }}
                    gym={{
                      id: post.gym_id,
                      name: post.gym.name
                    }}
                    content={post.content}
                    images={post.images}
                    likes={post.likes_count}
                    comments={post.comments_count}
                    createdAt={post.created_at}
                    isLiked={post.is_liked}
                    isVerified={post.is_verified}
                    checkInId={post.checkin_id}
                    verificationMethod={post.verification_method}
                    distanceFromGym={post.distance_from_gym}
                  />
                )
              })}

              {/* Load More Button */}
              {hasMore && !isLoading && (
                <div className="text-center py-8">
                  <button
                    onClick={loadMorePosts}
                    disabled={isLoadingMore}
                    className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isLoadingMore
                        ? 'bg-[rgba(254,255,250,0.8)] text-[color:var(--text-muted)] cursor-not-allowed border border-[rgba(231,103,76,0.18)]'
                        : 'bg-gradient-to-r from-accent to-accent-secondary text-[color:var(--gt-on-primary)] hover:from-accent-strong hover:to-accent-tertiary shadow-[0_18px_34px_-20px_rgba(189,101,78,0.44)] hover:shadow-[0_22px_40px_-20px_rgba(189,101,78,0.5)]'
                    }`}
                  >
                    {isLoadingMore ? (
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
              {!hasMore && posts.length > 0 && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[rgba(254,255,250,0.92)] border border-[rgba(231,103,76,0.18)] rounded-full text-[color:var(--text-subtle)] text-sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9l-5 4.87L18.18 21 12 17.77 5.82 21 7 13.87 2 9l6.91-1.74L12 2z" />
                    </svg>
                    <span>全ての投稿を表示しました</span>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {posts.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-[rgba(231,103,76,0.32)] mb-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                  </svg>
                  <p className="text-sm text-[color:var(--text-subtle)]">まだ投稿がありません</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Post Button - Fixed Position */}
        <button
          onClick={() => router.push('/add')}
          className="fixed bottom-20 right-6 sm:bottom-24 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 bg-[color:var(--gt-primary)] rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center group"
          style={{
            zIndex: 9999,
            background: 'var(--gt-accent-gradient)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:rotate-90 transition-transform duration-200" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </button>
      </div>

      {/* Edit Modal */}
      {editingPost && (
        <PostEditModal
          post={editingPost}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingPost(null);
          }}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
