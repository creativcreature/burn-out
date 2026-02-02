# Deploy Rules - BE FRUGAL

**We burned 100 deploys in one night. NEVER AGAIN.**

---

## Rules

### 1. BATCH CHANGES
- Accumulate multiple fixes before deploying
- Minimum 3-5 features/fixes per deploy
- No single-line deploys

### 2. MAX DEPLOYS PER DAY
- **Target: 5 deploys/day MAX**
- Save deploys for after thorough testing
- Test locally first (`npm run dev`)

### 3. TEST LOCALLY FIRST
```bash
npm run dev  # Test at localhost:3000
npm run build  # Verify it builds
# ONLY THEN deploy
```

### 4. DEPLOY SCHEDULE
- Morning: 1 deploy (overnight work)
- Afternoon: 1 deploy (if needed)
- Evening: 1 deploy (day's work)
- Emergency only: 2 more

### 5. VERSION BATCHING
Instead of:
- v0.5.1, v0.5.2, v0.5.3, v0.5.4, v0.5.5 (5 deploys)

Do:
- v0.5.5 (1 deploy with all 5 features)

---

## James's Budget
- $20 is the limit
- Be frugal and efficient
- Every deploy costs money/quota

---

*100 deploys in one night = UNACCEPTABLE*
*5 deploys per day = RESPONSIBLE*
