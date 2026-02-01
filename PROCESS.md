# BurnOut Development Process

**STOP MAKING SHIT UP. FOLLOW THIS.**

---

## Methodology: Trunk-Based Development + Feature Flags

Following industry standard practices, not invented ones.

---

## Before ANY Work

### 1. CHECK CONSTRAINTS FIRST
- [ ] What are the API limits? (Vercel: 100 deploys/day free)
- [ ] What are the costs? (API calls, hosting, services)
- [ ] What's the budget? ($20 — that's IT)
- [ ] What are the deadlines?

### 2. PLAN BEFORE CODING
- [ ] Write spec/requirements FIRST
- [ ] Get approval before implementing
- [ ] Estimate time and complexity
- [ ] Identify risks and blockers

### 3. CHECK EXISTING SOLUTIONS
- [ ] Is there a library for this?
- [ ] Has this been solved before?
- [ ] What's the standard approach?
- [ ] Don't reinvent wheels

---

## During Work

### 4. WORK LOCALLY
```bash
npm run dev  # ALL development here
npm run build  # Verify before deploy
```
- NO deploying to test
- NO "let me just push this quick fix"
- Test EVERYTHING locally first

### 5. BATCH CHANGES
- Accumulate 3-5 features/fixes
- ONE deploy per batch
- Max 5 deploys per day

### 6. DOCUMENT AS YOU GO
- Update relevant docs immediately
- Don't rely on memory
- If you learned something, WRITE IT DOWN

---

## Before Deploy

### 7. PRE-DEPLOY CHECKLIST
- [ ] Built successfully locally?
- [ ] Tested all affected features?
- [ ] No TypeScript errors?
- [ ] Bundle size reasonable?
- [ ] Have we deployed <5 times today?

### 8. VET EVERYTHING
- Does this change make sense?
- What could go wrong?
- Is this the simplest solution?
- Will James approve this approach?

---

## Key Files to Check

| Question | Check This File |
|----------|-----------------|
| API keys? | `KEYS_AND_CONFIG.md` |
| Deploy rules? | `DEPLOY_RULES.md` |
| What's built? | `VERSION.md` |
| Known issues? | `FUNCTIONALITY_AUDIT.md` |

---

## Cost Awareness

Every action has a cost:
- Deploy = quota (100/day free)
- API call = money
- James's time = most valuable

**Ask: Is this worth the cost?**

---

## When Stuck

1. Search filesystem first (use cheap model)
2. Check project docs
3. Check existing code for patterns
4. Google/search for solutions
5. ONLY THEN ask James

---

*Follow this process. No exceptions. No excuses.*
