import { useState, CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLongPress } from '../../hooks/useLongPress'
import { FABMenu } from './FABMenu'

interface FloatingActionButtonProps {
  onQuickAdd: () => void
  isQuickAddOpen: boolean
}

export function FloatingActionButton({
  onQuickAdd,
  isQuickAddOpen
}: FloatingActionButtonProps) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const longPressHandlers = useLongPress({
    onPress: onQuickAdd,
    onLongPress: () => setMenuOpen(true),
    threshold: 500
  })

  const handleQuickTask = () => {
    setMenuOpen(false)
    onQuickAdd()
  }

  const handleChatMode = () => {
    setMenuOpen(false)
    navigate('/chat')
  }

  // Hide FAB when quick add panel is open
  if (isQuickAddOpen) return null

  const fabStyle: CSSProperties = {
    position: 'fixed',
    bottom: 'calc(var(--nav-height) + var(--safe-bottom) + var(--space-md))',
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: `radial-gradient(
      circle at 30% 30%,
      var(--orb-orange),
      var(--orb-red) 60%,
      var(--orb-magenta)
    )`,
    border: 'none',
    boxShadow: `
      0 4px 20px rgba(255, 69, 0, 0.4),
      0 0 40px rgba(255, 69, 0, 0.2)
    `,
    cursor: 'pointer',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'mini-breathe 4s ease-in-out infinite',
    transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
    touchAction: 'none'
  }

  const iconStyle: CSSProperties = {
    width: 24,
    height: 24,
    stroke: 'white',
    strokeWidth: 2.5,
    fill: 'none'
  }

  return (
    <>
      <button
        className="fab-button"
        style={fabStyle}
        aria-label="Quick add or chat options"
        {...longPressHandlers}
      >
        <svg style={iconStyle} viewBox="0 0 24 24" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <FABMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onQuickTask={handleQuickTask}
        onChatMode={handleChatMode}
      />
    </>
  )
}
