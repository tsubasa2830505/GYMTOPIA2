'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Camera, Image as ImageIcon, Share2, MoreVertical, Edit, Trash2 } from 'lucide-react';
import TrainingDetails from '@/components/TrainingDetails';
import { generateStoryImage, downloadStoryImage } from '@/lib/story-image-generator';
import type { Post } from '@/lib/supabase/posts';

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  onLike?: (post: Post) => void;
  onToggleTraining?: () => void;
  expandedTraining?: Set<string>;
  showActions?: boolean;
}

export default function PostCard({
  post,
  currentUserId,
  onEdit,
  onDelete,
  onLike,
  onToggleTraining,
  expandedTraining = new Set(),
  showActions = true,
}: PostCardProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [generatingStory, setGeneratingStory] = useState(false);

  const toggleDropdown = (postId: string) => {
    setActiveDropdown(activeDropdown === postId ? null : postId);
  };

  const handleGenerateStory = async () => {
    if (generatingStory) return;

    setGeneratingStory(true);
    try {
      console.log('Generating story image for post:', post.id);
      await downloadStoryImage(post);
      console.log('Story image generation completed');
    } catch (error) {
      console.error('Error generating story image:', error);
      alert('ストーリー画像の生成に失敗しました');
    } finally {
      setGeneratingStory(false);
    }
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

  const isOwner = currentUserId && post.user_id === currentUserId;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Post Header */}
      <div className="p-4 sm:p-6 pb-2 sm:pb-2">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Link href={`/user/${post.user_id}`} className="relative flex-shrink-0">
            {post.user?.avatar_url ? (
              <Image
                src={post.user.avatar_url}
                alt={post.user.display_name || ''}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow hover:ring-2 hover:ring-blue-400 transition-all"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium hover:ring-2 hover:ring-blue-400 transition-all">
                {post.user?.display_name?.[0] || 'U'}
              </div>
            )}
          </Link>

          {/* Author Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/user/${post.user_id}`}
                className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {post.user?.display_name || 'ユーザー'}
              </Link>
              {post.user?.username && (
                <Link
                  href={`/user/${post.user_id}`}
                  className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                >
                  @{post.user.username}
                </Link>
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
          {showActions && isOwner && onEdit && onDelete && (
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
                    onClick={() => {
                      onEdit(post);
                      setActiveDropdown(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    編集
                  </button>
                  <button
                    onClick={() => {
                      onDelete(post.id);
                      setActiveDropdown(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    削除
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      {post.content && (
        <div className="px-4 sm:px-6 py-2">
          <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
        </div>
      )}

      {/* Post Images */}
      {post.images && post.images.length > 0 && (
        <div className="mt-3">
          <div
            className={`grid gap-1 ${
              post.images.length === 1
                ? 'grid-cols-1'
                : post.images.length === 2
                ? 'grid-cols-2'
                : post.images.length === 3
                ? 'grid-cols-3'
                : 'grid-cols-2'
            }`}
          >
            {post.images.slice(0, 4).map((image, index) => (
              <div
                key={index}
                className={`relative bg-gray-100 ${
                  post.images!.length === 1
                    ? 'aspect-[4/3]'
                    : post.images!.length === 3 && index === 0
                    ? 'col-span-3 aspect-[3/2]'
                    : 'aspect-square'
                }`}
              >
                <Image
                  src={image}
                  alt={`投稿画像 ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {post.images!.length > 4 && index === 3 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      +{post.images!.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Training Details */}
      {post.training_details && (
        <div className="px-4 sm:px-6 py-3">
          <TrainingDetails
            details={post.training_details}
            postId={post.id}
            isExpanded={expandedTraining.has(post.id)}
            onToggle={onToggleTraining}
          />
        </div>
      )}

      {/* Post Actions */}
      {showActions && (
        <div className="px-4 sm:px-6 py-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {/* Like Button */}
              <button
                onClick={() => onLike?.(post)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  post.is_liked
                    ? 'text-red-500 bg-red-50 hover:bg-red-100'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`}
                />
                {post.likes_count > 0 && (
                  <span className="text-sm font-medium">{post.likes_count}</span>
                )}
              </button>

              {/* Comment Button */}
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                <MessageCircle className="w-5 h-5" />
                {post.comments_count > 0 && (
                  <span className="text-sm font-medium">{post.comments_count}</span>
                )}
              </button>

              {/* Story Button */}
              <button
                onClick={handleGenerateStory}
                disabled={generatingStory}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  generatingStory
                    ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {generatingStory ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">生成中...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    <span className="text-sm">ストーリー</span>
                  </>
                )}
              </button>
            </div>

            {/* Share Button */}
            <button className="p-2 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}