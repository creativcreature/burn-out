import type { BurnoutMode, TonePreference } from '../data/types'

const SYSTEM_PROMPT = `You are a supportive productivity assistant for BurnOut, an app designed for neurodivergent users.

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
    "feedLevel": "medium"
  }
]
\`\`\`

Verb label examples: Deep Work, Quick Win, Research, Draft, Review, Organize, Connect, Create, Plan, Rest`

interface AIConfig {
  apiKey: string
  burnoutMode: BurnoutMode
  tonePreference: TonePreference
}

interface ExtractedTask {
  verbLabel: string
  taskBody: string
  timeEstimate: number
  feedLevel: 'low' | 'medium' | 'high'
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

export async function sendMessage(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  config: AIConfig
): Promise<AIResponse> {
  if (!config.apiKey) {
    return {
      message: "I'd love to help, but I need an API key to work. You can add one in Settings.\n\nFor now, use the Organize page to add tasks manually.",
      tasks: []
    }
  }

  const systemPrompt = `${SYSTEM_PROMPT}

${getToneInstruction(config.tonePreference)}
${getModeInstruction(config.burnoutMode)}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        }))
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('API Error:', error)
      return {
        message: "I'm having trouble connecting right now. Please try again in a moment.",
        tasks: []
      }
    }

    const data = await response.json()
    const content = data.content[0]?.text || ''

    // Extract tasks from the response
    const tasksMatch = content.match(/```tasks\n([\s\S]*?)\n```/)
    let tasks: ExtractedTask[] = []

    if (tasksMatch) {
      try {
        tasks = JSON.parse(tasksMatch[1])
      } catch (e) {
        console.error('Failed to parse tasks:', e)
      }
    }

    // Remove the tasks block from the message
    const message = content.replace(/```tasks\n[\s\S]*?\n```/, '').trim()

    return { message, tasks }
  } catch (error) {
    console.error('AI Error:', error)
    return {
      message: "Something went wrong. Please check your connection and try again.",
      tasks: []
    }
  }
}

export function parseTasksFromMessage(content: string): ExtractedTask[] {
  const tasksMatch = content.match(/```tasks\n([\s\S]*?)\n```/)
  if (!tasksMatch) return []

  try {
    return JSON.parse(tasksMatch[1])
  } catch {
    return []
  }
}
