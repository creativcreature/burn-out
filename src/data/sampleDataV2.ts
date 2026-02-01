/**
 * Expanded Sample Data for BurnOut App
 * 73 realistic tasks across 6 goals
 * 
 * Usage: Import and call loadSampleData() on first app launch
 */

import type { Goal, Task } from './types'

// Generate unique IDs
const genId = () => Math.random().toString(36).substring(2, 15)

export const sampleGoals: Goal[] = [
  {
    id: 'goal-startup',
    title: 'Launch Startup MVP',
    description: 'Get the product to market',
    timeframe: '3m',
    isActive: true,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false
  },
  {
    id: 'goal-health',
    title: 'Get Healthier',
    description: 'Improve physical and mental wellbeing',
    timeframe: '1y',
    isActive: true,
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false
  },
  {
    id: 'goal-finance',
    title: 'Financial Freedom',
    description: 'Build wealth and security',
    timeframe: '5y',
    isActive: true,
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false
  },
  {
    id: 'goal-spanish',
    title: 'Learn Spanish',
    description: 'Become conversational',
    timeframe: '1y',
    isActive: true,
    order: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false
  },
  {
    id: 'goal-relationships',
    title: 'Strengthen Relationships',
    description: 'Invest in people I care about',
    timeframe: '1y',
    isActive: true,
    order: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false
  },
  {
    id: 'goal-home',
    title: 'Home Improvement',
    description: 'Make the house better',
    timeframe: '6m',
    isActive: false,
    order: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false
  }
]

// Helper to create a task with defaults
type SampleTask = {
  goalId?: string
  verbLabel: string
  taskBody: string
  timeEstimate: number
  feedLevel: 'low' | 'medium' | 'high'
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'anytime'
  scheduledFor?: string
}

const makeTasks = (tasks: SampleTask[]): Omit<Task, 'id' | 'createdAt'>[] =>
  tasks.map((t, i) => ({
    ...t,
    status: 'pending' as const,
    updatedAt: new Date().toISOString(),
    order: i + 1
  }))

