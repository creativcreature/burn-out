import { get, set } from 'idb-keyval'
import type { BurnOutData, Theme, WeeklySummary, CompletedTask, JournalEntry } from '../data/types'
import { STORAGE_KEY, CURRENT_VERSION } from '../data/constants'
import { createSampleData as createExpandedSampleData } from '../data/sampleDataV2'

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
    taskCategories: [],
    habits: [],
    completedTasks: [],
    journalEntries: [],
    chatHistory: [],
    conversations: [],
    settings: {
      notifications: false,
      dailyReminder: null,
      haptics: true,
      soundEnabled: true
    },
    onboarding: {
      completed: false,
      skippedSteps: []
    },
    weeklySummaries: []  // NEW: AI-powered weekly insights
  }
}

// Sample data for testing - "Alex" persona (neurodivergent creative professional)
// Includes a full month of activity data
export function createSampleData(): BurnOutData {
  const now = new Date()
  const today = now.toISOString().split('T')[0]

  // Helper to get date string N days ago
  const daysAgo = (n: number): string => {
    const d = new Date(now.getTime() - n * 86400000)
    return d.toISOString().split('T')[0]
  }

  const goalId1 = crypto.randomUUID()
  const goalId2 = crypto.randomUUID()
  const goalId3 = crypto.randomUUID()
  const goalId4 = crypto.randomUUID()
  const projectId1 = crypto.randomUUID()
  const projectId2 = crypto.randomUUID()
  const projectId3 = crypto.randomUUID()
  const projectId4 = crypto.randomUUID()
  const projectId5 = crypto.randomUUID()
  const projectId6 = crypto.randomUUID()

  // Generate completed tasks for the past month (varied per day)
  const completedTasks: BurnOutData['completedTasks'] = []
  const taskNotes = [
    'Felt good about this one',
    'Took longer than expected but got it done',
    'Quick win!',
    'Had to push through but finished',
    'Was in the zone today',
    'Easier than I thought',
    '',
    '',
    ''
  ]

  for (let day = 1; day <= 30; day++) {
    const date = daysAgo(day)
    // Vary tasks per day (0-5, with some rest days)
    const dayOfWeek = new Date(date).getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const tasksThisDay = isWeekend
      ? Math.floor(Math.random() * 2) // 0-1 on weekends
      : Math.floor(Math.random() * 4) + 1 // 1-4 on weekdays

    for (let t = 0; t < tasksThisDay; t++) {
      const hour = 9 + Math.floor(Math.random() * 9) // 9am - 5pm
      completedTasks.push({
        id: crypto.randomUUID(),
        completedAt: `${date}T${hour.toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00`,
        duration: [10, 15, 20, 25, 30, 45, 60][Math.floor(Math.random() * 7)],
        notes: taskNotes[Math.floor(Math.random() * taskNotes.length)] || undefined
      })
    }
  }

  // Generate journal entries for the past month (not every day)
  const journalEntries: BurnOutData['journalEntries'] = []
  const journalContent = [
    { mood: 'great' as const, text: 'Had an amazing day! Everything clicked and I got so much done without feeling drained.' },
    { mood: 'good' as const, text: 'Solid day. Made progress on the portfolio and had a nice lunch break outside.' },
    { mood: 'good' as const, text: 'Client call went well. They loved the direction we\'re going. Feeling confident.' },
    { mood: 'okay' as const, text: 'Bit of a slow start but managed to get moving after lunch. Tomorrow will be better.' },
    { mood: 'okay' as const, text: 'Energy was low today. Did what I could and that\'s enough. Rest is productive too.' },
    { mood: 'okay' as const, text: 'Mixed feelings about the day. Got some things done but felt scattered.' },
    { mood: 'struggling' as const, text: 'Rough day. Brain fog was real. Just focused on the basics and called it early.' },
    { mood: 'struggling' as const, text: 'Overwhelmed by everything on my plate. Need to reassess priorities tomorrow.' },
    { mood: 'good' as const, text: 'Morning walk really helped set the tone. Completed 3 tasks before noon!' },
    { mood: 'great' as const, text: 'Finished the homepage design! Huge milestone. Treating myself to something nice.' },
    { mood: 'good' as const, text: 'Steady progress today. Nothing dramatic but consistent effort counts.' },
    { mood: 'okay' as const, text: 'Started strong but hit a wall in the afternoon. Listened to my body and rested.' },
    { mood: 'good' as const, text: 'Had a breakthrough on the client project. Sometimes stepping away helps.' },
    { mood: 'great' as const, text: 'Feeling proud of how far I\'ve come this month. The system is working.' },
    { mood: 'okay' as const, text: 'Distracted day. Lots of small interruptions. Will protect my focus time better.' },
    { mood: 'good' as const, text: 'Batch processed all my emails and admin tasks. Feels so good to have a clear inbox.' },
    { mood: 'struggling' as const, text: 'Anxiety flared up today. Did some breathing exercises and kept tasks small.' },
    { mood: 'good' as const, text: 'Coffee with a fellow freelancer. Good to connect and share experiences.' },
    { mood: 'okay' as const, text: 'Productive morning, crashed in the afternoon. Need to watch my energy patterns.' },
    { mood: 'great' as const, text: 'Client signed off on the final designs! Time to celebrate this win.' }
  ]

  // Add journal entries for ~60% of days
  for (let day = 1; day <= 30; day++) {
    if (Math.random() > 0.4) { // 60% chance of entry
      const date = daysAgo(day)
      const entry = journalContent[Math.floor(Math.random() * journalContent.length)]
      journalEntries.push({
        id: crypto.randomUUID(),
        date,
        content: entry.text,
        mood: entry.mood,
        createdAt: `${date}T21:00:00`,
        updatedAt: `${date}T21:00:00`
      })
    }
  }

  // Sort journal entries by date
  journalEntries.sort((a, b) => a.date.localeCompare(b.date))

  return {
    version: CURRENT_VERSION,
    theme: 'light',
    user: {
      id: crypto.randomUUID(),
      createdAt: daysAgo(30),
      burnoutMode: 'prevention',
      energyDefaults: { morning: 4, afternoon: 3, evening: 2 },
      tonePreference: 'gentle',
      timeAvailability: {
        weekday: [
          { start: '09:00', end: '12:00', label: 'Deep work' },
          { start: '14:00', end: '17:00', label: 'Meetings & tasks' }
        ],
        weekend: [
          { start: '10:00', end: '12:00', label: 'Personal projects' }
        ]
      }
    },
    goals: [
      {
        id: goalId1,
        title: 'Launch freelance design business',
        description: 'Build a sustainable creative business on my own terms',
        timeframe: '1y',
        isActive: true,
        createdAt: daysAgo(30),
        updatedAt: daysAgo(5),
        archived: false,
        order: 0
      },
      {
        id: goalId2,
        title: 'Prioritize mental health',
        description: 'Build habits that support my wellbeing and prevent burnout',
        timeframe: '6m',
        isActive: false,
        createdAt: daysAgo(30),
        updatedAt: daysAgo(2),
        archived: false,
        order: 1
      },
      {
        id: goalId3,
        title: 'Learn new skills',
        description: 'Stay curious and keep growing professionally',
        timeframe: '3m',
        isActive: false,
        createdAt: daysAgo(21),
        updatedAt: daysAgo(7),
        archived: false,
        order: 2
      },
      {
        id: goalId4,
        title: 'Build better relationships',
        description: 'Nurture connections with friends, family, and community',
        timeframe: '6m',
        isActive: false,
        createdAt: daysAgo(15),
        updatedAt: daysAgo(3),
        archived: false,
        order: 3
      }
    ],
    projects: [
      {
        id: projectId1,
        goalId: goalId1,
        title: 'Portfolio website',
        description: 'Design and build my portfolio site',
        status: 'active',
        createdAt: daysAgo(28),
        updatedAt: daysAgo(1),
        order: 0
      },
      {
        id: projectId2,
        goalId: goalId1,
        title: 'Coffee shop branding',
        description: 'Complete branding package for local coffee shop client',
        status: 'active',
        createdAt: daysAgo(14),
        updatedAt: daysAgo(1),
        order: 1
      },
      {
        id: projectId3,
        goalId: goalId3,
        title: 'Figma advanced course',
        description: 'Complete the advanced prototyping course',
        status: 'active',
        createdAt: daysAgo(21),
        updatedAt: daysAgo(3),
        order: 2
      },
      {
        id: projectId4,
        goalId: goalId2,
        title: 'Sleep optimization',
        description: 'Improve sleep quality and establish better bedtime routine',
        status: 'active',
        createdAt: daysAgo(10),
        updatedAt: daysAgo(2),
        order: 3
      },
      {
        id: projectId5,
        goalId: goalId4,
        title: 'Monthly dinners',
        description: 'Organize monthly dinner gatherings with close friends',
        status: 'active',
        createdAt: daysAgo(7),
        updatedAt: daysAgo(1),
        order: 4
      },
      {
        id: projectId6,
        goalId: goalId1,
        title: 'Tech startup pitch deck',
        description: 'Design presentation for new tech client',
        status: 'active',
        createdAt: daysAgo(5),
        updatedAt: daysAgo(1),
        order: 5
      }
    ],
    tasks: [
      // High-energy creative work
      {
        id: crypto.randomUUID(),
        verbLabel: 'Design',
        taskBody: 'Finish homepage mockups',
        timeEstimate: 45,
        feedLevel: 'high',
        goalId: goalId1,
        projectId: projectId1,
        timeOfDay: 'morning',
        status: 'pending',
        createdAt: daysAgo(1),
        updatedAt: daysAgo(1),
        order: 0
      },
      {
        id: crypto.randomUUID(),
        verbLabel: 'Review',
        taskBody: 'Client feedback on logo concepts',
        timeEstimate: 20,
        feedLevel: 'medium',
        goalId: goalId1,
        projectId: projectId2,
        timeOfDay: 'afternoon',
        status: 'pending',
        createdAt: daysAgo(1),
        updatedAt: daysAgo(1),
        order: 1
      },
      // Quick wins (low energy)
      {
        id: crypto.randomUUID(),
        verbLabel: 'Reply',
        taskBody: 'Answer 3 emails in inbox',
        timeEstimate: 10,
        feedLevel: 'low',
        timeOfDay: 'anytime',
        status: 'pending',
        createdAt: today,
        updatedAt: today,
        order: 2
      },
      {
        id: crypto.randomUUID(),
        verbLabel: 'Call',
        taskBody: 'Schedule dentist appointment',
        timeEstimate: 10,
        feedLevel: 'low',
        timeOfDay: 'morning',
        status: 'pending',
        createdAt: today,
        updatedAt: today,
        order: 3
      },
      // Medium energy tasks
      {
        id: crypto.randomUUID(),
        verbLabel: 'Plan',
        taskBody: 'Map out next week priorities',
        timeEstimate: 15,
        feedLevel: 'medium',
        timeOfDay: 'evening',
        status: 'pending',
        createdAt: today,
        updatedAt: today,
        order: 4
      },
      {
        id: crypto.randomUUID(),
        verbLabel: 'Learn',
        taskBody: 'Watch Figma course video',
        timeEstimate: 30,
        feedLevel: 'medium',
        goalId: goalId3,
        projectId: projectId3,
        timeOfDay: 'afternoon',
        status: 'pending',
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2),
        order: 5
      },
      // Health & wellness
      {
        id: crypto.randomUUID(),
        verbLabel: 'Move',
        taskBody: '20 minute yoga session',
        timeEstimate: 25,
        feedLevel: 'medium',
        goalId: goalId2,
        timeOfDay: 'morning',
        status: 'pending',
        createdAt: today,
        updatedAt: today,
        order: 6
      },
      {
        id: crypto.randomUUID(),
        verbLabel: 'Rest',
        taskBody: 'Take a proper lunch break',
        timeEstimate: 30,
        feedLevel: 'low',
        goalId: goalId2,
        timeOfDay: 'afternoon',
        status: 'pending',
        createdAt: today,
        updatedAt: today,
        order: 7
      },
      // Social
      {
        id: crypto.randomUUID(),
        verbLabel: 'Connect',
        taskBody: 'Text mom to check in',
        timeEstimate: 10,
        feedLevel: 'low',
        goalId: goalId4,
        timeOfDay: 'anytime',
        status: 'pending',
        createdAt: today,
        updatedAt: today,
        order: 8
      },
      // Admin
      {
        id: crypto.randomUUID(),
        verbLabel: 'Invoice',
        taskBody: 'Send invoice to coffee shop client',
        timeEstimate: 15,
        feedLevel: 'medium',
        goalId: goalId1,
        projectId: projectId2,
        timeOfDay: 'morning',
        status: 'pending',
        createdAt: today,
        updatedAt: today,
        order: 9
      },
      // More creative
      {
        id: crypto.randomUUID(),
        verbLabel: 'Create',
        taskBody: 'Draft social media post',
        timeEstimate: 20,
        feedLevel: 'medium',
        goalId: goalId1,
        timeOfDay: 'anytime',
        status: 'pending',
        createdAt: daysAgo(3),
        updatedAt: daysAgo(3),
        order: 10
      },
      {
        id: crypto.randomUUID(),
        verbLabel: 'Read',
        taskBody: 'Finish design book chapter',
        timeEstimate: 30,
        feedLevel: 'low',
        goalId: goalId3,
        timeOfDay: 'evening',
        status: 'pending',
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2),
        order: 11
      }
    ],
    habits: [
      {
        id: crypto.randomUUID(),
        verbLabel: 'Morning Move',
        habitBody: '10 min stretch or short walk',
        frequency: 'daily',
        timeOfDay: 'morning',
        feedLevel: 'low',
        goalId: goalId2,
        createdAt: daysAgo(30),
        completionCount: 22
      },
      {
        id: crypto.randomUUID(),
        verbLabel: 'Hydrate',
        habitBody: 'Drink a full glass of water',
        frequency: 'daily',
        timeOfDay: 'morning',
        feedLevel: 'low',
        goalId: goalId2,
        createdAt: daysAgo(30),
        completionCount: 28
      },
      {
        id: crypto.randomUUID(),
        verbLabel: 'Wind Down',
        habitBody: 'No screens 30 min before bed',
        frequency: 'daily',
        timeOfDay: 'evening',
        feedLevel: 'low',
        goalId: goalId2,
        createdAt: daysAgo(21),
        completionCount: 12
      },
      {
        id: crypto.randomUUID(),
        verbLabel: 'Check In',
        habitBody: 'Quick journal entry or mood check',
        frequency: 'daily',
        timeOfDay: 'evening',
        feedLevel: 'low',
        goalId: goalId2,
        createdAt: daysAgo(14),
        completionCount: 9
      },
      {
        id: crypto.randomUUID(),
        verbLabel: 'Breathe',
        habitBody: '5 minutes of deep breathing',
        frequency: 'daily',
        timeOfDay: 'morning',
        feedLevel: 'low',
        goalId: goalId2,
        createdAt: daysAgo(20),
        completionCount: 15
      },
      {
        id: crypto.randomUUID(),
        verbLabel: 'Tidy Up',
        habitBody: '10 minute desk cleanup',
        frequency: 'daily',
        timeOfDay: 'evening',
        feedLevel: 'low',
        goalId: goalId2,
        createdAt: daysAgo(25),
        completionCount: 18
      },
      {
        id: crypto.randomUUID(),
        verbLabel: 'Step Out',
        habitBody: 'Get outside for fresh air',
        frequency: 'daily',
        timeOfDay: 'afternoon',
        feedLevel: 'low',
        goalId: goalId2,
        createdAt: daysAgo(18),
        completionCount: 14
      },
      {
        id: crypto.randomUUID(),
        verbLabel: 'Review',
        habitBody: 'Check tomorrow calendar',
        frequency: 'daily',
        timeOfDay: 'evening',
        feedLevel: 'low',
        createdAt: daysAgo(12),
        completionCount: 10
      },
      {
        id: crypto.randomUUID(),
        verbLabel: 'Learn',
        habitBody: 'Read for 15 minutes',
        frequency: 'daily',
        timeOfDay: 'evening',
        feedLevel: 'low',
        goalId: goalId3,
        createdAt: daysAgo(28),
        completionCount: 20
      },
      {
        id: crypto.randomUUID(),
        verbLabel: 'Gratitude',
        habitBody: 'Write 3 things I am grateful for',
        frequency: 'daily',
        timeOfDay: 'evening',
        feedLevel: 'low',
        goalId: goalId2,
        createdAt: daysAgo(10),
        completionCount: 7
      },
      {
        id: crypto.randomUUID(),
        verbLabel: 'Reach Out',
        habitBody: 'Message one friend or family member',
        frequency: 'weekly',
        timeOfDay: 'anytime',
        feedLevel: 'low',
        goalId: goalId4,
        createdAt: daysAgo(8),
        completionCount: 3
      },
      {
        id: crypto.randomUUID(),
        verbLabel: 'Plan Week',
        habitBody: 'Review and plan the week ahead',
        frequency: 'weekly',
        timeOfDay: 'morning',
        feedLevel: 'medium',
        createdAt: daysAgo(30),
        completionCount: 4
      }
    ],
    taskCategories: [
      { id: crypto.randomUUID(), name: 'Errands', isSystem: true, createdAt: daysAgo(30) },
      { id: crypto.randomUUID(), name: 'Health', isSystem: true, createdAt: daysAgo(30) },
      { id: crypto.randomUUID(), name: 'Admin', isSystem: true, createdAt: daysAgo(30) }
    ],
    completedTasks,
    journalEntries,
    chatHistory: [],
    conversations: [],
    settings: {
      notifications: true,
      dailyReminder: '09:00',
      haptics: true,
      soundEnabled: true
    },
    onboarding: {
      completed: true,
      completedAt: daysAgo(30),
      skippedSteps: []
    },
    weeklySummaries: []  // Will be populated by AI insights
  }
}

