export type EquipmentType =
  | 'bodyweight'
  | 'freeweight'
  | 'machine'
  | 'cable'
  | 'treadmill'
  | 'bike'
  | 'elliptical'
  | 'stairclimber'
  | 'pool'
  | 'studio'

export type ExerciseCategory =
  | 'abs'
  | 'arms'
  | 'back'
  | 'cardio'
  | 'chest'
  | 'glutes'
  | 'legs'
  | 'shoulders'

export interface Exercise {
  id?: string
  name: string
  base_mets: number
  equipment_type: EquipmentType
  category: ExerciseCategory
  description?: string
}

export const exerciseData: Exercise[] = [
  // 腹筋（Abs）
  { name: 'アブドミナル', base_mets: 4.3, equipment_type: 'machine', category: 'abs', description: '腹筋マシンを使用した腹直筋トレーニング' },
  { name: 'アブドミナルマシン', base_mets: 3.6, equipment_type: 'machine', category: 'abs', description: 'マシンで負荷を調整できる腹筋運動' },
  { name: 'アブローラー', base_mets: 6.0, equipment_type: 'bodyweight', category: 'abs', description: '腹筋ローラーを使用した高強度コアトレーニング' },
  { name: 'クランチ', base_mets: 3.0, equipment_type: 'bodyweight', category: 'abs', description: '基本的な腹筋運動' },
  { name: 'トーソローテーション', base_mets: 4.5, equipment_type: 'machine', category: 'abs', description: '腹斜筋を鍛える回旋運動' },
  { name: 'プランク', base_mets: 3.0, equipment_type: 'bodyweight', category: 'abs', description: '体幹を鍛える静的エクササイズ' },
  { name: 'レッグレイズ', base_mets: 4.0, equipment_type: 'bodyweight', category: 'abs', description: '下腹部を重点的に鍛える' },

  // 腕（Arms）
  { name: 'EZバーカール', base_mets: 3.5, equipment_type: 'freeweight', category: 'arms', description: 'EZバーを使用した上腕二頭筋トレーニング' },
  { name: 'アームカール', base_mets: 3.5, equipment_type: 'freeweight', category: 'arms', description: '基本的な上腕二頭筋運動' },
  { name: 'インクラインアームカール', base_mets: 3.5, equipment_type: 'freeweight', category: 'arms', description: '傾斜をつけたカール運動' },
  { name: 'インクラインダンベルカール', base_mets: 3.5, equipment_type: 'freeweight', category: 'arms', description: '傾斜ベンチでのダンベルカール' },
  { name: 'インクラインハンマーカール', base_mets: 3.5, equipment_type: 'freeweight', category: 'arms', description: '前腕も同時に鍛えるカール' },
  { name: 'ケーブルカール', base_mets: 3.5, equipment_type: 'cable', category: 'arms', description: 'ケーブルマシンでの上腕二頭筋運動' },
  { name: 'ケーブルプレスダウン', base_mets: 3.5, equipment_type: 'cable', category: 'arms', description: '上腕三頭筋を鍛えるケーブル運動' },
  { name: 'スカルクラッシャー', base_mets: 3.5, equipment_type: 'freeweight', category: 'arms', description: '上腕三頭筋の集中トレーニング' },
  { name: 'ダンベルカール', base_mets: 4.0, equipment_type: 'freeweight', category: 'arms', description: 'ダンベルを使用した基本カール' },
  { name: 'トライセプスディップス', base_mets: 5.0, equipment_type: 'bodyweight', category: 'arms', description: '自重での上腕三頭筋運動' },
  { name: 'バーベルカール', base_mets: 4.0, equipment_type: 'freeweight', category: 'arms', description: 'バーベルでの上腕二頭筋トレーニング' },
  { name: 'ハンマーカール', base_mets: 4.0, equipment_type: 'freeweight', category: 'arms', description: '前腕と上腕二頭筋を同時に鍛える' },
  { name: 'フレンチプレス', base_mets: 3.5, equipment_type: 'freeweight', category: 'arms', description: '上腕三頭筋の頭上運動' },

  // 背中（Back）
  { name: 'ケーブルプルオーバー', base_mets: 3.5, equipment_type: 'cable', category: 'back', description: '広背筋を鍛えるケーブル運動' },
  { name: 'シーテッドロー', base_mets: 3.5, equipment_type: 'machine', category: 'back', description: '座位での引き寄せ運動' },
  { name: 'チンニング', base_mets: 8.0, equipment_type: 'bodyweight', category: 'back', description: '懸垂運動（高強度）' },
  { name: 'デッドリフト', base_mets: 6.0, equipment_type: 'freeweight', category: 'back', description: '全身を使う複合運動' },
  { name: 'ベントオーバーロウ', base_mets: 6.0, equipment_type: 'freeweight', category: 'back', description: '前傾姿勢での引き寄せ運動' },
  { name: 'ラットプルダウン', base_mets: 5.0, equipment_type: 'machine', category: 'back', description: '広背筋を鍛えるマシン運動' },
  { name: 'ワンハンドローイング', base_mets: 3.5, equipment_type: 'freeweight', category: 'back', description: '片手での背中トレーニング' },

  // 有酸素運動（Cardio）
  // ウォーキング系
  { name: 'ウォーキング', base_mets: 3.5, equipment_type: 'treadmill', category: 'cardio', description: '通常速度の歩行' },
  { name: 'ウォーキング（ゆっくり）', base_mets: 2.8, equipment_type: 'treadmill', category: 'cardio', description: 'ゆっくりペースの歩行' },
  { name: 'ウォーキング（普通）', base_mets: 3.5, equipment_type: 'treadmill', category: 'cardio', description: '普通ペースの歩行' },
  { name: 'ウォーキング（速い）', base_mets: 4.3, equipment_type: 'treadmill', category: 'cardio', description: '速歩' },

  // ランニング系
  { name: 'ジョギング', base_mets: 7.0, equipment_type: 'treadmill', category: 'cardio', description: '軽いランニング' },
  { name: 'ランニング', base_mets: 8.0, equipment_type: 'treadmill', category: 'cardio', description: '通常のランニング' },
  { name: 'ランニング（8km/h）', base_mets: 8.0, equipment_type: 'treadmill', category: 'cardio', description: '時速8kmのランニング' },
  { name: 'ランニング（10km/h）', base_mets: 10.0, equipment_type: 'treadmill', category: 'cardio', description: '時速10kmのランニング' },

  // サイクリング系
  { name: 'サイクリング（軽い）', base_mets: 4.0, equipment_type: 'bike', category: 'cardio', description: '軽い負荷のサイクリング' },
  { name: 'サイクリング（普通）', base_mets: 6.0, equipment_type: 'bike', category: 'cardio', description: '通常負荷のサイクリング' },

  // エリプティカル系
  { name: 'エリプティカル（軽い）', base_mets: 4.0, equipment_type: 'elliptical', category: 'cardio', description: '軽い負荷' },
  { name: 'エリプティカル', base_mets: 5.0, equipment_type: 'elliptical', category: 'cardio', description: '通常負荷' },
  { name: 'エリプティカル（きつい）', base_mets: 8.0, equipment_type: 'elliptical', category: 'cardio', description: '高負荷' },

  // ステアクライマー系
  { name: 'ステアクライマー（40ステップ/分）', base_mets: 4.0, equipment_type: 'stairclimber', category: 'cardio', description: '低速' },
  { name: 'ステアクライマー（50ステップ/分）', base_mets: 5.0, equipment_type: 'stairclimber', category: 'cardio', description: 'やや低速' },
  { name: 'ステアクライマー（60ステップ/分）', base_mets: 7.0, equipment_type: 'stairclimber', category: 'cardio', description: '中速' },
  { name: 'ステアクライマー（70ステップ/分）', base_mets: 8.8, equipment_type: 'stairclimber', category: 'cardio', description: 'やや高速' },
  { name: 'ステアクライマー（80ステップ/分）', base_mets: 10.0, equipment_type: 'stairclimber', category: 'cardio', description: '高速' },
  { name: 'ステアクライマー（90ステップ/分）', base_mets: 12.0, equipment_type: 'stairclimber', category: 'cardio', description: '非常に高速' },
  { name: 'ステアクライマー（100ステップ/分以上）', base_mets: 15.0, equipment_type: 'stairclimber', category: 'cardio', description: '超高速' },

  // 水泳系
  { name: '水中ウォーキング', base_mets: 4.8, equipment_type: 'pool', category: 'cardio', description: 'プール内歩行' },
  { name: '背泳ぎ', base_mets: 4.8, equipment_type: 'pool', category: 'cardio', description: '背面泳法' },
  { name: '平泳ぎ', base_mets: 5.3, equipment_type: 'pool', category: 'cardio', description: '平泳ぎ' },
  { name: 'クロール/自由形', base_mets: 5.8, equipment_type: 'pool', category: 'cardio', description: '自由形泳法' },
  { name: 'レジャー遊泳', base_mets: 6.0, equipment_type: 'pool', category: 'cardio', description: '自由な泳ぎ' },
  { name: '水中エアロビクス/ジョギング', base_mets: 7.5, equipment_type: 'pool', category: 'cardio', description: '水中運動' },
  { name: 'バタフライ', base_mets: 13.8, equipment_type: 'pool', category: 'cardio', description: '高強度泳法' },

  // その他
  { name: 'エアロビクス', base_mets: 5.0, equipment_type: 'studio', category: 'cardio', description: 'スタジオエクササイズ' },

  // 胸（Chest）
  { name: 'インクラインダンベルフライ', base_mets: 3.0, equipment_type: 'freeweight', category: 'chest', description: '傾斜ベンチでの胸筋ストレッチ運動' },
  { name: 'インクラインダンベルプレス', base_mets: 3.5, equipment_type: 'freeweight', category: 'chest', description: '傾斜ベンチでのプレス運動' },
  { name: 'インクラインプレス', base_mets: 3.5, equipment_type: 'freeweight', category: 'chest', description: '上部胸筋を重点的に鍛える' },
  { name: 'インクラインベンチプレス', base_mets: 3.5, equipment_type: 'freeweight', category: 'chest', description: 'バーベルでの傾斜プレス' },
  { name: 'ケーブルクロスオーバー', base_mets: 3.0, equipment_type: 'cable', category: 'chest', description: 'ケーブルでの胸筋収縮運動' },
  { name: 'ケーブルフライ', base_mets: 3.0, equipment_type: 'cable', category: 'chest', description: 'ケーブルでの胸筋ストレッチ運動' },
  { name: 'ダンベルフライ', base_mets: 5.5, equipment_type: 'freeweight', category: 'chest', description: 'ダンベルでの胸筋ストレッチ運動' },
  { name: 'ダンベルプレス', base_mets: 3.5, equipment_type: 'freeweight', category: 'chest', description: 'ダンベルでの基本プレス運動' },
  { name: 'チェストプレス', base_mets: 3.5, equipment_type: 'machine', category: 'chest', description: 'マシンでの胸筋プレス' },
  { name: 'ディップス', base_mets: 8.0, equipment_type: 'bodyweight', category: 'chest', description: '自重での胸筋・三頭筋運動' },
  { name: 'プッシュアップ', base_mets: 3.8, equipment_type: 'bodyweight', category: 'chest', description: '腕立て伏せ' },
  { name: 'ペクトラルフライ', base_mets: 3.0, equipment_type: 'machine', category: 'chest', description: 'マシンでの胸筋フライ運動' },
  { name: 'ベンチプレス', base_mets: 5.0, equipment_type: 'freeweight', category: 'chest', description: 'バーベルでの基本胸筋運動' },

  // 臀筋（Glutes）
  { name: 'ヒップアダクション', base_mets: 3.8, equipment_type: 'machine', category: 'glutes', description: '内転筋群を鍛える' },
  { name: 'ヒップアブダクション', base_mets: 4.0, equipment_type: 'machine', category: 'glutes', description: '中臀筋を鍛える' },
  { name: 'ヒップスラスト', base_mets: 6.0, equipment_type: 'machine', category: 'glutes', description: '大臀筋の集中トレーニング' },

  // 脚（Legs）
  { name: 'カーフレイズ', base_mets: 6.5, equipment_type: 'freeweight', category: 'legs', description: 'ふくらはぎのトレーニング' },
  { name: 'スクワット', base_mets: 6.0, equipment_type: 'freeweight', category: 'legs', description: '下半身の基本複合運動' },
  { name: 'ブルガリアンスクワット', base_mets: 6.0, equipment_type: 'freeweight', category: 'legs', description: '片足での高強度スクワット' },
  { name: 'ランジ', base_mets: 5.0, equipment_type: 'bodyweight', category: 'legs', description: '前後への踏み込み運動' },
  { name: 'レッグエクステンション', base_mets: 6.0, equipment_type: 'machine', category: 'legs', description: '大腿四頭筋の単関節運動' },
  { name: 'レッグカール', base_mets: 4.0, equipment_type: 'machine', category: 'legs', description: 'ハムストリングスの単関節運動' },
  { name: 'レッグプレス', base_mets: 6.0, equipment_type: 'machine', category: 'legs', description: 'マシンでの脚部プレス運動' },

  // 肩（Shoulders）
  { name: 'アーノルドプレス', base_mets: 3.5, equipment_type: 'freeweight', category: 'shoulders', description: '回旋を加えたショルダープレス' },
  { name: 'インクラインサイドレイズ', base_mets: 3.0, equipment_type: 'freeweight', category: 'shoulders', description: '傾斜をつけた側方挙上' },
  { name: 'ケーブルサイドレイズ', base_mets: 3.0, equipment_type: 'cable', category: 'shoulders', description: 'ケーブルでの側方挙上' },
  { name: 'サイドレイズ', base_mets: 3.0, equipment_type: 'freeweight', category: 'shoulders', description: '三角筋中部の基本運動' },
  { name: 'ショルダープレス', base_mets: 5.0, equipment_type: 'freeweight', category: 'shoulders', description: '肩の基本プレス運動' },
  { name: 'ダンベルショルダープレス', base_mets: 3.5, equipment_type: 'freeweight', category: 'shoulders', description: 'ダンベルでの肩プレス' },
  { name: 'フロントレイズ', base_mets: 3.0, equipment_type: 'freeweight', category: 'shoulders', description: '三角筋前部の運動' },
  { name: 'ミリタリープレス', base_mets: 3.5, equipment_type: 'freeweight', category: 'shoulders', description: '立位でのバーベルプレス' },
  { name: 'リアデルト', base_mets: 3.0, equipment_type: 'machine', category: 'shoulders', description: '三角筋後部のマシン運動' },
  { name: 'リアレイズ', base_mets: 3.0, equipment_type: 'freeweight', category: 'shoulders', description: '三角筋後部の運動' },
]

