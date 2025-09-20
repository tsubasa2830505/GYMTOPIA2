'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface Equipment {
  id: string
  category: string
  name: string
  maker: string
  count?: number
  maxWeight?: number
}

interface EquipmentManagerProps {
  equipment: Equipment[]
  newEquipment: {
    category: string
    name: string
    maker: string
    count: number
    maxWeight: number
  }
  onNewEquipmentChange: (field: string, value: string | number) => void
  onAddEquipment: () => void
  onDeleteEquipment: (equipmentId: string) => void
  isLoading?: boolean
}

const equipmentCategories = [
  'チェストプレス系',
  'ショルダープレス系',
  'ラットプルダウン系',
  'ローイング系',
  'レッグプレス系',
  'レッグカール系',
  'カーディオ',
  'フリーウェイト',
  'その他'
]

export default function EquipmentManager({
  equipment,
  newEquipment,
  onNewEquipmentChange,
  onAddEquipment,
  onDeleteEquipment,
  isLoading = false
}: EquipmentManagerProps) {
  const isWeightType = (category: string) => {
    return ['チェストプレス系', 'ショルダープレス系', 'ラットプルダウン系', 'ローイング系', 'レッグプレス系', 'レッグカール系'].includes(category)
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[color:var(--foreground)]">設備管理</h3>

      {/* 新しい設備の追加フォーム */}
      <div className="bg-[rgba(231,103,76,0.05)] p-4 rounded-lg">
        <h4 className="text-md font-medium text-[color:var(--foreground)] mb-4">新しい設備を追加</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
              カテゴリ
            </label>
            <select
              value={newEquipment.category}
              onChange={(e) => onNewEquipmentChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-[rgba(231,103,76,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--gt-primary)] bg-[color:var(--background)]"
            >
              <option value="">カテゴリを選択</option>
              {equipmentCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
              設備名
            </label>
            <input
              type="text"
              value={newEquipment.name}
              onChange={(e) => onNewEquipmentChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-[rgba(231,103,76,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--gt-primary)] bg-[color:var(--background)]"
              placeholder="例: チェストプレス"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
              メーカー
            </label>
            <input
              type="text"
              value={newEquipment.maker}
              onChange={(e) => onNewEquipmentChange('maker', e.target.value)}
              className="w-full px-3 py-2 border border-[rgba(231,103,76,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--gt-primary)] bg-[color:var(--background)]"
              placeholder="例: ハンマーストレングス"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
              台数
            </label>
            <input
              type="number"
              value={newEquipment.count}
              onChange={(e) => onNewEquipmentChange('count', parseInt(e.target.value))}
              min="1"
              className="w-full px-3 py-2 border border-[rgba(231,103,76,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--gt-primary)] bg-[color:var(--background)]"
            />
          </div>

          {isWeightType(newEquipment.category) && (
            <div>
              <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
                最大重量 (kg)
              </label>
              <input
                type="number"
                value={newEquipment.maxWeight}
                onChange={(e) => onNewEquipmentChange('maxWeight', parseInt(e.target.value))}
                min="1"
                className="w-full px-3 py-2 border border-[rgba(231,103,76,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--gt-primary)] bg-[color:var(--background)]"
              />
            </div>
          )}
        </div>

        <div className="mt-4">
          <button
            onClick={onAddEquipment}
            disabled={isLoading || !newEquipment.category || !newEquipment.name || !newEquipment.maker}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white rounded-lg hover:from-[var(--gt-primary-strong)] hover:to-[var(--gt-tertiary)] transition-all duration-200 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            設備を追加
          </button>
        </div>
      </div>

      {/* 既存設備のリスト */}
      <div>
        <h4 className="text-md font-medium text-[color:var(--foreground)] mb-4">現在の設備</h4>

        {equipment.length === 0 ? (
          <p className="text-[color:var(--text-muted)] text-center py-8">設備が登録されていません</p>
        ) : (
          <div className="space-y-2">
            {equipment.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border border-[rgba(231,103,76,0.2)] rounded-lg hover:bg-[rgba(231,103,76,0.05)] transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-[color:var(--foreground)]">{item.name}</span>
                    <span className="text-sm text-[color:var(--text-muted)]">{item.category}</span>
                    <span className="text-sm text-[color:var(--text-muted)]">{item.maker}</span>
                    <span className="text-sm text-[color:var(--text-muted)]">{item.count}台</span>
                    {item.maxWeight && (
                      <span className="text-sm text-[color:var(--text-muted)]">最大{item.maxWeight}kg</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onDeleteEquipment(item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="削除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}