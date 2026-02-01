import { useState, useEffect, useCallback } from 'react'
import type { WeeklySummary, JournalEntry } from '../data/types'

// Extended type for completed tasks joined with task details
interface CompletedTaskWithDetails {
  id: string
  taskId?: string
  completedAt: string
  duration: number
  feedLevel?: 'low' | 'medium' | 'high'
  verbLabel?: string
}
import { 
  getLastWeekData, 
  getWeeklySummary, 
  saveWeeklySummary, 
  getCurrentWeekStartDate,
  getData 
} from '../utils/storage'
import { generateWeeklySummary } from '../utils/ai'

interface UseWeeklySummaryReturn {
  summary: WeeklySummary | null
  loading: boolean
  error: string | null
  refreshSummary: () => Promise<void>
  hasRecentData: boolean
}

/**
 * Hook for managing weekly AI-generated insights
 */
export function useWeeklySummary(): UseWeeklySummaryReturn {
  const [summary, setSummary] = useState<WeeklySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasRecentData, setHasRecentData] = useState(false)

  // Calculate metrics from completed tasks and journal entries
  const calculateWeeklyMetrics = async (
    completedTasks: CompletedTaskWithDetails[],
    journalEntries: JournalEntry[]
  ) => {
    let lowEnergyTaskCount = 0
    let mediumEnergyTaskCount = 0
    let highEnergyTaskCount = 0
    const timePerVerbLabel: Record<string, number> = {}

    // Process completed tasks
    completedTasks.forEach(task => {
      // Count by energy level
      switch (task.feedLevel) {
        case 'low':
          lowEnergyTaskCount++
          break
        case 'medium':
          mediumEnergyTaskCount++
          break
        case 'high':
          highEnergyTaskCount++
          break
      }

      // Accumulate time per verb label
      const verbLabel = task.verbLabel || 'General'
      timePerVerbLabel[verbLabel] = (timePerVerbLabel[verbLabel] || 0) + (task.duration || 0)
    })

    // Process mood breakdown from journal entries
    const moodBreakdown: Record<string, number> = {}
    journalEntries.forEach(entry => {
      if (entry.mood) {
        moodBreakdown[entry.mood] = (moodBreakdown[entry.mood] || 0) + 1
      }
    })

    return {
      completedTaskCount: completedTasks.length,
      lowEnergyTaskCount,
      mediumEnergyTaskCount,
      highEnergyTaskCount,
      timePerVerbLabel,
      moodBreakdown
    }
  }

  // Load existing summary or generate new one
  const loadSummary = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const weekStartDate = getCurrentWeekStartDate()
      
      // Check if we have recent data worth summarizing
      const { completedTasks, journalEntries } = await getLastWeekData()
      const hasData = completedTasks.length > 0 || journalEntries.length > 0
      setHasRecentData(hasData)

      if (!hasData) {
        setSummary(null)
        setLoading(false)
        return
      }

      // Try to get existing summary for this week
      const existingSummary = await getWeeklySummary(weekStartDate)
      
      if (existingSummary) {
        setSummary(existingSummary)
        setLoading(false)
        return
      }

      // Generate new summary
      const metrics = await calculateWeeklyMetrics(completedTasks, journalEntries)
      const userData = await getData()
      
      const aiInsight = await generateWeeklySummary(
        metrics.completedTaskCount,
        metrics.lowEnergyTaskCount,
        metrics.mediumEnergyTaskCount,
        metrics.highEnergyTaskCount,
        metrics.timePerVerbLabel,
        metrics.moodBreakdown,
        userData.user.burnoutMode,
        userData.user.tonePreference
      )

      const newSummary: WeeklySummary = {
        id: crypto.randomUUID(),
        weekStartDate,
        ...metrics,
        aiInsight,
        generatedAt: new Date().toISOString()
      }

      await saveWeeklySummary(newSummary)
      setSummary(newSummary)

    } catch (err) {
      console.error('Failed to load weekly summary:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate summary')
    } finally {
      setLoading(false)
    }
  }, [])

  // Refresh/regenerate the summary
  const refreshSummary = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const weekStartDate = getCurrentWeekStartDate()
      const { completedTasks, journalEntries } = await getLastWeekData()
      
      if (completedTasks.length === 0 && journalEntries.length === 0) {
        setError('No recent activity to summarize')
        return
      }

      const metrics = await calculateWeeklyMetrics(completedTasks, journalEntries)
      const userData = await getData()
      
      const aiInsight = await generateWeeklySummary(
        metrics.completedTaskCount,
        metrics.lowEnergyTaskCount,
        metrics.mediumEnergyTaskCount,
        metrics.highEnergyTaskCount,
        metrics.timePerVerbLabel,
        metrics.moodBreakdown,
        userData.user.burnoutMode,
        userData.user.tonePreference
      )

      const refreshedSummary: WeeklySummary = {
        id: crypto.randomUUID(),
        weekStartDate,
        ...metrics,
        aiInsight,
        generatedAt: new Date().toISOString()
      }

      await saveWeeklySummary(refreshedSummary)
      setSummary(refreshedSummary)

    } catch (err) {
      console.error('Failed to refresh weekly summary:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh summary')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load summary on mount
  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  return {
    summary,
    loading,
    error,
    refreshSummary,
    hasRecentData
  }
}
