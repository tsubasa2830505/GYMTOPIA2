'use client'

interface ServicesFormProps {
  services: Record<string, boolean>
  onToggle: (service: string) => void
  onSave: () => void
  isLoading?: boolean
}

const serviceLabels: Record<string, string> = {
  '24hours': '24時間営業',
  shower: 'シャワー',
  parking: '駐車場',
  locker: 'ロッカー',
  wifi: 'Wi-Fi',
  chalk: 'チョーク',
  belt_rental: 'ベルトレンタル',
  personal_training: 'パーソナルトレーニング',
  group_lesson: 'グループレッスン',
  studio: 'スタジオ',
  sauna: 'サウナ',
  pool: 'プール',
  jacuzzi: 'ジャグジー',
  massage_chair: 'マッサージチェア',
  cafe: 'カフェ',
  women_only: '女性専用',
  barrier_free: 'バリアフリー',
  kids_room: 'キッズルーム',
  english_support: '英語対応',
  drop_in: 'ドロップイン'
}

export default function ServicesForm({
  services,
  onToggle,
  onSave,
  isLoading = false
}: ServicesFormProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[color:var(--foreground)]">サービス・設備</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(serviceLabels).map(([key, label]) => (
          <label
            key={key}
            className="flex items-center space-x-3 p-3 border border-[rgba(231,103,76,0.2)] rounded-lg hover:bg-[rgba(231,103,76,0.05)] transition-colors cursor-pointer"
          >
            <input
              type="checkbox"
              checked={services[key] || false}
              onChange={() => onToggle(key)}
              className="w-4 h-4 text-[color:var(--gt-primary)] border-[rgba(231,103,76,0.3)] rounded focus:ring-[color:var(--gt-primary)]"
            />
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              {label}
            </span>
          </label>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onSave}
          disabled={isLoading}
          className="px-6 py-2 bg-gradient-to-r from-[var(--gt-primary)] to-[var(--gt-secondary)] text-white rounded-lg hover:from-[var(--gt-primary-strong)] hover:to-[var(--gt-tertiary)] transition-all duration-200 disabled:opacity-50"
        >
          {isLoading ? '保存中...' : 'サービス情報を保存'}
        </button>
      </div>
    </div>
  )
}