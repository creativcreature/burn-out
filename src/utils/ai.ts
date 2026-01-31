import type { BurnoutMode, TonePreference, Goal, Project } from '../data/types'
import { parseAITasks } from '../data/validation'

const BASE_SYSTEM_PROMPT = `You are a supportive productivity assistant for BurnOut, an app designed for neurodivergent users.

Your role is to help users:
1. Process their thoughts and feelings about tasks
2. Break down overwhelming tasks into manageable pieces
3. Extract actionable tasks from brain dumps
4. Suggest appropriate verb labels (max 12 characters)
5. Estimate time and energy requirements

## EMOTIONAL AWARENESS (CRITICAL - READ FIRST)
Before anything else, scan the user's message for emotional cues:
- Life events: death, funeral, illness, loss, breakup, job loss, family crisis
- Emotional states: grief, anxiety, overwhelm, exhaustion, depression, panic
- Stress signals: "I can't", "too much", "falling apart", "drowning"

When you detect emotional content:
1. ACKNOWLEDGE IT FIRST - express genuine empathy before anything else
2. DO NOT immediately jump to tasks or productivity
3. Ask how they're doing or if they want to talk about it
4. Only offer task help if they specifically ask for it
5. If they mention grief/loss, do NOT extract tasks from that message

Examples:
- "I have a funeral tomorrow" → "I'm so sorry for your loss. That's really hard. How are you holding up?"
- "My mom is in the hospital" → "That sounds really stressful and scary. I'm here if you need to talk."
- "I'm so overwhelmed I can't think" → "That sounds exhausting. Let's pause on tasks - what do you need right now?"

Remember: You're talking to a HUMAN, not processing a task queue. Be present first.

## PRODUCTIVITY GUIDELINES
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
        systemPrompt
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('Chat API Error:', error)

      // Check for specific error types
      if (response.status === 500 && error.error?.includes('not configured')) {
        return {
          message: "The Claude API key hasn't been configured yet. Please check the server configuration.",
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

/**
 * Generate AI-powered weekly summary insights
 */
export async function generateWeeklySummary(
  completedTaskCount: number,
  lowEnergyTaskCount: number,
  mediumEnergyTaskCount: number,
  highEnergyTaskCount: number,
  timePerVerbLabel: Record<string, number>,
  moodBreakdown: Record<string, number>,
  burnoutMode: BurnoutMode,
  tonePreference: TonePreference
): Promise<string> {
  const energyDistribution = {
    low: lowEnergyTaskCount,
    medium: mediumEnergyTaskCount,
    high: highEnergyTaskCount
  }

  const totalTime = Object.values(timePerVerbLabel).reduce((sum, time) => sum + time, 0)
  const topVerbLabels = Object.entries(timePerVerbLabel)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([label, time]) => `${label} (${time} mins)`)

  const moodEntries = Object.entries(moodBreakdown).length
  const dominantMood = Object.entries(moodBreakdown)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'balanced'

  // Tone adaptation based on user preference
  const toneModifiers = {
    gentle: "warmly and supportively",
    direct: "clearly and straightforward", 
    playful: "with encouraging energy"
  }

  // Burnout mode adaptation
  const modeContext = {
    recovery: "celebrating small wins and gentle progress",
    prevention: "maintaining sustainable balance", 
    balanced: "steady progress and energy management"
  }

  const prompt = `You are providing weekly insights for a neurodivergent user. Speak ${toneModifiers[tonePreference]}, focusing on ${modeContext[burnoutMode]}.

WEEKLY DATA:
- Completed ${completedTaskCount} tasks (${totalTime} total minutes)
- Energy distribution: ${energyDistribution.low} low, ${energyDistribution.medium} medium, ${energyDistribution.high} high energy tasks
- Time spent on: ${topVerbLabels.join(', ')}
- Mood check-ins: ${moodEntries} entries, mostly ${dominantMood}

Generate a 2-3 sentence insight that:
1. Acknowledges their accomplishments without gamification
2. Notices patterns in their energy/task choices
3. Offers one gentle insight or affirmation

Avoid: points, streaks, badges, pressure, comparison. 
Focus on: patterns, energy awareness, celebrating what works.`

  try {
    const response = await sendMessage([{ role: 'user', content: prompt }], {
      burnoutMode,
      tonePreference
    })
    
    return response.message.trim()
  } catch (error) {
    console.error('Failed to generate weekly summary:', error)
    
    // Fallback non-AI insight based on patterns
    if (energyDistribution.low > energyDistribution.high) {
      return "You've been honoring your energy levels this week by choosing more gentle tasks. That's wise self-awareness."
    } else if (energyDistribution.high > energyDistribution.low) {
      return "You tackled some high-energy work this week. That takes courage and focus - well done."
    } else {
      return "Your task choices this week show thoughtful energy balance. You're learning what works for you."
    }
  }
}
