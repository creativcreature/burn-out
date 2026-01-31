/**
 * Sync Service
 * 
 * Handles offline-first data synchronization between IndexedDB and Supabase.
 * 
 * Strategy:
 * 1. All writes go to IndexedDB first (instant offline support)
 * 2. Changes are queued for sync when online
 * 3. Sync pulls server changes, then pushes local changes
 * 4. Conflicts resolved by: most recent updatedAt wins, with soft deletes
 * 5. Version numbers for optimistic concurrency control
 */

import { get, set } from 'idb-keyval'
import { supabase, isSupabaseConfigured, getCurrentUser } from './supabase'
import type { 
  DbTask, DbGoal, DbProject, DbHabit, DbJournalEntry 
} from './supabase'
import type { Task, Goal, Project, Habit, JournalEntry } from '../data/types'

// ============================================
// Sync Queue (stored in IndexedDB)
// ============================================

interface SyncQueueItem {
  id: string
  table: 'tasks' | 'goals' | 'projects' | 'habits' | 'journal_entries'
  operation: 'upsert' | 'delete'
  data: Record<string, unknown>
  createdAt: string
  retryCount: number
}

const SYNC_QUEUE_KEY = 'burnout_sync_queue'
const SYNC_METADATA_KEY = 'burnout_sync_metadata'

interface SyncMetadata {
  lastSyncedAt: string | null
  pendingChanges: number
  isOnline: boolean
}

// ============================================
// Data Transformation (Local <-> DB)
// ============================================

function taskToDb(task: Task, userId: string): Omit<DbTask, 'version'> {
  return {
    id: task.id,
    user_id: userId,
    project_id: task.projectId || undefined,
    goal_id: task.goalId || undefined,
    category_id: task.categoryId || undefined,
    verb_label: task.verbLabel,
    task_body: task.taskBody,
    time_estimate: task.timeEstimate,
    feed_level: task.feedLevel,
    scheduled_for: task.scheduledFor || undefined,
    time_of_day: task.timeOfDay || undefined,
    status: task.status,
    deferred_until: task.deferredUntil || undefined,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
    task_order: task.order
  }
}

function dbToTask(dbTask: DbTask): Task {
  return {
    id: dbTask.id,
    projectId: dbTask.project_id,
    goalId: dbTask.goal_id,
    categoryId: dbTask.category_id,
    verbLabel: dbTask.verb_label,
    taskBody: dbTask.task_body,
    timeEstimate: dbTask.time_estimate,
    feedLevel: dbTask.feed_level,
    scheduledFor: dbTask.scheduled_for,
    timeOfDay: dbTask.time_of_day,
    status: dbTask.status,
    deferredUntil: dbTask.deferred_until,
    createdAt: dbTask.created_at,
    updatedAt: dbTask.updated_at,
    order: dbTask.task_order
  }
}

function goalToDb(goal: Goal, userId: string): Omit<DbGoal, 'version'> {
  return {
    id: goal.id,
    user_id: userId,
    title: goal.title,
    description: goal.description || undefined,
    timeframe: goal.timeframe,
    target_date: goal.targetDate || undefined,
    is_active: goal.isActive,
    created_at: goal.createdAt,
    updated_at: goal.updatedAt,
    archived: goal.archived,
    goal_order: goal.order
  }
}

function dbToGoal(dbGoal: DbGoal): Goal {
  return {
    id: dbGoal.id,
    title: dbGoal.title,
    description: dbGoal.description,
    timeframe: dbGoal.timeframe as Goal['timeframe'],
    targetDate: dbGoal.target_date,
    isActive: dbGoal.is_active,
    createdAt: dbGoal.created_at,
    updatedAt: dbGoal.updated_at,
    archived: dbGoal.archived,
    order: dbGoal.goal_order
  }
}

function projectToDb(project: Project, userId: string): Omit<DbProject, 'version'> {
  return {
    id: project.id,
    user_id: userId,
    goal_id: project.goalId,
    parent_project_id: project.parentProjectId || undefined,
    title: project.title,
    description: project.description || undefined,
    status: project.status,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
    project_order: project.order
  }
}

function dbToProject(dbProject: DbProject): Project {
  return {
    id: dbProject.id,
    goalId: dbProject.goal_id,
    parentProjectId: dbProject.parent_project_id,
    title: dbProject.title,
    description: dbProject.description,
    status: dbProject.status,
    createdAt: dbProject.created_at,
    updatedAt: dbProject.updated_at,
    order: dbProject.project_order
  }
}

