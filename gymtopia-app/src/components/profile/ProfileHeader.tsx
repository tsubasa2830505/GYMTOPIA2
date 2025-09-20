'use client';

import Image from 'next/image';
import { UserProfileStats } from '@/lib/types/profile';
import { logger } from '@/lib/utils/logger';

interface ProfileHeaderProps {
  stats: UserProfileStats | null;
  gymNames: Map<string, string>;
  onEditClick: () => void;
}

export default function ProfileHeader({ stats, gymNames, onEditClick }: ProfileHeaderProps) {
  if (!stats) return null;

  return (
    <div className="relative">
      {/* カバー画像 */}
      <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

      {/* プロフィール情報 */}
      <div className="relative px-4 pb-4">
        <div className="flex items-end -mt-12 mb-4">
          <div className="relative">
            <Image
              src={stats.avatar_url || '/default-avatar.png'}
              alt={stats.display_name}
              width={96}
              height={96}
              className="rounded-full border-4 border-white bg-white"
            />
          </div>

          <div className="ml-4 flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {stats.display_name}
            </h1>
            {stats.username && (
              <p className="text-gray-500">@{stats.username}</p>
            )}
          </div>

          <button
            onClick={onEditClick}
            className="px-4 py-2 text-sm font-semibold text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            編集
          </button>
        </div>

        {/* 自己紹介 */}
        {stats.bio && (
          <p className="text-gray-700 mb-4">{stats.bio}</p>
        )}

        {/* マイジム表示 */}
        {stats.primary_gym_id && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-600">マイジム:</span>
            <span className="text-sm font-semibold text-blue-600">
              {gymNames.get(stats.primary_gym_id) || 'ジム名取得中...'}
            </span>
          </div>
        )}

        {/* 統計情報 */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.posts_count}
            </p>
            <p className="text-sm text-gray-500">投稿</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.followers_count}
            </p>
            <p className="text-sm text-gray-500">フォロワー</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.following_count}
            </p>
            <p className="text-sm text-gray-500">フォロー中</p>
          </div>
        </div>
      </div>
    </div>
  );
}