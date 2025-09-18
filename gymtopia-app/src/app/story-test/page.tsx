'use client';

import { useState } from 'react';
import { generateStoryImage, downloadStoryImage } from '@/lib/story-image-generator';
import { Post } from '@/lib/supabase/posts';

export default function StoryTestPage() {
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedPost, setSelectedPost] = useState<'with-image' | 'no-image'>('with-image');

    // テスト用のサンプル投稿データ（画像付き）
    const samplePost: Post = {
        id: 'test-post-1',
        user_id: 'test-user-1',
        content: '今日も良いトレーニングができました！ベンチプレス100kg達成🔥\n\n久しぶりに新しいPRを更新できて嬉しいです。これからも頑張ります！',
        images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=1200&fit=crop&crop=center'], // ジムの画像
        created_at: new Date().toISOString(),
        likes_count: 15,
        comments_count: 3,
        is_liked: false,
        user: {
            id: 'test-user-1',
            display_name: 'フィットネス太郎',
            username: 'fitness_taro',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'
        },
        gym: {
            name: 'エクサイズジム渋谷'
        },
        training_details: {
            gym_name: 'エクサイズジム渋谷',
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
                },
                {
                    name: 'デッドリフト',
                    weight: 120,
                    sets: 3,
                    reps: 5
                }
            ],
            crowd_status: 'normal'
        }
    };

    // 画像なしのサンプル投稿データ
    const samplePostNoImage: Post = {
        id: 'test-post-2',
        user_id: 'test-user-2',
        content: '今日は有酸素運動の日！30分間のランニングで汗を流しました💦\n\n天気も良くて気持ちよかったです！',
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1時間前
        likes_count: 8,
        comments_count: 2,
        is_liked: false,
        user: {
            id: 'test-user-2',
            display_name: 'ランニング花子',
            username: 'running_hanako',
            avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face'
        },
        gym: {
            name: 'フィットネスジム新宿'
        },
        training_details: {
            gym_name: 'フィットネスジム新宿',
            exercises: [
                {
                    name: 'ランニング',
                    weight: 0,
                    sets: 1,
                    reps: 30
                }
            ],
            crowd_status: 'empty'
        }
    };

    const currentPost = selectedPost === 'with-image' ? samplePost : samplePostNoImage;

    const handleGenerateImage = async () => {
        setIsGenerating(true);
        try {
            const imageDataUrl = await generateStoryImage(currentPost);
            setGeneratedImage(imageDataUrl);
        } catch (error) {
            console.error('Error generating image:', error);
            alert('画像生成に失敗しました。');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadImage = async () => {
        try {
            await downloadStoryImage(currentPost, `gymtopia-story-${selectedPost}.png`);
        } catch (error) {
            console.error('Error downloading image:', error);
            alert('画像ダウンロードに失敗しました。');
        }
    };

    return (
        <div className="min-h-screen bg-[rgba(243,247,255,0.96)] py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-[color:var(--foreground)] mb-8 text-center">
                        インスタストーリー画像生成テスト
                    </h1>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* 左側: コントロール */}
                        <div className="space-y-6">
                            <div className="bg-[rgba(243,247,255,0.96)] rounded-lg p-6">
                                <h2 className="text-xl font-semibold mb-4">テスト投稿データ</h2>

                                {/* 投稿選択 */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-[color:var(--text-subtle)] mb-2">テストする投稿を選択:</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedPost('with-image')}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedPost === 'with-image'
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-white text-[color:var(--text-subtle)] border border-gray-300 hover:bg-[rgba(243,247,255,0.96)]'
                                                }`}
                                        >
                                            画像付き投稿
                                        </button>
                                        <button
                                            onClick={() => setSelectedPost('no-image')}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedPost === 'no-image'
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-white text-[color:var(--text-subtle)] border border-gray-300 hover:bg-[rgba(243,247,255,0.96)]'
                                                }`}
                                        >
                                            画像なし投稿
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="font-medium">ユーザー:</span> {currentPost.user?.display_name}
                                    </div>
                                    <div>
                                        <span className="font-medium">ジム:</span> {currentPost.gym?.name}
                                    </div>
                                    <div>
                                        <span className="font-medium">いいね:</span> {currentPost.likes_count}
                                    </div>
                                    <div>
                                        <span className="font-medium">コメント:</span> {currentPost.comments_count}
                                    </div>
                                    <div>
                                        <span className="font-medium">トレーニング種目:</span> {currentPost.training_details?.exercises?.length}種目
                                    </div>
                                    <div>
                                        <span className="font-medium">投稿画像:</span> {currentPost.images?.length || 0}枚
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handleGenerateImage}
                                    disabled={isGenerating}
                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isGenerating ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            画像生成中...
                                        </div>
                                    ) : (
                                        'ストーリー画像を生成'
                                    )}
                                </button>

                                {generatedImage && (
                                    <button
                                        onClick={handleDownloadImage}
                                        className="w-full bg-[rgba(31,143,106,0.12)]0 text-white py-3 px-6 rounded-lg font-medium hover:bg-[#1f8f6a] transition-colors"
                                    >
                                        画像をダウンロード
                                    </button>
                                )}
                            </div>

                            <div className="bg-blue-50 rounded-lg p-4">
                                <h3 className="font-medium text-blue-900 mb-2">機能説明</h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• 投稿データからインスタストーリー用の縦型画像を生成</li>
                                    <li>• ユーザー情報、投稿内容、トレーニング詳細を表示</li>
                                    <li>• 投稿画像がある場合は背景として活用</li>
                                    <li>• インスタストーリーの安全領域を考慮したレイアウト</li>
                                    <li>• 美しいグラデーション背景と装飾</li>
                                    <li>• 1080x1920px（インスタストーリー推奨サイズ）</li>
                                </ul>
                            </div>
                        </div>

                        {/* 右側: 生成された画像プレビュー */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">生成された画像</h2>

                            {generatedImage ? (
                                <div className="space-y-4">
                                    <div className="bg-gray-100 rounded-lg p-4 flex justify-center">
                                        <img
                                            src={generatedImage}
                                            alt="Generated story image"
                                            className="max-w-full h-auto rounded-lg shadow-lg"
                                            style={{ maxHeight: '600px' }}
                                        />
                                    </div>

                                    <div className="bg-[rgba(31,143,106,0.12)] rounded-lg p-4">
                                        <h3 className="font-medium text-green-900 mb-2">生成完了！</h3>
                                        <p className="text-sm text-green-800">
                                            画像が正常に生成されました。ダウンロードボタンから画像を保存できます。
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-100 rounded-lg p-8 text-center">
                                    <div className="text-[rgba(44,82,190,0.32)] mb-4">
                                        <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                        </svg>
                                    </div>
                                    <p className="text-[color:var(--text-muted)]">画像を生成してください</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
