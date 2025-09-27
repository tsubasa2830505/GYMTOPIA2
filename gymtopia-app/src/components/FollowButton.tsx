'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { sendFollowRequest, checkIsPrivateUser } from '@/lib/supabase/follow-requests'

interface FollowButtonProps {
  targetUserId: string
  className?: string
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}

export default function FollowButton({
  targetUserId,
  className = '',
  variant = 'primary',
  size = 'md'
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [isPrivateUser, setIsPrivateUser] = useState(false)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    checkFollowStatus()
  }, [targetUserId])

  const checkFollowStatus = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.id === targetUserId) {
        setLoading(false)
        return
      }

      // ユーザーが非公開アカウントかチェック
      const isPrivate = await checkIsPrivateUser(targetUserId)
      setIsPrivateUser(isPrivate)

      // 既存のフォロー状態をチェック
      const { data: followData } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single()

      setIsFollowing(!!followData)

      // 非公開アカウントの場合、保留中のリクエストをチェック
      if (isPrivate && !followData) {
        const { data: requestData } = await supabase
          .from('follow_requests')
          .select('id, status')
          .eq('requester_id', user.id)
          .eq('target_user_id', targetUserId)
          .eq('status', 'pending')
          .single()

        setIsPending(!!requestData)
      }
    } catch (error) {
      console.error('フォロー状態チェックエラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollowToggle = async () => {
    setProcessing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('ログインが必要です')
        return
      }

      if (isFollowing) {
        // フォロー解除
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId)

        if (error) throw error
        setIsFollowing(false)
      } else if (isPrivateUser) {
        // 非公開アカウントの場合、フォローリクエストを送信
        const result = await sendFollowRequest(targetUserId)
        if (result.success) {
          setIsPending(true)
        } else {
          alert(result.error || 'リクエストの送信に失敗しました')
        }
      } else {
        // 公開アカウントの場合、直接フォロー
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId
          })

        if (error && error.code !== '23505') { // 重複エラー以外
          throw error
        }
        setIsFollowing(true)
      }
    } catch (error) {
      console.error('フォロー操作エラー:', error)
      alert('操作に失敗しました')
    } finally {
      setProcessing(false)
    }
  }

  // 自分自身のプロフィールの場合は何も表示しない
  const { data: currentUser } = supabase.auth.getUser()
  if (currentUser?.user?.id === targetUserId) {
    return null
  }

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }

  const baseClasses = `font-medium rounded-lg transition-all duration-200 ${sizeClasses[size]} ${className}`

  if (loading) {
    return (
      <button
        disabled
        className={`${baseClasses} bg-gray-100 text-gray-400 cursor-not-allowed`}
      >
        <span className="animate-pulse">...</span>
      </button>
    )
  }

  if (isPending) {
    return (
      <button
        disabled
        className={`${baseClasses} bg-gray-100 text-gray-500 cursor-default border border-gray-300`}
      >
        リクエスト済み
      </button>
    )
  }

  if (isFollowing) {
    return (
      <button
        onClick={handleFollowToggle}
        disabled={processing}
        className={`${baseClasses} ${
          variant === 'primary'
            ? 'bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 border border-gray-300 hover:border-red-300'
            : 'bg-transparent hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-300 hover:border-red-300'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {processing ? '処理中...' : 'フォロー中'}
      </button>
    )
  }

  return (
    <button
      onClick={handleFollowToggle}
      disabled={processing}
      className={`${baseClasses} ${
        variant === 'primary'
          ? 'bg-blue-500 hover:bg-blue-600 text-white'
          : 'bg-transparent hover:bg-blue-50 text-blue-600 border border-blue-500'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {processing ? '処理中...' : (isPrivateUser ? 'フォローリクエスト' : 'フォロー')}
    </button>
  )
}