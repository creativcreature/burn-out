# AI Navigation Help Specification

> **Purpose:** AI assistant can guide users to features and answer "how do I..." questions
> **Created:** 2026-02-01

---

## Overview

When users ask the AI "how do I..." or "where is...", the AI should:
1. Answer the question
2. Offer to navigate them directly to the relevant page

---

## Navigation Intents

### Task Management

| User Says | AI Response | Action |
|-----------|-------------|--------|
| "How do I add a task?" | "You can add tasks from the quick add bar at the bottom of Organize, or just tell me what you need to do!" | Navigate to /organize |
| "Where are my tasks?" | "Your tasks are organized by goal. Let me take you there." | Navigate to /organize |
| "How do I complete a task?" | "On the Now page, swipe right on any task to complete it. Want me to show you?" | Navigate to / |
| "How do I delete a task?" | "Swipe left on any task to delete it. You can also tap the trash icon." | Navigate to /organize |

### Goals

| User Says | AI Response | Action |
|-----------|-------------|--------|
| "How do I create a goal?" | "Tap the ⚙️ icon on the Organize page to manage your goals." | Navigate to /organize, open goal modal |
| "Where are my goals?" | "Your goals are in Organize. Each section header is a goal." | Navigate to /organize |
| "How do I edit a goal?" | "Tap ⚙️ on Organize to see all your goals and edit them." | Navigate to /organize |

### Now Page

| User Says | AI Response | Action |
|-----------|-------------|--------|
| "What should I do now?" | "Let me pick something based on your energy. Head to Now." | Navigate to / |
| "Show me my current task" | "Taking you to the Now page where you can see what's up next." | Navigate to / |

### Settings

| User Says | AI Response | Action |
|-----------|-------------|--------|
| "How do I change settings?" | "Settings are in the gear icon. Let me take you there." | Navigate to /settings |
| "Where do I load sample data?" | "Settings → Load Sample Data. I'll take you there." | Navigate to /settings |

### General Help

| User Says | AI Response | Action |
|-----------|-------------|--------|
| "Help" / "How does this work?" | "I'm here to help you manage tasks without the overwhelm. What would you like to know?" | Show help options |
| "What can you do?" | "I can help you add tasks, organize your goals, and pick what to work on based on your energy. Just tell me what's on your mind." | - |

---

## Implementation

### Navigation Function

```typescript
// In Chat component or AI service
function navigateToPage(path: string, options?: { openModal?: string }) {
  // Use React Router navigate
  navigate(path)
  
  // Optional: trigger modal
  if (options?.openModal === 'goals') {
    // Emit event or set state to open goal modal
    window.dispatchEvent(new CustomEvent('open-goal-modal'))
  }
}
```

### AI Response Format

The AI should return structured responses:

```typescript
interface AIResponse {
  message: string
  action?: {
    type: 'navigate' | 'openModal' | 'none'
    target?: string  // path or modal name
  }
  suggestions?: string[]  // Follow-up options
}
```

### Chat UI

When AI offers navigation:

```
┌─────────────────────────────────┐
│ AI: Your tasks are in Organize. │
│     Want me to take you there?  │
│                                 │
│  [Take me there]  [Stay here]   │
└─────────────────────────────────┘
```

---

## Prompt Engineering

Add to system prompt:

```
When users ask "how do I" or "where is" questions about the app:
1. Give a brief, helpful answer
2. Offer to navigate them to the relevant page
3. Format navigation offers as: "Want me to take you there?" 

Available pages:
- / (Now page) - current task, swipe to complete
- /organize - all tasks grouped by goal, quick add
- /settings - app settings, load sample data
- /chat - talk to me (you're here!)

If user agrees to navigate, respond with: [NAVIGATE:/path]
```

---

## Intent Detection

Simple keyword matching for MVP:

```typescript
const intents = [
  {
    keywords: ['add task', 'create task', 'new task'],
    response: "You can add tasks from the quick add bar at the bottom of Organize, or just tell me what you need to do!",
    action: { type: 'navigate', target: '/organize' }
  },
  {
    keywords: ['my tasks', 'see tasks', 'all tasks', 'where are tasks'],
    response: "Your tasks are organized by goal. Let me take you there.",
    action: { type: 'navigate', target: '/organize' }
  },
  {
    keywords: ['complete task', 'finish task', 'done with task'],
    response: "On the Now page, swipe right on any task to complete it!",
    action: { type: 'navigate', target: '/' }
  },
  {
    keywords: ['goal', 'create goal', 'edit goal', 'my goals'],
    response: "Tap the ⚙️ icon on the Organize page to manage your goals.",
    action: { type: 'navigate', target: '/organize' }
  },
  {
    keywords: ['settings', 'preferences', 'options'],
    response: "Settings are in the gear icon. Let me take you there.",
    action: { type: 'navigate', target: '/settings' }
  },
  {
    keywords: ['sample data', 'demo', 'example tasks'],
    response: "Settings → Load Sample Data will give you 73 example tasks to play with.",
    action: { type: 'navigate', target: '/settings' }
  },
  {
    keywords: ['help', 'how does this work', 'what can you do'],
    response: "I'm here to help you manage tasks without the overwhelm. I can add tasks, organize your goals, and pick what to work on. What would you like to know?",
    action: null
  }
]

function detectIntent(userMessage: string): Intent | null {
  const lower = userMessage.toLowerCase()
  return intents.find(intent => 
    intent.keywords.some(kw => lower.includes(kw))
  ) || null
}
```

---

## Priority

### MVP (Do Now)
- [ ] Basic intent detection for navigation
- [ ] "Take me there" buttons in chat
- [ ] Handle 5-6 core "how do I" questions

### Later
- [ ] Smarter NLP intent detection
- [ ] Context-aware suggestions
- [ ] Proactive help ("I notice you haven't...")

---

*Spec by @miloshh_bot | 2026-02-01*
