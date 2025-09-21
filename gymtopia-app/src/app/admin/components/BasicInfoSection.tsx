import { memo } from 'react'
import { Upload } from 'lucide-react'
import Image from 'next/image'
import type { GymBasicInfo } from '../types'

interface BasicInfoSectionProps {
  formData: { basicInfo: GymBasicInfo }
  onInputChange: (field: string, value: string) => void
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSave: () => void
}

const BasicInfoSection = memo(function BasicInfoSection({
  formData,
  onInputChange,
  onImageUpload,
  onSave
}: BasicInfoSectionProps) {
  return (
    <div className="bg-white border border-[rgba(186,122,103,0.26)] rounded-[14.5px] p-[22px]">
      {/* 基本情報 */}
      <div className="mb-6">
        <h3 className="text-[14px] font-bold text-[color:var(--foreground)] mb-4">基本情報</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12.3px] text-[color:var(--foreground)] mb-2">
                施設名
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-[rgba(254,255,250,0.95)] border border-[rgba(186,122,103,0.26)] rounded-[8.5px] text-[12.3px] text-[color:var(--foreground)] focus:ring-2 focus:ring-[var(--gt-primary)] focus:border-transparent"
                value={formData.basicInfo.name}
                onChange={(e) => onInputChange('name', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[12.3px] text-[color:var(--foreground)] mb-2">
                エリア
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-[rgba(254,255,250,0.95)] border border-[rgba(186,122,103,0.26)] rounded-[8.5px] text-[12.3px] text-[color:var(--foreground)] focus:ring-2 focus:ring-[var(--gt-primary)] focus:border-transparent"
                value={formData.basicInfo.area}
                onChange={(e) => onInputChange('area', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[12.3px] text-[color:var(--foreground)] mb-2">
              住所
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-[rgba(254,255,250,0.95)] border border-[rgba(186,122,103,0.26)] rounded-[8.5px] text-[12.3px] text-[color:var(--foreground)] focus:ring-2 focus:ring-[var(--gt-primary)] focus:border-transparent"
              value={formData.basicInfo.address}
              onChange={(e) => onInputChange('address', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12.3px] text-[color:var(--foreground)] mb-2">
                営業時間
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-[rgba(254,255,250,0.95)] border border-[rgba(186,122,103,0.26)] rounded-[8.5px] text-[12.3px] text-[color:var(--foreground)] focus:ring-2 focus:ring-[var(--gt-primary)] focus:border-transparent"
                value={formData.basicInfo.hours}
                onChange={(e) => onInputChange('hours', e.target.value)}
                placeholder="例: 6:00-24:00"
              />
            </div>
            <div>
              <label className="block text-[12.3px] text-[color:var(--foreground)] mb-2">
                アクセス
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-[rgba(254,255,250,0.95)] border border-[rgba(186,122,103,0.26)] rounded-[8.5px] text-[12.3px] text-[color:var(--foreground)] focus:ring-2 focus:ring-[var(--gt-primary)] focus:border-transparent"
                value={formData.basicInfo.access}
                onChange={(e) => onInputChange('access', e.target.value)}
                placeholder="最寄り駅から徒歩3分"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12.3px] text-[color:var(--foreground)] mb-2">
              電話番号
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-[rgba(254,255,250,0.95)] border border-[rgba(186,122,103,0.26)] rounded-[8.5px] text-[12.3px] text-[color:var(--foreground)] focus:ring-2 focus:ring-[var(--gt-primary)] focus:border-transparent"
              value={formData.basicInfo.phone}
              onChange={(e) => onInputChange('phone', e.target.value)}
              placeholder="03-1234-5678"
            />
          </div>

          <div>
            <label className="block text-[12.3px] text-[color:var(--foreground)] mb-2">
              施設紹介
            </label>
            <textarea
              className="w-full px-3 py-2 bg-[rgba(254,255,250,0.95)] border border-[rgba(186,122,103,0.26)] rounded-[8.5px] text-[12.3px] text-[color:var(--foreground)] focus:ring-2 focus:ring-[var(--gt-primary)] focus:border-transparent"
              rows={4}
              value={formData.basicInfo.description}
              onChange={(e) => onInputChange('description', e.target.value)}
              placeholder="施設の特徴やおすすめポイントを記入してください"
            />
          </div>
        </div>
      </div>

      {/* 画像アップロード */}
      <div className="mb-6">
        <h3 className="text-[14px] font-bold text-[color:var(--foreground)] mb-4">メイン画像</h3>
        <div className="border-2 border-dashed border-[rgba(186,122,103,0.26)] rounded-[8.5px] p-6 text-center">
          {formData.basicInfo.imageUrl ? (
            <div className="relative">
              <Image
                src={formData.basicInfo.imageUrl}
                alt="ジム画像"
                width={300}
                height={200}
                className="mx-auto rounded-[8.5px] object-cover"
              />
              <label className="inline-flex items-center mt-4 px-4 py-2 bg-[var(--gt-primary)] text-white rounded-[8.5px] cursor-pointer hover:bg-[var(--gt-primary-strong)] transition-colors">
                <Upload className="w-4 h-4 mr-2" />
                画像を変更
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={onImageUpload}
                />
              </label>
            </div>
          ) : (
            <div>
              <Upload className="w-12 h-12 text-[color:var(--text-muted)] mx-auto mb-4" />
              <p className="text-[12.3px] text-[color:var(--text-muted)] mb-4">
                ジムのメイン画像をアップロードしてください
              </p>
              <label className="inline-flex items-center px-4 py-2 bg-[var(--gt-primary)] text-white rounded-[8.5px] cursor-pointer hover:bg-[var(--gt-primary-strong)] transition-colors">
                <Upload className="w-4 h-4 mr-2" />
                画像をアップロード
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={onImageUpload}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* 保存ボタン */}
      <div className="flex justify-end">
        <button
          onClick={onSave}
          className="px-6 py-2 bg-[var(--gt-primary)] text-white rounded-[8.5px] hover:bg-[var(--gt-primary-strong)] transition-colors text-[12.3px]"
        >
          変更を保存
        </button>
      </div>
    </div>
  )
})

export default BasicInfoSection