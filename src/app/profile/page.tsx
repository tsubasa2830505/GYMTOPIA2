'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// Material Design icons are now inline SVGs

interface Post {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    isVerified?: boolean;
  };
  content: string;
  date: string;
  activity?: {
    name: string;
    duration: string;
    calories: string;
  };
  training?: {
    type: string;
    details: string;
  };
  likes: number;
  comments: number;
  shares: number;
  image?: string;
}

// 自分の投稿のみを表示
const posts: Post[] = [
  {
    id: '1',
    author: {
      name: '筋トレマニア太郎',
      username: '@muscle_taro',
      avatar: '/avatar1.jpg',
      isVerified: true
    },
    content: '今日は胸トレ！新しいHammer Strengthのチェストプレス最高でした。フォームが安定して重量も上がりました。このジムのマシンは本当に質が高い！',
    date: '2024年1月20日 18:30',
    likes: 45,
    comments: 3,
    shares: 2
  },
  {
    id: '2',
    author: {
      name: '筋トレマニア太郎',
      username: '@muscle_taro',
      avatar: '/avatar1.jpg',
      isVerified: true
    },
    content: '脚トレDAY！ROGUEのパワーラックでスクワット120kg×5達成！！！ずっと目標にしていた重量です。チョークを使ったグリップも完璧',
    date: '2024年1月19日 20:15',
    training: {
      type: '今日のトレーニング',
      details: 'スクワット 120kg × 5セット × 8回 • ルーマニアンデッドリフト 100kg × 4セット × 10回 • ブルガリアンスクワット 20kg × 3セット × 12回 • レッグカール 40kg × 3セット × 15回'
    },
    likes: 89,
    comments: 12,
    shares: 5,
    image: '/training1.jpg'
  },
  {
    id: '3',
    author: {
      name: '筋トレマニア太郎',
      username: '@muscle_taro',
      avatar: '/avatar1.jpg',
      isVerified: true
    },
    content: '背中のトレーニング完了。Hammer Strengthのラットプルダウンは可動域が広くて効きが違う。平日昼間は空いていて快適でした。',
    date: '2024年1月18日 14:20',
    training: {
      type: '今日のトレーニング',
      details: 'デッドリフト 140kg × 5セット × 3回 • ラットプルダウン 70kg × 4セット × 10回 • バーベルロウ 60kg × 4セット × 10回 • フェイスプル 30kg × 3セット × 15回'
    },
    likes: 67,
    comments: 8,
    shares: 3,
    image: '/training2.jpg'
  },
  {
    id: '4',
    author: {
      name: '筋トレマニア太郎',
      username: '@muscle_taro',
      avatar: '/avatar1.jpg',
      isVerified: true
    },
    content: '朝トレ最高！24時間営業だから早朝も利用できるのが嬉しい。朝の時間帯は空いていて集中してトレーニングできました。今日も良い一日になりそう★',
    date: '2024年1月17日 6:45',
    training: {
      type: '今日のトレーニング',
      details: 'ショルダープレス 50kg × 4セット × 10回 • ラテラルレイズ 10kg × 4セット × 12回 • リアデルト 12kg × 3セット × 15回 • シュラッグ 60kg × 3セット × 12回'
    },
    likes: 34,
    comments: 5,
    shares: 1
  }
];

const achievements = [
  { 
    icon: (
      <svg className="w-8 h-8 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 7c0-1.11.89-2 2-2h10c1.11 0 2 .89 2 2v1c0 1.55-.7 2.94-1.79 3.87L14 15.08V20l-4 2v-6.92l-3.21-3.21A4.008 4.008 0 0 1 5 8V7z"/>
      </svg>
    ), 
    name: '初回記録', 
    date: '2023年6月' 
  },
  { 
    icon: (
      <svg className="w-8 h-8 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
      </svg>
    ), 
    name: '100日連続ジム通い', 
    date: '2023年8月' 
  },
  { 
    icon: (
      <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 9h-3V3.23C18 2.1 16.91 1.05 15.76 1H8.24C7.09 1.05 6 2.1 6 3.23V9H3c-.55 0-1 .45-1 1s.45 1 1 1h3v8.77c0 1.13 1.09 2.18 2.24 2.23h7.52c1.15-.05 2.24-1.1 2.24-2.23V11h3c.55 0 1-.45 1-1s-.45-1-1-1zm-5 0H8V3h8v6z"/>
      </svg>
    ), 
    name: 'ジム新人100突破', 
    date: '2023年10月' 
  },
  { 
    icon: (
      <svg className="w-8 h-8 text-purple-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14 4.14 5.57 2 7.71 3.43 9.14 2 10.57 3.43 12 7 15.57 15.57 7 12 3.43 13.43 2 14.86 3.43 16.29 2 18.43 4.14 19.86 2.71 21.29 4.14 19.86 5.57 22 7.71 20.57 9.14 22 10.57 20.57 12 22 13.43 20.57 14.86z"/>
      </svg>
    ), 
    name: 'ベンチプレス100kg達成', 
    date: '2023年12月' 
  }
];

