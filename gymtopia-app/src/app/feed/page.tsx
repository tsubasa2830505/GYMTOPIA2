'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Heart, Camera, Image as ImageIcon, Share2, MoreVertical, Edit, Trash2 } from 'lucide-react';
import PostEditModal from '@/components/PostEditModal';
import { getFeedPosts, likePost, unlikePost, updatePost, deletePost as deletePostAPI, type Post } from '@/lib/supabase/posts';
import { useAuth } from '@/contexts/AuthContext';
import { generateStoryImage, downloadStoryImage } from '@/lib/story-image-generator';
import TrainingDetails from '@/components/TrainingDetails';

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
  const [filter, setFilter] = useState<'all' | 'following' | 'gym-friends' | 'same-gym'>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTraining, setExpandedTraining] = useState<Set<string>>(new Set());
  const [generatingStory, setGeneratingStory] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [filter]); // Reload when filter changes

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      console.log('FeedPage: Loading posts with filter:', filter);
      // Use mock user ID for development
      const mockUserId = '8ac9e2a5-a702-4d04-b871-21e4a423b4ac';
      const feedPosts = await getFeedPosts(20, 0, filter, user?.id || mockUserId);
      console.log('FeedPage: Loaded posts:', {
        count: feedPosts.length,
        isFromDatabase: feedPosts.length > 0 && !feedPosts[0].id.startsWith('sample-'),
        firstPost: feedPosts[0] || null
      });

      // データベースから投稿が取得できない場合はサンプルデータを使用
      if (feedPosts.length === 0) {
        console.log('FeedPage: No posts from database, using sample data');
        setPosts(getSamplePosts());
      } else {
        setPosts(feedPosts);
      }
    } catch (error) {
      console.error('FeedPage: Critical error loading posts:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      // エラーが発生した場合はサンプルデータを表示
      console.log('FeedPage: Using sample data due to error');
      setPosts(getSamplePosts());
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (post: Post) => {
    if (!user) {
      // 認証が必要な機能として、エラーメッセージを表示
      console.log('ログインが必要です');
      return;
    }

    try {
      if (post.is_liked) {
        await unlikePost(post.id);
        setPosts(posts.map(p =>
          p.id === post.id
            ? { ...p, is_liked: false, likes_count: p.likes_count - 1 }
            : p
        ));
      } else {
        await likePost(post.id);
        setPosts(posts.map(p =>
          p.id === post.id
            ? { ...p, is_liked: true, likes_count: p.likes_count + 1 }
            : p
        ));
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

  const handleGenerateStory = async (post: Post) => {
    console.log('handleGenerateStory called with post:', post);
    setGeneratingStory(post.id);
    try {
      console.log('Starting image generation...');
      await downloadStoryImage(post, `gymtopia-story-${post.id}.png`);
      console.log('Image generation completed successfully');
    } catch (error) {
      console.error('Error generating story image:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      alert('ストーリー画像の生成に失敗しました。コンソールを確認してください。');
    } finally {
      setGeneratingStory(null);
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setShowEditModal(true);
    setActiveDropdown(null);
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
      // ここでSupabaseの削除処理を実装
      setPosts(posts.filter(p => p.id !== postId));
      setActiveDropdown(null);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('投稿の削除に失敗しました');
    }
  };

  const toggleDropdown = (postId: string) => {
    setActiveDropdown(activeDropdown === postId ? null : postId);
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}分前`;
    } else if (hours < 24) {
      return `${hours}時間前`;
    } else if (days < 7) {
      return `${days}日前`;
    } else {
      return date.toLocaleDateString('ja-JP');
    }
  };

  const filteredPosts = posts; // Filtering is now handled in getFeedPosts

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-[73.5px] flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-[42px] sm:h-[42px] bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
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
              <p className="text-xs text-slate-600">理想のジムを見つけよう</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Feed Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-700">ジム活フィード</h2>
            <span className="text-sm text-gray-500">
              {filteredPosts.length}件の投稿
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center justify-center gap-1 ${filter === 'all'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
              </svg>
              すべて
            </button>
            <button
              onClick={() => setFilter('following')}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center justify-center gap-1 ${filter === 'following'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              フォロー中
            </button>
            <button
              onClick={() => setFilter('gym-friends')}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center justify-center gap-1 ${filter === 'gym-friends'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 13.75c-2.34 0-7 1.17-7 3.5V19h14v-1.75c0-2.33-4.66-3.5-7-3.5zM4.34 17c.84-.58 2.87-1.25 4.66-1.25s3.82.67 4.66 1.25H4.34zM9 12c1.93 0 3.5-1.57 3.5-3.5S10.93 5 9 5 5.5 6.57 5.5 8.5 7.07 12 9 12zm0-5c.83 0 1.5.67 1.5 1.5S9.83 10 9 10s-1.5-.67-1.5-1.5S8.17 7 9 7zm7.04 6.81c1.16.84 1.96 1.96 1.96 3.44V19h4v-1.75c0-2.02-3.5-3.17-5.96-3.44zM15 12c1.93 0 3.5-1.57 3.5-3.5S16.93 5 15 5c-.54 0-1.04.13-1.5.35.63.89 1 1.98 1 3.15s-.37 2.26-1 3.15c.46.22.96.35 1.5.35z" />
              </svg>
              ジム友
            </button>
            <button
              onClick={() => setFilter('same-gym')}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center justify-center gap-1 ${filter === 'same-gym'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50'
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
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">投稿がありません</p>
            <p className="text-sm text-gray-400 mt-2">最初の投稿を作成してみましょう！</p>
          </div>
        ) : (
          <>
            {/* Feed Posts */}
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {/* Post Header */}
                  <div className="p-4 sm:p-6 pb-2 sm:pb-2">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {post.user?.avatar_url ? (
                          <Image
                            src={post.user.avatar_url}
                            alt={post.user.display_name || ''}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                            {post.user?.display_name?.[0] || 'U'}
                          </div>
                        )}
                      </div>

                      {/* Author Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {post.user?.display_name || 'ユーザー'}
                          </h3>
                          {post.user?.username && (
                            <span className="text-sm text-gray-500">
                              @{post.user.username}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          {post.gym?.name && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-100 rounded-full">
                              <svg className="w-3 h-3 text-indigo-900" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                              </svg>
                              <span className="text-xs text-indigo-900">{post.gym.name}</span>
                            </div>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatDate(post.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Dropdown Menu - 自分の投稿のみ表示 */}
                      {(user && post.user_id === user.id) && (
                        <div className="relative">
                          <button
                            onClick={() => toggleDropdown(post.id)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-500" />
                          </button>

                          {activeDropdown === post.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              <button
                                onClick={() => handleEditPost(post)}
                                className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                              >
                                <Edit className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700">編集</span>
                              </button>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-red-50 transition-colors border-t border-gray-100"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                                <span className="text-sm text-red-600">削除</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Post Content */}
                  {post.content && (
                    <div className="px-4 sm:px-6 pb-4">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-line">{post.content}</p>
                    </div>
                  )}

                  {/* Workout Duration */}
                  {(post as any).workout_started_at && (post as any).workout_ended_at && (
                    <div className="px-4 sm:px-6 pb-4">
                      <div className="flex items-center gap-4 text-sm text-gray-600 bg-amber-50 rounded-lg p-3 border border-amber-200">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                          </svg>
                          <span className="font-medium text-amber-800">
                            {(post as any).workout_started_at} - {(post as any).workout_ended_at}
                          </span>
                        </div>
                        {(post as any).workout_duration_calculated && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 rounded-full">
                            <svg className="w-3.5 h-3.5 text-amber-700" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14 4.14 5.57 2 7.71 3.43 9.14 2 10.57 3.43 12 7 15.57 15.57 7 12 3.43 13.43 2 14.86 3.43 16.29 2 18.43 4.14 19.86 2.71 21.29 4.14 19.86 5.57 22 7.71 20.57 9.14 22 10.57 20.57 12 22 13.43 20.57 14.86z" />
                            </svg>
                            <span className="text-xs font-bold text-amber-800">
                              {Math.floor((post as any).workout_duration_calculated / 60)}時間{(post as any).workout_duration_calculated % 60}分
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Training Details - Using shared component */}
                  {post.training_details && post.training_details.exercises && (
                    <TrainingDetails
                      exercises={post.training_details.exercises}
                      crowdStatus={post.training_details.crowd_status}
                      isExpanded={expandedTraining.has(post.id)}
                      onToggle={() => toggleTrainingDetails(post.id)}
                    />
                  )}

                  {/* Achievement Data (Legacy) */}
                  {post.post_type === 'achievement' && post.achievement_data && !post.training_details && (
                    <div className="px-4 sm:px-6 pb-4">
                      <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-yellow-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 1l3.09 6.26L22 9l-5 4.87L18.18 21 12 17.77 5.82 21 7 13.87 2 9l6.91-1.74L12 1z" />
                          </svg>
                          <span className="font-semibold text-gray-900">達成記録</span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {post.achievement_data.exercise}: {post.achievement_data.weight}kg × {post.achievement_data.reps}回
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Post Images */}
                  {post.images && post.images.length > 0 && (
                    <div className="px-4 sm:px-6 pb-4">
                      {post.images.length === 1 ? (
                        <div className="relative h-48 sm:h-64 rounded-xl overflow-hidden">
                          <Image
                            src={post.images[0]}
                            alt="投稿画像"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {post.images.map((imageUrl, index) => (
                            <div key={index} className="relative h-32 sm:h-40 rounded-lg overflow-hidden">
                              <Image
                                src={imageUrl}
                                alt={`投稿画像 ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="px-4 sm:px-6 py-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLike(post)}
                          className={`flex items-center gap-2 transition ${post.is_liked
                            ? 'text-red-500'
                            : 'text-gray-500 hover:text-red-500'
                            }`}
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill={post.is_liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                            <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                          <span className="text-sm">{post.likes_count}</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                          </svg>
                          <span className="text-sm">{post.comments_count}</span>
                        </button>
                      </div>
                      {/* ストーリー生成ボタン - 開発環境ではすべての投稿で表示 */}
                      {(true || (user && post.user_id === user.id)) && (
                        <button
                          onClick={() => handleGenerateStory(post)}
                          disabled={generatingStory === post.id}
                          className="flex items-center gap-2 text-gray-500 hover:text-purple-500 transition disabled:opacity-50"
                          title="ストーリー画像を生成"
                        >
                          {generatingStory === post.id ? (
                            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Camera className="w-5 h-5" />
                          )}
                          <span className="text-sm hidden sm:inline">ストーリー</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {filteredPosts.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                  </svg>
                  <p className="text-gray-500">まだ投稿がありません</p>
                  {/* {!user && (
                    <button
                      onClick={() => router.push('/auth/login')}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                      ログインして投稿を見る
                    </button>
                  )} */}
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
            background: 'linear-gradient(to right, #3b82f6, #9333ea)',
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