import { ReactNode, useState, useEffect, CSSProperties } from 'react'
import { Button } from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  showClose?: boolean
}

export function Modal({ isOpen, onClose, title, children, showClose = true }: ModalProps) {
  const [shouldRender, setShouldRender] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      setIsExiting(false)
      document.body.style.overflow = 'hidden'
    } else if (shouldRender) {
      setIsExiting(true)
      const timer = setTimeout(() => {
        setShouldRender(false)
        document.body.style.overflow = ''
      }, 200)
      return () => clearTimeout(timer)
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, shouldRender])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!shouldRender) return null

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--space-md)',
    zIndex: 2000,
    animation: isExiting ? 'fade-out 200ms ease forwards' : 'fade-in 200ms ease'
  }

  const modalStyle: CSSProperties = {
    background: 'var(--bg-alt)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-xl)',
    maxWidth: 480,
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4)',
    animation: isExiting 
      ? 'modal-slide-out 200ms var(--spring-smooth) forwards' 
      : 'modal-slide-in 300ms var(--spring-bounce)'
  }

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--space-md)'
  }

  const titleStyle: CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-xl)',
    fontWeight: 600,
    color: 'var(--text)'
  }

  return (
    <div style={overlayStyle} onClick={onClose} role="dialog" aria-modal="true">
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        {(title || showClose) && (
          <div style={headerStyle}>
            {title && <h2 style={titleStyle}>{title}</h2>}
            {showClose && (
              <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </Button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
