// アバター関連のユーティリティ関数

export function getAvatarColor(name: string): string {
  const colors = [
    'var(--gt-primary)',
    'var(--gt-primary-strong)',
    'var(--gt-secondary)',
    'var(--gt-secondary-strong)',
    'var(--gt-tertiary)',
    'var(--gt-tertiary-strong)',
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

export function getInitial(name: string): string {
  return name.charAt(0).toUpperCase()
}

export function getAvatarGradient(name: string): string {
  const gradients = [
    'linear-gradient(135deg, var(--gt-primary) 0%, var(--gt-primary-strong) 100%)',
    'linear-gradient(135deg, var(--gt-secondary) 0%, var(--gt-primary) 100%)',
    'linear-gradient(135deg, var(--gt-secondary) 0%, var(--gt-tertiary) 100%)',
    'linear-gradient(135deg, var(--gt-tertiary) 0%, rgba(231, 103, 76, 0.45) 100%)',
    'linear-gradient(135deg, rgba(231, 103, 76, 0.8) 0%, rgba(249, 214, 200, 0.65) 100%)',
    'linear-gradient(135deg, rgba(240, 142, 111, 0.85) 0%, rgba(231, 103, 76, 0.6) 100%)',
  ]
  const index = name.charCodeAt(0) % gradients.length
  return gradients[index]
}
