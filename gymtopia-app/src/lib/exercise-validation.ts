// 種目別の適正値範囲定義
export interface ExerciseLimit {
  maxWeight: number
  typicalWeight: {
    beginner: { min: number; max: number }
    intermediate: { min: number; max: number }
    advanced: { min: number; max: number }
  }
  maxReps: number
  typicalReps: { min: number; max: number }
  maxSets: number
}

// 種目カテゴリー別のデフォルト制限値
const DEFAULT_LIMITS: Record<string, ExerciseLimit> = {
  chest: {
    maxWeight: 300,
    typicalWeight: {
      beginner: { min: 20, max: 60 },
      intermediate: { min: 40, max: 100 },
      advanced: { min: 80, max: 200 }
    },
    maxReps: 50,
    typicalReps: { min: 1, max: 30 },
    maxSets: 20
  },
  back: {
    maxWeight: 350,
    typicalWeight: {
      beginner: { min: 20, max: 70 },
      intermediate: { min: 50, max: 120 },
      advanced: { min: 100, max: 250 }
    },
    maxReps: 50,
    typicalReps: { min: 1, max: 30 },
    maxSets: 20
  },
  legs: {
    maxWeight: 500,
    typicalWeight: {
      beginner: { min: 30, max: 100 },
      intermediate: { min: 80, max: 200 },
      advanced: { min: 150, max: 400 }
    },
    maxReps: 50,
    typicalReps: { min: 1, max: 30 },
    maxSets: 20
  },
  shoulders: {
    maxWeight: 150,
    typicalWeight: {
      beginner: { min: 5, max: 30 },
      intermediate: { min: 20, max: 60 },
      advanced: { min: 40, max: 100 }
    },
    maxReps: 50,
    typicalReps: { min: 1, max: 30 },
    maxSets: 20
  },
  arms: {
    maxWeight: 100,
    typicalWeight: {
      beginner: { min: 5, max: 20 },
      intermediate: { min: 15, max: 40 },
      advanced: { min: 30, max: 70 }
    },
    maxReps: 50,
    typicalReps: { min: 1, max: 30 },
    maxSets: 20
  },
  core: {
    maxWeight: 100,
    typicalWeight: {
      beginner: { min: 0, max: 20 },
      intermediate: { min: 10, max: 40 },
      advanced: { min: 20, max: 80 }
    },
    maxReps: 100,
    typicalReps: { min: 1, max: 50 },
    maxSets: 20
  }
}

// 特定の種目の制限値
const SPECIFIC_EXERCISE_LIMITS: Record<string, ExerciseLimit> = {
  'ベンチプレス': {
    maxWeight: 300,
    typicalWeight: {
      beginner: { min: 20, max: 60 },
      intermediate: { min: 40, max: 100 },
      advanced: { min: 80, max: 200 }
    },
    maxReps: 30,
    typicalReps: { min: 1, max: 15 },
    maxSets: 10
  },
  'スクワット': {
    maxWeight: 400,
    typicalWeight: {
      beginner: { min: 30, max: 80 },
      intermediate: { min: 60, max: 150 },
      advanced: { min: 120, max: 300 }
    },
    maxReps: 30,
    typicalReps: { min: 1, max: 20 },
    maxSets: 10
  },
  'デッドリフト': {
    maxWeight: 450,
    typicalWeight: {
      beginner: { min: 40, max: 100 },
      intermediate: { min: 80, max: 180 },
      advanced: { min: 150, max: 350 }
    },
    maxReps: 20,
    typicalReps: { min: 1, max: 12 },
    maxSets: 8
  },
  'ショルダープレス': {
    maxWeight: 150,
    typicalWeight: {
      beginner: { min: 10, max: 30 },
      intermediate: { min: 25, max: 60 },
      advanced: { min: 50, max: 100 }
    },
    maxReps: 30,
    typicalReps: { min: 1, max: 15 },
    maxSets: 10
  },
  'ラットプルダウン': {
    maxWeight: 200,
    typicalWeight: {
      beginner: { min: 20, max: 60 },
      intermediate: { min: 40, max: 100 },
      advanced: { min: 80, max: 180 }
    },
    maxReps: 30,
    typicalReps: { min: 6, max: 20 },
    maxSets: 10
  }
}

