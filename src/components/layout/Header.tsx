import { CSSProperties, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  title?: string
  showBack?: boolean
  rightAction?: ReactNode
}

export function Header({ title, showBack = false, rightAction }: HeaderProps) {
  const navigate = useNavigate()

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--space-md)',
    paddingTop: 'calc(var(--safe-top) + var(--space-md))',
    minHeight: 56
  }

  const leftStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)'
  }

  const titleStyle: CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-xl)',
    fontWeight: 600,
    color: 'var(--text-primary)'
  }

  const backButtonStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 'var(--radius-full)',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    color: 'var(--text-primary)'
  }

  return (
    <header style={headerStyle}>
      <div style={leftStyle}>
        {showBack && (
          <button
            style={backButtonStyle}
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        {title && <h1 style={titleStyle}>{title}</h1>}
      </div>
      {rightAction && <div>{rightAction}</div>}
    </header>
  )
}
