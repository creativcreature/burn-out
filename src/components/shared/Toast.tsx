import { useEffect, CSSProperties } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export function Toast({ message, type = 'info', isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const colors = {
    success: 'var(--accent-primary)',
    error: 'var(--accent-tertiary)',
    info: 'var(--text-secondary)'
  }

  const containerStyle: CSSProperties = {
    position: 'fixed',
    bottom: 'calc(var(--nav-height) + var(--safe-bottom) + var(--space-lg))',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 3000,
    animation: 'fade-in 200ms ease'
  }

  const toastStyle: CSSProperties = {
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    padding: 'var(--space-sm) var(--space-md)',
    borderRadius: 'var(--radius-md)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    borderLeft: `4px solid ${colors[type]}`,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    maxWidth: 'calc(100vw - var(--space-xl))'
  }

  const icons = {
    success: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors[type]} strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    error: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors[type]} strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    info: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors[type]} strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={toastStyle} role="alert">
        {icons[type]}
        <span>{message}</span>
      </div>
    </div>
  )
}
