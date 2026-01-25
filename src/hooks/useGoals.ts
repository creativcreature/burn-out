import { useState, useEffect, useCallback } from 'react'
import { getData, updateData } from '../utils/storage'
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
    const now = new Date().toISOString()
    const newGoal: Goal = {
      ...goalData,
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
    await updateData(data => ({
      ...data,
      goals: data.goals.filter(g => g.id !== id),
      projects: data.projects.filter(p => p.goalId !== id),
      tasks: data.tasks.filter(t => t.goalId !== id)
    }))

    setGoals(prev => prev.filter(g => g.id !== id))
  }, [])

  const archiveGoal = useCallback(async (id: string): Promise<void> => {
    await updateGoal(id, { archived: true })
  }, [updateGoal])

  const activeGoals = goals.filter(g => !g.archived)
  const archivedGoals = goals.filter(g => g.archived)

  return {
    goals,
    activeGoals,
    archivedGoals,
    isLoading,
    addGoal,
    updateGoal,
    deleteGoal,
    archiveGoal
  }
}
