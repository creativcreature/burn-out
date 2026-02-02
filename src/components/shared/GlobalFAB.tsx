import { useState, useRef, useCallback, CSSProperties } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

/**
 * Global FAB that appears on every screen
 * - Tap: Navigate to Chat (AI assistant)
 * - Long press: Show quick actions menu
 */
export function GlobalFAB() {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didLongPress = useRef(false)

  // All hooks must be called before any conditional returns
  const handlePointerDown = useCallback(() => {
    setIsPressed(true)
    didLongPress.current = false

    // Start long press timer (500ms)
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true
      // Haptic feedback for long press
      if (navigator.vibrate) navigator.vibrate([50, 30, 50])
      setMenuOpen(true)
      setIsPressed(false)
    }, 500)
  }, [])

  const handlePointerUp = useCallback(() => {
    setIsPressed(false)

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

    // If it wasn't a long press, treat as tap
    if (!didLongPress.current && !menuOpen) {
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(10)
      navigate('/chat')
    }
  }, [menuOpen, navigate])

  const handlePointerLeave = useCallback(() => {
    setIsPressed(false)
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  // Don't show on Chat page since that's the destination
  // This check must be AFTER all hooks are called
  if (location.pathname === '/chat') return null

  const handleMenuAction = (action: string) => {
    setMenuOpen(false)
    if (navigator.vibrate) navigator.vibrate(10)

    switch (action) {
      case 'chat':
        navigate('/chat')
        break
      case 'add-task':
        // Dispatch custom event to open quick add panel
        window.dispatchEvent(new CustomEvent('open-quick-add'))
        break
      case 'settings':
        navigate('/settings')
        break
    }
  }

  // Position FAB above the Settings nav button (rightmost item)
  // Nav is centered with max-width 430px, settings is the 5th of 5 items (rightmost 20%)
  // So FAB should be at the right edge of the centered nav area
  const fabStyle: CSSProperties = {
    position: 'fixed',
    bottom: 'calc(var(--nav-height) + var(--safe-bottom) + var(--space-md))',
    // Center the FAB above the settings button
    // Settings is at ~90% of nav width (last of 5 equal items within 430px)
    right: 'max(var(--space-md), calc(50vw - 215px + 16px))', // 215 = half of 430px max-width
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

  const menuStyle: CSSProperties = {
    position: 'fixed',
    bottom: 'calc(var(--nav-height) + var(--safe-bottom) + var(--space-md) + 64px)',
    right: 'max(var(--space-md), calc(50vw - 215px + 16px))',
    background: 'var(--bg-card-solid)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-xs)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    zIndex: 1960,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 160,
    border: '1px solid var(--border)'
  }

  const menuItemStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    padding: 'var(--space-sm) var(--space-md)',
    background: 'transparent',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text)',
    fontSize: 'var(--text-sm)',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    transition: 'background 150ms ease'
  }

  const backdropStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1940
  }

  return (
    <>
      {/* Backdrop when menu is open */}
      {menuOpen && (
        <div
          style={backdropStyle}
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Quick actions menu */}
      {menuOpen && (
        <div style={menuStyle}>
          <button
            style={menuItemStyle}
            onClick={() => handleMenuAction('chat')}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Brain dump
          </button>
          <button
            style={menuItemStyle}
            onClick={() => handleMenuAction('add-task')}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Quick add task
          </button>
          <button
            style={menuItemStyle}
            onClick={() => handleMenuAction('settings')}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </button>
        </div>
      )}

      {/* FAB button */}
      <button
        style={fabStyle}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerLeave}
        aria-label="Open AI chat assistant"
      >
        <svg style={iconStyle} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </>
  )
}
