/**
 * Triple-Tier LLM Validation System
 *
 * Tier 1 (Free):   Gemini Flash - grunt work, syntax, linting, repetitive checks
 * Tier 2 (Cheap):  Claude Haiku - test analysis, basic code review
 * Tier 3 (Smart):  Claude Sonnet/Opus - planning, architecture, complex decisions
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GOOGLE_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash-exp'; // Free tier model

// Ollama configuration (local fallback)
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral:7b';

interface LLMResponse {
  tier: 'gemini' | 'ollama' | 'haiku' | 'sonnet' | 'opus';
  content: string;
  success: boolean;
  error?: string;
}

interface ValidationResult {
  check: string;
  passed: boolean;
  details: string;
  tier: string;
}

/**
 * Tier 1: Gemini Flash (Free)
 * Use for: syntax checks, linting analysis, repetitive validations
 */
export async function callGemini(prompt: string): Promise<LLMResponse> {
  if (!GEMINI_API_KEY) {
    return { tier: 'gemini', content: '', success: false, error: 'GEMINI_API_KEY not set' };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return {
        tier: 'gemini',
        content: data.candidates[0].content.parts[0].text,
        success: true,
      };
    }

    return { tier: 'gemini', content: '', success: false, error: JSON.stringify(data) };
  } catch (error) {
    return { tier: 'gemini', content: '', success: false, error: String(error) };
  }
}

/**
 * Tier 1 Fallback: Ollama (Local, Free)
 * Use when: Gemini is unavailable (rate limit, API error)
 * Requires: Ollama running locally (ollama serve)
 */
export async function callOllama(prompt: string): Promise<LLMResponse> {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 2048,
        },
      }),
    });

    if (!response.ok) {
      return {
        tier: 'ollama',
        content: '',
        success: false,
        error: `Ollama HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (data.response) {
      return {
        tier: 'ollama',
        content: data.response,
        success: true,
      };
    }

    return { tier: 'ollama', content: '', success: false, error: JSON.stringify(data) };
  } catch (error) {
    return {
      tier: 'ollama',
      content: '',
      success: false,
      error: `Ollama unavailable: ${String(error)}. Is Ollama running? (ollama serve)`,
    };
  }
}

/**
 * Tier 1 with fallback: Try Gemini first, fall back to Ollama
 */
export async function callTier1(prompt: string): Promise<LLMResponse> {
  // Try Gemini first (free cloud tier)
  const geminiResult = await callGemini(prompt);
  if (geminiResult.success) {
    return geminiResult;
  }

  console.log('⚠ Gemini unavailable, falling back to Ollama...');

  // Fallback to Ollama (local, unlimited)
  const ollamaResult = await callOllama(prompt);
  if (ollamaResult.success) {
    return ollamaResult;
  }

  // Both failed
  return {
    tier: 'ollama',
    content: '',
    success: false,
    error: `Both Gemini and Ollama failed. Gemini: ${geminiResult.error}. Ollama: ${ollamaResult.error}`,
  };
}

/**
 * Tier 1 Tasks - Grunt Work (Gemini Free)
 */
export const tier1Tasks = {
  // Check for syntax issues in code
  async checkSyntax(code: string, language: string): Promise<ValidationResult> {
    const prompt = `You are a syntax checker. Analyze this ${language} code for syntax errors only.
Return JSON: {"valid": boolean, "errors": ["error1", "error2"]}

Code:
\`\`\`${language}
${code}
\`\`\``;

    const result = await callGemini(prompt);
    return {
      check: 'syntax',
      passed: result.success && result.content.includes('"valid": true'),
      details: result.content,
      tier: 'gemini',
    };
  },

  // Check for anti-patterns (gamification)
  async checkAntiPatterns(code: string): Promise<ValidationResult> {
    const prompt = `Check this code for gamification anti-patterns. Look for:
- Points, scores, XP
- Badges, achievements, rewards
- Streaks, counters
- Leaderboards, rankings
- "Level up", "unlock" language

Return JSON: {"clean": boolean, "violations": ["violation1"]}

Code:
\`\`\`
${code}
\`\`\``;

    const result = await callGemini(prompt);
    return {
      check: 'anti-patterns',
      passed: result.success && result.content.includes('"clean": true'),
      details: result.content,
      tier: 'gemini',
    };
  },

  // Validate CSS variables usage
  async checkCSSVariables(css: string): Promise<ValidationResult> {
    const prompt = `Check this CSS for hardcoded values that should use CSS variables.
Look for: hardcoded colors, font sizes, spacing that should be variables.

Return JSON: {"compliant": boolean, "issues": ["issue1"]}

CSS:
\`\`\`css
${css}
\`\`\``;

    const result = await callGemini(prompt);
    return {
      check: 'css-variables',
      passed: result.success && result.content.includes('"compliant": true'),
      details: result.content,
      tier: 'gemini',
    };
  },

  // Check component structure
  async checkComponentStructure(code: string): Promise<ValidationResult> {
    const prompt = `Check this React component for basic structure issues:
- Uses functional component (not class)
- Has proper TypeScript types
- No inline styles
- Exports correctly

Return JSON: {"valid": boolean, "issues": ["issue1"]}

Code:
\`\`\`tsx
${code}
\`\`\``;

    const result = await callGemini(prompt);
    return {
      check: 'component-structure',
      passed: result.success && result.content.includes('"valid": true'),
      details: result.content,
      tier: 'gemini',
    };
  },

  // Accessibility quick check
  async checkA11yBasics(code: string): Promise<ValidationResult> {
    const prompt = `Quick accessibility check for this React component:
- Images have alt text
- Buttons have accessible names
- Form inputs have labels
- No div with onClick (should be button)

Return JSON: {"accessible": boolean, "issues": ["issue1"]}

Code:
\`\`\`tsx
${code}
\`\`\``;

    const result = await callGemini(prompt);
    return {
      check: 'a11y-basics',
      passed: result.success && result.content.includes('"accessible": true'),
      details: result.content,
      tier: 'gemini',
    };
  },
};