function habitToDb(habit: Habit, userId: string): Omit<DbHabit, 'version'> {
  return {
    id: habit.id,
    user_id: userId,
    verb_label: habit.verbLabel,
    habit_body: habit.habitBody,
    frequency: habit.frequency,
    custom_days: habit.customDays,
    time_of_day: habit.timeOfDay,
    feed_level: habit.feedLevel,
    goal_id: habit.goalId || undefined,
    created_at: habit.createdAt,
    last_completed: habit.lastCompleted || undefined,
    completion_count: habit.completionCount
  }
}

function dbToHabit(dbHabit: DbHabit): Habit {
  return {
    id: dbHabit.id,
    verbLabel: dbHabit.verb_label,
    habitBody: dbHabit.habit_body,
    frequency: dbHabit.frequency,
    customDays: dbHabit.custom_days,
    timeOfDay: dbHabit.time_of_day,
    feedLevel: dbHabit.feed_level,
    goalId: dbHabit.goal_id,
    createdAt: dbHabit.created_at,
    lastCompleted: dbHabit.last_completed,
    completionCount: dbHabit.completion_count
  }
}

function journalToDb(entry: JournalEntry, userId: string): Omit<DbJournalEntry, 'version'> {
  return {
    id: entry.id,
    user_id: userId,
    entry_date: entry.date,
    content: entry.content,
    mood: entry.mood,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt
  }
}

function dbToJournal(dbEntry: DbJournalEntry): JournalEntry {
  return {
    id: dbEntry.id,
    date: dbEntry.entry_date,
    content: dbEntry.content,
    mood: dbEntry.mood,
    createdAt: dbEntry.created_at,
    updatedAt: dbEntry.updated_at
  }
}

// ============================================
// Sync Queue Management
// ============================================

async function getSyncQueue(): Promise<SyncQueueItem[]> {
  return (await get(SYNC_QUEUE_KEY)) || []
}

async function addToSyncQueue(item: Omit<SyncQueueItem, 'createdAt' | 'retryCount'>) {
  const queue = await getSyncQueue()
  
  // Deduplicate: remove existing item for same id/table
  const filtered = queue.filter(
    q => !(q.id === item.id && q.table === item.table)
  )
  
  filtered.push({
    ...item,
    createdAt: new Date().toISOString(),
    retryCount: 0
  })
  
  await set(SYNC_QUEUE_KEY, filtered)
}

async function removeFromSyncQueue(id: string, table: string) {
  const queue = await getSyncQueue()
  const filtered = queue.filter(q => !(q.id === id && q.table === table))
  await set(SYNC_QUEUE_KEY, filtered)
}

async function getSyncMetadata(): Promise<SyncMetadata> {
  const stored = await get(SYNC_METADATA_KEY)
  return stored || {
    lastSyncedAt: null,
    pendingChanges: 0,
    isOnline: navigator.onLine
  }
}

async function updateSyncMetadata(updates: Partial<SyncMetadata>) {
  const current = await getSyncMetadata()
  await set(SYNC_METADATA_KEY, { ...current, ...updates })
}

// ============================================
// Conflict Resolution
// ============================================

/**
 * Resolve conflict between local and server versions
 * Strategy: Most recent updatedAt wins
 * If timestamps are equal, server wins (it has more authority)
 */
function resolveConflict<T extends { updatedAt: string }>(
  local: T,
  server: T
): T {
  const localTime = new Date(local.updatedAt).getTime()
  const serverTime = new Date(server.updatedAt).getTime()
  
  return localTime > serverTime ? local : server
}

// ============================================
// Sync Operations
// ============================================

export interface SyncResult {
  success: boolean
  error?: string
  pulled: number
  pushed: number
  conflicts: number
}

/**
 * Main sync function - call when online
 */
