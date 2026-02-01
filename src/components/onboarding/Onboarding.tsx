import { useState, useCallback } from 'react'
import { OnboardingChoice, type OnboardingPath } from './OnboardingChoice'
import { OnboardingQuick } from './OnboardingQuick'
import { OnboardingGuided } from './OnboardingGuided'
import { updateData } from '../../utils/storage'
import { createDemoData } from '../../data/demoData'
import { createSampleData } from '../../data/sampleDataV2'
import { TEMPLATES } from '../../data/templates'
import type { BurnoutMode, TonePreference, Goal, Project, Task } from '../../data/types'
import type { ExtractedTask } from '../../utils/ai'

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
    tasks?: ExtractedTask[]
  }) => {
    const now = new Date().toISOString()
    const template = settings.templateId ? TEMPLATES[settings.templateId] : null

    await updateData(data => {
      const newGoals: Goal[] = [...data.goals]
      const newProjects: Project[] = [...data.projects]
      let newTasks: Task[] = [...data.tasks]

      // Create default goal for brain dump tasks
      let defaultGoalId: string | undefined
      if (settings.tasks && settings.tasks.length > 0) {
        defaultGoalId = crypto.randomUUID()
        newGoals.push({
          id: defaultGoalId,
          title: 'Getting Started',
          description: 'Tasks from your brain dump',
          timeframe: '3m',
          isActive: true,
          createdAt: now,
          updatedAt: now,
          archived: false,
          order: 0
        })

        // Convert extracted tasks to real tasks
        newTasks = [
          ...newTasks,
          ...settings.tasks.map((t, i) => ({
            id: crypto.randomUUID(),
            goalId: defaultGoalId,
            verbLabel: t.verbLabel,
            taskBody: t.taskBody,
            status: 'pending' as const,
            feedLevel: t.feedLevel,
            timeEstimate: t.timeEstimate,
            timeOfDay: 'anytime' as const,
            createdAt: now,
            updatedAt: now,
            order: newTasks.length + i
          }))
        ]
      }

      // Add goal if provided (from quick/template flow)
      if (settings.goal?.title || (template?.goals && template.goals.length > 0)) {
        const goalTitle = settings.goal?.title || template?.goals[0].title || 'My Goal'
        const goalId = crypto.randomUUID()
        const newGoal: Goal = {
          id: goalId,
          title: goalTitle,
          description: settings.goal?.description || template?.goals[0]?.description,
          timeframe: template?.goals[0]?.timeframe || '6m',
          isActive: true,
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
        tasks: newTasks,
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
    const sampleData = createSampleData() // 73 expanded tasks

    await updateData(data => ({
      ...data,
      ...demoData,
      goals: sampleData.goals, // Use expanded goals
      tasks: sampleData.tasks, // Use expanded tasks (73 realistic tasks)
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
