// Supabaseのmuscle_partsテーブル（ID: 17328）の型定義
export interface MusclePart {
  id: number
  category: string
  name: string
  parts: string[]
  created_at?: string
  updated_at?: string
}

// カテゴリごとのマッピング型
export interface MusclePartsByCategory {
  chest: MusclePart
  back: MusclePart
  shoulder: MusclePart
  legs: MusclePart
  arms: MusclePart
  core: MusclePart
}