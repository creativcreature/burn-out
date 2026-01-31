import { useState, CSSProperties } from 'react'
import { Button } from '../shared/Button'
import type { BurnoutMode, TonePreference } from '../../data/types'

interface OnboardingQuickProps {
  onComplete: (settings: { burnoutMode: BurnoutMode; tonePreference: TonePreference }) => void
  onBack: () => void
}

export function OnboardingQuick({ onComplete, onBack }: OnboardingQuickProps) {
  const [step, setStep] = useState(1)
  const [burnoutMode, setBurnoutMode] = useState<BurnoutMode>('balanced')
  const [tonePreference, setTonePreference] = useState<TonePreference>('gentle')

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
    color: 'var(--text)'
  }

  const subtitleStyle: CSSProperties = {
    color: 'var(--text-muted)',
    fontSize: 'var(--text-md)'
  }

  const optionsStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
    width: '100%'
  }

  const optionStyle = (isSelected: boolean): CSSProperties => ({
    padding: 'var(--space-md)',
    background: isSelected ? 'var(--orb-orange)' : 'var(--bg-card)',
    color: isSelected ? 'white' : 'var(--text)',
    borderRadius: 'var(--radius-md)',
    border: `2px solid ${isSelected ? 'var(--orb-orange)' : 'var(--border)'}`,
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    textAlign: 'left' as const
  })

  const progressStyle: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-xs)',
    marginBottom: 'var(--space-lg)'
  }

  const dotStyle = (isActive: boolean): CSSProperties => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: isActive ? 'var(--orb-orange)' : 'var(--border)',
    transition: 'background var(--transition-fast)'
  })

  const actionsStyle: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-md)',
    marginTop: 'var(--space-lg)'
  }

  const handleNext = () => {
    if (step === 1) {
      setStep(2)
    } else {
      onComplete({ burnoutMode, tonePreference })
    }
  }

  const handleBack = () => {
    if (step === 1) {
      onBack()
    } else {
      setStep(1)
    }
  }

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <div style={progressStyle}>
          <div style={dotStyle(step >= 1)} />
          <div style={dotStyle(step >= 2)} />
        </div>

        {step === 1 ? (
          <>
            <div>
              <h1 style={titleStyle}>How are you feeling?</h1>
              <p style={subtitleStyle}>This helps us tailor the experience.</p>
            </div>

            <div style={optionsStyle}>
              {([
                { value: 'recovery', label: 'Recovery Mode', desc: 'I\'m burnt out and need gentle support' },
                { value: 'prevention', label: 'Prevention Mode', desc: 'I want to avoid burning out' },
                { value: 'balanced', label: 'Balanced Mode', desc: 'I\'m doing okay, staying productive' }
              ] as const).map(option => (
                <div
                  key={option.value}
                  style={optionStyle(burnoutMode === option.value)}
                  onClick={() => setBurnoutMode(option.value)}
                >
                  <strong>{option.label}</strong>
                  <div style={{ fontSize: 'var(--text-sm)', opacity: 0.8, marginTop: 4 }}>
                    {option.desc}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div>
              <h1 style={titleStyle}>Communication style</h1>
              <p style={subtitleStyle}>How should I talk to you?</p>
            </div>

            <div style={optionsStyle}>
              {([
                { value: 'gentle', label: 'Gentle', desc: 'Soft, supportive, and understanding' },
                { value: 'direct', label: 'Direct', desc: 'Clear, concise, and to the point' },
                { value: 'playful', label: 'Playful', desc: 'Light, fun, and encouraging' }
              ] as const).map(option => (
                <div
                  key={option.value}
                  style={optionStyle(tonePreference === option.value)}
                  onClick={() => setTonePreference(option.value)}
                >
                  <strong>{option.label}</strong>
                  <div style={{ fontSize: 'var(--text-sm)', opacity: 0.8, marginTop: 4 }}>
                    {option.desc}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={actionsStyle}>
          <Button variant="ghost" onClick={handleBack}>
            Back
          </Button>
          <Button variant="primary" onClick={handleNext}>
            {step === 2 ? 'Finish' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
}
