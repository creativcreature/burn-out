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
    journalEntries: [],
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
  const projectId1 = crypto.randomUUID()
  const projectId2 = crypto.randomUUID()
  const projectId3 = crypto.randomUUID()

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
        createdAt: daysAgo(30),
        updatedAt: daysAgo(5),
        archived: false,
        order: 0
      },
      {
        id: goalId2,
        title: 'Prioritize mental health',
        description: 'Build habits that support my wellbeing and prevent burnout',
        createdAt: daysAgo(30),
        updatedAt: daysAgo(2),
        archived: false,
        order: 1
      },
      {
        id: goalId3,
        title: 'Learn new skills',
        description: 'Stay curious and keep growing professionally',
        createdAt: daysAgo(21),
        updatedAt: daysAgo(7),
        archived: false,
        order: 2
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
      }
    ],
    tasks: [
      {
        id: crypto.randomUUID(),
        verbLabel: 'Deep Work',
        taskBody: 'Finish homepage mockups for portfolio',
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
        taskBody: 'Look over client feedback on logo concepts',
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
      {
        id: crypto.randomUUID(),
        verbLabel: 'Quick Win',
        taskBody: 'Reply to 3 emails in inbox',
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
        verbLabel: 'Research',
        taskBody: 'Find inspiration for coffee shop color palette',
        timeEstimate: 25,
        feedLevel: 'medium',
        goalId: goalId1,
        projectId: projectId2,
        timeOfDay: 'anytime',
        status: 'pending',
        createdAt: today,
        updatedAt: today,
        order: 3
      },
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
        taskBody: 'Watch 2 videos from Figma course',
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
      {
        id: crypto.randomUUID(),
        verbLabel: 'Create',
        taskBody: 'Draft social media post about recent work',
        timeEstimate: 20,
        feedLevel: 'medium',
        goalId: goalId1,
        timeOfDay: 'anytime',
        status: 'pending',
        createdAt: daysAgo(3),
        updatedAt: daysAgo(3),
        order: 6
      },
      {
        id: crypto.randomUUID(),
        verbLabel: 'Organize',
        taskBody: 'Clean up project files and folders',
        timeEstimate: 20,
        feedLevel: 'low',
        timeOfDay: 'evening',
        status: 'pending',
        createdAt: daysAgo(4),
        updatedAt: daysAgo(4),
        order: 7
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
      }
    ],
    completedTasks,
    journalEntries,
    chatHistory: [],
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
    }
  }
}

export async function seedSampleData(): Promise<void> {
  const sampleData = createSampleData()
  await set(STORAGE_KEY, sampleData)
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
