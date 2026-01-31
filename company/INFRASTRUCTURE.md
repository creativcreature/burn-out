# BurnOut Company Infrastructure

## Organizational Chart

```
                              ┌─────────────────┐
                              │      CEO        │
                              │   (You/Human)   │
                              └────────┬────────┘
                                       │
                      ┌────────────────┼────────────────┐
                      │                │                │
              ┌───────┴───────┐ ┌──────┴──────┐ ┌──────┴───────┐
              │     COO       │ │    CTO      │ │     CFO      │
              │  Operations   │ │  Technical  │ │   Finance    │
              │   (Sonnet)    │ │   (Opus)    │ │   (Haiku)    │
              └───────┬───────┘ └──────┬──────┘ └──────────────┘
                      │                │
    ┌─────────────────┼─────────┐     │
    │                 │         │     │
┌───┴────┐ ┌─────────┴───┐ ┌───┴───┐ │
│ Project│ │     QA      │ │Creative│ │
│ Manager│ │  Director   │ │Director│ │
│(Haiku) │ │  (Sonnet)   │ │ (Opus) │ │
└────────┘ └─────────────┘ └───┬───┘ │
                               │     │
           ┌───────────────────┤     └──────────────┬──────────────┐
           │                   │                    │              │
    ┌──────┴──────┐    ┌───────┴───────┐     ┌──────┴──────┐ ┌─────┴────┐
    │   CREATIVE  │    │  PRODUCTION   │     │     Eng     │ │ Security │
    │    TEAM     │    │     TEAM      │     │  Director   │ │ Director │
    └──────┬──────┘    └───────┬───────┘     │  (Sonnet)   │ │ (Sonnet) │
           │                   │             └──────┬──────┘ └──────────┘
    ┌──────┼──────┐     ┌──────┼──────┐            │
    │      │      │     │      │      │     ┌──────┼──────┐
Copywriter │   Art Dir  │   Social  Strategist    │      │
(Sonnet) Art Dir (x2) Video  Media  (Sonnet)  ┌───┴───┐ ┌┴─────────┐
         (Sonnet)    (Sonnet)(Sonnet)         │Frontend│ │ Backend  │
              │                               │ Team   │ │  Team    │
       ┌──────┼──────┐                        │(Local) │ │ (Local)  │
    Jr Design (x3)                            └────────┘ └──────────┘
      (Ollama)

    ┌──────────────┐
    │  OPERATIONS  │ (Under Creative Director)
    │     TEAM     │
    └──────┬───────┘
           │
    ┌──────┼──────┐
 Accounts   Logistics
  (Haiku)    (Haiku)
```

### Design Agency Structure (Detail)

```
                           Creative Director (Opus)
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
  ┌─────┴─────┐               ┌─────┴─────┐               ┌─────┴─────┐
  │  CREATIVE │               │ PRODUCTION│               │ OPERATIONS│
  └─────┬─────┘               └─────┬─────┘               └─────┬─────┘
        │                           │                           │
  ┌─────┼─────┐             ┌───────┼───────┐             ┌─────┼─────┐
  │     │     │             │       │       │             │           │
Copywriter  Art Dir (x2)  Video  Social  Strategist   Accounts  Logistics
(Sonnet)    (Sonnet)     (Sonnet)(Sonnet) (Sonnet)    (Haiku)   (Haiku)
               │
        ┌──────┼──────┐
        │      │      │
    Jr Design (x3 - Ollama)
```

## Agent Tiers

| Tier | Model | Roles | Token Cost | Use Case |
|------|-------|-------|------------|----------|
| Executive | Opus | CTO, Creative Director | $$$$ | Strategic decisions, complex architecture, brand philosophy |
| Manager | Sonnet | COO, Directors, Art Directors, Copywriter, Production Team | $$$ | Coordination, reviews, planning, creative execution |
| Worker | Haiku | Project Manager, Accounts, Logistics | $ | Implementation, testing, docs, coordination |
| Local | Ollama | Junior Designers, Bulk tasks | Free | Repetitive tasks, initial drafts, asset production |

## Role Definitions

### CEO (Human)
- Final approval on all decisions
- Sets product direction
- Approves scope changes
- Signs off on releases

