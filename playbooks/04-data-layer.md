# Playbook 04: Unified Data Layer

## Overview
Consolidate all storage into a single IndexedDB key with proper types.

## Problem Being Solved
Current app has 5 different localStorage keys causing data fragmentation and potential loss. This playbook unifies everything under `burnout_v4`.

## Data Schema

### Master Schema
```typescript
// src/data/types.ts

interface BurnOutData {
  version: number  // Schema version for migrations
  theme: 'light' | 'dark'
  user: UserProfile
  goals: Goal[]
  projects: Project[]
  tasks: Task[]
  habits: Habit[]
  completedTasks: CompletedTask[]
  chatHistory: ChatMessage[]
  settings: Settings
  onboarding: OnboardingData
}
```

### User Profile
```typescript
interface UserProfile {
  id: string
  createdAt: string
  burnoutMode: 'recovery' | 'prevention' | 'balanced'
  energyDefaults: {
    morning: EnergyLevel
    afternoon: EnergyLevel
    evening: EnergyLevel
  }
  tonePreference: 'gentle' | 'direct' | 'playful'
  timeAvailability: {
    weekday: TimeBlock[]
    weekend: TimeBlock[]
  }
}

type EnergyLevel = 1 | 2 | 3 | 4 | 5
```

### Data Hierarchy (Goal → Project → Task)
```typescript
interface Goal {
  id: string
  title: string
  description?: string
  targetDate?: string
  createdAt: string
  updatedAt: string
  archived: boolean
  order: number
}

interface Project {
  id: string
  goalId: string  // Links to parent goal
  title: string
  description?: string
  status: 'active' | 'paused' | 'completed'
  createdAt: string
  updatedAt: string
  order: number
}

interface Task {
  id: string
  projectId?: string  // Optional link to project
  goalId?: string     // Optional direct link to goal
  verbLabel: string   // Max 12 chars: "Deep Work", "Hydrate", etc.
  taskBody: string    // Full task description
  timeEstimate: number  // Minutes
  feedLevel: 'low' | 'medium' | 'high'  // Energy required
  scheduledFor?: string  // ISO date
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'anytime'
  status: 'pending' | 'in_progress' | 'completed' | 'deferred'
  deferredUntil?: string
  createdAt: string
  updatedAt: string
  order: number
}
```

### Habits (Recurring)
```typescript
interface Habit {
  id: string
  verbLabel: string   // Max 12 chars
  habitBody: string
  frequency: 'daily' | 'weekly' | 'custom'
  customDays?: number[]  // 0-6 for custom frequency
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime'
  feedLevel: 'low' | 'medium' | 'high'
  goalId?: string
  createdAt: string
  lastCompleted?: string
  streak?: number  // Track internally but DON'T DISPLAY (no gamification)
}
```

### Completed Tasks (Analytics)
```typescript
interface CompletedTask {
  id: string
  taskId: string
  habitId?: string
  completedAt: string
  duration: number  // Actual time in minutes
  energyBefore?: EnergyLevel
  energyAfter?: EnergyLevel
  notes?: string
}
```

### Chat
```typescript
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  tasksCreated?: string[]  // IDs of tasks created from this message
}
```

### Settings
```typescript
interface Settings {
  notifications: boolean
  dailyReminder: string | null  // Time like "09:00"
  apiKey?: string  // Claude API key (stored securely)
  haptics: boolean
  soundEnabled: boolean
}
```

### Onboarding
```typescript
interface OnboardingData {
  completed: boolean
  completedAt?: string
  skippedSteps: string[]
}
```

## Storage Utility

### Create Storage Hook
```typescript
// src/utils/storage.ts
import { get, set } from 'idb-keyval'

const STORAGE_KEY = 'burnout_v4'
const CURRENT_VERSION = 1

// Get all data
export async function getData(): Promise<BurnOutData> {
  const data = await get(STORAGE_KEY)
  if (!data) {
    return createDefaultData()
  }
  return migrateIfNeeded(data)
}

// Save all data
export async function saveData(data: BurnOutData): Promise<void> {
  await set(STORAGE_KEY, data)
}

// Partial update
export async function updateData(
  updater: (data: BurnOutData) => BurnOutData
): Promise<BurnOutData> {
  const current = await getData()
  const updated = updater(current)
  await saveData(updated)
  return updated
}

// Create default data structure
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

// Migrate old data schemas
function migrateIfNeeded(data: BurnOutData): BurnOutData {
  if (data.version === CURRENT_VERSION) {
    return data
  }
  // Add migrations as needed
  return { ...data, version: CURRENT_VERSION }
}
```

### Create Data Hooks
```typescript
// src/hooks/useTasks.ts
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])

  // Load tasks
  useEffect(() => {
    getData().then(data => setTasks(data.tasks))
  }, [])

  // Add task
  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    await updateData(data => ({
      ...data,
      tasks: [...data.tasks, {
        ...task,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]
    }))
  }

  // ... complete, delete, reorder, etc.

  return { tasks, addTask, completeTask, deleteTask, reorderTasks }
}
```

## Migration from Old Data

### Migration Script
```typescript
// src/utils/migration.ts

const OLD_KEYS = [
  'burnout_tasks',
  'burnout_settings',
  'burnout_theme',
  'burnout_chat',
  'burnout_habits'
]

export async function migrateFromLocalStorage(): Promise<void> {
  // Check if already migrated
  const existing = await get(STORAGE_KEY)
  if (existing) return

  // Gather old data
  const oldData = {
    tasks: JSON.parse(localStorage.getItem('burnout_tasks') || '[]'),
    settings: JSON.parse(localStorage.getItem('burnout_settings') || '{}'),
    theme: localStorage.getItem('burnout_theme') || 'light',
    chat: JSON.parse(localStorage.getItem('burnout_chat') || '[]'),
    habits: JSON.parse(localStorage.getItem('burnout_habits') || '[]')
  }

  // Transform to new schema
  const newData = transformOldData(oldData)

  // Save to IndexedDB
  await set(STORAGE_KEY, newData)

  // Clean up old storage
  OLD_KEYS.forEach(key => localStorage.removeItem(key))
}
```

## Verification

- [ ] Single storage key in use
- [ ] All data persists after refresh
- [ ] Migration preserves old data
- [ ] Theme persists correctly
- [ ] Tasks maintain order
- [ ] Goal → Project → Task hierarchy works
- [ ] Chat history preserved
- [ ] No localStorage usage anywhere

## Next Steps
Proceed to Playbook 05: AI Chat
