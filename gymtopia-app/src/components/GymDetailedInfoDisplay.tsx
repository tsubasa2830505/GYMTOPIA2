'use client'

import { useState, useEffect } from 'react'
import {
  DollarSign, Clock, Users, Car, BookOpen,
  Megaphone, Info, ChevronDown, ChevronUp
} from 'lucide-react'
import { getGymDetailedInfo } from '@/lib/supabase/gym-detailed-info'
import type { GymDetailedInfo } from '@/lib/supabase/gym-detailed-info'

interface GymDetailedInfoDisplayProps {
  gymId: string
}

export default function GymDetailedInfoDisplay({ gymId }: GymDetailedInfoDisplayProps) {
  const [detailedInfo, setDetailedInfo] = useState<GymDetailedInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['pricing']))

  useEffect(() => {
    loadDetailedInfo()
  }, [gymId])

  const loadDetailedInfo = async () => {
    setLoading(true)
    const info = await getGymDetailedInfo(gymId)
    setDetailedInfo(info)
    setLoading(false)
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const sections = [
    {
      id: 'pricing',
      title: '料金体系',
      icon: DollarSign,
      color: 'text-green-600 bg-green-50',
      fields: [
        { key: 'pricing_details', label: '料金詳細' },
        { key: 'membership_plans', label: '会員プラン' }
      ]
    },
    {
      id: 'hours',
      title: '営業時間',
      icon: Clock,
      color: 'text-blue-600 bg-blue-50',
      fields: [
        { key: 'business_hours_details', label: '営業時間詳細' },
        { key: 'staff_hours', label: 'スタッフ在中時間' }
      ]
    },
    {
      id: 'rules',
      title: 'ルール・規定',
      icon: BookOpen,
      color: 'text-purple-600 bg-purple-50',
      fields: [
        { key: 'rules_and_regulations', label: '利用規約・ルール' },
        { key: 'dress_code', label: '服装規定' }
      ]
    },
    {
      id: 'beginner',
      title: '初心者サポート',
      icon: Users,
      color: 'text-orange-600 bg-orange-50',
      fields: [
        { key: 'beginner_support', label: '初心者向けサポート' },
        { key: 'trial_info', label: '体験・見学' }
      ]
    },
    {
      id: 'access',
      title: 'アクセス',
      icon: Car,
      color: 'text-indigo-600 bg-indigo-50',
      fields: [
        { key: 'access_details', label: 'アクセス詳細' },
        { key: 'parking_details', label: '駐車場情報' }
      ]
    },
    {
      id: 'other',
      title: 'その他',
      icon: Info,
      color: 'text-slate-600 bg-slate-50',
      fields: [
        { key: 'special_programs', label: '特別プログラム' },
        { key: 'announcements', label: 'お知らせ' },
        { key: 'additional_info', label: 'その他情報' }
      ]
    }
  ]

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-sm text-slate-500">詳細情報を読み込み中...</p>
      </div>
    )
  }

  if (!detailedInfo) {
    return (
      <div className="bg-slate-50 rounded-xl p-6 text-center">
        <Info className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-600">詳細情報はまだ登録されていません</p>
      </div>
    )
  }

  // 情報が入力されているセクションのみ表示
  const availableSections = sections.filter(section =>
    section.fields.some(field =>
      detailedInfo[field.key as keyof GymDetailedInfo]
    )
  )

  if (availableSections.length === 0) {
    return (
      <div className="bg-slate-50 rounded-xl p-6 text-center">
        <Info className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-600">詳細情報はまだ登録されていません</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* お知らせが最優先で表示 */}
      {detailedInfo.announcements && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Megaphone className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-900 mb-2">重要なお知らせ</p>
              <p className="text-sm text-red-800 whitespace-pre-wrap">
                {detailedInfo.announcements}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 各セクション */}
      {availableSections.map((section) => {
        const hasContent = section.fields.some(field =>
          detailedInfo[field.key as keyof GymDetailedInfo]
        )

        if (!hasContent) return null

        return (
          <div key={section.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${section.color}`}>
                  <section.icon className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-slate-900">{section.title}</h3>
              </div>
              {expandedSections.has(section.id) ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {expandedSections.has(section.id) && (
              <div className="px-4 pb-4 space-y-4">
                {section.fields.map((field) => {
                  const content = detailedInfo[field.key as keyof GymDetailedInfo]
                  if (!content) return null

                  return (
                    <div key={field.key} className="border-t border-slate-100 pt-4">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        {field.label}
                      </h4>
                      <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {content}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}