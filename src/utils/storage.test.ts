import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getData,
  saveData,
  updateData,
  getTheme,
  setTheme,
  createSampleData
} from './storage'
import type { BurnOutData, Theme } from '../data/types'

// Mock idb-keyval
const mockGet = vi.fn()
const mockSet = vi.fn()

vi.mock('idb-keyval', () => ({
  get: () => mockGet(),
  set: (key: string, value: unknown) => mockSet(key, value)
}))

describe('storage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockResolvedValue(null)
    mockSet.mockResolvedValue(undefined)
  })

  describe('getData', () => {
    it('returns stored data when available', async () => {
      const storedData: BurnOutData = {
        version: 1,
        theme: 'dark',
        user: {
          id: 'test-user',
          createdAt: '2024-01-01',
          burnoutMode: 'balanced',
          energyDefaults: { morning: 3, afternoon: 3, evening: 2 },
          tonePreference: 'gentle',
          timeAvailability: { weekday: [], weekend: [] }
        },
        goals: [{ id: 'goal-1', title: 'Test Goal', timeframe: '1y', isActive: false, createdAt: '', updatedAt: '', archived: false, order: 0 }],
        projects: [],
        tasks: [],
        taskCategories: [],
        habits: [],
        completedTasks: [],
        journalEntries: [],
        chatHistory: [],
        conversations: [],
        settings: { notifications: true, dailyReminder: '09:00', haptics: true, soundEnabled: true  },
        onboarding: { completed: true, skippedSteps: [] },
        weeklySummaries: []
      }
      mockGet.mockResolvedValue(storedData)

      const result = await getData()

      expect(result.theme).toBe('dark')
      expect(result.goals).toHaveLength(1)
      expect(result.settings.notifications).toBe(true)
    })

    it('creates default data when storage is empty', async () => {
      mockGet.mockResolvedValue(null)

      const result = await getData()

      expect(result.version).toBeDefined()
      expect(result.theme).toBe('light')
      expect(result.goals).toEqual([])
      expect(result.tasks).toEqual([])
      expect(result.onboarding.completed).toBe(false)
    })

    it('saves default data to storage when creating new', async () => {
      mockGet.mockResolvedValue(null)

      await getData()

      expect(mockSet).toHaveBeenCalled()
    })

    it('handles storage errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockGet.mockRejectedValue(new Error('Storage unavailable'))

      const result = await getData()

      // Should return default data on error
      expect(result.theme).toBe('light')
      expect(result.goals).toEqual([])
      consoleSpy.mockRestore()
    })
  })

  describe('saveData', () => {
    it('saves data to storage', async () => {
      const data: BurnOutData = {
        version: 1,
        theme: 'dark',
        user: {
          id: 'test',
          createdAt: '2024-01-01',
          burnoutMode: 'balanced',
          energyDefaults: { morning: 3, afternoon: 3, evening: 2 },
          tonePreference: 'gentle',
          timeAvailability: { weekday: [], weekend: [] }
        },
        goals: [],
        projects: [],
        tasks: [],
        taskCategories: [],
        habits: [],
        completedTasks: [],
        journalEntries: [],
        chatHistory: [],
        conversations: [],
        settings: { notifications: false, dailyReminder: null, haptics: true, soundEnabled: true  },
        onboarding: { completed: false, skippedSteps: [] }, weeklySummaries: []
      }

      await saveData(data)

      expect(mockSet).toHaveBeenCalledWith('burnout_v4', data)
    })

    it('throws on save error', async () => {
      mockSet.mockRejectedValue(new Error('Save failed'))

      const data: BurnOutData = {
        version: 1,
        theme: 'light',
        user: {
          id: 'test',
          createdAt: '2024-01-01',
          burnoutMode: 'balanced',
          energyDefaults: { morning: 3, afternoon: 3, evening: 2 },
          tonePreference: 'gentle',
          timeAvailability: { weekday: [], weekend: [] }
        },
        goals: [],
        projects: [],
        tasks: [],
        taskCategories: [],
        habits: [],
        completedTasks: [],
        journalEntries: [],
        chatHistory: [],
        conversations: [],
        settings: { notifications: false, dailyReminder: null, haptics: true, soundEnabled: true  },
        onboarding: { completed: false, skippedSteps: [] }, weeklySummaries: []
      }

      await expect(saveData(data)).rejects.toThrow('Save failed')
    })
  })

  describe('updateData', () => {
    it('applies updater function to current data', async () => {
      const existingData: BurnOutData = {
        version: 1,
        theme: 'light',
        user: {
          id: 'test',
          createdAt: '2024-01-01',
          burnoutMode: 'balanced',
          energyDefaults: { morning: 3, afternoon: 3, evening: 2 },
          tonePreference: 'gentle',
          timeAvailability: { weekday: [], weekend: [] }
        },
        goals: [],
        projects: [],
        tasks: [],
        taskCategories: [],
        habits: [],
        completedTasks: [],
        journalEntries: [],
        chatHistory: [],
        conversations: [],
        settings: { notifications: false, dailyReminder: null, haptics: true, soundEnabled: true  },
        onboarding: { completed: false, skippedSteps: [] }, weeklySummaries: []
      }
      mockGet.mockResolvedValue(existingData)

      const result = await updateData(data => ({
        ...data,
        theme: 'dark' as Theme
      }))

      expect(result.theme).toBe('dark')
      expect(mockSet).toHaveBeenCalled()
    })

    it('returns updated data', async () => {
      mockGet.mockResolvedValue({
        version: 1,
        theme: 'light',
        user: { id: 'test', createdAt: '', burnoutMode: 'balanced', energyDefaults: { morning: 3, afternoon: 3, evening: 2 }, tonePreference: 'gentle', timeAvailability: { weekday: [], weekend: [] } },
        goals: [],
        projects: [],
        tasks: [],
        taskCategories: [],
        habits: [],
        completedTasks: [],
        journalEntries: [],
        chatHistory: [],
        conversations: [],
        settings: { notifications: false, dailyReminder: null, haptics: true, soundEnabled: true  },
        onboarding: { completed: false, skippedSteps: [] }, weeklySummaries: []
      })

      const result = await updateData(data => ({
        ...data,
        goals: [{ id: 'new-goal', title: 'New', timeframe: '1y' as const, isActive: false, createdAt: '', updatedAt: '', archived: false, order: 0 }]
      }))

      expect(result.goals).toHaveLength(1)
      expect(result.goals[0].title).toBe('New')
    })
  })

  describe('getTheme', () => {
    it('returns theme from stored data', async () => {
      mockGet.mockResolvedValue({
        version: 1,
        theme: 'dark',
        user: { id: '', createdAt: '', burnoutMode: 'balanced', energyDefaults: { morning: 3, afternoon: 3, evening: 2 }, tonePreference: 'gentle', timeAvailability: { weekday: [], weekend: [] } },
        goals: [],
        projects: [],
        tasks: [],
        taskCategories: [],
        habits: [],
        completedTasks: [],
        journalEntries: [],
        chatHistory: [],
        conversations: [],
        settings: { notifications: false, dailyReminder: null, haptics: true, soundEnabled: true  },
        onboarding: { completed: false, skippedSteps: [] }, weeklySummaries: []
      })

      const theme = await getTheme()

      expect(theme).toBe('dark')
    })

    it('returns light as default theme', async () => {
      mockGet.mockResolvedValue(null)

      const theme = await getTheme()

      expect(theme).toBe('light')
    })
  })

  describe('setTheme', () => {
    it('updates theme in storage', async () => {
      mockGet.mockResolvedValue({
        version: 1,
        theme: 'light',
        user: { id: '', createdAt: '', burnoutMode: 'balanced', energyDefaults: { morning: 3, afternoon: 3, evening: 2 }, tonePreference: 'gentle', timeAvailability: { weekday: [], weekend: [] } },
        goals: [],
        projects: [],
        tasks: [],
        taskCategories: [],
        habits: [],
        completedTasks: [],
        journalEntries: [],
        chatHistory: [],
        conversations: [],
        settings: { notifications: false, dailyReminder: null, haptics: true, soundEnabled: true  },
        onboarding: { completed: false, skippedSteps: [] }, weeklySummaries: []
      })

      await setTheme('dark')

      expect(mockSet).toHaveBeenCalled()
      const savedData = mockSet.mock.calls[0][1]
      expect(savedData.theme).toBe('dark')
    })
  })

  describe('createSampleData', () => {
    it('creates data with goals', () => {
      const sampleData = createSampleData()

      expect(sampleData.goals.length).toBeGreaterThan(0)
    })

    it('creates data with projects linked to goals', () => {
      const sampleData = createSampleData()

      expect(sampleData.projects.length).toBeGreaterThan(0)
      sampleData.projects.forEach(project => {
        expect(sampleData.goals.some(g => g.id === project.goalId)).toBe(true)
      })
    })

    it('creates data with tasks', () => {
      const sampleData = createSampleData()

      expect(sampleData.tasks.length).toBeGreaterThan(0)
    })

    it('creates data with habits', () => {
      const sampleData = createSampleData()

      expect(sampleData.habits.length).toBeGreaterThan(0)
    })

    it('creates data with completed tasks history', () => {
      const sampleData = createSampleData()

      expect(sampleData.completedTasks.length).toBeGreaterThan(0)
    })

    it('creates data with journal entries', () => {
      const sampleData = createSampleData()

      expect(sampleData.journalEntries.length).toBeGreaterThan(0)
    })

    it('marks onboarding as completed', () => {
      const sampleData = createSampleData()

      expect(sampleData.onboarding.completed).toBe(true)
    })
  })
})
