# Sample Data — Realistic Task Load

> Simulates a busy professional managing work, personal, health, and side projects.

---

## Goals (5-7 active)

```json
[
  { "id": "goal-1", "title": "Launch Startup MVP", "timeframe": "3m" },
  { "id": "goal-2", "title": "Get Healthier", "timeframe": "1y" },
  { "id": "goal-3", "title": "Financial Freedom", "timeframe": "5y" },
  { "id": "goal-4", "title": "Learn Spanish", "timeframe": "1y" },
  { "id": "goal-5", "title": "Strengthen Relationships", "timeframe": "ongoing" },
  { "id": "goal-6", "title": "Home Improvement", "timeframe": "6m" }
]
```

---

## Tasks (60+ realistic tasks)

### 🚀 Launch Startup MVP (15 tasks)
```json
[
  { "title": "Fix production bug in auth flow", "dueDate": "today", "goalId": "goal-1" },
  { "title": "Review PR from contractor", "dueDate": "today", "goalId": "goal-1" },
  { "title": "Write API documentation", "dueDate": "tomorrow", "goalId": "goal-1" },
  { "title": "Set up error monitoring (Sentry)", "dueDate": "this week", "goalId": "goal-1" },
  { "title": "Design onboarding flow mockups", "dueDate": "this week", "goalId": "goal-1" },
  { "title": "Interview 3 potential users", "dueDate": "this week", "goalId": "goal-1" },
  { "title": "Set up analytics (Mixpanel)", "goalId": "goal-1" },
  { "title": "Create investor pitch deck", "dueDate": "next week", "goalId": "goal-1" },
  { "title": "Research competitors", "goalId": "goal-1" },
  { "title": "Write landing page copy", "goalId": "goal-1" },
  { "title": "Set up Stripe payments", "goalId": "goal-1" },
  { "title": "Create demo video", "goalId": "goal-1" },
  { "title": "Submit to Product Hunt", "goalId": "goal-1" },
  { "title": "Reach out to 10 potential beta users", "goalId": "goal-1" },
  { "title": "Set up customer support (Intercom)", "goalId": "goal-1" }
]
```

### 💪 Get Healthier (12 tasks)
```json
[
  { "title": "Morning walk (30 min)", "dueDate": "today", "recurring": "daily", "goalId": "goal-2" },
  { "title": "Meal prep for the week", "dueDate": "Sunday", "recurring": "weekly", "goalId": "goal-2" },
  { "title": "Book annual physical", "dueDate": "this week", "goalId": "goal-2" },
  { "title": "Research gym memberships", "goalId": "goal-2" },
  { "title": "Buy new running shoes", "goalId": "goal-2" },
  { "title": "Schedule dentist appointment", "goalId": "goal-2" },
  { "title": "Try new healthy recipe", "dueDate": "this week", "goalId": "goal-2" },
  { "title": "Meditate 10 min", "recurring": "daily", "goalId": "goal-2" },
  { "title": "Drink 8 glasses of water", "recurring": "daily", "goalId": "goal-2" },
  { "title": "No screens after 10pm", "recurring": "daily", "goalId": "goal-2" },
  { "title": "Get blood work done", "goalId": "goal-2" },
  { "title": "Research sleep tracking apps", "goalId": "goal-2" }
]
```

### 💰 Financial Freedom (10 tasks)
```json
[
  { "title": "Review monthly budget", "dueDate": "1st of month", "recurring": "monthly", "goalId": "goal-3" },
  { "title": "Max out Roth IRA contribution", "dueDate": "April", "goalId": "goal-3" },
  { "title": "Rebalance investment portfolio", "dueDate": "this quarter", "goalId": "goal-3" },
  { "title": "Cancel unused subscriptions", "dueDate": "this week", "goalId": "goal-3" },
  { "title": "Research high-yield savings accounts", "goalId": "goal-3" },
  { "title": "Set up automatic transfers to savings", "goalId": "goal-3" },
  { "title": "Review credit card rewards", "goalId": "goal-3" },
  { "title": "Update beneficiaries on accounts", "goalId": "goal-3" },
  { "title": "Create emergency fund (3 months)", "goalId": "goal-3" },
  { "title": "Meet with financial advisor", "goalId": "goal-3" }
]
```

