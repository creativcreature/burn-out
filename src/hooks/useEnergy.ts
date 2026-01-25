import { useState, useEffect, useCallback, useMemo } from 'react'
import { getData, updateData } from '../utils/storage'
import type { EnergyLevel, TimeOfDay, Task } from '../data/types'

export function useEnergy() {
  const [currentEnergy, setCurrentEnergy] = useState<EnergyLevel>(3)
  const [energyDefaults, setEnergyDefaults] = useState({
    morning: 3 as EnergyLevel,
    afternoon: 3 as EnergyLevel,
    evening: 2 as EnergyLevel
  })

  useEffect(() => {
    async function loadEnergy() {
      const data = await getData()
      setEnergyDefaults(data.user.energyDefaults)
      // Set current energy based on time of day
      const hour = new Date().getHours()
      if (hour >= 6 && hour < 12) {
        setCurrentEnergy(data.user.energyDefaults.morning)
      } else if (hour >= 12 && hour < 17) {
        setCurrentEnergy(data.user.energyDefaults.afternoon)
      } else {
        setCurrentEnergy(data.user.energyDefaults.evening)
      }
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

    return score
  }, [currentEnergy, getCurrentTimeOfDay])

  const sortTasksByEnergy = useCallback((tasks: Task[]): Task[] => {
    return [...tasks].sort((a, b) => getTaskScore(b) - getTaskScore(a))
  }, [getTaskScore])

  const getSuggestedTask = useCallback((tasks: Task[]): Task | null => {
    const sorted = sortTasksByEnergy(tasks.filter(t => t.status === 'pending'))
    return sorted[0] || null
  }, [sortTasksByEnergy])

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

  return {
    currentEnergy,
    energyDefaults,
    getEnergyLabel,
    setEnergy,
    updateDefaults,
    getCurrentTimeOfDay,
    getTaskScore,
    sortTasksByEnergy,
    getSuggestedTask
  }
}
