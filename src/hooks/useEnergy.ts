import { useState, useEffect, useCallback, useMemo } from 'react'
import { getData, updateData } from '../utils/storage'
import type { EnergyLevel, TimeOfDay, Task, BurnoutMode } from '../data/types'

export function useEnergy() {
  const [currentEnergy, setCurrentEnergy] = useState<EnergyLevel>(3)
  const [momentum, setMomentum] = useState(0) // Consecutive completions today
  const [burnoutMode, setBurnoutMode] = useState<BurnoutMode>('balanced')
  const [energyDefaults, setEnergyDefaults] = useState({
    morning: 3 as EnergyLevel,
    afternoon: 3 as EnergyLevel,
    evening: 2 as EnergyLevel
  })

  useEffect(() => {
    async function loadEnergy() {
      const data = await getData()
      setEnergyDefaults(data.user.energyDefaults)
      setBurnoutMode(data.user.burnoutMode)

      // Set current energy based on time of day
      const hour = new Date().getHours()
      if (hour >= 6 && hour < 12) {
        setCurrentEnergy(data.user.energyDefaults.morning)
      } else if (hour >= 12 && hour < 17) {
        setCurrentEnergy(data.user.energyDefaults.afternoon)
      } else {
        setCurrentEnergy(data.user.energyDefaults.evening)
      }

      // Calculate momentum (tasks completed today)
      const today = new Date().toISOString().split('T')[0]
      const todayCompletions = data.completedTasks.filter(t =>
        t.completedAt.startsWith(today)
      ).length
      setMomentum(todayCompletions)
    }
    loadEnergy()
  }, [])

  const getCurrentTimeOfDay = useCallback((): TimeOfDay => {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 17) return 'afternoon'
    if (hour >= 17 && hour < 22) return 'evening'
    return 'anytime'
  }, [])

  const setEnergy = useCallback(async (level: EnergyLevel) => {
    setCurrentEnergy(level)
  }, [])

  const updateDefaults = useCallback(async (defaults: typeof energyDefaults) => {
    await updateData(data => ({
      ...data,
      user: { ...data.user, energyDefaults: defaults }
    }))
    setEnergyDefaults(defaults)
  }, [])

  const getTaskScore = useCallback((task: Task): number => {
    let score = 0

    // Energy match (higher score if task energy matches current energy)
    const energyMap = { low: 1, medium: 3, high: 5 }
    const taskEnergy = energyMap[task.feedLevel]
    const energyDiff = Math.abs(taskEnergy - currentEnergy)
    score += (5 - energyDiff) * 10 // 10-50 points

    // Time of day match
    const currentTod = getCurrentTimeOfDay()
    if (task.timeOfDay === currentTod || task.timeOfDay === 'anytime') {
      score += 20
    }

    // Prefer shorter tasks when energy is low
    if (currentEnergy <= 2 && task.timeEstimate <= 15) {
      score += 15
    }

    // Prefer longer tasks when energy is high
    if (currentEnergy >= 4 && task.timeEstimate >= 30) {
      score += 10
    }

    // Momentum bonus - after completing tasks, suggest similar difficulty
    if (momentum > 0) {
      // With momentum, we can handle slightly harder tasks
      if (momentum >= 3 && task.feedLevel === 'high') {
        score += 10 // Feeling accomplished, can tackle harder tasks
      } else if (momentum >= 1 && task.feedLevel === 'medium') {
        score += 5 // Keep the flow going
      }
    }

    // If no momentum and low energy, strongly prefer quick wins
    if (momentum === 0 && currentEnergy <= 2 && task.feedLevel === 'low') {
      score += 25 // Help user get started with easy wins
    }

    // BURNOUT MODE ADJUSTMENTS
    if (burnoutMode === 'recovery') {
      // Recovery mode: strongly prefer low energy, short tasks
      if (task.feedLevel === 'low') {
        score += 40 // Strong preference for gentle tasks
      } else if (task.feedLevel === 'high') {
        score -= 50 // Heavily penalize high-energy tasks
      }
      if (task.timeEstimate <= 15) {
        score += 20 // Prefer quick wins
      } else if (task.timeEstimate >= 60) {
        score -= 30 // Penalize long tasks
      }
    } else if (burnoutMode === 'prevention') {
      // Prevention mode: prefer balance, avoid extremes
      if (task.feedLevel === 'medium') {
        score += 15 // Prefer medium energy tasks
      }
      if (task.feedLevel === 'high' && momentum >= 3) {
        score -= 20 // Discourage pushing too hard after completing several tasks
      }
      if (task.timeEstimate >= 90) {
        score -= 15 // Avoid very long focused sessions
      }
    }
    // 'balanced' mode = no additional adjustments (default behavior)

    return score
  }, [currentEnergy, momentum, burnoutMode, getCurrentTimeOfDay])

  const sortTasksByEnergy = useCallback((tasks: Task[]): Task[] => {
    let filtered = [...tasks]
    
    // In recovery mode, filter out high energy tasks entirely
    if (burnoutMode === 'recovery') {
      filtered = filtered.filter(t => t.feedLevel !== 'high')
    }
    
    return filtered.sort((a, b) => getTaskScore(b) - getTaskScore(a))
  }, [getTaskScore, burnoutMode])

  const getSuggestedTask = useCallback((tasks: Task[]): Task | null => {
    const sorted = sortTasksByEnergy(tasks.filter(t => t.status === 'pending'))
    return sorted[0] || null
  }, [sortTasksByEnergy])

  // Get a message about current burnout mode
  const getBurnoutModeMessage = useCallback((): string | null => {
    if (burnoutMode === 'recovery') {
      return '🌱 Recovery mode: Only gentle tasks. Take it easy.'
    }
    if (burnoutMode === 'prevention') {
      return '⚖️ Prevention mode: Maintaining balance.'
    }
    return null
  }, [burnoutMode])

  const getEnergyLabel = useMemo(() => {
    const labels: Record<EnergyLevel, string> = {
      1: 'Very Low',
      2: 'Low',
      3: 'Medium',
      4: 'High',
      5: 'Very High'
    }
    return labels[currentEnergy]
  }, [currentEnergy])

  const getGreeting = useCallback((): string => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'Good morning'
    if (hour >= 12 && hour < 17) return 'Good afternoon'
    if (hour >= 17 && hour < 21) return 'Good evening'
    return 'Late night'
  }, [])

  const getMomentumMessage = useCallback((): string | null => {
    if (momentum === 0) return null
    if (momentum === 1) return "You've completed 1 task today. Nice start!"
    if (momentum <= 3) return `${momentum} tasks done today. Keep the flow going.`
    return `${momentum} tasks completed! You're on a roll.`
  }, [momentum])

  // Refresh momentum from storage (call after completing a task)
  const refreshMomentum = useCallback(async () => {
    const data = await getData()
    const today = new Date().toISOString().split('T')[0]
    const todayCompletions = data.completedTasks.filter(t =>
      t.completedAt.startsWith(today)
    ).length
    setMomentum(todayCompletions)
  }, [])

  return {
    currentEnergy,
    momentum,
    burnoutMode,
    energyDefaults,
    getEnergyLabel,
    setEnergy,
    updateDefaults,
    getCurrentTimeOfDay,
    getGreeting,
    getMomentumMessage,
    getBurnoutModeMessage,
    refreshMomentum,
    getTaskScore,
    sortTasksByEnergy,
    getSuggestedTask
  }
}
