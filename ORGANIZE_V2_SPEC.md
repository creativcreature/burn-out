# Organize V2 Spec — Simplified Goal-Grouped Tasks

> **Goal:** Strip complexity. Keep goals as organizer. Make task management simple.
> **Approved by:** X (2026-02-01)

---

## Core Philosophy

Tasks grouped by goals. Goals managed via modal, not tabs. Minimal task cards.

---

## UI Structure

### Main View (Goal-Grouped Task List)
```
┌─────────────────────────────────┐
│  Organize              [⚙️ Goals] │  ← Gear icon opens goal modal
├─────────────────────────────────┤
│  🎯 Launch MVP                   │  ← Goal header (collapsible?)
│    ☐ Fix width bug        today │
│    ☐ Deploy v1                  │
│    ☐ Write docs                 │
│                                 │
│  🎯 Get Healthy                  │
│    ☐ Morning walk               │
│    ☐ Meal prep           Sunday │
│                                 │
│  📥 Inbox (no goal)             │
│    ☐ Random task                │
│    ☐ Call mom                   │
└─────────────────────────────────┘
     [Chat]  [Organize]  [Now]      ← Nav stays same
```

### Goal Modal (accessed via ⚙️)
```
┌─────────────────────────────────┐
│  Your Goals              [Done] │
├─────────────────────────────────┤
│  🎯 Launch MVP            [Edit]│
│  🎯 Get Healthy           [Edit]│
│  🎯 Learn Spanish         [Edit]│
│                                 │
│  [+ Add New Goal]               │
└─────────────────────────────────┘
```

### Task Card (Minimal)
```
┌─────────────────────────────────┐
│ ☐  Task title here              │
│     📅 Due date   🏷️ List tag   │  ← Optional metadata, subtle
└─────────────────────────────────┘
```

**Interactions:**
- Tap checkbox → complete
- Tap card → expand for notes/details
- Swipe left → delete
- Swipe right → complete
- **Long press + drag → reorder** (regular tap scrolls — standard mobile UX)

### Expanded Task Card
```
┌─────────────────────────────────┐
│ ☐  Task title here              │
├─────────────────────────────────┤
│ 📅 Due: Tomorrow                │
│ 🏷️ List: Work                   │
│ 📝 Notes: Call about the thing  │
│                                 │
│ [Edit]              [Delete]    │
└─────────────────────────────────┘
```

---

## Data Model (Simplified)

### Task
```typescript
interface Task {
  id: string
  title: string              // Required
  completed: boolean
  listId?: string           // Optional - null = Inbox
  dueDate?: string          // Optional
  notes?: string            // Optional
  rank: number              // For ordering
  createdAt: string
  completedAt?: string
}
```

### List
```typescript
interface List {
  id: string
  name: string              // e.g., "Work", "Personal"
  color?: string            // Optional accent color
  rank: number              // For ordering lists
}
```

**No more:**
- `verbLabel` ❌
- `feedLevel` (energy) ❌
- `timeEstimate` ❌
- `goalId` ❌
- `projectId` ❌
- `timeOfDay` ❌

---

## Pages/Tabs

### What to REMOVE
- **Goals tab** → Move to modal (⚙️ icon in header)
- **Projects tab** → Delete entirely
- **Current tabs UI** → Replace with single scrollable view

### New Structure
- **One scrollable view** — tasks grouped by goal
- **Goal modal** — accessed via ⚙️ gear icon
- **Inbox section** — ungrouped tasks at bottom

### Goal Section Behavior
- Each goal = collapsible section header
- Tap goal header → collapse/expand
- Tasks sorted by rank within each goal
- Drag tasks between goals (long-press + drag to different section)

---

## Quick Add Flow

**Current (too complex):**
1. Tap + 
2. Modal: Verb label, task body, time estimate, energy, time of day, goal, project
3. Submit

**New (simple):**
1. Tap + (or always-visible input bar)
2. Type task title
3. Press enter → task added to current list
4. Optional: tap date icon to add due date

```
┌─────────────────────────────────┐
│ [+] What do you need to do?    │
│                    📅  🏷️  ↵   │
└─────────────────────────────────┘
```

---

## Swipe Gestures

| Direction | Action | Visual |
|-----------|--------|--------|
| Swipe Right | Complete | Green checkmark slides in |
| Swipe Left | Delete | Red trash icon slides in |

Use `react-swipeable` or similar.

---

## Migration Path

### Phase 1: Simplify UI
1. Remove Goals/Projects tabs
2. Flatten to single task list view
3. Add list filter dropdown
4. Simplify task card (remove verb/energy/time)

### Phase 2: Add Lists
1. Create List entity
2. Add list selector in quick-add
3. Add list management in Settings

### Phase 3: Swipe Actions
1. Implement swipe-to-complete
2. Implement swipe-to-delete

---

## Files to Modify

```
src/pages/Organize.tsx      → Complete rewrite
src/data/types.ts           → Simplify Task type
src/hooks/useTasks.ts       → Update for new schema
src/hooks/useLists.ts       → NEW (simple list CRUD)
src/utils/storage.ts        → Add lists, simplify tasks
src/components/shared/      → Add SwipeableCard component
```

---

## What Stays the Same

- `AppLayout` wrapper
- `Header` component
- `Navigation` bottom nav
- Card styling (glassmorphism)
- Overall dark theme / orb background

---

## Open Questions for X

1. Keep completed tasks visible (with strikethrough) or auto-hide?
2. Lists in left sidebar (desktop) or top tabs (mobile)?
3. Due date picker style — calendar popup or quick options (today/tomorrow/next week)?

---

## Coding Standards (per X)

**No bubblegum & duct tape.** Clean, maintainable code.

- Proper TypeScript types (no `any`)
- Components < 200 lines — split if larger
- Custom hooks for reusable logic
- CSS variables for theming (no magic numbers)
- Accessibility: aria-labels on interactive elements
- Comments for non-obvious logic

---

*Spec by @miloshh_bot | 2026-02-01*
