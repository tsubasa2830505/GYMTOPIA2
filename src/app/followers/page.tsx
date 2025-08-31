'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, UserPlus, MapPin, Calendar, Search, UserCheck } from 'lucide-react'

interface Follower {
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
  isFollowingBack: boolean
  mutualFriends: number
  postsCount: number
  lastActive: string
}

const followersList: Follower[] = [
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
    isFollowingBack: true,
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
    isFollowingBack: true,
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
    isFollowingBack: true,
    mutualFriends: 25,
    postsCount: 78,
    lastActive: '1日前'
  },
  {
    id: '4',
    name: '新人トレーナー',
    username: 'newbie_trainer',
    avatarBg: '#ef4444',
    avatarText: '新',
    bio: 'パーソナルトレーナー見習い｜勉強中｜お客様第一',
    location: '東京',
    joinedDate: '2024年1月',
    isGymFriend: false,
    isFollowingBack: false,
    mutualFriends: 2,
    postsCount: 15,
    lastActive: '30分前'
  },
  {
    id: '5',
    name: '筋トレ初心者',
    username: 'beginner_gym',
    avatarBg: '#16a34a',
    avatarText: '筋',
    bio: '筋トレ始めて3ヶ月｜アドバイスお願いします｜頑張ります！',
    location: '埼玉',
    joinedDate: '2024年2月',
    isGymFriend: false,
    isFollowingBack: false,
    mutualFriends: 0,
    postsCount: 8,
    lastActive: '1時間前'
  },
  {
    id: '6',
    name: '女子大生フィット',
    username: 'joshi_fit',
    avatarBg: '#e879f9',
    avatarText: '女',
    bio: '大学生｜ボディメイク頑張ってます｜美容と健康',
    location: '東京',
    joinedDate: '2023年11月',
    isGymFriend: false,
    isFollowingBack: true,
    mutualFriends: 5,
    postsCount: 22,
    lastActive: '3時間前'
  },
  {
    id: '7',
    name: 'サラリーマン筋トレ',
    username: 'office_muscle',
    avatarBg: '#0ea5e9',
    avatarText: 'サ',
    bio: '会社員｜朝活でトレーニング｜健康経営推進中',
    location: '千葉',
    joinedDate: '2023年9月',
    isGymFriend: false,
    isFollowingBack: true,
    mutualFriends: 8,
    postsCount: 34,
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
    isFollowingBack: false,
    mutualFriends: 3,
    postsCount: 29,
    lastActive: '6時間前'
  }
]

export default function FollowersPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  const filteredFollowers = followersList.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.bio.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (selectedFilter === 'all') return matchesSearch
    if (selectedFilter === 'gym-friends') return matchesSearch && user.isGymFriend
    if (selectedFilter === 'not-following') return matchesSearch && !user.isFollowingBack
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
              <button 
                onClick={() => router.push('/following')}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <span className="text-lg font-bold">フォロー</span>
                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">
                  345人
                </span>
              </button>
              <div className="flex items-center gap-1">
                <h1 className="text-xl font-bold text-green-600">フォロワー</h1>
                <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full font-medium">
                  89人
                </span>
              </div>
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
                onClick={() => setSelectedFilter('not-following')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === 'not-following' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                未フォロー
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
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-700">総フォロワー数</span>
              <UserPlus className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">89人</div>
            <div className="text-xs text-slate-600 mt-1">今月 +8人</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-700">相互フォロー</span>
              <UserCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">67人</div>
            <div className="text-xs text-slate-600 mt-1">フォロワーの75.3%</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-700">未フォロー</span>
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">22人</div>
            <div className="text-xs text-slate-600 mt-1">フォローバック候補</div>
          </div>
        </div>

        {/* Followers List */}
        <div className="space-y-4">
          {filteredFollowers.map((user) => (
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
                        {user.isFollowingBack && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                            相互フォロー
                          </span>
                        )}
                        {!user.isFollowingBack && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                            未フォロー
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
                      <button className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                        user.isFollowingBack 
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}>
                        {user.isFollowingBack ? (
                          <>
                            <UserCheck className="w-3 h-3" />
                            フォロー中
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3" />
                            フォローバック
                          </>
                        )}
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