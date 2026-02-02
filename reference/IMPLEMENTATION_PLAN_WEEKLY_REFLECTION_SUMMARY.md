# Implementation Plan: Weekly Reflection Summary with AI-Generated Insights

## 1. Product Requirements

### User Story
**As a** neurodivergent user managing my energy and productivity,
**I want to** receive an AI-generated summary of my weekly accomplishments and patterns based on completed tasks,
**So that** I can reflect on progress without cognitive burden and identify energy patterns for better planning.

### Acceptance Criteria
- [ ] Weekly summary displays on the Reflections page when user has completed tasks in the past 7 days
- [ ] Summary includes: total tasks completed, high-energy vs low-energy task breakdown, time spent per verb label, mood patterns from journal entries
- [ ] AI generates 2-3 sentence personalized insight about the week's achievements and energy patterns
- [ ] AI respects user's burnout mode and tone preference in the insight message
- [ ] Summary can be manually refreshed to regenerate AI insights
- [ ] No gamification elements (no streaks, badges, achievement language)
- [ ] Summary is cached; AI call only happens when user requests or at weekly interval (Mon 00:00)
- [ ] Graceful fallback if AI API fails (show stats without insight)

---

## 2. Technical Design

### Data Hierarchy & Context
- **Goal → Project → Task/Habit** hierarchy is maintained
- **CompletedTask** contains task metadata: duration, energyBefore, energyAfter, notes
- **JournalEntry** captures mood ('struggling' | 'okay' | 'good' | 'great') and reflections
- **UserProfile** contains burnoutMode and tonePreference for context

### Where to Add Feature

#### New Data Type: WeeklySummary (in `src/data/types.ts`)
```typescript
interface WeeklySummary {
  id: string
  weekStartDate: string        // YYYY-MM-DD (Monday of week)
  completedTaskCount: number
  lowEnergyTaskCount: number
  mediumEnergyTaskCount: number
  highEnergyTaskCount: number
  timePerVerbLabel: Record<string, number>  // e.g. { "Deep Work": 120, "Quick Win": 45 }
  moodBreakdown: Record<string, number>     // e.g. { "great": 2, "good": 3, "okay": 1 }
  aiInsight: string            // AI-generated message
  generatedAt: string          // ISO timestamp
  userEnergyPattern?: string   // Optional: detected pattern (e.g. "high mornings, low evenings")
}
```

#### BurnOutData Extension (in `src/data/types.ts`)
Add `weeklySummaries: WeeklySummary[]` to the BurnOutData interface.

### Data Needs for AI Prompt
The weekly reflection system needs:
1. **Completed tasks from past 7 days**: verb label, duration, feedLevel, goal (if any)
2. **Journal entries from past 7 days**: mood and content
3. **User context**: burnoutMode, tonePreference
4. **Task metrics**: time aggregation per verb label, energy level breakdown

### AI Integration Point
- Use existing `sendMessage()` from `src/utils/ai.ts`
- Extend with new system prompt for weekly reflection context
- Return structured insight (string only, no task extraction needed)

---

## 3. Implementation Plan

### Phase 1: Data Layer (Types + Storage)

#### File: `src/data/types.ts`
**Changes:**
- Add `WeeklySummary` interface with all fields listed above
- Add `weeklySummaries: WeeklySummary[]` to `BurnOutData`

**Why:** Foundation for storing and retrieving summaries.

---

### Phase 2: Utility Functions

#### File: `src/utils/ai.ts`
**Changes:**
- Add new function: `generateWeeklySummary(weekData: WeeklyData, config: AIConfig): Promise<string>`
- New system prompt for weekly reflection (not task extraction)
- Example prompt:
```
You are analyzing a user's weekly productivity and energy data.

User Mode: {burnoutMode}
Tone: {tonePreference}

This week they completed {taskCount} tasks with the following breakdown:
- High-energy tasks: {count}
- Medium-energy tasks: {count}
- Low-energy tasks: {count}

Time spent on activities:
{verb label breakdown}

Mood entries show: {mood breakdown}

Provide 2-3 sentences reflecting on their week. Focus on:
1. What they accomplished (be affirming, no pressure language)
2. Energy patterns you notice
3. One supportive observation about their progress

IMPORTANT: No gamification language. No streaks, badges, or achievement language.
```

