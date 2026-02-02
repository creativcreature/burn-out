import { ReactNode, CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import type { BurnoutMode, EnergyLevel } from '../../data/types'

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
  burnoutMode?: BurnoutMode
  energyLevel?: EnergyLevel
  onFlameClick?: () => void
}

// Get energy color based on level and burnout mode
function getEnergyColor(energy: EnergyLevel, burnoutMode: BurnoutMode) {
  if (burnoutMode === 'recovery') {
    return '#6B7280' // Gray for recovery mode
  }
  switch (energy) {
    case 1: return '#6B7280' // Gray (depleted)
    case 2: return '#F59E0B' // Amber (low)
    case 3: return '#F97316' // Orange (okay)
    case 4: return '#EA580C' // Deep orange (good)
    case 5: return '#DC2626' // Red-orange (charged)
  }
}

export function Header({ title, showBack = false, rightAction, showLogo = false, showDate = false, subtitle, subtitleBadge = false, objective, onObjectiveClick, burnoutMode = 'balanced', energyLevel = 3, onFlameClick }: HeaderProps) {
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
          <button
            className="header-energy"
            title={`Energy: ${energyLevel}/5 • Tap to change`}
            onClick={onFlameClick}
            style={{
              cursor: onFlameClick ? 'pointer' : 'default',
              opacity: burnoutMode === 'recovery' ? 0.7 : 1,
              background: 'none',
              border: 'none',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.3s ease'
            }}
          >
            {/* Simple battery icon showing energy level */}
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
              {/* Battery outline */}
              <rect
                x="3"
                y="6"
                width="16"
                height="12"
                rx="2"
                stroke={getEnergyColor(energyLevel, burnoutMode)}
                strokeWidth="2"
                fill="none"
              />
              {/* Battery tip */}
              <rect
                x="19"
                y="9"
                width="2"
                height="6"
                rx="0.5"
                fill={getEnergyColor(energyLevel, burnoutMode)}
              />
              {/* Battery fill - width based on energy (1-5 maps to 2-12) */}
              <rect
                x="5"
                y="8"
                width={2 + (energyLevel - 1) * 2.5}
                height="8"
                rx="1"
                fill={getEnergyColor(energyLevel, burnoutMode)}
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
