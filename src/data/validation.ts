/**
 * Runtime Validation Schemas
 *
 * These complement TypeScript's compile-time types with runtime validation.
 * Use these when accepting data from:
 * - User input
 * - AI responses
 * - External APIs
 * - Storage (after migration)
 */

import { z } from 'zod'

// ============================================
// Primitive Schemas
// ============================================

export const EnergyLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5)
])

export const FeedLevelSchema = z.enum(['low', 'medium', 'high'])

export const TimeOfDaySchema = z.enum(['morning', 'afternoon', 'evening', 'anytime'])

export const TaskStatusSchema = z.enum(['pending', 'completed', 'deferred'])

export const BurnoutModeSchema = z.enum(['recovery', 'prevention', 'balanced'])

export const TonePreferenceSchema = z.enum(['gentle', 'direct', 'playful'])

export const GoalTimeframeSchema = z.enum(['5y', '3y', '1y', '6m', '3m', '1m', '1w'])

export const HabitFrequencySchema = z.enum(['daily', 'weekly', 'custom'])

export const ThemeSchema = z.enum(['light', 'dark'])

// ============================================
// Entity Schemas
// ============================================

// Verb label must be max 12 characters
export const VerbLabelSchema = z.string()
  .min(1, 'Verb label is required')
  .max(12, 'Verb label must be 12 characters or less')
  .transform(s => s.trim())

// Time estimate in minutes (5 min to 8 hours)
export const TimeEstimateSchema = z.number()
  .int('Time estimate must be a whole number')
  .min(5, 'Minimum 5 minutes')
  .max(480, 'Maximum 8 hours (480 minutes)')

// ISO date string validation
export const ISODateSchema = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  'Invalid date format'
)

// Time block (HH:MM format)
export const TimeStringSchema = z.string().regex(
  /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  'Time must be in HH:MM format'
)

export const TimeBlockSchema = z.object({
  start: TimeStringSchema,
  end: TimeStringSchema,
  label: z.string().optional()
}).refine(
  (block) => {
    const [startH, startM] = block.start.split(':').map(Number)
    const [endH, endM] = block.end.split(':').map(Number)
    return (startH * 60 + startM) < (endH * 60 + endM)
  },
  'End time must be after start time'
)

// ============================================
// New Entity Schemas (for creation)
// ============================================

export const NewTaskSchema = z.object({
  verbLabel: VerbLabelSchema,
  taskBody: z.string().min(1, 'Task description is required').max(500),
  timeEstimate: TimeEstimateSchema,
  feedLevel: FeedLevelSchema,
  timeOfDay: TimeOfDaySchema.optional().default('anytime'),
  projectId: z.string().uuid().optional(),
  goalId: z.string().uuid().optional(),
  scheduledFor: ISODateSchema.optional()
})

export const NewGoalSchema = z.object({
  title: z.string().min(1, 'Goal title is required').max(100),
  description: z.string().max(500).optional(),
  timeframe: GoalTimeframeSchema.default('1y'),
  isActive: z.boolean().default(false),
  targetDate: ISODateSchema.optional()
})

export const NewProjectSchema = z.object({
  goalId: z.string().uuid('Invalid goal ID'),
  parentProjectId: z.string().uuid().optional(),
  title: z.string().min(1, 'Project title is required').max(100),
  description: z.string().max(500).optional()
})

export const NewHabitSchema = z.object({
  verbLabel: VerbLabelSchema,
  habitBody: z.string().min(1, 'Habit description is required').max(500),
  frequency: HabitFrequencySchema,
  customDays: z.array(z.number().int().min(0).max(6)).optional(),
  timeOfDay: TimeOfDaySchema,
  feedLevel: FeedLevelSchema,
  goalId: z.string().uuid().optional()
})

// ============================================
// AI Response Schemas
// ============================================

export const AIExtractedTaskSchema = z.object({
  verbLabel: z.string().max(12).transform(s => s.slice(0, 12).trim()),
  taskBody: z.string().min(1),
  timeEstimate: z.number().int().min(5).max(480).catch(30), // Default to 30 if invalid
  feedLevel: FeedLevelSchema.catch('medium') // Default to medium if invalid
})

export const AIExtractedTasksSchema = z.array(AIExtractedTaskSchema)

// ============================================
// Settings Schema
// ============================================

export const SettingsSchema = z.object({
  notifications: z.boolean(),
  dailyReminder: z.string().nullable(),
  apiKey: z.string().optional(),
  haptics: z.boolean(),
  soundEnabled: z.boolean()
})

// ============================================
// Validation Helper Functions
// ============================================

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; issues: z.ZodIssue[] }

/**
 * Validate data and return a result object
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return {
    success: false,
    error: result.error.issues.map(i => i.message).join(', '),
    issues: result.error.issues
  }
}

/**
 * Validate and throw if invalid (for internal use)
 */
export function validateOrThrow<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): T {
  const result = schema.safeParse(data)

  if (result.success) {
    return result.data
  }

  const message = result.error.issues.map(i => i.message).join(', ')
  throw new Error(context ? `${context}: ${message}` : message)
}

/**
 * Parse AI-extracted tasks with graceful degradation
 * Returns only valid tasks, logs invalid ones
 */
export function parseAITasks(rawTasks: unknown): z.infer<typeof AIExtractedTaskSchema>[] {
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
    .filter((task): task is z.infer<typeof AIExtractedTaskSchema> => task !== null)
}

// ============================================
// Type Exports (inferred from schemas)
// ============================================

export type NewTask = z.infer<typeof NewTaskSchema>
export type NewGoal = z.infer<typeof NewGoalSchema>
export type NewProject = z.infer<typeof NewProjectSchema>
export type NewHabit = z.infer<typeof NewHabitSchema>
export type AIExtractedTask = z.infer<typeof AIExtractedTaskSchema>
