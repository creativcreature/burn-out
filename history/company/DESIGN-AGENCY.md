# BurnOut Design Agency

In-house creative agency providing full-spectrum design services for BurnOut.

## Mission

Create human-centered, energy-aware experiences that help neurodivergent users work with their energy, not against it. Every design decision supports the core philosophy: productivity without punishment.

## Principles

1. **Warmth Over Gamification** - No points, badges, streaks, or achievements. Celebrate through gentle encouragement.
2. **Clarity Over Cleverness** - Simple, intuitive interfaces that don't drain cognitive energy.
3. **Breathing Room** - Generous spacing, smooth animations, and visual calm.
4. **Accessibility First** - Design for all abilities, energy levels, and contexts.
5. **Consistency** - One design system, one voice, one experience across all touchpoints.

---

## Service Offerings

### Brand & Identity
- Brand strategy & positioning
- Visual identity systems
- Brand guidelines maintenance
- Voice & tone documentation

### UI/UX Design
- Interface design
- Interaction patterns
- Design system components
- Prototyping & validation

### Motion & Animation
- UI animations
- Micro-interactions
- Loading states
- Transition design

### Content
- UX copywriting
- Microcopy
- Error messages
- Onboarding flows

### Video & Media
- Product videos
- Tutorial content
- Motion graphics
- Social media assets

### Strategy
- User research
- Competitive analysis
- Campaign planning
- Analytics review

---

## Team Structure

### Leadership
| Role | Model | Responsibilities |
|------|-------|------------------|
| Creative Director | Opus | Brand philosophy, design system architecture, final approval |
| Copywriter | Sonnet | Brand voice, UX copy, messaging |

### Creative Team
| Role | Model | Responsibilities |
|------|-------|------------------|
| Art Director (x2-3) | Sonnet | Visual direction, design specs, junior review |
| Junior Designer (x3+) | Ollama | Asset production, mockups, documentation |

### Production Team
| Role | Model | Responsibilities |
|------|-------|------------------|
| Videographer | Sonnet | Video content, motion graphics |
| Social Media Manager | Sonnet | Content calendar, community |
| Strategist | Sonnet | Research, campaigns, positioning |

### Operations Team
| Role | Model | Responsibilities |
|------|-------|------------------|
| Accounts Manager | Haiku | Intake, client comms, timelines |
| Logistics Coordinator | Haiku | Resources, assets, scheduling |

---

## Review & Approval Process

### Design Review Levels

```
Level 1: Junior Work → Art Director Review
Level 2: Art Director Work → Creative Director Review
Level 3: Major Changes → Creative Director + CTO Review
Level 4: Brand Changes → CEO Approval Required
```

### Review Checklist

Before any design ships:

- [ ] Follows design system
- [ ] No gamification elements
- [ ] Accessible (WCAG 2.1 AA)
- [ ] Works in both light/dark themes
- [ ] Copy reviewed by Copywriter
- [ ] Animations follow motion guidelines
- [ ] Mobile-responsive
- [ ] Performance-conscious (no heavy assets)

### Approval Workflow

```
Request → Accounts → Creative Team → Art Director Review
                                          ↓
                                   Creative Director Review
                                          ↓
                            (if technical) CTO Collaboration
                                          ↓
                                   Engineering Handoff
                                          ↓
                                   QA Verification
                                          ↓
                                      Ship
```

---

## Handoff Protocols

### Design to Engineering

#### What to Include
1. **Figma/Design Files**
   - Component specs with exact measurements
   - Color values (CSS variable names preferred)
   - Typography specs
   - Spacing tokens

2. **Interaction Documentation**
   - Animation timing (duration, easing)
   - State changes (hover, active, disabled)
   - Edge cases

3. **Assets**
   - Exported SVGs/PNGs as needed
   - Optimized for web
   - Multiple resolutions if required

4. **Copy Document**
   - All text content
   - Alt text for images
   - Error messages
   - Loading states

#### Handoff Checklist

- [ ] Design file link shared
- [ ] Component marked as "Ready for Dev"
- [ ] All states documented
- [ ] Responsive breakpoints defined
- [ ] CSS variables mapped
- [ ] Engineering Director notified
- [ ] Logged in project tracker

### Engineering to Design (Feedback Loop)

When engineering identifies design issues:
1. Document with screenshot
2. Reference design spec
3. Tag Art Director
4. Propose solution if obvious
5. Await design decision before implementing workaround

