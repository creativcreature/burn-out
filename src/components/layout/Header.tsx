import { ReactNode, CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  title?: string
  showBack?: boolean
  rightAction?: ReactNode
  showLogo?: boolean
  showDate?: boolean
  subtitle?: string
  subtitleBadge?: boolean
  objective?: string
}

export function Header({ title, showBack = false, rightAction, showLogo = false, showDate = false, subtitle, subtitleBadge = false, objective }: HeaderProps) {
  const navigate = useNavigate()

  const now = new Date()
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const subtitleStyle: CSSProperties = subtitleBadge ? {
    padding: '4px 12px',
    background: 'var(--orb-orange)',
    color: 'white',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--text-xs)',
    fontWeight: 500
  } : {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-muted)'
  }

  if (showLogo) {
    return (
      <header className="app-header">
        <div className="header-top">
          <span className="logo" onClick={() => navigate('/now')} style={{ cursor: 'pointer' }}>BurnOut</span>
          <button className="header-orb" title="Toggle theme" />
        </div>
        {showDate && (
          <div className="header-bottom">
            <div className="date-section">
              <span className="day-name">{days[now.getDay()]}</span>
              <span className="date-num">{months[now.getMonth()]}. {now.getDate()}</span>
            </div>
            {objective && (
              <div className="objective-section">
                <span className="objective-label">Objective:</span>
                <span className="objective-value">{objective}</span>
              </div>
            )}
          </div>
        )}
      </header>
    )
  }

  // Simple header for other pages
  return (
    <header className="app-header">
      <div className="header-top">
        {showBack && (
          <button
            className="header-back"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        {title && <h1 className="header-title">{title}</h1>}
        {subtitle && <span style={subtitleStyle}>{subtitle}</span>}
        {rightAction && <div>{rightAction}</div>}
      </div>
    </header>
  )
}
