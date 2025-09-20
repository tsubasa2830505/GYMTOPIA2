'use client'

import { useState } from 'react'

interface BasicInfoFormProps {
  formData: {
    name: string
    area: string
    address: string
    openingHours: string
    monthlyFee: string
    visitorFee: string
  }
  onUpdate: (field: string, value: string) => void
  onSave: () => void
  isLoading?: boolean
}

export default function BasicInfoForm({
  formData,
  onUpdate,
  onSave,
  isLoading = false
}: BasicInfoFormProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[color:var(--foreground)]">基本情報</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
            ジム名
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onUpdate('name', e.target.value)}
            className="w-full px-3 py-2 border border-[rgba(231,103,76,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--gt-primary)] bg-[color:var(--background)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
            エリア
          </label>
          <input
            type="text"
            value={formData.area}
            onChange={(e) => onUpdate('area', e.target.value)}
            className="w-full px-3 py-2 border border-[rgba(231,103,76,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--gt-primary)] bg-[color:var(--background)]"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
            住所
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => onUpdate('address', e.target.value)}
            className="w-full px-3 py-2 border border-[rgba(231,103,76,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--gt-primary)] bg-[color:var(--background)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
            営業時間
          </label>
          <input
            type="text"
            value={formData.openingHours}
            onChange={(e) => onUpdate('openingHours', e.target.value)}
            className="w-full px-3 py-2 border border-[rgba(231,103,76,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--gt-primary)] bg-[color:var(--background)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
            月額料金 (円)
          </label>
          <input
            type="number"
            value={formData.monthlyFee}
            onChange={(e) => onUpdate('monthlyFee', e.target.value)}
            className="w-full px-3 py-2 border border-[rgba(231,103,76,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--gt-primary)] bg-[color:var(--background)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
            ビジター料金 (円)
          </label>
          <input
            type="number"
            value={formData.visitorFee}
            onChange={(e) => onUpdate('visitorFee', e.target.value)}
            className="w-full px-3 py-2 border border-[rgba(231,103,76,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--gt-primary)] bg-[color:var(--background)]"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onSave}
          disabled={isLoading}
          className="px-6 py-2 bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white rounded-lg hover:from-[var(--gt-primary-strong)] hover:to-[var(--gt-tertiary)] transition-all duration-200 disabled:opacity-50"
        >
          {isLoading ? '保存中...' : '基本情報を保存'}
        </button>
      </div>
    </div>
  )
}