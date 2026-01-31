import { useState, useEffect, useCallback } from 'react'
import { getData, updateData } from '../utils/storage'
import { NewGoalSchema, validate } from '../data/validation'
import type { Goal } from '../data/types'

type NewGoal = Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'archived'>

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadGoals() {
      try {
        const data = await getData()
        setGoals(data.goals)
      } finally {
        setIsLoading(false)
      }
    }
    loadGoals()
  }, [])

  const addGoal = useCallback(async (goalData: NewGoal): Promise<Goal> => {
    // Validate input
    const validation = validate(NewGoalSchema, goalData)
    if (!validation.success) {
      throw new Error(`Invalid goal: ${validation.error}`)
    }

    const now = new Date().toISOString()
    const newGoal: Goal = {
      ...validation.data,
      id: crypto.randomUUID(),
      archived: false,
      createdAt: now,
      updatedAt: now,
      order: goals.length
    }

    await updateData(data => ({
      ...data,
      goals: [...data.goals, newGoal]
    }))

    setGoals(prev => [...prev, newGoal])
    return newGoal
  }, [goals.length])

  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>): Promise<void> => {
    const now = new Date().toISOString()

    await updateData(data => ({
      ...data,
      goals: data.goals.map(goal =>
        goal.id === id ? { ...goal, ...updates, updatedAt: now } : goal
      )
    }))

    setGoals(prev => prev.map(goal =>
      goal.id === id ? { ...goal, ...updates, updatedAt: now } : goal
    ))
  }, [])

  const deleteGoal = useCallback(async (id: string): Promise<void> => {
    await updateData(data => {
      // Get all project IDs under this goal (to cascade delete their tasks too)
      const projectIdsToDelete = data.projects
        .filter(p => p.goalId === id)
        .map(p => p.id)

      return {
        ...data,
        goals: data.goals.filter(g => g.id !== id),
        projects: data.projects.filter(p => p.goalId !== id),
        // Delete tasks with goalId OR projectId under this goal
        tasks: data.tasks.filter(t =>
          t.goalId !== id &&
          (!t.projectId || !projectIdsToDelete.includes(t.projectId))
        )
      }
    })

    setGoals(prev => prev.filter(g => g.id !== id))
  }, [])

  const archiveGoal = useCallback(async (id: string): Promise<void> => {
    await updateGoal(id, { archived: true })
  }, [updateGoal])

  const setActiveGoal = useCallback(async (id: string): Promise<void> => {
    // Deactivate all goals, activate the selected one, and move it to top (order 0)
    await updateData(data => {
      const now = new Date().toISOString()
      return {
        ...data,
        goals: data.goals.map(goal => ({
          ...goal,
          isActive: goal.id === id,
          // Set active goal to order 0, increment all others
          order: goal.id === id ? 0 : (goal.order ?? 0) + 1,
          updatedAt: now
        }))
      }
    })

    setGoals(prev => prev.map(goal => ({
      ...goal,
      isActive: goal.id === id,
      order: goal.id === id ? 0 : (goal.order ?? 0) + 1
    })))
  }, [])

  const reorderGoals = useCallback(async (reorderedGoals: Goal[]): Promise<void> => {
    const withNewOrder = reorderedGoals.map((goal, index) => ({
      ...goal,
      order: index
    }))

    setGoals(withNewOrder)

    await updateData(data => ({
      ...data,
      goals: data.goals.map(goal => {
        const reordered = withNewOrder.find(g => g.id === goal.id)
        return reordered ? { ...goal, order: reordered.order } : goal
      })
    }))
  }, [])

  const nonArchivedGoals = goals.filter(g => !g.archived).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const archivedGoals = goals.filter(g => g.archived)
  const currentActiveGoal = goals.find(g => g.isActive && !g.archived) || null

  return {
    goals,
    activeGoals: nonArchivedGoals,
    archivedGoals,
    currentActiveGoal,
    isLoading,
    addGoal,
    updateGoal,
    deleteGoal,
    archiveGoal,
    setActiveGoal,
    reorderGoals
  }
}
