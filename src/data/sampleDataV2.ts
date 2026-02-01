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
    rank: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'goal-health',
    title: 'Get Healthier',
    description: 'Improve physical and mental wellbeing',
    timeframe: '1y',
    isActive: true,
    rank: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'goal-finance',
    title: 'Financial Freedom',
    description: 'Build wealth and security',
    timeframe: '5y',
    isActive: true,
    rank: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'goal-spanish',
    title: 'Learn Spanish',
    description: 'Become conversational',
    timeframe: '1y',
    isActive: true,
    rank: 4,
    createdAt: new Date().toISOString()
  },
  {
    id: 'goal-relationships',
    title: 'Strengthen Relationships',
    description: 'Invest in people I care about',
    timeframe: 'ongoing',
    isActive: true,
    rank: 5,
    createdAt: new Date().toISOString()
  },
  {
    id: 'goal-home',
    title: 'Home Improvement',
    description: 'Make the house better',
    timeframe: '6m',
    isActive: false,
    rank: 6,
    createdAt: new Date().toISOString()
  }
]

// Helper to create dates
const today = new Date()
const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
const thisWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
const nextWeek = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)

const formatDate = (d: Date) => d.toISOString().split('T')[0]

export const sampleTasks: Omit<Task, 'id' | 'createdAt'>[] = [
  // 🚀 Launch Startup MVP (15 tasks)
  { title: 'Fix production bug in auth flow', goalId: 'goal-startup', completed: false, rank: 1, verbLabel: 'Fix', taskBody: 'production bug in auth flow', timeEstimate: 60, feedLevel: 'high', timeOfDay: 'morning' },
  { title: 'Review PR from contractor', goalId: 'goal-startup', completed: false, rank: 2, verbLabel: 'Review', taskBody: 'PR from contractor', timeEstimate: 30, feedLevel: 'medium', timeOfDay: 'anytime' },
  { title: 'Write API documentation', goalId: 'goal-startup', completed: false, rank: 3, verbLabel: 'Write', taskBody: 'API documentation', timeEstimate: 120, feedLevel: 'high', timeOfDay: 'morning' },
  { title: 'Set up error monitoring (Sentry)', goalId: 'goal-startup', completed: false, rank: 4, verbLabel: 'Set up', taskBody: 'error monitoring (Sentry)', timeEstimate: 45, feedLevel: 'medium', timeOfDay: 'anytime' },
  { title: 'Design onboarding flow mockups', goalId: 'goal-startup', completed: false, rank: 5, verbLabel: 'Design', taskBody: 'onboarding flow mockups', timeEstimate: 90, feedLevel: 'high', timeOfDay: 'morning' },
  { title: 'Interview 3 potential users', goalId: 'goal-startup', completed: false, rank: 6, verbLabel: 'Interview', taskBody: '3 potential users', timeEstimate: 60, feedLevel: 'high', timeOfDay: 'afternoon' },
  { title: 'Set up analytics (Mixpanel)', goalId: 'goal-startup', completed: false, rank: 7, verbLabel: 'Set up', taskBody: 'analytics (Mixpanel)', timeEstimate: 45, feedLevel: 'medium', timeOfDay: 'anytime' },
  { title: 'Create investor pitch deck', goalId: 'goal-startup', completed: false, rank: 8, verbLabel: 'Create', taskBody: 'investor pitch deck', timeEstimate: 180, feedLevel: 'high', timeOfDay: 'morning' },
  { title: 'Research competitors', goalId: 'goal-startup', completed: false, rank: 9, verbLabel: 'Research', taskBody: 'competitors', timeEstimate: 60, feedLevel: 'medium', timeOfDay: 'anytime' },
  { title: 'Write landing page copy', goalId: 'goal-startup', completed: false, rank: 10, verbLabel: 'Write', taskBody: 'landing page copy', timeEstimate: 90, feedLevel: 'high', timeOfDay: 'morning' },
  { title: 'Set up Stripe payments', goalId: 'goal-startup', completed: false, rank: 11, verbLabel: 'Set up', taskBody: 'Stripe payments', timeEstimate: 120, feedLevel: 'high', timeOfDay: 'morning' },
  { title: 'Create demo video', goalId: 'goal-startup', completed: false, rank: 12, verbLabel: 'Create', taskBody: 'demo video', timeEstimate: 180, feedLevel: 'high', timeOfDay: 'afternoon' },
  { title: 'Submit to Product Hunt', goalId: 'goal-startup', completed: false, rank: 13, verbLabel: 'Submit', taskBody: 'to Product Hunt', timeEstimate: 30, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Reach out to 10 beta users', goalId: 'goal-startup', completed: false, rank: 14, verbLabel: 'Reach out', taskBody: 'to 10 beta users', timeEstimate: 45, feedLevel: 'medium', timeOfDay: 'afternoon' },
  { title: 'Set up customer support', goalId: 'goal-startup', completed: false, rank: 15, verbLabel: 'Set up', taskBody: 'customer support', timeEstimate: 60, feedLevel: 'medium', timeOfDay: 'anytime' },

  // 💪 Get Healthier (12 tasks)
  { title: 'Morning walk (30 min)', goalId: 'goal-health', completed: false, rank: 1, verbLabel: 'Walk', taskBody: 'Morning (30 min)', timeEstimate: 30, feedLevel: 'low', timeOfDay: 'morning' },
  { title: 'Meal prep for the week', goalId: 'goal-health', completed: false, rank: 2, verbLabel: 'Prep', taskBody: 'meals for the week', timeEstimate: 120, feedLevel: 'medium', timeOfDay: 'afternoon' },
  { title: 'Book annual physical', goalId: 'goal-health', completed: false, rank: 3, verbLabel: 'Book', taskBody: 'annual physical', timeEstimate: 15, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Research gym memberships', goalId: 'goal-health', completed: false, rank: 4, verbLabel: 'Research', taskBody: 'gym memberships', timeEstimate: 30, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Buy new running shoes', goalId: 'goal-health', completed: false, rank: 5, verbLabel: 'Buy', taskBody: 'new running shoes', timeEstimate: 45, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Schedule dentist appointment', goalId: 'goal-health', completed: false, rank: 6, verbLabel: 'Schedule', taskBody: 'dentist appointment', timeEstimate: 10, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Try new healthy recipe', goalId: 'goal-health', completed: false, rank: 7, verbLabel: 'Try', taskBody: 'new healthy recipe', timeEstimate: 60, feedLevel: 'medium', timeOfDay: 'evening' },
  { title: 'Meditate 10 min', goalId: 'goal-health', completed: false, rank: 8, verbLabel: 'Meditate', taskBody: '10 minutes', timeEstimate: 10, feedLevel: 'low', timeOfDay: 'morning' },
  { title: 'Drink 8 glasses of water', goalId: 'goal-health', completed: false, rank: 9, verbLabel: 'Drink', taskBody: '8 glasses of water', timeEstimate: 5, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'No screens after 10pm', goalId: 'goal-health', completed: false, rank: 10, verbLabel: 'Avoid', taskBody: 'screens after 10pm', timeEstimate: 5, feedLevel: 'low', timeOfDay: 'evening' },
  { title: 'Get blood work done', goalId: 'goal-health', completed: false, rank: 11, verbLabel: 'Get', taskBody: 'blood work done', timeEstimate: 60, feedLevel: 'low', timeOfDay: 'morning' },
  { title: 'Research sleep tracking apps', goalId: 'goal-health', completed: false, rank: 12, verbLabel: 'Research', taskBody: 'sleep tracking apps', timeEstimate: 20, feedLevel: 'low', timeOfDay: 'anytime' },

  // 💰 Financial Freedom (10 tasks)
  { title: 'Review monthly budget', goalId: 'goal-finance', completed: false, rank: 1, verbLabel: 'Review', taskBody: 'monthly budget', timeEstimate: 30, feedLevel: 'medium', timeOfDay: 'morning' },
  { title: 'Max out Roth IRA', goalId: 'goal-finance', completed: false, rank: 2, verbLabel: 'Max out', taskBody: 'Roth IRA contribution', timeEstimate: 20, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Rebalance investment portfolio', goalId: 'goal-finance', completed: false, rank: 3, verbLabel: 'Rebalance', taskBody: 'investment portfolio', timeEstimate: 45, feedLevel: 'medium', timeOfDay: 'morning' },
  { title: 'Cancel unused subscriptions', goalId: 'goal-finance', completed: false, rank: 4, verbLabel: 'Cancel', taskBody: 'unused subscriptions', timeEstimate: 30, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Research high-yield savings', goalId: 'goal-finance', completed: false, rank: 5, verbLabel: 'Research', taskBody: 'high-yield savings accounts', timeEstimate: 20, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Set up automatic savings', goalId: 'goal-finance', completed: false, rank: 6, verbLabel: 'Set up', taskBody: 'automatic transfers to savings', timeEstimate: 15, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Review credit card rewards', goalId: 'goal-finance', completed: false, rank: 7, verbLabel: 'Review', taskBody: 'credit card rewards', timeEstimate: 20, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Update beneficiaries', goalId: 'goal-finance', completed: false, rank: 8, verbLabel: 'Update', taskBody: 'beneficiaries on accounts', timeEstimate: 30, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Build 3-month emergency fund', goalId: 'goal-finance', completed: false, rank: 9, verbLabel: 'Build', taskBody: '3-month emergency fund', timeEstimate: 0, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Meet with financial advisor', goalId: 'goal-finance', completed: false, rank: 10, verbLabel: 'Meet', taskBody: 'with financial advisor', timeEstimate: 60, feedLevel: 'medium', timeOfDay: 'afternoon' },

  // 🇪🇸 Learn Spanish (8 tasks)
  { title: 'Duolingo lesson', goalId: 'goal-spanish', completed: false, rank: 1, verbLabel: 'Complete', taskBody: 'Duolingo lesson', timeEstimate: 15, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Watch Spanish show', goalId: 'goal-spanish', completed: false, rank: 2, verbLabel: 'Watch', taskBody: 'Spanish show with subtitles', timeEstimate: 45, feedLevel: 'low', timeOfDay: 'evening' },
  { title: 'Book iTalki tutor session', goalId: 'goal-spanish', completed: false, rank: 3, verbLabel: 'Book', taskBody: 'iTalki tutor session', timeEstimate: 10, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Review 50 flashcards', goalId: 'goal-spanish', completed: false, rank: 4, verbLabel: 'Review', taskBody: '50 flashcards', timeEstimate: 15, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Listen to Spanish podcast', goalId: 'goal-spanish', completed: false, rank: 5, verbLabel: 'Listen', taskBody: 'Spanish podcast on commute', timeEstimate: 30, feedLevel: 'low', timeOfDay: 'morning' },
  { title: 'Write journal in Spanish', goalId: 'goal-spanish', completed: false, rank: 6, verbLabel: 'Write', taskBody: 'journal entry in Spanish', timeEstimate: 20, feedLevel: 'medium', timeOfDay: 'evening' },
  { title: 'Join conversation group', goalId: 'goal-spanish', completed: false, rank: 7, verbLabel: 'Join', taskBody: 'Spanish conversation group', timeEstimate: 60, feedLevel: 'high', timeOfDay: 'evening' },
  { title: 'Change phone to Spanish', goalId: 'goal-spanish', completed: false, rank: 8, verbLabel: 'Change', taskBody: 'phone language to Spanish', timeEstimate: 5, feedLevel: 'low', timeOfDay: 'anytime' },

  // ❤️ Relationships (10 tasks)
  { title: 'Call mom', goalId: 'goal-relationships', completed: false, rank: 1, verbLabel: 'Call', taskBody: 'mom', timeEstimate: 30, feedLevel: 'low', timeOfDay: 'evening' },
  { title: 'Plan date night', goalId: 'goal-relationships', completed: false, rank: 2, verbLabel: 'Plan', taskBody: 'date night', timeEstimate: 20, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Send birthday card to uncle', goalId: 'goal-relationships', completed: false, rank: 3, verbLabel: 'Send', taskBody: 'birthday card to uncle', timeEstimate: 15, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Organize dinner with friends', goalId: 'goal-relationships', completed: false, rank: 4, verbLabel: 'Organize', taskBody: 'dinner with college friends', timeEstimate: 30, feedLevel: 'medium', timeOfDay: 'anytime' },
  { title: 'Reply to Sarah\'s text', goalId: 'goal-relationships', completed: false, rank: 5, verbLabel: 'Reply', taskBody: 'to Sarah\'s text', timeEstimate: 5, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Buy anniversary gift', goalId: 'goal-relationships', completed: false, rank: 6, verbLabel: 'Buy', taskBody: 'anniversary gift', timeEstimate: 45, feedLevel: 'medium', timeOfDay: 'anytime' },
  { title: 'Schedule coffee with mentor', goalId: 'goal-relationships', completed: false, rank: 7, verbLabel: 'Schedule', taskBody: 'coffee with mentor', timeEstimate: 10, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Write thank you note', goalId: 'goal-relationships', completed: false, rank: 8, verbLabel: 'Write', taskBody: 'thank you note to boss', timeEstimate: 15, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Plan weekend trip', goalId: 'goal-relationships', completed: false, rank: 9, verbLabel: 'Plan', taskBody: 'weekend trip with partner', timeEstimate: 60, feedLevel: 'medium', timeOfDay: 'evening' },
  { title: 'Attend nephew\'s game', goalId: 'goal-relationships', completed: false, rank: 10, verbLabel: 'Attend', taskBody: 'nephew\'s soccer game', timeEstimate: 120, feedLevel: 'low', timeOfDay: 'afternoon' },

  // 🏠 Home Improvement (8 tasks)
  { title: 'Fix leaky faucet', goalId: 'goal-home', completed: false, rank: 1, verbLabel: 'Fix', taskBody: 'leaky faucet', timeEstimate: 45, feedLevel: 'medium', timeOfDay: 'afternoon' },
  { title: 'Organize garage', goalId: 'goal-home', completed: false, rank: 2, verbLabel: 'Organize', taskBody: 'garage', timeEstimate: 180, feedLevel: 'high', timeOfDay: 'morning' },
  { title: 'Get quotes for windows', goalId: 'goal-home', completed: false, rank: 3, verbLabel: 'Get', taskBody: 'quotes for new windows', timeEstimate: 60, feedLevel: 'medium', timeOfDay: 'anytime' },
  { title: 'Deep clean kitchen', goalId: 'goal-home', completed: false, rank: 4, verbLabel: 'Clean', taskBody: 'kitchen deeply', timeEstimate: 90, feedLevel: 'medium', timeOfDay: 'morning' },
  { title: 'Replace smoke detector batteries', goalId: 'goal-home', completed: false, rank: 5, verbLabel: 'Replace', taskBody: 'smoke detector batteries', timeEstimate: 15, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Research smart thermostat', goalId: 'goal-home', completed: false, rank: 6, verbLabel: 'Research', taskBody: 'smart thermostat options', timeEstimate: 30, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Declutter closet', goalId: 'goal-home', completed: false, rank: 7, verbLabel: 'Declutter', taskBody: 'closet', timeEstimate: 60, feedLevel: 'medium', timeOfDay: 'afternoon' },
  { title: 'Fix squeaky door', goalId: 'goal-home', completed: false, rank: 8, verbLabel: 'Fix', taskBody: 'squeaky door', timeEstimate: 15, feedLevel: 'low', timeOfDay: 'anytime' },

  // 📥 Inbox - no goal (10 tasks)
  { title: 'Return Amazon package', completed: false, rank: 1, verbLabel: 'Return', taskBody: 'Amazon package', timeEstimate: 30, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Renew car registration', completed: false, rank: 2, verbLabel: 'Renew', taskBody: 'car registration', timeEstimate: 20, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Pick up dry cleaning', completed: false, rank: 3, verbLabel: 'Pick up', taskBody: 'dry cleaning', timeEstimate: 15, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Research new laptop', completed: false, rank: 4, verbLabel: 'Research', taskBody: 'new laptop options', timeEstimate: 45, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Update LinkedIn profile', completed: false, rank: 5, verbLabel: 'Update', taskBody: 'LinkedIn profile', timeEstimate: 30, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Cancel free trial', completed: false, rank: 6, verbLabel: 'Cancel', taskBody: 'free trial before charge', timeEstimate: 5, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'RSVP to wedding', completed: false, rank: 7, verbLabel: 'RSVP', taskBody: 'to wedding', timeEstimate: 10, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Get passport renewed', completed: false, rank: 8, verbLabel: 'Get', taskBody: 'passport renewed', timeEstimate: 60, feedLevel: 'medium', timeOfDay: 'morning' },
  { title: 'Schedule oil change', completed: false, rank: 9, verbLabel: 'Schedule', taskBody: 'car oil change', timeEstimate: 10, feedLevel: 'low', timeOfDay: 'anytime' },
  { title: 'Buy concert tickets', completed: false, rank: 10, verbLabel: 'Buy', taskBody: 'concert tickets', timeEstimate: 15, feedLevel: 'low', timeOfDay: 'anytime' }
]

/**
 * Load sample data into the app
 * Call this on first launch if no existing data
 */
export function createSampleData(): { goals: Goal[]; tasks: Task[] } {
  const now = new Date().toISOString()
  
  const tasks: Task[] = sampleTasks.map((t, i) => ({
    ...t,
    id: genId(),
    createdAt: now
  }))
  
  return {
    goals: sampleGoals,
    tasks
  }
}
