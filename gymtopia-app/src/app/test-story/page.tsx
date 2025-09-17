'use client';

import { useState } from 'react';
import { downloadStoryImage } from '@/lib/story-image-generator';
import { Post } from '@/lib/supabase/posts';

const testPost: Post = {
  id: 'test-1',
  user_id: 'test-user',
  gym_id: 'test-gym',
  content: '今日も良いトレーニングができました！ベンチプレス100kg達成🔥',
  created_at: new Date().toISOString(),
  likes_count: 15,
  comments_count: 3,
  is_liked: false,
  user: {
    id: 'test-user',
    display_name: 'テストユーザー',
    username: 'test_user',
  },
  gym: {
    name: 'テストジム渋谷'
  },
  training_details: {
    gym_name: 'テストジム渋谷',
    exercises: [
      {
        name: 'ベンチプレス',
        weight: 100,
        sets: 3,
        reps: 8
      },
      {
        name: 'スクワット',
        weight: 80,
        sets: 4,
        reps: 12
      }
    ],
    crowd_status: 'normal'
  }
};

export default function TestStoryPage() {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      await downloadStoryImage(testPost, 'test-story.png');
      console.log('画像生成成功');
    } catch (err) {
      console.error('画像生成エラー:', err);
      setError(err instanceof Error ? err.message : '画像生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">インスタストーリー画像生成テスト</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-lg font-semibold mb-2">テスト投稿データ</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(testPost, null, 2)}
          </pre>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? '生成中...' : '画像を生成してダウンロード'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
            エラー: {typeof error === 'string' ? error : JSON.stringify(error)}
          </div>
        )}
      </div>
    </div>
  );
}