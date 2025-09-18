'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function AuthTestPage() {
  const [authUser, setAuthUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [owners, setOwners] = useState<any>(null)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    async function checkAuth() {
      try {
        // 1. セッションを取得
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        
        // 2. ユーザーを取得
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        setAuthUser(user)
        
        if (userError) {
          setError({ userError })
          return
        }

        if (user) {
          // 3. gym_ownersを取得
          const { data: ownerData, error: ownerError } = await supabase
            .from('gym_owners')
            .select('*, gym:gyms(*)')
            .eq('user_id', user.id)
          
          if (ownerError) {
            setError({ ownerError })
          } else {
            setOwners(ownerData)
          }
        }
      } catch (err) {
        setError(err)
      }
    }

    checkAuth()
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">認証状態テスト</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">セッション:</h2>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">認証ユーザー:</h2>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(authUser, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">ジムオーナー情報:</h2>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(owners, null, 2)}
          </pre>
        </div>

        {error && (
          <div className="bg-[rgba(224,112,122,0.12)] p-4 rounded-lg">
            <h2 className="font-semibold mb-2 text-[#c85963]">エラー:</h2>
            <pre className="bg-red-100 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}