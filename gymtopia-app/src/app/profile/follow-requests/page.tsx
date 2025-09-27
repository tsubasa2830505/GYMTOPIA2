'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, UserPlus, Users, Clock } from 'lucide-react'
import FollowRequestsModal from '@/components/FollowRequestsModal'
import {
  getReceivedFollowRequests,
  getSentFollowRequests,
  FollowRequest
} from '@/lib/supabase/follow-requests'

export default function FollowRequestsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')
  const [receivedRequests, setReceivedRequests] = useState<FollowRequest[]>([])
  const [sentRequests, setSentRequests] = useState<FollowRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    setLoading(true)
    try {
      const [received, sent] = await Promise.all([
        getReceivedFollowRequests(),
        getSentFollowRequests()
      ])
      setReceivedRequests(received)
      setSentRequests(sent)
    } catch (error) {
      console.error('リクエスト取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold">フォローリクエスト</h1>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('received')}
              className={`py-3 px-1 border-b-2 font-medium transition ${
                activeTab === 'received'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              受信中 ({receivedRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`py-3 px-1 border-b-2 font-medium transition ${
                activeTab === 'sent'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              送信済み ({sentRequests.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm">
            {activeTab === 'received' ? (
              receivedRequests.length === 0 ? (
                <div className="p-12 text-center">
                  <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500">新しいフォローリクエストはありません</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {receivedRequests.map((request) => (
                    <RequestItem
                      key={request.id}
                      request={request}
                      type="received"
                      onUpdate={loadRequests}
                    />
                  ))}
                </div>
              )
            ) : sentRequests.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500">送信中のリクエストはありません</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {sentRequests.map((request) => (
                  <RequestItem
                    key={request.id}
                    request={request}
                    type="sent"
                    onUpdate={loadRequests}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

import Image from 'next/image'
import {
  approveFollowRequest,
  rejectFollowRequest,
  cancelFollowRequest
} from '@/lib/supabase/follow-requests'

interface RequestItemProps {
  request: FollowRequest
  type: 'received' | 'sent'
  onUpdate: () => void
}

function RequestItem({ request, type, onUpdate }: RequestItemProps) {
  const [processing, setProcessing] = useState(false)
  const user = type === 'received' ? request.requester : request.target_user

  const handleApprove = async () => {
    setProcessing(true)
    const result = await approveFollowRequest(request.id)
    if (result.success) {
      onUpdate()
    } else {
      alert(result.error || '承認に失敗しました')
    }
    setProcessing(false)
  }

  const handleReject = async () => {
    setProcessing(true)
    const result = await rejectFollowRequest(request.id)
    if (result.success) {
      onUpdate()
    } else {
      alert(result.error || '拒否に失敗しました')
    }
    setProcessing(false)
  }

  const handleCancel = async () => {
    setProcessing(true)
    const result = await cancelFollowRequest(request.id)
    if (result.success) {
      onUpdate()
    } else {
      alert(result.error || 'キャンセルに失敗しました')
    }
    setProcessing(false)
  }

  return (
    <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
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
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
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
        {type === 'received' ? (
          <>
            <button
              onClick={handleApprove}
              disabled={processing}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
            >
              {processing ? '処理中...' : '承認'}
            </button>
            <button
              onClick={handleReject}
              disabled={processing}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
            >
              {processing ? '処理中...' : '拒否'}
            </button>
          </>
        ) : (
          <button
            onClick={handleCancel}
            disabled={processing}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
          >
            {processing ? '処理中...' : 'キャンセル'}
          </button>
        )}
      </div>
    </div>
  )
}