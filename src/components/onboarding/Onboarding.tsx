import { useState, useCallback } from 'react'
import { OnboardingChoice, type OnboardingPath } from './OnboardingChoice'
import { OnboardingQuick } from './OnboardingQuick'
import { OnboardingGuided } from './OnboardingGuided'
import { updateData } from '../../utils/storage'
import { createDemoData } from '../../data/demoData'
import { TEMPLATES } from '../../data/templates'
import type { BurnoutMode, TonePreference, Goal, Project } from '../../data/types'

interface OnboardingProps {
  onComplete?: () => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [path, setPath] = useState<OnboardingPath | null>(null)

  const completeOnboarding = useCallback(async (settings: {
    burnoutMode: BurnoutMode
    tonePreference: TonePreference
    templateId?: string
    goal?: Partial<Goal>
    project?: Partial<Project>
  }) => {
    const now = new Date().toISOString()
    const template = settings.templateId ? TEMPLATES[settings.templateId] : null

    await updateData(data => {
      const newGoals: Goal[] = [...data.goals]
      const newProjects: Project[] = [...data.projects]

      // Add goal if provided
      if (settings.goal?.title || (template?.goals && template.goals.length > 0)) {
        const goalTitle = settings.goal?.title || template?.goals[0].title || 'My Goal'
        const goalId = crypto.randomUUID()
        const newGoal: Goal = {
          id: goalId,
          title: goalTitle,
          description: settings.goal?.description || template?.goals[0]?.description,
          timeframe: template?.goals[0]?.timeframe || '6m',
          isActive: true,
          rank: 1,
          createdAt: now,
          updatedAt: now,
          archived: false,
          order: 0
        }
        newGoals.push(newGoal)

        // Add project if provided
        if (settings.project?.title || (template?.projects && template.projects.length > 0)) {
          const projectTitle = settings.project?.title || template?.projects[0].title || 'First Project'
          newProjects.push({
            id: crypto.randomUUID(),
            goalId: goalId,
            title: projectTitle,
            description: settings.project?.description || template?.projects[0]?.description,
            status: 'active',
            createdAt: now,
            updatedAt: now,
            order: 0
          })
        }
      }

      return {
        ...data,
        goals: newGoals,
        projects: newProjects,
        user: {
          ...data.user,
          burnoutMode: settings.burnoutMode,
          tonePreference: settings.tonePreference
        },
        onboarding: {
          completed: true,
          completedAt: now,
          skippedSteps: []
        }
      }
    })

    onComplete?.()
  }, [onComplete])

  const skipWithDemoData = useCallback(async () => {
    const now = new Date().toISOString()
    const demoData = createDemoData()

    await updateData(data => ({
      ...data,
      ...demoData,
      user: {
        ...data.user,
        burnoutMode: 'balanced',
        tonePreference: 'gentle'
      },
      onboarding: {
        completed: true,
        completedAt: now,
        skippedSteps: ['all']
      }
    }))

    onComplete?.()
  }, [onComplete])

  const handlePathSelect = (selectedPath: OnboardingPath) => {
    if (selectedPath === 'explore') {
      skipWithDemoData()
    } else {
      setPath(selectedPath)
    }
  }

  const handleBack = () => {
    setPath(null)
  }

  if (path === 'quick') {
    return (
      <OnboardingQuick
        onComplete={(settings) => completeOnboarding(settings)}
        onBack={handleBack}
      />
    )
  }

  if (path === 'guided') {
    return (
      <OnboardingGuided
        onComplete={(settings) => completeOnboarding(settings)}
        onBack={handleBack}
      />
    )
  }

  return <OnboardingChoice onSelect={handlePathSelect} />
}
