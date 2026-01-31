import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Task API - Stateless CRUD operations
 * 
 * Since we're using localStorage for MVP persistence, this API:
 * - Validates task data structure
 * - Returns validated data for frontend to persist
 * - Provides filtering utilities for GET requests
 * 
 * Methods:
 * - GET: Filter tasks (pass tasks in body, get filtered results)
 * - POST: Validate and return task (frontend adds ID and persists)
 * - PUT: Validate and return updated task
 * - DELETE: Confirm deletion (frontend removes from localStorage)
 */

type FeedLevel = 'low' | 'medium' | 'high'
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'deferred'
type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime'

interface Task {
  id: string
  projectId?: string
  goalId?: string
  categoryId?: string
  verbLabel: string
  taskBody: string
  timeEstimate: number
  feedLevel: FeedLevel
  scheduledFor?: string
  timeOfDay?: TimeOfDay
  status: TaskStatus
  deferredUntil?: string
  createdAt: string
  updatedAt: string
  order: number
}

interface TaskInput {
  projectId?: string
  goalId?: string
  categoryId?: string
  verbLabel: string
  taskBody: string
  timeEstimate: number
  feedLevel: FeedLevel
  scheduledFor?: string
  timeOfDay?: TimeOfDay
  status?: TaskStatus
  order?: number
}

interface FilterParams {
  status?: TaskStatus | TaskStatus[]
  projectId?: string
  goalId?: string
  categoryId?: string
}

function setCorsHeaders(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function validateTaskInput(input: unknown): { valid: true; task: TaskInput } | { valid: false; error: string } {
  if (!input || typeof input !== 'object') {
    return { valid: false, error: 'Task data is required' }
  }

  const task = input as Record<string, unknown>

  // Required fields
  if (typeof task.verbLabel !== 'string' || task.verbLabel.length === 0) {
    return { valid: false, error: 'verbLabel is required and must be a non-empty string' }
  }
  if (task.verbLabel.length > 12) {
    return { valid: false, error: 'verbLabel must be 12 characters or less' }
  }
  if (typeof task.taskBody !== 'string' || task.taskBody.length === 0) {
    return { valid: false, error: 'taskBody is required and must be a non-empty string' }
  }
  if (typeof task.timeEstimate !== 'number' || task.timeEstimate < 0) {
    return { valid: false, error: 'timeEstimate must be a non-negative number' }
  }
  if (!['low', 'medium', 'high'].includes(task.feedLevel as string)) {
    return { valid: false, error: 'feedLevel must be one of: low, medium, high' }
  }

  // Optional field validation
  if (task.status !== undefined && !['pending', 'in_progress', 'completed', 'deferred'].includes(task.status as string)) {
    return { valid: false, error: 'status must be one of: pending, in_progress, completed, deferred' }
  }
  if (task.timeOfDay !== undefined && !['morning', 'afternoon', 'evening', 'anytime'].includes(task.timeOfDay as string)) {
    return { valid: false, error: 'timeOfDay must be one of: morning, afternoon, evening, anytime' }
  }

  return {
    valid: true,
    task: {
      projectId: task.projectId as string | undefined,
      goalId: task.goalId as string | undefined,
      categoryId: task.categoryId as string | undefined,
      verbLabel: task.verbLabel as string,
      taskBody: task.taskBody as string,
      timeEstimate: task.timeEstimate as number,
      feedLevel: task.feedLevel as FeedLevel,
      scheduledFor: task.scheduledFor as string | undefined,
      timeOfDay: task.timeOfDay as TimeOfDay | undefined,
      status: (task.status as TaskStatus) || 'pending',
      order: typeof task.order === 'number' ? task.order : 0
    }
  }
}

function filterTasks(tasks: Task[], filters: FilterParams): Task[] {
  return tasks.filter(task => {
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status]
      if (!statuses.includes(task.status)) return false
    }
    if (filters.projectId && task.projectId !== filters.projectId) return false
    if (filters.goalId && task.goalId !== filters.goalId) return false
    if (filters.categoryId && task.categoryId !== filters.categoryId) return false
    return true
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    switch (req.method) {
      case 'GET': {
        // Filter tasks passed in body
        // Query params: status, projectId, goalId, categoryId
        const { tasks } = req.body as { tasks?: Task[] } || {}
        
        if (!tasks || !Array.isArray(tasks)) {
          return res.status(200).json({ tasks: [], message: 'No tasks provided to filter' })
        }

        const filters: FilterParams = {
          status: req.query.status as TaskStatus | TaskStatus[] | undefined,
          projectId: req.query.projectId as string | undefined,
          goalId: req.query.goalId as string | undefined,
          categoryId: req.query.categoryId as string | undefined
        }

        const filtered = filterTasks(tasks, filters)
        return res.status(200).json({ tasks: filtered, count: filtered.length })
      }

      case 'POST': {
        // Validate task input and return structured task
        const validation = validateTaskInput(req.body)
        
        if (validation.valid === false) {
          return res.status(400).json({ error: validation.error })
        }

        const now = new Date().toISOString()
        const taskData = {
          ...validation.task,
          // Frontend should generate ID, but we provide timestamps
          createdAt: now,
          updatedAt: now
        }

        return res.status(201).json({ 
          task: taskData,
          message: 'Task validated. Frontend should generate ID and persist.' 
        })
      }

      case 'PUT': {
        // Validate and return updated task
        const { id, ...updates } = req.body as { id?: string } & Partial<TaskInput>
        
        if (!id) {
          return res.status(400).json({ error: 'Task id is required in body' })
        }

        // Validate only provided fields
        const fieldsToValidate = { ...updates }
        
        // If partial update, we need to check each field individually
        if (fieldsToValidate.verbLabel !== undefined) {
          if (typeof fieldsToValidate.verbLabel !== 'string' || fieldsToValidate.verbLabel.length === 0) {
            return res.status(400).json({ error: 'verbLabel must be a non-empty string' })
          }
          if (fieldsToValidate.verbLabel.length > 12) {
            return res.status(400).json({ error: 'verbLabel must be 12 characters or less' })
          }
        }
        if (fieldsToValidate.taskBody !== undefined && (typeof fieldsToValidate.taskBody !== 'string' || fieldsToValidate.taskBody.length === 0)) {
          return res.status(400).json({ error: 'taskBody must be a non-empty string' })
        }
        if (fieldsToValidate.timeEstimate !== undefined && (typeof fieldsToValidate.timeEstimate !== 'number' || fieldsToValidate.timeEstimate < 0)) {
          return res.status(400).json({ error: 'timeEstimate must be a non-negative number' })
        }
        if (fieldsToValidate.feedLevel !== undefined && !['low', 'medium', 'high'].includes(fieldsToValidate.feedLevel)) {
          return res.status(400).json({ error: 'feedLevel must be one of: low, medium, high' })
        }
        if (fieldsToValidate.status !== undefined && !['pending', 'in_progress', 'completed', 'deferred'].includes(fieldsToValidate.status)) {
          return res.status(400).json({ error: 'status must be one of: pending, in_progress, completed, deferred' })
        }

        return res.status(200).json({
          id,
          updates: {
            ...updates,
            updatedAt: new Date().toISOString()
          },
          message: 'Updates validated. Frontend should apply and persist.'
        })
      }

      case 'DELETE': {
        const id = req.query.id as string
        
        if (!id) {
          return res.status(400).json({ error: 'Task id is required as query parameter' })
        }

        return res.status(200).json({
          id,
          deleted: true,
          message: 'Deletion confirmed. Frontend should remove from localStorage.'
        })
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Tasks API Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
}
