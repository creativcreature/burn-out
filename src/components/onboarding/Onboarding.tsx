import { CSSProperties } from 'react'
import { Orb } from '../shared/Orb'
import { Card } from '../shared/Card'
import { Button } from '../shared/Button'
import { useOnboarding } from '../../hooks/useOnboarding'
import type { EnergyLevel } from '../../data/types'

export function Onboarding() {
  const {
    state,
    totalSteps,
    nextStep,
    prevStep,
    setBurnoutMode,
    setTonePreference,
    setEnergyDefaults,
    completeOnboarding,
    skipOnboarding
  } = useOnboarding()

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
    background: isActive ? 'var(--orb-orange)' : 'var(--border)'
  })

  const actionsStyle: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-md)',
    marginTop: 'var(--space-lg)'
  }

  const energyRowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--space-sm) 0'
  }

  const energyButtonsStyle: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-xs)'
  }

  const energyBtnStyle = (isSelected: boolean): CSSProperties => ({
    width: 36,
    height: 36,
    borderRadius: 'var(--radius-sm)',
    border: `2px solid ${isSelected ? 'var(--orb-orange)' : 'var(--border)'}`,
    background: isSelected ? 'var(--orb-orange)' : 'transparent',
    color: isSelected ? 'white' : 'var(--text)',
    cursor: 'pointer',
    fontWeight: 600
  })

  const renderStep = () => {
    switch (state.step) {
    case 1:
      return (
        <>
          <Orb size="md" breathing />
          <h1 style={titleStyle}>Welcome to BurnOut</h1>
          <p style={subtitleStyle}>
              Work with your energy, not against it.
          </p>
          <Button variant="primary" size="lg" onClick={nextStep}>
              Get Started
          </Button>
          <Button variant="ghost" size="sm" onClick={skipOnboarding}>
              Skip for now
          </Button>
        </>
      )

    case 2:
      return (
        <>
          <h1 style={titleStyle}>How are you feeling?</h1>
          <p style={subtitleStyle}>This helps us tailor the experience to your needs.</p>
          <div style={optionsStyle}>
            {([
              { value: 'recovery', label: 'Recovery Mode', desc: 'I\'m burnt out and need gentle support' },
              { value: 'prevention', label: 'Prevention Mode', desc: 'I want to avoid burning out' },
              { value: 'balanced', label: 'Balanced Mode', desc: 'I\'m doing okay, just want to stay productive' }
            ] as const).map(option => (
              <div
                key={option.value}
                style={optionStyle(state.burnoutMode === option.value)}
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
      )

    case 3:
      return (
        <>
          <h1 style={titleStyle}>Your energy patterns</h1>
          <p style={subtitleStyle}>When do you typically have the most energy?</p>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {(['morning', 'afternoon', 'evening'] as const).map(time => (
                <div key={time} style={energyRowStyle}>
                  <span style={{ textTransform: 'capitalize' }}>{time}</span>
                  <div style={energyButtonsStyle}>
                    {([1, 2, 3, 4, 5] as EnergyLevel[]).map(level => (
                      <button
                        key={level}
                        style={energyBtnStyle(state.energyDefaults[time] === level)}
                        onClick={() => setEnergyDefaults({
                          ...state.energyDefaults,
                          [time]: level
                        })}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <p style={{ ...subtitleStyle, fontSize: 'var(--text-sm)' }}>
              1 = very low, 5 = very high
          </p>
        </>
      )

    case 4:
      return (
        <>
          <h1 style={titleStyle}>How should I talk to you?</h1>
          <p style={subtitleStyle}>Choose the tone that feels right.</p>
          <div style={optionsStyle}>
            {([
              { value: 'gentle', label: 'Gentle', desc: 'Soft, supportive, and understanding' },
              { value: 'direct', label: 'Direct', desc: 'Clear, concise, and to the point' },
              { value: 'playful', label: 'Playful', desc: 'Light, fun, and encouraging' }
            ] as const).map(option => (
              <div
                key={option.value}
                style={optionStyle(state.tonePreference === option.value)}
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
      )

    default:
      return null
    }
  }

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        {state.step > 1 && (
          <div style={progressStyle}>
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} style={dotStyle(i < state.step)} />
            ))}
          </div>
        )}

        {renderStep()}

        {state.step > 1 && (
          <div style={actionsStyle}>
            <Button variant="ghost" onClick={prevStep}>
              Back
            </Button>
            {state.step < totalSteps ? (
              <Button variant="primary" onClick={nextStep}>
                Continue
              </Button>
            ) : (
              <Button variant="primary" onClick={completeOnboarding}>
                Finish
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
