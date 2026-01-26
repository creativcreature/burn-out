import { useState, CSSProperties } from 'react'
import { Orb } from '../shared/Orb'
import { Card } from '../shared/Card'
import { Button } from '../shared/Button'
import { TEMPLATE_LIST, type OnboardingTemplate } from '../../data/templates'
import type { BurnoutMode, TonePreference, Goal, Project } from '../../data/types'

interface GuidedSettings {
  burnoutMode: BurnoutMode
  tonePreference: TonePreference
  templateId: string
  goal?: Partial<Goal>
  project?: Partial<Project>
}

interface OnboardingGuidedProps {
  onComplete: (settings: GuidedSettings) => void
  onBack: () => void
}

const TOTAL_STEPS = 6

export function OnboardingGuided({ onComplete, onBack }: OnboardingGuidedProps) {
  const [step, setStep] = useState(1)
  const [burnoutMode, setBurnoutMode] = useState<BurnoutMode>('balanced')
  const [tonePreference, setTonePreference] = useState<TonePreference>('gentle')
  const [selectedTemplate, setSelectedTemplate] = useState<OnboardingTemplate | null>(null)
  const [goalTitle, setGoalTitle] = useState('')
  const [projectTitle, setProjectTitle] = useState('')

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

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: 'var(--space-md)',
    fontSize: 'var(--text-md)',
    background: 'var(--bg-card)',
    border: '2px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text)',
    outline: 'none',
    textAlign: 'center'
  }

  const handleNext = () => {
    if (step === TOTAL_STEPS) {
      // Complete!
      onComplete({
        burnoutMode,
        tonePreference,
        templateId: selectedTemplate?.id || 'custom',
        goal: goalTitle ? { title: goalTitle } : selectedTemplate?.goals[0],
        project: projectTitle ? { title: projectTitle } : selectedTemplate?.projects[0]
      })
    } else {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step === 1) {
      onBack()
    } else {
      setStep(step - 1)
    }
  }

  const renderStep = () => {
    switch (step) {
    case 1:
      return (
        <>
          <Orb size="md" breathing />
          <div>
            <h1 style={titleStyle}>Let's get started</h1>
            <p style={subtitleStyle}>
              We'll set up your workspace in just a few steps. This helps us understand how to best support you.
            </p>
          </div>
        </>
      )

    case 2:
      return (
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
      )

    case 3:
      return (
        <>
          <div>
            <h1 style={titleStyle}>Choose a template</h1>
            <p style={subtitleStyle}>Start with goals tailored to your focus area.</p>
          </div>

          <div style={optionsStyle}>
            {TEMPLATE_LIST.map(template => (
              <div
                key={template.id}
                style={optionStyle(selectedTemplate?.id === template.id)}
                onClick={() => setSelectedTemplate(template)}
              >
                <strong>{template.name}</strong>
                <div style={{ fontSize: 'var(--text-sm)', opacity: 0.8, marginTop: 4 }}>
                  {template.description}
                </div>
              </div>
            ))}
          </div>
        </>
      )

    case 4:
      return (
        <>
          <div>
            <h1 style={titleStyle}>Your first goal</h1>
            <p style={subtitleStyle}>
              {selectedTemplate?.goals[0]
                ? 'We\'ve suggested one based on your template. Feel free to customize it.'
                : 'What do you want to work towards?'}
            </p>
          </div>

          <Card>
            <input
              type="text"
              style={inputStyle}
              value={goalTitle || selectedTemplate?.goals[0]?.title || ''}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="e.g., Build better habits"
            />
          </Card>
        </>
      )

    case 5:
      return (
        <>
          <div>
            <h1 style={titleStyle}>First project</h1>
            <p style={subtitleStyle}>
              Break your goal into a smaller milestone.
            </p>
          </div>

          <Card>
            <input
              type="text"
              style={inputStyle}
              value={projectTitle || selectedTemplate?.projects[0]?.title || ''}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="e.g., Morning Routine"
            />
          </Card>
        </>
      )

    case 6:
      return (
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
      )

    default:
      return null
    }
  }

  const canProceed = () => {
    switch (step) {
    case 3:
      return selectedTemplate !== null
    case 4:
      return (goalTitle || selectedTemplate?.goals[0]?.title)
    case 5:
      return (projectTitle || selectedTemplate?.projects[0]?.title)
    default:
      return true
    }
  }

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <div style={progressStyle}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div key={i} style={dotStyle(i < step)} />
          ))}
        </div>

        {renderStep()}

        <div style={actionsStyle}>
          <Button variant="ghost" onClick={handleBack}>
            Back
          </Button>
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {step === TOTAL_STEPS ? 'Finish' : step === 1 ? 'Get Started' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
}
