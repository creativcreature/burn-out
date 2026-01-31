import { CSSProperties } from 'react'

interface OrbProps {
  size?: 'sm' | 'md' | 'lg'
  breathing?: boolean
  onClick?: () => void
  className?: string
}

const sizeMap = {
  sm: 80,
  md: 160,
  lg: 240
}

export function Orb({ size = 'lg', breathing = true, onClick, className = '' }: OrbProps) {
  const dimension = sizeMap[size]

  const style: CSSProperties = {
    width: dimension,
    height: dimension,
    borderRadius: '50%',
    background: `radial-gradient(
      circle at 30% 30%,
      var(--orb-gradient-1),
      var(--orb-gradient-2) 50%,
      var(--orb-gradient-3)
    )`,
    boxShadow: `
      0 0 60px var(--orb-glow),
      0 0 100px var(--orb-glow)
    `,
    animation: breathing ? 'orb-breathe 4s ease-in-out infinite' : 'none',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)'
  }

  return (
    <div
      className={`orb ${className}`}
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      } : undefined}
      aria-label={onClick ? 'Start task' : undefined}
    />
  )
}
