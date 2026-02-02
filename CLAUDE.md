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
npm run dev        # Start dev server (port 5174) - ALWAYS use this unique port
npm run build      # Production build
npm run test       # Run test suite
npm run lint       # ESLint check
npm run typecheck  # TypeScript check
```

## Dev Server
**ALWAYS use port 5174** - configured in vite.config.ts
- URL: http://localhost:5174
- Do NOT use port 3000 (conflicts with other projects)

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

## Lessons Learned (DON'T REPEAT THESE MISTAKES)

### 2026-02-01: Major Feedback Session
Issues that fell through the cracks:

1. **REFERENCE APPS MUST BE EXACT**
   - When James says "like One Year App" — that means EXACTLY like it
   - Don't interpret, don't "inspired by" — match the visual language exactly
   - One Year App = garden view with hand-drawn plants, one per day, grows over year
   - Current Reflections = random icons, journal cards — COMPLETELY different

2. **INTERACTIVE ELEMENTS MUST BE TAPPABLE**
   - Goal in header should be tappable to change goal
   - Task type labels should be tappable to edit type
   - Don't just display data — make it interactive

3. **FEATURES MUST ACTUALLY WORK**
   - Burnout mode is set in onboarding but doesn't affect app behavior
   - Just passing data to AI prompts is NOT implementing the feature
   - If a feature exists, it should have visible behavioral effects

4. **ENERGY UI NEEDS THOUGHT**
   - 5 numbered buttons is utilitarian, not thoughtful
   - Design decisions need to match the app's aesthetic (warm, human, not clinical)

5. **VERIFY BEFORE CLOSING**
   - Before saying "done" — actually use the feature
   - Test the entire flow, not just if it compiles
   - If something was asked for, visually verify it matches

## Token Logging (MANDATORY)
At session end, update:
```
~/Documents/Claude/TOKEN_MASTER_LOG.md
```
Billing: Tokens x $0.0000225 (Melt) | Personal = track only

## File Structure
```
burnout/
├── CLAUDE.md              # This file - single source of truth
├── CHANGELOG.md           # Version history
├── VERSION.md             # Current version
│
├── docs/                  # ALL documentation consolidated
│   ├── specs/            # Feature specifications (BURNOUT_MODE_SPEC, REFLECT_REDESIGN_SPEC, etc.)
│   ├── architecture/     # Technical docs (ARCHITECTURE_DIAGRAM, CODE_TEMPLATES)
│   ├── guides/           # Implementation guides (QUICK_START, DEPLOY_RULES, PROCESS)
│   ├── audits/           # Status/audit reports (FUNCTIONALITY_AUDIT, HANDOFF)
│   └── roadmaps/         # Roadmaps (CEO_ROADMAP, IOS_DEPLOYMENT_ROADMAP)
│
├── reference/            # Reference materials (DO NOT DELETE)
│   ├── oneyearjournal/   # One Year App screenshots (CRITICAL for Reflections)
│   ├── ONE_YEAR_APP_TEARDOWN.md
│   ├── SAMPLE_DATA.md
│   └── ONBOARDING_COPY.md
│
├── brand/                # Design reference
│   ├── BRAND-GUIDELINES.md   # Colors, typography, design principles
│   ├── QUALITY-GATES.md      # Quality standards
│   └── playbooks/            # Implementation guides (01-setup through 06-deployment)
│
├── history/              # Historical context (rarely needed)
│   ├── clawdbotmemories/ # Past agent coordination
│   ├── company/          # Org docs (RACI, ESCALATION)
│   ├── prompts/          # AI role prompts
│   └── _reports/         # Audit reports
│
├── ceo/                  # CEO notes & visuals
├── src/                  # Source code
│   ├── components/       # React components
│   ├── pages/            # Route-level components
│   ├── hooks/            # Custom hooks
│   ├── data/             # Types, constants, state
│   ├── utils/            # Helper functions
│   └── styles/           # CSS files
├── api/                  # Vercel API functions
├── public/               # Static assets + PWA
├── scripts/              # Build scripts
└── tools/                # Dev tools
```

### Essential Files to Read Before Implementing
- `CLAUDE.md` - Project conventions (this file)
- `docs/specs/*` - What to build
- `docs/audits/FUNCTIONALITY_AUDIT.md` - What's broken
- `reference/oneyearjournal/*` - Visual reference for Reflections
- `brand/BRAND-GUIDELINES.md` - Design constraints
