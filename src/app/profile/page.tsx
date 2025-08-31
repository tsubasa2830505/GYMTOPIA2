'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Share2, MoreHorizontal, MapPin, Calendar, User, Settings, Dumbbell } from 'lucide-react';

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
  { icon: '🏆', name: '初回記録', date: '2023年6月' },
  { icon: '🔥', name: '100日連続ジム通い', date: '2023年8月' },
  { icon: '💪', name: 'ジム新人100突破', date: '2023年10月' },
  { icon: '⭐', name: 'ベンチプレス100kg達成', date: '2023年12月' }
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
              <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
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
              <User className="w-3.5 h-3.5 inline mr-1" />
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
              <Settings className="w-3.5 h-3.5 inline mr-1" />
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
                <svg width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 16 16" fill="white">
                  <path d="M12.7 5.3L7 11L4.3 8.3L5.7 6.9L7 8.2L11.3 3.9L12.7 5.3Z"/>
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
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">2023年4月</span>
                </div>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
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
                      <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
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
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-xs sm:text-sm">いいね {post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 sm:gap-2 text-gray-500 hover:text-blue-500 transition">
                      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-xs sm:text-sm">コメント {post.comments}</span>
                    </button>
                    <button className="flex items-center gap-1 sm:gap-2 text-gray-500 hover:text-green-500 transition">
                      <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
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
                  <span className="text-lg sm:text-xl">📊</span>
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
                  <span className="text-lg sm:text-xl">👥</span>
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
                <span className="text-xl sm:text-2xl">⚡</span>
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
                <span className="text-xl sm:text-2xl">🏅</span>
                達成バッジ
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                    <div className="text-2xl sm:text-3xl mb-2">{achievement.icon}</div>
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
                { name: 'ハンマーストレングス渋谷', area: '渋谷', rating: 4.8, users: 234, image: '/gym1.jpg' },
                { name: 'ROGUEクロストレーニング新宿', area: '新宿', rating: 4.7, users: 189, image: '/gym2.jpg' },
                { name: 'プレミアムフィットネス銀座', area: '銀座', rating: 4.9, users: 456, image: '/gym3.jpg' },
                { name: 'スーパーパワージム池袋', area: '池袋', rating: 4.6, users: 321, image: '/gym4.jpg' },
              ].map((gym, index) => (
                <div key={index} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-base sm:text-lg mb-1">{gym.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">📍 {gym.area}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="text-sm font-medium">{gym.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">{gym.users}人が利用</span>
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