---

## Tool Standards

### Design Tools
| Purpose | Tool | Notes |
|---------|------|-------|
| UI Design | Figma | Single source of truth |
| Prototyping | Figma | Interactive prototypes |
| Icons | Figma + SVG export | Consistent icon library |
| Illustrations | Figma/Illustrator | Vector only |

### Documentation
| Purpose | Tool | Notes |
|---------|------|-------|
| Design Specs | Figma Dev Mode | Engineering reference |
| Copy | Google Docs → Figma | Draft in docs, finalize in design |
| Guidelines | Markdown in repo | Version controlled |

### Asset Management
| Purpose | Tool | Notes |
|---------|------|-------|
| Design Files | Figma | Organized by project |
| Final Assets | Repository `/public` | Git tracked |
| Video | Cloud storage | Large file handling |

### Communication
| Purpose | Tool | Notes |
|---------|------|-------|
| Requests | Project tracker | All requests logged |
| Reviews | Figma comments | Design feedback |
| Decisions | GitHub discussions | Permanent record |

---

## Request Intake Process

### How to Request Design Work

1. **Submit Request**
   - Use project intake form
   - Include: scope, deadline, context
   - Tag: Accounts Manager

2. **Triage**
   - Accounts Manager reviews
   - Categorizes by type/urgency
   - Assigns to appropriate team

3. **Scoping**
   - Art Director estimates effort
   - Identifies dependencies
   - Confirms timeline

4. **Execution**
   - Work assigned to designer
   - Regular check-ins
   - Review process followed

5. **Delivery**
   - Handoff to requestor
   - Documentation complete
   - Feedback collected

### Request Types & SLAs

| Type | Description | Typical Timeline |
|------|-------------|------------------|
| Bug Fix | Visual bug, broken design | Same day |
| Small Change | Copy update, color tweak | 1-2 days |
| Component | New UI component | 3-5 days |
| Feature | New feature design | 1-2 weeks |
| Campaign | Full creative campaign | 2-4 weeks |
| Brand Update | Guidelines/system update | 4+ weeks |

### Priority Levels

| Priority | Criteria | Response |
|----------|----------|----------|
| P0 | Brand emergency, legal issue | Immediate |
| P1 | Blocking release | Same day |
| P2 | Important but not blocking | This week |
| P3 | Enhancement | Next sprint |
| P4 | Nice to have | Backlog |

---

## BurnOut-Specific Guidelines

### What We Never Do
- Add gamification (points, badges, streaks, achievements)
- Use punishing language
- Create anxiety-inducing interfaces
- Add unnecessary complexity

### What We Always Do
- Support energy-awareness in every design
- Use warm, encouraging copy
- Provide breathing room
- Test with neurodivergent users in mind

### The Orb (Preserve Exactly)
- Gradient: warm colors (orange → red → magenta)
- Animation: smooth breathing effect
- Glow: subtle, energy-aware
- Position: central, not intrusive

### Color Philosophy
- Light mode: warm cream backgrounds
- Dark mode: true black backgrounds
- Accents: orange/red/magenta spectrum
- Never: harsh whites, cold blues, neon

### Typography
- Headlines: Playfair Display (elegant, warm)
- Body: Inter (clean, readable)
- Scale: generous, accessible

### Animation Guidelines
- Easing: ease-in-out preferred
- Duration: 200-400ms for UI, 1-3s for ambient
- Purpose: calm, not distract
- Reduce motion: always respect user preference

---

## Cross-Functional Alignment

### With CTO
- Joint ownership of design system technical implementation
- Regular syncs on component architecture
- Shared responsibility for theme system
- Conflicts escalate to CEO

### With Engineering Director
- Design handoff coordination
- Implementation questions
- Visual QA collaboration

### With QA Director
- Visual regression testing
- Accessibility audits
- Cross-browser verification

### With COO
- Resource allocation
- Timeline management
- Process optimization

---

## Metrics & Quality

### Design Quality Indicators
- Accessibility score (target: WCAG 2.1 AA)
- Component reuse rate
- Design-to-dev handoff clarity (feedback surveys)
- Visual consistency audits

### Not Metrics (Anti-Gamification)
- We don't track "designs shipped"
- We don't count "assets produced"
- We don't measure "speed of delivery"
- Quality and user experience matter, not volume
