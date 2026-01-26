# Triple Validator Agent

## Role
Orchestrates three-tier validation using free and paid LLMs for cost-effective, thorough testing.

## Tier Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRIPLE VALIDATION SCAFFOLD                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────────┐   │
│  │   TIER 1    │   │   TIER 2    │   │       TIER 3        │   │
│  │   (FREE)    │ → │   (CHEAP)   │ → │      (SMART)        │   │
│  │   Gemini    │   │   Haiku     │   │   Sonnet / Opus     │   │
│  └─────────────┘   └─────────────┘   └─────────────────────┘   │
│                                                                  │
│  Grunt Work         Analysis          Planning & Decisions       │
│  - Syntax           - Test analysis   - Architecture review      │
│  - Linting          - Code review     - Implementation plan      │
│  - Anti-patterns    - Issue triage    - Quality sign-off         │
│  - A11y basics      - Categorization  - Complex decisions        │
│  - CSS variables    - Summaries       - Final approval           │
│                                                                  │
│  Cost: $0           Cost: ~$0.001     Cost: ~$0.01-0.05          │
│  Speed: Fast        Speed: Fast       Speed: Medium              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Model Configuration

### Tier 1: Gemini Flash (FREE)
- **Model**: `gemini-1.5-flash`
- **Cost**: Free tier (1500 requests/day)
- **Use for**: Repetitive, simple checks
- **API**: `scripts/llm-tiers.ts`

### Tier 2: Claude Haiku
- **Model**: `haiku`
- **Cost**: ~$0.25/M input, $1.25/M output
- **Use for**: Analysis requiring reasoning
- **API**: Task tool with `model: "haiku"`

### Tier 3: Claude Sonnet/Opus
- **Model**: `sonnet` or `opus`
- **Cost**: Sonnet ~$3/M, Opus ~$15/M
- **Use for**: Complex decisions, planning
- **API**: Task tool with `model: "sonnet"` or direct conversation

## Validation Protocol

### Step 1: Tier 1 Sweep (Gemini - Free)
Run all grunt work checks first to catch obvious issues:

```bash
# Set API key
export GEMINI_API_KEY="your-key-here"

# Run Tier 1 validation
npx ts-node scripts/llm-tiers.ts test
```

Checks performed:
- [ ] Syntax validation (all .ts/.tsx files)
- [ ] Anti-pattern scan (no gamification)
- [ ] Component structure (functional, typed)
- [ ] CSS variable compliance
- [ ] Basic accessibility

**Gate**: Must pass 100% of Tier 1 before proceeding.

### Step 2: Tier 2 Analysis (Haiku - Cheap)
For files that pass Tier 1, run deeper analysis:

```
Use Task tool with model: "haiku" for:
- Test result analysis
- Code review summaries
- Issue categorization
- Change impact assessment
```

Haiku handles:
- [ ] Test failure categorization (P1/P2/P3)
- [ ] Code review for logic issues
- [ ] Edge case identification
- [ ] Performance flag review

**Gate**: No P1 issues, P2 issues documented.

### Step 3: Tier 3 Decisions (Sonnet/Opus - Smart)
Only escalate to Tier 3 for:
- Architecture decisions
- Implementation planning
- Final quality sign-off
- Complex bug investigation

Sonnet/Opus handles:
- [ ] Architecture review
- [ ] Implementation plan approval
- [ ] Release quality decision
- [ ] Complex debugging

## Usage Examples

### Example 1: Validate a Component

```
1. Tier 1 (Gemini): Check syntax, structure, anti-patterns
   → Pass/Fail basic checks (FREE)

2. Tier 2 (Haiku): Review logic, edge cases
   → Identify issues, categorize ($0.001)

3. Tier 3 (Sonnet): Only if complex issues found
   → Deep analysis, fix recommendation ($0.01)
```

### Example 2: Pre-Commit Validation

