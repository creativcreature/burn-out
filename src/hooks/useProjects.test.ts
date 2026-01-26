import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useProjects } from './useProjects'
import type { Project, BurnOutData } from '../data/types'

// Valid UUIDs for testing (must be actual valid UUIDs, not made-up patterns)
const TEST_GOAL_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
const TEST_PARENT_PROJECT_ID = '550e8400-e29b-41d4-a716-446655440000'

// Mock data
const createMockData = (projects: Project[] = [], tasks: BurnOutData['tasks'] = []): BurnOutData => ({
  version: 2,
  theme: 'light',
  user: {
    id: 'test-user',
    createdAt: '2024-01-01',
    burnoutMode: 'balanced',
    energyDefaults: { morning: 3, afternoon: 3, evening: 2 },
    tonePreference: 'gentle',
    timeAvailability: { weekday: [], weekend: [] }
  },
  goals: [
    { id: TEST_GOAL_ID, title: 'Test Goal', timeframe: '1y', isActive: false, rank: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01', archived: false, order: 0 }
  ],
  projects,
  tasks,
  taskCategories: [],
  habits: [],
  completedTasks: [],
  journalEntries: [],
  chatHistory: [],
  settings: {
    notifications: false,
    dailyReminder: null,
    haptics: true,
    soundEnabled: true
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

describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockData = createMockData()
    mockGetData.mockImplementation(() => Promise.resolve(mockData))
    mockUpdateData.mockImplementation(async (updater) => {
      mockData = updater(mockData)
      return mockData
    })
  })

  describe('getSubProjects', () => {
    it('returns child projects of a parent', async () => {
      const existingProjects: Project[] = [
        { id: 'parent-1', goalId: 'goal-1', title: 'Parent Project', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 0 },
        { id: 'child-1', goalId: 'goal-1', parentProjectId: 'parent-1', title: 'Child 1', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 1 },
        { id: 'child-2', goalId: 'goal-1', parentProjectId: 'parent-1', title: 'Child 2', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 2 },
        { id: 'other', goalId: 'goal-1', title: 'Other Project', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 3 }
      ]
      mockGetData.mockResolvedValue(createMockData(existingProjects))

      const { result } = renderHook(() => useProjects())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const subProjects = result.current.getSubProjects('parent-1')
      expect(subProjects).toHaveLength(2)
      expect(subProjects.map(p => p.id)).toContain('child-1')
      expect(subProjects.map(p => p.id)).toContain('child-2')
    })

    it('returns empty array for project with no children', async () => {
      const existingProjects: Project[] = [
        { id: 'parent-1', goalId: 'goal-1', title: 'Parent Project', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 0 }
      ]
      mockGetData.mockResolvedValue(createMockData(existingProjects))

      const { result } = renderHook(() => useProjects())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const subProjects = result.current.getSubProjects('parent-1')
      expect(subProjects).toHaveLength(0)
    })
  })

  describe('getProjectPath', () => {
    it('returns ancestor chain from root to project', async () => {
      const existingProjects: Project[] = [
        { id: 'root', goalId: 'goal-1', title: 'Root', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 0 },
        { id: 'middle', goalId: 'goal-1', parentProjectId: 'root', title: 'Middle', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 1 },
        { id: 'leaf', goalId: 'goal-1', parentProjectId: 'middle', title: 'Leaf', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 2 }
      ]
      mockGetData.mockResolvedValue(createMockData(existingProjects))

      const { result } = renderHook(() => useProjects())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const path = result.current.getProjectPath('leaf')
      expect(path).toHaveLength(3)
      expect(path[0].id).toBe('root')
      expect(path[1].id).toBe('middle')
      expect(path[2].id).toBe('leaf')
    })

    it('returns single project for root project', async () => {
      const existingProjects: Project[] = [
        { id: 'root', goalId: 'goal-1', title: 'Root', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 0 }
      ]
      mockGetData.mockResolvedValue(createMockData(existingProjects))

      const { result } = renderHook(() => useProjects())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const path = result.current.getProjectPath('root')
      expect(path).toHaveLength(1)
      expect(path[0].id).toBe('root')
    })
  })

  describe('getRootProjectsByGoal', () => {
    it('returns only root-level projects for a goal', async () => {
      const existingProjects: Project[] = [
        { id: 'root-1', goalId: 'goal-1', title: 'Root 1', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 0 },
        { id: 'child-1', goalId: 'goal-1', parentProjectId: 'root-1', title: 'Child', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 1 },
        { id: 'root-2', goalId: 'goal-1', title: 'Root 2', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 2 }
      ]
      mockGetData.mockResolvedValue(createMockData(existingProjects))

      const { result } = renderHook(() => useProjects())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const rootProjects = result.current.getRootProjectsByGoal('goal-1')
      expect(rootProjects).toHaveLength(2)
      expect(rootProjects.map(p => p.id)).toContain('root-1')
      expect(rootProjects.map(p => p.id)).toContain('root-2')
      expect(rootProjects.map(p => p.id)).not.toContain('child-1')
    })
  })

  describe('hasSubProjects', () => {
    it('returns true if project has children', async () => {
      const existingProjects: Project[] = [
        { id: 'parent', goalId: 'goal-1', title: 'Parent', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 0 },
        { id: 'child', goalId: 'goal-1', parentProjectId: 'parent', title: 'Child', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 1 }
      ]
      mockGetData.mockResolvedValue(createMockData(existingProjects))

      const { result } = renderHook(() => useProjects())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hasSubProjects('parent')).toBe(true)
    })

    it('returns false if project has no children', async () => {
      const existingProjects: Project[] = [
        { id: 'lonely', goalId: 'goal-1', title: 'Lonely Project', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 0 }
      ]
      mockGetData.mockResolvedValue(createMockData(existingProjects))

      const { result } = renderHook(() => useProjects())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.hasSubProjects('lonely')).toBe(false)
    })
  })

  describe('addProject with parentProjectId', () => {
    it('creates project with parentProjectId', async () => {
      const existingProjects: Project[] = [
        { id: TEST_PARENT_PROJECT_ID, goalId: TEST_GOAL_ID, title: 'Parent', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 0 }
      ]
      mockGetData.mockResolvedValue(createMockData(existingProjects))

      const { result } = renderHook(() => useProjects())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let newProject: Project | undefined

      await act(async () => {
        newProject = await result.current.addProject({
          goalId: TEST_GOAL_ID,
          title: 'Child Project',
          parentProjectId: TEST_PARENT_PROJECT_ID
        })
      })

      expect(newProject).toBeDefined()
      expect(newProject?.parentProjectId).toBe(TEST_PARENT_PROJECT_ID)
      expect(result.current.getSubProjects(TEST_PARENT_PROJECT_ID)).toHaveLength(1)
    })
  })

  describe('cascade delete with nested projects', () => {
    it('deletes parent and all descendants', async () => {
      const existingProjects: Project[] = [
        { id: 'parent', goalId: 'goal-1', title: 'Parent', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 0 },
        { id: 'child-1', goalId: 'goal-1', parentProjectId: 'parent', title: 'Child 1', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 1 },
        { id: 'grandchild', goalId: 'goal-1', parentProjectId: 'child-1', title: 'Grandchild', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 2 },
        { id: 'unrelated', goalId: 'goal-1', title: 'Unrelated', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 3 }
      ]
      mockData = createMockData(existingProjects)
      mockGetData.mockResolvedValue(mockData)

      const { result } = renderHook(() => useProjects())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.deleteProject('parent')
      })

      expect(result.current.projects).toHaveLength(1)
      expect(result.current.projects[0].id).toBe('unrelated')
    })

    it('deletes associated tasks when deleting project tree', async () => {
      const existingProjects: Project[] = [
        { id: 'parent', goalId: 'goal-1', title: 'Parent', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 0 },
        { id: 'child', goalId: 'goal-1', parentProjectId: 'parent', title: 'Child', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 1 }
      ]
      const existingTasks: BurnOutData['tasks'] = [
        { id: 'task-1', projectId: 'parent', verbLabel: 'Task 1', taskBody: 'Body', timeEstimate: 30, feedLevel: 'medium', status: 'pending', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 0 },
        { id: 'task-2', projectId: 'child', verbLabel: 'Task 2', taskBody: 'Body', timeEstimate: 30, feedLevel: 'medium', status: 'pending', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 1 },
        { id: 'task-3', verbLabel: 'Unrelated Task', taskBody: 'Body', timeEstimate: 30, feedLevel: 'medium', status: 'pending', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 2 }
      ]
      mockData = createMockData(existingProjects, existingTasks)
      mockGetData.mockResolvedValue(mockData)

      const { result } = renderHook(() => useProjects())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.deleteProject('parent')
      })

      // Check that tasks for deleted projects were removed
      expect(mockData.tasks).toHaveLength(1)
      expect(mockData.tasks[0].id).toBe('task-3')
    })
  })

  describe('getProject', () => {
    it('returns project by id', async () => {
      const existingProjects: Project[] = [
        { id: 'project-1', goalId: 'goal-1', title: 'Project 1', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 0 }
      ]
      mockGetData.mockResolvedValue(createMockData(existingProjects))

      const { result } = renderHook(() => useProjects())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const project = result.current.getProject('project-1')
      expect(project).toBeDefined()
      expect(project?.title).toBe('Project 1')
    })

    it('returns undefined for non-existent id', async () => {
      mockGetData.mockResolvedValue(createMockData())

      const { result } = renderHook(() => useProjects())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const project = result.current.getProject('non-existent')
      expect(project).toBeUndefined()
    })
  })
})
