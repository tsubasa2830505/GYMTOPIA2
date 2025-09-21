import { memo, useRef } from 'react'
import { Camera, User, AtSign, FileText, X } from 'lucide-react'
import Image from 'next/image'
import type { BasicInfoProps } from '../types'

const BasicInfoSection = memo(function BasicInfoSection({
  name,
  username,
  bio,
  avatarUrl,
  previewImage,
  onNameChange,
  onUsernameChange,
  onBioChange,
  onImageSelect,
  onImageRemove
}: BasicInfoProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(231,103,76,0.16)]">
      <h3 className="text-lg font-bold text-[color:var(--foreground)] mb-6">基本情報</h3>

      {/* Avatar Upload */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
            {previewImage || avatarUrl ? (
              <Image
                src={previewImage || avatarUrl}
                alt="Profile"
                width={96}
                height={96}
                className="w-full h-full object-cover"
                unoptimized={!!previewImage}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 bg-[var(--gt-primary)] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[var(--gt-primary-strong)] transition-colors"
          >
            <Camera className="w-4 h-4" />
          </button>
          {(previewImage || avatarUrl) && (
            <button
              onClick={onImageRemove}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <div>
          <p className="text-sm text-[color:var(--text-muted)] mb-2">
            プロフィール画像をアップロード
          </p>
          <p className="text-xs text-[color:var(--text-subtle)]">
            JPG、PNG形式のファイル（最大10MB）
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onImageSelect}
          className="hidden"
        />
      </div>

      {/* Name */}
      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm font-medium text-[color:var(--foreground)] mb-2">
          <User className="w-4 h-4" />
          表示名 <span className="text-[color:var(--gt-primary)]">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full px-4 py-3 border border-[rgba(231,103,76,0.16)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-[color:var(--foreground)]"
          placeholder="表示名を入力"
          required
        />
      </div>

      {/* Username */}
      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm font-medium text-[color:var(--foreground)] mb-2">
          <AtSign className="w-4 h-4" />
          ユーザー名 <span className="text-[color:var(--gt-primary)]">*</span>
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          className="w-full px-4 py-3 border border-[rgba(231,103,76,0.16)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-[color:var(--foreground)]"
          placeholder="ユーザー名を入力"
          required
        />
      </div>

      {/* Bio */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-[color:var(--foreground)] mb-2">
          <FileText className="w-4 h-4" />
          自己紹介
        </label>
        <textarea
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          className="w-full px-4 py-3 border border-[rgba(231,103,76,0.16)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gt-primary)] text-[color:var(--foreground)] resize-none"
          rows={4}
          placeholder="自己紹介を入力してください"
        />
      </div>
    </div>
  )
})

export default BasicInfoSection