'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, MessageCircle, Share2, MoreVertical, CheckCircle2, MapPin } from 'lucide-react'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface PostProps {
  id: string
  user: {
    id: string
    username: string
    displayName: string
    avatarUrl?: string
  }
  gym: {
    id: string
    name: string
    address?: string
  }
  content: string
  images?: string[]
  likes: number
  comments: number
  createdAt: string
  isLiked?: boolean
  isVerified?: boolean // 位置認証済みかどうか
  checkInId?: string | null
  verificationMethod?: 'check_in' | 'manual' | null
  distanceFromGym?: number | null // チェックイン時の距離
}

export default function PostCardWithVerification({
  id,
  user,
  gym,
  content,
  images,
  likes,
  comments,
  createdAt,
  isLiked = false,
  isVerified = false,
  checkInId,
  verificationMethod,
  distanceFromGym
}: PostProps) {
  const [liked, setLiked] = useState(isLiked)
  const [likeCount, setLikeCount] = useState(likes)

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* ヘッダー */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <Link href={`/user/${user.id}`}>
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.displayName}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user.displayName[0]}
                </div>
              )}
            </Link>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Link href={`/user/${user.id}`} className="font-bold text-gray-900 hover:underline">
                  {user.displayName}
                </Link>
                <span className="text-gray-500">@{user.username}</span>
              </div>

              <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-600">
                <Link href={`/gyms/${gym.id}`} className="hover:text-blue-600 hover:underline flex items-center gap-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{gym.name}</span>
                </Link>

                {isVerified && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center gap-0.5 text-blue-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="text-xs">GPS認証</span>
                    </span>
                  </>
                )}

                <span className="text-gray-400">•</span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: ja })}
                </span>
              </div>
            </div>
          </div>

          <button className="p-1 hover:bg-gray-100 rounded-full">
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="px-4 pb-3">
        <p className="text-gray-900 whitespace-pre-wrap">{content}</p>
      </div>

      {/* 画像 */}
      {images && images.length > 0 && (
        <div className="relative aspect-video bg-gray-100">
          <Image
            src={images[0]}
            alt="投稿画像"
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* アクションバー */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
              liked
                ? 'bg-red-50 text-red-600'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Heart
              className={`w-5 h-5 ${liked ? 'fill-current' : ''}`}
            />
            <span className="text-sm font-medium">{likeCount}</span>
          </button>

          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 text-gray-600">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{comments}</span>
          </button>

          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 text-gray-600">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

    </div>
  )
}