import { CSSProperties } from 'react'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  variant?: 'text' | 'card' | 'circle'
}

/**
 * Shimmer skeleton loader for loading states
 */
export function Skeleton({ 
  width = '100%', 
  height = 20, 
  variant = 'text' 
}: SkeletonProps) {
  const baseStyle: CSSProperties = {
    background: 'linear-gradient(90deg, var(--bg-card) 25%, var(--bg-elevated) 50%, var(--bg-card) 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
    borderRadius: variant === 'circle' ? '50%' : 'var(--radius-md)',
    width,
    height: variant === 'card' ? 'auto' : height
  }

  if (variant === 'card') {
    return (
      <div style={{ 
        ...baseStyle, 
        padding: 'var(--space-md)', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 'var(--space-sm)' 
      }}>
        <div style={{ ...baseStyle, height: 16, width: '60%' }} />
        <div style={{ ...baseStyle, height: 12, width: '80%' }} />
        <div style={{ ...baseStyle, height: 12, width: '40%' }} />
      </div>
    )
  }

  return <div style={baseStyle} />
}

interface ThinkingProps {
  message?: string
}

/**
 * Warm "thinking..." indicator for AI/loading states
 */
export function Thinking({ message = 'thinking...' }: ThinkingProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    padding: 'var(--space-md)',
    color: 'var(--text-muted)',
    fontSize: 'var(--text-sm)',
    fontStyle: 'italic'
  }

  const dotStyle: CSSProperties = {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--orb-orange)',
    animation: 'thinking-pulse 1.4s ease-in-out infinite'
  }

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', gap: 4 }}>
        <div style={{ ...dotStyle, animationDelay: '0s' }} />
        <div style={{ ...dotStyle, animationDelay: '0.2s' }} />
        <div style={{ ...dotStyle, animationDelay: '0.4s' }} />
      </div>
      <span>{message}</span>
    </div>
  )
}
