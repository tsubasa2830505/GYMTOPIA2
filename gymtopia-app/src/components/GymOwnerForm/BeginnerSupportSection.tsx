'use client'

import type { BeginnerSupport } from '@/lib/supabase/gym-detailed-info'

interface BeginnerSupportSectionProps {
  data: BeginnerSupport
  onChange: (data: BeginnerSupport) => void
}

export default function BeginnerSupportSection({ data, onChange }: BeginnerSupportSectionProps) {
  return (
    <div className="space-y-8">
      {/* オリエンテーション */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">オリエンテーション</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={data.orientation_available || false}
                onChange={(e) => onChange({ ...data, orientation_available: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">オリエンテーション提供</span>
            </label>
          </div>

          {data.orientation_available && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">オリエンテーション詳細</label>
              <textarea
                value={data.orientation_details || ''}
                onChange={(e) => onChange({ ...data, orientation_details: e.target.value })}
                placeholder="例：&#10;・施設の使い方説明（30分）&#10;・基本的なマシンの使い方指導&#10;・トレーニングプログラムの相談&#10;・初回は無料、2回目以降は¥2,000"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* 無料相談 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">無料相談</h3>
        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.free_consultation || false}
              onChange={(e) => onChange({ ...data, free_consultation: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">無料相談あり</span>
          </label>
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
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={data.personal_training?.trial_session || false}
                    onChange={(e) => onChange({
                      ...data,
                      personal_training: { ...data.personal_training, trial_session: e.target.checked }
                    })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">体験セッションあり</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">料金</label>
                <input
                  type="text"
                  value={data.personal_training?.pricing || ''}
                  onChange={(e) => onChange({
                    ...data,
                    personal_training: { ...data.personal_training, pricing: e.target.value }
                  })}
                  placeholder="例：¥5,000/回、初回体験¥3,000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* グループクラス */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">グループクラス</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={data.group_classes?.beginner_friendly || false}
                onChange={(e) => onChange({
                  ...data,
                  group_classes: { ...data.group_classes, beginner_friendly: e.target.checked }
                })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">初心者向けクラスあり</span>
            </label>
          </div>

          {data.group_classes?.beginner_friendly && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">提供クラス</label>
              <textarea
                value={data.group_classes?.classes?.join('\n') || ''}
                onChange={(e) => onChange({
                  ...data,
                  group_classes: {
                    ...data.group_classes,
                    classes: e.target.value.split('\n').filter(cls => cls.trim())
                  }
                })}
                placeholder="例：&#10;初心者向けヨガ&#10;ベーシック筋トレ教室&#10;正しいフォーム講座&#10;ダイエット向けエアロビクス"
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* 器具説明 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">器具説明</h3>
        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.equipment_introduction || false}
              onChange={(e) => onChange({ ...data, equipment_introduction: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">器具の使い方説明あり</span>
          </label>
        </div>
      </div>

      {/* スタッフサポート */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">スタッフサポート</h3>
        <textarea
          value={data.staff_support || ''}
          onChange={(e) => onChange({ ...data, staff_support: e.target.value })}
          placeholder="例：&#10;・常駐スタッフがいつでもサポート&#10;・初回利用時は専属スタッフが付き添い&#10;・トレーニングプログラム作成（無料）&#10;・食事指導も可能（有料）"
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* リソース・教材 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">リソース・教材</h3>
        <textarea
          value={data.resources?.join('\n') || ''}
          onChange={(e) => onChange({
            ...data,
            resources: e.target.value.split('\n').filter(resource => resource.trim())
          })}
          placeholder="例：&#10;トレーニングガイドブック（無料配布）&#10;栄養管理アプリの紹介&#10;初心者向けDVD貸出&#10;専用ウェブサイトでのQ&A"
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 体験会員 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">体験会員制度</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={data.trial_membership?.available || false}
                onChange={(e) => onChange({
                  ...data,
                  trial_membership: { ...data.trial_membership, available: e.target.checked }
                })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">体験会員制度あり</span>
            </label>
          </div>

          {data.trial_membership?.available && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">期間</label>
                <input
                  type="text"
                  value={data.trial_membership?.duration || ''}
                  onChange={(e) => onChange({
                    ...data,
                    trial_membership: { ...data.trial_membership, duration: e.target.value }
                  })}
                  placeholder="例：1週間、3日間"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">料金</label>
                <input
                  type="text"
                  value={data.trial_membership?.price || ''}
                  onChange={(e) => onChange({
                    ...data,
                    trial_membership: { ...data.trial_membership, price: e.target.value }
                  })}
                  placeholder="例：¥1,000、無料"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}