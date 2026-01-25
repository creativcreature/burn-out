import { useState, useEffect, useCallback } from 'react'
import { getData, updateData } from '../utils/storage'
import type { Task, TaskStatus } from '../data/types'

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
    const now = new Date().toISOString()
    const newTask: Task = {
      ...taskData,
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

  // Get pending tasks for today
  const pendingTasks = tasks.filter(t => t.status === 'pending')
  const completedTasks = tasks.filter(t => t.status === 'completed')
  const deferredTasks = tasks.filter(t => t.status === 'deferred')

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
    reorderTasks
  }
}
