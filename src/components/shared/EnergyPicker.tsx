import { CSSProperties } from 'react'
import type { EnergyLevel, BurnoutMode } from '../../data/types'
import { Modal } from './Modal'

interface EnergyPickerProps {
  isOpen: boolean
  onClose: () => void
  currentEnergy: EnergyLevel
  burnoutMode: BurnoutMode
  onEnergyChange: (level: EnergyLevel) => void
  onBurnoutModeChange: (mode: BurnoutMode) => void
}

/**
 * Energy picker modal that opens when tapping the flame icon
 * Replaces the battery-style selector with a flame-based design
 */
export function EnergyPicker({
  isOpen,
  onClose,
  currentEnergy,
  burnoutMode,
  onEnergyChange,
  onBurnoutModeChange
}: EnergyPickerProps) {
  const levels: { level: EnergyLevel; label: string; description: string }[] = [
    { level: 1, label: 'depleted', description: 'Need to rest. Only gentle tasks.' },
    { level: 2, label: 'low', description: 'Taking it easy today.' },
    { level: 3, label: 'okay', description: 'Steady and balanced.' },
    { level: 4, label: 'good', description: 'Feeling capable.' },
    { level: 5, label: 'charged', description: 'Ready for anything.' }
  ]

  // Flame colors based on energy level
  const getFlameColors = (level: EnergyLevel) => {
    switch (level) {
      case 1: return { outer: '#6B7280', inner: '#9CA3AF' } // Gray (depleted)
      case 2: return { outer: '#F59E0B', inner: '#FCD34D' } // Amber (low)
      case 3: return { outer: '#F97316', inner: '#FB923C' } // Orange (okay)
      case 4: return { outer: '#EA580C', inner: '#F97316' } // Deep orange (good)
      case 5: return { outer: '#DC2626', inner: '#F97316' } // Red-orange (charged)
    }
  }

  const handleEnergySelect = (level: EnergyLevel) => {
    onEnergyChange(level)

    // Auto-set burnout mode based on energy
    if (level === 1) {
      onBurnoutModeChange('recovery')
    } else if (level === 2) {
      onBurnoutModeChange('prevention')
    } else if (level >= 3) {
      // Exit recovery/prevention mode when energy is okay or better
      onBurnoutModeChange('balanced')
    }

    onClose()
  }

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)',
    padding: 'var(--space-sm) 0'
  }

  const levelButtonStyle = (level: EnergyLevel): CSSProperties => {
    const isSelected = currentEnergy === level
    const colors = getFlameColors(level)

    return {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-md)',
      padding: 'var(--space-md)',
      background: isSelected ? `linear-gradient(135deg, ${colors.outer}20, ${colors.inner}10)` : 'var(--bg-card)',
      border: isSelected ? `2px solid ${colors.outer}` : '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      transition: 'all var(--transition-fast)',
      textAlign: 'left' as const
    }
  }

  const flameSvgStyle = (level: EnergyLevel): CSSProperties => {
    const scale = 0.6 + (level * 0.1) // Bigger flame for higher energy
    return {
      width: 32,
      height: 32,
      transform: `scale(${scale})`,
      transition: 'transform 0.2s ease'
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="How's your energy?"
    >
      <div style={containerStyle}>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-sm)' }}>
          Tap your flame to set how you're feeling. This helps surface the right tasks for you.
        </p>

        {levels.map(({ level, label, description }) => {
          const colors = getFlameColors(level)
          const isSelected = currentEnergy === level

          return (
            <button
              key={level}
              onClick={() => handleEnergySelect(level)}
              style={levelButtonStyle(level)}
            >
              {/* Flame icon for this level */}
              <svg viewBox="0 0 24 24" fill="none" style={flameSvgStyle(level)}>
                {/* Outer flame - classic two-point shape */}
                <path
                  d="M12 2 C12 2 7 8 7 13 C7 17 9 20 12 21 C15 20 17 17 17 13 C17 8 12 2 12 2 Z"
                  fill={colors.outer}
                  opacity={isSelected ? 1 : 0.7}
                />
                {/* Inner flame */}
                <path
                  d="M12 7 C12 7 9.5 11 9.5 14 C9.5 16 10.5 17.5 12 18 C13.5 17.5 14.5 16 14.5 14 C14.5 11 12 7 12 7 Z"
                  fill={colors.inner}
                  opacity={isSelected ? 0.9 : 0.6}
                />
              </svg>

              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: 600,
                  color: isSelected ? colors.outer : 'var(--text)',
                  textTransform: 'lowercase',
                  marginBottom: '2px'
                }}>
                  {label}
                  {isSelected && <span style={{ marginLeft: '8px', fontSize: 'var(--text-xs)' }}>✓</span>}
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                  {description}
                </div>
              </div>
            </button>
          )
        })}

        {/* Burnout mode indicator */}
        {burnoutMode !== 'balanced' && (
          <div style={{
            marginTop: 'var(--space-sm)',
            padding: 'var(--space-md)',
            background: burnoutMode === 'recovery' ? 'var(--bg-elevated)' : 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            <span style={{
              fontSize: 'var(--text-sm)',
              color: burnoutMode === 'recovery' ? 'var(--text-muted)' : 'var(--orb-orange)'
            }}>
              {burnoutMode === 'recovery'
                ? '🌱 Recovery mode active — only gentle tasks'
                : '⚖️ Prevention mode — maintaining balance'}
            </span>
          </div>
        )}
      </div>
    </Modal>
  )
}