**Why:** Separates weekly summary generation from task extraction logic.

#### File: `src/utils/storage.ts`
**Changes:**
- Add helper function: `getWeeklySummary(weekStartDate: string): Promise<WeeklySummary | null>`
- Add helper function: `saveWeeklySummary(summary: WeeklySummary): Promise<void>`
- Add helper function: `getLastWeekData(): Promise<CompletedTask[], JournalEntry[]>` to fetch data for the past 7 days

**Why:** Centralized storage operations for summaries.

---

### Phase 3: Custom Hook

#### File: `src/hooks/useWeeklySummary.ts` (NEW)
**Responsibilities:**
- Load stored weekly summary for current week
- Calculate metrics from completed tasks and journal entries
- Call AI to generate insights
- Handle caching and refresh logic
- Manage loading/error states

**Key functions:**
```typescript
export function useWeeklySummary() {
  const [summary, setSummary] = useState<WeeklySummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const generateSummary = useCallback(async (): Promise<WeeklySummary | null> => { ... }
  const refreshSummary = useCallback(async (): Promise<void> => { ... }

  return { summary, isLoading, error, generateSummary, refreshSummary }
}
```

**Why:** Reusable logic for summary generation and management.

---

### Phase 4: UI Component

#### File: `src/components/reflections/WeeklySummaryCard.tsx` (NEW)
**Responsibilities:**
- Display summary stats in grid (tasks completed, mood breakdown, time per activity)
- Show AI-generated insight in a card
- Provide "Refresh Insights" button
- Loading and error states
- No gamification styling (no badges, stars, etc.)

**Layout:**
```
┌─────────────────────────────────────────┐
│ This Week's Summary                     │
├─────────────────────────────────────────┤
│ Tasks Completed: 12   |  Avg Duration: 25 min
│ High Energy: 4        |  Low Energy: 5
│ Mood: Good (5) / Okay (2) / Struggling (1)
├─────────────────────────────────────────┤
│ Time Breakdown by Activity:             │
│ Deep Work: 120 min  |  Quick Win: 30 min
│ Review: 45 min      |  Plan: 20 min     │
├─────────────────────────────────────────┤
│ [AI Insight Card]                       │
│ "This week you focused on deep creative │
│  work while maintaining balance. Your   │
│  energy was strongest in mornings—      │
│  consider protecting that time."        │
│                                         │
│ [Refresh]                               │
└─────────────────────────────────────────┘
```

**Why:** Focused, non-gamified presentation of insights.

---

### Phase 5: Integration into Reflections Page

#### File: `src/pages/Reflections.tsx`
**Changes:**
- Import `WeeklySummaryCard` and `useWeeklySummary`
- Add section "Weekly Insights" above or below "Your Progress"
- Display summary only if there are completed tasks in past 7 days
- Handle loading/error states

**Why:** Makes insights discoverable without overwhelming the page.

---

### Phase 6: Storage Migration (Future)

#### File: `src/utils/storage.ts`
**Changes:**
- Extend `migrateIfNeeded()` to add empty `weeklySummaries: []` if migrating from older versions

**Why:** Ensure data schema consistency for users upgrading.

---

## 4. Implementation Sequence

### Step 1: Extend Data Types
1. Update `src/data/types.ts`: Add WeeklySummary interface and extend BurnOutData
2. Update `src/utils/storage.ts`: Add sample weeklySummaries to createSampleData()

### Step 2: Create Utility Functions
1. Add `getLastWeekData()` to storage.ts
2. Add `getWeeklySummary()` and `saveWeeklySummary()` to storage.ts
3. Add `generateWeeklySummary()` to ai.ts

### Step 3: Create Hook
1. Create `src/hooks/useWeeklySummary.ts` with full implementation
2. Test hook independently with mock data

### Step 4: Create UI Component
1. Create `src/components/reflections/WeeklySummaryCard.tsx`
2. Style with CSS variables (no inline styles)
3. Build loading and error states

### Step 5: Integrate into Page
1. Update `src/pages/Reflections.tsx`
2. Position summary in the UI