export async function seedSampleData(): Promise<void> {
  const baseData = createSampleData()
  const expandedData = createExpandedSampleData()
  
  // Merge expanded goals and tasks (73 realistic tasks)
  const mergedData: BurnOutData = {
    ...baseData,
    goals: expandedData.goals,
    tasks: expandedData.tasks
  }
  
  await set(STORAGE_KEY, mergedData)
}

function migrateIfNeeded(data: BurnOutData): BurnOutData {
  if (data.version === CURRENT_VERSION) {
    return data
  }

  // Migration from v1 to v2: Add parentProjectId support
  // Projects already support undefined parentProjectId, no data changes needed
  if (data.version < 2) {
    data = { ...data, version: 2 }
  }

  // Migration to v3: Add goal timeframe, isActive and taskCategories
  if (data.version < 3) {
    // Add new fields to existing goals
    const migratedGoals = data.goals.map((goal, index) => ({
      ...goal,
      timeframe: goal.timeframe || '1y' as const,
      isActive: index === 0 // First goal becomes active
    }))

    // Add taskCategories if not present
    const taskCategories = data.taskCategories || []

    data = {
      ...data,
      goals: migratedGoals,
      taskCategories,
      version: 3
    }
  }

  // Migration to v4: Add conversations
  if (data.version < 4) {
    // Migrate existing chatHistory to a conversation if there are messages
    const conversations: BurnOutData['conversations'] = []
    if (data.chatHistory && data.chatHistory.length > 0) {
      const firstMessageTime = data.chatHistory[0]?.timestamp || new Date().toISOString()
      const lastMessageTime = data.chatHistory[data.chatHistory.length - 1]?.timestamp || new Date().toISOString()

      // Generate title from first user message
      const firstUserMessage = data.chatHistory.find(m => m.role === 'user')
      const title = firstUserMessage
        ? firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
        : 'Previous conversation'

      conversations.push({
        id: crypto.randomUUID(),
        title,
        createdAt: firstMessageTime,
        lastMessageAt: lastMessageTime,
        isArchived: false,
        messages: data.chatHistory
      })
    }

    data = {
      ...data,
      conversations,
      version: 4
    }
  }

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

export async function getPinnedTaskId(): Promise<string | undefined> {
  const data = await getData()
  return data.settings.pinnedTaskId
}

export async function setPinnedTaskId(taskId: string | undefined): Promise<void> {
  await updateData(data => ({
    ...data,
    settings: { ...data.settings, pinnedTaskId: taskId }
  }))
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

/**
 * Get data for the last week (7 days) for weekly summary generation
 */
export async function getLastWeekData(): Promise<{
  completedTasks: CompletedTask[]
  journalEntries: JournalEntry[]
}> {
  const data = await getData()
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  
  const completedTasks = data.completedTasks.filter(task => {
    const taskDate = new Date(task.completedAt)
    return taskDate >= oneWeekAgo
  })
  
  const journalEntries = data.journalEntries.filter(entry => {
    const entryDate = new Date(entry.date)
    return entryDate >= oneWeekAgo
  })
  
  return { completedTasks, journalEntries }
}

/**
 * Get existing weekly summary for a specific week start date
 */
export async function getWeeklySummary(weekStartDate: string): Promise<WeeklySummary | null> {
  const data = await getData()
  return data.weeklySummaries.find(summary => summary.weekStartDate === weekStartDate) || null
}

/**
 * Save a new weekly summary
 */
export async function saveWeeklySummary(summary: WeeklySummary): Promise<void> {
  const data = await getData()
  
  // Remove existing summary for the same week if it exists
  data.weeklySummaries = data.weeklySummaries.filter(
    existing => existing.weekStartDate !== summary.weekStartDate
  )
  
  // Add the new summary
  data.weeklySummaries.push(summary)
  
  // Keep only the last 12 weeks of summaries (3 months)
  data.weeklySummaries.sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate))
  data.weeklySummaries = data.weeklySummaries.slice(0, 12)
  
  await saveData(data)
}

