'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { PricingSystem } from '@/lib/supabase/gym-detailed-info'

interface PricingSectionProps {
  data: PricingSystem
  onChange: (data: PricingSystem) => void
}

export default function PricingSection({ data, onChange }: PricingSectionProps) {
  const addMembershipPlan = () => {
    const newPlan = {
      name: '',
      price: 0,
      duration: '',
      description: '',
      features: []
    }

    onChange({
      ...data,
      membership_plans: [...(data.membership_plans || []), newPlan]
    })
  }

  const updateMembershipPlan = (index: number, field: string, value: any) => {
    const plans = [...(data.membership_plans || [])]
    plans[index] = { ...plans[index], [field]: value }
    onChange({ ...data, membership_plans: plans })
  }

  const removeMembershipPlan = (index: number) => {
    const plans = [...(data.membership_plans || [])]
    plans.splice(index, 1)
    onChange({ ...data, membership_plans: plans })
  }

  const addFeature = (planIndex: number) => {
    const plans = [...(data.membership_plans || [])]
    plans[planIndex].features.push('')
    onChange({ ...data, membership_plans: plans })
  }

  const updateFeature = (planIndex: number, featureIndex: number, value: string) => {
    const plans = [...(data.membership_plans || [])]
    plans[planIndex].features[featureIndex] = value
    onChange({ ...data, membership_plans: plans })
  }

  const removeFeature = (planIndex: number, featureIndex: number) => {
    const plans = [...(data.membership_plans || [])]
    plans[planIndex].features.splice(featureIndex, 1)
    onChange({ ...data, membership_plans: plans })
  }

  return (
    <div className="space-y-8">
      {/* 会員プラン */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">会員プラン</h3>
          <button
            onClick={addMembershipPlan}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            プラン追加
          </button>
        </div>

        <div className="space-y-6">
          {(data.membership_plans || []).map((plan, planIndex) => (
            <div key={planIndex} className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium text-gray-900">プラン {planIndex + 1}</h4>
                <button
                  onClick={() => removeMembershipPlan(planIndex)}
                  className="p-1 text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">プラン名</label>
                  <input
                    type="text"
                    value={plan.name}
                    onChange={(e) => updateMembershipPlan(planIndex, 'name', e.target.value)}
                    placeholder="例：レギュラー会員"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">料金（円）</label>
                  <input
                    type="number"
                    value={plan.price}
                    onChange={(e) => updateMembershipPlan(planIndex, 'price', parseInt(e.target.value) || 0)}
                    placeholder="10000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">期間</label>
                  <input
                    type="text"
                    value={plan.duration}
                    onChange={(e) => updateMembershipPlan(planIndex, 'duration', e.target.value)}
                    placeholder="例：月額、年額"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                <textarea
                  value={plan.description}
                  onChange={(e) => updateMembershipPlan(planIndex, 'description', e.target.value)}
                  placeholder="プランの詳細説明"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">特典・機能</label>
                  <button
                    onClick={() => addFeature(planIndex)}
                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition-colors"
                  >
                    特典追加
                  </button>
                </div>
                <div className="space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(planIndex, featureIndex, e.target.value)}
                        placeholder="例：24時間利用可能"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={() => removeFeature(planIndex, featureIndex)}
                        className="p-2 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ビジター料金 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ビジター料金</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">料金（円）</label>
            <input
              type="number"
              value={data.day_passes?.price || 0}
              onChange={(e) => onChange({
                ...data,
                day_passes: { ...data.day_passes, price: parseInt(e.target.value) || 0 }
              })}
              placeholder="3000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
            <input
              type="text"
              value={data.day_passes?.description || ''}
              onChange={(e) => onChange({
                ...data,
                day_passes: { ...data.day_passes, description: e.target.value }
              })}
              placeholder="例：1日利用券"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* パーソナルトレーニング */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">パーソナルトレーニング</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={data.personal_training?.available || false}
                onChange={(e) => onChange({
                  ...data,
                  personal_training: { ...data.personal_training, available: e.target.checked }
                })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">パーソナルトレーニング提供</span>
            </label>
          </div>

          {data.personal_training?.available && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">料金範囲</label>
                <input
                  type="text"
                  value={data.personal_training?.price_range || ''}
                  onChange={(e) => onChange({
                    ...data,
                    personal_training: { ...data.personal_training, price_range: e.target.value }
                  })}
                  placeholder="例：¥5,000-¥10,000/回"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                <input
                  type="text"
                  value={data.personal_training?.description || ''}
                  onChange={(e) => onChange({
                    ...data,
                    personal_training: { ...data.personal_training, description: e.target.value }
                  })}
                  placeholder="例：経験豊富なトレーナーが指導"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 支払い方法 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">支払い方法</h3>
        <textarea
          value={data.payment_methods?.join('\n') || ''}
          onChange={(e) => onChange({
            ...data,
            payment_methods: e.target.value.split('\n').filter(method => method.trim())
          })}
          placeholder="例：&#10;現金&#10;クレジットカード&#10;銀行振込&#10;電子マネー"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* キャンセルポリシー */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">キャンセルポリシー</h3>
        <textarea
          value={data.cancellation_policy || ''}
          onChange={(e) => onChange({ ...data, cancellation_policy: e.target.value })}
          placeholder="例：退会は月末の15日までに申請してください。当月内の退会はできません。"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  )
}