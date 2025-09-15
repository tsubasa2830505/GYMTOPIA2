'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { ArrowLeft, ExternalLink, CheckCircle, Clock, XCircle } from 'lucide-react'

export default function OwnerApplicationPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [applicationStatus, setApplicationStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none')
  const [loading, setLoading] = useState(true)

  // Google Form URL - この部分は環境変数で管理することも可能
  const GOOGLE_FORM_URL = 'https://forms.google.com/your-form-url' // ここに実際のGoogle FormのURLを設定

  useEffect(() => {
    checkApplicationStatus()
  }, [])

  const checkApplicationStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      // gym_owner_applicationsテーブルから申請状態を確認
      const { data: applications } = await supabase
        .from('gym_owner_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (applications && applications.length > 0) {
        setApplicationStatus(applications[0].status)
      }

      // すでにオーナーの場合
      const { data: ownerData } = await supabase
        .from('gym_owners')
        .select('*')
        .eq('user_id', user.id)

      if (ownerData && ownerData.length > 0) {
        setApplicationStatus('approved')
      }

    } catch (error) {
      console.error('Error checking application status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleFormSubmit = async () => {
    // Google Formを新しいタブで開く
    window.open(GOOGLE_FORM_URL, '_blank')

    // 申請記録を作成
    if (user && applicationStatus === 'none') {
      try {
        await supabase
          .from('gym_owner_applications')
          .insert({
            user_id: user.id,
            gym_id: '00000000-0000-0000-0000-000000000000', // Placeholder gym ID
            contact_email: user.email || '',
            contact_phone: '', // Required field, but empty for Google Form submission
            status: 'pending',
            applied_at: new Date().toISOString()
          })

        setApplicationStatus('pending')
      } catch (error) {
        console.error('Error recording application:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          戻る
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-8">ジムオーナー申請</h1>

          {/* 申請状態に応じた表示 */}
          {applicationStatus === 'approved' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h2 className="text-xl font-semibold text-green-900">承認済み</h2>
                  <p className="text-green-700 mt-1">
                    あなたはすでにジムオーナーとして承認されています。
                  </p>
                  <button
                    onClick={() => router.push('/admin')}
                    className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    管理画面へ進む
                  </button>
                </div>
              </div>
            </div>
          )}

          {applicationStatus === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div>
                  <h2 className="text-xl font-semibold text-yellow-900">審査中</h2>
                  <p className="text-yellow-700 mt-1">
                    申請を受け付けました。審査完了まで1-3営業日お待ちください。
                  </p>
                  <p className="text-sm text-yellow-600 mt-2">
                    審査が完了しましたら、登録されたメールアドレスにご連絡いたします。
                  </p>
                </div>
              </div>
            </div>
          )}

          {applicationStatus === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-600" />
                <div>
                  <h2 className="text-xl font-semibold text-red-900">申請却下</h2>
                  <p className="text-red-700 mt-1">
                    申請が却下されました。詳細はメールをご確認ください。
                  </p>
                  <button
                    onClick={() => setApplicationStatus('none')}
                    className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    再申請する
                  </button>
                </div>
              </div>
            </div>
          )}

          {applicationStatus === 'none' && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold text-blue-900 mb-3">申請の流れ</h2>
                <ol className="list-decimal list-inside space-y-2 text-blue-800">
                  <li>下記のボタンからGoogle Formにアクセス</li>
                  <li>必要事項を入力して送信</li>
                  <li>1-3営業日以内に審査結果をメールでお知らせ</li>
                  <li>承認後、管理画面にアクセス可能になります</li>
                </ol>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold mb-3">必要な情報</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>ジム名</li>
                  <li>ジムの住所</li>
                  <li>オーナー名（担当者名）</li>
                  <li>連絡先電話番号</li>
                  <li>事業者証明書類（営業許可証など）</li>
                </ul>
              </div>

              <div className="flex flex-col items-center">
                <button
                  onClick={handleGoogleFormSubmit}
                  className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transform transition hover:scale-105"
                >
                  <ExternalLink className="w-6 h-6" />
                  Google Formで申請する
                </button>
                <p className="text-sm text-gray-500 mt-4">
                  ※ 新しいタブで開きます
                </p>
              </div>
            </>
          )}

          {user && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                申請アカウント: <span className="font-semibold">{user.email}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}