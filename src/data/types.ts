export type Theme = 'light' | 'dark'
export type EnergyLevel = 1 | 2 | 3 | 4 | 5
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime'
export type FeedLevel = 'low' | 'medium' | 'high'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'deferred'
export type ProjectStatus = 'active' | 'paused' | 'completed'
export type BurnoutMode = 'recovery' | 'prevention' | 'balanced'
export type TonePreference = 'gentle' | 'direct' | 'playful'
export type HabitFrequency = 'daily' | 'weekly' | 'custom'
export type GoalTimeframe = '5y' | '3y' | '1y' | '6m' | '3m' | '1m' | '1w'

export interface TimeBlock {
  start: string  // HH:MM format
  end: string    // HH:MM format
  label?: string
}

export interface UserProfile {
  id: string
  createdAt: string
  burnoutMode: BurnoutMode
  currentEnergy?: EnergyLevel  // Currently set energy level (persisted)
  energyDefaults: {
    morning: EnergyLevel
    afternoon: EnergyLevel
    evening: EnergyLevel
  }
  tonePreference: TonePreference
  timeAvailability: {
    weekday: TimeBlock[]
    weekend: TimeBlock[]
  }
}

export interface Goal {
  id: string
  title: string
  description?: string
  timeframe: GoalTimeframe
  targetDate?: string
  isActive: boolean          // Only ONE goal can be active at a time
  createdAt: string
  updatedAt: string
  archived: boolean
  order: number
}

export interface Project {
  id: string
  goalId: string
  parentProjectId?: string  // Reference to parent project for nesting
  title: string
  description?: string
  status: ProjectStatus
  createdAt: string
  updatedAt: string
  order: number
}

export interface TaskCategory {
  id: string
  name: string            // e.g., "Errands", "Health", "Admin"
  isSystem: boolean       // AI-generated vs user-created
  createdAt: string
}

export interface Task {
  id: string
  projectId?: string
  goalId?: string
  categoryId?: string     // For AI auto-tagging orphan tasks
  verbLabel: string       // Max 12 chars
  taskBody: string
  timeEstimate: number    // Minutes
  feedLevel: FeedLevel
  scheduledFor?: string   // ISO date
  timeOfDay?: TimeOfDay
  status: TaskStatus
  deferredUntil?: string
  createdAt: string
  updatedAt: string
  order: number
}

export interface Habit {
  id: string
  verbLabel: string       // Max 12 chars
  habitBody: string
  frequency: HabitFrequency
  customDays?: number[]   // 0-6 for custom frequency
  timeOfDay: TimeOfDay
  feedLevel: FeedLevel
  goalId?: string
  createdAt: string
  lastCompleted?: string
  completionCount: number // Track internally, don't display
}

export interface CompletedTask {
  id: string
  taskId?: string
  habitId?: string
  completedAt: string
  duration: number        // Actual time in minutes
  energyBefore?: EnergyLevel
  energyAfter?: EnergyLevel
  notes?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  tasksCreated?: string[]
}

export interface Conversation {
  id: string
  title: string
  createdAt: string
  lastMessageAt: string
  isArchived: boolean
  messages: ChatMessage[]
}

export interface JournalEntry {
  id: string
  date: string           // YYYY-MM-DD
  content: string
  mood?: 'struggling' | 'okay' | 'good' | 'great'
  createdAt: string
  updatedAt: string
}

export interface Settings {
  notifications: boolean
  dailyReminder: string | null  // Time like "09:00"
  apiKey?: string
  haptics: boolean
  soundEnabled: boolean
  cardBackgroundImage?: string  // Base64 encoded image data
  cardBackgroundBrightness?: 'light' | 'dark' | 'auto'  // How to handle image dimming
  pinnedTaskId?: string  // Task ID to show as current task in Now page
}

export interface OnboardingData {
  completed: boolean
  completedAt?: string
  skippedSteps: string[]
}

export interface WeeklySummary {
  id: string
  weekStartDate: string        // YYYY-MM-DD (Monday of week)
  completedTaskCount: number
  lowEnergyTaskCount: number
  mediumEnergyTaskCount: number
  highEnergyTaskCount: number
  timePerVerbLabel: Record<string, number>  // e.g. { "Deep Work": 120, "Quick Win": 45 }
  moodBreakdown: Record<string, number>     // e.g. { "great": 2, "good": 3, "okay": 1 }
  aiInsight: string            // AI-generated message
  generatedAt: string          // ISO timestamp
  userEnergyPattern?: string   // Optional: detected pattern
}

export interface BurnOutData {
  version: number
  theme: Theme
  user: UserProfile
  goals: Goal[]
  projects: Project[]
  tasks: Task[]
  taskCategories: TaskCategory[]
  habits: Habit[]
  completedTasks: CompletedTask[]
  journalEntries: JournalEntry[]
  chatHistory: ChatMessage[]  // Deprecated - use conversations
  conversations: Conversation[]
  settings: Settings
  onboarding: OnboardingData
  weeklySummaries: WeeklySummary[]  // NEW: AI-powered weekly insights
}
