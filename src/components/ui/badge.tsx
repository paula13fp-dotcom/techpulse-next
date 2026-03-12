import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'positive' | 'negative' | 'neutral' | 'mixed' | 'trending'
  className?: string
}

const VARIANT_STYLES: Record<string, string> = {
  default: 'bg-gray-100 text-gray-700',
  positive: 'bg-green-50 text-green-700 border border-green-200',
  negative: 'bg-red-50 text-red-700 border border-red-200',
  neutral: 'bg-gray-50 text-gray-500 border border-gray-200',
  mixed: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  trending: 'bg-orange-50 text-orange-700 border border-orange-200',
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
