import { useState, useEffect, useCallback } from 'react'
import { getData, updateData } from '../utils/storage'
import type { Habit } from '../data/types'

type NewHabit = Omit<Habit, 'id' | 'createdAt' | 'completionCount' | 'lastCompleted'>

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadHabits() {
      try {
        const data = await getData()
        setHabits(data.habits)
      } finally {
        setIsLoading(false)
      }
    }
    loadHabits()
  }, [])

  const addHabit = useCallback(async (habitData: NewHabit): Promise<Habit> => {
    const now = new Date().toISOString()
    const newHabit: Habit = {
      ...habitData,
      id: crypto.randomUUID(),
      createdAt: now,
      completionCount: 0
    }

    await updateData(data => ({
      ...data,
      habits: [...data.habits, newHabit]
    }))

    setHabits(prev => [...prev, newHabit])
    return newHabit
  }, [])

  const updateHabit = useCallback(async (id: string, updates: Partial<Habit>): Promise<void> => {
    await updateData(data => ({
      ...data,
      habits: data.habits.map(habit =>
        habit.id === id ? { ...habit, ...updates } : habit
      )
    }))

    setHabits(prev => prev.map(habit =>
      habit.id === id ? { ...habit, ...updates } : habit
    ))
  }, [])

  const completeHabit = useCallback(async (id: string): Promise<void> => {
    const now = new Date().toISOString()
    const habit = habits.find(h => h.id === id)
    if (!habit) return

    await updateData(data => ({
      ...data,
      habits: data.habits.map(h =>
        h.id === id
          ? { ...h, lastCompleted: now, completionCount: h.completionCount + 1 }
          : h
      ),
      completedTasks: [
        ...data.completedTasks,
        {
          id: crypto.randomUUID(),
          habitId: id,
          completedAt: now,
          duration: 0
        }
      ]
    }))

    setHabits(prev => prev.map(h =>
      h.id === id
        ? { ...h, lastCompleted: now, completionCount: h.completionCount + 1 }
        : h
    ))
  }, [habits])

  const deleteHabit = useCallback(async (id: string): Promise<void> => {
    await updateData(data => ({
      ...data,
      habits: data.habits.filter(h => h.id !== id)
    }))

    setHabits(prev => prev.filter(h => h.id !== id))
  }, [])

  const isDueToday = useCallback((habit: Habit): boolean => {
    const today = new Date()
    const dayOfWeek = today.getDay()

    if (habit.lastCompleted) {
      const lastDate = new Date(habit.lastCompleted)
      if (lastDate.toDateString() === today.toDateString()) {
        return false // Already completed today
      }
    }

    if (habit.frequency === 'daily') return true
    if (habit.frequency === 'weekly') {
      return dayOfWeek === 1 // Mondays
    }
    if (habit.frequency === 'custom' && habit.customDays) {
      return habit.customDays.includes(dayOfWeek)
    }
    return false
  }, [])

  const todayHabits = habits.filter(isDueToday)

  return {
    habits,
    todayHabits,
    isLoading,
    addHabit,
    updateHabit,
    completeHabit,
    deleteHabit,
    isDueToday
  }
}