const personalRecords = [
  { exercise: 'ベンチプレス', weight: '120kg', reps: '1回' },
  { exercise: 'スクワット', weight: '130kg', reps: '5回×3セット' },
  { exercise: 'デッドリフト', weight: '150kg', reps: '1回' },
  { exercise: 'ショルダープレス', weight: '60kg', reps: '8回×3セット' }
];

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('gym-activity');
  const [userType, setUserType] = useState('user');

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
          
          {/* User Type Toggle */}
          <div className="bg-slate-100 rounded-full p-0.5 flex shadow-sm">
            <button
              onClick={() => setUserType('user')}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                userType === 'user'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-slate-600'
              }`}
            >
              <svg className="w-3.5 h-3.5 inline mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              利用者
            </button>
            <button
              onClick={() => {
                setUserType('admin')
                router.push('/admin')
              }}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                userType === 'admin'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-slate-600'
              }`}
            >
              <svg className="w-3.5 h-3.5 inline mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
              </svg>
              施設管理者
            </button>
          </div>
        </div>
      </header>

      {/* Profile Header */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-300 rounded-full"></div>
              <div className="absolute -bottom-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="white">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 w-full text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <h1 className="text-xl sm:text-2xl font-bold">筋トレマニア太郎</h1>
                <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-600 text-xs sm:text-sm rounded-full font-medium">
                  プロフィール編集
                </span>
              </div>
              <div className="flex flex-row items-center justify-center sm:justify-start gap-3 text-gray-600 mb-1 sm:mb-3">
                <p className="text-xs sm:text-base text-gray-600">@muscle_taro</p>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                  </svg>
                  <span className="text-xs sm:text-sm">2023年4月</span>
                </div>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span className="text-xs sm:text-sm">東京</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-800 mb-2 sm:mb-4 px-4 sm:px-0">
                筋トレ歴5年｜ベンチプレス115kg｜スクワット150kg｜デッドリフト180kg｜ジム歴が最高場が無料です
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 sm:flex gap-4 sm:gap-8 w-full sm:w-auto">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold">108</div>
                  <div className="text-xs sm:text-sm text-gray-500">ジム通い</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold">89</div>
                  <div className="text-xs sm:text-sm text-gray-500">ジム友</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold">23</div>
                  <div className="text-xs sm:text-sm text-gray-500">オススメ</div>
                </div>
                <div className="text-center hidden sm:block">
                  <div className="text-lg sm:text-2xl font-bold">345</div>
                  <div className="text-xs sm:text-sm text-gray-500">フォロー</div>
                </div>
                <div className="text-center hidden sm:block">
                  <div className="text-lg sm:text-2xl font-bold">89</div>
                  <div className="text-xs sm:text-sm text-gray-500">フォロワー</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-4 sm:gap-8">
            <button 
              onClick={() => setActiveTab('gym-activity')}
              className={`flex-1 sm:flex-initial py-2 sm:py-3 px-1 relative ${activeTab === 'gym-activity' ? 'text-blue-600' : 'text-gray-600'} hover:text-gray-900 transition`}
            >
              <span className="text-sm sm:text-base font-medium">ジム活</span>
              <div className="text-xs text-gray-500 mt-0.5 sm:mt-1">16投稿</div>
              {activeTab === 'gym-activity' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 sm:flex-initial py-2 sm:py-3 px-1 relative ${activeTab === 'achievements' ? 'text-blue-600' : 'text-gray-600'} hover:text-gray-900 transition`}
            >
              <span className="text-sm sm:text-base font-medium">達成記録</span>
              <div className="text-xs text-gray-500 mt-0.5 sm:mt-1">4達成</div>
              {activeTab === 'achievements' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 sm:flex-initial py-2 sm:py-3 px-1 relative ${activeTab === 'favorites' ? 'text-blue-600' : 'text-gray-600'} hover:text-gray-900 transition`}
            >
              <span className="text-sm sm:text-base font-medium">お気に入り</span>
              <div className="text-xs text-gray-500 mt-0.5 sm:mt-1">12ジム</div>
              {activeTab === 'favorites' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
        {/* Gym Activity Tab */}
        {activeTab === 'gym-activity' && (
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            <div className="flex-1 order-2 lg:order-1 space-y-4">
              {/* 新規投稿ボタン */}
              <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors">
                <button 
                  onClick={() => router.push('/add')}
                  className="w-full flex items-center justify-center gap-3 py-3 text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                  </div>
                  <span className="font-medium">新しいジム活を投稿する</span>
                </button>
              </div>
              
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex gap-2 sm:gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-300 rounded-full flex-shrink-0"></div>
                      <div>
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                          <span className="text-sm sm:text-base font-semibold">{post.author.name}</span>
                          {post.author.isVerified && (
                            <span className="px-1.5 sm:px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">認証済</span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">{post.author.username}</p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 p-1">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                    </button>
                  </div>

                  {/* Post Content */}
                  <p className="text-sm sm:text-base text-gray-800 mb-3">{post.content}</p>
                  
                  {/* Training Details */}
                  {post.training && (
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                      <h4 className="font-semibold text-xs sm:text-sm mb-1.5 sm:mb-2">{post.training.type}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 whitespace-pre-line">{post.training.details}</p>
                    </div>
                  )}

                  {/* Post Image */}
                  {post.image && (
                    <div className="mb-3 sm:mb-4">
                      <div className="h-48 sm:h-64 bg-gray-200 rounded-lg"></div>
                    </div>
                  )}

                  {/* Post Date */}
                  <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">{post.date}</p>

                  {/* Post Actions */}
                  <div className="flex items-center gap-3 sm:gap-6 pt-2 sm:pt-3 border-t border-gray-100">
                    <button className="flex items-center gap-1 sm:gap-2 text-gray-500 hover:text-red-500 transition">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      <span className="text-xs sm:text-sm">いいね {post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 sm:gap-2 text-gray-500 hover:text-blue-500 transition">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                      </svg>
                      <span className="text-xs sm:text-sm">コメント {post.comments}</span>
                    </button>
                    <button className="flex items-center gap-1 sm:gap-2 text-gray-500 hover:text-green-500 transition">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                      </svg>
                      <span className="text-xs sm:text-sm">シェア {post.shares}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar - ジム活タブ専用 */}
            <div className="w-full lg:w-80 space-y-4 order-1 lg:order-2">
              {/* Recent Activities */}
              <div className="bg-white rounded-lg p-4 sm:p-5 shadow-sm">
                <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 inline" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/>
                  </svg>
                  今週の活動
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-xs sm:text-sm text-gray-600">トレーニング回数</span>
                    <span className="text-xs sm:text-sm font-bold">5回</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-xs sm:text-sm text-gray-600">総重量</span>
                    <span className="text-xs sm:text-sm font-bold">12,450kg</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-xs sm:text-sm text-gray-600">平均滞在時間</span>
                    <span className="text-xs sm:text-sm font-bold">1時間45分</span>
                  </div>
                </div>
              </div>

              {/* Gym Friends */}
              <div className="bg-white rounded-lg p-4 sm:p-5 shadow-sm">
                <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 inline" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                  </svg>
                  ジム友
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 py-1">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-xs sm:text-sm font-medium">山田太郎</div>
                      <div className="text-xs text-gray-500">週3回一緒にトレーニング</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 py-1">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-xs sm:text-sm font-medium">佐藤花子</div>
                      <div className="text-xs text-gray-500">朝トレ仲間</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-4">
            {/* Personal Records */}
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <h3 className="font-bold text-lg sm:text-xl mb-4 sm:mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 inline" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
                </svg>
                パーソナルレコード
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {personalRecords.map((record, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm sm:text-base font-semibold text-gray-700">{record.exercise}</span>
                      <span className="text-lg sm:text-xl font-bold text-blue-600">{record.weight}</span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">{record.reps}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievement Badges */}
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <h3 className="font-bold text-lg sm:text-xl mb-4 sm:mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 inline" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
                </svg>
                達成バッジ
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                    <div className="mb-2 flex justify-center">{achievement.icon}</div>
                    <div className="text-sm font-medium text-gray-700">{achievement.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{achievement.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div className="space-y-4">
              {[
                { name: 'ハンマーストレングス渋谷', area: '渋谷', users: 234, image: '/gym1.jpg' },
                { name: 'ROGUEクロストレーニング新宿', area: '新宿', users: 189, image: '/gym2.jpg' },
                { name: 'プレミアムフィットネス銀座', area: '銀座', users: 456, image: '/gym3.jpg' },
                { name: 'スーパーパワージム池袋', area: '池袋', users: 321, image: '/gym4.jpg' },
              ].map((gym, index) => (
                <div key={index} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-base sm:text-lg mb-1">{gym.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">📍 {gym.area}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-red-500 inline" viewBox="0 0 24 24" fill="currentColor">
                            <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          <span className="text-sm font-medium">{gym.users}人</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}