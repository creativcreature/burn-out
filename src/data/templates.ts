import type { GoalTimeframe, FeedLevel, TimeOfDay } from './types'

export interface GoalTemplate {
  title: string
  description?: string
  timeframe: GoalTimeframe
}

export interface ProjectTemplate {
  title: string
  description?: string
}

export interface TaskTemplate {
  verbLabel: string
  taskBody: string
  timeEstimate: number
  feedLevel: FeedLevel
  timeOfDay?: TimeOfDay
}

export interface OnboardingTemplate {
  id: string
  name: string
  description: string
  icon: string
  goals: GoalTemplate[]
  projects: ProjectTemplate[]
  sampleTasks: TaskTemplate[]
}

export const TEMPLATES: Record<string, OnboardingTemplate> = {
  work: {
    id: 'work',
    name: 'Work & Career',
    description: 'Advance your professional goals',
    icon: 'briefcase',
    goals: [
      {
        title: 'Advance my career',
        description: 'Focus on professional growth and skill development',
        timeframe: '1y'
      }
    ],
    projects: [
      {
        title: 'Q1 Performance Review',
        description: 'Prepare and execute strong quarterly review'
      },
      {
        title: 'Skill Development',
        description: 'Learn new technologies and methodologies'
      }
    ],
    sampleTasks: [
      { verbLabel: 'Deep Work', taskBody: 'Focus on priority project for 2 hours', timeEstimate: 120, feedLevel: 'high', timeOfDay: 'morning' },
      { verbLabel: 'Review', taskBody: 'Go through team updates and emails', timeEstimate: 30, feedLevel: 'low', timeOfDay: 'morning' },
      { verbLabel: 'Plan', taskBody: 'Plan tomorrow\'s priorities', timeEstimate: 15, feedLevel: 'medium', timeOfDay: 'evening' }
    ]
  },
  wellness: {
    id: 'wellness',
    name: 'Personal Wellness',
    description: 'Prioritize your health and wellbeing',
    icon: 'heart',
    goals: [
      {
        title: 'Improve my wellbeing',
        description: 'Build sustainable habits for physical and mental health',
        timeframe: '6m'
      }
    ],
    projects: [
      {
        title: 'Morning Routine',
        description: 'Create a consistent, energizing start to each day'
      },
      {
        title: 'Better Sleep',
        description: 'Develop habits for restful, restorative sleep'
      }
    ],
    sampleTasks: [
      { verbLabel: 'Move', taskBody: '20 minute walk or stretch session', timeEstimate: 20, feedLevel: 'low', timeOfDay: 'morning' },
      { verbLabel: 'Hydrate', taskBody: 'Drink a full glass of water', timeEstimate: 5, feedLevel: 'low', timeOfDay: 'anytime' },
      { verbLabel: 'Wind Down', taskBody: 'No screens 30 min before bed', timeEstimate: 30, feedLevel: 'low', timeOfDay: 'evening' }
    ]
  },
  student: {
    id: 'student',
    name: 'Student Life',
    description: 'Balance academics with wellbeing',
    icon: 'book',
    goals: [
      {
        title: 'Succeed this semester',
        description: 'Stay on top of coursework while maintaining balance',
        timeframe: '3m'
      }
    ],
    projects: [
      {
        title: 'Final Project',
        description: 'Complete end-of-semester capstone work'
      },
      {
        title: 'Exam Prep',
        description: 'Study schedule for upcoming exams'
      }
    ],
    sampleTasks: [
      { verbLabel: 'Study', taskBody: 'Review lecture notes for one class', timeEstimate: 45, feedLevel: 'high', timeOfDay: 'morning' },
      { verbLabel: 'Read', taskBody: 'Complete assigned reading', timeEstimate: 30, feedLevel: 'medium', timeOfDay: 'afternoon' },
      { verbLabel: 'Break', taskBody: 'Take a 10-minute rest between sessions', timeEstimate: 10, feedLevel: 'low', timeOfDay: 'anytime' }
    ]
  },
  custom: {
    id: 'custom',
    name: 'Start Fresh',
    description: 'Build your own goals from scratch',
    icon: 'plus',
    goals: [],
    projects: [],
    sampleTasks: []
  }
}

export const TEMPLATE_LIST = Object.values(TEMPLATES)
