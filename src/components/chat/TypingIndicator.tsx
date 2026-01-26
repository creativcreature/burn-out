import { CSSProperties } from 'react'

export function TypingIndicator() {
  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-xs)',
    padding: 'var(--space-md)',
    maxWidth: '80%',
    borderRadius: 'var(--radius-lg)',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)'
  }

  const dotStyle: CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--orb-orange)',
    animation: 'typingPulse 1.4s ease-in-out infinite'
  }

  const dot1Style: CSSProperties = {
    ...dotStyle,
    animationDelay: '0s'
  }

  const dot2Style: CSSProperties = {
    ...dotStyle,
    animationDelay: '0.2s'
  }

  const dot3Style: CSSProperties = {
    ...dotStyle,
    animationDelay: '0.4s'
  }

  return (
    <>
      <style>{`
        @keyframes typingPulse {
          0%, 60%, 100% {
            transform: scale(1);
            opacity: 0.4;
          }
          30% {
            transform: scale(1.2);
            opacity: 1;
          }
        }
      `}</style>
      <div style={containerStyle}>
        <div style={dot1Style} />
        <div style={dot2Style} />
        <div style={dot3Style} />
      </div>
    </>
  )
}
