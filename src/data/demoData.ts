import type { BurnOutData, Goal, Project, Task, Conversation, ChatMessage } from './types'
import { CURRENT_VERSION } from './constants'

// Generate IDs
const ids = {
  goal1: crypto.randomUUID(),
  goal2: crypto.randomUUID(),
  project1: crypto.randomUUID(),
  project2: crypto.randomUUID(),
  project3: crypto.randomUUID(),
  task1: crypto.randomUUID(),
  task2: crypto.randomUUID(),
  task3: crypto.randomUUID(),
  task4: crypto.randomUUID(),
  task5: crypto.randomUUID(),
  task6: crypto.randomUUID(),
  task7: crypto.randomUUID(),
  task8: crypto.randomUUID(),
  conversation: crypto.randomUUID(),
  msg1: crypto.randomUUID(),
  msg2: crypto.randomUUID(),
  msg3: crypto.randomUUID(),
  msg4: crypto.randomUUID()
}

function daysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

const demoGoals: Goal[] = [
  {
    id: ids.goal1,
    title: 'Build sustainable work habits',
    description: 'Create a workflow that respects my energy levels',
    timeframe: '6m',
    isActive: true,
    rank: 1,
    createdAt: daysAgo(14),
    updatedAt: daysAgo(2),
    archived: false,
    order: 0
  },
  {
    id: ids.goal2,
    title: 'Take care of myself',
    description: 'Prioritize health and wellbeing alongside productivity',
    timeframe: '1y',
    isActive: false,
    rank: 2,
    createdAt: daysAgo(14),
    updatedAt: daysAgo(7),
    archived: false,
    order: 1
  }
]

const demoProjects: Project[] = [
  {
    id: ids.project1,
    goalId: ids.goal1,
    title: 'Morning Routine',
    description: 'Consistent, energizing starts',
    status: 'active',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(1),
    order: 0
  },
  {
    id: ids.project2,
    goalId: ids.goal1,
    title: 'Deep Work Sessions',
    description: 'Protected time for focused work',
    status: 'active',
    createdAt: daysAgo(8),
    updatedAt: daysAgo(3),
    order: 1
  },
  {
    id: ids.project3,
    goalId: ids.goal2,
    title: 'Movement & Rest',
    description: 'Balance activity with recovery',
    status: 'active',
    createdAt: daysAgo(12),
    updatedAt: daysAgo(5),
    order: 0
  }
]

const demoTasks: Task[] = [
  {
    id: ids.task1,
    projectId: ids.project1,
    goalId: ids.goal1,
    verbLabel: 'Rise',
    taskBody: 'Get up without hitting snooze',
    timeEstimate: 5,
    feedLevel: 'low',
    status: 'pending',
    timeOfDay: 'morning',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    order: 0
  },
  {
    id: ids.task2,
    projectId: ids.project1,
    goalId: ids.goal1,
    verbLabel: 'Hydrate',
    taskBody: 'Drink a full glass of water',
    timeEstimate: 5,
    feedLevel: 'low',
    status: 'pending',
    timeOfDay: 'morning',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    order: 1
  },
  {
    id: ids.task3,
    projectId: ids.project2,
    goalId: ids.goal1,
    verbLabel: 'Deep Work',
    taskBody: 'Focus on most important task',
    timeEstimate: 90,
    feedLevel: 'high',
    status: 'pending',
    timeOfDay: 'morning',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    order: 0
  },
  {
    id: ids.task4,
    projectId: ids.project2,
    goalId: ids.goal1,
    verbLabel: 'Review',
    taskBody: 'Check messages and quick responses',
    timeEstimate: 30,
    feedLevel: 'low',
    status: 'pending',
    timeOfDay: 'afternoon',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    order: 1
  },
  {
    id: ids.task5,
    projectId: ids.project3,
    goalId: ids.goal2,
    verbLabel: 'Move',
    taskBody: '15 minute walk or stretch',
    timeEstimate: 15,
    feedLevel: 'low',
    status: 'pending',
    timeOfDay: 'anytime',
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
    order: 0
  },
  {
    id: ids.task6,
    projectId: ids.project3,
    goalId: ids.goal2,
    verbLabel: 'Rest',
    taskBody: 'Take a proper lunch break away from screen',
    timeEstimate: 30,
    feedLevel: 'low',
    status: 'pending',
    timeOfDay: 'afternoon',
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
    order: 1
  },
  {
    id: ids.task7,
    verbLabel: 'Plan',
    taskBody: 'Map out tomorrow\'s priorities',
    timeEstimate: 15,
    feedLevel: 'medium',
    status: 'pending',
    timeOfDay: 'evening',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    order: 0
  },
  {
    id: ids.task8,
    verbLabel: 'Wind Down',
    taskBody: 'No screens 30 min before bed',
    timeEstimate: 30,
    feedLevel: 'low',
    status: 'pending',
    timeOfDay: 'evening',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    order: 1
  }
]

const demoMessages: ChatMessage[] = [
  {
    id: ids.msg1,
    role: 'user',
    content: 'I have a big project due next week and I\'m feeling overwhelmed. I don\'t know where to start.',
    timestamp: daysAgo(5)
  },
  {
    id: ids.msg2,
    role: 'assistant',
    content: 'I hear you - that feeling of overwhelm when facing a big project is really common. Let\'s break this down together.\n\nFirst, what\'s the project about? And roughly how much time do you have to work on it before it\'s due?',
    timestamp: daysAgo(5)
  },
  {
    id: ids.msg3,
    role: 'user',
    content: 'It\'s a presentation for work. I have about 5 days but I also have other stuff to do.',
    timestamp: daysAgo(5)
  },
  {
    id: ids.msg4,
    role: 'assistant',
    content: 'OK, a presentation in 5 days with other commitments - that\'s manageable! Here\'s how I\'d approach it:\n\n1. **Today**: Just outline the key points (even bullet points count)\n2. **Tomorrow**: Draft the main content for each section\n3. **Day 3**: Create the slides with your content\n4. **Day 4**: Practice once, note what needs tweaking\n5. **Day 5**: Final polish and one more run-through\n\nThe key is starting small. Even 25 minutes of focused work on the outline today will make tomorrow feel easier.\n\nWould you like me to create a task for that first outline session?',
    timestamp: daysAgo(5)
  }
]

const demoConversation: Conversation = {
  id: ids.conversation,
  title: 'Big project feeling overwhelming...',
  createdAt: daysAgo(5),
  lastMessageAt: daysAgo(5),
  isArchived: true,
  messages: demoMessages
}

export function createDemoData(): Partial<BurnOutData> {
  return {
    version: CURRENT_VERSION,
    goals: demoGoals,
    projects: demoProjects,
    tasks: demoTasks,
    conversations: [demoConversation],
    chatHistory: [],
    completedTasks: [
      {
        id: crypto.randomUUID(),
        completedAt: daysAgo(7),
        duration: 12
      }
    ],
    habits: [
      {
        id: crypto.randomUUID(),
        verbLabel: 'Hydrate',
        habitBody: 'Drink water throughout the day',
        frequency: 'daily',
        timeOfDay: 'anytime',
        feedLevel: 'low',
        createdAt: daysAgo(10),
        completionCount: 7
      }
    ],
    onboarding: {
      completed: true,
      completedAt: daysAgo(7),
      skippedSteps: []
    }
  }
}
