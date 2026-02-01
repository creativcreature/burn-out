import { CSSProperties } from 'react'

/**
 * Orb-based preloader shown on initial app load
 * Breathing animation with gentle copy
 */
export function Preloader() {
  const containerStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-lg)',
    background: 'var(--bg)',
    zIndex: 9999
  }

  const orbStyle: CSSProperties = {
    width: 120,
    height: 120,
    borderRadius: '50%',
    background: 'radial-gradient(circle at 30% 30%, var(--orb-orange), var(--orb-red) 70%)',
    boxShadow: '0 0 60px 20px rgba(255, 69, 0, 0.3)',
    animation: 'preloader-breathe 2s var(--spring-gentle) infinite'
  }

  const textStyle: CSSProperties = {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-muted)',
    animation: 'preloader-fade 2s ease-in-out infinite'
  }

  return (
    <div style={containerStyle}>
      <div style={orbStyle} />
      <p style={textStyle}>taking a breath...</p>
    </div>
  )
}
