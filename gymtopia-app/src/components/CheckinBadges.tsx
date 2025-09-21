'use client'

import { useState, useEffect } from 'react'
import { Award, MapPin, Star, Crown, Gem, Target, Calendar, TrendingUp } from 'lucide-react'
import { getUserBadges, getUserCheckinHistory } from '@/lib/supabase/checkin'

interface Badge {
  id: string
  badge_type: string
  badge_name: string
  badge_description: string
  badge_icon: string
  earned_at: string
  metadata?: any
}

interface CheckinRecord {
  id: string
  checked_in_at: string
  distance_to_gym: number
  location_verified: boolean
  gyms: {
    id: string
    name: string
    address: string
    latitude: number
    longitude: number
  }
  gym_rarities?: {
    rarity_level: 'common' | 'rare' | 'legendary' | 'mythical'
    rarity_tags: string[]
  }
}

interface CheckinBadgesProps {
  userId: string
}

export default function CheckinBadges({ userId }: CheckinBadgesProps) {
  const [badges, setBadges] = useState<Badge[]>([])
  const [checkinHistory, setCheckinHistory] = useState<CheckinRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'badges' | 'map' | 'stats'>('badges')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [badgesResult, historyResult] = await Promise.all([
          getUserBadges(userId),
          getUserCheckinHistory(userId, 50)
        ])

        if (badgesResult.data) setBadges(badgesResult.data)
        if (historyResult.data) setCheckinHistory(historyResult.data)
      } catch (error) {
        console.error('Error loading checkin data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [userId])

  // バッジをカテゴリごとに分類
  const categorizedBadges = {
    milestone: badges.filter(b => b.badge_type.includes('milestone') || b.badge_type.includes('checkin')),
    rarity: badges.filter(b => b.badge_type.includes('gym') && (b.badge_type.includes('legendary') || b.badge_type.includes('mythical'))),
    exploration: badges.filter(b => b.badge_type.includes('explorer')),
    other: badges.filter(b =>
      !b.badge_type.includes('milestone') &&
      !b.badge_type.includes('checkin') &&
      !b.badge_type.includes('gym') &&
      !b.badge_type.includes('explorer')
    )
  }

  // 統計情報を計算
  const stats = {
    totalCheckins: checkinHistory.length,
    verifiedCheckins: checkinHistory.filter(c => c.location_verified).length,
    uniqueGyms: new Set(checkinHistory.map(c => c.gyms.id)).size,
    rareGyms: checkinHistory.filter(c =>
      c.gym_rarities && ['rare', 'legendary', 'mythical'].includes(c.gym_rarities.rarity_level)
    ).length,
    averageDistance: checkinHistory.length > 0
      ? checkinHistory.reduce((sum, c) => sum + c.distance_to_gym, 0) / checkinHistory.length
      : 0
  }

  // ジム制覇マップ用データ
  const gymMap = checkinHistory.reduce((map, checkin) => {
    const gym = checkin.gyms
    if (map[gym.id]) {
      map[gym.id].visits += 1
      map[gym.id].lastVisit = new Date(checkin.checked_in_at) > new Date(map[gym.id].lastVisit)
        ? checkin.checked_in_at
        : map[gym.id].lastVisit
    } else {
      map[gym.id] = {
        ...gym,
        visits: 1,
        lastVisit: checkin.checked_in_at,
        rarity: checkin.gym_rarities?.rarity_level || 'common',
        verified: checkin.location_verified
      }
    }
    return map
  }, {} as Record<string, any>)

  const getBadgeIcon = (iconText: string) => {
    switch (iconText) {
      case '🎯': return <Target className="w-6 h-6" />
      case '🏆': return <Award className="w-6 h-6" />
      case '⭐': return <Star className="w-6 h-6" />
      case '🥇': return <Award className="w-6 h-6 text-yellow-500" />
      case '👑': return <Crown className="w-6 h-6 text-yellow-500" />
      case '💎': return <Gem className="w-6 h-6 text-purple-500" />
      case '🗺️': return <MapPin className="w-6 h-6" />
      case '🧭': return <MapPin className="w-6 h-6" />
      case '🔍': return <Target className="w-6 h-6" />
      default: return <Award className="w-6 h-6" />
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'mythical': return 'from-purple-500 to-pink-500'
      case 'legendary': return 'from-yellow-500 to-orange-500'
      case 'rare': return 'from-blue-500 to-cyan-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      {/* タブナビゲーション */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'badges'
                ? 'text-[color:var(--gt-primary-strong)] border-b-2 border-[color:var(--gt-primary)]'
                : 'text-[color:var(--text-muted)] hover:text-[color:var(--foreground)]'
            }`}
          >
            <Award className="w-4 h-4 inline mr-2" />
            バッジ ({badges.length})
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'map'
                ? 'text-[color:var(--gt-primary-strong)] border-b-2 border-[color:var(--gt-primary)]'
                : 'text-[color:var(--text-muted)] hover:text-[color:var(--foreground)]'
            }`}
          >
            <MapPin className="w-4 h-4 inline mr-2" />
            ジム制覇 ({stats.uniqueGyms})
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'badges' && (
          <div className="space-y-6">
            {/* マイルストーンバッジ */}
            {categorizedBadges.milestone.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-[color:var(--foreground)] mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  マイルストーン
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categorizedBadges.milestone.map(badge => (
                    <div key={badge.id} className="bg-gradient-to-br from-[rgba(254,255,250,0.9)] to-[rgba(247,250,255,0.9)] p-4 rounded-xl border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-[var(--gt-primary)] to-[var(--gt-secondary)] rounded-lg text-white">
                          {getBadgeIcon(badge.badge_icon)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-[color:var(--foreground)]">{badge.badge_name}</div>
                          <div className="text-xs text-[color:var(--text-muted)] line-clamp-2">{badge.badge_description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* レアジムバッジ */}
            {categorizedBadges.rarity.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-[color:var(--foreground)] mb-3 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  レアジム制覇
                </h3>
                <div className="space-y-3">
                  {categorizedBadges.rarity.map(badge => (
                    <div key={badge.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200 hover:border-yellow-400 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg text-white">
                          {getBadgeIcon(badge.badge_icon)}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-[color:var(--foreground)]">{badge.badge_name}</div>
                          <div className="text-sm text-[color:var(--text-muted)] mt-1">{badge.badge_description}</div>
                          <div className="text-xs text-yellow-600 mt-2">
                            獲得日: {new Date(badge.earned_at).toLocaleDateString('ja-JP')}
                          </div>
                        </div>
                        {badge.gym_id && (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => window.open(`/gyms/${badge.gym_id}`, '_blank')}
                              className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-xs font-medium rounded-lg transition-colors"
                              title="ジム詳細を見る"
                            >
                              ジム詳細
                            </button>
                            <button
                              onClick={() => window.open(`/feed?gym=${badge.gym_id}`, '_blank')}
                              className="px-3 py-1.5 bg-white hover:bg-yellow-50 text-yellow-700 text-xs font-medium rounded-lg border border-yellow-300 transition-colors"
                              title="このジムの投稿を見る"
                            >
                              投稿を見る
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* エクスプローラーバッジ */}
            {categorizedBadges.exploration.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-[color:var(--foreground)] mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  エクスプローラー
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categorizedBadges.exploration.map(badge => (
                    <div key={badge.id} className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg text-white">
                          {getBadgeIcon(badge.badge_icon)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-[color:var(--foreground)]">{badge.badge_name}</div>
                          <div className="text-xs text-[color:var(--text-muted)] line-clamp-2">{badge.badge_description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {badges.length === 0 && (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-[color:var(--text-muted)] mx-auto mb-4" />
                <p className="text-[color:var(--text-muted)]">まだバッジを獲得していません</p>
                <p className="text-sm text-[color:var(--text-subtle)] mt-1">ジムにチェックインしてバッジを集めよう！</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-[color:var(--foreground)] mb-2">ジム制覇マップ</h3>
              <p className="text-sm text-[color:var(--text-muted)]">{stats.uniqueGyms}箇所のジムを制覇しました</p>
            </div>

            {Object.values(gymMap).length > 0 ? (
              <div className="space-y-3">
                {Object.values(gymMap)
                  .sort((a, b) => b.visits - a.visits)
                  .map((gym: any) => (
                    <div key={gym.id} className="flex items-center gap-4 p-4 bg-[rgba(254,255,250,0.9)] rounded-xl border">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRarityColor(gym.rarity)} flex items-center justify-center text-white font-bold`}>
                        {gym.visits}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-[color:var(--foreground)] flex items-center gap-2">
                          {gym.name}
                          {gym.verified && <div className="w-2 h-2 bg-green-500 rounded-full" title="GPS認証済み"></div>}
                        </div>
                        <div className="text-sm text-[color:var(--text-muted)]">{gym.address}</div>
                        <div className="text-xs text-[color:var(--text-subtle)] mt-1">
                          最終訪問: {new Date(gym.lastVisit).toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                      {gym.rarity !== 'common' && (
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          gym.rarity === 'mythical' ? 'bg-purple-100 text-purple-700' :
                          gym.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {gym.rarity === 'mythical' ? '💎 神話級' :
                           gym.rarity === 'legendary' ? '👑 伝説級' : '⭐ レア'}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-[color:var(--text-muted)] mx-auto mb-4" />
                <p className="text-[color:var(--text-muted)]">まだジムにチェックインしていません</p>
                <p className="text-sm text-[color:var(--text-subtle)] mt-1">ジムに行ってチェックインしよう！</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}