# Changelog

All notable changes to BurnOut will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]
### Added
### Changed
- **Garden Page Rebuild**: Year-at-a-glance view inspired by GitHub contribution graphs and Year in Pixels
  - GitHub-style horizontal layout (53 week columns × 7 day rows)
  - Pixels/Garden view toggle (colored dots vs plant emoji)
  - Year navigation with prev/next buttons
  - Month labels along top row
  - Today cell highlighted with orange glow + pulse animation
  - Mood-based cell colors with glow effects (struggling/okay/good/great)
  - Color legend showing mood scale (Less → Better)
  - "Your Progress" stats card with gradient background
    - Entries count (gradient text)
    - Good days count (green)
    - % tracked
  - "Write today's entry" CTA button when no entry exists
  - Only today is editable (past entries are view-only)
  - Editor view with mood selector and gradient save button
### Fixed
### Removed

## [0.3.0] - 2026-01-25
### Added
- **AI Chat Integration**: Claude API integration for brain dump to task conversion
- **useAI Hook**: Chat history persistence, task extraction from AI responses
- **Habits Tab**: Full habits management UI in Organize page (create, view, delete)
- **AI Utility**: Tone-aware and burnout-mode-aware prompting
- **Task Auto-Creation**: AI responses can automatically create tasks from conversations
- **Chat History**: Persistent chat history with task creation tracking

## [0.2.0] - 2026-01-25
### Added
- **Core Hooks**: useGoals, useProjects, useHabits, useTimer, useOnboarding, useEnergy
- **Shared Components**: Modal, Toast with success/error/info types
- **Onboarding Flow**: 4-step welcome (burnout mode, energy patterns, tone preference)
- **Timer System**: Full-screen pomodoro overlay with pause/resume, +5 min extension
- **Garden Visualization**: Weekly view of completed tasks (non-gamified)
- **TaskCard Component**: Reusable task display component
- **Energy-Aware Scheduling**: Task scoring based on energy level and time of day
- **Now Page**: Energy selector, Orb interaction, suggested task with Start Now/Not Today
- **Organize Page**: Tabs for Tasks/Goals/Projects, drag-and-drop reordering, modal forms
- **Reflections Page**: Progress stats and Garden visualization
- **PWA Support**: Service worker with offline caching via vite-plugin-pwa

### Changed
- App.tsx now shows onboarding for new users before main app
- All pages use shared Toast component
- Unified storage layer with IndexedDB (burnout_v4 key)
- Global theme system works across all pages

## [0.1.0] - 2026-01-25
### Added
- Initial project structure setup
- CLAUDE.md single source of truth with Boris-style workflow
- Slash commands: /dev, /build-check, /test, /commit-push-pr, /audit, /deploy, /close
- Agent definitions: CTO, Engineering Director, QA Director, Security Director
- Company infrastructure documentation (INFRASTRUCTURE.md, QUALITY-GATES.md, ESCALATION-MATRIX.md, RACI.md)
- React + Vite + TypeScript foundation
- Directory structure for components, pages, hooks, utils, styles
- Playbooks for implementation phases
- Templates for components, hooks, tests, pages
