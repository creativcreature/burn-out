import type { BurnoutMode, TonePreference, AIProvider, Goal, Project } from '../data/types'
import { parseAITasks } from '../data/validation'

const BASE_SYSTEM_PROMPT = `You are a supportive productivity assistant for BurnOut, an app designed for neurodivergent users.

Your role is to help users:
1. Process their thoughts and feelings about tasks
2. Break down overwhelming tasks into manageable pieces
3. Extract actionable tasks from brain dumps
4. Suggest appropriate verb labels (max 12 characters)
5. Estimate time and energy requirements

IMPORTANT GUIDELINES:
- Never gamify or add pressure (no points, badges, streaks)
- Be warm but not patronizing
- Keep responses concise
- Focus on what the user CAN do, not what they haven't done
- Respect energy levels - low energy is valid

When extracting tasks, return them in this JSON format at the end of your response:
\`\`\`tasks
[
  {
    "verbLabel": "Deep Work",
    "taskBody": "description of the task",
    "timeEstimate": 30,
    "feedLevel": "medium",
    "suggestedGoalId": "goal-uuid-if-applicable",
    "suggestedProjectId": "project-uuid-if-applicable"
  }
]
\`\`\`

Verb label examples: Deep Work, Quick Win, Research, Draft, Review, Organize, Connect, Create, Plan, Rest`

interface AIConfig {
  burnoutMode: BurnoutMode
  tonePreference: TonePreference
  provider: AIProvider
  goals?: Goal[]
  projects?: Project[]
}

export interface ExtractedTask {
  verbLabel: string
  taskBody: string
  timeEstimate: number
  feedLevel: 'low' | 'medium' | 'high'
  suggestedGoalId?: string
  suggestedProjectId?: string
}

interface AIResponse {
  message: string
  tasks: ExtractedTask[]
}

function getToneInstruction(tone: TonePreference): string {
  switch (tone) {
  case 'gentle':
    return 'Use a soft, supportive, and understanding tone. Be extra patient and validating.'
  case 'direct':
    return 'Be clear, concise, and to the point. Skip unnecessary pleasantries.'
  case 'playful':
    return 'Be light, fun, and encouraging. Use casual language.'
  }
}

function getModeInstruction(mode: BurnoutMode): string {
  switch (mode) {
  case 'recovery':
    return 'User is burnt out. Prioritize rest, suggest very small tasks, and validate that doing less is okay.'
  case 'prevention':
    return 'User wants to avoid burnout. Help them maintain boundaries and recognize warning signs.'
  case 'balanced':
    return 'User is doing okay. Help them stay productive while maintaining wellbeing.'
  }
}

function getGoalsContext(goals?: Goal[], projects?: Project[]): string {
  if (!goals || goals.length === 0) return ''

  let context = '\n\nUSER\'S GOALS AND PROJECTS (use these IDs when suggesting task associations):\n'

  for (const goal of goals.filter(g => !g.archived)) {
    context += `\n- Goal: "${goal.title}" (ID: ${goal.id})${goal.isActive ? ' [ACTIVE]' : ''}`
    const goalProjects = projects?.filter(p => p.goalId === goal.id) || []
    for (const project of goalProjects) {
      context += `\n  - Project: "${project.title}" (ID: ${project.id})`
    }
  }

  context += '\n\nWhen extracting tasks, suggest matching goals/projects based on the task content.'

  return context
}

function buildSystemPrompt(config: AIConfig): string {
  return `${BASE_SYSTEM_PROMPT}

${getToneInstruction(config.tonePreference)}
${getModeInstruction(config.burnoutMode)}
${getGoalsContext(config.goals, config.projects)}`
}

// Get the API base URL - use Vercel proxy in production, or local in dev
function getApiUrl(): string {
  // In production, use relative URL (same domain)
  if (import.meta.env.PROD) {
    return '/api/chat'
  }
  // In development, check for local dev server or use Vercel preview
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  // Default to local Vercel dev server
  return '/api/chat'
}

export async function sendMessage(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  config: AIConfig
): Promise<AIResponse> {
  const systemPrompt = buildSystemPrompt(config)

  try {
    const response = await fetch(getApiUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages,
        provider: config.provider,
        systemPrompt
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('Chat API Error:', error)

      // Check for specific error types - show user-friendly messages
      if (response.status === 500 && error.error?.includes('not configured')) {
        return {
          message: "The AI assistant is temporarily unavailable. We're working on it — please try again later.",
          tasks: []
        }
      }

      return {
        message: "I'm having trouble connecting right now. Please try again in a moment.",
        tasks: []
      }
    }

    const data = await response.json()
    const content = data.content || ''

    // Extract and validate tasks from the response
    const tasksMatch = content.match(/```tasks\n([\s\S]*?)\n```/)
    let tasks: ExtractedTask[] = []

    if (tasksMatch) {
      try {
        const rawTasks = JSON.parse(tasksMatch[1])
        // Validate each task and filter out invalid ones
        const validatedTasks = parseAITasks(rawTasks)
        // Add optional goal/project IDs if present
        tasks = validatedTasks.map((task, index) => ({
          ...task,
          suggestedGoalId: rawTasks[index]?.suggestedGoalId,
          suggestedProjectId: rawTasks[index]?.suggestedProjectId
        }))
      } catch (e) {
        console.error('Failed to parse tasks JSON:', e)
      }
    }

    // Remove the tasks block from the message
    const message = content.replace(/```tasks\n[\s\S]*?\n```/, '').trim()

    return { message, tasks }
  } catch (error) {
    console.error('AI Error:', error)
    return {
      message: 'Something went wrong. Please check your connection and try again.',
      tasks: []
    }
  }
}

export function parseTasksFromMessage(content: string): ExtractedTask[] {
  const tasksMatch = content.match(/```tasks\n([\s\S]*?)\n```/)
  if (!tasksMatch) return []

  try {
    const rawTasks = JSON.parse(tasksMatch[1])
    return parseAITasks(rawTasks)
  } catch {
    return []
  }
}