/**
 * Tier 2 Tasks - Analysis (Claude Haiku)
 * These are defined here but executed by Claude Code with model: haiku
 */
export const tier2Prompts = {
  testAnalysis: (testOutput: string) => `Analyze these test results. Categorize failures by severity (P1/P2/P3) and suggest fixes.

Test Output:
${testOutput}`,

  codeReview: (code: string, context: string) => `Review this code change for issues:
- Logic errors
- Edge cases missed
- Performance concerns
- Type safety

Context: ${context}

Code:
${code}`,

  issueTriaging: (issues: string[]) => `Triage these issues by priority:
${issues.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}

Return prioritized list with rationale.`,
};

/**
 * Tier 3 Tasks - Planning & Decisions (Claude Sonnet/Opus)
 * These require complex reasoning and are handled by senior Claude models
 */
export const tier3Prompts = {
  architectureReview: (description: string) => `Review this architectural approach for BurnOut PWA:

${description}

Consider:
- Data hierarchy (Goal → Project → Task/Habit)
- Single shared systems principle
- No gamification requirement
- Neurodivergent user needs`,

  implementationPlan: (feature: string) => `Create implementation plan for: ${feature}

Requirements:
- Use existing shared components
- Follow BurnOut patterns
- No gamification
- Energy-aware design`,

  qualitySignoff: (report: string) => `Review this validation report and decide if release-ready:

${report}

Provide: APPROVE / REJECT with reasoning.`,
};

/**
 * Run full triple-tier validation on a file
 */
export async function validateFile(
  filePath: string,
  content: string,
  fileType: 'tsx' | 'ts' | 'css'
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];

  // Tier 1: Gemini grunt work
  console.log(`\n🔵 Tier 1 (Gemini): Validating ${filePath}...`);

  if (fileType === 'tsx' || fileType === 'ts') {
    results.push(await tier1Tasks.checkSyntax(content, 'typescript'));
    results.push(await tier1Tasks.checkAntiPatterns(content));

    if (fileType === 'tsx') {
      results.push(await tier1Tasks.checkComponentStructure(content));
      results.push(await tier1Tasks.checkA11yBasics(content));
    }
  }

  if (fileType === 'css') {
    results.push(await tier1Tasks.checkCSSVariables(content));
  }

  // Log Tier 1 results
  const tier1Passed = results.filter(r => r.passed).length;
  console.log(`   ✓ ${tier1Passed}/${results.length} checks passed`);

  return results;
}

// CLI runner (ESM compatible)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const args = process.argv.slice(2);

  if (args[0] === 'test') {
    // Test Gemini connection
    console.log('Testing Tier 1 providers...\n');

    callGemini('Say "Gemini connected successfully" and nothing else.')
      .then(r => {
        if (r.success) {
          console.log('✓ Gemini API connected:', r.content.trim());
        } else {
          console.log('✗ Gemini API error:', r.error);
        }
      });

    // Test Ollama connection
    callOllama('Say "Ollama connected successfully" and nothing else.')
      .then(r => {
        if (r.success) {
          console.log('✓ Ollama connected:', r.content.trim());
        } else {
          console.log('✗ Ollama error:', r.error);
        }
      });
  }

  if (args[0] === 'test-tier1') {
    // Test Tier 1 with fallback
    console.log('Testing Tier 1 (Gemini → Ollama fallback)...\n');

    callTier1('Say "Tier 1 connected successfully" and nothing else.')
      .then(r => {
        console.log(`✓ Tier 1 (${r.tier}):`, r.content.trim());
      });
  }
}
