'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
// Material Design icons used inline

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
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14 4.14 5.57 2 7.71 3.43 9.14 2 10.57 3.43 12 7 15.57 15.57 7 12 3.43 13.43 2 14.86 3.43 16.29 2 18.43 4.14 19.86 2.71 21.29 4.14 19.86 5.57 22 7.71 20.57 9.14 22 10.57 20.57 12 22 13.43 20.57 14.86z"/>
              </svg>
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
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center justify-center gap-1 ${
                filter === 'all'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              </svg>
              すべて
            </button>
            <button
              onClick={() => setFilter('following')}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center justify-center gap-1 ${
                filter === 'following'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              フォロー中
            </button>
            <button
              onClick={() => setFilter('gym-friends')}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center justify-center gap-1 ${
                filter === 'gym-friends'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 13.75c-2.34 0-7 1.17-7 3.5V19h14v-1.75c0-2.33-4.66-3.5-7-3.5zM4.34 17c.84-.58 2.87-1.25 4.66-1.25s3.82.67 4.66 1.25H4.34zM9 12c1.93 0 3.5-1.57 3.5-3.5S10.93 5 9 5 5.5 6.57 5.5 8.5 7.07 12 9 12zm0-5c.83 0 1.5.67 1.5 1.5S9.83 10 9 10s-1.5-.67-1.5-1.5S8.17 7 9 7zm7.04 6.81c1.16.84 1.96 1.96 1.96 3.44V19h4v-1.75c0-2.02-3.5-3.17-5.96-3.44zM15 12c1.93 0 3.5-1.57 3.5-3.5S16.93 5 15 5c-.54 0-1.04.13-1.5.35.63.89 1 1.98 1 3.15s-.37 2.26-1 3.15c.46.22.96.35 1.5.35z"/>
              </svg>
              ジム友
            </button>
            <button
              onClick={() => setFilter('same-gym')}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center justify-center gap-1 ${
                filter === 'same-gym'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              同じジム
            </button>
          </div>
        </div>


        {/* Recommended Posts Section - Only show when "all" filter is selected */}
        {filter === 'all' && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1l3.09 6.26L22 9l-5 4.87L18.18 21 12 17.77 5.82 21 7 13.87 2 9l6.91-1.74L12 1z"/>
              </svg>
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
                    <span>GOLD&apos;S GYM 渋谷</span>
                    <span>1時間前</span>
                    <button className="text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap">
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
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                      </svg>
                    </div>
                  </div>

                  {/* Author Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 overflow-x-auto">
                      <h3 className="font-semibold text-gray-900 flex-shrink-0">{post.author.name}</h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {post.isGymFriend && (
                          <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-medium whitespace-nowrap">
                            <svg className="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                            </svg>
                            ジム友
                          </span>
                        )}
                        {post.isSameGym && (
                          <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-medium whitespace-nowrap">
                            <svg className="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                            同じジム
                          </span>
                        )}
                        {!post.isFollowing && (
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full whitespace-nowrap">
                            おすすめ
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-100 rounded-full">
                        <svg className="w-3 h-3 text-indigo-900" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        <span className="text-xs text-indigo-900">{post.gymName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-violet-200 rounded-full">
                        <svg className="w-3 h-3 text-indigo-900" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                        </svg>
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
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                        </svg>
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
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span className="text-sm">いいね</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition ml-auto">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.50-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                    </svg>
                    <span className="text-sm">シェア</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Post Button - Fixed Position */}
        <button 
          onClick={() => router.push('/add')}
          className="fixed bottom-20 right-6 sm:bottom-24 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 bg-blue-500 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center group"
          style={{ 
            zIndex: 9999,
            background: 'linear-gradient(to right, #3b82f6, #9333ea)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:rotate-90 transition-transform duration-200" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}