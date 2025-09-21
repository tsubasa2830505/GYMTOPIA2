'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Save, LogOut, MapPin, Lock, Eye, EyeOff, Plus, Trash2, Dumbbell } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import BasicInfoSection from './components/BasicInfoSection'
import type { ProfileEditState, PersonalRecord } from './types'

function ProfileEditContent() {
  const router = useRouter()
  const { user, mockSignOut } = useAuth()

  const [state, setState] = useState<ProfileEditState>({
    // Basic Info
    name: 'Tsubasaあ',
    username: 'tsubasa_gym',
    bio: '週4でジムに通っています💪 ベンチプレス100kg目標！',
    avatarUrl: '',
    previewImage: null,
    isLoading: false,
    uploadedFile: null,
    dataLoaded: false,

    // Home Gym Settings
    primaryGymId: 'ecef0d28-c740-4833-b15e-48703108196c',
    primaryGymName: 'ゴールドジム渋谷',
    gymSearchQuery: 'ゴールドジム渋谷',
    gymSearchResults: [],
    isSearchingGym: false,

    // Privacy Settings
    gymActivityPrivate: false,
    showStatsPublic: true,
    showAchievementsPublic: true,
    showFavoriteGymsPublic: true,

    // Personal Records
    personalRecords: [
      { id: '1', exercise: 'ベンチプレス', weight: '120', reps: '1回' },
      { id: '2', exercise: 'スクワット', weight: '130', reps: '5回×3セット' }
    ],
    currentRecord: { id: '', exercise: '', weight: '', reps: '' },
    showAddRecord: false
  })

  const updateState = (updates: Partial<ProfileEditState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  const handleSave = async () => {
    updateState({ isLoading: true })
    try {
      // Save logic here
      alert('プロフィールを保存しました')
      router.push('/profile?refresh=true')
    } catch (error) {
      alert('保存に失敗しました')
    } finally {
      updateState({ isLoading: false })
    }
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const previewUrl = URL.createObjectURL(file)
      updateState({
        uploadedFile: file,
        previewImage: previewUrl
      })
    }
  }

  const handleLogout = () => {
    if (mockSignOut) {
      mockSignOut()
    }
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-[rgba(254,255,250,0.95)]">
      {/* Header */}
      <div className="bg-white border-b border-[rgba(186,122,103,0.26)] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-[rgba(254,255,250,0.8)] rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5m7-7l-7 7 7 7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-[color:var(--foreground)]">
                プロフィール編集
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                ログアウト
              </button>
              <button
                onClick={handleSave}
                disabled={state.isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--gt-primary)] text-white rounded-lg hover:bg-[var(--gt-primary-strong)] transition-colors text-sm font-medium"
              >
                <Save className="w-4 h-4" />
                {state.isLoading ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Basic Info */}
        <BasicInfoSection
          name={state.name}
          username={state.username}
          bio={state.bio}
          avatarUrl={state.avatarUrl}
          previewImage={state.previewImage}
          onNameChange={(value) => updateState({ name: value })}
          onUsernameChange={(value) => updateState({ username: value })}
          onBioChange={(value) => updateState({ bio: value })}
          onImageSelect={handleImageSelect}
          onImageRemove={() => updateState({ previewImage: null, uploadedFile: null })}
        />

        {/* Home Gym Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(231,103,76,0.16)]">
          <h3 className="text-lg font-bold text-[color:var(--foreground)] mb-6">マイジム設定</h3>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[color:var(--foreground)] mb-2">
                <MapPin className="w-4 h-4" />
                メインジム
              </label>
              <div className="flex items-center gap-2 p-3 bg-[rgba(254,255,250,0.8)] border border-[rgba(231,103,76,0.16)] rounded-lg">
                <MapPin className="w-4 h-4 text-[var(--gt-primary)]" />
                <span className="text-[color:var(--foreground)]">{state.primaryGymName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(231,103,76,0.16)]">
          <h3 className="text-lg font-bold text-[color:var(--foreground)] mb-6">プライバシー設定</h3>
          <div className="space-y-4">
            {[
              { key: 'showStatsPublic', label: '統計情報を公開', icon: <Eye className="w-4 h-4" /> },
              { key: 'showAchievementsPublic', label: '達成記録を公開', icon: <Eye className="w-4 h-4" /> },
              { key: 'showFavoriteGymsPublic', label: 'お気に入りジムを公開', icon: <Eye className="w-4 h-4" /> }
            ].map(({ key, label, icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {icon}
                  <span className="text-sm text-[color:var(--foreground)]">{label}</span>
                </div>
                <input
                  type="checkbox"
                  checked={state[key as keyof ProfileEditState] as boolean}
                  onChange={(e) => updateState({ [key]: e.target.checked })}
                  className="rounded border-gray-300 text-[var(--gt-primary)] focus:ring-[var(--gt-primary)]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Personal Records */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(231,103,76,0.16)]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[color:var(--foreground)]">パーソナルレコード</h3>
            <button
              onClick={() => updateState({ showAddRecord: true })}
              className="flex items-center gap-2 px-3 py-2 bg-[var(--gt-primary)] text-white rounded-lg hover:bg-[var(--gt-primary-strong)] transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              追加
            </button>
          </div>

          <div className="space-y-3">
            {state.personalRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-[rgba(254,255,250,0.8)] border border-[rgba(231,103,76,0.16)] rounded-lg">
                <div className="flex items-center gap-3">
                  <Dumbbell className="w-4 h-4 text-[var(--gt-primary)]" />
                  <div>
                    <div className="font-medium text-[color:var(--foreground)]">{record.exercise}</div>
                    <div className="text-sm text-[color:var(--text-muted)]">{record.weight}kg × {record.reps}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const newRecords = state.personalRecords.filter(r => r.id !== record.id)
                    updateState({ personalRecords: newRecords })
                  }}
                  className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfileEditPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--gt-primary)] mx-auto mb-4"></div>
          <p className="text-[color:var(--text-muted)]">読み込み中...</p>
        </div>
      </div>
    }>
      <ProfileEditContent />
    </Suspense>
  )
}