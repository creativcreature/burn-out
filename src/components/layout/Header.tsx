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
  onObjectiveClick?: () => void
}

export function Header({ title, showBack = false, rightAction, showLogo = false, showDate = false, subtitle, subtitleBadge = false, objective, onObjectiveClick }: HeaderProps) {
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
          <button className="header-flame" title="Toggle theme">
            <svg viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="flameGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--orb-red)" />
                  <stop offset="50%" stopColor="var(--orb-orange)" />
                  <stop offset="100%" stopColor="var(--orb-magenta)" />
                </linearGradient>
              </defs>
              <path
                d="M12 2C12 2 6.5 9 6.5 14C6.5 17.5 9 20 12 21C15 20 17.5 17.5 17.5 14C17.5 9 12 2 12 2Z"
                fill="url(#flameGradient)"
              />
              <path
                d="M12 8C12 8 9.5 12 9.5 15C9.5 17 10.5 18.5 12 19C13.5 18.5 14.5 17 14.5 15C14.5 12 12 8 12 8Z"
                fill="var(--orb-orange)"
                opacity="0.8"
              />
            </svg>
          </button>
        </div>
        {showDate && (
          <div className="header-bottom">
            <div className="date-section">
              <span className="day-name">{days[now.getDay()]}</span>
              <span className="date-num">{months[now.getMonth()]}. {now.getDate()}</span>
            </div>
            {objective && (
              <div 
                className="objective-section"
                onClick={onObjectiveClick}
                style={{ cursor: onObjectiveClick ? 'pointer' : 'default' }}
                role={onObjectiveClick ? 'button' : undefined}
                tabIndex={onObjectiveClick ? 0 : undefined}
                onKeyDown={onObjectiveClick ? (e) => e.key === 'Enter' && onObjectiveClick() : undefined}
              >
                <span className="objective-label">Objective:</span>
                <span className="objective-value">{objective}</span>
                {onObjectiveClick && (
                  <span style={{ marginLeft: '4px', opacity: 0.5, fontSize: 'var(--text-xs)' }}>✎</span>
                )}
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
