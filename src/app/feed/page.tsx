'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Share2, MapPin, Calendar, ChevronDown, Activity, Dumbbell } from 'lucide-react';

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
}

const feedPosts: FeedPost[] = [
  {
    id: '1',
    author: {
      name: '筋トレマニア太郎',
      avatar: '/avatar1.jpg'
    },
    gymName: 'ハンマーストレングス渋谷',
    date: '2024年1月20日 18:30',
    content: '今日は胸トレ！新しいHammer Strengthのチェストプレス最高でした💪 フォームが安定して重量も上がりました。このジムのマシンは本当に質が高い！',
    training: {
      exercises: 'ベンチプレス 100kg × 4セット × 8回 • インクラインベンチ 80kg × 3セット × 10回 • ダンベルフライ 25kg × 3セット × 12回 • ディップス 自重 × 3セット × 15回',
      summary: '4種目 • 計13セット',
      condition: 'normal',
      conditionText: '普通',
      conditionEmoji: '😐'
    },
    image: '/training1.jpg'
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
    image: '/training2.jpg'
  },
  {
    id: '3',
    author: {
      name: 'デッドリフト職人',
      avatar: '/avatar3.jpg'
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
    }
  },
  {
    id: '4',
    author: {
      name: '朝トレ戦士',
      avatar: '/avatar4.jpg'
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
    }
  }
];

export default function FeedPage() {
  const [filter, setFilter] = useState('すべて');

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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-700">ジム活フィード</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 hover:bg-gray-200">
            <span>すべて</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Feed Posts */}
        <div className="space-y-4">
          {feedPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Post Header */}
              <div className="p-4 sm:p-6">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {post.author.avatar ? (
                      <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
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
                      <span className="px-2 py-0.5 bg-indigo-500 text-white text-xs rounded-full">
                        ジム活
                      </span>
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
                      <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900">今日のトレーニング</h4>
                    </div>
                    <div className="bg-white p-3 rounded-xl mb-3">
                      <p className="text-sm text-gray-600 leading-relaxed">{post.training.exercises}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
                          <span className="text-xs">💪</span>
                        </div>
                        <span className={`text-xs font-medium ${getConditionColor(post.training.condition)}`}>
                          {post.training.conditionEmoji} {post.training.conditionText}
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