export const STORAGE_KEY = 'burnout_v4'
export const CURRENT_VERSION = 1

export const VERB_LABEL_MAX_LENGTH = 12

export const VERB_LABEL_EXAMPLES = [
  'Rise + Stretch',
  'Hydrate',
  'Prioritize',
  'Deep Work',
  'Wind Down',
  'Quick Win',
  'Create',
  'Connect',
  'Review',
  'Plan',
  'Focus',
  'Rest'
] as const

export const TIME_ESTIMATES = [
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 25, label: '25 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' }
] as const

export const NAVIGATION_ITEMS = [
  { path: '/now', label: 'Now', icon: 'circle' },
  { path: '/organize', label: 'Organize', icon: 'layers' },
  { path: '/chat', label: 'Chat', icon: 'message' },
  { path: '/reflections', label: 'Reflect', icon: 'sparkle' },
  { path: '/settings', label: 'Settings', icon: 'settings' }
] as const

export const ENERGY_LEVELS = [
  { value: 1 as const, label: 'Very Low', emoji: '' },
  { value: 2 as const, label: 'Low', emoji: '' },
  { value: 3 as const, label: 'Medium', emoji: '' },
  { value: 4 as const, label: 'High', emoji: '' },
  { value: 5 as const, label: 'Very High', emoji: '' }
] as const

export const FEED_LEVELS = [
  { value: 'low' as const, label: 'Low Energy', description: 'Can do when tired' },
  { value: 'medium' as const, label: 'Medium Energy', description: 'Needs some focus' },
  { value: 'high' as const, label: 'High Energy', description: 'Requires full attention' }
] as const

export const TIMES_OF_DAY = [
  { value: 'morning' as const, label: 'Morning', hours: '6-12' },
  { value: 'afternoon' as const, label: 'Afternoon', hours: '12-17' },
  { value: 'evening' as const, label: 'Evening', hours: '17-22' },
  { value: 'anytime' as const, label: 'Anytime', hours: 'Flexible' }
] as const
