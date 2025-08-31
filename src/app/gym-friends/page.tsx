'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, UserPlus, MessageCircle, Dumbbell, Calendar, MapPin, Search } from 'lucide-react'

interface GymFriend {
  id: string
  name: string
  username: string
  avatar?: string
  avatarBg?: string
  avatarText?: string
  bio: string
  location: string
  joinedDate: string
  trainingFrequency: string
  personalRecords: {
    benchPress?: string
    squat?: string
    deadlift?: string
  }
  isFollowing: boolean
  mutualFriends: number
}

const gymFriends: GymFriend[] = [
  {
    id: '1',
    name: '山田太郎',
    username: 'yamada_fitness',
    avatarBg: '#10b981',
    avatarText: '山',
    bio: '週3回一緒にトレーニング｜ベンチプレス100kg目標｜筋トレ歴3年',
    location: '東京',
    joinedDate: '2023年6月',
    trainingFrequency: '週3-4回',
    personalRecords: {
      benchPress: '90kg',
      squat: '110kg',
      deadlift: '130kg'
    },
    isFollowing: true,
    mutualFriends: 12
  },
  {
    id: '2',
    name: '佐藤花子',
    username: 'hanako_morning',
    avatarBg: '#f59e0b',
    avatarText: '佐',
    bio: '朝トレ仲間｜パワーリフター｜女性の筋トレ応援',
    location: '東京',
    joinedDate: '2023年8月',
    trainingFrequency: '週5-6回',
    personalRecords: {
      benchPress: '65kg',
      squat: '95kg',
      deadlift: '110kg'
    },
    isFollowing: true,
    mutualFriends: 8
  },
  {
    id: '3',
    name: '鈴木健太',
    username: 'kenta_bulk',
    avatarBg: '#8b5cf6',
    avatarText: '鈴',
    bio: 'バルクアップ中｜プロテイン愛好家｜筋肉は裏切らない',
    location: '神奈川',
    joinedDate: '2023年5月',
    trainingFrequency: '週6-7回',
    personalRecords: {
      benchPress: '140kg',
      squat: '180kg',
      deadlift: '200kg'
    },
    isFollowing: true,
    mutualFriends: 25
  },
  {
    id: '4',
    name: '田中美咲',
    username: 'misaki_fit',
    avatarBg: '#ec4899',
    avatarText: '田',
    bio: 'フィットネスインストラクター｜ボディメイク専門｜健康第一',
    location: '東京',
    joinedDate: '2023年7月',
    trainingFrequency: '週4-5回',
    personalRecords: {
      benchPress: '45kg',
      squat: '70kg',
      deadlift: '85kg'
    },
    isFollowing: true,
    mutualFriends: 18
  },
  {
    id: '5',
    name: '高橋大輔',
    username: 'daisuke_power',
    avatarBg: '#06b6d4',
    avatarText: '高',
    bio: 'パワーリフティング選手｜大会準備中｜限界への挑戦',
    location: '埼玉',
    joinedDate: '2023年4月',
    trainingFrequency: '週5-6回',
    personalRecords: {
      benchPress: '165kg',
      squat: '210kg',
      deadlift: '240kg'
    },
    isFollowing: true,
    mutualFriends: 30
  }
]

export default function GymFriendsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  const filteredFriends = gymFriends.filter(friend => {
    const matchesSearch = friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          friend.bio.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (selectedFilter === 'all') return matchesSearch
    if (selectedFilter === 'morning') return matchesSearch && friend.bio.includes('朝トレ')
    if (selectedFilter === 'frequent') return matchesSearch && (friend.trainingFrequency.includes('週5') || friend.trainingFrequency.includes('週6'))
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-slate-900">ジム友</h1>
            <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full font-medium">
              89人
            </span>
          </div>
          <button className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <UserPlus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="名前、ユーザー名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === 'all' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                すべて
              </button>
              <button
                onClick={() => setSelectedFilter('morning')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === 'morning' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                朝トレ仲間
              </button>
              <button
                onClick={() => setSelectedFilter('frequent')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === 'frequent' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                高頻度
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-700">総ジム友</span>
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">89人</div>
            <div className="text-xs text-slate-600 mt-1">先月より +5人</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-700">共通のジム</span>
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">12ヶ所</div>
            <div className="text-xs text-slate-600 mt-1">最多: ハンマーストレングス渋谷</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-700">週間アクティブ</span>
              <Dumbbell className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">45人</div>
            <div className="text-xs text-slate-600 mt-1">今週トレーニング済み</div>
          </div>
        </div>

        {/* Friends List */}
        <div className="space-y-4">
          {filteredFriends.map((friend) => (
            <div key={friend.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {friend.avatar ? (
                    <img 
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                      style={{ backgroundColor: friend.avatarBg }}
                    >
                      {friend.avatarText}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{friend.name}</h3>
                      <p className="text-sm text-slate-600">@{friend.username}</p>
                      <p className="text-sm text-slate-700 mt-1">{friend.bio}</p>
                      
                      {/* Stats */}
                      <div className="flex flex-wrap gap-3 mt-3">
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <MapPin className="w-3 h-3" />
                          <span>{friend.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <Calendar className="w-3 h-3" />
                          <span>{friend.joinedDate}から</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <Dumbbell className="w-3 h-3" />
                          <span>{friend.trainingFrequency}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <UserPlus className="w-3 h-3" />
                          <span>共通の友達 {friend.mutualFriends}人</span>
                        </div>
                      </div>

                      {/* Personal Records */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {friend.personalRecords.benchPress && (
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                            BP: {friend.personalRecords.benchPress}
                          </span>
                        )}
                        {friend.personalRecords.squat && (
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                            SQ: {friend.personalRecords.squat}
                          </span>
                        )}
                        {friend.personalRecords.deadlift && (
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                            DL: {friend.personalRecords.deadlift}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        friend.isFollowing 
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}>
                        {friend.isFollowing ? 'フォロー中' : 'フォロー'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="px-6 py-3 bg-white text-slate-700 rounded-lg font-medium shadow-sm hover:shadow-md transition-all">
            もっと見る
          </button>
        </div>
      </main>
    </div>
  )
}