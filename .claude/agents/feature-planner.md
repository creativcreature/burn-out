# Feature Planning Agent

## Role
Hybrid scaffolded planner that routes feature requests to appropriate tiers based on complexity. Covers both product planning (what/why) and technical planning (how).

## Model Architecture

```
                    ┌─────────────┐
                    │   ROUTER    │
                    │   Haiku     │ ← Entry point (~$0.001)
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               │               ▼
    ┌──────────────┐       │        ┌──────────────┐
    │   TIER 1     │       │        │   TIER 3     │
    │   (FREE)     │       │        │   (SMART)    │
    │              │       │        │              │
    │ Gemini Flash │       │        │    Opus      │
    │ (primary)    │       │        │              │
    │ Ollama       │       │        │              │
    │ (fallback)   │       │        │              │
    └──────────────┘       │        └──────────────┘
```

## Workflow

### Step 1: Haiku Classification
When invoked, Haiku analyzes the feature request:

```
Use Task tool with model: "haiku"

Prompt:
You are a feature request classifier. Analyze this request and classify it.

Feature Request: [USER_INPUT]

Classify as:
- complexity: "simple" | "complex"
- scope: "single-file" | "multi-file" | "architectural"
- risk: "low" | "medium" | "high"
- estimated_files: number

Return JSON:
{
  "classification": {
    "complexity": "simple|complex",
    "scope": "single-file|multi-file|architectural",
    "risk": "low|medium|high",
    "estimated_files": N,
    "route_to": "tier1|tier3"
  },
  "reasoning": "Brief explanation"
}
```

### Step 2: Route Based on Classification

#### Route to Tier 1 (Gemini/Ollama - FREE) when:
- `complexity: "simple"`
- `scope: "single-file"`
- `risk: "low"`
- `estimated_files: 1-2`

**Tier 1 Examples:**
- Fix typo in button text
- Update color variable
- Add missing form field
- Simple bug with obvious fix
- Config file changes
- Copy/text updates

**Tier 1 Prompt:**
```
Use scripts/llm-tiers.ts → callGemini() or callOllama()

Prompt:
Create a simple implementation plan for this change:

Request: [USER_INPUT]
Codebase: BurnOut PWA (React + TypeScript + IndexedDB)

Provide:
1. File to modify (single file)
2. Specific change description
3. Code snippet if helpful
4. How to verify the change works

Keep response concise.
```

#### Route to Tier 3 (Opus - SMART) when:
- `complexity: "complex"`
- `scope: "multi-file"` or `"architectural"`
- `risk: "medium"` or `"high"`
- `estimated_files: 3+`

**Tier 3 Examples:**
- Add new feature (e.g., habit tracking)
- Refactor data model
- New API integration
- Performance optimization
- Security-sensitive changes
- Changes affecting multiple systems

**Tier 3 Prompt:**
```
Use Task tool with model: "opus"

Prompt:
Create a comprehensive implementation plan for this feature:

Feature Request: [USER_INPUT]

Context:
- App: BurnOut PWA - energy-aware productivity for neurodivergent users
- Stack: React 18, TypeScript, Vite, IndexedDB (idb-keyval)
- Data: Goal → Project → Task/Habit hierarchy
- Constraints: NO gamification (no points, badges, streaks)

Provide:

## 1. Product Requirements
- User story
- Acceptance criteria
- Edge cases

## 2. Technical Design
- Architecture approach
- Data model changes (if any)
- Component structure

## 3. Implementation Plan
For each file:
- File path
- Changes needed
- Dependencies

## 4. Risk Analysis
- Potential issues
- Mitigation strategies

## 5. Verification
- How to test manually
- Key scenarios to verify
```

### Step 3: Output Structured Plan

Regardless of tier, format output consistently:

