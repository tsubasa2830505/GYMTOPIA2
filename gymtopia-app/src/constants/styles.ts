// スタイル定数の一元管理

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const COLORS = {
  primary: 'var(--gt-primary)',
  secondary: 'var(--gt-secondary)',
  tertiary: 'var(--gt-tertiary)',
  primaryStrong: 'var(--gt-primary-strong)',
  secondaryStrong: 'var(--gt-secondary-strong)',
  background: 'var(--gt-background)',
  foreground: 'var(--foreground)',
  textMain: 'var(--gt-text-main)',
  textSub: 'var(--gt-text-sub)',
  textMuted: 'var(--text-muted)',
  textSubtle: 'var(--text-subtle)',
} as const;

export const SHADOWS = {
  sm: '0_12px_30px_-22px_rgba(189,101,78,0.28)',
  md: '0_16px_32px_-22px_rgba(189,101,78,0.44)',
  lg: '0_20px_38px_-20px_rgba(189,101,78,0.48)',
  xl: '0_22px_40px_-20px_rgba(189,101,78,0.52)',
} as const;

export const GRADIENTS = {
  primary: 'linear-gradient(to right, var(--gt-primary), var(--gt-secondary))',
  secondary: 'linear-gradient(to right, var(--gt-secondary), var(--gt-tertiary))',
  accent: 'var(--gt-accent-gradient)',
} as const;

export const TRANSITIONS = {
  fast: 'all 0.15s ease-out',
  default: 'all 0.2s ease-out',
  slow: 'all 0.3s ease-out',
} as const;

export const BORDER_RADIUS = {
  sm: '0.375rem', // 6px
  md: '0.5rem',   // 8px
  lg: '0.75rem',  // 12px
  xl: '1rem',     // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const;

export const SPACING = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
  '3xl': '4rem',  // 64px
} as const;