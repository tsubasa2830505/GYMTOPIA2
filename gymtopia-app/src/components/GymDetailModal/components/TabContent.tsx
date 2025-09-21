import { memo } from 'react'
import { Dumbbell, Activity, Building } from 'lucide-react'
import type { TabContentProps } from '../types'

interface ExtendedTabContentProps extends TabContentProps {
  onTabChange: (tab: string) => void
}

const TabContent = memo(function TabContent({ gymData, activeTab, gymId, onTabChange }: ExtendedTabContentProps) {
  return (
    <div className="px-4 sm:px-6">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[rgba(254,255,250,0.95)] rounded-2xl mb-4 overflow-x-auto">
        {[
          { id: 'freeweights', label: 'フリーウェイト', icon: Dumbbell },
          { id: 'machines', label: 'マシン', icon: Activity },
          { id: 'facilities', label: '施設', icon: Building }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 min-w-[75px] flex items-center justify-center gap-1 px-2 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-[color:var(--gt-secondary-strong)] shadow-sm'
                : 'text-[color:var(--text-muted)]'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content - Free Weights */}
      {activeTab === 'freeweights' && (
        <div className="space-y-3 mb-5">
          {gymData.freeWeights.length === 0 ? (
            <div className="text-center py-8 text-[color:var(--text-muted)]">
              <p>フリーウェイト情報が登録されていません</p>
              <p className="text-xs mt-2">gymId: {gymId}</p>
            </div>
          ) : (
            gymData.freeWeights.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-white border border-[rgba(186,122,103,0.26)] rounded-xl"
              >
                <div className="w-2 h-2 bg-[rgba(240,142,111,0.1)] rounded-full mt-2" />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-[color:var(--foreground)]">
                      {item.name}
                    </h3>
                    <span className="px-2 py-0.5 bg-[rgba(240,142,111,0.16)] text-[color:var(--gt-secondary-strong)] rounded-lg text-xs font-medium">
                      {item.brand}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[color:var(--text-muted)]">
                    {item.count && (
                      <span className="flex items-center gap-1">
                        <span className="font-bold text-[color:var(--gt-secondary-strong)]">{item.count}</span>
                        <span>台設置</span>
                      </span>
                    )}
                    {item.range && <span>{item.range}</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content - Machines */}
      {activeTab === 'machines' && (
        <div className="space-y-3 mb-5">
          {gymData.machines.length === 0 ? (
            <div className="text-center py-8 text-[color:var(--text-muted)]">
              <p>マシン情報が登録されていません</p>
              <p className="text-xs mt-2">gymId: {gymId}</p>
            </div>
          ) : (
            gymData.machines.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-white border border-[rgba(186,122,103,0.26)] rounded-xl"
              >
                <div className="w-2 h-2 bg-[color:var(--gt-primary)] rounded-full mt-2" />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-[color:var(--foreground)]">
                      {item.name}
                    </h3>
                    <span className="px-2 py-0.5 bg-[rgba(240,142,111,0.14)] text-[color:var(--gt-secondary-strong)] rounded-lg text-xs font-medium">
                      {item.brand}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[color:var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <span className="font-bold text-[color:var(--gt-secondary-strong)]">{item.count}</span>
                      <span>台設置</span>
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content - Facilities */}
      {activeTab === 'facilities' && (
        <div className="space-y-3 mb-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: '24hours', name: '24時間営業', available: gymData.facilities['24hours'] },
              { key: 'shower', name: 'シャワー', available: gymData.facilities.shower },
              { key: 'parking', name: '駐車場', available: gymData.facilities.parking },
              { key: 'locker', name: 'ロッカー', available: gymData.facilities.locker },
              { key: 'wifi', name: 'Wi-Fi', available: gymData.facilities.wifi },
              { key: 'chalk', name: 'チョーク利用可', available: gymData.facilities.chalk },
              { key: 'belt_rental', name: 'ベルト貸出', available: gymData.facilities.belt_rental },
              { key: 'personal_training', name: 'パーソナル', available: gymData.facilities.personal_training },
              { key: 'group_lesson', name: 'グループレッスン', available: gymData.facilities.group_lesson },
              { key: 'studio', name: 'スタジオ', available: gymData.facilities.studio },
              { key: 'sauna', name: 'サウナ', available: gymData.facilities.sauna },
              { key: 'pool', name: 'プール', available: gymData.facilities.pool },
              { key: 'jacuzzi', name: 'ジャグジー', available: gymData.facilities.jacuzzi },
              { key: 'massage_chair', name: 'マッサージチェア', available: gymData.facilities.massage_chair },
              { key: 'cafe', name: 'カフェ/売店', available: gymData.facilities.cafe },
              { key: 'women_only', name: '女性専用エリア', available: gymData.facilities.women_only },
              { key: 'barrier_free', name: 'バリアフリー', available: gymData.facilities.barrier_free },
              { key: 'kids_room', name: 'キッズルーム', available: gymData.facilities.kids_room },
              { key: 'english_support', name: '英語対応', available: gymData.facilities.english_support },
              { key: 'drop_in', name: 'ドロップイン', available: gymData.facilities.drop_in },
            ].map((facility) => (
              <div
                key={facility.key}
                className="flex items-center justify-between p-3 bg-white border border-[rgba(186,122,103,0.26)] rounded-xl"
              >
                <span className="text-sm font-medium text-[color:var(--foreground)]">{facility.name}</span>
                <span className={`text-lg font-bold px-3 py-1 rounded-full ${
                  facility.available
                    ? 'bg-[rgba(240,142,111,0.16)] text-[color:var(--gt-secondary-strong)]'
                    : 'bg-[rgba(231,103,76,0.12)] text-[color:var(--gt-primary-strong)]'
                }`}>
                  {facility.available ? '○' : '×'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
})

export default TabContent