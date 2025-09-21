import { memo } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Equipment } from '../types'

interface FacilitySectionProps {
  equipmentList: Equipment[]
  newEquipment: Partial<Equipment>
  onEquipmentChange: (field: keyof Equipment, value: string | number) => void
  onAddEquipment: () => void
  onDeleteEquipment: (id: string) => void
}

const FacilitySection = memo(function FacilitySection({
  equipmentList,
  newEquipment,
  onEquipmentChange,
  onAddEquipment,
  onDeleteEquipment
}: FacilitySectionProps) {
  const equipmentCategories = [
    'フリーウェイト',
    'マシン',
    'カーディオ',
    'ファンクショナル',
    'その他'
  ]

  return (
    <div className="bg-white border border-[rgba(186,122,103,0.26)] rounded-[14.5px] p-[22px]">
      <h3 className="text-[14px] font-bold text-[color:var(--foreground)] mb-4">設備管理</h3>

      {/* 新しい設備追加フォーム */}
      <div className="mb-6 p-4 bg-[rgba(254,255,250,0.5)] border border-[rgba(186,122,103,0.15)] rounded-[8.5px]">
        <h4 className="text-[12.3px] font-bold text-[color:var(--foreground)] mb-3">新しい設備を追加</h4>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="block text-[11px] text-[color:var(--foreground)] mb-1">
              カテゴリ
            </label>
            <select
              className="w-full px-2 py-1.5 bg-white border border-[rgba(186,122,103,0.26)] rounded-[6px] text-[11px] text-[color:var(--foreground)]"
              value={newEquipment.category || ''}
              onChange={(e) => onEquipmentChange('category', e.target.value)}
            >
              <option value="">選択してください</option>
              {equipmentCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-[color:var(--foreground)] mb-1">
              器具名
            </label>
            <input
              type="text"
              className="w-full px-2 py-1.5 bg-white border border-[rgba(186,122,103,0.26)] rounded-[6px] text-[11px] text-[color:var(--foreground)]"
              value={newEquipment.name || ''}
              onChange={(e) => onEquipmentChange('name', e.target.value)}
              placeholder="例: バーベル"
            />
          </div>

          <div>
            <label className="block text-[11px] text-[color:var(--foreground)] mb-1">
              メーカー
            </label>
            <input
              type="text"
              className="w-full px-2 py-1.5 bg-white border border-[rgba(186,122,103,0.26)] rounded-[6px] text-[11px] text-[color:var(--foreground)]"
              value={newEquipment.maker || ''}
              onChange={(e) => onEquipmentChange('maker', e.target.value)}
              placeholder="例: ライフフィットネス"
            />
          </div>

          <div>
            <label className="block text-[11px] text-[color:var(--foreground)] mb-1">
              台数
            </label>
            <input
              type="number"
              className="w-full px-2 py-1.5 bg-white border border-[rgba(186,122,103,0.26)] rounded-[6px] text-[11px] text-[color:var(--foreground)]"
              value={newEquipment.count || ''}
              onChange={(e) => onEquipmentChange('count', parseInt(e.target.value))}
              placeholder="1"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onAddEquipment}
            className="flex items-center px-3 py-1.5 bg-[var(--gt-primary)] text-white rounded-[6px] hover:bg-[var(--gt-primary-strong)] transition-colors text-[11px]"
          >
            <Plus className="w-3 h-3 mr-1" />
            追加
          </button>
        </div>
      </div>

      {/* 設備一覧 */}
      <div className="space-y-3">
        <h4 className="text-[12.3px] font-bold text-[color:var(--foreground)]">現在の設備</h4>

        {equipmentList.length === 0 ? (
          <div className="text-center py-8 text-[color:var(--text-muted)] text-[11px]">
            設備が登録されていません
          </div>
        ) : (
          <div className="grid gap-2">
            {equipmentList.map((equipment) => (
              <div
                key={equipment.id}
                className="flex items-center justify-between p-3 bg-white border border-[rgba(186,122,103,0.15)] rounded-[6px]"
              >
                <div className="flex-1 grid grid-cols-4 gap-3 text-[11px]">
                  <div>
                    <span className="text-[color:var(--text-muted)]">カテゴリ:</span>
                    <div className="font-medium text-[color:var(--foreground)]">{equipment.category}</div>
                  </div>
                  <div>
                    <span className="text-[color:var(--text-muted)]">器具名:</span>
                    <div className="font-medium text-[color:var(--foreground)]">{equipment.name}</div>
                  </div>
                  <div>
                    <span className="text-[color:var(--text-muted)]">メーカー:</span>
                    <div className="font-medium text-[color:var(--foreground)]">{equipment.maker}</div>
                  </div>
                  <div>
                    <span className="text-[color:var(--text-muted)]">台数:</span>
                    <div className="font-medium text-[color:var(--foreground)]">{equipment.count || '-'}台</div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteEquipment(equipment.id)}
                  className="ml-3 p-1.5 text-red-600 hover:bg-red-50 rounded-[4px] transition-colors"
                  title="削除"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

export default FacilitySection