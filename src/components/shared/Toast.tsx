import { useState, useEffect, CSSProperties } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export function Toast({ message, type = 'info', isVisible, onClose, duration = 3000 }: ToastProps) {
  const [shouldRender, setShouldRender] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true)
      setIsExiting(false)
    } else if (shouldRender) {
      setIsExiting(true)
      const timer = setTimeout(() => setShouldRender(false), 200)
      return () => clearTimeout(timer)
    }
  }, [isVisible, shouldRender])

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!shouldRender) return null

  const colors = {
    success: 'var(--success-500)',
    error: 'var(--error-500)',
    info: 'var(--text-muted)'
  }

  const containerStyle: CSSProperties = {
    position: 'fixed',
    bottom: 'calc(var(--nav-height) + var(--safe-bottom) + var(--space-lg))',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 3000,
    animation: isExiting ? 'fade-out 200ms ease forwards' : 'fade-in 200ms ease'
  }

  const toastStyle: CSSProperties = {
    background: 'var(--bg-alt)',
    color: 'var(--text)',
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
