'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Save, ArrowLeft, DollarSign, Clock, Users, Car,
  AlertCircle, BookOpen, Megaphone, Info, Loader2
} from 'lucide-react'
import {
  getGymDetailedInfoForOwner,
  upsertGymDetailedInfo,
  createInitialGymDetailedInfo
} from '@/lib/supabase/gym-detailed-info'
import type { GymDetailedInfo } from '@/lib/supabase/gym-detailed-info'
import { supabase } from '@/lib/supabase/client'
import PricingSection from '@/components/GymOwnerForm/PricingSection'
import OperatingHoursSection from '@/components/GymOwnerForm/OperatingHoursSection'
import RulesSection from '@/components/GymOwnerForm/RulesSection'
import BeginnerSupportSection from '@/components/GymOwnerForm/BeginnerSupportSection'
import AccessInfoSection from '@/components/GymOwnerForm/AccessInfoSection'
import OtherInfoSection from '@/components/GymOwnerForm/OtherInfoSection'

interface GymOwnerEditPageProps {
  params: Promise<{ gymId: string }>
}

export default async function GymOwnerEditPage({ params }: GymOwnerEditPageProps) {
  const resolvedParams = await params;
  return <GymOwnerEditContent gymId={resolvedParams.gymId} />
}

function GymOwnerEditContent({ gymId }: { gymId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<GymDetailedInfo>>({})
  const [activeSection, setActiveSection] = useState<string>('pricing')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadUserAndGymInfo()
  }, [gymId])

  const loadUserAndGymInfo = async () => {
    setLoading(true)

    // ユーザー情報を取得
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    setUser(user)

    // ジム詳細情報を取得
    let info = await getGymDetailedInfoForOwner(gymId, user.id)
    if (!info) {
      // 初期データを作成
      info = await createInitialGymDetailedInfo(gymId, user.id)
    }

    if (info) {
      setFormData(info)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      const result = await upsertGymDetailedInfo(gymId, formData, user.id)
      if (result) {
        console.log('保存成功')
        // 成功通知を表示
      } else {
        console.error('保存失敗')
        // エラー通知を表示
      }
    } catch (error) {
      console.error('保存エラー:', error)
    }
    setSaving(false)
  }

  const updateFormSection = (section: string, sectionData: any) => {
    setFormData({
      ...formData,
      [section]: sectionData
    })
  }

  const sections = [
    {
      id: 'pricing',
      title: '料金体系',
      icon: DollarSign
    },
    {
      id: 'hours',
      title: '営業時間',
      icon: Clock
    },
    {
      id: 'rules',
      title: 'ルール・規定',
      icon: BookOpen
    },
    {
      id: 'beginner',
      title: '初心者サポート',
      icon: Users
    },
    {
      id: 'access',
      title: 'アクセス',
      icon: Car
    },
    {
      id: 'other',
      title: 'その他',
      icon: Info
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgba(254,255,250,0.97)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[color:var(--gt-secondary-strong)] mx-auto mb-4" />
          <p className="text-[color:var(--text-muted)]">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[rgba(254,255,250,0.97)]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-[rgba(254,255,250,0.95)] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-[color:var(--foreground)]">ジム詳細情報編集</h1>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-[color:var(--gt-primary)] text-white rounded-lg font-medium hover:bg-[color:var(--gt-primary-strong)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
              <h2 className="text-sm font-bold text-[color:var(--foreground)] mb-3">セクション</h2>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? 'bg-[rgba(231,103,76,0.08)] text-[color:var(--gt-secondary-strong)]'
                        : 'text-[color:var(--text-muted)] hover:bg-[rgba(254,255,250,0.98)]'
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
            <div className="bg-[rgba(245,177,143,0.12)] border border-[rgba(231,103,76,0.24)] rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-[color:var(--gt-tertiary-strong)] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-[color:var(--gt-tertiary-strong)]">
                <p className="font-semibold mb-1">オーナー様へ</p>
                <p>
                  ここで入力した情報は、ジム詳細ページで表示されます。
                  UIでは表現しきれない詳細な情報を自由に記載してください。
                  Markdown形式にも対応予定です。
                </p>
              </div>
            </div>

            {/* Sections */}
            {activeSection === 'pricing' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[rgba(240,142,111,0.14)] rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-[color:var(--gt-secondary-strong)]" />
                  </div>
                  <h2 className="text-lg font-bold text-[color:var(--foreground)]">料金体系</h2>
                </div>
                <PricingSection
                  data={formData.pricing_system || {}}
                  onChange={(data) => updateFormSection('pricing_system', data)}
                />
              </div>
            )}

            {activeSection === 'hours' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[rgba(240,142,111,0.14)] rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[color:var(--gt-secondary-strong)]" />
                  </div>
                  <h2 className="text-lg font-bold text-[color:var(--foreground)]">営業時間</h2>
                </div>
                <OperatingHoursSection
                  data={formData.operating_hours || {}}
                  onChange={(data) => updateFormSection('operating_hours', data)}
                />
              </div>
            )}

            {activeSection === 'rules' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[rgba(240,142,111,0.14)] rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[color:var(--gt-secondary-strong)]" />
                  </div>
                  <h2 className="text-lg font-bold text-[color:var(--foreground)]">ルール・規定</h2>
                </div>
                <RulesSection
                  data={formData.rules_and_policies || {}}
                  onChange={(data) => updateFormSection('rules_and_policies', data)}
                />
              </div>
            )}

            {activeSection === 'beginner' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[rgba(240,142,111,0.14)] rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-[color:var(--gt-secondary-strong)]" />
                  </div>
                  <h2 className="text-lg font-bold text-[color:var(--foreground)]">初心者サポート</h2>
                </div>
                <BeginnerSupportSection
                  data={formData.beginner_support || {}}
                  onChange={(data) => updateFormSection('beginner_support', data)}
                />
              </div>
            )}

            {activeSection === 'access' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[rgba(240,142,111,0.14)] rounded-lg flex items-center justify-center">
                    <Car className="w-5 h-5 text-[color:var(--gt-secondary-strong)]" />
                  </div>
                  <h2 className="text-lg font-bold text-[color:var(--foreground)]">アクセス</h2>
                </div>
                <AccessInfoSection
                  data={formData.access_information || {}}
                  onChange={(data) => updateFormSection('access_information', data)}
                />
              </div>
            )}

            {activeSection === 'other' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[rgba(240,142,111,0.14)] rounded-lg flex items-center justify-center">
                    <Info className="w-5 h-5 text-[color:var(--gt-secondary-strong)]" />
                  </div>
                  <h2 className="text-lg font-bold text-[color:var(--foreground)]">その他</h2>
                </div>
                <OtherInfoSection
                  data={formData.other_information || {}}
                  onChange={(data) => updateFormSection('other_information', data)}
                />
              </div>
            )}

            {/* Preview Section */}
            <div className="bg-[rgba(231,103,76,0.08)] border border-[rgba(231,103,76,0.22)] rounded-xl p-6">
              <h3 className="text-lg font-bold text-[color:var(--gt-primary-strong)] mb-3">プレビュー</h3>
              <p className="text-sm text-[color:var(--gt-secondary-strong)]">
                入力した内容がジム詳細ページでどのように表示されるかのプレビュー機能は開発中です。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}