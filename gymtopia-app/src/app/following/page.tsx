'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, UserPlus, MapPin, Calendar, Search, UserMinus } from 'lucide-react'

interface Following {
  id: string
  name: string
  username: string
  avatar?: string
  avatarBg?: string
  avatarText?: string
  bio: string
  location: string
  joinedDate: string
  isGymFriend: boolean
  mutualFriends: number
  postsCount: number
  lastActive: string
}

const followingList: Following[] = [
  {
    id: '1',
    name: '山田太郎',
    username: 'yamada_fitness',
    avatarBg: '#10b981',
    avatarText: '山',
    bio: '週3回一緒にトレーニング｜ベンチプレス100kg目標｜筋トレ歴3年',
    location: '東京',
    joinedDate: '2023年6月',
    isGymFriend: true,
    mutualFriends: 12,
    postsCount: 45,
    lastActive: '2時間前'
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
    isGymFriend: true,
    mutualFriends: 8,
    postsCount: 32,
    lastActive: '5時間前'
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
    isGymFriend: true,
    mutualFriends: 25,
    postsCount: 78,
    lastActive: '1日前'
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
    isGymFriend: false,
    mutualFriends: 18,
    postsCount: 56,
    lastActive: '3時間前'
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
    isGymFriend: false,
    mutualFriends: 30,
    postsCount: 23,
    lastActive: '6時間前'
  },
  {
    id: '6',
    name: '小林まい',
    username: 'mai_yoga',
    avatarBg: '#f472b6',
    avatarText: '小',
    bio: 'ヨガインストラクター｜心身のバランス重視｜毎日瞑想',
    location: '東京',
    joinedDate: '2023年9月',
    isGymFriend: false,
    mutualFriends: 7,
    postsCount: 41,
    lastActive: '2日前'
  },
  {
    id: '7',
    name: '中村ゆうた',
    username: 'yuta_cardio',
    avatarBg: '#22d3ee',
    avatarText: '中',
    bio: 'マラソンランナー｜サブ3目標｜週5ランニング',
    location: '千葉',
    joinedDate: '2023年3月',
    isGymFriend: false,
    mutualFriends: 15,
    postsCount: 67,
    lastActive: '4時間前'
  },
  {
    id: '8',
    name: '林さくら',
    username: 'sakura_dance',
    avatar: '/muscle-taro-avatar.svg',
    bio: 'ダンサー｜週4ダンスレッスン｜表現力向上中',
    location: '大阪',
    joinedDate: '2023年10月',
    isGymFriend: false,
    mutualFriends: 3,
    postsCount: 29,
    lastActive: '1時間前'
  }
]

export default function FollowingPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  const filteredFollowing = followingList.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.bio.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (selectedFilter === 'all') return matchesSearch
    if (selectedFilter === 'gym-friends') return matchesSearch && user.isGymFriend
    if (selectedFilter === 'recent') return matchesSearch && (user.lastActive.includes('時間前') || user.lastActive.includes('分前'))
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/profile')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <h1 className="text-xl font-bold text-blue-600">フォロー</h1>
                <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full font-medium">
                  345人
                </span>
              </div>
              <button 
                onClick={() => router.push('/followers')}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <span className="text-lg font-bold">フォロワー</span>
                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">
                  89人
                </span>
              </button>
            </div>
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
                onClick={() => setSelectedFilter('gym-friends')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === 'gym-friends' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ジム友
              </button>
              <button
                onClick={() => setSelectedFilter('recent')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === 'recent' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                最近アクティブ
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-700">総フォロー数</span>
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">345人</div>
            <div className="text-xs text-slate-600 mt-1">今月 +12人</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-700">ジム友</span>
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">89人</div>
            <div className="text-xs text-slate-600 mt-1">フォロー中の25.8%</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-700">今日アクティブ</span>
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">23人</div>
            <div className="text-xs text-slate-600 mt-1">過去24時間以内</div>
          </div>
        </div>

        {/* Following List */}
        <div className="space-y-4">
          {filteredFollowing.map((user) => (
            <div key={user.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                      style={{ backgroundColor: user.avatarBg }}
                    >
                      {user.avatarText}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-slate-900">{user.name}</h3>
                        {user.isGymFriend && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            ジム友
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">@{user.username}</p>
                      <p className="text-sm text-slate-700 mt-1">{user.bio}</p>
                      
                      {/* Stats */}
                      <div className="flex flex-wrap gap-3 mt-3">
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <MapPin className="w-3 h-3" />
                          <span>{user.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <Calendar className="w-3 h-3" />
                          <span>{user.joinedDate}から</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <span>{user.postsCount}投稿</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <span>共通の友達 {user.mutualFriends}人</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <span>最終アクティブ: {user.lastActive}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors flex items-center gap-1">
                        <UserMinus className="w-3 h-3" />
                        フォロー解除
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