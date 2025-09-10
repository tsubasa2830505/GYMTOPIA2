'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Building2, Search, CheckCircle, AlertCircle, Send, MapPin, Phone, Mail, Globe } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getGyms } from '@/lib/supabase/gyms'
import { supabase } from '@/lib/supabase/client'

interface Gym {
  id: string
  name: string
  address: string
  prefecture: string
  city?: string
  has_owner?: boolean
}

export default function GymOwnerApplyPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [gyms, setGyms] = useState<Gym[]>([])
  const [filteredGyms, setFilteredGyms] = useState<Gym[]>([])
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // 申請フォームの状態
  const [formData, setFormData] = useState({
    businessName: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    message: '',
    documents: ''
  })

  useEffect(() => {
    loadGyms()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = gyms.filter(gym => 
        gym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gym.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gym.prefecture.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredGyms(filtered)
    } else {
      setFilteredGyms(gyms)
    }
  }, [searchQuery, gyms])

  const loadGyms = async () => {
    try {
      setLoading(true)
      const data = await getGyms()
      
      // オーナーがいるかチェック
      const gymsWithOwnerStatus = await Promise.all(
        data.map(async (gym) => {
          const { data: owners } = await supabase
            .from('gym_owners')
            .select('id')
            .eq('gym_id', gym.id)
            .limit(1)
          
          return {
            ...gym,
            has_owner: owners && owners.length > 0
          }
        })
      )
      
      setGyms(gymsWithOwnerStatus)
      setFilteredGyms(gymsWithOwnerStatus)
    } catch (error) {
      console.error('Failed to load gyms:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedGym || !user) {
      alert('ジムを選択してください')
      return
    }

    if (!formData.contactEmail || !formData.contactPhone) {
      alert('連絡先情報を入力してください')
      return
    }

    setSubmitting(true)
    try {
      // 申請情報を保存（実際のアプリでは管理者に通知）
      const { error } = await supabase
        .from('gym_owner_applications')
        .insert({
          user_id: user.id,
          gym_id: selectedGym.id,
          business_name: formData.businessName,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone,
          website: formData.website,
          message: formData.message,
          documents: formData.documents,
          status: 'pending',
          applied_at: new Date().toISOString()
        })

      if (error) throw error

      alert('申請が送信されました。審査結果をお待ちください。')
      router.push('/profile')
    } catch (error) {
      console.error('Application submission failed:', error)
      alert('申請の送信に失敗しました。もう一度お試しください。')
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-700">ログインが必要です</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            ログインページへ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5 text-slate-900" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900">ジムオーナー申請</h1>
              <p className="text-xs text-slate-600">ジムのオーナー権限を申請</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-2xl mx-auto">
        {/* ステップインジケーター */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedGym ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
              {selectedGym ? <CheckCircle className="w-5 h-5" /> : '1'}
            </div>
            <div className={`w-20 h-1 ${selectedGym ? 'bg-green-500' : 'bg-slate-300'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedGym ? 'bg-blue-500 text-white' : 'bg-slate-300 text-slate-500'}`}>
              2
            </div>
          </div>
        </div>

        {!selectedGym ? (
          <>
            {/* Step 1: ジム選択 */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                <Building2 className="inline w-5 h-5 mr-2 text-blue-500" />
                ジムを選択
              </h2>
              
              {/* 検索バー */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ジム名、住所、都道府県で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* ジムリスト */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-slate-600">読み込み中...</p>
                  </div>
                ) : filteredGyms.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600">ジムが見つかりません</p>
                  </div>
                ) : (
                  filteredGyms.map((gym) => (
                    <button
                      key={gym.id}
                      onClick={() => setSelectedGym(gym)}
                      disabled={gym.has_owner}
                      className={`w-full p-4 rounded-lg border text-left transition-all ${
                        gym.has_owner 
                          ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                          : 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{gym.name}</h3>
                          <p className="text-sm text-slate-600 mt-1">
                            <MapPin className="inline w-3 h-3 mr-1" />
                            {gym.prefecture} {gym.city} {gym.address}
                          </p>
                        </div>
                        {gym.has_owner && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                            オーナー登録済
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* 新規ジム登録案内 */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-2">ジムが見つからない場合</h3>
              <p className="text-sm text-blue-700 mb-3">
                リストにないジムのオーナー様は、新規ジム登録をお申し込みください。
              </p>
              <button className="text-sm text-blue-600 font-medium hover:underline">
                新規ジム登録はこちら →
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Step 2: 申請フォーム */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              {/* 選択したジム */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-blue-600 font-medium mb-1">選択中のジム</p>
                    <h3 className="font-bold text-slate-900">{selectedGym.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      <MapPin className="inline w-3 h-3 mr-1" />
                      {selectedGym.prefecture} {selectedGym.city} {selectedGym.address}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedGym(null)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    変更
                  </button>
                </div>
              </div>

              <h2 className="text-lg font-bold text-slate-900 mb-4">申請情報を入力</h2>
              
              {/* フォーム */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    事業者名・会社名
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                    placeholder="株式会社〇〇 / 個人事業主名"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <Mail className="inline w-4 h-4 mr-1" />
                    連絡先メールアドレス *
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    placeholder="contact@example.com"
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <Phone className="inline w-4 h-4 mr-1" />
                    電話番号 *
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                    placeholder="090-1234-5678"
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <Globe className="inline w-4 h-4 mr-1" />
                    ウェブサイト
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    メッセージ
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="オーナー権限が必要な理由、ジムとの関係性など"
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    証明書類・備考
                  </label>
                  <textarea
                    value={formData.documents}
                    onChange={(e) => setFormData({...formData, documents: e.target.value})}
                    placeholder="営業許可証番号、法人番号など（任意）"
                    rows={2}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* 注意事項 */}
            <div className="bg-yellow-50 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-yellow-900 mb-2">
                <AlertCircle className="inline w-5 h-5 mr-2" />
                ご注意事項
              </h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• 申請内容を審査させていただきます（通常3-5営業日）</li>
                <li>• 虚偽の申請は利用規約違反となります</li>
                <li>• 承認後、ジム情報の編集が可能になります</li>
                <li>• レビューへの返信機能が利用可能になります</li>
              </ul>
            </div>

            {/* 送信ボタン */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  送信中...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  申請を送信
                </>
              )}
            </button>
          </>
        )}
      </main>
    </div>
  )
}