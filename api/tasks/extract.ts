import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Task Extraction API
 * 
 * Takes a chat message/brain dump and uses Claude to extract
 * structured tasks. Returns array of Task objects WITHOUT IDs
 * (frontend generates those).
 * 
 * POST /api/tasks/extract
 * Body: { message: string, context?: { projects?: Project[], goals?: Goal[] } }
 * Returns: { tasks: TaskInput[] }
 */

type FeedLevel = 'low' | 'medium' | 'high'
type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime'

interface TaskInput {
  projectId?: string
  goalId?: string
  verbLabel: string
  taskBody: string
  timeEstimate: number
  feedLevel: FeedLevel
  timeOfDay?: TimeOfDay
}

interface ExtractRequest {
  message: string
  context?: {
    projects?: Array<{ id: string; title: string }>
    goals?: Array<{ id: string; title: string }>
  }
}

function setCorsHeaders(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function buildSystemPrompt(context?: ExtractRequest['context']): string {
  let prompt = `You are a task extraction assistant for a burnout-aware productivity app designed for neurodivergent users.

Your job is to extract actionable tasks from the user's brain dump or chat message.

For each task, provide:
- verbLabel: A SHORT action verb (max 12 chars) like "Write", "Call", "Research", "Review", "Fix", "Email", "Plan", "Buy", "Schedule"
- taskBody: The specific task description (clear, actionable)
- timeEstimate: Estimated minutes (be realistic, round to 5/10/15/30/60)
- feedLevel: Energy/effort required
  - "low": Quick wins, minimal mental effort (5-15 min tasks)
  - "medium": Moderate focus needed (15-45 min tasks)  
  - "high": Deep work, significant mental effort (45+ min tasks)
- timeOfDay: When this task is best suited (optional)
  - "morning": High-focus tasks, creative work
  - "afternoon": Administrative, meetings
  - "evening": Low-energy, wind-down tasks
  - "anytime": Flexible tasks

IMPORTANT RULES:
1. Break big tasks into smaller, actionable chunks (no task > 2 hours)
2. Use specific, concrete language (not vague)
3. For ADHD-friendly tasks: make the first step crystal clear
4. If a task is vague, make it specific
5. Don't create tasks for things that aren't actionable
6. No gamification language (no points, badges, streaks)`

  if (context?.projects?.length) {
    prompt += `\n\nUser's existing projects (you may assign tasks to these via projectId):\n`
    for (const p of context.projects) {
      prompt += `- ${p.id}: ${p.title}\n`
    }
  }

  if (context?.goals?.length) {
    prompt += `\n\nUser's existing goals (you may assign tasks to these via goalId):\n`
    for (const g of context.goals) {
      prompt += `- ${g.id}: ${g.title}\n`
    }
  }

  prompt += `\n\nRespond ONLY with valid JSON array of tasks. Example:
[
  {
    "verbLabel": "Email",
    "taskBody": "Send project update to Sarah",
    "timeEstimate": 15,
    "feedLevel": "low",
    "timeOfDay": "morning"
  },
  {
    "verbLabel": "Research",
    "taskBody": "Compare 3 API options for auth",
    "timeEstimate": 45,
    "feedLevel": "high",
    "projectId": "proj_123"
  }
]

If the message contains no actionable tasks, return an empty array: []`

  return prompt
}

function validateExtractedTasks(data: unknown): TaskInput[] {
  if (!Array.isArray(data)) {
    return []
  }

  const validTasks: TaskInput[] = []

  for (const item of data) {
    if (!item || typeof item !== 'object') continue
    
    const task = item as Record<string, unknown>
    
    // Required fields
    if (typeof task.verbLabel !== 'string' || task.verbLabel.length === 0) continue
    if (typeof task.taskBody !== 'string' || task.taskBody.length === 0) continue
    if (typeof task.timeEstimate !== 'number' || task.timeEstimate < 0) continue
    if (!['low', 'medium', 'high'].includes(task.feedLevel as string)) continue

    // Truncate verbLabel if needed
    const verbLabel = task.verbLabel.slice(0, 12)

    // Optional field validation
    let timeOfDay: TimeOfDay | undefined
    if (task.timeOfDay && ['morning', 'afternoon', 'evening', 'anytime'].includes(task.timeOfDay as string)) {
      timeOfDay = task.timeOfDay as TimeOfDay
    }

    validTasks.push({
      verbLabel,
      taskBody: task.taskBody as string,
      timeEstimate: task.timeEstimate as number,
      feedLevel: task.feedLevel as FeedLevel,
      timeOfDay,
      projectId: typeof task.projectId === 'string' ? task.projectId : undefined,
      goalId: typeof task.goalId === 'string' ? task.goalId : undefined
    })
  }

  return validTasks
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { message, context } = req.body as ExtractRequest

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'message is required and must be a non-empty string' })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
    }

    const systemPrompt = buildSystemPrompt(context)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Extract tasks from this brain dump:\n\n${message}`
          }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('Claude API Error:', JSON.stringify(error))
      return res.status(500).json({ error: `Claude API failed: ${JSON.stringify(error)}` })
    }

    const data = await response.json()
    const content = data.content?.[0]?.text || '[]'

    // Parse and validate the JSON response
    let parsedTasks: unknown
    try {
      // Handle potential markdown code blocks
      const jsonContent = content.replace(/```json\n?|\n?```/g, '').trim()
      parsedTasks = JSON.parse(jsonContent)
    } catch {
      console.error('Failed to parse Claude response as JSON:', content)
      return res.status(200).json({ 
        tasks: [], 
        warning: 'Could not extract tasks from response',
        raw: content 
      })
    }

    const validTasks = validateExtractedTasks(parsedTasks)

    return res.status(200).json({ 
      tasks: validTasks,
      count: validTasks.length
    })

  } catch (error) {
    console.error('Task Extraction API Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
}