### 🇪🇸 Learn Spanish (8 tasks)
```json
[
  { "title": "Duolingo lesson", "recurring": "daily", "goalId": "goal-4" },
  { "title": "Watch Spanish show (with subtitles)", "dueDate": "this week", "goalId": "goal-4" },
  { "title": "Book iTalki tutor session", "goalId": "goal-4" },
  { "title": "Review 50 flashcards", "recurring": "daily", "goalId": "goal-4" },
  { "title": "Listen to Spanish podcast on commute", "recurring": "daily", "goalId": "goal-4" },
  { "title": "Write journal entry in Spanish", "dueDate": "this week", "goalId": "goal-4" },
  { "title": "Join Spanish conversation group", "goalId": "goal-4" },
  { "title": "Change phone language to Spanish", "goalId": "goal-4" }
]
```

### ❤️ Strengthen Relationships (10 tasks)
```json
[
  { "title": "Call mom", "dueDate": "today", "recurring": "weekly", "goalId": "goal-5" },
  { "title": "Plan date night", "dueDate": "this week", "goalId": "goal-5" },
  { "title": "Send birthday card to uncle", "dueDate": "Feb 15", "goalId": "goal-5" },
  { "title": "Organize dinner with college friends", "dueDate": "this month", "goalId": "goal-5" },
  { "title": "Reply to Sarah's text", "dueDate": "today", "goalId": "goal-5" },
  { "title": "Buy anniversary gift", "dueDate": "Feb 20", "goalId": "goal-5" },
  { "title": "Schedule coffee with mentor", "goalId": "goal-5" },
  { "title": "Write thank you note to boss", "goalId": "goal-5" },
  { "title": "Plan weekend trip with partner", "goalId": "goal-5" },
  { "title": "Attend nephew's soccer game", "dueDate": "Saturday", "goalId": "goal-5" }
]
```

### 🏠 Home Improvement (8 tasks)
```json
[
  { "title": "Fix leaky faucet", "dueDate": "this weekend", "goalId": "goal-6" },
  { "title": "Organize garage", "goalId": "goal-6" },
  { "title": "Get quotes for new windows", "goalId": "goal-6" },
  { "title": "Deep clean kitchen", "dueDate": "this week", "goalId": "goal-6" },
  { "title": "Replace smoke detector batteries", "goalId": "goal-6" },
  { "title": "Research smart thermostat", "goalId": "goal-6" },
  { "title": "Declutter closet", "goalId": "goal-6" },
  { "title": "Fix squeaky door", "goalId": "goal-6" }
]
```

### 📥 Inbox (ungrouped - 10 tasks)
```json
[
  { "title": "Return Amazon package", "dueDate": "today" },
  { "title": "Renew car registration", "dueDate": "Feb 28" },
  { "title": "Pick up dry cleaning", "dueDate": "tomorrow" },
  { "title": "Research new laptop", "notes": "Current one is 5 years old" },
  { "title": "Update LinkedIn profile" },
  { "title": "Cancel free trial before it charges" },
  { "title": "RSVP to wedding", "dueDate": "this week" },
  { "title": "Get passport renewed" },
  { "title": "Schedule car oil change" },
  { "title": "Buy concert tickets" }
]
```

---

## Summary

| Category | Count |
|----------|-------|
| Launch Startup MVP | 15 |
| Get Healthier | 12 |
| Financial Freedom | 10 |
| Learn Spanish | 8 |
| Strengthen Relationships | 10 |
| Home Improvement | 8 |
| Inbox (ungrouped) | 10 |
| **TOTAL** | **73 tasks** |

---

## Implementation

Convert this to actual seed data in `src/data/sampleData.ts`:

```typescript
export const sampleGoals: Goal[] = [...]
export const sampleTasks: Task[] = [...]
```

Load on first app launch if no existing data.

---

*Created by @miloshh_bot | 2026-02-01*
