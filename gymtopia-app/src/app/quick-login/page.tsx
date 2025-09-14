'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function QuickLoginPage() {
  const router = useRouter()
  const [status, setStatus] = useState('チェック中...')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAndLogin()
  }, [])

  const checkAndLogin = async () => {
    // 現在のセッションをチェック
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      setStatus('既にログインしています')
      setUser(session.user)
      setTimeout(() => {
        router.push('/admin')
      }, 1000)
    } else {
      setStatus('ログインが必要です。/auth/login へ移動します...')
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    }
  }

  const handleLogout = async () => {
    setStatus('ログアウト中...')
    await supabase.auth.signOut()
    setStatus('ログアウトしました')
    setUser(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">認証状態</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">ステータス:</p>
            <p className="font-semibold">{status}</p>
          </div>

          {user && (
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">ログインユーザー:</p>
              <p className="font-semibold">{user.email}</p>
              <p className="text-xs text-gray-500 mt-1">ID: {user.id}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/admin')}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              管理画面へ
            </button>
            
            {user && (
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                ログアウト
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-600">
            ログインが必要な場合：<br/>
            メール: tsubasa.a.283.0505@gmail.com
          </p>
        </div>
      </div>
    </div>
  )
}