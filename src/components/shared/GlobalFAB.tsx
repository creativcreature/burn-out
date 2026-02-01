import { useState, CSSProperties } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

/**
 * Global FAB that appears on every screen
 * - Tap: Navigate to Chat (AI assistant)
 * - Long press: Show navigation menu
 */
export function GlobalFAB() {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  
  // Don't show on Chat page since that's the destination
  if (location.pathname === '/chat') return null

  const handleTap = () => {
    if (menuOpen) {
      setMenuOpen(false)
    } else {
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(10)
      navigate('/chat')
    }
  }

  const fabStyle: CSSProperties = {
    position: 'fixed',
    bottom: 'calc(var(--nav-height) + var(--safe-bottom) + var(--space-md))',
    right: 'var(--space-md)',
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
    boxShadow: isPressed 
      ? '0 2px 10px rgba(255, 69, 0, 0.3)'
      : '0 4px 20px rgba(255, 69, 0, 0.4), 0 0 40px rgba(255, 69, 0, 0.2)',
    cursor: 'pointer',
    zIndex: 1950,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'mini-breathe 4s ease-in-out infinite',
    transition: 'transform 200ms var(--spring-bounce), box-shadow 200ms ease',
    transform: isPressed ? 'scale(0.95)' : 'scale(1)',
    touchAction: 'none'
  }

  const iconStyle: CSSProperties = {
    width: 24,
    height: 24,
    stroke: 'white',
    strokeWidth: 2.5,
    fill: 'none'
  }

  // Chat bubble icon
  return (
    <button
      style={fabStyle}
      onClick={handleTap}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerLeave={() => setIsPressed(false)}
      aria-label="Open AI chat assistant"
    >
      <svg style={iconStyle} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  )
}
