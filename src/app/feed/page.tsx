'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Heart, MessageCircle, Share2, MapPin, Calendar, ChevronDown, Activity, Dumbbell, Plus, Edit } from 'lucide-react';

interface FeedPost {
  id: string;
  author: {
    name: string;
    avatar?: string;
    avatarBg?: string;
    avatarText?: string;
  };
  gymName: string;
  date: string;
  content: string;
  training?: {
    exercises: string;
    summary: string;
    condition: 'empty' | 'normal' | 'crowded';
    conditionText: string;
    conditionEmoji: string;
  };
  image?: string;
  hasLiked?: boolean;
  hasCommented?: boolean;
  hasShared?: boolean;
  isGymFriend?: boolean;
  isFollowing?: boolean;
  isSameGym?: boolean;
}

const feedPosts: FeedPost[] = [
  {
    id: '1',
    author: {
      name: '筋トレマニア太郎',
      avatar: '/muscle-taro-avatar.svg'
    },
    gymName: 'ハンマーストレングス渋谷',
    date: '2024年1月20日 18:30',
    content: '今日は胸トレ！新しいHammer Strengthのチェストプレス最高でした。フォームが安定して重量も上がりました。このジムのマシンは本当に質が高い！',
    training: {
      exercises: 'ベンチプレス 100kg × 4セット × 8回 • インクラインベンチ 80kg × 3セット × 10回 • ダンベルフライ 25kg × 3セット × 12回 • ディップス 自重 × 3セット × 15回',
      summary: '4種目 • 計13セット',
      condition: 'normal',
      conditionText: '普通',
      conditionEmoji: 'normal'
    },
    image: '/training1.jpg',
    isGymFriend: false,
    isFollowing: false,
    isSameGym: false
  },
  {
    id: '2',
    author: {
      name: 'スクワット女王',
      avatarBg: '#6366f1',
      avatarText: 'ス'
    },
    gymName: 'ROGUEクロストレーニング新宿',
    date: '2024年1月19日 20:15',
    content: '脚トレDAY🦵 ROGUEのパワーラックでスクワット120kg×5達成！！！ ずっと目標にしていた重量です。チョークも使えるのでグリップも完璧✨',
    training: {
      exercises: 'スクワット 120kg × 5セット × 5回 • ルーマニアンデッドリフト 100kg × 4セット × 8回 • ブルガリアンスクワット 20kg × 3セット × 12回 • レッグカール 40kg × 3セット × 15回',
      summary: '4種目 • 計15セット',
      condition: 'empty',
      conditionText: '空いている',
      conditionEmoji: '😊'
    },
    image: '/training2.jpg',
    isGymFriend: true,
    isFollowing: true,
    isSameGym: false
  },
  {
    id: '3',
    author: {
      name: 'デッドリフト職人',
      avatarBg: '#ef4444',
      avatarText: 'デ'
    },
    gymName: 'プレミアムフィットネス銀座',
    date: '2024年1月19日 14:20',
    content: 'お昼のトレーニング。さすがプレミアムジム、平日昼間は空いていて快適でした。Primeのマシンは動きがスムーズで効きが違います🔥 サウナも最高！',
    training: {
      exercises: 'デッドリフト 140kg × 5セット × 3回 • ラットプルダウン 70kg × 4セット × 10回 • バーベルロウ 80kg × 4セット × 8回 • フェイスプル 30kg × 3セット × 15回',
      summary: '4種目 • 計16セット',
      condition: 'empty',
      conditionText: '空いている',
      conditionEmoji: '😊'
    },
    isGymFriend: false,
    isFollowing: true,
    isSameGym: false
  },
  {
    id: '4',
    author: {
      name: '朝トレ戦士',
      avatarBg: '#f59e0b',
      avatarText: '朝'
    },
    gymName: 'ハンマーストレングス渋谷',
    date: '2024年1月18日 6:45',
    content: '朝トレ最高！24時間営業だから早朝も利用できるのが嬉しい。朝の時間帯は空いていて集中してトレーニングできました。今日も良い一日になりそう☀️',
    training: {
      exercises: 'ショルダープレス 50kg × 4セット × 10回 • ラテラルレイズ 15kg × 4セット × 12回 • リアデルト 12kg × 3セット × 15回 • シュラッグ 60kg × 3セット × 12回',
      summary: '4種目 • 計14セット',
      condition: 'empty',
      conditionText: '空いている',
      conditionEmoji: '😊'
    },
    isGymFriend: true,
    isFollowing: true,
    isSameGym: true
  }
];

