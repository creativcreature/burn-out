# Planning Documents Index

This directory contains comprehensive planning documentation for implementing the **Weekly Reflection Summary with AI-Generated Insights** feature.

## Reading Order (Start Here)

### 1. **QUICK_START.md** ⭐ START HERE
**Read this first (5 min)** — 60-second overview, key decisions, command reference.
- What you're building
- Files to create and modify
- Implementation order
- Command reference
- Success criteria

### 2. **PLAN_SUMMARY.md**
**Quick reference (3 min)** — High-level summary in table format.
- Data model
- Files to create/modify
- Implementation order
- Key design decisions
- Testing checklist

### 3. **IMPLEMENTATION_PLAN_WEEKLY_REFLECTION_SUMMARY.md**
**Full specification (10 min)** — Complete 8-section plan with all details.
1. Product Requirements (user story, acceptance criteria)
2. Technical Design (data hierarchy, what to add where, data needs)
3. Implementation Plan (6 phases, file-by-file breakdown)
4. Implementation Sequence (step-by-step)
5. Verification & Manual Testing (5 test scenarios)
6. Dependencies & Constraints (what to respect)
7. Future Enhancements (out of scope)
8. Success Criteria (checklist)

### 4. **ARCHITECTURE_DIAGRAM.md**
**Visual reference (15 min)** — Flow diagrams, component hierarchy, type relationships.
- Data flow diagram
- Component hierarchy
- Type relationships
- AI integration flow
- Caching strategy
- Error handling scenarios
- File dependencies

### 5. **CODE_TEMPLATES.md**
**Implementation reference (copy-paste)** — Ready-to-use code templates.
1. Type Definition (WeeklySummary interface)
2. Storage Helpers (3 functions)
3. AI Integration (generateWeeklySummary)
4. Custom Hook (useWeeklySummary)
5. UI Component (WeeklySummaryCard)
6. Integration into Reflections page
7. Sample data
8. Implementation checklist

---

## File Summary

| Document | Purpose | Read Time | Use Case |
|----------|---------|-----------|----------|
| **QUICK_START.md** | Overview + essentials | 5 min | Get up to speed fast |
| **PLAN_SUMMARY.md** | Concise table format | 3 min | Quick reference during coding |
| **IMPLEMENTATION_PLAN_WEEKLY_REFLECTION_SUMMARY.md** | Detailed specification | 10 min | Full understanding of requirements |
| **ARCHITECTURE_DIAGRAM.md** | Visual flows + dependencies | 15 min | Understand system design |
| **CODE_TEMPLATES.md** | Ready-to-code templates | 20 min | Accelerate implementation |

---

## Feature Overview

**What:** Weekly reflection summary showing completed tasks, energy patterns, and mood trends with AI-generated personalized insights.

**Why:** Help neurodivergent users reflect on progress without cognitive burden and identify energy patterns for better planning.

**How:** 
1. User navigates to Reflections page
2. System calculates metrics from past 7 days (tasks, mood, time spent)
3. AI generates 2-3 sentence personalized insight
4. Summary displays with stats and insight, refresh button available

**Key Principle:** Energy-aware, affirming, NO gamification.

---

## Implementation Checklist

### Phase 1: Planning ✅ (You are here)
- [x] Create QUICK_START.md
- [x] Create PLAN_SUMMARY.md
- [x] Create IMPLEMENTATION_PLAN_WEEKLY_REFLECTION_SUMMARY.md
- [x] Create ARCHITECTURE_DIAGRAM.md
- [x] Create CODE_TEMPLATES.md

### Phase 2: Types & Data
- [ ] Add WeeklySummary interface to src/data/types.ts
- [ ] Extend BurnOutData with weeklySummaries array

### Phase 3: Utilities
- [ ] Add helpers to src/utils/storage.ts
- [ ] Add generateWeeklySummary to src/utils/ai.ts

### Phase 4: Hook
- [ ] Create src/hooks/useWeeklySummary.ts

### Phase 5: Component
- [ ] Create src/components/reflections/WeeklySummaryCard.tsx

### Phase 6: Integration
- [ ] Update src/pages/Reflections.tsx
- [ ] Add sample data (optional)