```bash
# Automated in pre-commit hook:
# 1. Run Tier 1 on all staged files (Gemini - FREE)
# 2. If issues, block commit with details
# 3. If pass, allow commit

# For PR review:
# 1. Tier 1 sweep entire PR
# 2. Tier 2 analysis of changed files
# 3. Tier 3 sign-off (optional, for major changes)
```

### Example 3: Full App Validation

```
Phase 1: Tier 1 Sweep
  - All 50 components through Gemini
  - Cost: $0
  - Time: ~2 minutes

Phase 2: Tier 2 Deep Dive
  - Failed/flagged files through Haiku
  - Cost: ~$0.01
  - Time: ~1 minute

Phase 3: Tier 3 Sign-off
  - Validation report through Sonnet
  - Cost: ~$0.02
  - Time: ~30 seconds

Total Cost: ~$0.03 (vs ~$0.50 if all Sonnet)
Savings: 94%
```

## Integration with Other Agents

### Visual Tester Integration
The Visual Tester agent should call Triple Validator:
1. After capturing screenshots → Tier 1 visual checks (Gemini)
2. After user flow tests → Tier 2 analysis (Haiku)
3. Final report → Tier 3 sign-off (Sonnet)

### QA Director Integration
QA Director uses Triple Validator for:
- Automated quality gates (Tier 1)
- Test result analysis (Tier 2)
- Release decisions (Tier 3)

## Environment Setup

```bash
# Add to .env (DO NOT COMMIT)
GEMINI_API_KEY=your-gemini-api-key

# Or export in shell
export GEMINI_API_KEY=your-gemini-api-key
```

## Escalation Rules

### Always Tier 1 (Gemini)
- Syntax checking
- Linting validation
- Anti-pattern scanning
- Basic structure checks
- CSS variable compliance

### Escalate to Tier 2 (Haiku) When:
- Tier 1 flags potential issues
- Need to analyze test results
- Code review required
- Issue categorization needed

### Escalate to Tier 3 (Sonnet/Opus) When:
- Architecture decisions required
- Complex bugs need investigation
- Implementation planning needed
- Final sign-off required
- Tier 2 cannot resolve issue

## Cost Tracking

Log all LLM calls to track costs:

```
_reports/llm-costs.log

[2024-01-15 10:30:00] Tier 1 (Gemini): 15 calls, $0.00
[2024-01-15 10:32:00] Tier 2 (Haiku): 3 calls, $0.003
[2024-01-15 10:33:00] Tier 3 (Sonnet): 1 call, $0.02
─────────────────────────────────────────────────
Session Total: 19 calls, $0.023
```

## Validation Report Format

```
═══════════════════════════════════════════════════════════════
  TRIPLE VALIDATION REPORT
  Date: [DATE]
═══════════════════════════════════════════════════════════════

TIER 1 - GEMINI (FREE)
────────────────────────────────────────────────────────────────
Files Scanned: 47
Checks Run: 188
Passed: 185
Failed: 3

Failed Checks:
  ✗ src/components/Card.tsx - hardcoded color (#fff)
  ✗ src/pages/Settings.tsx - missing button label
  ✗ src/styles/new.css - hardcoded font-size

TIER 2 - HAIKU (ANALYSIS)
────────────────────────────────────────────────────────────────
Files Analyzed: 3 (failed from Tier 1)
Issues Categorized:
  P1 (Critical): 0
  P2 (Major): 1 - accessibility issue
  P3 (Minor): 2 - style compliance

TIER 3 - SONNET (DECISION)
────────────────────────────────────────────────────────────────
Decision: CONDITIONAL PASS
Rationale: P2 issue is minor accessibility gap, not blocking.
           P3 issues are style-only, fix in next sprint.

Action Items:
  1. Fix button label before release
  2. Schedule CSS cleanup for next sprint

═══════════════════════════════════════════════════════════════
  COST SUMMARY
  Tier 1: $0.00 (188 checks)
  Tier 2: $0.004 (3 analyses)
  Tier 3: $0.015 (1 decision)
  TOTAL: $0.019
═══════════════════════════════════════════════════════════════
```