export default function FeedPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'following' | 'gym-friends' | 'same-gym'>('all');

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'empty':
        return 'text-green-600';
      case 'normal':
        return 'text-yellow-600';
      case 'crowded':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredPosts = feedPosts.filter(post => {
    switch (filter) {
      case 'following':
        return post.isFollowing;
      case 'gym-friends':
        return post.isGymFriend;
      case 'same-gym':
        return post.isSameGym;
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-[73.5px] flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-[42px] sm:h-[42px] bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
              <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-[21px] font-bold text-slate-900">ジムトピア</h1>
              <p className="text-xs text-slate-600">理想のジムを見つけよう</p>
            </div>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Feed Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-700">ジム活フィード</h2>
            <span className="text-sm text-gray-500">
              {filter === 'all' && `${filteredPosts.length}件の投稿`}
              {filter === 'following' && `フォロー中: ${filteredPosts.length}件`}
              {filter === 'gym-friends' && `ジム友: ${filteredPosts.length}件`}
              {filter === 'same-gym' && `同じジム: ${filteredPosts.length}件`}
            </span>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === 'all'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setFilter('following')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === 'following'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              フォロー中
            </button>
            <button
              onClick={() => setFilter('gym-friends')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === 'gym-friends'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              🤝 ジム友
            </button>
            <button
              onClick={() => setFilter('same-gym')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === 'same-gym'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              📍 同じジム
            </button>
          </div>
        </div>

        {/* Post Button - Fixed Position */}
        <button 
          onClick={() => router.push('/add')}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center z-40 group"
        >
          <Plus className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:rotate-90 transition-transform duration-200" />
        </button>

        {/* Recommended Posts Section - Only show when "all" filter is selected */}
        {filter === 'all' && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <span className="text-lg">✨</span>
              おすすめの投稿
            </h3>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  新
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">新人トレーニー</span>
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                      人気上昇中
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    初めてのデッドリフト100kg達成！みなさんのアドバイスのおかげです🎉
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>GOLD'S GYM 渋谷</span>
                    <span>1時間前</span>
                    <button className="text-blue-600 hover:text-blue-700 font-medium">
                      フォローする
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feed Posts */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Post Header */}
              <div className="p-4 sm:p-6">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {post.author.avatar ? (
                      <Image 
                        src={post.author.avatar}
                        alt={post.author.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                      />
                    ) : (
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: post.author.avatarBg }}
                      >
                        {post.author.avatarText}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                      <Activity className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  {/* Author Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                      {post.isGymFriend && (
                        <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-medium">
                          🤝 ジム友
                        </span>
                      )}
                      {post.isSameGym && (
                        <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-medium">
                          📍 同じジム
                        </span>
                      )}
                      {!post.isFollowing && (
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                          おすすめ
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-100 rounded-full">
                        <MapPin className="w-3 h-3 text-indigo-900" />
                        <span className="text-xs text-indigo-900">{post.gymName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-violet-200 rounded-full">
                        <Calendar className="w-3 h-3 text-indigo-900" />
                        <span className="text-xs text-indigo-900 font-medium">{post.date}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <p className="mt-4 text-gray-800 leading-relaxed">{post.content}</p>

                {/* Training Details */}
                {post.training && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900">今日のトレーニング</h4>
                    </div>
                    <div className="bg-white p-3 rounded-xl mb-3 max-h-20 overflow-y-auto">
                      <p className="text-sm text-gray-600 leading-relaxed break-words">{post.training.exercises}</p>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${getConditionColor(post.training.condition)}`}>
                          {post.training.conditionEmoji === 'normal' ? '😐' : post.training.conditionEmoji} {post.training.conditionText}
                        </span>
                      </div>
                      <div className="px-3 py-1.5 bg-gray-50 rounded-full">
                        <span className="text-xs text-gray-600 font-medium">{post.training.summary}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Post Image */}
                {post.image && (
                  <div className="mt-4">
                    <div className="h-48 sm:h-64 bg-gray-200 rounded-xl"></div>
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="px-4 sm:px-6 py-3 border-t border-gray-100">
                <div className="flex items-center gap-4 sm:gap-6">
                  <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">いいね</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">コメント</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition ml-auto">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">シェア</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}