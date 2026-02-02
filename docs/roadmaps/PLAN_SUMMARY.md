# Quick Reference: Weekly Reflection Summary Implementation

## What We're Building
AI-generated weekly insights displayed on the Reflections page that:
- Summarize completed tasks, energy breakdown, and mood patterns from the past 7 days
- Generate personalized, non-gamified insights respecting user's burnout mode
- Cache results with manual refresh option

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useWeeklySummary.ts` | Hook for summary generation, caching, refresh |
| `src/components/reflections/WeeklySummaryCard.tsx` | UI card displaying stats + AI insight |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/data/types.ts` | Add `WeeklySummary` interface; extend `BurnOutData` |
| `src/utils/ai.ts` | Add `generateWeeklySummary()` function |
| `src/utils/storage.ts` | Add helpers: `getLastWeekData()`, `getWeeklySummary()`, `saveWeeklySummary()` |
| `src/pages/Reflections.tsx` | Import and render `WeeklySummaryCard` with conditional display |

---

## Data Model

```typescript
interface WeeklySummary {
  id: string
  weekStartDate: string                          // YYYY-MM-DD
  completedTaskCount: number
  lowEnergyTaskCount: number
  mediumEnergyTaskCount: number
  highEnergyTaskCount: number
  timePerVerbLabel: Record<string, number>       // "Deep Work": 120
  moodBreakdown: Record<string, number>          // "good": 3, "great": 2
  aiInsight: string                              // "You focused on..."
  generatedAt: string                            // ISO timestamp
  userEnergyPattern?: string                     // Optional insight
}
```

Add to `BurnOutData`: `weeklySummaries: WeeklySummary[]`

---

## Implementation Order

1. **Data Types** → Add WeeklySummary interface
2. **Utilities** → Add AI + storage helper functions
3. **Hook** → Create useWeeklySummary with logic
4. **Component** → Build WeeklySummaryCard UI
5. **Integration** → Update Reflections.tsx
6. **Verify** → Run typecheck, lint, test, manual QA

---

## Key Design Decisions

✓ **No new dependencies** (use existing Gemini API via sendMessage)
✓ **Cache strategy** (AI call only on manual refresh or first time each week)
✓ **Graceful degradation** (stats display even if AI fails)
✓ **No gamification** (affirmative language, no streaks/badges)
✓ **Energy-aware** (respects burnout mode + tone preference)
✓ **CSS variables only** (no inline styles or hardcoded colors)

---

## Testing Checklist

- [ ] User with active week shows summary
- [ ] User with no recent activity shows empty state
- [ ] API failure shows stats but error message for insight
- [ ] Refresh button regenerates insight
- [ ] Different burnout modes get different tone
- [ ] TypeScript check passes
- [ ] ESLint passes

---

## Quick Start for Implementation

1. Read the full plan: `IMPLEMENTATION_PLAN_WEEKLY_REFLECTION_SUMMARY.md`
2. Start with Phase 1 (data types)
3. Follow the 6-phase sequence
4. Verify after each phase with typecheck
5. Run full test suite before merging