export async function syncWithServer(): Promise<SyncResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase not configured', pulled: 0, pushed: 0, conflicts: 0 }
  }

  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Not authenticated', pulled: 0, pushed: 0, conflicts: 0 }
  }

  try {
    const metadata = await getSyncMetadata()
    let pulled = 0
    let pushed = 0
    let conflicts = 0

    // 1. Pull server changes since last sync
    const pullResult = await pullFromServer(user.id, metadata.lastSyncedAt)
    pulled = pullResult.count
    conflicts = pullResult.conflicts

    // 2. Push pending local changes
    const pushResult = await pushToServer(user.id)
    pushed = pushResult.count

    // 3. Update sync metadata
    await updateSyncMetadata({
      lastSyncedAt: new Date().toISOString(),
      pendingChanges: 0,
      isOnline: true
    })

    return { success: true, pulled, pushed, conflicts }
  } catch (error) {
    console.error('Sync failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown sync error',
      pulled: 0,
      pushed: 0,
      conflicts: 0
    }
  }
}

async function pullFromServer(
  userId: string, 
  since: string | null
): Promise<{ count: number; conflicts: number }> {
  if (!supabase) return { count: 0, conflicts: 0 }
  
  let count = 0
  let conflicts = 0
  
  // Import getData here to avoid circular deps
  const { getData, saveData } = await import('../utils/storage')
  const localData = await getData()
  
  // Pull tasks
  const tasksQuery = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
  
  if (since) {
    tasksQuery.gte('updated_at', since)
  }
  
  const { data: serverTasks, error: tasksError } = await tasksQuery
  
  if (tasksError) {
    console.error('Failed to pull tasks:', tasksError)
  } else if (serverTasks) {
    for (const serverTask of serverTasks as DbTask[]) {
      const localTask = localData.tasks.find(t => t.id === serverTask.id)
      const convertedTask = dbToTask(serverTask)
      
      if (localTask) {
        // Conflict resolution
        const resolved = resolveConflict(localTask, convertedTask)
        if (resolved.id !== localTask.id || resolved.updatedAt !== localTask.updatedAt) {
          conflicts++
        }
        const taskIndex = localData.tasks.findIndex(t => t.id === serverTask.id)
        localData.tasks[taskIndex] = resolved
      } else {
        localData.tasks.push(convertedTask)
      }
      count++
    }
  }
  
  // Pull goals (similar pattern)
  const { data: serverGoals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .gte('updated_at', since || '1970-01-01')
  
  if (serverGoals) {
    for (const serverGoal of serverGoals as DbGoal[]) {
      const localGoal = localData.goals.find(g => g.id === serverGoal.id)
      const convertedGoal = dbToGoal(serverGoal)
      
      if (localGoal) {
        const resolved = resolveConflict(localGoal, convertedGoal)
        const goalIndex = localData.goals.findIndex(g => g.id === serverGoal.id)
        localData.goals[goalIndex] = resolved
      } else {
        localData.goals.push(convertedGoal)
      }
      count++
    }
  }
  
  // Pull projects
  const { data: serverProjects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .gte('updated_at', since || '1970-01-01')
  
  if (serverProjects) {
    for (const serverProject of serverProjects as DbProject[]) {
      const localProject = localData.projects.find(p => p.id === serverProject.id)
      const convertedProject = dbToProject(serverProject)
      
      if (localProject) {
        const resolved = resolveConflict(localProject, convertedProject)
        const projectIndex = localData.projects.findIndex(p => p.id === serverProject.id)
        localData.projects[projectIndex] = resolved
      } else {
        localData.projects.push(convertedProject)
      }
      count++
    }
  }
  
  // Pull habits
  const { data: serverHabits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .gte('updated_at', since || '1970-01-01')
  
  if (serverHabits) {
    for (const serverHabit of serverHabits as DbHabit[]) {
      const localHabit = localData.habits.find(h => h.id === serverHabit.id)
      const convertedHabit = dbToHabit(serverHabit)
      
      if (localHabit) {
        const resolved = resolveConflict(
          { ...localHabit, updatedAt: localHabit.createdAt }, // Habits don't have updatedAt
          { ...convertedHabit, updatedAt: convertedHabit.createdAt }
        )
        const habitIndex = localData.habits.findIndex(h => h.id === serverHabit.id)
        localData.habits[habitIndex] = { ...resolved, createdAt: resolved.updatedAt }
      } else {
        localData.habits.push(convertedHabit)
      }
      count++
    }
  }
  
  // Pull journal entries
  const { data: serverJournals } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .gte('updated_at', since || '1970-01-01')
  
  if (serverJournals) {
    for (const serverJournal of serverJournals as DbJournalEntry[]) {
      const localJournal = localData.journalEntries.find(j => j.id === serverJournal.id)
      const convertedJournal = dbToJournal(serverJournal)
      
      if (localJournal) {
        const resolved = resolveConflict(localJournal, convertedJournal)
        const journalIndex = localData.journalEntries.findIndex(j => j.id === serverJournal.id)
        localData.journalEntries[journalIndex] = resolved
      } else {
        localData.journalEntries.push(convertedJournal)
      }
      count++
    }
  }
  
  // Save merged data
  await saveData(localData)
  
  return { count, conflicts }
}

async function pushToServer(userId: string): Promise<{ count: number }> {
  if (!supabase) return { count: 0 }
  
  const queue = await getSyncQueue()
  let count = 0
  
  for (const item of queue) {
    try {
      if (item.operation === 'upsert') {
        const { error } = await supabase
          .from(item.table)
          .upsert({
            ...item.data,
            user_id: userId,
            version: (item.data.version as number || 0) + 1
          })
        
        if (error) throw error
      } else if (item.operation === 'delete') {
        // Soft delete
        const { error } = await supabase
          .from(item.table)
          .update({ 
            deleted_at: new Date().toISOString(),
            version: (item.data.version as number || 0) + 1
          })
          .eq('id', item.id)
          .eq('user_id', userId)
        
        if (error) throw error
      }
      
      await removeFromSyncQueue(item.id, item.table)
      count++
    } catch (error) {
      console.error(`Failed to sync ${item.table}/${item.id}:`, error)
      // Increment retry count (handled elsewhere)
    }
  }
  
  return { count }
}

// ============================================
// Queue Helpers for Data Changes
// ============================================

export async function queueTaskSync(task: Task, operation: 'upsert' | 'delete') {
  if (!isSupabaseConfigured) return
  
  const user = await getCurrentUser()
  if (!user) return
  
  await addToSyncQueue({
    id: task.id,
    table: 'tasks',
    operation,
    data: taskToDb(task, user.id)
  })
  
  const metadata = await getSyncMetadata()
  await updateSyncMetadata({ pendingChanges: metadata.pendingChanges + 1 })
}

export async function queueGoalSync(goal: Goal, operation: 'upsert' | 'delete') {
  if (!isSupabaseConfigured) return
  
  const user = await getCurrentUser()
  if (!user) return
  
  await addToSyncQueue({
    id: goal.id,
    table: 'goals',
    operation,
    data: goalToDb(goal, user.id)
  })
}

export async function queueProjectSync(project: Project, operation: 'upsert' | 'delete') {
  if (!isSupabaseConfigured) return
  
  const user = await getCurrentUser()
  if (!user) return
  
  await addToSyncQueue({
    id: project.id,
    table: 'projects',
    operation,
    data: projectToDb(project, user.id)
  })
}

export async function queueHabitSync(habit: Habit, operation: 'upsert' | 'delete') {
  if (!isSupabaseConfigured) return
  
  const user = await getCurrentUser()
  if (!user) return
  
  await addToSyncQueue({
    id: habit.id,
    table: 'habits',
    operation,
    data: habitToDb(habit, user.id)
  })
}

export async function queueJournalSync(entry: JournalEntry, operation: 'upsert' | 'delete') {
  if (!isSupabaseConfigured) return
  
  const user = await getCurrentUser()
  if (!user) return
  
  await addToSyncQueue({
    id: entry.id,
    table: 'journal_entries',
    operation,
    data: journalToDb(entry, user.id)
  })
}

// ============================================
// Online/Offline Detection
// ============================================

/**
 * Setup online/offline listeners for automatic sync
 */
export function setupSyncListeners(onSync?: (result: SyncResult) => void) {
  const handleOnline = async () => {
    await updateSyncMetadata({ isOnline: true })
    const result = await syncWithServer()
    onSync?.(result)
  }
  
  const handleOffline = async () => {
    await updateSyncMetadata({ isOnline: false })
  }
  
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  
  // Initial sync if online
  if (navigator.onLine) {
    syncWithServer().then(onSync)
  }
  
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

/**
 * Get current sync status
 */
export async function getSyncStatus(): Promise<SyncMetadata & { queueLength: number }> {
  const metadata = await getSyncMetadata()
  const queue = await getSyncQueue()
  return {
    ...metadata,
    isOnline: navigator.onLine,
    queueLength: queue.length
  }
}
