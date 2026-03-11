import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'positive' | 'negative' | 'neutral' | 'mixed' | 'trending'
  className?: string
}

const VARIANT_STYLES: Record<string, string> = {
  default: 'bg-[var(--secondary)] text-[var(--foreground)]',
  positive: 'bg-green-500/20 text-green-400',
  negative: 'bg-red-500/20 text-red-400',
  neutral: 'bg-gray-500/20 text-gray-400',
  mixed: 'bg-yellow-500/20 text-yellow-400',
  trending: 'bg-orange-500/20 text-orange-400',
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANT_STYLES[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
