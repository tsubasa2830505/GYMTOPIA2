'use client'

import { useState } from 'react'
import { X, AlertCircle, Image as ImageIcon } from 'lucide-react'

interface ImagePreviewProps {
  urls: string[]
  onRemove?: (index: number) => void
  maxImages?: number
}

export default function ImagePreview({ urls, onRemove, maxImages = 10 }: ImagePreviewProps) {
  const [loadErrors, setLoadErrors] = useState<Set<number>>(new Set())

  const handleImageError = (index: number) => {
    setLoadErrors(prev => new Set(prev).add(index))
  }

  const handleImageLoad = (index: number) => {
    setLoadErrors(prev => {
      const newErrors = new Set(prev)
      newErrors.delete(index)
      return newErrors
    })
  }

  const validUrls = urls.filter(url => url && url.trim())

  if (validUrls.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">画像URLを入力すると、ここにプレビューが表示されます</p>
          <p className="text-xs text-gray-400 mt-1">最大{maxImages}枚まで</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">画像プレビュー</h4>
        <span className="text-xs text-gray-500">
          {validUrls.length}/{maxImages}枚
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {validUrls.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
          >
            {loadErrors.has(index) ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                <AlertCircle className="w-6 h-6 text-red-500 mb-1" />
                <p className="text-xs text-red-600 text-center">画像を読み込めません</p>
              </div>
            ) : (
              <>
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(index)}
                  onLoad={() => handleImageLoad(index)}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-xs font-medium px-2 py-1 bg-black/60 rounded">
                    画像 {index + 1}
                  </p>
                </div>
              </>
            )}

            {onRemove && (
              <button
                onClick={() => onRemove(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="削除"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {validUrls.length >= maxImages && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
          <p className="text-xs text-yellow-700">
            画像の上限（{maxImages}枚）に達しました
          </p>
        </div>
      )}
    </div>
  )
}