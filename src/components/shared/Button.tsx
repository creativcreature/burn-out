import { ReactNode, CSSProperties, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'cta' | 'secondary' | 'ghost' | 'danger'
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
      background: 'rgba(255, 255, 255, 0.9)',
      color: 'var(--coral-500)',
      border: 'none',
      borderRadius: 'var(--radius-full)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
      fontFamily: 'var(--font-display)',
      fontWeight: 500
    },
    cta: {
      background: 'linear-gradient(135deg, var(--coral-500), var(--coral-400))',
      color: 'white',
      border: 'none',
      borderRadius: 'var(--radius-full)',
      boxShadow: '0 4px 12px rgba(229, 57, 53, 0.35)'
    },
    secondary: {
      background: 'var(--bg-card)',
      color: 'var(--text)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-full)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-muted)'
    },
    danger: {
      background: 'var(--error-500)',
      color: 'white',
      borderRadius: 'var(--radius-full)',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
    }
  }

  const style: CSSProperties = {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant]
  }

  const spinnerStyle: CSSProperties = {
    width: 16,
    height: 16,
    border: '2px solid transparent',
    borderTopColor: 'currentColor',
    borderRadius: '50%',
    animation: 'rotate-subtle 0.8s linear infinite'
  }

  return (
    <button
      style={style}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span style={spinnerStyle} />
          <span>Loading</span>
        </>
      ) : children}
    </button>
  )
}
