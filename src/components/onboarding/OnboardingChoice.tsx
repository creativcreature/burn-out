import { CSSProperties } from 'react'
import { Orb } from '../shared/Orb'
import { Card } from '../shared/Card'

export type OnboardingPath = 'quick' | 'guided' | 'explore'

interface OnboardingChoiceProps {
  onSelect: (path: OnboardingPath) => void
}

export function OnboardingChoice({ onSelect }: OnboardingChoiceProps) {
  const containerStyle: CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--space-xl)',
    background: 'var(--bg-primary)'
  }

  const contentStyle: CSSProperties = {
    maxWidth: 400,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-xl)',
    textAlign: 'center'
  }

  const titleStyle: CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-2xl)',
    color: 'var(--text)',
    marginBottom: 'var(--space-sm)'
  }

  const subtitleStyle: CSSProperties = {
    color: 'var(--text-muted)',
    fontSize: 'var(--text-md)'
  }

  const cardsStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)',
    width: '100%'
  }

  const cardInnerStyle: CSSProperties = {
    textAlign: 'left',
    cursor: 'pointer'
  }

  const cardTitleStyle: CSSProperties = {
    fontWeight: 600,
    fontSize: 'var(--text-md)',
    color: 'var(--text)',
    marginBottom: 'var(--space-xs)'
  }

  const cardDescStyle: CSSProperties = {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-muted)'
  }

  const badgeStyle: CSSProperties = {
    display: 'inline-block',
    padding: '2px 8px',
    background: 'var(--orb-orange)',
    color: 'white',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--text-xs)',
    fontWeight: 500,
    marginLeft: 'var(--space-sm)'
  }

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <Orb size="lg" breathing />

        <div>
          <h1 style={titleStyle}>Welcome to BurnOut</h1>
          <p style={subtitleStyle}>
            Work with your energy, not against it.
          </p>
        </div>

        <div style={cardsStyle}>
          <Card onClick={() => onSelect('quick')}>
            <div style={cardInnerStyle}>
              <div style={cardTitleStyle}>
                Quick Setup
                <span style={badgeStyle}>Recommended</span>
              </div>
              <div style={cardDescStyle}>
                Basic preferences, jump in fast
              </div>
            </div>
          </Card>

          <Card onClick={() => onSelect('guided')}>
            <div style={cardInnerStyle}>
              <div style={cardTitleStyle}>Guided Setup</div>
              <div style={cardDescStyle}>
                Full experience with goals and templates
              </div>
            </div>
          </Card>

          <Card onClick={() => onSelect('explore')}>
            <div style={cardInnerStyle}>
              <div style={cardTitleStyle}>Explore First</div>
              <div style={cardDescStyle}>
                Skip setup with demo data to try the app
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
