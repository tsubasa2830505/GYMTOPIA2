'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PostCard from '@/components/PostCard';
import PostEditModal from '@/components/PostEditModal';
import { getFeedPosts, likePost, unlikePost, updatePost, deletePost as deletePostAPI, type Post } from '@/lib/supabase/posts';
import { useAuth } from '@/contexts/AuthContext';

// サンプル投稿データを生成する関数
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
      // If user is not authenticated, show sample data
      if (!user?.id) {
        console.log('FeedPage: No user authentication, using sample data');
        const samplePosts = getSamplePosts();
        setPosts(samplePosts);
        setHasMore(false);
        setIsLoading(false);
        return;
      }
      const feedPosts = await getFeedPosts(POSTS_PER_PAGE, 0, filter, user.id);
      console.log('FeedPage: Loaded initial posts:', {
        count: feedPosts.length,
        isFromDatabase: feedPosts.length > 0 && !feedPosts[0].id.startsWith('sample-'),
        firstPost: feedPosts[0] || null
      });

      // データベースから投稿が取得できない場合はサンプルデータを使用
      if (feedPosts.length === 0) {
        console.log('FeedPage: No posts from database, using sample data');
        const samplePosts = getSamplePosts();
        setPosts(samplePosts);
        setHasMore(false); // サンプルデータの場合は追加読み込みなし
      } else {
        setPosts(feedPosts);
        setHasMore(feedPosts.length === POSTS_PER_PAGE); // フルページ取得できた場合は続きがある可能性
      }
    } catch (error) {
      console.error('FeedPage: Critical error loading posts:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      // エラーが発生した場合はサンプルデータを表示
      console.log('FeedPage: Using sample data due to error');
      const samplePosts = getSamplePosts();
      setPosts(samplePosts);
      setHasMore(false);
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(120,168,255,0.2),transparent_60%),radial-gradient(circle_at_bottom_right,rgba(74,160,217,0.18),transparent_65%)]" />
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[rgba(157,176,226,0.45)] bg-[rgba(247,250,255,0.9)] backdrop-blur-xl shadow-[0_20px_46px_-28px_rgba(26,44,94,0.42)]">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-[73.5px] flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-[42px] sm:h-[42px] bg-gradient-to-br from-[#3b63f3] to-[#4aa0d9] rounded-full flex items-center justify-center shadow-[0_16px_34px_-20px_rgba(26,44,94,0.5)]">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14 4.14 5.57 2 7.71 3.43 9.14 2 10.57 3.43 12 7 15.57 15.57 7 12 3.43 13.43 2 14.86 3.43 16.29 2 18.43 4.14 19.86 2.71 21.29 4.14 19.86 5.57 22 7.71 20.57 9.14 22 10.57 20.57 12 22 13.43 20.57 14.86z" />
              </svg>
            </div>
            <div>
              <Image
                src="/images/gymtopia-logo.svg"
                alt="ジムトピア"
                width={120}
                height={32}
                className="h-6 sm:h-8 w-auto"
              />
              <p className="text-xs text-[color:var(--text-muted)]">街の熱量と一緒にジムを探そう</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Feed Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[color:var(--foreground)]">ジム活フィード</h2>
            <span className="text-sm text-[color:var(--text-muted)]">
              {posts.length}件の投稿
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all flex items-center justify-center gap-1 ${filter === 'all'
                ? 'bg-gradient-to-r from-[#3b63f3] to-[#4aa0d9] text-white shadow-[0_12px_30px_-18px_rgba(26,44,94,0.5)]'
                : 'bg-[rgba(243,247,255,0.92)] text-[color:var(--text-subtle)] border border-[rgba(168,184,228,0.45)] hover:bg-white'
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
                ? 'bg-gradient-to-r from-[#3b63f3] to-[#4aa0d9] text-white shadow-[0_12px_30px_-18px_rgba(26,44,94,0.5)]'
                : 'bg-[rgba(243,247,255,0.92)] text-[color:var(--text-subtle)] border border-[rgba(168,184,228,0.45)] hover:bg-white'
                }`}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              フォロー中
            </button>
            <button
              onClick={() => setFilter('mutual')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all flex items-center justify-center gap-1 ${filter === 'mutual'
                ? 'bg-gradient-to-r from-[#3b63f3] to-[#4aa0d9] text-white shadow-[0_12px_30px_-18px_rgba(26,44,94,0.5)]'
                : 'bg-[rgba(243,247,255,0.92)] text-[color:var(--text-subtle)] border border-[rgba(168,184,228,0.45)] hover:bg-white'
                }`}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 13.75c-2.34 0-7 1.17-7 3.5V19h14v-1.75c0-2.33-4.66-3.5-7-3.5zM4.34 17c.84-.58 2.87-1.25 4.66-1.25s3.82.67 4.66 1.25H4.34zM9 12c1.93 0 3.5-1.57 3.5-3.5S10.93 5 9 5 5.5 6.57 5.5 8.5 7.07 12 9 12zm0-5c.83 0 1.5.67 1.5 1.5S9.83 10 9 10s-1.5-.67-1.5-1.5S8.17 7 9 7zm7.04 6.81c1.16.84 1.96 1.96 1.96 3.44V19h4v-1.75c0-2.02-3.5-3.17-5.96-3.44zM15 12c1.93 0 3.5-1.57 3.5-3.5S16.93 5 15 5c-.54 0-1.04.13-1.5.35.63.89 1 1.98 1 3.15s-.37 2.26-1 3.15c.46.22.96.35 1.5.35z" />
              </svg>
              相互
            </button>
            <button
              onClick={() => setFilter('same-gym')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all flex items-center justify-center gap-1 ${filter === 'same-gym'
                ? 'bg-gradient-to-r from-[#3b63f3] to-[#4aa0d9] text-white shadow-[0_12px_30px_-18px_rgba(26,44,94,0.5)]'
                : 'bg-[rgba(243,247,255,0.92)] text-[color:var(--text-subtle)] border border-[rgba(168,184,228,0.45)] hover:bg-white'
                }`}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              同じジム
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-500 mt-2">投稿を読み込み中...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">投稿がありません</p>
            <p className="text-sm text-gray-400 mt-2">最初の投稿を作成してみましょう！</p>
          </div>
        ) : (
          <>
            {/* Feed Posts */}
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                  onLike={handleLike}
                  onToggleTraining={() => toggleTrainingDetails(post.id)}
                  expandedTraining={expandedTraining}
                />
              ))}

              {/* Load More Button */}
              {hasMore && !isLoading && (
                <div className="text-center py-8">
                  <button
                    onClick={loadMorePosts}
                    disabled={isLoadingMore}
                    className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isLoadingMore
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#3b63f3] to-[#4aa0d9] text-white hover:from-[#2f54d3] hover:to-[#3a8ac3] shadow-[0_18px_34px_-20px_rgba(26,44,94,0.5)] hover:shadow-[0_22px_40px_-20px_rgba(26,44,94,0.55)]'
                    }`}
                  >
                    {isLoadingMore ? (
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
              {!hasMore && posts.length > 0 && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-gray-600 text-sm">
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
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                  </svg>
                  <p className="text-gray-500">まだ投稿がありません</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Post Button - Fixed Position */}
        <button
          onClick={() => router.push('/add')}
          className="fixed bottom-20 right-6 sm:bottom-24 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 bg-blue-500 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center group"
          style={{
            zIndex: 9999,
            background: 'linear-gradient(135deg, #3b63f3, #4aa0d9)',
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