### Step 6: Testing & Verification
1. Run typecheck
2. Run tests
3. Manual testing with sample data

---

## 5. Verification & Manual Testing

### Test Scenarios

#### Scenario 1: User with Active Week
**Setup:**
- Load sample data with 7+ completed tasks from past week
- Has 3+ journal entries with varied moods

**Expected Behavior:**
- WeeklySummaryCard renders with stats populated
- AI insight displays supportive, non-gamified message
- Refresh button works and regenerates insight
- Page does not show "No data" state

**Steps:**
1. Go to Reflections page
2. Verify card appears with stats
3. Click "Refresh" button
4. Verify new insight generates

#### Scenario 2: User with No Recent Activity
**Setup:**
- Load sample data with no completed tasks in past 7 days

**Expected Behavior:**
- WeeklySummaryCard does not render (or shows placeholder "No completed tasks this week")
- Page gracefully handles empty state

**Steps:**
1. Go to Reflections page
2. Verify card does not appear or shows empty state message

#### Scenario 3: API Failure
**Setup:**
- Mock AI API to return error

**Expected Behavior:**
- Stats still display
- AI insight shows error message (not broken UI)
- Refresh button allows retry
- App remains stable

**Steps:**
1. Disable API key or mock failure
2. Refresh page
3. Verify stats show but insight shows error
4. Fix API and retry refresh

#### Scenario 4: Different Burnout Modes
**Setup:**
- Create separate test with recovery, prevention, balanced modes

**Expected Behavior:**
- AI insight adapts tone based on burnoutMode
- Recovery mode is gentler and affirming
- Balanced mode is encouraging
- Prevention mode acknowledges boundary-setting

**Steps:**
1. Change user.burnoutMode in settings
2. Go to Reflections
3. Refresh insights
4. Verify tone matches mode

#### Scenario 5: First Load (No Summary Cached)
**Setup:**
- Fresh IndexedDB with no weeklySummaries

**Expected Behavior:**
- Hook generates summary on first render
- Loading state shows briefly
- Summary renders once generated
- Summary is cached in storage

**Steps:**
1. Clear storage
2. Load sample data
3. Go to Reflections
4. Verify loading spinner appears then disappears
5. Verify stats and insight render

### Type Checking & Linting
```bash
npm run typecheck          # Verify no TypeScript errors
npm run lint:file -- src/data/types.ts
npm run lint:file -- src/utils/ai.ts
npm run lint:file -- src/hooks/useWeeklySummary.ts
npm run lint:file -- src/components/reflections/WeeklySummaryCard.tsx
npm run lint:file -- src/pages/Reflections.tsx
```

### Test Coverage
```bash
npm run test -- -t "WeeklySummary"     # All weeklySummary tests
npm run test -- -t "useWeeklySummary"  # Hook tests
```

---

## 6. Dependencies & Constraints

### Existing Dependencies
- React 18, TypeScript, Vite
- IndexedDB via idb-keyval (already used)
- Gemini API (already integrated via sendMessage)
- CSS Variables system (already in place)

### No New Dependencies
This feature uses only existing packages.

### Constraints to Respect
- **NO gamification**: No language about streaks, achievements, badges, points
- **NO localStorage**: Only IndexedDB (already using idb-keyval)
- **NO time estimates in user-facing text**: Hide duration math from users
- **CSS Variables only**: Use `var(--*)` for all styling
- **Functional components**: Use hooks, no class components
- **Energy-aware framing**: Positive, affirming tone

---

## 7. Future Enhancements (Not in Scope)

- Email weekly summary delivery
- Multi-week trend analysis (identify patterns over months)
- Energy pattern tracking (graphical visualization)
- Goal progress connected to weekly summary
- Peer comparison toggle (respecting privacy)
- Export weekly summary as PDF

---

## 8. Success Criteria

- [ ] Reflections page displays weekly summary with stats when data exists
- [ ] AI generates personalized, non-gamified insights
- [ ] Summary respects burnout mode and tone preference
- [ ] Graceful handling of no-data, loading, and error states
- [ ] All TypeScript types valid
- [ ] All linting passes
- [ ] Manual testing passes all 5 scenarios
- [ ] No new dependencies added
- [ ] CSS follows variable-only convention
