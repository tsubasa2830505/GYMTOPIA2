// 実在するジム設備のマスターデータベース

export interface EquipmentItem {
  id: string
  category: string
  name: string
  manufacturers: string[]
  popularModels?: string[]
}

export const equipmentDatabase: EquipmentItem[] = [
  // フリーウェイト
  {
    id: 'barbell',
    category: 'フリーウェイト',
    name: 'バーベル',
    manufacturers: ['IVANKO', 'ELEIKO', 'ROGUE', 'UESAKA', 'アイロテック'],
    popularModels: ['オリンピックバー 20kg', 'オリンピックバー 15kg', 'EZバー', 'ヘックスバー']
  },
  {
    id: 'dumbbell',
    category: 'フリーウェイト',
    name: 'ダンベル',
    manufacturers: ['IVANKO', 'ELEIKO', 'PowerBlock', 'アイロテック', 'WILD FIT'],
    popularModels: ['固定式ダンベル', '可変式ダンベル', 'パワーブロック']
  },
  {
    id: 'plate',
    category: 'フリーウェイト',
    name: 'プレート',
    manufacturers: ['IVANKO', 'ELEIKO', 'ROGUE', 'アイロテック'],
    popularModels: ['オリンピックプレート', 'ラバーコーティング', 'アイアンプレート']
  },
  {
    id: 'kettlebell',
    category: 'フリーウェイト',
    name: 'ケトルベル',
    manufacturers: ['ROGUE', 'Dragon Door', 'KETTLEBELL JAPAN', 'アイロテック'],
    popularModels: ['4kg〜48kg各種']
  },

  // マシン - ハンマーストレングス
  {
    id: 'hs_chest_press',
    category: 'マシン',
    name: 'チェストプレス',
    manufacturers: ['Hammer Strength', 'Life Fitness', 'Nautilus', 'CYBEX', 'Precor'],
    popularModels: ['プレートロード式', 'セレクタライズ式', 'コンバージング']
  },
  {
    id: 'hs_lat_pulldown',
    category: 'マシン',
    name: 'ラットプルダウン',
    manufacturers: ['Hammer Strength', 'Life Fitness', 'CYBEX', 'Technogym', 'Matrix'],
    popularModels: ['ISO-Lateral', 'セレクタライズ', 'プレートロード']
  },
  {
    id: 'hs_leg_press',
    category: 'マシン',
    name: 'レッグプレス',
    manufacturers: ['Hammer Strength', 'Life Fitness', 'CYBEX', 'Nautilus', 'Precor'],
    popularModels: ['45度レッグプレス', 'ホリゾンタルレッグプレス', 'ISO-Lateral']
  },
  {
    id: 'hs_shoulder_press',
    category: 'マシン',
    name: 'ショルダープレス',
    manufacturers: ['Hammer Strength', 'Life Fitness', 'CYBEX', 'Matrix', 'Technogym'],
    popularModels: ['ISO-Lateral', 'MTS', 'セレクタライズ']
  },
  {
    id: 'hs_row',
    category: 'マシン',
    name: 'ロウイング',
    manufacturers: ['Hammer Strength', 'Life Fitness', 'CYBEX', 'Nautilus'],
    popularModels: ['ISO-Lateral Row', 'シーテッドロウ', 'ハイロウ']
  },
  {
    id: 'leg_extension',
    category: 'マシン',
    name: 'レッグエクステンション',
    manufacturers: ['Life Fitness', 'CYBEX', 'Technogym', 'Precor', 'Matrix']
  },
  {
    id: 'leg_curl',
    category: 'マシン',
    name: 'レッグカール',
    manufacturers: ['Life Fitness', 'CYBEX', 'Technogym', 'Precor', 'Matrix'],
    popularModels: ['シーテッド', 'ライイング', 'スタンディング']
  },
  {
    id: 'cable_machine',
    category: 'マシン',
    name: 'ケーブルマシン',
    manufacturers: ['Life Fitness', 'CYBEX', 'Technogym', 'Matrix', 'Precor'],
    popularModels: ['ケーブルクロスオーバー', 'デュアルアジャスタブルプーリー', 'ファンクショナルトレーナー']
  },
  {
    id: 'smith_machine',
    category: 'マシン',
    name: 'スミスマシン',
    manufacturers: ['Life Fitness', 'Hammer Strength', 'Matrix', 'Precor', 'TUFF STUFF'],
    popularModels: ['3Dスミス', 'リニアベアリング式', 'カウンターバランス付き']
  },

  // ベンチ・ラック
  {
    id: 'power_rack',
    category: 'ベンチ・ラック',
    name: 'パワーラック',
    manufacturers: ['ROGUE', 'Hammer Strength', 'ELEIKO', 'BULL', 'アイロテック'],
    popularModels: ['フルラック', 'ハーフラック', 'コンボラック']
  },
  {
    id: 'squat_rack',
    category: 'ベンチ・ラック',
    name: 'スクワットラック',
    manufacturers: ['ROGUE', 'ELEIKO', 'Hammer Strength', 'Matrix'],
    popularModels: ['オリンピック用', 'パワーリフティング用']
  },
  {
    id: 'bench_press',
    category: 'ベンチ・ラック',
    name: 'ベンチプレス台',
    manufacturers: ['ELEIKO', 'ROGUE', 'Hammer Strength', 'BULL'],
    popularModels: ['オリンピックベンチ', 'コンペティションベンチ', 'インクラインベンチ']
  },
  {
    id: 'adjustable_bench',
    category: 'ベンチ・ラック',
    name: 'アジャスタブルベンチ',
    manufacturers: ['Life Fitness', 'Hammer Strength', 'Matrix', 'TUFF STUFF'],
    popularModels: ['フラット〜85度可変', 'デクライン対応']
  },
  {
    id: 'preacher_bench',
    category: 'ベンチ・ラック',
    name: 'プリチャーベンチ',
    manufacturers: ['Life Fitness', 'Hammer Strength', 'TUFF STUFF']
  },

  // 有酸素マシン
  {
    id: 'treadmill',
    category: '有酸素',
    name: 'トレッドミル（ランニングマシン）',
    manufacturers: ['Life Fitness', 'Technogym', 'Precor', 'Matrix', 'Woodway'],
    popularModels: ['Platinum Club Series', 'Excite Live', 'TRM 885', 'T7xi']
  },
  {
    id: 'bike',
    category: '有酸素',
    name: 'エアロバイク',
    manufacturers: ['Life Fitness', 'Technogym', 'Precor', 'Matrix', 'Keiser'],
    popularModels: ['アップライト', 'リカンベント', 'スピンバイク']
  },
  {
    id: 'elliptical',
    category: '有酸素',
    name: 'クロストレーナー（エリプティカル）',
    manufacturers: ['Life Fitness', 'Precor', 'Technogym', 'Matrix', 'CYBEX'],
    popularModels: ['EFX 885', 'Cross Personal', 'E5x']
  },
  {
    id: 'rower',
    category: '有酸素',
    name: 'ローイングマシン',
    manufacturers: ['Concept2', 'WaterRower', 'Life Fitness', 'Technogym'],
    popularModels: ['Model D', 'Model E', 'ウォーターローワー']
  },
  {
    id: 'stairmaster',
    category: '有酸素',
    name: 'ステアマスター（階段昇降機）',
    manufacturers: ['StairMaster', 'Life Fitness', 'Matrix', 'Precor'],
    popularModels: ['Gauntlet', '8 Series', 'PowerMill']
  },

  // ファンクショナル
  {
    id: 'trx',
    category: 'ファンクショナル',
    name: 'TRX（サスペンショントレーナー）',
    manufacturers: ['TRX', 'Life Fitness', 'Jungle Gym'],
    popularModels: ['TRX PRO4', 'TRX HOME2', 'TRX DUO']
  },
  {
    id: 'medicine_ball',
    category: 'ファンクショナル',
    name: 'メディシンボール',
    manufacturers: ['ROGUE', 'Dynamax', 'Life Fitness', 'SKLZ'],
    popularModels: ['1kg〜10kg各種', 'ウォールボール', 'スラムボール']
  },
  {
    id: 'battle_rope',
    category: 'ファンクショナル',
    name: 'バトルロープ',
    manufacturers: ['ROGUE', 'Onnit', 'Power Systems'],
    popularModels: ['30ft', '40ft', '50ft']
  },
  {
    id: 'box_jump',
    category: 'ファンクショナル',
    name: 'プライオボックス（ジャンプボックス）',
    manufacturers: ['ROGUE', 'REP Fitness', 'Titan Fitness'],
    popularModels: ['20"/24"/30"', '可変式', 'ソフトプライオボックス']
  },
  {
    id: 'pull_up_bar',
    category: 'ファンクショナル',
    name: 'プルアップバー（懸垂バー）',
    manufacturers: ['ROGUE', 'Life Fitness', 'Matrix'],
    popularModels: ['壁付け式', 'スタンド式', 'マルチグリップ']
  },

  // その他
  {
    id: 'foam_roller',
    category: 'その他',
    name: 'フォームローラー',
    manufacturers: ['TRIGGER POINT', 'RUMBLE ROLLER', 'IMPHY'],
    popularModels: ['GRID', 'GRID X', 'Vyper']
  },
  {
    id: 'stretching_mat',
    category: 'その他',
    name: 'ストレッチマット',
    manufacturers: ['Life Fitness', 'Airex', 'Manduka'],
    popularModels: ['ヨガマット', 'エクササイズマット']
  },
  {
    id: 'abs_bench',
    category: 'その他',
    name: 'アブドミナルベンチ（腹筋台）',
    manufacturers: ['Life Fitness', 'Hammer Strength', 'Matrix']
  },
  {
    id: 'dip_station',
    category: 'その他',
    name: 'ディップスタンド',
    manufacturers: ['Life Fitness', 'Hammer Strength', 'Matrix']
  },
  {
    id: 'landmine',
    category: 'その他',
    name: 'ランドマイン',
    manufacturers: ['ROGUE', 'Titan Fitness', 'CAP Barbell']
  }
]

// カテゴリ一覧を取得
export const getCategories = (): string[] => {
  return Array.from(new Set(equipmentDatabase.map(item => item.category)))
}

// カテゴリに基づいて設備を取得
export const getEquipmentByCategory = (category: string): EquipmentItem[] => {
  return equipmentDatabase.filter(item => item.category === category)
}

// 設備IDから設備情報を取得
export const getEquipmentById = (id: string): EquipmentItem | undefined => {
  return equipmentDatabase.find(item => item.id === id)
}

// メーカー一覧を取得
export const getAllManufacturers = (): string[] => {
  const manufacturers = new Set<string>()
  equipmentDatabase.forEach(item => {
    item.manufacturers.forEach(manufacturer => manufacturers.add(manufacturer))
  })
  return Array.from(manufacturers).sort()
}