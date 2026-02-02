# Functionality Audit - Rip It Apart

**Date:** 2026-02-01
**Auditor:** MiloX
**Directive:** Keep look/feel, destroy functionality flaws

---

## Page-by-Page Audit

### 1. NOW PAGE (`/now`)

**What it does:**
- Shows single "current" task
- Swipe gestures (right=snooze, left=delete, down=shuffle)
- Timer for focused work
- Energy level display
- Pull-up sheet for upcoming tasks

**FLAWS:**
- ❌ **Swipe right = SNOOZE?!** Should be COMPLETE. Core interaction is backwards.
- ❌ **No quick complete** - User must start timer, then complete. Too many steps.
- ❌ **"Start Task" button unclear** - What does it do? Why timer?
- ❌ **Energy bolts confusing** - What do they mean? No explanation.
- ❌ **Shuffle is swipe DOWN** - Unintuitive, conflicts with pull-up sheet
- ❌ **Pinned task logic unclear** - How do you pin? How do you know it's pinned?
- ❌ **Pull-up sheet half-broken** - Sometimes stutters, scroll conflicts

**SHOULD BE:**
- Swipe RIGHT = COMPLETE ✅
- Swipe LEFT = Defer/Later
- Tap card = Start timer (optional)
- Big "Done" button always visible
- Clear energy explanation on first use

---

### 2. ORGANIZE PAGE (`/organize`)

**What it does:**
- Two versions exist (Organize.tsx AND OrganizeV2.tsx) - WHICH IS USED?
- Lists tasks grouped by goals
- Add/edit tasks
- Swipeable task cards

**FLAWS:**
- ❌ **TWO ORGANIZE FILES** - OrganizeV2 is used but old Organize.tsx still exists
- ❌ **No drag reorder** - Can't prioritize tasks within a goal
- ❌ **No due dates visible** - When is this task due?
- ❌ **No search/filter** - Can't find specific tasks
- ❌ **Goal management buried** - Settings gear icon, not obvious
- ❌ **Quick add has no AI** - Just adds raw text, doesn't parse intelligently
- ❌ **Completed tasks hidden by default** - Hard to see progress

**SHOULD BE:**
- Delete old Organize.tsx
- Add drag-to-reorder
- Show due dates
- AI-powered quick add (like brain dump)
- Inline goal creation

---

### 3. CHAT PAGE (`/chat`)

**What it does:**
- Chat with AI assistant
- AI extracts tasks from conversation
- Brain dump support

**FLAWS:**
- ❌ **No context awareness** - AI doesn't know your goals/tasks
- ❌ **Extracted tasks not shown** - Where did they go?
- ❌ **No confirmation** - AI adds tasks without asking
- ❌ **Can't edit AI suggestions** - Take it or leave it
- ❌ **No conversation history persistence** - Refreshes = gone
- ❌ **Typing indicator weak** - Just "thinking..."

**SHOULD BE:**
- AI sees your goals and current tasks
- Shows extracted tasks inline for approval
- Persistent conversation history
- Edit suggestions before adding

---

### 4. REFLECTIONS PAGE (`/reflections`)

**What it does:**
- (v0.5.8) Minimal "plant thought" interface
- Shows recent reflection icons
- Modal to write thoughts

**FLAWS:**
- ❌ **Thoughts go nowhere** - console.log only, not saved!
- ❌ **No journal history** - Can't see past thoughts
- ❌ **Icons are decorative only** - Don't link to anything
- ❌ **No connection to tasks** - Should reflect on completed work
- ❌ **"Plant thought" unclear** - What happens after planting?

**SHOULD BE:**
- Actually SAVE thoughts to storage
- Show journal history (scrollable)
- Connect to completed tasks
- Weekly reflection prompts
- Export/share reflections

---

### 5. SETTINGS PAGE (`/settings`)

**What it does:**
- Theme toggle
- Card background image
- Load sample data
- Clear data
- About section

**FLAWS:**
- ❌ **No account/sync** - Data is local only, will be lost
- ❌ **No export** - Can't backup data
- ❌ **No burnout mode toggle** - Core feature missing from settings
- ❌ **No notification settings** - Reminders?
- ❌ **Card background is weird** - Why customize just the card?
- ❌ **"About" is empty** - No version, no links

**SHOULD BE:**
- Export/import data (JSON)
- Burnout mode quick toggle
- Notification/reminder settings
- Version number visible
- Links to support/feedback

---

### 6. ONBOARDING

**What it does:**
- Three paths: Explore (demo), Quick, Guided (brain dump)
- Sets up initial goals/tasks

**FLAWS:**
- ❌ **"Explore" loads 73 tasks** - Overwhelming for new user
- ❌ **Quick path still has form steps** - Should be quicker
- ❌ **No "what is burnout" education** - Core concept unexplained
- ❌ **Brain dump AI may not work without API key** - Silent failure?
- ❌ **No way to redo onboarding** - Stuck with choices

**SHOULD BE:**
- Explore loads ~5-10 demo tasks max
- Quick = truly 1-click
- Educational screens about burnout
- Graceful fallback if AI unavailable
- "Restart onboarding" in settings

---

### 7. NAVIGATION

**What it does:**
- Bottom nav: Now, Organize, Chat, Reflect, Settings
- FAB on all pages

**FLAWS:**
- ❌ **5 nav items** - Too many for bottom nav
- ❌ **FAB purpose unclear** - What does it do? Different per page?
- ❌ **No active state animation** - Hard to see current page
- ❌ **Chat icon generic** - Should be AI/assistant themed

**SHOULD BE:**
- 4 nav items max (combine or remove one)
- FAB = always quick add
- Clear active state
- AI icon for chat

---

## Global Issues

### Data
- ❌ **No sync** - Data trapped in browser
- ❌ **No backup** - Clear cache = lose everything
- ❌ **No offline indicator** - Is it working?

### Performance
- ❌ **Bundle size 580KB** - Too large for mobile
- ❌ **No code splitting** - Everything loads at once
- ❌ **Animations can stutter** - Need optimization

### Accessibility
- ⚠️ **Basic a11y added** - But not comprehensive
- ❌ **No skip links** - Keyboard nav incomplete
- ❌ **Color contrast untested** - May fail WCAG

---

## Priority Fixes (Tonight)

### P0 - Broken Core
1. **Swipe RIGHT should COMPLETE** (not snooze)
2. **Reflections should SAVE thoughts** (not console.log)
3. **Delete old Organize.tsx** (dead code)

### P1 - Confusing UX
4. Add "Done" button to Now page (not just swipe)
5. Show extracted tasks in Chat (confirmation)
6. Explain energy levels (tooltip)

### P2 - Missing Features
7. Export data button in Settings
8. Journal history in Reflections
9. Burnout mode toggle

---

*Audit complete. Ready to fix.*