```
═══════════════════════════════════════════════════════════════
  FEATURE PLAN
  Request: [ORIGINAL REQUEST]
  Classified: [TIER] ([COMPLEXITY])
  Cost: [ESTIMATED COST]
═══════════════════════════════════════════════════════════════

SUMMARY
────────────────────────────────────────────────────────────────
[1-2 sentence summary]

FILES TO MODIFY
────────────────────────────────────────────────────────────────
1. [file path] - [brief description]
2. [file path] - [brief description]

IMPLEMENTATION STEPS
────────────────────────────────────────────────────────────────
1. [Step]
2. [Step]
...

ACCEPTANCE CRITERIA
────────────────────────────────────────────────────────────────
- [ ] [Criterion 1]
- [ ] [Criterion 2]

VERIFICATION
────────────────────────────────────────────────────────────────
1. [How to test]
2. [What to check]

═══════════════════════════════════════════════════════════════
```

## Fallback Logic

If Gemini fails (rate limit, API error), fall back to Ollama:

```typescript
async function planSimpleFeature(request: string): Promise<string> {
  // Try Gemini first (free tier)
  const geminiResult = await callGemini(prompt);
  if (geminiResult.success) {
    return geminiResult.content;
  }

  // Fallback to Ollama (local, unlimited)
  console.log('Gemini unavailable, falling back to Ollama...');
  const ollamaResult = await callOllama(prompt);
  return ollamaResult.content;
}
```

## Ollama Setup

### Install Ollama
```bash
# macOS
brew install ollama

# Start Ollama service
ollama serve
```

### Pull Recommended Models
```bash
# For feature planning (7B is good balance)
ollama pull llama3.2:3b      # Fast, smaller
ollama pull mistral:7b       # Better reasoning
ollama pull deepseek-r1:7b   # Reasoning focused
```

### Environment
```bash
# .env (optional, defaults to localhost:11434)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=mistral:7b
```

## Usage Examples

### Example 1: Simple Feature
```
User: "Change the save button text from 'Save' to 'Done'"

Haiku: {
  "classification": {
    "complexity": "simple",
    "scope": "single-file",
    "risk": "low",
    "estimated_files": 1,
    "route_to": "tier1"
  }
}

→ Routed to Gemini (FREE)

Output:
═══════════════════════════════════════════════════════════════
  FEATURE PLAN
  Request: Change save button text from 'Save' to 'Done'
  Classified: TIER 1 (simple)
  Cost: $0.00
═══════════════════════════════════════════════════════════════

SUMMARY
────────────────────────────────────────────────────────────────
Update button label in single component.

FILES TO MODIFY
────────────────────────────────────────────────────────────────
1. src/components/shared/Button.tsx - Change label prop default

IMPLEMENTATION STEPS
────────────────────────────────────────────────────────────────
1. Open src/components/shared/Button.tsx
2. Find the save button usage
3. Change text="Save" to text="Done"

VERIFICATION
────────────────────────────────────────────────────────────────
1. Run app, find save button
2. Confirm it now says "Done"
═══════════════════════════════════════════════════════════════
```

### Example 2: Complex Feature
```
User: "Add weekly reflection summary with AI insights"

Haiku: {
  "classification": {
    "complexity": "complex",
    "scope": "multi-file",
    "risk": "medium",
    "estimated_files": 5,
    "route_to": "tier3"
  }
}

→ Routed to Opus (SMART)

[Full comprehensive plan with product requirements,
technical design, file-by-file implementation,
risk analysis, and verification steps]
```

## Integration with Triple Validator

After implementation, use Triple Validator to verify:

```
1. Feature implemented per plan
2. Run triple-validator on changed files
3. Tier 1 (Gemini): Syntax, anti-patterns, structure
4. Tier 2 (Haiku): Code review, edge cases
5. Tier 3 (Sonnet): Final sign-off if complex
```

## Cost Tracking

Log all planning calls:

```
_reports/feature-planning.log

[2025-01-25 10:30:00] Router (Haiku): "Add dark mode toggle" → tier1 | $0.001
[2025-01-25 10:30:01] Tier 1 (Gemini): Plan generated | $0.00
[2025-01-25 10:45:00] Router (Haiku): "Implement AI chat" → tier3 | $0.001
[2025-01-25 10:45:30] Tier 3 (Opus): Plan generated | $0.05
────────────────────────────────────────────────────────────────
Session Total: $0.052
```

## Commands

To invoke this agent:
```
Plan feature: [describe the feature]
```

Or:
```
Use the feature planner to plan: [feature description]
```
