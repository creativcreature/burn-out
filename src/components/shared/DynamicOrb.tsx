import { CSSProperties } from 'react'
import { useTimeOfDay } from '../../hooks/useTimeOfDay'

/**
 * Dynamic Orb Background
 *
 * Changes color based on time of day:
 * - Dawn (5-7am): Soft pink/peach
 * - Morning (7-11am): Warm orange/gold
 * - Midday (11am-2pm): Bright orange/red
 * - Afternoon (2-5pm): Warm amber
 * - Dusk (5-7pm): Golden/pink
 * - Evening (7-10pm): Purple/magenta
 * - Night (10pm-1am): Deep blue/purple
 * - Late Night (1-5am): Muted deep blues
 *
 * Smoothly transitions between periods over 30 minutes
 */
export function DynamicOrb() {
  const { gradient, boxShadow } = useTimeOfDay()

  const containerStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
    overflow: 'hidden',
    background: 'var(--bg)',
    pointerEvents: 'none'
  }

  const orbStyle: CSSProperties = {
    width: 280,
    height: 280,
    borderRadius: '50%',
    background: gradient,
    filter: 'blur(8px)',
    boxShadow,
    animation: 'orb-breathe 12s ease-in-out infinite, morph 25s ease-in-out infinite, float 18s ease-in-out infinite',
    transition: 'background 2s ease-in-out, box-shadow 2s ease-in-out'
  }

  return (
    <div style={containerStyle} className="orb-background">
      <div style={orbStyle} className="orb-main-dynamic" />
    </div>
  )
}
