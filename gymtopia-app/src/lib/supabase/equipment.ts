import { supabase } from './client'

// マシンカテゴリとマシンを取得
export async function getMachineCategories() {
  try {
    const { data: categories, error } = await supabase
      .from('machine_categories')
      .select(`
        *,
        machines:machines(
          id,
          name,
          type,
          maker,
          target_category,
          brand:maker,
          description
        )
      `)
      .order('display_order')

    if (error) throw error

    // データ形式を変換
    return categories?.map(category => ({
      id: category.slug,
      name: category.name,
      description: category.description,
      icon: category.icon,
      items: category.machines?.map((machine: any) => ({
        id: machine.id,
        name: machine.name || machine.type,
        brand: machine.brand || machine.maker,
        description: machine.description || machine.target_category
      })) || []
    })) || []
  } catch (error) {
    console.error('Error fetching machine categories:', error)
    // フォールバックデータを返す
    return getMockMachineCategories()
  }
}

// フリーウェイトカテゴリとアイテムを取得
export async function getFreeweightCategories() {
  try {
    const { data: categories, error } = await supabase
      .from('freeweight_categories')
      .select(`
        slug,
        name,
        description,
        icon,
        display_order,
        freeweight_items(
          slug,
          name,
          weight_range,
          unit,
          description,
          display_order
        )
      `)
      .order('display_order')

    if (error) throw error

    return categories?.map(category => ({
      id: category.slug,
      name: category.name,
      description: category.description,
      icon: category.icon,
      items: category.freeweight_items?.map((item: any) => ({
        id: item.slug,
        name: item.name,
        weightRange: item.weight_range,
        unit: item.unit,
        description: item.description
      })) || []
    })) || []
  } catch (error) {
    console.error('Error fetching freeweight categories:', error)
    return getMockFreeweightCategories()
  }
}

// 施設カテゴリとアイテムを取得
export async function getFacilityCategories() {
  try {
    const { data: categories, error } = await supabase
      .from('facility_categories')
      .select(`
        *,
        items:facility_items(*)
      `)
      .order('display_order')

    if (error) throw error

    return categories?.map(category => ({
      id: category.slug,
      name: category.name,
      description: category.description,
      icon: category.icon,
      items: category.items?.map((item: any) => ({
        id: item.slug,
        name: item.name,
        description: item.description
      })) || []
    })) || []
  } catch (error) {
    console.error('Error fetching facility categories:', error)
    return getMockFacilityCategories()
  }
}

// ジムのマシンを取得
export async function getGymMachinesByCategory(gymId: string) {
  try {
    const { data, error } = await supabase
      .from('gym_machines')
      .select(`
        *,
        machine:machines(
          *,
          category:machine_categories(*)
        )
      `)
      .eq('gym_id', gymId)
      .order('machine(category(display_order))')

    if (error) throw error

    // カテゴリごとにグループ化
    const grouped = data?.reduce((acc: any, item: any) => {
      const categorySlug = item.machine?.category?.slug || 'other'
      if (!acc[categorySlug]) {
        acc[categorySlug] = {
          category: item.machine?.category,
          machines: []
        }
      }
      acc[categorySlug].machines.push(item.machine)
      return acc
    }, {})

    return grouped || {}
  } catch (error) {
    console.error('Error fetching gym machines:', error)
    return {}
  }
}

// ジムのフリーウェイトを取得
export async function getGymFreeweights(gymId: string) {
  try {
    const { data, error } = await supabase
      .from('gym_freeweights')
      .select(`
        *,
        freeweight:freeweight_items(
          *,
          category:freeweight_categories(*)
        )
      `)
      .eq('gym_id', gymId)
      .order('freeweight(category(display_order))')

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching gym freeweights:', error)
    return []
  }
}

