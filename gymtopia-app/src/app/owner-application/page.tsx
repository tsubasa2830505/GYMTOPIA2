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
      <div className="min-h-screen bg-[rgba(254,255,250,0.96)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[color:var(--gt-primary)] border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[rgba(254,255,250,0.96)] py-8">
      <div className="max-w-3xl mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[color:var(--text-subtle)] hover:text-[color:var(--foreground)] mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          戻る
        </button>

        <div className="gt-card p-8">
          <h1 className="text-3xl font-bold mb-8">ジムオーナー申請</h1>

          {/* 申請状態に応じた表示 */}
          {applicationStatus === 'approved' && (
            <div className="bg-[rgba(31,143,106,0.12)] border border-[rgba(31,143,106,0.25)] rounded-lg p-6 mb-8">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-[var(--gt-secondary-strong)]" />
                <div>
                  <h2 className="text-xl font-semibold text-[var(--gt-secondary-strong)]">承認済み</h2>
                  <p className="text-[var(--gt-secondary-strong)] mt-1">
                    あなたはすでにジムオーナーとして承認されています。
                  </p>
                  <button
                    onClick={() => router.push('/admin')}
                    className="mt-4 px-6 py-2 bg-[var(--gt-secondary-strong)] text-white rounded-lg hover:bg-[var(--gt-secondary-strong)]"
                  >
                    管理画面へ進む
                  </button>
                </div>
              </div>
            </div>
          )}

          {applicationStatus === 'pending' && (
            <div className="bg-[rgba(242,178,74,0.12)] border border-[rgba(242,178,74,0.3)] rounded-lg p-6 mb-8">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-[color:var(--gt-tertiary-strong)]" />
                <div>
                  <h2 className="text-xl font-semibold text-[color:var(--gt-tertiary-strong)]">審査中</h2>
                  <p className="text-[color:var(--gt-tertiary-strong)] mt-1">
                    申請を受け付けました。審査完了まで1-3営業日お待ちください。
                  </p>
                  <p className="text-sm text-[color:var(--gt-tertiary-strong)] mt-2">
                    審査が完了しましたら、登録されたメールアドレスにご連絡いたします。
                  </p>
                </div>
              </div>
            </div>
          )}

          {applicationStatus === 'rejected' && (
            <div className="bg-[rgba(224,112,122,0.12)] border border-[rgba(224,112,122,0.3)] rounded-lg p-6 mb-8">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-[color:var(--gt-primary-strong)]" />
                <div>
                  <h2 className="text-xl font-semibold text-[color:var(--gt-primary-strong)]">申請却下</h2>
                  <p className="text-[color:var(--gt-primary-strong)] mt-1">
                    申請が却下されました。詳細はメールをご確認ください。
                  </p>
                  <button
                    onClick={() => setApplicationStatus('none')}
                    className="mt-4 px-6 py-2 bg-[color:var(--gt-primary-strong)] text-white rounded-lg hover:bg-[color:var(--gt-primary-strong)]"
                  >
                    再申請する
                  </button>
                </div>
              </div>
            </div>
          )}

          {applicationStatus === 'none' && (
            <>
              <div className="bg-[rgba(231,103,76,0.12)] border border-[rgba(231,103,76,0.22)] rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold text-[color:var(--gt-primary-strong)] mb-3">申請の流れ</h2>
                <ol className="list-decimal list-inside space-y-2 text-[color:var(--gt-primary-strong)]">
                  <li>下記のボタンからGoogle Formにアクセス</li>
                  <li>必要事項を入力して送信</li>
                  <li>1-3営業日以内に審査結果をメールでお知らせ</li>
                  <li>承認後、管理画面にアクセス可能になります</li>
                </ol>
              </div>

              <div className="bg-[rgba(254,255,250,0.96)] rounded-lg p-6 mb-8">
                <h3 className="font-semibold mb-3">必要な情報</h3>
                <ul className="list-disc list-inside space-y-1 text-[color:var(--text-subtle)]">
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
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white shadow-[0_14px_34px_-22px_rgba(189,101,78,0.46)] text-lg font-semibold rounded-lg hover:from-[var(--gt-primary-strong)] hover:to-[var(--gt-tertiary)] transform transition hover:scale-105"
                >
                  <ExternalLink className="w-6 h-6" />
                  Google Formで申請する
                </button>
                <p className="text-sm text-[color:var(--text-muted)] mt-4">
                  ※ 新しいタブで開きます
                </p>
              </div>
            </>
          )}

          {user && (
            <div className="mt-12 pt-8 border-t border-[rgba(186,122,103,0.26)]">
              <p className="text-sm text-[color:var(--text-subtle)]">
                申請アカウント: <span className="font-semibold">{user.email}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}