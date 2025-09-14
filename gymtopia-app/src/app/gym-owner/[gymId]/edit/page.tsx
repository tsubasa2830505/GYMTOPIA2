'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Save, ArrowLeft, DollarSign, Clock, Users, Car,
  AlertCircle, BookOpen, Megaphone, Info, Loader2
} from 'lucide-react'
import { getGymDetailedInfo, saveGymDetailedInfo } from '@/lib/supabase/gym-detailed-info'
import type { GymDetailedInfo } from '@/lib/supabase/gym-detailed-info'

interface GymOwnerEditPageProps {
  params: { gymId: string }
}

export default function GymOwnerEditPage({ params }: GymOwnerEditPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<GymDetailedInfo>>({})
  const [activeSection, setActiveSection] = useState<string>('pricing')

  useEffect(() => {
    loadGymDetailedInfo()
  }, [params.gymId])

  const loadGymDetailedInfo = async () => {
    setLoading(true)
    const info = await getGymDetailedInfo(params.gymId)
    if (info) {
      setFormData(info)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const result = await saveGymDetailedInfo(params.gymId, formData)
    if (result.success) {
      // 成功通知（トーストなど）
      console.log('保存成功')
    } else {
      // エラー通知
      console.error('保存失敗:', result.error)
    }
    setSaving(false)
  }

  const sections = [
    {
      id: 'pricing',
      title: '料金体系',
      icon: DollarSign,
      fields: [
        { key: 'pricing_details', label: '料金詳細', placeholder: '例：\n月額会員：¥10,000\n学生割引：20%OFF\n法人契約：要相談\nビジター利用：¥3,000/回' },
        { key: 'membership_plans', label: '会員プラン', placeholder: '例：\nレギュラー会員：全時間利用可能\nモーニング会員：5:00-12:00のみ\nナイト会員：18:00-24:00のみ' }
      ]
    },
    {
      id: 'hours',
      title: '営業時間',
      icon: Clock,
      fields: [
        { key: 'business_hours_details', label: '営業時間詳細', placeholder: '例：\n平日：5:00-24:00\n土日祝：7:00-22:00\n年末年始：短縮営業\n※祝日は通常営業' },
        { key: 'staff_hours', label: 'スタッフ在中時間', placeholder: '例：\n平日：10:00-21:00\n土日：10:00-18:00\nパーソナルトレーナー：要予約' }
      ]
    },
    {
      id: 'rules',
      title: 'ルール・規定',
      icon: BookOpen,
      fields: [
        { key: 'rules_and_regulations', label: '利用規約・ルール', placeholder: '例：\n・大声での会話禁止\n・器具の独占禁止（30分まで）\n・使用後の消毒必須' },
        { key: 'dress_code', label: '服装規定', placeholder: '例：\n・室内シューズ必須\n・タンクトップOK\n・サンダル、裸足禁止' }
      ]
    },
    {
      id: 'beginner',
      title: '初心者サポート',
      icon: Users,
      fields: [
        { key: 'beginner_support', label: '初心者向けサポート', placeholder: '例：\n・初回オリエンテーション無料\n・マシン使い方講習あり\n・初心者専用時間帯：火木10:00-12:00' },
        { key: 'trial_info', label: '体験・見学', placeholder: '例：\n体験利用：¥1,000（当日入会で無料）\n見学：無料（要予約）\n体験可能時間：10:00-20:00' }
      ]
    },
    {
      id: 'access',
      title: 'アクセス',
      icon: Car,
      fields: [
        { key: 'access_details', label: 'アクセス詳細', placeholder: '例：\nJR新宿駅南口より徒歩5分\n1階にコンビニがある建物の3階\n※エレベーターあり' },
        { key: 'parking_details', label: '駐車場情報', placeholder: '例：\n専用駐車場：5台（無料）\n提携駐車場：○○パーキング（2時間無料）\nバイク駐輪場：あり' }
      ]
    },
    {
      id: 'other',
      title: 'その他',
      icon: Info,
      fields: [
        { key: 'special_programs', label: '特別プログラム', placeholder: '例：\n毎週土曜：パワーリフティング講習会\n第2日曜：栄養セミナー\n不定期：ゲストトレーナー来館' },
        { key: 'announcements', label: 'お知らせ', placeholder: '例：\n【重要】12/28-1/3は年末年始休業\n【NEW】新しいパワーラック導入しました' },
        { key: 'additional_info', label: 'その他情報', placeholder: 'UIで表現できない情報を自由に記載してください' }
      ]
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-slate-900">ジム詳細情報編集</h1>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  保存する
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
              <h2 className="text-sm font-bold text-slate-900 mb-3">セクション</h2>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <section.icon className="w-4 h-4" />
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Info Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">オーナー様へ</p>
                <p>
                  ここで入力した情報は、ジム詳細ページで表示されます。
                  UIでは表現しきれない詳細な情報を自由に記載してください。
                  Markdown形式にも対応予定です。
                </p>
              </div>
            </div>

            {/* Sections */}
            {sections.map((section) => (
              <div
                key={section.id}
                className={`bg-white rounded-xl shadow-sm p-6 ${
                  activeSection === section.id ? '' : 'hidden'
                }`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
                </div>

                <div className="space-y-6">
                  {section.fields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {field.label}
                      </label>
                      <textarea
                        value={(formData[field.key as keyof GymDetailedInfo] as string) || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          [field.key]: e.target.value
                        })}
                        placeholder={field.placeholder}
                        rows={8}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-700 resize-none"
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        {((formData[field.key as keyof GymDetailedInfo] as string) || '').length} 文字
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Preview Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-3">プレビュー</h3>
              <p className="text-sm text-blue-700">
                入力した内容がジム詳細ページでどのように表示されるかのプレビュー機能は開発中です。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}