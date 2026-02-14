import { CSSProperties } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const tabs = [
  { id: 'feed', label: 'feed', path: '/feed' },
  { id: 'now', label: 'now', path: '/' },
  { id: 'chat', label: 'chat', path: '/chat' },
  { id: 'me', label: 'me', path: '/me' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const barStyle: CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 480,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '12px 0 calc(env(safe-area-inset-bottom, 0px) + 12px)',
    background: 'var(--bg-card-solid)',
    borderTop: '1px solid var(--border)',
    zIndex: 900,
    WebkitTapHighlightColor: 'transparent',
  }

  const tabStyle = (active: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    minWidth: 64,
    minHeight: 44,
    fontFamily: 'var(--font-body)',
    fontWeight: 700,
    fontSize: active ? '20px' : '12px',
    letterSpacing: active ? '-0.2px' : '0',
    lineHeight: active ? '26px' : '14px',
    color: active ? 'var(--text)' : 'var(--text-subtle)',
    transition: 'font-size 200ms cubic-bezier(0.22, 1, 0.36, 1), color 150ms ease',
  })

  return (
    <nav style={barStyle}>
      {tabs.map((tab) => {
        const active = isActive(tab.path)
        return (
          <button
            key={tab.id}
            style={tabStyle(active)}
            onClick={() => navigate(tab.path)}
            aria-label={tab.label}
            aria-current={active ? 'page' : undefined}
          >
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
