import { useLocation, useNavigate } from 'react-router-dom'
import { CSSProperties } from 'react'
import { NAVIGATION_ITEMS } from '../../data/constants'

export function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()

  const navStyle: CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 'var(--nav-height)',
    paddingBottom: 'var(--safe-bottom)',
    background: 'var(--bg-card)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    zIndex: 1000
  }

  const itemStyle = (isActive: boolean): CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-xs)',
    padding: 'var(--space-sm)',
    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'color var(--transition-fast)',
    minWidth: 64
  })

  const iconStyle: CSSProperties = {
    width: 24,
    height: 24
  }

  const labelStyle: CSSProperties = {
    fontSize: 'var(--text-xs)',
    fontWeight: 500
  }

  // Simple icon representations
  const icons: Record<string, JSX.Element> = {
    circle: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    layers: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
    message: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    sparkle: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    settings: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    )
  }

  return (
    <nav style={navStyle} role="navigation" aria-label="Main navigation">
      {NAVIGATION_ITEMS.map(item => {
        const isActive = location.pathname === item.path
        return (
          <button
            key={item.path}
            style={itemStyle(isActive)}
            onClick={() => navigate(item.path)}
            aria-current={isActive ? 'page' : undefined}
          >
            {icons[item.icon]}
            <span style={labelStyle}>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
