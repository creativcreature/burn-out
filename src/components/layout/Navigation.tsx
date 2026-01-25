import { useLocation, useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/now', label: 'Now', icon: 'now' },
  { path: '/organize', label: 'Organize', icon: 'organize' },
  { path: '/chat', label: 'Chat', icon: 'chat' },
  { path: '/reflections', label: 'Reflect', icon: 'reflect' },
  { path: '/settings', label: 'Settings', icon: 'settings' }
]

const icons: Record<string, JSX.Element> = {
  now: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  organize: (
    <svg viewBox="0 0 24 24">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  reflect: (
    <svg viewBox="0 0 24 24">
      <path d="M12 20v-8M12 12c-4 0-6-4-6-6 0 4 4 6 6 6z" />
      <path d="M12 12c4 0 6-4 6-6 0 4-4 6-6 6z" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  )
}

export function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {NAV_ITEMS.map(item => {
        const isActive = location.pathname === item.path
        return (
          <button
            key={item.path}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            aria-current={isActive ? 'page' : undefined}
          >
            {icons[item.icon]}
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
