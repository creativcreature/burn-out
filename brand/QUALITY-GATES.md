# Quality Gates

All features must pass through quality gates before release.

## Gate Overview

```
Gate 1          Gate 2          Gate 3          Gate 4          Gate 5          Gate 6
Requirements → Architecture → Dev Complete → QA Approved → Security → Release
   (CEO)         (CTO)          (Eng Dir)      (QA Dir)     (Sec Dir)   (COO+CEO)
```

## Gate 1: Requirements

**Owner**: CEO (Human)
**Purpose**: Ensure scope is well-defined

### Entry Criteria
- [ ] Feature request documented
- [ ] User story written
- [ ] Acceptance criteria defined
- [ ] Priority assigned

### Exit Criteria
- [ ] CEO approves scope
- [ ] No ambiguity in requirements
- [ ] Success metrics defined
- [ ] Not a gamification feature (no points/badges/streaks)

### Artifacts
- Requirements document
- User story
- Mockups (if UI change)

---

## Gate 2: Architecture

**Owner**: CTO (Opus)
**Purpose**: Ensure technical approach is sound

### Entry Criteria
- [ ] Gate 1 passed
- [ ] Technical approach proposed
- [ ] Alternatives considered

### Exit Criteria
- [ ] CTO approves design
- [ ] Security Director reviews (if security-relevant)
- [ ] Performance impact assessed
- [ ] No anti-patterns introduced

### Artifacts
- Architecture decision record
- Component diagram (if needed)
- Data model (if data changes)

---

## Gate 3: Development Complete

**Owner**: Engineering Director (Sonnet)
**Purpose**: Ensure implementation is complete and meets standards

### Entry Criteria
- [ ] Gate 2 passed
- [ ] Code written
- [ ] Unit tests written

### Exit Criteria
- [ ] TypeScript: 0 errors
- [ ] ESLint: 0 errors
- [ ] Tests: All passing
- [ ] Coverage: > 80%
- [ ] Code review approved
- [ ] No duplicate code introduced

### Artifacts
- Pull request
- Test results
- Code coverage report

---

## Gate 4: QA Approved

**Owner**: QA Director (Sonnet)
**Purpose**: Ensure feature works correctly end-to-end

### Entry Criteria
- [ ] Gate 3 passed
- [ ] Feature deployed to staging

### Exit Criteria
- [ ] Functional tests pass
- [ ] Integration tests pass
- [ ] Visual tests pass
- [ ] Accessibility audit passes
- [ ] No P1/P2 bugs
- [ ] Performance acceptable

### Artifacts
- Test report
- Bug list (if any)
- Accessibility audit

---

## Gate 5: Security

**Owner**: Security Director (Sonnet)
**Purpose**: Ensure no security vulnerabilities

### Entry Criteria
- [ ] Gate 4 passed
- [ ] Security review requested

### Exit Criteria
- [ ] No XSS vulnerabilities
- [ ] No injection vulnerabilities
- [ ] No exposed secrets
- [ ] Dependencies audited (npm audit clean)
- [ ] Data handling reviewed

### Artifacts
- Security review report
- npm audit results
- Remediation notes (if any)

---

## Gate 6: Release

**Owner**: COO + CEO
**Purpose**: Final approval for production release

### Entry Criteria
- [ ] Gates 1-5 passed
- [ ] Release notes prepared
- [ ] CHANGELOG updated
- [ ] VERSION incremented

### Exit Criteria
- [ ] COO approves timing
- [ ] CEO approves release
- [ ] Deployment successful
- [ ] Smoke tests pass in production

### Artifacts
- Release notes
- Deployment log
- Post-deploy verification

---

## Gate Bypass

Gates may only be bypassed with:
1. CEO explicit approval
2. Documented justification
3. Plan to address skipped criteria post-release
4. Increased monitoring post-release

**Never bypass Gate 5 (Security)** without CEO + CTO joint approval.
