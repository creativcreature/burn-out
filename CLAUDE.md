# CLAUDE.md - BurnOut PWA

## Project Overview
Energy-aware productivity app for neurodivergent users.
"Work with your energy, not against it."

## Tech Stack
- Framework: React 18 + TypeScript
- Build: Vite 5.x
- Storage: IndexedDB via idb-keyval
- Styling: CSS Variables
- PWA: vite-plugin-pwa with Workbox
- AI: Anthropic Claude API
- Hosting: Vercel
- Production URL: https://burnoutapp.vercel.app

## Commands
```bash
npm run dev        # Start dev server (port 3000)
npm run build      # Production build
npm run test       # Run test suite
npm run lint       # ESLint check
npm run typecheck  # TypeScript check
```

## Development Workflow (Boris-Style: Plan → Execute → Verify)

### 1. Make changes

### 2. Typecheck (fast)
```bash
npm run typecheck
```

### 3. Run tests
```bash
npm run test -- -t "test name"     # Single suite
npm run test:file -- "glob"        # Specific files
```

### 4. Lint before committing
```bash
npm run lint:file -- "file.ts"     # Specific files
npm run lint                        # All files
```

### 5. Before creating PR
```bash
npm run lint && npm run test
```

## Session Protocol

### Plan Mode Default
- Always open sessions in plan mode (shift+tab twice)
- After EVERY edit, return to plan mode for verification
- A good plan is really important - Claude can usually 1-shot with a good plan

### Auto-Accept Mode
- Only switch to auto-accept edits mode AFTER plan is approved
- Use for implementation phase

### Multi-Terminal Coordination
When running multiple Claude instances:
- Terminal 1: Structural changes (file moves, renames)
- Other terminals: Code changes in parallel
- Each terminal writes completion report to `_reports/`
- No terminal deploys - all changes are local only

### /close Command
When user says `/close`:
1. Log all changes to CHANGELOG.md
2. Increment version in VERSION.md (semver)
3. Write session summary to ~/Documents/Claude/TOKEN_MASTER_LOG.md
4. Document next steps for next session
5. Display closing summary with version number

## Architecture

### Data Hierarchy
```
Goal → Project → Task/Habit
```
- **Goals**: Long-term objectives (6mo+)
- **Projects**: Milestones under goals
- **Tasks**: One-time actionable items
- **Habits**: Recurring routines

### Task Processing Pipeline
```
User Visit App
      ↓
Onboarding (Burnout Mode, Activities, Time, Tone)
      ↓
Core Task Identification (Verb/Label, TaskBody, TimeEstimate, FeedLevel, AssociatedGoal)
      ↓
Daily Scheduling Engine (Time blocks, Energy Level, Goal alignment, Momentum)
      ↓
Contextual Intelligence Layer (Time of day, Energy, Open tasks, Momentum)
      ↓
Task Surfacing (One task at a time, Start Now | Not Today)
      ↓
Data Output (Completed Tasks, Time per Task, Goal progress, Patterns)
```

### Single Shared Systems
- Theme system: `useTheme` hook (works on ALL pages)
- Storage: Unified IndexedDB key `burnout_v4`
- Components: Shared library in `src/components/shared`
- Navigation: Consistent across all pages

### Verb Labels (Max 12 Characters)
Examples:
- "Rise + Stretch" - morning routine
- "Hydrate" - health tasks
- "Prioritize" - planning tasks
- "Deep Work" - focus blocks
- "Wind Down" - evening tasks

## Code Conventions
- Functional components with hooks only
- 2-space indentation, single quotes
- Components in PascalCase
- CSS variables from src/styles/variables.css
- No inline styles (use CSS modules or variables)

## Anti-Patterns (DO NOT)
- **No gamification** (no points, badges, streaks, stars, achievements)
- **No localStorage** (use IndexedDB via idb-keyval)
- **No duplicate code** across pages
- **No hardcoded themes** (use CSS variables)
- **No time estimates** in user-facing text

## Visual Design (PRESERVE EXACTLY)
- The Orb: gradient, breathing animation, glow
- Colors: warm cream (light), pure black (dark), orange/red/magenta accents
- Typography: Playfair Display (headlines), Inter (body)
- Cards: glass effect, 12px rounded corners, shadows
- Animations: breathing, transitions, gestures

## Token Logging (MANDATORY)
At session end, update:
```
~/Documents/Claude/TOKEN_MASTER_LOG.md
```
Billing: Tokens x $0.0000225 (Melt) | Personal = track only

## File Structure
```
burnout/
├── CLAUDE.md           # This file - single source of truth
├── CHANGELOG.md        # All changes documented
├── VERSION.md          # Current version
├── .claude/
│   ├── commands/       # Slash commands
│   └── agents/         # Subagent definitions
├── company/            # Infrastructure docs
├── playbooks/          # Implementation guides
├── src/
│   ├── components/     # React components
│   ├── pages/          # Route-level components
│   ├── hooks/          # Custom hooks
│   ├── data/           # Types, constants, state
│   ├── utils/          # Helper functions
│   └── styles/         # CSS files
└── public/             # Static assets + PWA
```