/**
 * Add or update a journal entry (thought/reflection)
 * If date is provided, will update existing entry for that date or create new
 */
export async function addJournalEntry(
  content: string, 
  date?: string,
  mood?: 'struggling' | 'okay' | 'good' | 'great'
): Promise<JournalEntry> {
  const data = await getData()
  const now = new Date()
  const entryDate = date || now.toISOString().split('T')[0]
  
  // Check if entry exists for this date
  const existingIndex = data.journalEntries.findIndex(e => e.date === entryDate)
  
  if (existingIndex >= 0) {
    // Update existing entry
    data.journalEntries[existingIndex] = {
      ...data.journalEntries[existingIndex],
      content,
      mood: mood || data.journalEntries[existingIndex].mood,
      updatedAt: now.toISOString()
    }
    await saveData(data)
    return data.journalEntries[existingIndex]
  }
  
  // Create new entry
  const entry: JournalEntry = {
    id: crypto.randomUUID(),
    date: entryDate,
    content,
    mood,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  }
  
  data.journalEntries.push(entry)
  await saveData(data)
  return entry
}

/**
 * Get recent journal entries
 */
export async function getRecentJournalEntries(limit = 10): Promise<JournalEntry[]> {
  const data = await getData()
  return data.journalEntries
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
}

/**
 * Get journal entry by specific date (YYYY-MM-DD format)
 */
export async function getJournalEntryByDate(date: string): Promise<JournalEntry | null> {
  const data = await getData()
  return data.journalEntries.find(e => e.date === date) || null
}

/**
 * Calculate the Monday of the current week in YYYY-MM-DD format
 */
export function getCurrentWeekStartDate(): string {
  const today = new Date()
  const monday = new Date(today)
  const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, ...
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convert to Monday-based week
  monday.setDate(today.getDate() - daysToSubtract)
  return monday.toISOString().split('T')[0]
}
