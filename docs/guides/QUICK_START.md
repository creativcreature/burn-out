# Quick Start: Weekly Reflection Summary Implementation

## What You Need to Know in 60 Seconds

**Feature:** AI-powered weekly insights on the Reflections page summarizing completed tasks, energy patterns, and mood trends.

**Key Principle:** Energy-aware, affirming insights for neurodivergent users. NO gamification.

---

## 3 Files to Create

1. **`src/hooks/useWeeklySummary.ts`** — Logic for generating, caching, refreshing summaries
2. **`src/components/reflections/WeeklySummaryCard.tsx`** — UI component displaying stats + AI insight
3. (Optional) **`src/components/reflections/`** directory if it doesn't exist

---

## 5 Files to Modify

| File | Change | Size |
|------|--------|------|
| `src/data/types.ts` | Add `WeeklySummary` interface + extend `BurnOutData` | ~20 lines |
| `src/utils/ai.ts` | Add `generateWeeklySummary()` function | ~60 lines |
| `src/utils/storage.ts` | Add 3 helper functions | ~50 lines |
| `src/pages/Reflections.tsx` | Import & render `WeeklySummaryCard` | ~15 lines |
| `src/utils/storage.ts` | Add sample data (optional) | ~20 lines |

---

## Implementation Path (Order Matters)

```
1. src/data/types.ts           ← Start here
   │
2. src/utils/storage.ts        ← Add helpers
   │
3. src/utils/ai.ts             ← Add AI generation
   │
4. src/hooks/useWeeklySummary.ts  ← Create hook
   │
5. src/components/reflections/WeeklySummaryCard.tsx  ← Build UI
   │
6. src/pages/Reflections.tsx    ← Integrate
   │
7. npm run typecheck && npm run lint  ← Verify
```

---

## What Each Part Does

```
User clicks "Refresh Insights" on Reflections page
                    ↓
        WeeklySummaryCard (UI)
                    ↓
        useWeeklySummary Hook
        ├─ Fetches last 7 days of tasks + journal
        ├─ Calculates metrics
        └─ Calls generateWeeklySummary()
                    ↓
        generateWeeklySummary() in ai.ts
        ├─ Builds prompt with week data
        ├─ Sends to Gemini API
        └─ Returns 2-3 sentence insight
                    ↓
        Saves summary to IndexedDB
                    ↓
        UI updates with insight
```

---

## Key Data You Need

To generate the summary, you need:

```
From CompletedTask (last 7 days):
├─ count (how many tasks)
├─ duration (aggregate time per verb label)
└─ feedLevel (high/medium/low energy split)

From JournalEntry (last 7 days):
└─ mood ('great', 'good', 'okay', 'struggling')

From UserProfile:
├─ burnoutMode (recovery/prevention/balanced)
└─ tonePreference (gentle/direct/playful)
```

---

## CSS Approach: Variables Only

```javascript
// ✓ Correct
const style = {
  color: 'var(--orb-orange)',
  fontSize: 'var(--text-sm)',
  padding: 'var(--space-md)'
}

// ✗ Wrong
const style = {
  color: '#ff6b35',      // Use variables!
  fontSize: '14px',      // Use variables!
  padding: '12px'        // Use variables!
}
```

---

## Testing You Must Do

1. **Load Reflections page** → Should show summary with stats
2. **Click Refresh** → Should regenerate insight (loading state appears)
3. **Check different modes** → Change burnoutMode in settings, refresh, verify tone changes
4. **Test no-data state** → Clear completed tasks, verify empty state
5. **Run typecheck** → `npm run typecheck` should pass
6. **Run lint** → `npm run lint` should pass

---

## Common Mistakes to Avoid

❌ **Hardcoding colors** → Always use `var(--text)`, `var(--orb-orange)`, etc.
❌ **Inline styles everywhere** → Extract to CSSProperties objects
❌ **Async/await without error handling** → Always wrap in try/catch
❌ **Gamification language** → No "streak", "achievement", "badge" terminology
❌ **Assuming summary exists** → Always check for null; show empty state
❌ **Not handling API failures** → Show stats even if AI fails

