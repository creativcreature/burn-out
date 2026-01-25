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
    ┌───────────┤          ┌─────┴─────┐
    │           │          │           │
┌───┴────┐ ┌────┴────┐ ┌───┴───┐ ┌─────┴────┐
│ Project│ │   QA    │ │  Eng  │ │ Security │
│ Manager│ │Director │ │Director│ │ Director │
│(Haiku) │ │(Sonnet) │ │(Sonnet)│ │ (Sonnet) │
└────────┘ └─────────┘ └───┬───┘ └──────────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
      ┌─────┴─────┐ ┌──────┴─────┐ ┌──────┴─────┐
      │  Frontend │ │   Backend  │ │    PWA     │
      │    Team   │ │    Team    │ │    Team    │
      │  (Local)  │ │  (Local)   │ │  (Local)   │
      └───────────┘ └────────────┘ └────────────┘
```

## Agent Tiers

| Tier | Model | Roles | Token Cost | Use Case |
|------|-------|-------|------------|----------|
| Executive | Opus | CTO, Security Review | $$$$ | Strategic decisions, complex architecture |
| Manager | Sonnet | COO, Directors, QA | $$$ | Coordination, reviews, planning |
| Worker | Haiku | Engineers, Testers | $ | Implementation, testing, docs |
| Local | Ollama | Bulk tasks | Free | Repetitive tasks, initial drafts |

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
