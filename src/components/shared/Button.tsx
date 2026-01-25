import { ReactNode, CSSProperties, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  children,
  ...props
}: ButtonProps) {
  const baseStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-sm)',
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    borderRadius: 'var(--radius-md)',
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'all var(--transition-fast)',
    width: fullWidth ? '100%' : 'auto'
  }

  const sizeStyles: Record<string, CSSProperties> = {
    sm: {
      padding: 'var(--space-xs) var(--space-sm)',
      fontSize: 'var(--text-sm)'
    },
    md: {
      padding: 'var(--space-sm) var(--space-md)',
      fontSize: 'var(--text-md)'
    },
    lg: {
      padding: 'var(--space-md) var(--space-lg)',
      fontSize: 'var(--text-lg)'
    }
  }

  const variantStyles: Record<string, CSSProperties> = {
    primary: {
      background: 'transparent',
      color: 'var(--orb-orange)',
      border: '2px solid var(--orb-orange)'
    },
    secondary: {
      background: 'var(--bg-card)',
      color: 'var(--text)',
      border: '1px solid var(--border)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-muted)'
    },
    danger: {
      background: '#ef4444',
      color: 'white'
    }
  }

  const style: CSSProperties = {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant]
  }

  return (
    <button
      style={style}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}
