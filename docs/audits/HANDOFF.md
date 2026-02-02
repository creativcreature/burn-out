# BurnOut - Claude Code Handoff Document

## Project Overview
**BurnOut** is an energy-aware productivity PWA for neurodivergent users.
- **Tagline**: "Work with your energy, not against it"
- **Live URL**: https://burnoutapp.vercel.app
- **Repo**: github.com/creativcreature/burn-out
- **Branch**: `main` (all recent work is here)

## Tech Stack
- **Framework**: React 18 + TypeScript
- **Build**: Vite 5.x
- **Storage**: IndexedDB via idb-keyval (key: `burnout_v4`)
- **Styling**: CSS Variables (no Tailwind)
- **PWA**: vite-plugin-pwa with Workbox
- **AI**: Anthropic Claude API (proxied through `/api/chat`)
- **Hosting**: Vercel (auto-deploys from `main`)

## Commands
```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run typecheck  # TypeScript check
npm run lint       # ESLint
npm run test       # Run tests
```

## File Structure
```
burnout/
├── CLAUDE.md           # Project conventions (READ THIS FIRST)
├── src/
│   ├── components/     # React components
│   │   ├── layout/     # AppLayout, Header, BottomNav
│   │   ├── shared/     # Button, Modal, Toast, EnergySelector, etc.
│   │   ├── timer/      # TimerOverlay
│   │   └── onboarding/ # Onboarding flows
│   ├── pages/          # Route components
│   │   ├── Now.tsx     # Main task view (home)
│   │   ├── Reflections.tsx  # Journal/garden view
│   │   ├── OrganizeV2.tsx   # Goals/tasks management
│   │   ├── Chat.tsx    # AI brain dump
│   │   └── Settings.tsx
│   ├── hooks/          # Custom hooks (useTasks, useGoals, useEnergy, etc.)
│   ├── data/           # Types, validation schemas
│   ├── utils/          # Storage, AI, helpers
│   └── styles/         # CSS files
├── api/                # Vercel serverless functions
│   └── chat.ts         # Claude API proxy
└── public/             # Static assets, PWA manifest
```

## Data Model
```
Goal → Project → Task
     → Habit

User has:
- burnoutMode: 'recovery' | 'prevention' | 'balanced'
- energyDefaults: { morning, afternoon, evening }
- tonePreference: 'gentle' | 'direct' | 'playful'

Task has:
- verbLabel (max 12 chars): "Call", "Email", "Review"
- taskBody: description
- feedLevel: 'low' | 'medium' | 'high'
- timeEstimate: minutes
- timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime'

JournalEntry has:
- date: YYYY-MM-DD
- content: text
- mood: optional
```

## Current State (as of Feb 1, 2026)

### What Was Implemented
1. **Energy Selector**: Battery-style visual (not numbered buttons)
2. **Reflections Page**: Dark navy background, year grid with plant SVGs
3. **Goal Tapping**: Header objective is tappable → opens goal picker modal
4. **Task Type Editing**: Tap verbLabel or energy tag → edit modal
5. **Burnout Mode**: 
   - Visible in Settings
   - Flame icon in header controls it
   - Affects task filtering (recovery mode hides high-energy tasks)

### What James Actually Wanted (may not match implementation)
James referenced the **One Year: Daily Journal** app by Wind Down Studio. Key features:
- App Store: https://apps.apple.com/us/app/one-year-daily-journal/id6740510762
- Dark navy background ✓
- 365 hand-drawn plants, one per day
- Horizontal scroll through the year (my implementation is vertical)
- Very minimal - no stats, just the garden and entry text
- Tap day → entry text appears at bottom
- "Plant a memory" to add today's entry

**Critical**: James said the Reflections page should be "EXACTLY like One Year App" - not inspired by, but exact. This may require:
- Horizontal layout instead of vertical
- Different grid arrangement (months as columns?)
- Exactly matching the visual style

### Known Issues (James reported but unverified)
- James said "none of the changes were made" even though code was deployed
- Possible caching issue on his end
- Or the implementation doesn't match his mental model of what it should look like

## API Keys & Config
**All keys are already configured in Vercel and `.env`**:
- `ANTHROPIC_API_KEY` - Claude API
- `VITE_SUPABASE_URL` - Supabase (if used)
- `VITE_SUPABASE_ANON_KEY` - Supabase

**DO NOT ASK JAMES FOR KEYS** - they exist, check `.env` and Vercel dashboard.

## Design Guidelines

### DO
- Warm cream background (light mode), pure black (dark mode)
- Orange/red/magenta accent colors (orb gradient)
- Playfair Display for headlines, Inter for body
- Glass effect cards with subtle shadows
- Breathing animations, smooth transitions

### DO NOT
- **No gamification**: No points, badges, streaks, stars, achievements
- **No pressure language**: No "crush your goals", "win the day"
- **No time estimates in UI** (stored internally, not shown to user)

## Previous Session Failures
1. Too many agents talking, causing confusion
2. Said "done" without verifying from James's perspective
3. Interpreted requirements instead of confirming with mockups first
4. Kept asking questions James had already answered

## Recommendations for Claude Code

1. **Read CLAUDE.md first** - has all conventions
2. **Show before building** - describe or mock what you plan to build, get confirmation
3. **Verify from user's device** - don't assume deploys worked; ask for screenshots
4. **One Year App is the reference** - study it closely before touching Reflections
5. **Check existing files before asking** - keys, config, context is already documented
6. **No gamification** - this is critical, the app is anti-gamification by design

## Quick Start
```bash
cd /Users/x/Documents/Projects/burnout
npm install
npm run dev
# Opens at http://localhost:3000
```

## Contact
- **Owner**: James (Chris X James Parker)
- **Repo**: creativcreature on GitHub
- **Communication**: Slack #burnout-app

---

*Handoff prepared Feb 1, 2026 by MiloX*