// カテゴリごとの種目を取得
export const getExercisesByCategory = (category: ExerciseCategory): Exercise[] => {
  return exerciseData.filter(exercise => exercise.category === category)
}

// カテゴリ名を日本語で取得
export const getCategoryDisplayName = (category: ExerciseCategory): string => {
  const categoryNames: Record<ExerciseCategory, string> = {
    abs: '腹筋',
    arms: '腕',
    back: '背中',
    cardio: '有酸素',
    chest: '胸',
    glutes: '臀筋',
    legs: '脚',
    shoulders: '肩',
  }
  return categoryNames[category] || category
}

// 器具タイプを日本語で取得
export const getEquipmentDisplayName = (equipment: EquipmentType): string => {
  const equipmentNames: Record<EquipmentType, string> = {
    bodyweight: '自重',
    freeweight: 'フリーウェイト',
    machine: 'マシン',
    cable: 'ケーブル',
    treadmill: 'トレッドミル',
    bike: 'バイク',
    elliptical: 'エリプティカル',
    stairclimber: 'ステアクライマー',
    pool: 'プール',
    studio: 'スタジオ',
  }
  return equipmentNames[equipment] || equipment
}

// 強度レベルを取得（METs値に基づく）
export const getIntensityLevel = (mets: number): string => {
  if (mets <= 3.0) return '軽強度'
  if (mets <= 6.0) return '中強度'
  if (mets <= 9.0) return '高強度'
  return '超高強度'
}

// カロリー計算（METs × 体重(kg) × 時間(h) × 1.05）
export const calculateCalories = (mets: number, weightKg: number, hours: number): number => {
  return Math.round(mets * weightKg * hours * 1.05)
}