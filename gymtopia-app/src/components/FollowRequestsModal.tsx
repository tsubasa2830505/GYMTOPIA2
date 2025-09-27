'use client'

import { useState, useEffect } from 'react'
import { X, Check, UserPlus } from 'lucide-react'
import Image from 'next/image'
import {
  getReceivedFollowRequests,
  getSentFollowRequests,
  approveFollowRequest,
  rejectFollowRequest,
  cancelFollowRequest,
  FollowRequest
} from '@/lib/supabase/follow-requests'

interface FollowRequestsModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'received' | 'sent'
}

export default function FollowRequestsModal({ isOpen, onClose, mode }: FollowRequestsModalProps) {
  const [requests, setRequests] = useState<FollowRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isOpen) {
      loadRequests()
    }
  }, [isOpen, mode])

  const loadRequests = async () => {
    setLoading(true)
    try {
      const data = mode === 'received'
        ? await getReceivedFollowRequests()
        : await getSentFollowRequests()
      setRequests(data)
    } catch (error) {
      console.error('リクエスト取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    setProcessingIds(prev => new Set(prev).add(requestId))
    const result = await approveFollowRequest(requestId)

    if (result.success) {
      setRequests(prev => prev.filter(r => r.id !== requestId))
    } else {
      alert(result.error || '承認に失敗しました')
    }
    setProcessingIds(prev => {
      const newSet = new Set(prev)
      newSet.delete(requestId)
      return newSet
    })
  }

  const handleReject = async (requestId: string) => {
    setProcessingIds(prev => new Set(prev).add(requestId))
    const result = await rejectFollowRequest(requestId)

    if (result.success) {
      setRequests(prev => prev.filter(r => r.id !== requestId))
    } else {
      alert(result.error || '拒否に失敗しました')
    }
    setProcessingIds(prev => {
      const newSet = new Set(prev)
      newSet.delete(requestId)
      return newSet
    })
  }

  const handleCancel = async (requestId: string) => {
    setProcessingIds(prev => new Set(prev).add(requestId))
    const result = await cancelFollowRequest(requestId)

    if (result.success) {
      setRequests(prev => prev.filter(r => r.id !== requestId))
    } else {
      alert(result.error || 'キャンセルに失敗しました')
    }
    setProcessingIds(prev => {
      const newSet = new Set(prev)
      newSet.delete(requestId)
      return newSet
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {mode === 'received' ? 'フォローリクエスト' : '送信済みリクエスト'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-4rem)]">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>
                {mode === 'received'
                  ? '新しいフォローリクエストはありません'
                  : '送信中のリクエストはありません'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {requests.map((request) => {
                const user = mode === 'received' ? request.requester : request.target_user
                const isProcessing = processingIds.has(request.id)

                return (
                  <div key={request.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-12 h-12">
                        {user?.avatar_url ? (
                          <Image
                            src={user.avatar_url}
                            alt={user.display_name || user.username || ''}
                            fill
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-gray-500 text-sm">
                              {(user?.display_name || user?.username || '?')[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {user?.display_name || user?.username || '不明なユーザー'}
                        </p>
                        {user?.username && (
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {mode === 'received' ? (
                        <>
                          <button
                            onClick={() => handleApprove(request.id)}
                            disabled={isProcessing}
                            className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            {isProcessing ? '処理中...' : '承認'}
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            disabled={isProcessing}
                            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            {isProcessing ? '処理中...' : '拒否'}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleCancel(request.id)}
                          disabled={isProcessing}
                          className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          {isProcessing ? '処理中...' : 'キャンセル'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}