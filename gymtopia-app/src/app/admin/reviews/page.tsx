'use client';

import { useState } from 'react';
import { Star, Send, Heart, Users } from 'lucide-react';
import Image from 'next/image';

interface Review {
  id: string;
  author: {
    name: string;
    avatar?: string;
    initial?: string;
  };
  rating: number;
  date: string;
  content: string;
  reply?: {
    storeName: string;
    role: string;
    content: string;
    date: string;
  };
}

const initialReviews: Review[] = [
  {
    id: '1',
    author: {
      name: '筋トレ愛好家',
      initial: '筋'
    },
    rating: 5,
    date: '2024年1月15日',
    content: 'ROGUEのパワーラックが4台もあって、待ち時間ほぼゼロ！\nフリーウェイトエリアも広くて、混雑時でも快適にトレーニングできます。\n24時間営業なのも最高です。'
  },
  {
    id: '2',
    author: {
      name: 'フィットネス女子',
      initial: 'フ'
    },
    rating: 4,
    date: '2024年1月14日',
    content: '設備は充実していて文句なし！\nただ、女性更衣室がもう少し広いと嬉しいです。\nスタッフの対応は親切で、初心者にも優しく教えてくれます。',
    reply: {
      storeName: 'ハンマーストレングス渋谷',
      role: 'オーナー',
      content: 'ご利用ありがとうございます！\n女性更衣室の件、貴重なご意見として検討させていただきます。\n今後ともよろしくお願いいたします。',
      date: '2024年1月14日'
    }
  },
  {
    id: '3',
    author: {
      name: 'ベンチプレス戦士',
      avatar: '/avatar3.jpg',
      initial: 'ベ'
    },
    rating: 5,
    date: '2024年1月13日',
    content: 'ベンチプレス台が5台もある！\nしかも全部ELEIKO製で最高の環境です。\nプレートも豊富で、高重量トレーニングにも対応できます。',
    reply: {
      storeName: 'ハンマーストレングス渋谷',
      role: 'オーナー',
      content: 'お褒めの言葉ありがとうございます！\nELEIKO製品は特にこだわって導入しました。\n今後も快適なトレーニング環境を提供できるよう努めます。',
      date: '2024年1月13日'
    }
  },
  {
    id: '4',
    author: {
      name: 'カーディオ派',
      initial: 'カ'
    },
    rating: 4,
    date: '2024年1月12日',
    content: 'トレッドミルとバイクの台数が多くて良い！\n有酸素エリアも広々としています。\nシャワールームも清潔で快適です。'
  },
  {
    id: '5',
    author: {
      name: 'パワーリフター',
      avatar: '/avatar5.jpg',
      initial: 'パ'
    },
    rating: 5,
    date: '2024年1月11日',
    content: 'パワーリフティング3種目に特化した設備が完璧！\nチョークも使えるし、プラットフォームも複数あります。\n本格的にトレーニングしたい人には最高の環境です。',
    reply: {
      storeName: 'ハンマーストレングス渋谷',
      role: 'オーナー',
      content: 'ありがとうございます！\nパワーリフターの方にも満足いただける設備を心がけています。\n大会前のトレーニングなど、ぜひご活用ください。',
      date: '2024年1月11日'
    }
  }
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});
  const [activeTab, setActiveTab] = useState('reviews');

  const handleReplyChange = (reviewId: string, text: string) => {
    setReplyTexts(prev => ({
      ...prev,
      [reviewId]: text
    }));
  };

  const handleReplySubmit = (reviewId: string) => {
    const replyText = replyTexts[reviewId];
    if (!replyText || replyText.trim() === '') return;

    setReviews(prev => prev.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          reply: {
            storeName: 'ハンマーストレングス渋谷',
            role: 'オーナー',
            content: replyText,
            date: new Date().toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          }
        };
      }
      return review;
    }));

    setReplyTexts(prev => ({
      ...prev,
      [reviewId]: ''
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, reviewId: string) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleReplySubmit(reviewId);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  const averageRating = 4.8;
  const totalReviews = 128;
  const ikitaiCount = 342;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">施設管理ページ</h1>
              <p className="text-lg text-gray-600 mt-1">ハンマーストレングス渋谷</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-2xl font-bold">{averageRating}</span>
                </div>
                <p className="text-xs text-gray-500">平均評価</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="text-2xl font-bold">{totalReviews}</span>
                </div>
                <p className="text-xs text-gray-500">レビュー件数</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Heart className="w-5 h-5 text-red-400" />
                  <span className="text-2xl font-bold">{ikitaiCount}</span>
                </div>
                <p className="text-xs text-gray-500">イキタイ</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('basic')}
              className={`py-3 px-1 relative ${
                activeTab === 'basic' ? 'text-gray-900' : 'text-gray-600'
              } hover:text-gray-900 transition`}
            >
              <span className="font-medium">基本情報</span>
            </button>
            <button
              onClick={() => setActiveTab('facilities')}
              className={`py-3 px-1 relative ${
                activeTab === 'facilities' ? 'text-gray-900' : 'text-gray-600'
              } hover:text-gray-900 transition`}
            >
              <span className="font-medium">設備管理</span>
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-3 px-4 relative ${
                activeTab === 'reviews'
                  ? 'bg-indigo-500 text-white rounded-full'
                  : 'text-gray-600 hover:text-gray-900'
              } transition`}
            >
              <span className="font-medium">レビュー管理</span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-3 px-1 relative ${
                activeTab === 'stats' ? 'text-gray-900' : 'text-gray-600'
              } hover:text-gray-900 transition`}
            >
              <span className="font-medium">統計情報</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'stats' ? (
          /* Statistics Tab Content */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 評価統計 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">評価統計</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-gray-900">4.8</span>
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-sm text-gray-600">342件のレビュー</p>
            </div>

            {/* イキタイ数 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">イキタイ数</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-gray-900">128</span>
                <Heart className="w-6 h-6 fill-red-400 text-red-400" />
              </div>
              <p className="text-sm text-gray-600">人がイキタイしています</p>
            </div>

            {/* 設備数 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">設備数</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-gray-900">3</span>
              </div>
              <p className="text-sm text-gray-600">種類の設備</p>
            </div>
          </div>
        ) : activeTab === 'reviews' ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">レビュー管理</h2>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.map((review) => (
              <div
                key={review.id}
                className="border border-gray-200 rounded-xl p-5 hover:shadow-sm transition"
              >
                {/* Review Header */}
                <div className="flex items-start gap-3 mb-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {review.author.avatar ? (
                      <Image
                        src={review.author.avatar}
                        alt={review.author.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-indigo-600">
                        {review.author.initial}
                      </span>
                    )}
                  </div>

                  {/* Meta Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-gray-900">
                        {review.author.name}
                      </span>
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                <div className="ml-13 mb-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{review.content}</p>
                </div>

                {/* Reply Section */}
                <div className="ml-13">
                  {review.reply ? (
                    /* Replied State */
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                          {review.reply.storeName}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {review.reply.role}
                        </span>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-xl">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {review.reply.content}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Reply Input State */
                    <div className="space-y-3">
                      <textarea
                        value={replyTexts[review.id] || ''}
                        onChange={(e) => handleReplyChange(review.id, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, review.id)}
                        placeholder="このレビューに返信..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        rows={3}
                      />
                      <button
                        onClick={() => handleReplySubmit(review.id)}
                        disabled={!replyTexts[review.id] || replyTexts[review.id].trim() === ''}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                          replyTexts[review.id] && replyTexts[review.id].trim()
                            ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Send className="w-4 h-4" />
                        返信
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}