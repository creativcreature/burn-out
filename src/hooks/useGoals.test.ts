import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useGoals } from './useGoals'
import type { Goal, BurnOutData } from '../data/types'

// Mock data
const createMockData = (goals: Goal[] = []): BurnOutData => ({
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
  goals,
  projects: [],
  tasks: [],
  taskCategories: [],
  habits: [],
  completedTasks: [],
  journalEntries: [],
  chatHistory: [],
  conversations: [],
  settings: {
    notifications: false,
    dailyReminder: null,
    haptics: true,
    soundEnabled: true
  },
  onboarding: { completed: false, skippedSteps: [] },
  weeklySummaries: []
})

const createMockGoal = (overrides: Partial<Goal> = {}): Goal => ({
  id: 'goal-1',
  title: 'Test Goal',
  description: 'Test description',
  timeframe: '1y',
  isActive: false,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  archived: false,
  order: 0,
  ...overrides
})

let mockData: BurnOutData

const mockGetData = vi.fn()
const mockUpdateData = vi.fn()

vi.mock('../utils/storage', () => ({
  getData: () => mockGetData(),
  updateData: (updater: (data: BurnOutData) => BurnOutData) => mockUpdateData(updater)
}))

describe('useGoals', () => {
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
    it('loads goals from storage on mount', async () => {
      const existingGoals: Goal[] = [
        createMockGoal({ title: 'Test Goal', description: 'Test description' })
      ]
      mockGetData.mockResolvedValue(createMockData(existingGoals))

      const { result } = renderHook(() => useGoals())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.goals).toHaveLength(1)
      expect(result.current.goals[0].title).toBe('Test Goal')
    })

    it('sets isLoading to false after load', async () => {
      const { result } = renderHook(() => useGoals())

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })
  })

  describe('addGoal', () => {
    it('adds a new goal with generated id', async () => {
      const { result } = renderHook(() => useGoals())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let newGoal: Goal | undefined

      await act(async () => {
        newGoal = await result.current.addGoal({
          title: 'New Goal',
          description: 'New goal description',
          timeframe: '1y',
          isActive: false
        })
      })

      expect(newGoal).toBeDefined()
      expect(newGoal?.id).toBeDefined()
      expect(newGoal?.title).toBe('New Goal')
      expect(newGoal?.archived).toBe(false)
      expect(result.current.goals).toContainEqual(newGoal)
    })

    it('persists new goal to storage', async () => {
      const { result } = renderHook(() => useGoals())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.addGoal({
          title: 'Persisted Goal',
          timeframe: '1y',
          isActive: false
        })
      })

      expect(mockUpdateData).toHaveBeenCalled()
    })

    it('sets correct order for new goals', async () => {
      const existingGoals: Goal[] = [
        createMockGoal({ title: 'First Goal' })
      ]
      mockGetData.mockResolvedValue(createMockData(existingGoals))

      const { result } = renderHook(() => useGoals())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let newGoal: Goal | undefined

      await act(async () => {
        newGoal = await result.current.addGoal({
          title: 'Second Goal',
          timeframe: '1y',
          isActive: false
        })
      })

      expect(newGoal?.order).toBe(1)
    })
  })

  describe('updateGoal', () => {
    it('updates goal properties', async () => {
      const existingGoals: Goal[] = [
        createMockGoal({ title: 'Original Title', description: 'Original description' })
      ]
      mockGetData.mockResolvedValue(createMockData(existingGoals))

      const { result } = renderHook(() => useGoals())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.updateGoal('goal-1', {
          title: 'Updated Title',
          description: 'Updated description'
        })
      })

      const updatedGoal = result.current.goals.find(g => g.id === 'goal-1')
      expect(updatedGoal?.title).toBe('Updated Title')
      expect(updatedGoal?.description).toBe('Updated description')
    })

    it('updates updatedAt timestamp', async () => {
      const existingGoals: Goal[] = [
        createMockGoal({ title: 'Goal' })
      ]
      mockGetData.mockResolvedValue(createMockData(existingGoals))

      const { result } = renderHook(() => useGoals())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.updateGoal('goal-1', { title: 'Changed' })
      })

      const updatedGoal = result.current.goals.find(g => g.id === 'goal-1')
      expect(updatedGoal?.updatedAt).not.toBe('2024-01-01')
    })
  })

  describe('deleteGoal', () => {
    it('removes goal from list', async () => {
      const existingGoals: Goal[] = [
        createMockGoal({ title: 'To Delete' })
      ]
      mockGetData.mockResolvedValue(createMockData(existingGoals))

      const { result } = renderHook(() => useGoals())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.deleteGoal('goal-1')
      })

      expect(result.current.goals).toHaveLength(0)
    })

    it('cascades deletion to associated projects and tasks', async () => {
      // This tests the storage updater function
      const existingGoals: Goal[] = [
        createMockGoal({ title: 'To Delete' })
      ]
      mockData = createMockData(existingGoals)
      mockData.projects = [{ id: 'proj-1', goalId: 'goal-1', title: 'Project', status: 'active', createdAt: '', updatedAt: '', order: 0 }]
      mockData.tasks = [{ id: 'task-1', goalId: 'goal-1', verbLabel: 'Task', taskBody: 'Body', timeEstimate: 30, feedLevel: 'medium', status: 'pending', createdAt: '', updatedAt: '', order: 0 }]
      mockGetData.mockResolvedValue(mockData)

      const { result } = renderHook(() => useGoals())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.deleteGoal('goal-1')
      })

      expect(mockUpdateData).toHaveBeenCalled()
      // The updater should filter out related projects and tasks
      expect(mockData.projects).toHaveLength(0)
      expect(mockData.tasks).toHaveLength(0)
    })

    it('cascades deletion to tasks with only projectId (no goalId)', async () => {
      // Edge case: task has projectId but no goalId - should still be deleted
      const existingGoals: Goal[] = [
        createMockGoal({ title: 'To Delete' })
      ]
      mockData = createMockData(existingGoals)
      mockData.projects = [{ id: 'proj-1', goalId: 'goal-1', title: 'Project', status: 'active', createdAt: '', updatedAt: '', order: 0 }]
      // Task has projectId but NO goalId - this was the bug case
      mockData.tasks = [
        { id: 'task-1', projectId: 'proj-1', verbLabel: 'Task', taskBody: 'Body', timeEstimate: 30, feedLevel: 'medium', status: 'pending', createdAt: '', updatedAt: '', order: 0 },
        { id: 'task-2', verbLabel: 'Unrelated', taskBody: 'Body', timeEstimate: 30, feedLevel: 'medium', status: 'pending', createdAt: '', updatedAt: '', order: 1 }
      ]
      mockGetData.mockResolvedValue(mockData)

      const { result } = renderHook(() => useGoals())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.deleteGoal('goal-1')
      })

      expect(mockUpdateData).toHaveBeenCalled()
      expect(mockData.projects).toHaveLength(0)
      // Task with projectId under deleted goal should also be deleted
      expect(mockData.tasks).toHaveLength(1)
      expect(mockData.tasks[0].id).toBe('task-2') // Only unrelated task remains
    })
  })

  describe('archiveGoal', () => {
    it('sets archived to true', async () => {
      const existingGoals: Goal[] = [
        createMockGoal({ title: 'To Archive' })
      ]
      mockGetData.mockResolvedValue(createMockData(existingGoals))

      const { result } = renderHook(() => useGoals())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.archiveGoal('goal-1')
      })

      const archivedGoal = result.current.goals.find(g => g.id === 'goal-1')
      expect(archivedGoal?.archived).toBe(true)
    })
  })

  describe('filtered lists', () => {
    it('returns activeGoals correctly', async () => {
      const existingGoals: Goal[] = [
        createMockGoal({ id: 'goal-1', title: 'Active', archived: false, order: 0 }),
        createMockGoal({ id: 'goal-2', title: 'Archived', archived: true, order: 1 })
      ]
      mockGetData.mockResolvedValue(createMockData(existingGoals))

      const { result } = renderHook(() => useGoals())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.activeGoals).toHaveLength(1)
      expect(result.current.activeGoals[0].title).toBe('Active')
    })

    it('returns archivedGoals correctly', async () => {
      const existingGoals: Goal[] = [
        createMockGoal({ id: 'goal-1', title: 'Active', archived: false, order: 0 }),
        createMockGoal({ id: 'goal-2', title: 'Archived', archived: true, order: 1 })
      ]
      mockGetData.mockResolvedValue(createMockData(existingGoals))

      const { result } = renderHook(() => useGoals())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.archivedGoals).toHaveLength(1)
      expect(result.current.archivedGoals[0].title).toBe('Archived')
    })
  })

  describe('data persistence', () => {
    it('goals persist after hook remount', async () => {
      const { result, unmount } = renderHook(() => useGoals())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.addGoal({
          title: 'Persisted Goal',
          timeframe: '1y',
          isActive: false
        })
      })

      unmount()

      // Remount - should load from storage
      const { result: result2 } = renderHook(() => useGoals())

      await waitFor(() => {
        expect(result2.current.isLoading).toBe(false)
      })

      expect(result2.current.goals.some(g => g.title === 'Persisted Goal')).toBe(true)
    })
  })
})
