# Weekly Reflection Summary - Architecture Diagram

## Data Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│ Reflections Page (src/pages/Reflections.tsx)                        │
│  - Renders existing progress stats                                   │
│  - NEW: Renders WeeklySummaryCard component                          │
└──────────────┬───────────────────────────────────────────────────────┘
               │
               │ Uses hook
               ▼
┌──────────────────────────────────────────────────────────────────────┐
│ useWeeklySummary Hook (src/hooks/useWeeklySummary.ts)              │
│                                                                      │
│ Responsibilities:                                                    │
│ - Load cached summary from storage                                   │
│ - Calculate metrics (task counts, time per activity, mood)          │
│ - Call generateWeeklySummary() when refresh needed                  │
│ - Save generated summary to storage                                  │
│ - Manage loading/error states                                        │
│                                                                      │
│ State:                                                               │
│ - summary: WeeklySummary | null                                      │
│ - isLoading: boolean                                                 │
│ - error: Error | null                                                │
│                                                                      │
│ Functions:                                                           │
│ - generateSummary(): Promise<WeeklySummary>                         │
│ - refreshSummary(): Promise<void>                                    │
└──────────────┬───────────────────────────────────────────────────────┘
               │
         ┌─────┴──────────────┐
         │                    │
    Calls│                    │Reads/Writes
         ▼                    ▼
    ┌──────────────┐   ┌──────────────────┐
    │ generateWeek │   │ Storage Helpers  │
    │ lySummary() │   │ (storage.ts)     │
    │ (ai.ts)     │   │                  │
    │             │   │ - getLastWeek    │
    │ - Fetch AI  │   │   Data()         │
    │ - Build     │   │ - getWeekly      │
    │   prompt    │   │   Summary()      │
    │ - Return    │   │ - saveWeekly     │
    │   insight   │   │   Summary()      │
    └────┬────────┘   └──────────────────┘
         │                    │
    Calls│                    │Reads
         │         ┌──────────┴──────────────┐
         │         │                         │
         └─────┬───┘                         │
               │                             │
               ▼                             ▼
    ┌─────────────────────────────┐   ┌──────────────────┐
    │ Gemini API                   │   │ IndexedDB        │
    │ (sendMessage)                │   │ (idb-keyval)     │
    │                              │   │                  │
    │ Receives:                    │   │ Stores:          │
    │ - Week metrics (task counts) │   │ - completedTasks │
    │ - User context (burnout mode)│   │ - journalEntries │
    │ - Mood data from journal     │   │ - weeklySummaries│
    │ - Tone preference            │   │ - user profile   │
    │                              │   │ - all app data   │
    │ Returns:                     │   │                  │
    │ - 2-3 sentence insight       │   └──────────────────┘
    │   (supportive, affirming)    │
    └─────────────────────────────┘
```

---

## Component Hierarchy

```
App
└── AppLayout (page layout with nav)
    └── Reflections Page
        ├── Header (title)
        ├── Progress Section
        │   ├── Card: Tasks Completed
        │   ├── Card: In Progress
        │   ├── Card: This Week
        │   └── Card: Avg. Minutes
        │
        ├── NEW: Weekly Summary Section
        │   └── WeeklySummaryCard
        │       ├── Loading Spinner (conditional)
        │       ├── Metrics Grid
        │       │   ├── Tasks Completed
        │       │   ├── Energy Breakdown (Low/Med/High)
        │       │   ├── Mood Distribution
        │       │   └── Time per Activity
        │       ├── AI Insight Card
        │       │   ├── Insight Text (from AI)
        │       │   └── "Refresh Insights" Button
        │       └── Error Message (conditional)
        │
        ├── Journal Section
        │   └── Card: Garden (existing)
        │
        └── Note: "This is a place to reflect..."
```

---

## Type Relationships

```
BurnOutData
├── weeklySummaries: WeeklySummary[]  ← NEW
│
CompletedTask (existing, used by summary)
├── id
├── taskId / habitId
├── completedAt
├── duration ← used for time aggregation
├── energyBefore ← used for energy breakdown
├── energyAfter
└── notes

JournalEntry (existing, used by summary)
├── id
├── date
├── content
├── mood ← 'great' | 'good' | 'okay' | 'struggling'
├── createdAt
└── updatedAt

WeeklySummary ← NEW
├── id
├── weekStartDate: string (YYYY-MM-DD)
├── completedTaskCount: number ← from CompletedTask
├── lowEnergyTaskCount: number ← from Task.feedLevel
├── mediumEnergyTaskCount: number
├── highEnergyTaskCount: number
├── timePerVerbLabel: Record<string, number> ← aggregated from CompletedTask.duration
├── moodBreakdown: Record<string, number> ← from JournalEntry.mood
├── aiInsight: string ← from generateWeeklySummary()
├── generatedAt: string (ISO)
└── userEnergyPattern?: string

UserProfile (existing, used for context)
├── burnoutMode: 'recovery' | 'prevention' | 'balanced' ← affects AI tone
├── tonePreference: 'gentle' | 'direct' | 'playful' ← affects AI tone
└── energyDefaults
```

---

## AI Integration

```
Weekly Summary Generation Flow
═════════════════════════════

1. User clicks "Refresh Insights" or first load
   │
2. useWeeklySummary hook calls generateWeeklySummary()
   │
3. generateWeeklySummary() in ai.ts:
   ├─ Calls getLastWeekData() to fetch last 7 days
   ├─ Builds system prompt with:
   │  ├─ burnoutMode instruction (affects tone)
   │  ├─ tonePreference instruction (affects voice)
   │  ├─ Task metrics (counts, time breakdown)
   │  └─ Mood breakdown from journal
   ├─ Calls sendMessage() (Gemini API)
   └─ Returns insight string (or error handling)
   │