export interface ValidationResult {
  isValid: boolean
  warnings: string[]
  errors: string[]
}

export function validateExercise(
  exerciseName: string,
  category: string,
  weight: number,
  reps: number,
  sets: number
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    warnings: [],
    errors: []
  }

  // 種目に応じた制限値を取得
  const limits = SPECIFIC_EXERCISE_LIMITS[exerciseName] ||
                  DEFAULT_LIMITS[category] ||
                  DEFAULT_LIMITS.chest // デフォルト

  // 重量チェック
  if (weight > limits.maxWeight) {
    result.errors.push(
      `${exerciseName}の重量${weight}kgは異常に高い値です。世界記録レベルを超えています（最大値: ${limits.maxWeight}kg）。`
    )
    result.isValid = false
  } else if (weight > limits.typicalWeight.advanced.max) {
    result.warnings.push(
      `${exerciseName}の重量${weight}kgは非常に高い値です。入力が正しいか確認してください。`
    )
  }

  // 回数チェック
  if (reps > limits.maxReps) {
    result.errors.push(
      `${reps}回は異常に多い回数です。最大${limits.maxReps}回までが一般的です。`
    )
    result.isValid = false
  } else if (reps > limits.typicalReps.max) {
    result.warnings.push(
      `${reps}回は通常より多い回数です。筋持久力トレーニングですか？`
    )
  }

  // セット数チェック
  if (sets > limits.maxSets) {
    result.errors.push(
      `${sets}セットは異常に多いセット数です。最大${limits.maxSets}セットまでが一般的です。`
    )
    result.isValid = false
  } else if (sets > 10) {
    result.warnings.push(
      `${sets}セットは多めのセット数です。オーバートレーニングにご注意ください。`
    )
  }

  // 総ボリュームチェック（重量 × 回数 × セット）
  const totalVolume = weight * reps * sets
  if (totalVolume > 10000) {
    result.warnings.push(
      `総ボリューム（${totalVolume}kg）が非常に高いです。適切な休息を取ってください。`
    )
  }

  return result
}

// 有酸素運動の検証
export function validateCardio(
  exerciseName: string,
  duration: number,
  distance?: number,
  speed?: number
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    warnings: [],
    errors: []
  }

  // 時間チェック
  if (duration > 300) {
    result.warnings.push(
      `${duration}分は非常に長い運動時間です。入力が正しいか確認してください。`
    )
  } else if (duration > 180) {
    result.warnings.push(
      `${duration}分は長時間の運動です。適切な水分補給を心がけてください。`
    )
  }

  // 距離チェック
  if (distance) {
    if (exerciseName.includes('ランニング') || exerciseName.includes('ジョギング')) {
      if (distance > 42.195) {
        result.warnings.push(
          `${distance}kmはフルマラソン以上の距離です。入力が正しいか確認してください。`
        )
      }
      // 速度チェック（ランニング）
      if (speed && speed > 25) {
        result.errors.push(
          `速度${speed}km/hは人間の限界を超えています。入力が正しいか確認してください。`
        )
        result.isValid = false
      }
    } else if (exerciseName.includes('サイクリング')) {
      if (distance > 200) {
        result.warnings.push(
          `${distance}kmは非常に長距離のサイクリングです。入力が正しいか確認してください。`
        )
      }
      // 速度チェック（サイクリング）
      if (speed && speed > 60) {
        result.warnings.push(
          `速度${speed}km/hは非常に速いペースです。プロレベルの速度です。`
        )
      }
    }
  }

  return result
}