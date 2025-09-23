'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Camera, Upload, X, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { uploadGymImage, deleteGymImage, updateGymImages } from '@/lib/supabase/gym-images'

interface GymImageUploaderProps {
  gymId: string
  currentImages: string[]
  onImagesUpdate: (images: string[]) => void
}

export default function GymImageUploader({ gymId, currentImages, onImagesUpdate }: GymImageUploaderProps) {
  const [images, setImages] = useState<string[]>(currentImages)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // デバッグログ
  useEffect(() => {
    console.log('[GymImageUploader] Props:', { gymId, currentImages })
    console.log('[GymImageUploader] State images:', images)
  }, [gymId, currentImages, images])

  // currentImagesが変更されたら、imagesステートも更新
  useEffect(() => {
    setImages(currentImages || [])
  }, [currentImages])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      await handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = async (files: File[]) => {
    setUploading(true)
    const newImages = [...images]

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} は画像ファイルではありません`)
        continue
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} は5MBを超えています`)
        continue
      }

      // Upload image
      const uploadedImage = await uploadGymImage(gymId, file)
      if (uploadedImage) {
        newImages.push(uploadedImage.url)
      }
    }

    // Update database
    const success = await updateGymImages(gymId, newImages)
    if (success) {
      setImages(newImages)
      onImagesUpdate(newImages)
    }

    setUploading(false)
  }

  const removeImage = async (index: number) => {
    const imageUrl = images[index]

    // Extract path from URL for deletion from storage
    const url = new URL(imageUrl)
    const path = url.pathname.split('/').slice(-2).join('/')

    // Delete from storage
    await deleteGymImage(path)

    // Update images array
    const newImages = images.filter((_, i) => i !== index)

    // Update database
    const success = await updateGymImages(gymId, newImages)
    if (success) {
      setImages(newImages)
      onImagesUpdate(newImages)
    }
  }

  const moveImage = (fromIndex: number, direction: 'up' | 'down') => {
    const newImages = [...images]
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1

    if (toIndex < 0 || toIndex >= images.length) return

    [newImages[fromIndex], newImages[toIndex]] = [newImages[toIndex], newImages[fromIndex]]

    updateGymImages(gymId, newImages).then(success => {
      if (success) {
        setImages(newImages)
        onImagesUpdate(newImages)
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
          ジム画像管理
        </h3>
        <span className="text-sm text-[color:var(--text-muted)]">
          {images.length}/10枚
        </span>
      </div>

      {/* Current Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={image}
                  alt={`ジム画像 ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                {index > 0 && (
                  <button
                    onClick={() => moveImage(index, 'up')}
                    className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
                    title="前へ移動"
                  >
                    ←
                  </button>
                )}

                <button
                  onClick={() => removeImage(index)}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  title="削除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {index < images.length - 1 && (
                  <button
                    onClick={() => moveImage(index, 'down')}
                    className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
                    title="次へ移動"
                  >
                    →
                  </button>
                )}
              </div>

              {index === 0 && (
                <div className="absolute top-2 left-2 bg-[color:var(--gt-primary)] text-white text-xs px-2 py-1 rounded">
                  メイン画像
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {images.length < 10 && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-[color:var(--gt-primary)] bg-[rgba(231,103,76,0.05)]'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-[color:var(--gt-primary)] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-[color:var(--text-muted)]">アップロード中...</p>
            </div>
          ) : (
            <>
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-[color:var(--foreground)] font-medium mb-2">
                画像をドラッグ&ドロップ
              </p>
              <p className="text-sm text-[color:var(--text-muted)] mb-4">
                または
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-[color:var(--gt-primary)] text-white rounded-lg hover:bg-[color:var(--gt-primary-strong)] transition-colors inline-flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                画像を選択
              </button>
              <p className="text-xs text-[color:var(--text-muted)] mt-4">
                対応形式: JPG, PNG, GIF, WebP (最大5MB)
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}