import { CSSProperties } from 'react'

interface FABMenuProps {
  isOpen: boolean
  onClose: () => void
  onQuickTask: () => void
  onChatMode: () => void
}

export function FABMenu({ isOpen, onClose, onQuickTask, onChatMode }: FABMenuProps) {
  if (!isOpen) return null

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(4px)',
    zIndex: 1999,
    animation: 'fade-in 150ms ease'
  }

  const menuStyle: CSSProperties = {
    position: 'fixed',
    bottom: 'calc(70px + env(safe-area-inset-bottom, 0px) + 16px)',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 32px)',
    maxWidth: 448,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
    zIndex: 2001,
    animation: 'slide-up 200ms ease'
  }

  const menuItemStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-sm)',
    padding: 'var(--space-md) var(--space-lg)',
    background: 'var(--bg-card-solid)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-md)',
    fontWeight: 500,
    color: 'var(--text)',
    transition: 'all var(--transition-fast)',
    width: '100%'
  }

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={menuStyle}>
        <button style={menuItemStyle} onClick={onQuickTask}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--orb-orange)"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Quick task
        </button>
        <button style={menuItemStyle} onClick={onChatMode}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--orb-orange)"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Chat mode
        </button>
      </div>
    </>
  )
}
