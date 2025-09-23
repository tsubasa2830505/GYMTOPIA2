'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Gym } from '@/lib/supabase/types'
import { getUserGymSelections, updateUserPrimaryGym, addSecondaryGym, removeSecondaryGym } from '@/lib/supabase/my-gym'

interface MyGymManagerProps {
  userId: string
  onUpdate?: () => void
}

export default function MyGymManager({ userId, onUpdate }: MyGymManagerProps) {
  const [selections, setSelections] = useState<{
    primaryGym: Gym | null
    secondaryGyms: Gym[]
  }>({ primaryGym: null, secondaryGyms: [] })

  const [availableGyms, setAvailableGyms] = useState<Gym[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)

      // Load user's current selections
      const userSelections = await getUserGymSelections(userId)
      setSelections(userSelections)

      // Load all available gyms for selection
      const supabase = createClient()
      const { data: gyms, error } = await supabase
        .from('gyms')
        .select('*')
        .order('name')

      if (error) throw error
      setAvailableGyms(gyms || [])

    } catch (error) {
      console.error('Failed to load gym data:', error)
      alert('ジム情報の読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [userId])

  const handleSetPrimaryGym = async (gym: Gym) => {
    try {
      setUpdating(true)
      await updateUserPrimaryGym(userId, gym.id)
      await loadData()
      onUpdate?.()

      alert(`${gym.name}をメインジムに設定しました`)
    } catch (error) {
      console.error('Failed to update primary gym:', error)
      alert('メインジムの設定に失敗しました')
    } finally {
      setUpdating(false)
    }
  }

  const handleAddSecondaryGym = async (gym: Gym) => {
    try {
      setUpdating(true)
      await addSecondaryGym(userId, gym.id)
      await loadData()
      onUpdate?.()

      alert(`${gym.name}をサブジムに追加しました`)
    } catch (error) {
      console.error('Failed to add secondary gym:', error)
      alert('サブジムの追加に失敗しました')
    } finally {
      setUpdating(false)
    }
  }

  const handleRemoveSecondaryGym = async (gymId: string) => {
    try {
      setUpdating(true)
      await removeSecondaryGym(userId, gymId)
      await loadData()
      onUpdate?.()

      alert('サブジムから削除しました')
    } catch (error) {
      console.error('Failed to remove secondary gym:', error)
      alert('サブジムの削除に失敗しました')
    } finally {
      setUpdating(false)
    }
  }

  const selectedGymIds = [
    selections.primaryGym?.id,
    ...selections.secondaryGyms.map(g => g.id)
  ].filter(Boolean)

  const availableForSelection = availableGyms.filter(gym =>
    !selectedGymIds.includes(gym.id)
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Selections */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
          マイジム設定
        </h3>

        {/* Primary Gym */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-[color:var(--foreground)]">
            メインジム (1つ)
          </h4>
          {selections.primaryGym ? (
            <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-blue-900">{selections.primaryGym.name}</div>
                  <div className="text-xs text-blue-700">{selections.primaryGym.address}</div>
                </div>
                <button
                  onClick={() => handleSetPrimaryGym({ ...selections.primaryGym!, id: '' } as Gym)}
                  disabled={updating}
                  className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  変更
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
              メインジムが設定されていません
            </div>
          )}
        </div>

        {/* Secondary Gyms */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-[color:var(--foreground)]">
            サブジム ({selections.secondaryGyms.length}/2)
          </h4>
          {selections.secondaryGyms.length > 0 ? (
            <div className="space-y-2">
              {selections.secondaryGyms.map((gym) => (
                <div key={gym.id} className="p-3 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-green-900">{gym.name}</div>
                      <div className="text-xs text-green-700">{gym.address}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveSecondaryGym(gym.id)}
                      disabled={updating}
                      className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
              サブジムが設定されていません
            </div>
          )}
        </div>
      </div>

      {/* Add New Gym */}
      {(availableForSelection.length > 0 && (
        !selections.primaryGym || selections.secondaryGyms.length < 2
      )) && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-[color:var(--foreground)]">
            ジムを追加
          </h4>
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            {availableForSelection.map((gym) => (
              <div key={gym.id} className="p-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-[color:var(--foreground)]">{gym.name}</div>
                    <div className="text-xs text-[color:var(--text-muted)]">{gym.address}</div>
                    {gym.monthlyPrice && (
                      <div className="text-xs text-blue-600 font-medium">
                        月額 ¥{gym.monthlyPrice.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!selections.primaryGym && (
                      <button
                        onClick={() => handleSetPrimaryGym(gym)}
                        disabled={updating}
                        className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        メインに設定
                      </button>
                    )}
                    {selections.primaryGym && selections.secondaryGyms.length < 2 && (
                      <button
                        onClick={() => handleAddSecondaryGym(gym)}
                        disabled={updating}
                        className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        サブに追加
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-xs text-blue-800">
          <div className="font-medium mb-1">マイジム機能について</div>
          <ul className="space-y-1 text-blue-700">
            <li>• メインジム: 1つまで設定可能</li>
            <li>• サブジム: 2つまで追加可能</li>
            <li>• 合計最大3つのジムを管理できます</li>
            <li>• プロフィールページで確認できます</li>
          </ul>
        </div>
      </div>
    </div>
  )
}