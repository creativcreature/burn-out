import { get, set } from 'idb-keyval'
import type { BurnOutData, Theme } from '../data/types'
import { STORAGE_KEY, CURRENT_VERSION } from '../data/constants'

function createDefaultData(): BurnOutData {
  return {
    version: CURRENT_VERSION,
    theme: 'light',
    user: {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      burnoutMode: 'balanced',
      energyDefaults: { morning: 3, afternoon: 3, evening: 2 },
      tonePreference: 'gentle',
      timeAvailability: { weekday: [], weekend: [] }
    },
    goals: [],
    projects: [],
    tasks: [],
    habits: [],
    completedTasks: [],
    chatHistory: [],
    settings: {
      notifications: false,
      dailyReminder: null,
      haptics: true,
      soundEnabled: true
    },
    onboarding: {
      completed: false,
      skippedSteps: []
    }
  }
}

function migrateIfNeeded(data: BurnOutData): BurnOutData {
  if (data.version === CURRENT_VERSION) {
    return data
  }

  // Add migrations here as schema evolves
  // Example:
  // if (data.version < 2) {
  //   data = migrateV1toV2(data)
  // }

  return { ...data, version: CURRENT_VERSION }
}

export async function getData(): Promise<BurnOutData> {
  try {
    const data = await get<BurnOutData>(STORAGE_KEY)
    if (!data) {
      const defaultData = createDefaultData()
      await set(STORAGE_KEY, defaultData)
      return defaultData
    }
    return migrateIfNeeded(data)
  } catch (error) {
    console.error('Failed to get data:', error)
    return createDefaultData()
  }
}

export async function saveData(data: BurnOutData): Promise<void> {
  try {
    await set(STORAGE_KEY, data)
  } catch (error) {
    console.error('Failed to save data:', error)
    throw error
  }
}

export async function updateData(
  updater: (data: BurnOutData) => BurnOutData
): Promise<BurnOutData> {
  const current = await getData()
  const updated = updater(current)
  await saveData(updated)
  return updated
}

export async function getTheme(): Promise<Theme> {
  const data = await getData()
  return data.theme
}

export async function setTheme(theme: Theme): Promise<void> {
  await updateData(data => ({ ...data, theme }))
}

// Migration from localStorage (run once on app load)
const OLD_KEYS = [
  'burnout_tasks',
  'burnout_settings',
  'burnout_theme',
  'burnout_chat',
  'burnout_habits'
]

export async function migrateFromLocalStorage(): Promise<boolean> {
  try {
    // Check if already migrated
    const existing = await get(STORAGE_KEY)
    if (existing) return false

    // Check if there's old data
    const hasOldData = OLD_KEYS.some(key => localStorage.getItem(key))
    if (!hasOldData) return false

    // Gather old data
    const oldTasks = JSON.parse(localStorage.getItem('burnout_tasks') || '[]')
    const oldSettings = JSON.parse(localStorage.getItem('burnout_settings') || '{}')
    const oldTheme = (localStorage.getItem('burnout_theme') || 'light') as Theme
    const oldChat = JSON.parse(localStorage.getItem('burnout_chat') || '[]')
    const oldHabits = JSON.parse(localStorage.getItem('burnout_habits') || '[]')

    // Create new data with old values
    const newData = createDefaultData()
    newData.theme = oldTheme
    newData.tasks = oldTasks
    newData.habits = oldHabits
    newData.chatHistory = oldChat
    newData.settings = { ...newData.settings, ...oldSettings }

    // Save to IndexedDB
    await set(STORAGE_KEY, newData)

    // Clean up old storage
    OLD_KEYS.forEach(key => localStorage.removeItem(key))

    return true
  } catch (error) {
    console.error('Migration failed:', error)
    return false
  }
}