// ジムの施設を取得
export async function getGymFacilities(gymId: string) {
  try {
    const { data, error } = await supabase
      .from('gym_facilities')
      .select(`
        *,
        facility:facility_items(
          *,
          category:facility_categories(*)
        )
      `)
      .eq('gym_id', gymId)
      .order('facility(category(display_order))')

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching gym facilities:', error)
    return []
  }
}

// モックデータ（フォールバック用）
function getMockMachineCategories() {
  return [
    {
      id: 'chest',
      name: '胸部マシン',
      description: 'チェストプレス、ペックフライなど',
      icon: '💪',
      items: [
        { id: 'chest_press', name: 'チェストプレス', brand: 'Hammer Strength', description: 'アイソラテラル式' },
        { id: 'incline_press', name: 'インクラインチェストプレス', brand: 'Life Fitness', description: '上部胸筋' },
        { id: 'pec_fly', name: 'ペックフライ/ペックデック', brand: 'Cybex', description: '胸筋内側' },
      ]
    },
    {
      id: 'back',
      name: '背中マシン',
      description: 'ラットプルダウン、ローイングなど',
      icon: '🦾',
      items: [
        { id: 'lat_pulldown', name: 'ラットプルダウン', brand: 'Hammer Strength', description: 'アイソラテラル式' },
        { id: 'seated_row', name: 'シーテッドロー', brand: 'Life Fitness', description: '中背部' },
        { id: 'cable_row', name: 'ケーブルロー', brand: 'Technogym', description: '多角度調整' },
      ]
    },
    {
      id: 'legs',
      name: '脚部マシン',
      description: 'レッグプレス、レッグカールなど',
      icon: '🦵',
      items: [
        { id: 'leg_press', name: 'レッグプレス', brand: 'Hammer Strength', description: '45度/水平' },
        { id: 'hack_squat', name: 'ハックスクワット', brand: 'Cybex', description: '安全なスクワット' },
        { id: 'leg_extension', name: 'レッグエクステンション', brand: 'Life Fitness', description: '大腿四頭筋' },
      ]
    }
  ]
}

function getMockFreeweightCategories() {
  return [
    {
      id: 'dumbbells',
      name: 'ダンベル',
      description: '各種重量のダンベル',
      icon: '🏋️',
      items: [
        { id: 'hex_dumbbells', name: 'ヘックスダンベル', weightRange: '1-50', unit: 'kg' },
        { id: 'round_dumbbells', name: 'ラウンドダンベル', weightRange: '1-40', unit: 'kg' },
        { id: 'adjustable_dumbbells', name: '可変式ダンベル', weightRange: '2.5-24', unit: 'kg' },
      ]
    },
    {
      id: 'barbells',
      name: 'バーベル',
      description: 'オリンピックバー、EZバーなど',
      icon: '🏋️‍♂️',
      items: [
        { id: 'olympic_bar', name: 'オリンピックバー', weightRange: '20', unit: 'kg' },
        { id: 'ez_bar', name: 'EZバー', weightRange: '10-15', unit: 'kg' },
        { id: 'straight_bar', name: 'ストレートバー', weightRange: '10-20', unit: 'kg' },
      ]
    }
  ]
}

function getMockFacilityCategories() {
  return [
    {
      id: 'amenities',
      name: '基本設備',
      description: 'シャワー、ロッカーなど',
      icon: '🚿',
      items: [
        { id: 'shower', name: 'シャワー', description: '更衣室内シャワー設備' },
        { id: 'locker', name: 'ロッカー', description: '鍵付きロッカー' },
        { id: 'towel_service', name: 'タオルサービス', description: 'レンタルタオル' },
      ]
    },
    {
      id: 'training',
      name: 'トレーニング施設',
      description: 'スタジオ、プールなど',
      icon: '🏋️',
      items: [
        { id: 'studio', name: 'スタジオ', description: 'グループレッスン用スタジオ' },
        { id: 'pool', name: 'プール', description: '屋内プール' },
        { id: 'crossfit_area', name: 'クロスフィットエリア', description: '専用トレーニングエリア' },
      ]
    }
  ]
}