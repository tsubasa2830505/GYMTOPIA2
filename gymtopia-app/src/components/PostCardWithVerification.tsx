'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, MessageCircle, Share2, MoreVertical, Shield, MapPin, AlertCircle } from 'lucide-react'
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
  const [showVerificationDetails, setShowVerificationDetails] = useState(false)

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
  }

  // 認証レベルを判定
  const getVerificationLevel = () => {
    if (!isVerified) return 'none'
    if (distanceFromGym && distanceFromGym <= 50) return 'high'
    if (distanceFromGym && distanceFromGym <= 100) return 'medium'
    return 'low'
  }

  const verificationLevel = getVerificationLevel()

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

              <div className="flex items-center gap-2 mt-1">
                <Link href={`/gyms/${gym.id}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {gym.name}
                </Link>

                {/* 認証バッジ */}
                {isVerified && (
                  <button
                    onClick={() => setShowVerificationDetails(!showVerificationDetails)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
                      verificationLevel === 'high'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : verificationLevel === 'medium'
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    位置認証済み
                  </button>
                )}

                {!isVerified && verificationMethod === 'manual' && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    未認証
                  </span>
                )}
              </div>

              {/* 認証詳細 */}
              {showVerificationDetails && isVerified && (
                <div className="mt-2 p-2 bg-gray-50 rounded-lg text-xs text-gray-600">
                  <p className="font-medium mb-1">位置認証情報</p>
                  <ul className="space-y-1">
                    <li>• チェックイン時刻: {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: ja })}</li>
                    {distanceFromGym && (
                      <li>• ジムからの距離: {Math.round(distanceFromGym)}m</li>
                    )}
                    <li>• 認証方法: GPS位置情報</li>
                    {verificationLevel === 'high' && (
                      <li className="text-green-600 font-medium">✓ 高精度認証</li>
                    )}
                  </ul>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-1">
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: ja })}
              </p>
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

      {/* 信頼性インジケーター */}
      {isVerified && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className={`w-2 h-2 rounded-full ${
              verificationLevel === 'high' ? 'bg-green-500' :
              verificationLevel === 'medium' ? 'bg-blue-500' :
              'bg-gray-400'
            }`} />
            <span>
              この投稿は{verificationLevel === 'high' ? '高精度' : verificationLevel === 'medium' ? '中精度' : '低精度'}の位置認証済みです
            </span>
          </div>
        </div>
      )}
    </div>
  )
}