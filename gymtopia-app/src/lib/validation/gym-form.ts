// ジム管理画面フォームのバリデーション

// 電話番号のフォーマットと検証
export const formatPhoneNumber = (value: string): string => {
  // 数字とハイフンのみ抽出
  const numbers = value.replace(/[^\d-]/g, '')

  // 市外局番-市内局番-加入者番号の形式に整形
  if (numbers.length === 10 && !numbers.includes('-')) {
    // 10桁の場合（03など2桁の市外局番）
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6)}`
  } else if (numbers.length === 11 && !numbers.includes('-')) {
    // 11桁の場合（090などの携帯番号）
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`
  }

  return numbers
}

export const validatePhoneNumber = (value: string): boolean => {
  // 日本の電話番号形式をチェック
  const patterns = [
    /^0\d{1,4}-\d{1,4}-\d{4}$/, // 固定電話
    /^0[789]0-\d{4}-\d{4}$/, // 携帯電話
    /^0120-\d{3}-\d{3}$/, // フリーダイヤル
  ]

  return patterns.some(pattern => pattern.test(value))
}

// URLの検証
export const validateUrl = (value: string): boolean => {
  if (!value) return true // 空の場合は許可

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

// 画像URLの検証
export const validateImageUrl = (value: string): boolean => {
  if (!value) return true // 空の場合は許可

  // URLとして有効か
  if (!validateUrl(value)) return false

  // 画像形式の拡張子をチェック（オプション）
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i
  const commonImageHosts = /(unsplash|cloudinary|imgur|googleusercontent)/i

  return imageExtensions.test(value) || commonImageHosts.test(value)
}

// 文字数制限
export const TEXT_LIMITS = {
  name: 50,
  address: 100,
  description: 500,
  shortText: 30,
  longText: 1000,
  url: 200,
} as const

// 文字数チェック
export const checkTextLength = (value: string, limit: number): {
  isValid: boolean
  remaining: number
} => {
  const length = value.length
  return {
    isValid: length <= limit,
    remaining: limit - length
  }
}

// エラーメッセージ
export const ERROR_MESSAGES = {
  phone: {
    invalid: '正しい電話番号形式で入力してください（例：03-1234-5678）',
    required: '電話番号は必須です'
  },
  website: {
    invalid: '正しいURL形式で入力してください（https://で始まる）',
    tooLong: `URLは${TEXT_LIMITS.url}文字以内で入力してください`
  },
  images: {
    invalid: '正しい画像URLを入力してください',
    tooMany: '画像は最大10枚までです',
    invalidFormat: '各URLを改行で区切って入力してください'
  },
  name: {
    tooLong: `ジム名は${TEXT_LIMITS.name}文字以内で入力してください`,
    required: 'ジム名は必須です'
  },
  address: {
    tooLong: `住所は${TEXT_LIMITS.address}文字以内で入力してください`,
    required: '住所は必須です'
  },
  description: {
    tooLong: `説明文は${TEXT_LIMITS.description}文字以内で入力してください`
  }
} as const

// フォーム全体の検証
export const validateGymForm = (formData: any): {
  isValid: boolean
  errors: Record<string, string>
} => {
  const errors: Record<string, string> = {}

  // 必須項目チェック
  if (!formData.basicInfo?.name?.trim()) {
    errors.name = ERROR_MESSAGES.name.required
  } else if (formData.basicInfo.name.length > TEXT_LIMITS.name) {
    errors.name = ERROR_MESSAGES.name.tooLong
  }

  if (!formData.basicInfo?.address?.trim()) {
    errors.address = ERROR_MESSAGES.address.required
  } else if (formData.basicInfo.address.length > TEXT_LIMITS.address) {
    errors.address = ERROR_MESSAGES.address.tooLong
  }

  // 電話番号チェック
  if (formData.basicInfo?.phone && !validatePhoneNumber(formData.basicInfo.phone)) {
    errors.phone = ERROR_MESSAGES.phone.invalid
  }

  // ウェブサイトチェック
  if (formData.basicInfo?.website) {
    if (!validateUrl(formData.basicInfo.website)) {
      errors.website = ERROR_MESSAGES.website.invalid
    } else if (formData.basicInfo.website.length > TEXT_LIMITS.url) {
      errors.website = ERROR_MESSAGES.website.tooLong
    }
  }

  // 画像URLチェック
  if (formData.basicInfo?.images && Array.isArray(formData.basicInfo.images)) {
    if (formData.basicInfo.images.length > 10) {
      errors.images = ERROR_MESSAGES.images.tooMany
    } else {
      const invalidImages = formData.basicInfo.images.filter(
        (url: string) => url && !validateImageUrl(url)
      )
      if (invalidImages.length > 0) {
        errors.images = ERROR_MESSAGES.images.invalid
      }
    }
  }

  // 説明文チェック
  if (formData.basicInfo?.description &&
      formData.basicInfo.description.length > TEXT_LIMITS.description) {
    errors.description = ERROR_MESSAGES.description.tooLong
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// サンプルURL生成（プレースホルダー用）
export const SAMPLE_URLS = {
  website: 'https://www.mygym.com',
  image: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
    'https://images.unsplash.com/photo-1593079831268-3381b0db4a77'
  ].join('\n')
} as const