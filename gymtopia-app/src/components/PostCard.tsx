'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Camera, Image as ImageIcon, Share2, MoreVertical, Edit, Trash2, Shield } from 'lucide-react';
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
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth > 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
    <div className="gt-card overflow-hidden">
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
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow hover:ring-2 hover:ring-[var(--gt-primary)] transition-all"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--gt-primary)] to-[var(--gt-secondary)] flex items-center justify-center text-white font-medium hover:ring-2 hover:ring-[var(--gt-primary)] transition-all">
                {post.user?.display_name?.[0] || 'U'}
              </div>
            )}
          </Link>

          {/* Author Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/user/${post.user_id}`}
                className="font-semibold text-[color:var(--foreground)] hover:text-[color:var(--gt-primary)] transition-colors"
              >
                {post.user?.display_name || 'ユーザー'}
              </Link>
              {post.user?.username && (
                <Link
                  href={`/user/${post.user_id}`}
                  className="text-sm text-[color:var(--text-muted)] hover:text-[color:var(--gt-primary)] transition-colors"
                >
                  @{post.user.username}
                </Link>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1">
              {post.gym?.name && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-[rgba(231,103,76,0.12)] rounded-full">
                  <svg className="w-3 h-3 text-[color:var(--gt-primary-strong)]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span className="text-xs text-[color:var(--gt-primary-strong)]">{post.gym?.name}</span>
                </div>
              )}
              {post.is_verified && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                  <Shield className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-700 font-medium">GPS認証済み</span>
                </div>
              )}
              <span className="text-xs text-[color:var(--text-muted)]">
                {formatDate(post.created_at)}
              </span>
            </div>
          </div>

          {/* Dropdown Menu - 自分の投稿のみ表示 */}
          {showActions && isOwner && onEdit && onDelete && (
            <div className="relative">
              <button
                onClick={() => toggleDropdown(post.id)}
                className="p-2 rounded-full hover:bg-[rgba(254,255,250,0.92)] transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-[color:var(--text-muted)]" />
              </button>

              {activeDropdown === post.id && (
                <div className="absolute right-0 mt-2 w-48 gt-card p-0 border border-[rgba(186,122,103,0.26)] z-10">
                  <button
                    onClick={() => {
                      onEdit(post);
                      setActiveDropdown(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-[color:var(--text-subtle)] hover:bg-[rgba(254,255,250,0.96)] flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    編集
                  </button>
                  <button
                    onClick={() => {
                      onDelete(post.id);
                      setActiveDropdown(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-[color:var(--gt-primary-strong)] hover:bg-[rgba(224,112,122,0.12)] flex items-center gap-2"
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
          <p className="text-[color:var(--foreground)] whitespace-pre-wrap">{post.content}</p>
        </div>
      )}

      {/* Post Images */}
      {post.images && post.images.length > 0 && (
        <div className="mt-3">
          <div
            className={`grid gap-1 ${
              isLargeScreen
                ? post.images.length === 1
                  ? 'grid-cols-1'
                  : post.images.length === 2
                  ? 'grid-cols-2'
                  : post.images.length === 3
                  ? 'grid-cols-3'
                  : post.images.length <= 6
                  ? 'grid-cols-3'
                  : 'grid-cols-4'
                : post.images.length === 1
                ? 'grid-cols-1'
                : post.images.length === 2
                ? 'grid-cols-2'
                : post.images.length === 3
                ? 'grid-cols-3'
                : 'grid-cols-2'
            }`}
          >
            {post.images.slice(0, isLargeScreen ? post.images.length : 4).map((image, index) => (
              <div
                key={index}
                className={`relative bg-[rgba(254,255,250,0.92)] ${
                  isLargeScreen
                    ? post.images!.length === 1
                      ? 'aspect-[4/3]'
                      : 'aspect-square'
                    : post.images!.length === 1
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
                {!isLargeScreen && post.images!.length > 4 && index === 3 && (
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
        <div className="px-4 sm:px-6">
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
        <div className="px-4 sm:px-6 py-3 border-t border-[rgba(186,122,103,0.24)]">
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {/* Like Button */}
              <button
                onClick={() => onLike?.(post)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border-2 ${
                  post.is_liked
                    ? 'text-[color:var(--gt-primary-strong)] bg-[rgba(231,103,76,0.16)] hover:bg-[rgba(231,103,76,0.24)] border-[rgba(231,103,76,0.26)]'
                    : 'text-[color:var(--text-subtle)] hover:bg-[rgba(254,255,250,0.92)] border-[rgba(186,122,103,0.26)] hover:border-[rgba(231,103,76,0.32)]'
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`}
                />
                {post.likes_count > 0 && (
                  <span className="text-sm font-medium">{post.likes_count}</span>
                )}
              </button>


              {/* Story Button */}
              <button
                onClick={handleGenerateStory}
                disabled={generatingStory}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border-2 ${
                  generatingStory
                    ? 'text-[rgba(186,122,103,0.32)] bg-[rgba(254,255,250,0.92)] cursor-not-allowed border-[rgba(186,122,103,0.26)]'
                    : 'text-[color:var(--text-subtle)] hover:bg-[rgba(254,255,250,0.92)] border-[rgba(186,122,103,0.26)] hover:border-[rgba(231,103,76,0.32)]'
                }`}
              >
                {generatingStory ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[rgba(186,122,103,0.3)] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">生成中...</span>
                  </>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Share Button */}
            <button className="p-2 text-[color:var(--text-subtle)] rounded-lg hover:bg-[rgba(254,255,250,0.92)] transition-colors border-2 border-[rgba(186,122,103,0.26)] hover:border-[rgba(231,103,76,0.32)]">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
