import { CSSProperties, ReactNode } from 'react'

type TagVariant = 'energy' | 'focus' | 'call' | 'meeting' | 'writing' | 'love' | 'default'

interface TagProps {
  variant?: TagVariant
  children: ReactNode
  className?: string
}

export function Tag({ variant = 'default', children, className }: TagProps) {
  const baseStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: 'var(--radius-full)',
    fontFamily: 'var(--font-body)',
    fontSize: '12px',
    fontWeight: 500,
    whiteSpace: 'nowrap'
  }

  const variantStyles: Record<TagVariant, CSSProperties> = {
    energy: {
      background: 'var(--tag-energy-bg)',
      color: 'var(--tag-energy-text)',
      border: '1px solid var(--tag-energy-border)'
    },
    focus: {
      background: 'var(--tag-focus-bg)',
      color: 'var(--tag-focus-text)',
      border: 'none'
    },
    call: {
      background: 'var(--tag-call-bg)',
      color: 'var(--tag-call-text)',
      border: '1px solid var(--tag-call-border)'
    },
    meeting: {
      background: 'var(--tag-meeting-bg)',
      color: 'var(--tag-meeting-text)',
      border: '1px solid var(--tag-meeting-border)'
    },
    writing: {
      background: 'var(--tag-writing-bg)',
      color: 'var(--tag-writing-text)',
      border: '1px solid var(--tag-writing-border)'
    },
    love: {
      background: 'var(--tag-love-bg)',
      color: 'var(--tag-love-text)',
      border: '1px solid var(--tag-love-border)'
    },
    default: {
      background: 'rgba(122, 107, 99, 0.12)',
      color: 'var(--text-muted)',
      border: 'none'
    }
  }

  return (
    <span style={{ ...baseStyle, ...variantStyles[variant] }} className={className}>
      {children}
    </span>
  )
}