### CTO (Opus)
- Architecture decisions
- Technology selection
- Technical standards
- Performance requirements
- Security strategy

### COO (Sonnet)
- Project coordination
- Resource allocation
- Timeline management
- Process optimization
- Cross-team communication

### CFO (Haiku)
- Token usage tracking
- Cost optimization
- Budget reporting
- Resource efficiency

### Engineering Director (Sonnet)
- Code implementation oversight
- Team coordination
- Code review standards
- Technical execution

### QA Director (Sonnet)
- Testing strategy
- Quality gates
- Bug prioritization
- Release sign-off

### Security Director (Sonnet)
- Security reviews
- Vulnerability management
- Data protection
- Compliance

### Project Manager (Haiku)
- Task tracking
- Progress reporting
- Blocker escalation
- Documentation

---

## Design Agency Roles

### Creative Director (Opus)
- Brand philosophy & strategy
- Design system architecture
- Visual language decisions
- Final creative approval
- Client/stakeholder presentations
- Cross-functional alignment with CTO

### Copywriter (Sonnet)
- Brand voice & tone
- UX copy & microcopy
- Campaign messaging
- Content strategy
- Works alongside Creative Director

### Art Director (Sonnet) x2-3
- Visual direction for projects
- Design system execution
- Review junior work
- Component design specs
- Motion & interaction design

### Junior Designer (Ollama) x3+
- Asset production
- Design implementation
- Mockups & iterations
- Documentation
- Bulk design tasks

### Videographer (Sonnet)
- Video content creation
- Motion graphics
- Tutorial/demo videos
- Brand films

### Social Media Manager (Sonnet)
- Content calendar
- Platform strategy
- Community engagement
- Analytics & reporting

### Strategist (Sonnet)
- Campaign strategy
- User research
- Competitive analysis
- Brand positioning

### Accounts Manager (Haiku)
- Project intake
- Client communication
- Timeline management
- Budget tracking

### Logistics Coordinator (Haiku)
- Resource scheduling
- Asset management
- Tool administration
- Workflow coordination

---

## Communication Protocols

### Escalation Path
```
Worker → Director → CTO/COO → CEO
```

### Decision Authority

| Decision Type | Authority Level |
|--------------|-----------------|
| Code style | Engineering Director |
| Architecture | CTO |
| Feature scope | CEO |
| Release timing | COO + CEO |
| Security issues | Security Director → CTO |
| Budget/costs | CFO → CEO |
| Brand guidelines | Creative Director |
| Visual design | Creative Director |
| UX/UI design | Creative Director + CTO (collab) |
| Copy & messaging | Copywriter → Creative Director |
| Video content | Videographer → Creative Director |
| Social media | Social Media Manager → Creative Director |

### Theme System Ownership
- **Creative Director**: Owns visual direction & design decisions
- **CTO**: Owns technical implementation & architecture
- **Conflicts**: Escalate to CEO for final decision

### Reporting Cadence

| Report | Frequency | Owner | Audience |
|--------|-----------|-------|----------|
| Build status | Per commit | Build Validator | Engineering Director |
| Test results | Per PR | QA Director | Engineering Director |
| Security audit | Weekly | Security Director | CTO |
| Token usage | Daily | CFO | CEO |
| Sprint summary | Weekly | COO | CEO |

## Multi-Terminal Coordination

When running multiple Claude instances:

### Terminal 1: Coordinator
- Owns file structure
- Makes structural changes
- Coordinates other terminals
- Writes final reports

### Terminal 2-N: Workers
- Implement assigned tasks
- Report completion to coordinator
- No structural changes
- Write to `_reports/` on completion

### Coordination Rules
1. Only Terminal 1 creates/deletes files
2. Workers claim files before editing
3. Report conflicts immediately
4. All terminals stay local (no deploys)

## Session Protocol

### Opening
1. Read CLAUDE.md
2. Check VERSION.md for current state
3. Review _reports/ for recent work
4. Plan session in plan mode

### During Session
1. After every edit, verify in plan mode
2. Run typecheck frequently
3. Document decisions in comments
4. Report blockers immediately

### Closing
1. Run /close command
2. Update CHANGELOG.md
3. Increment VERSION.md
4. Write to TOKEN_MASTER_LOG.md
5. Document next steps
