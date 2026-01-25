# RACI Matrix

Defines who is Responsible, Accountable, Consulted, and Informed for each activity.

## Legend

- **R** = Responsible (Does the work)
- **A** = Accountable (Final authority, approves)
- **C** = Consulted (Provides input before)
- **I** = Informed (Notified after)

## Development Activities

| Activity | CEO | CTO | COO | Eng Dir | QA Dir | Sec Dir | PM |
|----------|-----|-----|-----|---------|--------|---------|-----|
| Feature Requirements | A | C | C | I | I | I | R |
| Architecture Design | I | A | I | R | C | C | I |
| Code Implementation | I | C | I | A | I | I | R |
| Code Review | I | C | I | A | C | C | I |
| Unit Testing | I | I | I | A | C | I | R |
| Integration Testing | I | C | I | C | A | I | R |
| Security Review | I | C | I | I | I | A | I |
| Performance Testing | I | C | I | C | A | I | R |
| Documentation | I | C | I | C | I | I | A |

## Release Activities

| Activity | CEO | CTO | COO | Eng Dir | QA Dir | Sec Dir | PM |
|----------|-----|-----|-----|---------|--------|---------|-----|
| Release Planning | A | C | R | C | C | C | I |
| Version Increment | I | I | I | R | I | I | A |
| Changelog Update | I | I | I | R | C | I | A |
| Release Approval | A | C | R | I | C | C | I |
| Deployment | I | C | A | R | I | I | I |
| Post-Deploy Verify | I | I | I | C | A | C | R |
| Rollback Decision | A | R | C | C | C | C | I |

## Quality Activities

| Activity | CEO | CTO | COO | Eng Dir | QA Dir | Sec Dir | PM |
|----------|-----|-----|-----|---------|--------|---------|-----|
| Quality Standards | I | A | C | R | C | C | I |
| Test Strategy | I | C | I | C | A | C | I |
| Bug Prioritization | C | C | I | C | A | C | I |
| Bug Fix Approval | I | C | I | A | C | I | I |
| Accessibility Audit | I | C | I | C | A | I | R |

## Security Activities

| Activity | CEO | CTO | COO | Eng Dir | QA Dir | Sec Dir | PM |
|----------|-----|-----|-----|---------|--------|---------|-----|
| Security Standards | I | A | I | C | I | R | I |
| Vulnerability Scan | I | C | I | I | I | A | I |
| Incident Response | A | C | C | C | I | R | I |
| Data Protection | I | A | I | C | I | R | I |
| Dependency Audit | I | C | I | C | I | A | I |

## Process Activities

| Activity | CEO | CTO | COO | Eng Dir | QA Dir | Sec Dir | PM |
|----------|-----|-----|-----|---------|--------|---------|-----|
| Sprint Planning | C | C | A | C | C | I | R |
| Daily Standups | I | I | C | R | R | I | A |
| Retrospectives | C | C | A | R | R | R | R |
| Process Changes | A | C | R | C | C | C | I |
| Tool Selection | I | A | C | R | C | C | I |

## BurnOut-Specific Decisions

| Decision | CEO | CTO | Eng Dir | QA Dir |
|----------|-----|-----|---------|--------|
| Add gamification | A (REJECT) | - | - | - |
| Change theme system | C | A | R | C |
| Modify data schema | C | A | R | I |
| Add new page | A | C | R | C |
| Remove feature | A | C | C | C |
| PWA configuration | I | A | R | C |
| AI integration | A | R | C | I |

## Decision-Making Framework

### Fast Decisions (< 1 hour)
Made by: Responsible party
Examples: Code style, test implementation, minor fixes

### Standard Decisions (< 1 day)
Made by: Accountable party with Consulted input
Examples: Architecture choices, feature implementation approach

### Strategic Decisions (> 1 day)
Made by: CEO with full RACI consultation
Examples: New features, major changes, release timing

## Conflict Resolution

When RACI parties disagree:
1. R presents options to A
2. A makes decision
3. If A cannot decide, escalate to next level
4. CEO has final authority

For BurnOut, the hierarchy is:
```
CEO (Human) > CTO (Opus) > COO (Sonnet) > Directors > Workers
```
