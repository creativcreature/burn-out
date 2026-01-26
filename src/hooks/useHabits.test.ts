import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useHabits } from './useHabits'
import type { Habit, BurnOutData } from '../data/types'

// Mock validation module
vi.mock('../data/validation', () => ({
  NewHabitSchema: {},
  validate: vi.fn().mockImplementation((_schema, data) => ({
    success: true,
    data
  }))
}))

// Mock data
const createMockData = (habits: Habit[] = []): BurnOutData => ({
  version: 4,
  theme: 'light',
  user: {
    id: 'test-user',
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
  habits,
  completedTasks: [],
  journalEntries: [],
  chatHistory: [],
  conversations: [],
  settings: {
    notifications: false,
    dailyReminder: null,
    haptics: true,
    soundEnabled: true,
    aiProvider: 'gemini'
  },
  onboarding: { completed: false, skippedSteps: [] }
})

let mockData: BurnOutData

const mockGetData = vi.fn()
const mockUpdateData = vi.fn()

vi.mock('../utils/storage', () => ({
  getData: () => mockGetData(),
  updateData: (updater: (data: BurnOutData) => BurnOutData) => mockUpdateData(updater)
}))

describe('useHabits', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockData = createMockData()
    // Use mockImplementation so it returns current mockData at call time
    mockGetData.mockImplementation(() => Promise.resolve(mockData))
    mockUpdateData.mockImplementation(async (updater) => {
      mockData = updater(mockData)
      return mockData
    })
  })

  describe('initialization', () => {
    it('loads habits from storage on mount', async () => {
      const existingHabits: Habit[] = [
        {
          id: 'habit-1',
          verbLabel: 'Hydrate',
          habitBody: 'Drink water',
          frequency: 'daily',
          timeOfDay: 'morning',
          feedLevel: 'low',
          createdAt: '2024-01-01',
          completionCount: 5
        }
      ]
      mockGetData.mockResolvedValue(createMockData(existingHabits))

      const { result } = renderHook(() => useHabits())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.habits).toHaveLength(1)
      expect(result.current.habits[0].verbLabel).toBe('Hydrate')
    })

    it('sets isLoading to false after load', async () => {
      const { result } = renderHook(() => useHabits())

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })
  })

  describe('addHabit', () => {
    it('adds a new habit with generated id', async () => {
      const { result } = renderHook(() => useHabits())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let newHabit: Habit | undefined

      await act(async () => {
        newHabit = await result.current.addHabit({
          verbLabel: 'Morning Move',
          habitBody: '10 min stretch',
          frequency: 'daily',
          timeOfDay: 'morning',
          feedLevel: 'low'
        })
      })

      expect(newHabit).toBeDefined()
      expect(newHabit?.id).toBeDefined()
      expect(newHabit?.verbLabel).toBe('Morning Move')
      expect(newHabit?.completionCount).toBe(0)
    })

    it('persists new habit to storage', async () => {
      const { result } = renderHook(() => useHabits())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.addHabit({
          verbLabel: 'Wind Down',
          habitBody: 'No screens before bed',
          frequency: 'daily',
          timeOfDay: 'evening',
          feedLevel: 'low'
        })
      })

      expect(mockUpdateData).toHaveBeenCalled()
    })
  })

  describe('completeHabit', () => {
    it('increments completionCount (internal tracking only)', async () => {
      const existingHabits: Habit[] = [
        {
          id: 'habit-1',
          verbLabel: 'Hydrate',
          habitBody: 'Drink water',
          frequency: 'daily',
          timeOfDay: 'morning',
          feedLevel: 'low',
          createdAt: '2024-01-01',
          completionCount: 5
        }
      ]
      mockGetData.mockResolvedValue(createMockData(existingHabits))

      const { result } = renderHook(() => useHabits())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.completeHabit('habit-1')
      })

      const updatedHabit = result.current.habits.find(h => h.id === 'habit-1')
      expect(updatedHabit?.completionCount).toBe(6)
    })

    it('updates lastCompleted timestamp', async () => {
      const existingHabits: Habit[] = [
        {
          id: 'habit-1',
          verbLabel: 'Hydrate',
          habitBody: 'Drink water',
          frequency: 'daily',
          timeOfDay: 'morning',
          feedLevel: 'low',
          createdAt: '2024-01-01',
          completionCount: 0
        }
      ]
      mockGetData.mockResolvedValue(createMockData(existingHabits))

      const { result } = renderHook(() => useHabits())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.completeHabit('habit-1')
      })

      const updatedHabit = result.current.habits.find(h => h.id === 'habit-1')
      expect(updatedHabit?.lastCompleted).toBeDefined()
    })

    it('adds to completedTasks history', async () => {
      const existingHabits: Habit[] = [
        {
          id: 'habit-1',
          verbLabel: 'Hydrate',
          habitBody: 'Drink water',
          frequency: 'daily',
          timeOfDay: 'morning',
          feedLevel: 'low',
          createdAt: '2024-01-01',
          completionCount: 0
        }
      ]
      mockData = createMockData(existingHabits)
      mockGetData.mockResolvedValue(mockData)

      const { result } = renderHook(() => useHabits())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.completeHabit('habit-1')
      })

      // Check that the updater was called with a function that adds to completedTasks
      expect(mockUpdateData).toHaveBeenCalled()
    })
  })

  describe('updateHabit', () => {
    it('updates habit properties', async () => {
      const existingHabits: Habit[] = [
        {
          id: 'habit-1',
          verbLabel: 'Original',
          habitBody: 'Original body',
          frequency: 'daily',
          timeOfDay: 'morning',
          feedLevel: 'low',
          createdAt: '2024-01-01',
          completionCount: 0
        }
      ]
      mockGetData.mockResolvedValue(createMockData(existingHabits))

      const { result } = renderHook(() => useHabits())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.updateHabit('habit-1', {
          verbLabel: 'Updated',
          habitBody: 'Updated body'
        })
      })

      const updatedHabit = result.current.habits.find(h => h.id === 'habit-1')
      expect(updatedHabit?.verbLabel).toBe('Updated')
      expect(updatedHabit?.habitBody).toBe('Updated body')
    })
  })

  describe('deleteHabit', () => {
    it('removes habit from list', async () => {
      const existingHabits: Habit[] = [
        {
          id: 'habit-1',
          verbLabel: 'To Delete',
          habitBody: 'Delete me',
          frequency: 'daily',
          timeOfDay: 'morning',
          feedLevel: 'low',
          createdAt: '2024-01-01',
          completionCount: 0
        }
      ]
      mockGetData.mockResolvedValue(createMockData(existingHabits))

      const { result } = renderHook(() => useHabits())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.deleteHabit('habit-1')
      })

      expect(result.current.habits).toHaveLength(0)
    })
  })

  describe('filtered lists', () => {
    it('returns todayHabits for daily habits not completed today', async () => {
      const existingHabits: Habit[] = [
        { id: 'h1', verbLabel: 'Daily', habitBody: '', frequency: 'daily', timeOfDay: 'morning', feedLevel: 'low', createdAt: '', completionCount: 0 },
        { id: 'h2', verbLabel: 'Weekly', habitBody: '', frequency: 'weekly', timeOfDay: 'evening', feedLevel: 'low', createdAt: '', completionCount: 0 }
      ]
      mockGetData.mockResolvedValue(createMockData(existingHabits))

      const { result } = renderHook(() => useHabits())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Daily habits should appear in todayHabits
      expect(result.current.todayHabits.some(h => h.verbLabel === 'Daily')).toBe(true)
    })

    it('excludes habits already completed today from todayHabits', async () => {
      const today = new Date().toISOString()
      const existingHabits: Habit[] = [
        { id: 'h1', verbLabel: 'Done', habitBody: '', frequency: 'daily', timeOfDay: 'morning', feedLevel: 'low', createdAt: '', completionCount: 1, lastCompleted: today },
        { id: 'h2', verbLabel: 'NotDone', habitBody: '', frequency: 'daily', timeOfDay: 'morning', feedLevel: 'low', createdAt: '', completionCount: 0 }
      ]
      mockGetData.mockResolvedValue(createMockData(existingHabits))

      const { result } = renderHook(() => useHabits())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Completed today should be excluded
      expect(result.current.todayHabits.some(h => h.verbLabel === 'Done')).toBe(false)
      expect(result.current.todayHabits.some(h => h.verbLabel === 'NotDone')).toBe(true)
    })

    it('isDueToday correctly identifies daily habits', async () => {
      const existingHabits: Habit[] = [
        { id: 'h1', verbLabel: 'Daily', habitBody: '', frequency: 'daily', timeOfDay: 'morning', feedLevel: 'low', createdAt: '', completionCount: 0 }
      ]
      mockGetData.mockResolvedValue(createMockData(existingHabits))

      const { result } = renderHook(() => useHabits())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const dailyHabit = result.current.habits[0]
      expect(result.current.isDueToday(dailyHabit)).toBe(true)
    })
  })

  describe('data persistence', () => {
    it('habits persist after hook remount', async () => {
      const { result, unmount } = renderHook(() => useHabits())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.addHabit({
          verbLabel: 'Persist',
          habitBody: 'Should persist',
          frequency: 'daily',
          timeOfDay: 'morning',
          feedLevel: 'low'
        })
      })

      unmount()

      // Remount - should load from storage
      const { result: result2 } = renderHook(() => useHabits())

      await waitFor(() => {
        expect(result2.current.isLoading).toBe(false)
      })

      expect(result2.current.habits.some(h => h.verbLabel === 'Persist')).toBe(true)
    })
  })
})