export const sampleTasks: Omit<Task, 'id' | 'createdAt'>[] = makeTasks([
  // 🚀 Launch Startup MVP (15 tasks)
  { goalId: 'goal-startup', verbLabel: 'Fix', taskBody: 'production bug in auth flow', timeEstimate: 60, feedLevel: 'high', timeOfDay: 'morning' },
  { goalId: 'goal-startup', verbLabel: 'Review', taskBody: 'PR from contractor', timeEstimate: 30, feedLevel: 'medium', timeOfDay: 'anytime' },
  { goalId: 'goal-startup', verbLabel: 'Write', taskBody: 'API documentation', timeEstimate: 120, feedLevel: 'high', timeOfDay: 'morning' },
  { goalId: 'goal-startup', verbLabel: 'Set up', taskBody: 'error monitoring (Sentry)', timeEstimate: 45, feedLevel: 'medium', timeOfDay: 'anytime' },
  { goalId: 'goal-startup', verbLabel: 'Design', taskBody: 'onboarding flow mockups', timeEstimate: 90, feedLevel: 'high', timeOfDay: 'morning' },
  { goalId: 'goal-startup', verbLabel: 'Interview', taskBody: '3 potential users', timeEstimate: 60, feedLevel: 'high', timeOfDay: 'afternoon' },
  { goalId: 'goal-startup', verbLabel: 'Set up', taskBody: 'analytics (Mixpanel)', timeEstimate: 45, feedLevel: 'medium', timeOfDay: 'anytime' },
  { goalId: 'goal-startup', verbLabel: 'Create', taskBody: 'investor pitch deck', timeEstimate: 180, feedLevel: 'high', timeOfDay: 'morning' },
  { goalId: 'goal-startup', verbLabel: 'Research', taskBody: 'competitors', timeEstimate: 60, feedLevel: 'medium', timeOfDay: 'anytime' },
  { goalId: 'goal-startup', verbLabel: 'Write', taskBody: 'landing page copy', timeEstimate: 90, feedLevel: 'high', timeOfDay: 'morning' },
  { goalId: 'goal-startup', verbLabel: 'Set up', taskBody: 'Stripe payments', timeEstimate: 120, feedLevel: 'high', timeOfDay: 'morning' },
  { goalId: 'goal-startup', verbLabel: 'Create', taskBody: 'demo video', timeEstimate: 180, feedLevel: 'high', timeOfDay: 'afternoon' },
  { goalId: 'goal-startup', verbLabel: 'Submit', taskBody: 'to Product Hunt', timeEstimate: 30, feedLevel: 'low', timeOfDay: 'anytime' },
  { goalId: 'goal-startup', verbLabel: 'Reach out', taskBody: 'to 10 beta users', timeEstimate: 45, feedLevel: 'medium', timeOfDay: 'afternoon' },
  { goalId: 'goal-startup', verbLabel: 'Set up', taskBody: 'customer support', timeEstimate: 60, feedLevel: 'medium', timeOfDay: 'anytime' },

  // 💪 Get Healthier (12 tasks)
  { goalId: 'goal-health', verbLabel: 'Walk', taskBody: 'Morning (30 min)', timeEstimate: 30, feedLevel: 'low', timeOfDay: 'morning' },
  { goalId: 'goal-health', verbLabel: 'Prep', taskBody: 'meals for the week', timeEstimate: 120, feedLevel: 'medium', timeOfDay: 'afternoon' },
  { goalId: 'goal-health', verbLabel: 'Book', taskBody: 'annual physical', timeEstimate: 15, feedLevel: 'low', timeOfDay: 'anytime' },
  { goalId: 'goal-health', verbLabel: 'Research', taskBody: 'gym memberships', timeEstimate: 30, feedLevel: 'low', timeOfDay: 'anytime' },
  { goalId: 'goal-health', verbLabel: 'Buy', taskBody: 'new running shoes', timeEstimate: 45, feedLevel: 'low', timeOfDay: 'anytime' },
  { goalId: 'goal-health', verbLabel: 'Schedule', taskBody: 'dentist appointment', timeEstimate: 10, feedLevel: 'low', timeOfDay: 'anytime' },
  { goalId: 'goal-health', verbLabel: 'Try', taskBody: 'new healthy recipe', timeEstimate: 60, feedLevel: 'medium', timeOfDay: 'evening' },
  { goalId: 'goal-health', verbLabel: 'Meditate', taskBody: '10 minutes', timeEstimate: 10, feedLevel: 'low', timeOfDay: 'morning' },
  { goalId: 'goal-health', verbLabel: 'Drink', taskBody: '8 glasses of water', timeEstimate: 5, feedLevel: 'low', timeOfDay: 'anytime' },
  { goalId: 'goal-health', verbLabel: 'Avoid', taskBody: 'screens after 10pm', timeEstimate: 5, feedLevel: 'low', timeOfDay: 'evening' },
  { goalId: 'goal-health', verbLabel: 'Get', taskBody: 'blood work done', timeEstimate: 60, feedLevel: 'low', timeOfDay: 'morning' },
  { goalId: 'goal-health', verbLabel: 'Research', taskBody: 'sleep tracking apps', timeEstimate: 20, feedLevel: 'low', timeOfDay: 'anytime' },

  // 💰 Financial Freedom (10 tasks)
  { goalId: 'goal-finance', verbLabel: 'Review', taskBody: 'monthly budget', timeEstimate: 30, feedLevel: 'medium', timeOfDay: 'morning' },
  { goalId: 'goal-finance', verbLabel: 'Max out', taskBody: 'Roth IRA contribution', timeEstimate: 20, feedLevel: 'low', timeOfDay: 'anytime' },
  { goalId: 'goal-finance', verbLabel: 'Rebalance', taskBody: 'investment portfolio', timeEstimate: 45, feedLevel: 'medium', timeOfDay: 'morning' },
  { goalId: 'goal-finance', verbLabel: 'Cancel', taskBody: 'unused subscriptions', timeEstimate: 30, feedLevel: 'low', timeOfDay: 'anytime' },
  { goalId: 'goal-finance', verbLabel: 'Research', taskBody: 'high-yield savings accounts', timeEstimate: 20, feedLevel: 'low', timeOfDay: 'anytime' },
  { goalId: 'goal-finance', verbLabel: 'Set up', taskBody: 'automatic transfers to savings', timeEstimate: 15, feedLevel: 'low', timeOfDay: 'anytime' },
  { goalId: 'goal-finance', verbLabel: 'Review', taskBody: 'credit card rewards', timeEstimate: 20, feedLevel: 'low', timeOfDay: 'anytime' },
  { goalId: 'goal-finance', verbLabel: 'Update', taskBody: 'beneficiaries on accounts', timeEstimate: 30, feedLevel: 'low', timeOfDay: 'anytime' },
  { goalId: 'goal-finance', verbLabel: 'Build', taskBody: '3-month emergency fund', timeEstimate: 0, feedLevel: 'low', timeOfDay: 'anytime' },
  { goalId: 'goal-finance', verbLabel: 'Meet', taskBody: 'with financial advisor', timeEstimate: 60, feedLevel: 'medium', timeOfDay: 'afternoon' },

  // 🇪🇸 Learn Spanish (8 tasks)
  { goalId: 'goal-spanish', verbLabel: 'Complete', taskBody: 'Duolingo lesson', timeEstimate: 15, feedLevel: 'low', timeOfDay: 'anytime' },
  { goalId: 'goal-spanish', verbLabel: 'Watch', taskBody: 'Spanish show with subtitles', timeEstimate: 45, feedLevel: 'low', timeOfDay: 'evening' },
  { goalId: 'goal-spanish', verbLabel: 'Book', taskBody: 'iTalki tutor session', timeEstimate: 10, feedLevel: 'low', timeOfDay: 'anytime' },
  { goalId: 'goal-spanish', verbLabel: 'Review', taskBody: '50 flashcards', timeEstimate: 15, feedLevel: 'low', timeOfDay: 'anytime' },
  { goalId: 'goal-spanish', verbLabel: 'Listen', taskBody: 'Spanish podcast on commute', timeEstimate: 30, feedLevel: 'low', timeOfDay: 'morning' },
  { goalId: 'goal-spanish', verbLabel: 'Write', taskBody: 'journal entry in Spanish', timeEstimate: 20, feedLevel: 'medium', timeOfDay: 'evening' },
  { goalId: 'goal-spanish', verbLabel: 'Join', taskBody: 'Spanish conversation group', timeEstimate: 60, feedLevel: 'high', timeOfDay: 'evening' },
  { goalId: 'goal-spanish', verbLabel: 'Change', taskBody: 'phone language to Spanish', timeEstimate: 5, feedLevel: 'low', timeOfDay: 'anytime' },

  // ❤️ Relationships (10 tasks)
  { goalId: 'goal-relationships', verbLabel: 'Call', taskBody: 'mom', timeEstimate: 30, feedLevel: 'low', timeOfDay: 'evening' },
  { goalId: 'goal-relationships', verbLabel: 'Plan', taskBody: 'date night', timeEstimate: 20, feedLevel: 'low', timeOfDay: 'anytime' },
  { goalId: 'goal-relationships', verbLabel: 'Send', taskBody: 'birthday card to uncle', timeEstimate: 15, feedLevel: 'low', timeOfDay: 'anytime' },
  { goalId: 'goal-relationships', verbLabel: 'Organize', taskBody: 'dinner with college friends', timeEstimate: 30, feedLevel: 'medium', timeOfDay: 'anytime' },
  { goalId: 'goal-relationships', verbLabel: 'Reply', taskBody: 'to Sarah\'s text', timeEstimate: 5, feedLevel: 'low', timeOfDay: 'anytime' },
  { goalId: 'goal-relationships', verbLabel: 'Buy', taskBody: 'anniversary gift', timeEstimate: 45, feedLevel: 'medium', timeOfDay: 'anytime' },
  { goalId: 'goal-relationships', verbLabel: 'Schedule', taskBody: 'coffee with mentor', timeEstimate: 10, feedLevel: 'low', timeOfDay: 'anytime' },
  { goalId: 'goal-relationships', verbLabel: 'Write', taskBody: 'thank you note to boss', timeEstimate: 15, feedLevel: 'low', timeOfDay: 'anytime' },
  { goalId: 'goal-relationships', verbLabel: 'Plan', taskBody: 'weekend trip with partner', timeEstimate: 60, feedLevel: 'medium', timeOfDay: 'evening' },
  { goalId: 'goal-relationships', verbLabel: 'Attend', taskBody: 'nephew\'s soccer game', timeEstimate: 120, feedLevel: 'low', timeOfDay: 'afternoon' },

  // 🏠 Home Improvement (8 tasks)
  { goalId: 'goal-home', verbLabel: 'Fix', taskBody: 'leaky faucet', timeEstimate: 45, feedLevel: 'medium', timeOfDay: 'afternoon' },
  { goalId: 'goal-home', verbLabel: 'Organize', taskBody: 'garage', timeEstimate: 180, feedLevel: 'high', timeOfDay: 'morning' },
  { goalId: 'goal-home', verbLabel: 'Get', taskBody: 'quotes for new windows', timeEstimate: 60, feedLevel: 'medium', timeOfDay: 'anytime' },
  { goalId: 'goal-home', verbLabel: 'Clean', taskBody: 'kitchen deeply', timeEstimate: 90, feedLevel: 'medium', timeOfDay: 'morning' },
  { goalId: 'goal-home', verbLabel: 'Replace', taskBody: 'smoke detector batteries', timeEstimate: 15, feedLevel: 'low', timeOfDay: 'anytime' },
  { goalId: 'goal-home', verbLabel: 'Research', taskBody: 'smart thermostat options', timeEstimate: 30, feedLevel: 'low', timeOfDay: 'anytime' },
  { goalId: 'goal-home', verbLabel: 'Declutter', taskBody: 'closet', timeEstimate: 60, feedLevel: 'medium', timeOfDay: 'afternoon' },
  { goalId: 'goal-home', verbLabel: 'Fix', taskBody: 'squeaky door', timeEstimate: 15, feedLevel: 'low', timeOfDay: 'anytime' },

  // 📥 Inbox - no goal (10 tasks)
  { verbLabel: 'Return', taskBody: 'Amazon package', timeEstimate: 30, feedLevel: 'low', timeOfDay: 'anytime' },
  { verbLabel: 'Renew', taskBody: 'car registration', timeEstimate: 20, feedLevel: 'low', timeOfDay: 'anytime' },
  { verbLabel: 'Pick up', taskBody: 'dry cleaning', timeEstimate: 15, feedLevel: 'low', timeOfDay: 'anytime' },
  { verbLabel: 'Research', taskBody: 'new laptop options', timeEstimate: 45, feedLevel: 'low', timeOfDay: 'anytime' },
  { verbLabel: 'Update', taskBody: 'LinkedIn profile', timeEstimate: 30, feedLevel: 'low', timeOfDay: 'anytime' },
  { verbLabel: 'Cancel', taskBody: 'free trial before charge', timeEstimate: 5, feedLevel: 'low', timeOfDay: 'anytime' },
  { verbLabel: 'RSVP', taskBody: 'to wedding', timeEstimate: 10, feedLevel: 'low', timeOfDay: 'anytime' },
  { verbLabel: 'Get', taskBody: 'passport renewed', timeEstimate: 60, feedLevel: 'medium', timeOfDay: 'morning' },
  { verbLabel: 'Schedule', taskBody: 'car oil change', timeEstimate: 10, feedLevel: 'low', timeOfDay: 'anytime' },
  { verbLabel: 'Buy', taskBody: 'concert tickets', timeEstimate: 15, feedLevel: 'low', timeOfDay: 'anytime' }
])

/**
 * Load sample data into the app
 * Call this on first launch if no existing data
 */
export function createSampleData(): { goals: Goal[]; tasks: Task[] } {
  const now = new Date().toISOString()
  
  const tasks: Task[] = sampleTasks.map((t) => ({
    ...t,
    id: genId(),
    createdAt: now
  }))
  
  return {
    goals: sampleGoals,
    tasks
  }
}
