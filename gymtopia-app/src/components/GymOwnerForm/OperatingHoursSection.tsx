'use client'

import { Plus, Trash2 } from 'lucide-react'
import type { OperatingHours } from '@/lib/supabase/gym-detailed-info'

interface OperatingHoursSectionProps {
  data: OperatingHours
  onChange: (data: OperatingHours) => void
}

const WEEKDAYS = [
  { key: 'monday', label: '月曜日' },
  { key: 'tuesday', label: '火曜日' },
  { key: 'wednesday', label: '水曜日' },
  { key: 'thursday', label: '木曜日' },
  { key: 'friday', label: '金曜日' },
  { key: 'saturday', label: '土曜日' },
  { key: 'sunday', label: '日曜日' }
]

export default function OperatingHoursSection({ data, onChange }: OperatingHoursSectionProps) {
  const updateRegularHours = (day: string, field: string, value: any) => {
    onChange({
      ...data,
      regular_hours: {
        ...data.regular_hours,
        [day]: {
          ...data.regular_hours?.[day as keyof typeof data.regular_hours],
          [field]: value
        }
      }
    })
  }

  const addSpecialHours = () => {
    const newSpecialHour = {
      date: '',
      hours: '',
      description: ''
    }

    onChange({
      ...data,
      special_hours: [...(data.special_hours || []), newSpecialHour]
    })
  }

  const updateSpecialHours = (index: number, field: string, value: string) => {
    const specialHours = [...(data.special_hours || [])]
    specialHours[index] = { ...specialHours[index], [field]: value }
    onChange({ ...data, special_hours: specialHours })
  }

  const removeSpecialHours = (index: number) => {
    const specialHours = [...(data.special_hours || [])]
    specialHours.splice(index, 1)
    onChange({ ...data, special_hours: specialHours })
  }

  return (
    <div className="space-y-8">
      {/* 通常営業時間 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">通常営業時間</h3>
        <div className="space-y-4">
          {WEEKDAYS.map((weekday) => {
            const dayData = data.regular_hours?.[weekday.key as keyof typeof data.regular_hours]
            return (
              <div key={weekday.key} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-20 font-medium text-gray-700">
                  {weekday.label}
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={!dayData?.closed}
                      onChange={(e) => updateRegularHours(weekday.key, 'closed', !e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">営業</span>
                  </label>
                </div>

                {!dayData?.closed && (
                  <>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={dayData?.open || ''}
                        onChange={(e) => updateRegularHours(weekday.key, 'open', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="text-gray-500">〜</span>
                      <input
                        type="time"
                        value={dayData?.close || ''}
                        onChange={(e) => updateRegularHours(weekday.key, 'close', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </>
                )}

                {dayData?.closed && (
                  <div className="text-gray-500 text-sm">定休日</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 祝日営業時間 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">祝日営業時間</h3>
        <textarea
          value={data.holiday_hours || ''}
          onChange={(e) => onChange({ ...data, holiday_hours: e.target.value })}
          placeholder="例：祝日は通常営業&#10;年末年始（12/29-1/3）は休業&#10;お盆期間（8/13-8/15）は短縮営業"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 特別営業時間 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">特別営業時間</h3>
          <button
            onClick={addSpecialHours}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            特別時間追加
          </button>
        </div>

        <div className="space-y-4">
          {(data.special_hours || []).map((special, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium text-gray-900">特別営業 {index + 1}</h4>
                <button
                  onClick={() => removeSpecialHours(index)}
                  className="p-1 text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
                  <input
                    type="date"
                    value={special.date}
                    onChange={(e) => updateSpecialHours(index, 'date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">営業時間</label>
                  <input
                    type="text"
                    value={special.hours}
                    onChange={(e) => updateSpecialHours(index, 'hours', e.target.value)}
                    placeholder="例：10:00-18:00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                  <input
                    type="text"
                    value={special.description}
                    onChange={(e) => updateSpecialHours(index, 'description', e.target.value)}
                    placeholder="例：年末短縮営業"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* スタッフ在中時間 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">スタッフ在中時間</h3>
        <textarea
          value={data.staff_hours || ''}
          onChange={(e) => onChange({ ...data, staff_hours: e.target.value })}
          placeholder="例：&#10;平日：10:00-21:00&#10;土日：10:00-18:00&#10;パーソナルトレーナー：要予約&#10;無人時間帯：深夜・早朝（会員カードで入館）"
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 備考 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">営業時間に関する備考</h3>
        <textarea
          value={data.note || ''}
          onChange={(e) => onChange({ ...data, note: e.target.value })}
          placeholder="例：&#10;・最終入館は営業終了30分前まで&#10;・無人時間帯は安全のため一人での利用不可&#10;・機械のメンテナンス時間：毎週火曜日9:00-10:00"
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  )
}