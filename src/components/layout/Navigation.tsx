import { useLocation, useNavigate } from 'react-router-dom'
import { CSSProperties } from 'react'

// 5 tabs: Organize | Chat | Now (center, prominent) | Reflect | Settings
const NAV_ITEMS = [
  { path: '/organize', label: 'Organize', icon: 'link', isCenter: false },
  { path: '/chat', label: 'Chat', icon: 'chat', isCenter: false },
  { path: '/now', label: 'Now', icon: 'home', isCenter: true },
  { path: '/reflections', label: 'Reflect', icon: 'check', isCenter: false },
  { path: '/settings', label: 'Settings', icon: 'more', isCenter: false }
]

const icons: Record<string, JSX.Element> = {
  home: (
    <svg viewBox="0 0 24 24">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  link: (
    <svg viewBox="0 0 24 24">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  more: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  )
}

export function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()

  const navItemStyle = (isActive: boolean): CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '8px 12px',
    color: isActive ? 'var(--orb-orange)' : 'var(--text-subtle)',
    background: 'none',
    border: 'none',
    borderRadius: '0',
    cursor: 'pointer',
    transition: 'all var(--transition-normal)',
    minWidth: '48px'
  })

  const iconStyle = (): CSSProperties => ({
    width: '22px',
    height: '22px',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    fill: 'none'
  })

  const labelStyle = (): CSSProperties => ({
    fontSize: '10px',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  })

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {NAV_ITEMS.map(item => {
        const isActive = location.pathname === item.path ||
          (item.path === '/now' && location.pathname === '/')
        return (
          <button
            key={item.path}
            className="nav-item-btn"
            style={navItemStyle(isActive)}
            onClick={() => navigate(item.path)}
            aria-current={isActive ? 'page' : undefined}
          >
            <svg style={iconStyle()} viewBox="0 0 24 24">
              {icons[item.icon].props.children}
            </svg>
            <span style={labelStyle()}>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
