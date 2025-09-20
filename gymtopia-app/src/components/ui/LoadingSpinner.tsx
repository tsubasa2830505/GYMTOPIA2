'use client'

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
}

const sizeClasses = {
  xs: 'w-3 h-3 border-2',
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-4',
  xl: 'w-16 h-16 border-4'
}

export default function LoadingSpinner({
  size = 'md',
  className = '',
  text
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-[color:var(--gt-primary-strong)] border-t-transparent rounded-full animate-spin`}
      />
      {text && (
        <p className="gt-body text-[color:var(--text-subtle)] mt-2">{text}</p>
      )}
    </div>
  )
}

export function LoadingCard({ text = 'ローディング中...' }: { text?: string }) {
  return (
    <div className="gt-card px-10 py-8 text-center space-y-4">
      <LoadingSpinner size="xl" text={text} />
    </div>
  )
}