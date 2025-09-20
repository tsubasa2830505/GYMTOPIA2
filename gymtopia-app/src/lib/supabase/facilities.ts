import { createClient } from '@supabase/supabase-js'
import type { FacilityFormData, GymFacility } from '@/types/facilities'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * ジムの施設情報を登録・更新
 */
export async function upsertGymFacilities(data: FacilityFormData): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: '認証が必要です' }
    }

    // 既存ジムを名前で取得（新規作成は要求しない）
    const { data: gym, error: gymError } = await supabase
      .from('gyms')
      .select('id')
      .eq('name', data.gymName)
      .single()

    if (gymError || !gym) {
      return { success: false, error: 'ジムが見つかりません。先にジム情報（名称・住所など）を登録してください。' }
    }

    const gymId = gym.id as string

    // 1) マシン: MachineSelectorは `machines` ビューの id（= equipment.id::text）を渡す想定
    if (data.machines.size > 0) {
      const machineIds = Array.from(data.machines.keys())
      // equipmentの存在確認（UUID形式のみ対象）
      const validIds = machineIds.filter(id => /[0-9a-fA-F-]{36}/.test(id))

      if (validIds.length > 0) {
        const { data: equipments, error: eqErr } = await supabase
          .from('equipment')
          .select('id')
          .in('id', validIds)

        if (eqErr) {
          console.error('Failed to lookup equipment:', eqErr)
        } else if (equipments && equipments.length > 0) {
          const rows = equipments.map(e => ({
            gym_id: gymId,
            equipment_id: e.id,
            count: data.machines.get(e.id as string) || 1,
            condition: 'good'
          }))

          // upsert into gym_equipment
          const { error: upErr } = await supabase
            .from('gym_equipment')
            .upsert(rows, { onConflict: 'gym_id,equipment_id' })

          if (upErr) {
            console.error('Failed to upsert gym_equipment (machines):', upErr)
            return { success: false, error: 'マシン情報の登録に失敗しました' }
          }
        }
      }
    }

    // 2) フリーウェイト: nameベースでequipmentを解決（type = 'free_weight'）
    if (data.freeWeights.size > 0) {
      const names = Array.from(data.freeWeights)
      // 正規化: exact match優先
      const { data: fwEquipments, error: fwErr } = await supabase
        .from('equipment')
        .select('id,name')
        .eq('type', 'free_weight')
        .in('name', names)

      if (fwErr) {
        console.error('Failed to lookup free weight equipment:', fwErr)
      } else {
        const rows = (fwEquipments || []).map(e => ({
          gym_id: gymId,
          equipment_id: e.id,
          count: 1, // 有無ベースなので常に1
          condition: 'good'
        }))

        if (rows.length > 0) {
          const { error: upErr } = await supabase
            .from('gym_equipment')
            .upsert(rows, { onConflict: 'gym_id,equipment_id' })
          if (upErr) {
            console.error('Failed to upsert gym_equipment (free weights):', upErr)
            return { success: false, error: 'フリーウェイト情報の登録に失敗しました' }
          }
        }

        // 未解決のフリーウェイト名
        const resolved = new Set((fwEquipments || []).map(e => e.name))
        const unresolved = names.filter(n => !resolved.has(n))
        if (unresolved.length > 0) {
          console.warn('Unresolved free weight items (no matching equipment):', unresolved)
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error upserting gym facilities:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '施設情報の登録に失敗しました'
    }
  }
}

/**
 * ジムの施設情報を取得
 */
export async function getGymFacilities(gymId: string): Promise<GymFacility | null> {
  try {
    // 正規化テーブルから復元
    const { data, error } = await supabase
      .from('gym_equipment')
      .select('equipment:equipment(name,type), count')
      .eq('gym_id', gymId)

    if (error) {
      console.error('Error fetching gym equipment:', error)
      return null
    }

    const freeWeights: { name: string; count?: number }[] = []
    const machines: { name: string; count: number }[] = []

    ;(data || []).forEach((row: any) => {
      if (row.equipment?.type === 'free_weight') {
        freeWeights.push({ name: row.equipment.name, count: row.count })
      } else {
        machines.push({ name: row.equipment?.name || 'Unknown', count: row.count || 1 })
      }
    })

    const now = new Date().toISOString()
    const facility: GymFacility = {
      id: `${gymId}-facilities`,
      gym_id: gymId,
      free_weights: freeWeights,
      machines,
      created_at: now,
      updated_at: now,
      updated_by: ''
    }
    return facility
  } catch (error) {
    console.error('Error in getGymFacilities:', error)
    return null
  }
}

/**
 * 特定の機器を持つジムを検索
 */
export async function searchGymsByEquipment(
  freeWeights: string[] = [],
  machines: string[] = []
): Promise<string[]> {
  try {
    // 名前からequipment.idを解決
    const names = [...freeWeights, ...machines]
    if (names.length === 0) return []

    const { data: eqByName, error: eqErr } = await supabase
      .from('equipment')
      .select('id,name,type')
      .in('name', names)

    if (eqErr) {
      console.error('Error resolving equipment by name:', eqErr)
      return []
    }

    const freeIds = new Set((eqByName || []).filter(e => e.type === 'free_weight').map(e => e.id))
    const machIds = new Set((eqByName || []).filter(e => e.type !== 'free_weight').map(e => e.id))
    const unionIds = Array.from(new Set([...freeIds, ...machIds]))

    if (unionIds.length === 0) return []

    const ge = supabase.from('gym_equipment').select('gym_id').in('equipment_id', unionIds)

    const { data: geRows, error: geErr } = await ge
    if (geErr) {
      console.error('Error searching gyms by gym_equipment:', geErr)
      return []
    }
    return (geRows || []).map((r: any) => r.gym_id)
  } catch (error) {
    console.error('Error in searchGymsByEquipment:', error)
    return []
  }
}
