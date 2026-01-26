import { useState, useEffect, useCallback } from 'react'
import { getData, updateData } from '../utils/storage'
import { NewTaskSchema, validate } from '../data/validation'
import type { Task, TaskStatus, TimeOfDay } from '../data/types'

// Filter options for task filtering
export interface TaskFilters {
  day?: 'today' | 'tomorrow' | 'week'
  timeOfDay?: TimeOfDay
  month?: number  // 0-11
}

type NewTask = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'status'>

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load tasks from storage
  useEffect(() => {
    async function loadTasks() {
      try {
        const data = await getData()
        setTasks(data.tasks)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load tasks'))
      } finally {
        setIsLoading(false)
      }
    }
    loadTasks()
  }, [])

  // Add a new task
  const addTask = useCallback(async (taskData: NewTask): Promise<Task> => {
    // Validate input
    const validation = validate(NewTaskSchema, taskData)
    if (!validation.success) {
      throw new Error(`Invalid task: ${validation.error}`)
    }

    const now = new Date().toISOString()
    const newTask: Task = {
      ...validation.data,
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      order: tasks.length
    }

    await updateData(data => ({
      ...data,
      tasks: [...data.tasks, newTask]
    }))

    setTasks(prev => [...prev, newTask])
    return newTask
  }, [tasks.length])

  // Update a task
  const updateTask = useCallback(async (id: string, updates: Partial<Task>): Promise<void> => {
    const now = new Date().toISOString()

    await updateData(data => ({
      ...data,
      tasks: data.tasks.map(task =>
        task.id === id
          ? { ...task, ...updates, updatedAt: now }
          : task
      )
    }))

    setTasks(prev => prev.map(task =>
      task.id === id
        ? { ...task, ...updates, updatedAt: now }
        : task
    ))
  }, [])

  // Complete a task
  const completeTask = useCallback(async (id: string, duration?: number): Promise<void> => {
    const now = new Date().toISOString()

    await updateData(data => ({
      ...data,
      tasks: data.tasks.map(task =>
        task.id === id
          ? { ...task, status: 'completed' as TaskStatus, updatedAt: now }
          : task
      ),
      completedTasks: [
        ...data.completedTasks,
        {
          id: crypto.randomUUID(),
          taskId: id,
          completedAt: now,
          duration: duration || 0
        }
      ]
    }))

    setTasks(prev => prev.map(task =>
      task.id === id
        ? { ...task, status: 'completed', updatedAt: now }
        : task
    ))
  }, [])

  // Defer a task (Not Today)
  const deferTask = useCallback(async (id: string, until?: string): Promise<void> => {
    const now = new Date().toISOString()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const deferredUntil = until || tomorrow.toISOString().split('T')[0]

    await updateData(data => ({
      ...data,
      tasks: data.tasks.map(task =>
        task.id === id
          ? { ...task, status: 'deferred' as TaskStatus, deferredUntil, updatedAt: now }
          : task
      )
    }))

    setTasks(prev => prev.map(task =>
      task.id === id
        ? { ...task, status: 'deferred', deferredUntil, updatedAt: now }
        : task
    ))
  }, [])

  // Delete a task
  const deleteTask = useCallback(async (id: string): Promise<void> => {
    await updateData(data => ({
      ...data,
      tasks: data.tasks.filter(task => task.id !== id)
    }))

    setTasks(prev => prev.filter(task => task.id !== id))
  }, [])

  // Reorder tasks
  const reorderTasks = useCallback(async (reorderedTasks: Task[]): Promise<void> => {
    const now = new Date().toISOString()
    const withNewOrder = reorderedTasks.map((task, index) => ({
      ...task,
      order: index,
      updatedAt: now
    }))

    await updateData(data => ({
      ...data,
      tasks: withNewOrder
    }))

    setTasks(withNewOrder)
  }, [])

  // Refresh tasks from storage (useful when tasks are added externally)
  const refreshTasks = useCallback(async (): Promise<void> => {
    const data = await getData()
    setTasks(data.tasks)
  }, [])

  // Get pending tasks for today
  const pendingTasks = tasks.filter(t => t.status === 'pending')
  const completedTasks = tasks.filter(t => t.status === 'completed')
  const deferredTasks = tasks.filter(t => t.status === 'deferred')

  // Get all tasks for a specific project
  const getTasksByProject = useCallback((projectId: string): Task[] => {
    return tasks.filter(t => t.projectId === projectId)
  }, [tasks])

  // Get the next pending task for a project (first by order)
  const getNextTaskForProject = useCallback((projectId: string): Task | undefined => {
    return tasks
      .filter(t => t.projectId === projectId && t.status === 'pending')
      .sort((a, b) => a.order - b.order)[0]
  }, [tasks])

  // Filter tasks by day, time of day, and/or month
  const filterTasks = useCallback((taskList: Task[], filters: TaskFilters): Task[] => {
    let filtered = [...taskList]

    if (filters.day) {
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      const tomorrow = new Date(now.getTime() + 86400000).toISOString().split('T')[0]
      const weekFromNow = new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0]

      filtered = filtered.filter(task => {
        const taskDate = task.scheduledFor || task.createdAt.split('T')[0]
        switch (filters.day) {
        case 'today':
          return taskDate === today
        case 'tomorrow':
          return taskDate === tomorrow
        case 'week':
          return taskDate >= today && taskDate <= weekFromNow
        default:
          return true
        }
      })
    }

    if (filters.timeOfDay) {
      filtered = filtered.filter(task =>
        task.timeOfDay === filters.timeOfDay || task.timeOfDay === 'anytime'
      )
    }

    if (filters.month !== undefined) {
      filtered = filtered.filter(task => {
        const taskDate = task.scheduledFor || task.createdAt.split('T')[0]
        const taskMonth = new Date(taskDate).getMonth()
        return taskMonth === filters.month
      })
    }

    return filtered
  }, [])

  return {
    tasks,
    pendingTasks,
    completedTasks,
    deferredTasks,
    isLoading,
    error,
    addTask,
    updateTask,
    completeTask,
    deferTask,
    deleteTask,
    reorderTasks,
    refreshTasks,
    getTasksByProject,
    getNextTaskForProject,
    filterTasks
  }
}