---

## Debug Checklist

If something breaks:

```
☐ Check console for errors
☐ Verify IndexedDB has weeklySummaries array
☐ Verify API key is set (VITE_GOOGLE_API_KEY)
☐ Check that CompletedTask data exists for past 7 days
☐ Verify types compile: npm run typecheck
☐ Check WeeklySummaryCard renders: <WeeklySummaryCard ... />
☐ Verify useWeeklySummary hook initializes state correctly
☐ Test API manually: Check Gemini API status page
```

---

## File Structure After Implementation

```
src/
├── components/
│   ├── reflections/
│   │   └── WeeklySummaryCard.tsx      ← NEW
│   └── shared/
│       ├── Card.tsx
│       └── ...
├── hooks/
│   ├── useWeeklySummary.ts            ← NEW
│   └── ...
├── pages/
│   └── Reflections.tsx                ← MODIFIED
├── utils/
│   ├── ai.ts                          ← MODIFIED
│   └── storage.ts                     ← MODIFIED
├── data/
│   └── types.ts                       ← MODIFIED
└── ...
```

---

## Command Reference

```bash
# During development
npm run dev                # Start dev server

# After each change
npm run typecheck          # Check types
npm run lint               # Check linting

# Before submitting
npm run lint && npm run test  # Full check

# Watch mode (if available)
npm run test -- --watch    # Run tests in watch mode
```

---

## Code Template Quick Links

See **CODE_TEMPLATES.md** for:
- ✓ Complete `WeeklySummary` interface
- ✓ Storage helper functions (copy-paste ready)
- ✓ AI generation function with prompt
- ✓ Full `useWeeklySummary` hook
- ✓ Complete `WeeklySummaryCard` component
- ✓ Integration code for Reflections.tsx

---

## Architecture at a Glance

```
┌─────────────────────────────────┐
│ Reflections Page                │
│ (src/pages/Reflections.tsx)     │
└────────────────┬────────────────┘
                 │ renders
                 ▼
     ┌───────────────────────┐
     │ WeeklySummaryCard     │
     │ (src/components/...)  │
     └────────────┬──────────┘
                  │ uses
                  ▼
      ┌──────────────────────┐
      │ useWeeklySummary     │
      │ (src/hooks/...)      │
      └────────┬─────┬───────┘
               │     │
          calls│     │reads
               ▼     ▼
    ┌──────────────────────────────┐
    │ generateWeeklySummary() (ai) │
    │ getLastWeekData() (storage)  │
    │ saveWeeklySummary() (storage)│
    └─────────┬──────────────────┬─┘
              │                  │
          sends to            reads from
              │                  │
              ▼                  ▼
         Gemini API          IndexedDB
         (Insights)          (Data)
```

---

## Success = When...

✓ Reflections page displays summary card with stats
✓ Summary shows completed task count, energy breakdown, mood
✓ "Refresh Insights" button generates new AI insight
✓ Insight respects user's burnout mode (gentle/direct/affirmative based on mode)
✓ No gamification language in the UI or AI response
✓ TypeScript check passes
✓ ESLint passes
✓ All 5 test scenarios work

---

## Questions?

Refer to:
1. **PLAN_SUMMARY.md** — High-level overview
2. **IMPLEMENTATION_PLAN_WEEKLY_REFLECTION_SUMMARY.md** — Detailed 8-section plan
3. **ARCHITECTURE_DIAGRAM.md** — Visual flows and dependencies
4. **CODE_TEMPLATES.md** — Copy-paste code ready to use

---

## Before You Start

```bash
# Verify your environment
npm run typecheck    # Should pass
npm run lint         # Should pass
npm run test         # Should pass (existing tests)

# You're ready to implement!
```

Go build something great! 🚀