4. Hook saves result as WeeklySummary to storage
   │
5. Component re-renders with insight displayed
```

### Prompt Structure
```
System Instruction:
"You are a supportive wellness coach analyzing weekly productivity..."

Context Injection:
"This week the user completed {taskCount} tasks.
Time breakdown: {verb labels with minutes}
Energy was split: High {count}, Medium {count}, Low {count}
Mood entries show: {mood breakdown}
User mode: {burnoutMode} (affects how you encourage)
Tone: {tonePreference} (affects your voice)"

Output Format:
"Generate 2-3 sentences reflecting on their week.
Focus on: achievements, energy patterns, one supportive observation.
IMPORTANT: No gamification, no streaks/badges/achievement language."
```

---

## Caching Strategy

```
Flow: First Load vs Refresh
═════════════════════════════

FIRST LOAD
┌─────────────────────────────────────┐
│ Reflections page mounts              │
│ useWeeklySummary initializes         │
└────────────┬────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ Check storage for this week's summary    │
│ (weekStartDate = Monday of current week) │
└────────────┬─────────────────────────────┘
             │
        ┌────┴────────────┐
        │                 │
    Found            Not found
        │                 │
        ├────────┬────────┤
        │        │        │
        │   Generate   Fallback
        │   AI insight
        │   (loading    (show stats
        │    state)     without insight)
        │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │ Save summary    │
        │ to storage      │
        └────────┬────────┘
                 │
        ┌────────▼────────────┐
        │ Render card with    │
        │ stats + insight     │
        └─────────────────────┘

MANUAL REFRESH
┌──────────────────────────────────────┐
│ User clicks "Refresh Insights" button │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────┐
│ Set isLoading = true         │
│ Call generateWeeklySummary() │
└────────────┬────────────────┘
             │
             ▼
┌──────────────────────────────┐
│ AI generates new insight     │
│ Save with new generatedAt    │
└────────────┬────────────────┘
             │
             ▼
┌──────────────────────────────┐
│ Set isLoading = false        │
│ Re-render with new insight   │
└──────────────────────────────┘
```

---

## Styling Architecture

```
CSS Variable Dependency
═════════════════════════

WeeklySummaryCard uses:
├── Colors
│   ├── --text (body text)
│   ├── --text-muted (secondary text)
│   ├── --orb-orange (accent for numbers)
│   ├── --bg-card (card background)
│   └── --border (card border)
├── Typography
│   ├── --font-display (Playfair for heading)
│   ├── --text-lg (large text)
│   ├── --text-sm (small text)
│   └── --text-xs (tiny labels)
├── Spacing
│   ├── --space-sm
│   ├── --space-md
│   └── --space-lg
├── Effects
│   ├── --shadow (card shadow)
│   ├── --glass-blur (backdrop filter)
│   └── --radius-md (border radius)
└── Animation
    └── --transition-fast (smooth transitions)

All styles:
✓ Imported from src/styles/variables.css
✓ Applied via CSS variables in CSSProperties
✓ NO inline hardcoded colors
✓ NO inline hardcoded fonts
✓ NO CSS-in-JS (use variables only)
```

---

## Error Handling

```
Error Scenarios
═══════════════════════════════

Scenario 1: API Key Missing
│
├─ sendMessage() returns error message
├─ generateWeeklySummary() catches
├─ Insight shows: "Unable to generate insight (no API key)"
└─ Stats still display ✓

Scenario 2: Network Error
│
├─ Gemini API call fails
├─ generateWeeklySummary() catches
├─ Insight shows: "Unable to connect. Please try again."
├─ Refresh button allows retry
└─ Stats still display ✓

Scenario 3: Invalid Response
│
├─ Gemini returns unexpected format
├─ generateWeeklySummary() parses safely
├─ Falls back to generic message
└─ Stats still display ✓

Scenario 4: Storage Corruption
│
├─ getLastWeekData() catches error
├─ Returns empty arrays safely
├─ Hook shows empty state gracefully
└─ No crash ✓
```

---

## File Dependencies

```
Dependency Graph
════════════════

src/pages/Reflections.tsx
├── uses: useWeeklySummary
├── renders: WeeklySummaryCard
└── imports: Header, AppLayout, Card

src/hooks/useWeeklySummary.ts
├── imports: generateWeeklySummary (from utils/ai)
├── imports: getLastWeekData, getWeeklySummary,
│            saveWeeklySummary (from utils/storage)
├── imports: WeeklySummary type (from data/types)
└── uses: useState, useCallback, useEffect

src/components/reflections/WeeklySummaryCard.tsx
├── imports: CSSProperties, ReactNode
├── imports: Card (shared component)
├── receives: useWeeklySummary result via props
└── uses: CSS variables for styling

src/utils/ai.ts (MODIFIED)
├── adds: generateWeeklySummary()
├── still has: sendMessage() (unchanged)
└── imports: AI config types

src/utils/storage.ts (MODIFIED)
├── adds: getLastWeekData()
├── adds: getWeeklySummary()
├── adds: saveWeeklySummary()
├── uses: existing getData(), updateData()
└── imports: CompletedTask, JournalEntry, WeeklySummary types

src/data/types.ts (MODIFIED)
├── adds: WeeklySummary interface
├── updates: BurnOutData with weeklySummaries array
└── already has: CompletedTask, JournalEntry, UserProfile

src/data/storage.ts (MODIFIED)
├── updates: createSampleData() to include sample weeklySummaries
└── updates: migrateIfNeeded() to handle schema changes
```
