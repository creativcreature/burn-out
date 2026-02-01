import { CSSProperties, useEffect, useRef } from 'react'
import { useTooltip } from '../../hooks/useTooltip'

interface TooltipProps {
  id: string
  message: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  autoDismiss?: number
}

/**
 * Non-blocking tooltip for first-time user hints
 * Shows once per user, dismisses on tap or auto
 */
export function Tooltip({
  id,
  message,
  position = 'bottom',
  delay = 500,
  autoDismiss = 5000
}: TooltipProps) {
  const { visible, dismiss } = useTooltip(id, delay)
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Auto-dismiss timer
  useEffect(() => {
    if (visible && autoDismiss > 0) {
      const timer = setTimeout(dismiss, autoDismiss)
      return () => clearTimeout(timer)
    }
  }, [visible, autoDismiss, dismiss])

  // Dismiss on escape
  useEffect(() => {
    if (!visible) return
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss()
    }
    
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [visible, dismiss])

  if (!visible) return null

  const baseStyle: CSSProperties = {
    position: 'absolute',
    background: 'var(--bg-card-solid, #1a1a1a)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-sm) var(--space-md)',
    fontSize: 'var(--text-sm)',
    color: 'var(--text-muted)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    maxWidth: 200,
    textAlign: 'center',
    zIndex: 2100,
    animation: 'tooltip-fade-in 200ms var(--spring-smooth)',
    cursor: 'pointer',
    lineHeight: 'var(--line-height-normal, 1.6)'
  }

  const positionStyles: Record<string, CSSProperties> = {
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 'var(--space-sm)' },
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 'var(--space-sm)' },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 'var(--space-sm)' },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 'var(--space-sm)' }
  }

  const arrowStyles: Record<string, CSSProperties> = {
    bottom: { 
      position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)',
      width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
      borderBottom: '6px solid var(--border)'
    },
    top: {
      position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
      width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
      borderTop: '6px solid var(--border)'
    },
    left: {
      position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)',
      width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent',
      borderLeft: '6px solid var(--border)'
    },
    right: {
      position: 'absolute', left: -6, top: '50%', transform: 'translateY(-50%)',
      width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent',
      borderRight: '6px solid var(--border)'
    }
  }

  return (
    <div
      ref={tooltipRef}
      role="tooltip"
      onClick={dismiss}
      onTouchStart={dismiss}
      style={{ ...baseStyle, ...positionStyles[position] }}
    >
      <div style={arrowStyles[position]} />
      {message}
    </div>
  )
}
