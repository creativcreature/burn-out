import { useState, useRef, useEffect, CSSProperties, KeyboardEvent } from 'react'

interface QuickAddProps {
  onSubmit: (text: string) => void | Promise<void>
  placeholder?: string
  isLoading?: boolean
}

export function QuickAdd({ onSubmit, placeholder = "What's on your mind?", isLoading = false }: QuickAddProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = '24px'
      textarea.style.height = Math.min(textarea.scrollHeight, 80) + 'px'
    }
  }, [value])

  const handleSubmit = async () => {
    const trimmed = value.trim()
    if (!trimmed || isLoading) return

    await onSubmit(trimmed)
    setValue('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const containerStyle: CSSProperties = {
    position: 'fixed',
    bottom: 'calc(70px + env(safe-area-inset-bottom, 0px) + 16px)',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 32px)',
    maxWidth: 448,
    zIndex: 100
  }

  const inputContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
    padding: '8px 8px 8px 20px',
    background: 'var(--bg-card-solid)',
    backdropFilter: 'blur(var(--glass-blur))',
    WebkitBackdropFilter: 'blur(var(--glass-blur))',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--border)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
  }

  const textareaStyle: CSSProperties = {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    resize: 'none',
    fontFamily: 'var(--font-body)',
    fontSize: '15px',
    lineHeight: '24px',
    color: 'var(--text)',
    minHeight: '24px',
    maxHeight: '80px',
    padding: 0
  }

  const buttonStyle: CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'var(--orb-orange)',
    border: 'none',
    cursor: isLoading || !value.trim() ? 'default' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    opacity: isLoading || !value.trim() ? 0.5 : 1,
    transition: 'transform var(--transition-fast), opacity var(--transition-fast)'
  }

  return (
    <div style={containerStyle}>
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
  )
}
