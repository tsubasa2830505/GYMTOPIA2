// スタイル定数
export const LOGO_FILTER = 'brightness(0) saturate(100%) invert(45%) sepia(93%) saturate(1352%) hue-rotate(333deg) brightness(95%) contrast(96%)'

export const GRADIENT_CLASSES = {
  primary: 'bg-gradient-to-br from-accent to-accent-secondary',
  shadow: 'shadow-[0_16px_34px_-20px_rgba(189,101,78,0.46)]',
} as const

export const ICON_SIZES = {
  mobile: 'w-5 h-5',
  desktop: 'w-6 h-6',
} as const

export const LOGO_SIZES = {
  mobile: {
    width: 280,
    height: 70,
    className: 'h-10 w-auto',
  },
  desktop: {
    width: 320,
    height: 80,
    className: 'h-12 w-auto',
  },
} as const

export const DEFAULT_SUBTITLE = '街の熱量と一緒にジムを探そう'