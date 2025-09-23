'use client'

import { memo } from 'react'

interface Equipment {
  id: string
  category: string
  name: string
  maker: string
  count?: number
  maxWeight?: number
}

interface FacilitySectionProps {
  equipmentList: Equipment[]
  onUpdateEquipmentList: (list: Equipment[]) => void
  gymId?: string
}

const FacilitySection = memo(function FacilitySection({
  equipmentList,
  onUpdateEquipmentList,
  gymId
}: FacilitySectionProps) {
  return (
    <div className="bg-white border border-[rgba(186,122,103,0.26)] rounded-[14.5px] p-[22px]">
      <h3 className="text-[14px] font-bold text-[color:var(--foreground)] mb-4">設備管理</h3>

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
                    <span className="text-[color:var(--text-muted)]">
                      {equipment.maxWeight ? '最大重量:' : '台数:'}
                    </span>
                    <div className="font-medium text-[color:var(--foreground)]">
                      {equipment.maxWeight ? `${equipment.maxWeight}kg` : `${equipment.count || '-'}台`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

export default FacilitySection