import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  title?: string
  showBack?: boolean
  rightAction?: ReactNode
  showLogo?: boolean
  showDate?: boolean
}

export function Header({ title, showBack = false, rightAction, showLogo = false, showDate = false }: HeaderProps) {
  const navigate = useNavigate()

  const now = new Date()
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  if (showLogo) {
    return (
      <header className="app-header">
        <div className="header-top">
          <span className="logo">BurnOut</span>
          <button className="header-orb" title="Toggle theme" />
        </div>
        {showDate && (
          <div className="header-bottom">
            <div className="date-section">
              <span className="date-label">{days[now.getDay()]}</span>
              <span className="date-display">{months[now.getMonth()]}. {now.getDate()}</span>
            </div>
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
        {rightAction && <div>{rightAction}</div>}
      </div>
    </header>
  )
}
