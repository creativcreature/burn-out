import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useTasks } from './useTasks'
import type { Task, BurnOutData } from '../data/types'

// Mock data
const createMockData = (tasks: Task[] = []): BurnOutData => ({
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
  tasks,
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

let mockData: BurnOutData

const mockGetData = vi.fn()
const mockUpdateData = vi.fn()

vi.mock('../utils/storage', () => ({
  getData: () => mockGetData(),
  updateData: (updater: (data: BurnOutData) => BurnOutData) => mockUpdateData(updater)
}))

describe('useTasks', () => {
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
    it('loads tasks from storage on mount', async () => {
      const existingTasks: Task[] = [
        {
          id: 'task-1',
          verbLabel: 'Deep Work',
          taskBody: 'Test task',
          timeEstimate: 30,
          feedLevel: 'medium',
          status: 'pending',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          order: 0
        }
      ]
      mockGetData.mockResolvedValue(createMockData(existingTasks))

      const { result } = renderHook(() => useTasks())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.tasks).toHaveLength(1)
      expect(result.current.tasks[0].taskBody).toBe('Test task')
    })

    it('sets isLoading to false after load', async () => {
      const { result } = renderHook(() => useTasks())

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('handles load errors', async () => {
      mockGetData.mockRejectedValue(new Error('Load failed'))

      const { result } = renderHook(() => useTasks())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe('Load failed')
    })
  })

  describe('addTask', () => {
    it('adds a new task with generated id', async () => {
      const { result } = renderHook(() => useTasks())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let newTask: Task | undefined

      await act(async () => {
        newTask = await result.current.addTask({
          verbLabel: 'Quick Win',
          taskBody: 'New task body',
          timeEstimate: 15,
          feedLevel: 'low'
        })
      })

      expect(newTask).toBeDefined()
      expect(newTask?.id).toBeDefined()
      expect(newTask?.verbLabel).toBe('Quick Win')
      expect(newTask?.taskBody).toBe('New task body')
      expect(newTask?.status).toBe('pending')
      expect(result.current.tasks).toContainEqual(newTask)
    })

    it('persists new task to storage', async () => {
      const { result } = renderHook(() => useTasks())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.addTask({
          verbLabel: 'Focus',
          taskBody: 'Persisted task',
          timeEstimate: 25,
          feedLevel: 'high'
        })
      })

      expect(mockUpdateData).toHaveBeenCalled()
    })

    it('sets correct order for new tasks', async () => {
      const existingTasks: Task[] = [
        {
          id: 'task-1',
          verbLabel: 'Task 1',
          taskBody: 'First',
          timeEstimate: 30,
          feedLevel: 'medium',
          status: 'pending',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          order: 0
        }
      ]
      mockGetData.mockResolvedValue(createMockData(existingTasks))

      const { result } = renderHook(() => useTasks())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let newTask: Task | undefined

      await act(async () => {
        newTask = await result.current.addTask({
          verbLabel: 'Task 2',
          taskBody: 'Second',
          timeEstimate: 15,
          feedLevel: 'low'
        })
      })

      expect(newTask?.order).toBe(1)
    })
  })

  describe('updateTask', () => {
    it('updates task properties', async () => {
      const existingTasks: Task[] = [
        {
          id: 'task-1',
          verbLabel: 'Original',
          taskBody: 'Original body',
          timeEstimate: 30,
          feedLevel: 'medium',
          status: 'pending',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          order: 0
        }
      ]
      mockGetData.mockResolvedValue(createMockData(existingTasks))

      const { result } = renderHook(() => useTasks())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.updateTask('task-1', {
          verbLabel: 'Updated',
          taskBody: 'Updated body'
        })
      })

      const updatedTask = result.current.tasks.find(t => t.id === 'task-1')
      expect(updatedTask?.verbLabel).toBe('Updated')
      expect(updatedTask?.taskBody).toBe('Updated body')
    })

    it('updates updatedAt timestamp', async () => {
      const existingTasks: Task[] = [
        {
          id: 'task-1',
          verbLabel: 'Task',
          taskBody: 'Body',
          timeEstimate: 30,
          feedLevel: 'medium',
          status: 'pending',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          order: 0
        }
      ]
      mockGetData.mockResolvedValue(createMockData(existingTasks))

      const { result } = renderHook(() => useTasks())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.updateTask('task-1', { verbLabel: 'Changed' })
      })

      const updatedTask = result.current.tasks.find(t => t.id === 'task-1')
      expect(updatedTask?.updatedAt).not.toBe('2024-01-01')
    })
  })

  describe('completeTask', () => {
    it('marks task as completed', async () => {
      const existingTasks: Task[] = [
        {
          id: 'task-1',
          verbLabel: 'Task',
          taskBody: 'To complete',
          timeEstimate: 30,
          feedLevel: 'medium',
          status: 'pending',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          order: 0
        }
      ]
      mockGetData.mockResolvedValue(createMockData(existingTasks))

      const { result } = renderHook(() => useTasks())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.completeTask('task-1')
      })

      const completedTask = result.current.tasks.find(t => t.id === 'task-1')
      expect(completedTask?.status).toBe('completed')
    })

    it('moves task to completedTasks list', async () => {
      const existingTasks: Task[] = [
        {
          id: 'task-1',
          verbLabel: 'Task',
          taskBody: 'To complete',
          timeEstimate: 30,
          feedLevel: 'medium',
          status: 'pending',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          order: 0
        }
      ]
      mockGetData.mockResolvedValue(createMockData(existingTasks))

      const { result } = renderHook(() => useTasks())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.completeTask('task-1', 25)
      })

      expect(result.current.completedTasks).toContainEqual(
        expect.objectContaining({ id: 'task-1', status: 'completed' })
      )
    })
  })

  describe('deferTask', () => {
    it('marks task as deferred', async () => {
      const existingTasks: Task[] = [
        {
          id: 'task-1',
          verbLabel: 'Task',
          taskBody: 'To defer',
          timeEstimate: 30,
          feedLevel: 'medium',
          status: 'pending',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          order: 0
        }
      ]
      mockGetData.mockResolvedValue(createMockData(existingTasks))

      const { result } = renderHook(() => useTasks())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.deferTask('task-1')
      })

      const deferredTask = result.current.tasks.find(t => t.id === 'task-1')
      expect(deferredTask?.status).toBe('deferred')
      expect(deferredTask?.deferredUntil).toBeDefined()
    })

    it('sets custom deferral date', async () => {
      const existingTasks: Task[] = [
        {
          id: 'task-1',
          verbLabel: 'Task',
          taskBody: 'To defer',
          timeEstimate: 30,
          feedLevel: 'medium',
          status: 'pending',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          order: 0
        }
      ]
      mockGetData.mockResolvedValue(createMockData(existingTasks))

      const { result } = renderHook(() => useTasks())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.deferTask('task-1', '2024-12-31')
      })

      const deferredTask = result.current.tasks.find(t => t.id === 'task-1')
      expect(deferredTask?.deferredUntil).toBe('2024-12-31')
    })
  })

  describe('deleteTask', () => {
    it('removes task from list', async () => {
      const existingTasks: Task[] = [
        {
          id: 'task-1',
          verbLabel: 'Task',
          taskBody: 'To delete',
          timeEstimate: 30,
          feedLevel: 'medium',
          status: 'pending',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          order: 0
        }
      ]
      mockGetData.mockResolvedValue(createMockData(existingTasks))

      const { result } = renderHook(() => useTasks())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.deleteTask('task-1')
      })

      expect(result.current.tasks).toHaveLength(0)
      expect(result.current.tasks.find(t => t.id === 'task-1')).toBeUndefined()
    })

    it('persists deletion to storage', async () => {
      const existingTasks: Task[] = [
        {
          id: 'task-1',
          verbLabel: 'Task',
          taskBody: 'To delete',
          timeEstimate: 30,
          feedLevel: 'medium',
          status: 'pending',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          order: 0
        }
      ]
      mockGetData.mockResolvedValue(createMockData(existingTasks))

      const { result } = renderHook(() => useTasks())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.deleteTask('task-1')
      })

      expect(mockUpdateData).toHaveBeenCalled()
    })
  })

  describe('filtered lists', () => {
    it('returns pending tasks correctly', async () => {
      const existingTasks: Task[] = [
        { id: 'task-1', verbLabel: 'Pending', taskBody: 'P1', timeEstimate: 30, feedLevel: 'medium', status: 'pending', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 0 },
        { id: 'task-2', verbLabel: 'Completed', taskBody: 'C1', timeEstimate: 30, feedLevel: 'medium', status: 'completed', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 1 },
        { id: 'task-3', verbLabel: 'Deferred', taskBody: 'D1', timeEstimate: 30, feedLevel: 'medium', status: 'deferred', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 2 }
      ]
      mockGetData.mockResolvedValue(createMockData(existingTasks))

      const { result } = renderHook(() => useTasks())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.pendingTasks).toHaveLength(1)
      expect(result.current.pendingTasks[0].id).toBe('task-1')
    })

    it('returns completed tasks correctly', async () => {
      const existingTasks: Task[] = [
        { id: 'task-1', verbLabel: 'Pending', taskBody: 'P1', timeEstimate: 30, feedLevel: 'medium', status: 'pending', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 0 },
        { id: 'task-2', verbLabel: 'Completed', taskBody: 'C1', timeEstimate: 30, feedLevel: 'medium', status: 'completed', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 1 }
      ]
      mockGetData.mockResolvedValue(createMockData(existingTasks))

      const { result } = renderHook(() => useTasks())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.completedTasks).toHaveLength(1)
      expect(result.current.completedTasks[0].id).toBe('task-2')
    })

    it('returns deferred tasks correctly', async () => {
      const existingTasks: Task[] = [
        { id: 'task-1', verbLabel: 'Pending', taskBody: 'P1', timeEstimate: 30, feedLevel: 'medium', status: 'pending', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 0 },
        { id: 'task-2', verbLabel: 'Deferred', taskBody: 'D1', timeEstimate: 30, feedLevel: 'medium', status: 'deferred', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 1 }
      ]
      mockGetData.mockResolvedValue(createMockData(existingTasks))

      const { result } = renderHook(() => useTasks())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.deferredTasks).toHaveLength(1)
      expect(result.current.deferredTasks[0].id).toBe('task-2')
    })
  })

  describe('data persistence', () => {
    it('tasks persist after hook remount', async () => {
      const { result, unmount } = renderHook(() => useTasks())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.addTask({
          verbLabel: 'Persisted',
          taskBody: 'Should persist',
          timeEstimate: 30,
          feedLevel: 'medium'
        })
      })

      unmount()

      // Remount - should load from storage
      const { result: result2 } = renderHook(() => useTasks())

      await waitFor(() => {
        expect(result2.current.isLoading).toBe(false)
      })

      expect(result2.current.tasks.some(t => t.taskBody === 'Should persist')).toBe(true)
    })
  })

  describe('getTasksByProject', () => {
    it('returns all tasks for a specific project', async () => {
      const existingTasks: Task[] = [
        { id: 'task-1', projectId: 'project-1', verbLabel: 'Task 1', taskBody: 'Body 1', timeEstimate: 30, feedLevel: 'medium', status: 'pending', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 0 },
        { id: 'task-2', projectId: 'project-1', verbLabel: 'Task 2', taskBody: 'Body 2', timeEstimate: 30, feedLevel: 'medium', status: 'completed', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 1 },
        { id: 'task-3', projectId: 'project-2', verbLabel: 'Task 3', taskBody: 'Body 3', timeEstimate: 30, feedLevel: 'medium', status: 'pending', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 2 }
      ]
      mockGetData.mockResolvedValue(createMockData(existingTasks))

      const { result } = renderHook(() => useTasks())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const projectTasks = result.current.getTasksByProject('project-1')
      expect(projectTasks).toHaveLength(2)
      expect(projectTasks.every(t => t.projectId === 'project-1')).toBe(true)
    })
  })

  describe('getNextTaskForProject', () => {
    it('returns first pending task by order', async () => {
      const existingTasks: Task[] = [
        { id: 'task-1', projectId: 'project-1', verbLabel: 'Completed', taskBody: 'Body', timeEstimate: 30, feedLevel: 'medium', status: 'completed', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 0 },
        { id: 'task-2', projectId: 'project-1', verbLabel: 'Second', taskBody: 'Body', timeEstimate: 30, feedLevel: 'medium', status: 'pending', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 2 },
        { id: 'task-3', projectId: 'project-1', verbLabel: 'First', taskBody: 'Body', timeEstimate: 30, feedLevel: 'medium', status: 'pending', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 1 }
      ]
      mockGetData.mockResolvedValue(createMockData(existingTasks))

      const { result } = renderHook(() => useTasks())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const nextTask = result.current.getNextTaskForProject('project-1')
      expect(nextTask).toBeDefined()
      expect(nextTask?.id).toBe('task-3') // order 1, lowest pending
    })

    it('returns undefined when no pending tasks', async () => {
      const existingTasks: Task[] = [
        { id: 'task-1', projectId: 'project-1', verbLabel: 'Completed', taskBody: 'Body', timeEstimate: 30, feedLevel: 'medium', status: 'completed', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 0 }
      ]
      mockGetData.mockResolvedValue(createMockData(existingTasks))

      const { result } = renderHook(() => useTasks())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const nextTask = result.current.getNextTaskForProject('project-1')
      expect(nextTask).toBeUndefined()
    })
  })

  describe('filterTasks', () => {
    it('filters by time of day', async () => {
      const existingTasks: Task[] = [
        { id: 'task-1', verbLabel: 'Morning', taskBody: 'Body', timeEstimate: 30, feedLevel: 'medium', status: 'pending', timeOfDay: 'morning', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 0 },
        { id: 'task-2', verbLabel: 'Afternoon', taskBody: 'Body', timeEstimate: 30, feedLevel: 'medium', status: 'pending', timeOfDay: 'afternoon', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 1 },
        { id: 'task-3', verbLabel: 'Anytime', taskBody: 'Body', timeEstimate: 30, feedLevel: 'medium', status: 'pending', timeOfDay: 'anytime', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 2 }
      ]
      mockGetData.mockResolvedValue(createMockData(existingTasks))

      const { result } = renderHook(() => useTasks())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const filtered = result.current.filterTasks(result.current.tasks, { timeOfDay: 'morning' })
      expect(filtered).toHaveLength(2) // morning + anytime
      expect(filtered.map(t => t.id)).toContain('task-1')
      expect(filtered.map(t => t.id)).toContain('task-3')
    })

    it('filters by day - today', async () => {
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      const existingTasks: Task[] = [
        { id: 'task-1', verbLabel: 'Today', taskBody: 'Body', timeEstimate: 30, feedLevel: 'medium', status: 'pending', scheduledFor: today, createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 0 },
        { id: 'task-2', verbLabel: 'Yesterday', taskBody: 'Body', timeEstimate: 30, feedLevel: 'medium', status: 'pending', scheduledFor: yesterday, createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 1 }
      ]
      mockGetData.mockResolvedValue(createMockData(existingTasks))

      const { result } = renderHook(() => useTasks())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const filtered = result.current.filterTasks(result.current.tasks, { day: 'today' })
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('task-1')
    })

    it('filters by day - week', async () => {
      const today = new Date().toISOString().split('T')[0]
      const nextWeek = new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]

      const existingTasks: Task[] = [
        { id: 'task-1', verbLabel: 'This week', taskBody: 'Body', timeEstimate: 30, feedLevel: 'medium', status: 'pending', scheduledFor: today, createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 0 },
        { id: 'task-2', verbLabel: 'Next week', taskBody: 'Body', timeEstimate: 30, feedLevel: 'medium', status: 'pending', scheduledFor: nextWeek, createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 1 }
      ]
      mockGetData.mockResolvedValue(createMockData(existingTasks))

      const { result } = renderHook(() => useTasks())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const filtered = result.current.filterTasks(result.current.tasks, { day: 'week' })
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('task-1')
    })

    it('returns all tasks when no filters applied', async () => {
      const existingTasks: Task[] = [
        { id: 'task-1', verbLabel: 'Task 1', taskBody: 'Body', timeEstimate: 30, feedLevel: 'medium', status: 'pending', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 0 },
        { id: 'task-2', verbLabel: 'Task 2', taskBody: 'Body', timeEstimate: 30, feedLevel: 'medium', status: 'pending', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 1 }
      ]
      mockGetData.mockResolvedValue(createMockData(existingTasks))

      const { result } = renderHook(() => useTasks())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const filtered = result.current.filterTasks(result.current.tasks, {})
      expect(filtered).toHaveLength(2)
    })
  })
})
