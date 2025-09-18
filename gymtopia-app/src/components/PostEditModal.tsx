'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Trash2, Plus, Clock } from 'lucide-react';
import Image from 'next/image';
import { Post } from '@/lib/supabase/posts';

interface Exercise {
  name: string;
  weight: number;
  sets: number;
  reps: number;
}

interface PostEditModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPost: Partial<Post>) => void;
}

export default function PostEditModal({ post, isOpen, onClose, onSave }: PostEditModalProps) {
  const [content, setContent] = useState(post.content || '');
  const [images, setImages] = useState<string[]>(post.images || []);
  const [exercises, setExercises] = useState<Exercise[]>(
    post.training_details?.exercises || []
  );
  const [crowdStatus, setCrowdStatus] = useState(
    post.training_details?.crowd_status || 'normal'
  );
  const [workoutStartedAt, setWorkoutStartedAt] = useState(
    (post as any).workout_started_at || ''
  );
  const [workoutEndedAt, setWorkoutEndedAt] = useState(
    (post as any).workout_ended_at || ''
  );
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setContent(post.content || '');
      setImages(post.images || []);
      setExercises(post.training_details?.exercises || []);
      setCrowdStatus(post.training_details?.crowd_status || 'normal');
      setWorkoutStartedAt((post as any).workout_started_at || '');
      setWorkoutEndedAt((post as any).workout_ended_at || '');
    }
  }, [isOpen, post]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      // 実際のアップロード処理はここに実装
      // 今は仮のURLを追加
      const newImageUrls = Array.from(files).map((file, index) =>
        URL.createObjectURL(file)
      );
      setImages([...images, ...newImageUrls]);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('画像のアップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    console.log('Removing image at index:', index);
    console.log('Current images:', images);
    console.log('Updated images:', updatedImages);
    setImages(updatedImages);
  };

  const addExercise = () => {
    setExercises([...exercises, { name: '', weight: 0, sets: 0, reps: 0 }]);
  };

  const updateExercise = (index: number, field: keyof Exercise, value: string | number) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const updatedPost: Partial<Post> & { workout_started_at?: string; workout_ended_at?: string } = {
      content,
      images: [...images], // 新しい配列として作成
      training_details: {
        ...post.training_details,
        exercises,
        crowd_status: crowdStatus,
        gym_name: post.training_details?.gym_name || post.gym?.name || ''
      },
      workout_started_at: workoutStartedAt,
      workout_ended_at: workoutEndedAt
    };
    console.log('PostEditModal - Saving with data:', updatedPost);
    console.log('PostEditModal - Images being saved:', updatedPost.images);
    onSave(updatedPost);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[rgba(186,122,103,0.26)] p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[color:var(--foreground)]">投稿を編集</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[rgba(254,255,250,0.95)] transition-colors"
          >
            <X className="w-5 h-5 text-[color:var(--text-muted)]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-[color:var(--text-subtle)] mb-2">
              投稿内容
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 border border-[rgba(186,122,103,0.28)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)]"
              rows={4}
              placeholder="今日のトレーニングについて..."
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-[color:var(--text-subtle)] mb-2">
              画像
            </label>
            <div className="grid grid-cols-3 gap-3">
              {images.map((image, index) => (
                <div key={`image-${index}-${image}`} className="relative aspect-square">
                  <Image
                    src={image}
                    alt={`画像 ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="absolute top-2 right-2 p-1 bg-[rgba(231,103,76,0.08)] text-white rounded-full hover:bg-[color:var(--gt-primary-strong)] transition-colors z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <label className="aspect-square border-2 border-dashed border-[rgba(186,122,103,0.28)] rounded-lg flex items-center justify-center cursor-pointer hover:border-[color:var(--gt-primary)] transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
                {uploading ? (
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-[color:var(--gt-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <span className="text-xs text-[color:var(--text-muted)]">アップロード中...</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-[rgba(68,73,73,0.6)] mx-auto mb-2" />
                    <span className="text-xs text-[color:var(--text-muted)]">画像を追加</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Training Details */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-[color:var(--text-subtle)]">
                トレーニング内容
              </label>
              <button
                onClick={addExercise}
                className="flex items-center gap-1 px-3 py-1 bg-[color:var(--gt-primary)] text-white rounded-lg hover:bg-[color:var(--gt-primary-strong)] transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                種目を追加
              </button>
            </div>

            <div className="space-y-3">
              {exercises.map((exercise, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-[rgba(254,255,250,0.97)] rounded-lg">
                  <div className="flex-1 grid grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={exercise.name}
                      onChange={(e) => updateExercise(index, 'name', e.target.value)}
                      placeholder="種目名"
                      className="col-span-4 sm:col-span-1 px-3 py-2 border border-[rgba(186,122,103,0.28)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)]"
                    />
                    <input
                      type="number"
                      value={exercise.weight}
                      onChange={(e) => updateExercise(index, 'weight', Number(e.target.value))}
                      placeholder="重量(kg)"
                      className="px-3 py-2 border border-[rgba(186,122,103,0.28)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)]"
                    />
                    <input
                      type="number"
                      value={exercise.sets}
                      onChange={(e) => updateExercise(index, 'sets', Number(e.target.value))}
                      placeholder="セット数"
                      className="px-3 py-2 border border-[rgba(186,122,103,0.28)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)]"
                    />
                    <input
                      type="number"
                      value={exercise.reps}
                      onChange={(e) => updateExercise(index, 'reps', Number(e.target.value))}
                      placeholder="回数"
                      className="px-3 py-2 border border-[rgba(186,122,103,0.28)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)]"
                    />
                  </div>
                  <button
                    onClick={() => removeExercise(index)}
                    className="p-2 text-[color:var(--gt-primary)] hover:bg-[rgba(231,103,76,0.08)] rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Workout Time */}
          <div>
            <label className="block text-sm font-medium text-[color:var(--text-subtle)] mb-2">
              <Clock className="inline w-4 h-4 mr-1" />
              トレーニング時間
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[color:var(--text-muted)] mb-1">開始時間</label>
                <input
                  type="time"
                  value={workoutStartedAt}
                  onChange={(e) => setWorkoutStartedAt(e.target.value)}
                  className="w-full px-3 py-2 border border-[rgba(186,122,103,0.28)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs text-[color:var(--text-muted)] mb-1">終了時間</label>
                <input
                  type="time"
                  value={workoutEndedAt}
                  onChange={(e) => setWorkoutEndedAt(e.target.value)}
                  className="w-full px-3 py-2 border border-[rgba(186,122,103,0.28)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)]"
                />
              </div>
            </div>
          </div>

          {/* Crowd Status */}
          <div>
            <label className="block text-sm font-medium text-[color:var(--text-subtle)] mb-2">
              混雑状況
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'empty', label: '空いている', color: 'green' },
                { value: 'normal', label: '普通', color: 'yellow' },
                { value: 'crowded', label: '混雑', color: 'red' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCrowdStatus(option.value)}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    crowdStatus === option.value
                      ? option.color === 'green'
                        ? 'border-[color:var(--gt-secondary)] bg-[rgba(240,142,111,0.1)] text-[color:var(--gt-secondary-strong)]'
                        : option.color === 'yellow'
                        ? 'border-[color:var(--gt-tertiary-strong)] bg-[rgba(245,177,143,0.1)] text-[color:var(--gt-tertiary-strong)]'
                        : 'border-[color:var(--gt-primary)] bg-[rgba(231,103,76,0.08)] text-[color:var(--gt-primary-strong)]'
                      : 'border-[rgba(186,122,103,0.28)] hover:border-[rgba(231,103,76,0.32)]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-[rgba(186,122,103,0.26)]">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-3 bg-[color:var(--gt-primary)] text-white rounded-lg hover:bg-[color:var(--gt-primary-strong)] transition-colors font-medium"
            >
              変更を保存
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-[rgba(254,255,250,0.9)] text-[color:var(--text-subtle)] rounded-lg hover:bg-[rgba(254,255,250,0.82)] transition-colors font-medium"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}