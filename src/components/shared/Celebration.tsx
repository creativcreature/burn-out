import { useState, useEffect, CSSProperties } from 'react'

interface CelebrationProps {
  show: boolean
  onComplete?: () => void
}

/**
 * Subtle celebration animation on task completion
 * Orb pulse + warm message
 */
export function Celebration({ show, onComplete }: CelebrationProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        onComplete?.()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!visible) return null

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-md)',
    background: 'rgba(0, 0, 0, 0.3)',
    zIndex: 3000,
    animation: 'celebration-fade 1.5s ease-in-out',
    pointerEvents: 'none'
  }

  const orbStyle: CSSProperties = {
    width: 150,
    height: 150,
    borderRadius: '50%',
    background: 'radial-gradient(circle at 30% 30%, var(--orb-orange), var(--orb-red) 70%)',
    boxShadow: '0 0 100px 50px rgba(255, 69, 0, 0.5)',
    animation: 'celebration-pulse 0.8s var(--spring-bouncy)'
  }

  const textStyle: CSSProperties = {
    fontSize: 'var(--text-lg)',
    color: 'white',
    fontWeight: 500,
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    animation: 'celebration-text 1s ease-out'
  }

  const messages = [
    'nice work ✨',
    'done! ♡',
    'you did it 🌟',
    'one step forward 💪'
  ]
  const message = messages[Math.floor(Math.random() * messages.length)]

  return (
    <div style={overlayStyle}>
      <div style={orbStyle} />
      <p style={textStyle}>{message}</p>
    </div>
  )
}
