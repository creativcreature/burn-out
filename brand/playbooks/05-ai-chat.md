# Playbook 05: AI Chat (Brain Dump Feature)

## Overview
Implement the AI chat interface for natural language task creation and brain dumps.

## Problem Being Solved
- Chat input is hidden behind navigation bar
- Need to parse natural language into structured tasks
- Support "brain dump" where users can offload thoughts

## Design Requirements

### Visual (PRESERVE EXACTLY)
- Chat bubbles with glass effect
- User messages on right, AI on left
- Smooth message animations
- Input field clearly visible ABOVE navigation

### Input Area Fix
```css
.chat-input-container {
  position: fixed;
  bottom: calc(var(--nav-height) + var(--safe-bottom) + var(--space-md));
  left: var(--space-md);
  right: var(--space-md);
  z-index: 100;
}
```

## AI Integration

### System Prompt
```typescript
const SYSTEM_PROMPT = `You are a gentle, supportive productivity assistant for BurnOut, an app designed for neurodivergent users experiencing burnout.

Your role:
1. Listen to "brain dumps" - unstructured thoughts about tasks and goals
2. Extract actionable tasks from what the user shares
3. Assign appropriate verb labels (max 12 characters)
4. Suggest time estimates and energy levels
5. Never pressure or add urgency
6. Be warm but concise

When creating tasks, format them as:
[TASK]
verbLabel: "Label Here"
taskBody: "Full description"
timeEstimate: 15
feedLevel: "low" | "medium" | "high"
timeOfDay: "morning" | "afternoon" | "evening" | "anytime"
[/TASK]

Verb label examples:
- "Rise + Stretch" (morning routine)
- "Hydrate" (health)
- "Prioritize" (planning)
- "Deep Work" (focus)
- "Wind Down" (evening)
- "Quick Win" (easy tasks)
- "Create" (creative work)
- "Connect" (social)

Remember: This user may be dealing with burnout. Be gentle. No gamification language (no points, streaks, achievements). Focus on sustainable progress.`
```

### Claude API Integration
```typescript
// src/utils/ai.ts
import Anthropic from '@anthropic-ai/sdk'

export async function sendMessage(
  messages: ChatMessage[],
  apiKey: string
): Promise<string> {
  const client = new Anthropic({ apiKey })

  const response = await client.messages.create({
    model: 'claude-3-haiku-20240307',  // Fast, cheap for chat
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content
    }))
  })

  return response.content[0].text
}

export function parseTasksFromResponse(response: string): ParsedTask[] {
  const taskRegex = /\[TASK\]([\s\S]*?)\[\/TASK\]/g
  const tasks: ParsedTask[] = []

  let match
  while ((match = taskRegex.exec(response)) !== null) {
    const taskBlock = match[1]
    const task = {
      verbLabel: extractField(taskBlock, 'verbLabel'),
      taskBody: extractField(taskBlock, 'taskBody'),
      timeEstimate: parseInt(extractField(taskBlock, 'timeEstimate')) || 15,
      feedLevel: extractField(taskBlock, 'feedLevel') as 'low' | 'medium' | 'high',
      timeOfDay: extractField(taskBlock, 'timeOfDay') as TimeOfDay
    }
    tasks.push(task)
  }

  return tasks
}
```

## Chat Component

### Main Chat Page
```typescript
// src/pages/Chat.tsx
export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await sendMessage([...messages, userMessage], apiKey)
      const tasks = parseTasksFromResponse(response)

      // Create tasks in storage
      if (tasks.length > 0) {
        await Promise.all(tasks.map(task => addTask(task)))
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        tasksCreated: tasks.map(t => t.id)
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      // Handle error gracefully
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="chat-messages">
        {messages.map(msg => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <Input
          value={input}
          onChange={setInput}
          placeholder="What's on your mind?"
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <Button onClick={handleSend} disabled={isLoading}>
          Send
        </Button>
      </div>
    </AppLayout>
  )
}
```

### Chat Bubble Component
```typescript
// src/components/chat/ChatBubble.tsx
export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={`chat-bubble ${isUser ? 'user' : 'assistant'}`}>
      <div className="bubble-content">
        {message.content}
      </div>
      {message.tasksCreated?.length > 0 && (
        <div className="tasks-created">
          Created {message.tasksCreated.length} task(s)
        </div>
      )}
    </div>
  )
}
```

### Styles
```css
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md);
  padding-bottom: calc(80px + var(--nav-height) + var(--safe-bottom));
}

.chat-bubble {
  max-width: 80%;
  margin-bottom: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  backdrop-filter: var(--glass-blur);
}

.chat-bubble.user {
  margin-left: auto;
  background: var(--accent-primary);
  color: white;
}

.chat-bubble.assistant {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
}

.chat-input-container {
  position: fixed;
  bottom: calc(var(--nav-height) + var(--safe-bottom) + var(--space-md));
  left: var(--space-md);
  right: var(--space-md);
  display: flex;
  gap: var(--space-sm);
  z-index: 100;
}
```

## Conversation Starters

For empty chat state, show suggestions:
- "I have too much to do today..."
- "I need to plan my week"
- "I'm feeling overwhelmed"
- "Help me break down this project"

## Verification

- [ ] Chat input visible above navigation
- [ ] Messages send correctly
- [ ] AI responses appear
- [ ] Tasks extracted from responses
- [ ] Tasks created in storage
- [ ] Chat history persists
- [ ] Loading state shows
- [ ] Error handling works
- [ ] Keyboard opens without hiding input

## Next Steps
Proceed to Playbook 06: Deployment
