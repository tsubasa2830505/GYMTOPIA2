// アバター関連のユーティリティ関数

export function getAvatarColor(name: string): string {
  const colors = [
    '#10b981', // green
    '#f59e0b', // yellow
    '#8b5cf6', // purple
    '#ef4444', // red
    '#06b6d4', // cyan
    '#ec4899', // pink
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

export function getInitial(name: string): string {
  return name.charAt(0).toUpperCase()
}

export function getAvatarGradient(name: string): string {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  ]
  const index = name.charCodeAt(0) % gradients.length
  return gradients[index]
}