import { CSSProperties } from 'react'
import type { EnergyLevel } from '../../data/types'

interface EnergySelectorProps {
  value: EnergyLevel
  onChange: (level: EnergyLevel) => void
}

/**
 * Battery-style energy selector
 * Visual representation of energy level that feels warm and human
 */
export function EnergySelector({ value, onChange }: EnergySelectorProps) {
  const levels: EnergyLevel[] = [1, 2, 3, 4, 5]
  
  const labels: Record<EnergyLevel, string> = {
    1: 'depleted',
    2: 'low',
    3: 'okay',
    4: 'good',
    5: 'charged'
  }

  const colors: Record<EnergyLevel, string> = {
    1: 'var(--error-500)',
    2: 'var(--warning-500)',
    3: 'var(--orb-orange)',
    4: 'var(--success-400)',
    5: 'var(--success-500)'
  }

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    padding: 'var(--space-sm)',
  }

  const batteryContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 16px',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--border)',
  }

  const barStyle = (level: EnergyLevel): CSSProperties => ({
    width: 16,
    height: 24 + (level * 4), // Slightly taller bars as energy increases
    borderRadius: '4px',
    background: level <= value ? colors[value] : 'var(--bg-elevated)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    opacity: level <= value ? 1 : 0.3,
    transform: level <= value ? 'scaleY(1)' : 'scaleY(0.8)',
  })

  const labelStyle: CSSProperties = {
    fontSize: 'var(--text-sm)',
    color: colors[value],
    fontWeight: 500,
    textTransform: 'lowercase',
    letterSpacing: '0.5px',
  }

  return (
    <div style={containerStyle}>
      <div style={batteryContainerStyle}>
        {levels.map(level => (
          <div
            key={level}
            style={barStyle(level)}
            onClick={() => onChange(level)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onChange(level)}
            aria-label={`Set energy to ${labels[level]}`}
            title={labels[level]}
          />
        ))}
      </div>
      <span style={labelStyle}>
        energy: {labels[value]}
      </span>
    </div>
  )
}
