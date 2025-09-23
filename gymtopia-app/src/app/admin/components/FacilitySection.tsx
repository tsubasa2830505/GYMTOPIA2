'use client'

import { memo, useState, useMemo } from 'react'
import { Plus, Trash2, User } from 'lucide-react'
import { addGymEquipment, deleteGymEquipment } from '@/lib/supabase/admin'
import { equipmentDatabase, getCategories, getEquipmentByCategory, getAllManufacturers } from '@/data/equipment-database'

interface Equipment {
  id: string
  category: string
  name: string
  maker: string
  count?: number
  maxWeight?: number
  creator?: {
    id: string
    display_name?: string
    username?: string
    email?: string
  }
}

interface FacilitySectionProps {
  equipmentList: Equipment[]
  onUpdateEquipmentList: (list: Equipment[]) => void
  gymId?: string
  onEquipmentUpdate?: () => void
}

interface NewEquipment {
  type: 'machine' | 'freeweight'
  category: string
  name: string
  brand: string
  count: number
  weight_range?: string
}

const FacilitySection = memo(function FacilitySection({
  equipmentList,
  onUpdateEquipmentList,
  gymId,
  onEquipmentUpdate
}: FacilitySectionProps) {
  const [newEquipment, setNewEquipment] = useState<NewEquipment>({
    type: 'machine',
    category: '',
    name: '',
    brand: '',
    count: 1,
    weight_range: ''
  })
  const [isAdding, setIsAdding] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  // カテゴリ一覧を取得
  const categories = useMemo(() => getCategories(), [])

  // 選択されたカテゴリに基づいて機器一覧を取得
  const availableEquipment = useMemo(() => {
    if (!newEquipment.category) return []
    return getEquipmentByCategory(newEquipment.category)
  }, [newEquipment.category])

  // 選択された機器に基づいてメーカー一覧を取得
  const availableManufacturers = useMemo(() => {
    const selectedEquipment = availableEquipment.find(eq => eq.name === newEquipment.name)
    return selectedEquipment?.manufacturers || []
  }, [availableEquipment, newEquipment.name])

  // カテゴリが変更された時の処理
  const handleCategoryChange = (category: string) => {
    setNewEquipment(prev => ({
      ...prev,
      category,
      name: '',
      brand: '',
      // typeをカテゴリから推測
      type: ['フリーウェイト', 'ベンチ・ラック'].includes(category) ? 'freeweight' : 'machine'
    }))
  }

  // 機器名が変更された時の処理
  const handleEquipmentNameChange = (name: string) => {
    const selectedEquipment = availableEquipment.find(eq => eq.name === name)
    setNewEquipment(prev => ({
      ...prev,
      name,
      brand: selectedEquipment?.manufacturers[0] || ''
    }))
  }

  const handleAddEquipment = async () => {
    if (!gymId || !newEquipment.category || !newEquipment.name || !newEquipment.brand) {
      alert('カテゴリ、機器名、メーカーは必須項目です')
      return
    }

    setIsAdding(true)
    try {
      await addGymEquipment(gymId, {
        type: newEquipment.type,
        name: newEquipment.name,
        brand: newEquipment.brand,
        count: newEquipment.count,
        weight_range: newEquipment.weight_range || undefined
      })

      // フォームをリセット
      setNewEquipment({
        type: 'machine',
        category: '',
        name: '',
        brand: '',
        count: 1,
        weight_range: ''
      })
      setShowAddForm(false)

      // 親コンポーネントに更新を通知
      onEquipmentUpdate?.()

      alert('設備を追加しました')
    } catch (error) {
      console.error('Error adding equipment:', error)
      alert('設備の追加に失敗しました')
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteEquipment = async (equipmentId: string, equipmentType: string) => {
    if (!gymId) return

    if (!confirm('この設備を削除しますか？')) return

    try {
      const type = equipmentType === 'フリーウェイト' ? 'freeweight' : 'machine'
      await deleteGymEquipment(gymId, equipmentId, type)

      // 親コンポーネントに更新を通知
      onEquipmentUpdate?.()

      alert('設備を削除しました')
    } catch (error) {
      console.error('Error deleting equipment:', error)
      alert('設備の削除に失敗しました')
    }
  }
  return (
    <div className="bg-white border border-[rgba(186,122,103,0.26)] rounded-[14.5px] p-[22px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[14px] font-bold text-[color:var(--foreground)]">設備管理</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-3 py-1.5 bg-[color:var(--gt-primary)] text-white text-[11px] font-medium rounded-lg hover:bg-[color:var(--gt-primary-strong)] transition"
        >
          <Plus className="w-3 h-3" />
          設備を追加
        </button>
      </div>

      {/* 設備追加フォーム */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-[rgba(231,103,76,0.05)] border border-[rgba(231,103,76,0.2)] rounded-lg">
          <h4 className="text-[12.3px] font-bold text-[color:var(--foreground)] mb-3">新しい設備を追加</h4>

          {/* カテゴリ選択 */}
          <div className="mb-3">
            <label className="block text-[11px] text-[color:var(--text-muted)] mb-1">カテゴリ</label>
            <select
              value={newEquipment.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-2 py-1.5 text-[11px] border border-[rgba(186,122,103,0.26)] rounded-md bg-white"
            >
              <option value="">カテゴリを選択してください</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* 機器名選択 */}
          {newEquipment.category && (
            <div className="mb-3">
              <label className="block text-[11px] text-[color:var(--text-muted)] mb-1">機器名</label>
              <select
                value={newEquipment.name}
                onChange={(e) => handleEquipmentNameChange(e.target.value)}
                className="w-full px-2 py-1.5 text-[11px] border border-[rgba(186,122,103,0.26)] rounded-md bg-white"
              >
                <option value="">機器を選択してください</option>
                {availableEquipment.map(equipment => (
                  <option key={equipment.id} value={equipment.name}>{equipment.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* メーカー選択 */}
          {newEquipment.name && availableManufacturers.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] text-[color:var(--text-muted)] mb-1">メーカー</label>
                <select
                  value={newEquipment.brand}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full px-2 py-1.5 text-[11px] border border-[rgba(186,122,103,0.26)] rounded-md bg-white"
                >
                  <option value="">メーカーを選択</option>
                  {availableManufacturers.map(manufacturer => (
                    <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-[color:var(--text-muted)] mb-1">台数</label>
                <input
                  type="number"
                  value={newEquipment.count}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
                  className="w-full px-2 py-1.5 text-[11px] border border-[rgba(186,122,103,0.26)] rounded-md"
                  min="1"
                />
              </div>
            </div>
          )}

          {newEquipment.type === 'freeweight' && (
            <div className="mb-3">
              <label className="block text-[11px] text-[color:var(--text-muted)] mb-1">重量範囲</label>
              <input
                type="text"
                value={newEquipment.weight_range}
                onChange={(e) => setNewEquipment(prev => ({ ...prev, weight_range: e.target.value }))}
                className="w-full px-2 py-1.5 text-[11px] border border-[rgba(186,122,103,0.26)] rounded-md"
                placeholder="1kg-50kg"
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleAddEquipment}
              disabled={isAdding || !newEquipment.category || !newEquipment.name || !newEquipment.brand}
              className="flex items-center gap-2 px-4 py-2 bg-[color:var(--gt-primary)] text-white text-[11px] font-medium rounded-lg hover:bg-[color:var(--gt-primary-strong)] transition disabled:opacity-50"
            >
              {isAdding ? '追加中...' : '追加'}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-[rgba(186,122,103,0.26)] text-[color:var(--text-muted)] text-[11px] font-medium rounded-lg hover:bg-[rgba(254,255,250,0.92)] transition"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* 設備一覧 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[12.3px] font-bold text-[color:var(--foreground)]">現在の設備</h4>
          <div className="text-[10px] text-[color:var(--text-muted)]">
            合計: {equipmentList.length}件
          </div>
        </div>

        {equipmentList.length === 0 ? (
          <div className="text-center py-8 text-[color:var(--text-muted)] text-[11px]">
            設備が登録されていません
          </div>
        ) : (() => {
          // カテゴリ別にグループ化
          const groupedEquipment = equipmentList.reduce((acc, equipment) => {
            if (!acc[equipment.category]) {
              acc[equipment.category] = []
            }
            acc[equipment.category].push(equipment)
            return acc
          }, {} as Record<string, Equipment[]>)

          return (
            <div className="space-y-4">
              {Object.entries(groupedEquipment).map(([category, items]) => (
                <div key={category} className="space-y-2">
                  {/* カテゴリヘッダー */}
                  <div className="flex items-center gap-2 py-2 border-b border-[rgba(186,122,103,0.2)]">
                    <div className="w-2 h-2 rounded-full bg-[color:var(--gt-primary)]"></div>
                    <h5 className="text-[11px] font-bold text-[color:var(--foreground)]">
                      {category} ({items.length}件)
                    </h5>
                  </div>

                  {/* カテゴリ内の設備 */}
                  <div className="space-y-2 pl-4">
                    {items.map((equipment) => (
                      <div
                        key={equipment.id}
                        className="flex items-center justify-between p-3 bg-[rgba(254,255,250,0.96)] border border-[rgba(186,122,103,0.15)] rounded-[6px] hover:shadow-sm transition-shadow"
                      >
                        <div className="flex-1 space-y-1">
                          {/* メイン情報 */}
                          <div className="flex items-center gap-3">
                            <div className="font-medium text-[color:var(--foreground)] text-[12px]">
                              {equipment.name}
                            </div>
                            <div className="text-[10px] px-2 py-0.5 bg-[rgba(231,103,76,0.12)] text-[color:var(--gt-primary-strong)] rounded-full">
                              {equipment.maker}
                            </div>
                            <div className="text-[10px] font-medium text-[color:var(--text-subtle)]">
                              {equipment.maxWeight ? `最大${equipment.maxWeight}kg` : `${equipment.count || '-'}台`}
                            </div>
                          </div>

                          {/* 登録者情報 */}
                          <div className="flex items-center gap-1 text-[10px] text-[color:var(--text-muted)]">
                            <User className="w-3 h-3" />
                            <span>登録者:</span>
                            <span className="font-medium">
                              {equipment.creator ?
                                (equipment.creator.display_name || equipment.creator.username || equipment.creator.email?.split('@')[0] || '不明') :
                                'システム'
                              }
                            </span>
                          </div>
                        </div>

                        {/* 削除ボタン */}
                        <button
                          onClick={() => handleDeleteEquipment(equipment.id, equipment.category)}
                          className="ml-3 p-1.5 text-red-600 hover:bg-red-50 rounded-md transition"
                          title="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        })()}
      </div>
    </div>
  )
})

export default FacilitySection