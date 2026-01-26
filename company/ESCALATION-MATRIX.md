# Escalation Matrix

Guide for escalating issues to the appropriate authority.

## Escalation Paths

### Technical Issues

```
Build Failure → Engineering Director → CTO
Type Error    → Engineering Director → CTO
Test Failure  → QA Director → Engineering Director
Performance   → Engineering Director → CTO
Architecture  → CTO (direct)
```

### Security Issues

```
Vulnerability (Low)      → Security Director
Vulnerability (Medium)   → Security Director → CTO
Vulnerability (High)     → Security Director → CTO → CEO
Data Breach Risk         → CEO (immediate)
```

### Process Issues

```
Blocked Task    → Project Manager → COO
Resource Need   → Project Manager → COO → CEO
Timeline Risk   → COO → CEO
Scope Creep     → COO → CEO
```

### Quality Issues

```
Bug (P3/P4)    → Engineering Director
Bug (P2)       → QA Director → Engineering Director
Bug (P1)       → QA Director → CTO → CEO
Bug (Critical) → CEO (immediate)
```

### Creative Issues

```
Asset Request        → Accounts Manager → Art Director
Design Feedback      → Art Director → Creative Director
Brand Inconsistency  → Art Director → Creative Director
Visual Bug           → Art Director → Creative Director → CTO
Copy Issue           → Copywriter → Creative Director
Design System Change → Creative Director → CTO
Major Brand Decision → Creative Director → CEO
```

### Production Issues

```
Video Edit Request   → Videographer → Creative Director
Social Media Issue   → Social Media Manager → Creative Director
Content Calendar     → Social Media Manager → Strategist
Campaign Strategy    → Strategist → Creative Director → CEO
Asset Delivery Delay → Logistics → Accounts → Creative Director
Resource Conflict    → Logistics → COO
```

## Issue Severity Definitions

### Critical (P0)
- App completely broken
- Data loss occurring
- Security breach active
- **Response**: Immediate, all hands

### High (P1)
- Major feature broken
- Significant user impact
- Security vulnerability discovered
- **Response**: Within 1 hour

### Medium (P2)
- Feature partially broken
- Workaround exists
- Performance degraded
- **Response**: Within 4 hours

### Low (P3)
- Minor issue
- Cosmetic problem
- Edge case bug
- **Response**: Next sprint

### Trivial (P4)
- Nice to have fix
- Minor enhancement
- **Response**: When convenient

## Design-Specific Severity Definitions

### Critical (P0 Design)
- Brand severely misrepresented
- Offensive/inappropriate content published
- Legal liability in creative assets
- **Response**: Immediate takedown, all hands

### High (P1 Design)
- Major brand inconsistency in production
- Wrong logo/colors in shipped feature
- UX causing user confusion at scale
- **Response**: Within 2 hours

### Medium (P2 Design)
- Minor brand inconsistency
- Spacing/alignment issues
- Animation glitches
- **Response**: Within 1 day

### Low (P3 Design)
- Polish opportunities
- Minor visual refinements
- Edge case visual bugs
- **Response**: Next sprint

### Trivial (P4 Design)
- Nice to have visual improvements
- Future enhancement ideas
- **Response**: Backlog

## Escalation Template

```markdown
## Escalation Report

**Severity**: [P0/P1/P2/P3/P4]
**Type**: [Technical/Security/Process/Quality]
**Reporter**: [Name/Agent]
**Time**: [Timestamp]

### Issue
[Clear description of the problem]

### Impact
[Who/what is affected and how]

### Attempted Resolution
[What has been tried]

### Requested Action
[What you need from the escalation target]

### Deadline
[When resolution is needed]
```

## Contact Points

| Role | Handles | Model |
|------|---------|-------|
| Engineering Director | Build, code, tech issues | Sonnet |
| QA Director | Bugs, testing, quality | Sonnet |
| Security Director | Security, vulnerabilities | Sonnet |
| CTO | Architecture, strategy, major tech | Opus |
| COO | Process, resources, timeline | Sonnet |
| CEO | Final decisions, approvals | Human |
| Creative Director | Brand, visual design, creative strategy | Opus |
| Art Director | Visual execution, design review | Sonnet |
| Copywriter | Copy, messaging, voice | Sonnet |
| Videographer | Video, motion graphics | Sonnet |
| Social Media Manager | Social content, community | Sonnet |
| Strategist | Campaigns, research, positioning | Sonnet |
| Accounts Manager | Project intake, client comms | Haiku |
| Logistics Coordinator | Resources, assets, scheduling | Haiku |

## Response Time Expectations

| Severity | Initial Response | Resolution |
|----------|-----------------|------------|
| P0 | Immediate | ASAP |
| P1 | 15 minutes | 4 hours |
| P2 | 1 hour | 24 hours |
| P3 | 4 hours | Next sprint |
| P4 | Next day | When convenient |

## BurnOut-Specific Escalations

### Gamification Detected
If any gamification elements are discovered:
1. Escalate to CEO immediately
2. Document location and nature
3. Remove before any release
4. Add test to prevent regression

### Theme System Failure
If theme doesn't work on a page:
1. Escalate to Engineering Director
2. Block release
3. Fix before any other work

### Data Loss Risk
If IndexedDB issue detected:
1. Escalate to CTO immediately
2. Prevent any data operations
3. Implement recovery if possible

### Brand Violation
If brand guidelines violated in shipped feature:
1. Escalate to Creative Director immediately
2. Document violation with screenshots
3. Determine if hotfix needed
4. Update design documentation to prevent recurrence

### Design/Engineering Conflict
If Creative Director and CTO disagree on implementation:
1. Both parties document their position
2. Identify if primarily visual or technical issue
3. If unresolved, escalate to CEO
4. Document decision for future reference

### Visual Regression
If visual changes break existing design:
1. Escalate to Art Director
2. Compare against design specs
3. If specs unclear, escalate to Creative Director
4. Block release if brand-critical
