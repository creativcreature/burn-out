import { useState, useRef, useEffect, CSSProperties, KeyboardEvent } from 'react'

interface QuickAddPanelProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (text: string) => void | Promise<void>
  placeholder?: string
  isLoading?: boolean
}

export function QuickAddPanel({
  isOpen,
  onClose,
  onSubmit,
  placeholder = "What's on your mind?",
  isLoading = false
}: QuickAddPanelProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus textarea when panel opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = '24px'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }, [value])

  const handleSubmit = async () => {
    const trimmed = value.trim()
    if (!trimmed || isLoading) return
    await onSubmit(trimmed)
    setValue('')
    onClose()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1998,
    animation: 'fade-in 150ms ease'
  }

  const panelStyle: CSSProperties = {
    position: 'fixed',
    bottom: 'calc(var(--nav-height) + var(--safe-bottom))',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 430,
    background: 'var(--bg-card-solid)',
    borderTopLeftRadius: 'var(--radius-xl)',
    borderTopRightRadius: 'var(--radius-xl)',
    padding: 'var(--space-lg)',
    paddingBottom: 'calc(var(--space-lg) + env(safe-area-inset-bottom, 0px))',
    boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.15)',
    zIndex: 1999,
    animation: 'slide-up 200ms ease'
  }

  const inputContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 'var(--space-sm)'
  }

  const textareaStyle: CSSProperties = {
    flex: 1,
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    outline: 'none',
    resize: 'none',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-md)',
    lineHeight: '24px',
    color: 'var(--text)',
    minHeight: '48px',
    maxHeight: '120px',
    padding: 'var(--space-sm) var(--space-md)'
  }

  const buttonStyle: CSSProperties = {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: 'var(--orb-orange)',
    border: 'none',
    cursor: isLoading || !value.trim() ? 'default' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    opacity: isLoading || !value.trim() ? 0.5 : 1,
    transition: 'opacity var(--transition-fast)'
  }

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={panelStyle}>
        <div style={inputContainerStyle}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={textareaStyle}
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !value.trim()}
            style={buttonStyle}
            aria-label="Add task"
          >
            {isLoading ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="32">
                  <animate attributeName="stroke-dashoffset" values="32;0" dur="1s" repeatCount="indefinite" />
                </circle>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