### Phase 7: Verification
- [ ] npm run typecheck
- [ ] npm run lint
- [ ] Manual testing (5 scenarios)
- [ ] Edge case testing

---

## Key Files to Modify

```
src/data/types.ts
├─ Add: WeeklySummary interface
└─ Update: BurnOutData (add weeklySummaries array)

src/utils/storage.ts
├─ Add: getLastWeekData()
├─ Add: getWeeklySummary()
└─ Add: saveWeeklySummary()

src/utils/ai.ts
└─ Add: generateWeeklySummary()

src/pages/Reflections.tsx
├─ Import: useWeeklySummary hook
├─ Import: WeeklySummaryCard component
└─ Add: <WeeklySummaryCard /> in JSX
```

## New Files to Create

```
src/hooks/useWeeklySummary.ts
src/components/reflections/WeeklySummaryCard.tsx
```

---

## Data Flow Summary

```
User on Reflections page
        ↓
  useWeeklySummary hook
        ↓
  getLastWeekData() → fetch past 7 days
        ↓
  calculateMetrics() → task counts, time, mood
        ↓
  generateWeeklySummary() → send to AI
        ↓
  Gemini API generates insight
        ↓
  saveWeeklySummary() → store in IndexedDB
        ↓
  WeeklySummaryCard renders stats + insight
```

---

## Design Constraints (DO NOT VIOLATE)

```
✓ NO new dependencies (use existing packages)
✓ NO gamification (no streaks, badges, achievements, points)
✓ NO localStorage (use IndexedDB only)
✓ CSS variables only (no hardcoded colors or fonts)
✓ Functional components (use hooks, no class components)
✓ Graceful degradation (stats display even if AI fails)
✓ Energy-aware language (affirmative, supportive tone)
✓ Respect user preferences (burnout mode + tone in AI)
```

---

## Testing Scenarios

| Scenario | Expected Result |
|----------|-----------------|
| User with active week | Summary displays with stats + insight |
| User with no recent activity | Empty state or placeholder shown |
| API failure | Stats display, error message for insight |
| Refresh button | Regenerates new insight |
| Different burnout modes | AI tone adapts to mode |
| First load | Auto-generates summary and caches |
| Manual refresh | Fetches new data and regenerates |

---

## Quick Commands

```bash
# Start development
npm run dev

# Check types after each change
npm run typecheck

# Check linting
npm run lint:file -- src/hooks/useWeeklySummary.ts

# Before submitting
npm run lint && npm run test

# View git status
git status
```

---

## Getting Help

1. **"What do I build?"** → Read QUICK_START.md
2. **"How do I structure it?"** → Read ARCHITECTURE_DIAGRAM.md
3. **"What's the detailed plan?"** → Read IMPLEMENTATION_PLAN_WEEKLY_REFLECTION_SUMMARY.md
4. **"Show me code"** → Read CODE_TEMPLATES.md
5. **"Quick reference"** → Read PLAN_SUMMARY.md

---

## Implementation Tips

1. **Start with types** — Get the data structure right first
2. **Add storage helpers** — Before the hook, ensure data access works
3. **Build the hook** — Core logic independent of UI
4. **Create the component** — UI layer consuming hook
5. **Integrate last** — Tie it into the page
6. **Test early, test often** — Run typecheck after each phase

---

## Files You Don't Need to Modify

- `src/components/shared/*` (Card, Button, etc. already exist)
- `src/pages/Now.tsx` (separate page)
- `src/pages/Chat.tsx` (separate page)
- `src/hooks/useTasks.ts` (read-only data access)
- `src/utils/ai.ts` sendMessage() (keep existing function)

---

## Success Looks Like

✅ Reflections page shows weekly summary card
✅ Summary displays task count, energy breakdown, mood
✅ "Refresh Insights" button works
✅ AI insight respects burnout mode and tone
✅ No gamification language anywhere
✅ TypeScript check passes
✅ ESLint passes
✅ All 5 test scenarios pass
✅ Component handles errors gracefully
✅ Empty state displays when no data

---

## Document Version

Created: 2026-01-25
Feature: Weekly Reflection Summary with AI Insights
Version: 1.0
Status: Ready for Implementation

For questions or updates, refer to the detailed documents in this directory.
