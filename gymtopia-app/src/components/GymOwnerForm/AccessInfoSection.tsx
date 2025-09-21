'use client'

import type { AccessInformation } from '@/lib/supabase/gym-detailed-info'

interface AccessInfoSectionProps {
  data: AccessInformation
  onChange: (data: AccessInformation) => void
}

export default function AccessInfoSection({ data, onChange }: AccessInfoSectionProps) {
  return (
    <div className="space-y-8">
      {/* 住所詳細 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">住所詳細</h3>
        <textarea
          value={data.address_details || ''}
          onChange={(e) => onChange({ ...data, address_details: e.target.value })}
          placeholder="例：&#10;〒160-0022 東京都新宿区新宿3-1-1&#10;新宿ビル3階&#10;※1階にコンビニがある建物です&#10;※エレベーターで3階まで上がってください"
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 最寄り駅 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">最寄り駅</h3>
        <input
          type="text"
          value={data.nearest_station || ''}
          onChange={(e) => onChange({ ...data, nearest_station: e.target.value })}
          placeholder="例：JR新宿駅南口、地下鉄新宿三丁目駅"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 徒歩時間 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">徒歩時間</h3>
        <input
          type="text"
          value={data.walking_time || ''}
          onChange={(e) => onChange({ ...data, walking_time: e.target.value })}
          placeholder="例：徒歩5分"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* バスアクセス */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">バスアクセス</h3>
        <textarea
          value={data.bus_access || ''}
          onChange={(e) => onChange({ ...data, bus_access: e.target.value })}
          placeholder="例：&#10;都営バス「新宿駅前」停留所より徒歩3分&#10;系統：都01、宿91、新宿WE&#10;※平日7:00-22:00、15分間隔で運行"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 車アクセス */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">車アクセス</h3>
        <textarea
          value={data.car_access || ''}
          onChange={(e) => onChange({ ...data, car_access: e.target.value })}
          placeholder="例：&#10;首都高4号新宿線「新宿IC」より10分&#10;甲州街道沿い&#10;※混雑時は迂回ルートをおすすめします"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 駐車場情報 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">駐車場情報</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={data.parking?.available || false}
                onChange={(e) => onChange({
                  ...data,
                  parking: { ...data.parking, available: e.target.checked }
                })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">駐車場あり</span>
            </label>
          </div>

          {data.parking?.available && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">収容台数</label>
                <input
                  type="number"
                  value={data.parking?.capacity || 0}
                  onChange={(e) => onChange({
                    ...data,
                    parking: { ...data.parking, capacity: parseInt(e.target.value) || 0 }
                  })}
                  placeholder="例：10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">料金</label>
                <input
                  type="text"
                  value={data.parking?.pricing || ''}
                  onChange={(e) => onChange({
                    ...data,
                    parking: { ...data.parking, pricing: e.target.value }
                  })}
                  placeholder="例：2時間無料、以降30分¥200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">利用時間</label>
                <input
                  type="text"
                  value={data.parking?.time_limit || ''}
                  onChange={(e) => onChange({
                    ...data,
                    parking: { ...data.parking, time_limit: e.target.value }
                  })}
                  placeholder="例：24時間利用可能"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
                <input
                  type="text"
                  value={data.parking?.notes || ''}
                  onChange={(e) => onChange({
                    ...data,
                    parking: { ...data.parking, notes: e.target.value }
                  })}
                  placeholder="例：予約制、先着順"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 自転車駐輪場 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">自転車駐輪場</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={data.bicycle_parking?.available || false}
                onChange={(e) => onChange({
                  ...data,
                  bicycle_parking: { ...data.bicycle_parking, available: e.target.checked }
                })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">自転車駐輪場あり</span>
            </label>
          </div>

          {data.bicycle_parking?.available && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">駐輪場詳細</label>
              <textarea
                value={data.bicycle_parking?.notes || ''}
                onChange={(e) => onChange({
                  ...data,
                  bicycle_parking: { ...data.bicycle_parking, notes: e.target.value }
                })}
                placeholder="例：&#10;・建物前に屋根付き駐輪場あり（20台）&#10;・無料でご利用いただけます&#10;・盗難等については責任を負いかねます"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* アクセシビリティ */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">アクセシビリティ</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={data.accessibility?.wheelchair_accessible || false}
                onChange={(e) => onChange({
                  ...data,
                  accessibility: { ...data.accessibility, wheelchair_accessible: e.target.checked }
                })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">車椅子対応</span>
            </label>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={data.accessibility?.elevator || false}
                onChange={(e) => onChange({
                  ...data,
                  accessibility: { ...data.accessibility, elevator: e.target.checked }
                })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">エレベーターあり</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">アクセシビリティ詳細</label>
            <textarea
              value={data.accessibility?.notes || ''}
              onChange={(e) => onChange({
                ...data,
                accessibility: { ...data.accessibility, notes: e.target.value }
              })}
              placeholder="例：&#10;・車椅子対応のトイレあり&#10;・入口にスロープ設置&#10;・一部マシンは車椅子対応&#10;・介助者の同伴をおすすめします"
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}