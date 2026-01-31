/**
 * Task Schema Definitions
 * 
 * Shared type definitions and schemas for tasks throughout the app.
 * Used by both frontend (validation) and API (extraction/CRUD).
 */

import { z } from 'zod'

// ============================================
// Energy/Feed Level Schema
// ============================================

/**
 * Energy level for tasks - maps to cognitive/physical effort required
 * - low: Quick wins, minimal mental effort (5-15 min tasks)
 * - medium: Moderate focus needed (15-45 min tasks)
 * - high: Deep work, significant mental effort (45+ min tasks)
 */
export const FeedLevelSchema = z.enum(['low', 'medium', 'high'])
export type FeedLevel = z.infer<typeof FeedLevelSchema>

/**
 * Numeric energy level (1-5) for more granular energy tracking
 * Used in user profiles and energy-based task matching
 */
export const EnergyLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5)
])
export type EnergyLevel = z.infer<typeof EnergyLevelSchema>

// ============================================
// Time of Day Schema
// ============================================

/**
 * Preferred time of day for task completion
 * - morning: High-focus tasks, creative work
 * - afternoon: Administrative, meetings
 * - evening: Low-energy, wind-down tasks
 * - anytime: Flexible tasks
 */
export const TimeOfDaySchema = z.enum(['morning', 'afternoon', 'evening', 'anytime'])
export type TimeOfDay = z.infer<typeof TimeOfDaySchema>

// ============================================
// Task Status Schema
// ============================================

export const TaskStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'deferred'])
export type TaskStatus = z.infer<typeof TaskStatusSchema>

// ============================================
// Verb Label Schema
// ============================================

/**
 * Verb label must be max 12 characters
 * Examples: "Deep Work", "Quick Win", "Research", "Draft", "Review"
 */
export const VerbLabelSchema = z.string()
  .min(1, 'Verb label is required')
  .max(12, 'Verb label must be 12 characters or less')
  .transform(s => s.trim())

// ============================================
// Time Estimate Schema
// ============================================

/**
 * Time estimate in minutes (5 min to 8 hours)
 * For display purposes, NOT shown to users directly
 */
export const TimeEstimateSchema = z.number()
  .int('Time estimate must be a whole number')
  .min(5, 'Minimum 5 minutes')
  .max(480, 'Maximum 8 hours (480 minutes)')

// ============================================
// AI Extracted Task Schema
// ============================================

/**
 * Schema for tasks extracted by AI from brain dumps
 * This is what the AI returns after parsing user input
 */
export const AIExtractedTaskSchema = z.object({
  /** Short action verb (max 12 chars) like "Write", "Call", "Research" */
  verbLabel: z.string().max(12).transform(s => s.slice(0, 12).trim()),
  
  /** The specific task description (clear, actionable) */
  taskBody: z.string().min(1, 'Task body is required').max(500),
  
  /** Estimated minutes (be realistic, round to 5/10/15/30/60) */
  timeEstimate: z.number().int().min(5).max(480).catch(30),
  
  /** Energy/effort level required */
  feedLevel: FeedLevelSchema.catch('medium'),
  
  /** When this task is best suited (optional) */
  timeOfDay: TimeOfDaySchema.optional(),
  
  /** Associated project ID if task relates to existing project */
  suggestedProjectId: z.string().uuid().optional(),
  
  /** Associated goal ID if task relates to existing goal */
  suggestedGoalId: z.string().uuid().optional()
})

export type AIExtractedTask = z.infer<typeof AIExtractedTaskSchema>

/**
 * Array of AI extracted tasks
 */
export const AIExtractedTasksSchema = z.array(AIExtractedTaskSchema)

// ============================================
// New Task Schema (for creation)
// ============================================

/**
 * Schema for creating a new task in the app
 * Validates user input before saving to IndexedDB
 */
export const NewTaskSchema = z.object({
  verbLabel: VerbLabelSchema,
  taskBody: z.string().min(1, 'Task description is required').max(500),
  timeEstimate: TimeEstimateSchema,
  feedLevel: FeedLevelSchema,
  timeOfDay: TimeOfDaySchema.optional().default('anytime'),
  projectId: z.string().uuid().optional(),
  goalId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  scheduledFor: z.string().optional() // ISO date string
})

export type NewTask = z.infer<typeof NewTaskSchema>

// ============================================
// Full Task Schema (stored in IndexedDB)
// ============================================

/**
 * Complete task schema including all system-generated fields
 */
export const TaskSchema = NewTaskSchema.extend({
  id: z.string().uuid(),
  status: TaskStatusSchema.default('pending'),
  deferredUntil: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  order: z.number().int().min(0)
})

export type Task = z.infer<typeof TaskSchema>

// ============================================
// Utility Functions
// ============================================

/**
 * Parse AI-extracted tasks with graceful degradation
 * Returns only valid tasks, logs invalid ones
 */
export function parseAITasks(rawTasks: unknown): AIExtractedTask[] {
  if (!Array.isArray(rawTasks)) {
    console.warn('AI tasks is not an array:', rawTasks)
    return []
  }

  return rawTasks
    .map((task, index) => {
      const result = AIExtractedTaskSchema.safeParse(task)
      if (result.success) {
        return result.data
      }
      console.warn(`Invalid AI task at index ${index}:`, result.error.issues)
      return null
    })
    .filter((task): task is AIExtractedTask => task !== null)
}

/**
 * Convert AI extracted task to new task format
 */
export function aiTaskToNewTask(aiTask: AIExtractedTask): NewTask {
  return {
    verbLabel: aiTask.verbLabel,
    taskBody: aiTask.taskBody,
    timeEstimate: aiTask.timeEstimate,
    feedLevel: aiTask.feedLevel,
    timeOfDay: aiTask.timeOfDay || 'anytime',
    projectId: aiTask.suggestedProjectId,
    goalId: aiTask.suggestedGoalId
  }
}

/**
 * Map feedLevel to energyLevel (1-5 scale)
 */
export function feedLevelToEnergyLevel(feedLevel: FeedLevel): EnergyLevel {
  switch (feedLevel) {
    case 'low': return 2
    case 'medium': return 3
    case 'high': return 5
  }
}

/**
 * Map energyLevel (1-5) to feedLevel
 */
export function energyLevelToFeedLevel(energyLevel: EnergyLevel): FeedLevel {
  if (energyLevel <= 2) return 'low'
  if (energyLevel <= 4) return 'medium'
  return 'high'
}
